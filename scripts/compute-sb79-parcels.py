#!/usr/bin/env python3
"""
Compute per-parcel SB 79 inclusion for Palo Alto.

Joins:
  - MTC's preliminary SB 79 TOD zones (Tier 1 - 200ft / 1/4 mi / 1/2 mi)
    fetched from public ArcGIS FeatureServer.
  - City of Palo Alto's ParcelReport layer (gpkg export).

Outputs (paths relative to repo root):
  - assets/data/sb79-parcels.json
  - assets/data/sb79-parcels.csv
  - assets/img/sb79-univ-parcels.svg
  - assets/img/sb79-calave-parcels.svg
  - assets/img/sb79-sanantonio-parcels.svg
  - scripts/sb79-stats.json

Run:
  pip install -r scripts/requirements.txt
  python scripts/compute-sb79-parcels.py --gpkg ~/Downloads/paloalto.gpkg
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sqlite3
import struct
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

import requests
from pyproj import Transformer
from shapely.geometry import shape, Point, Polygon, MultiPolygon, mapping
from shapely.geometry.base import BaseGeometry
from shapely.ops import transform as shp_transform, unary_union
from shapely.strtree import STRtree
from shapely import wkb as shp_wkb


# -----------------------------------------------------------------------------
# Constants
# -----------------------------------------------------------------------------

# CA State Plane Zone III, NAD83, US survey feet. The City of Palo Alto's GIS
# server publishes ParcelReport in this CRS, but the gpkg export tags it as
# "Undefined SRS" so we hardcode it here. Coordinate ranges in the gpkg
# (X ~6,070,000-6,100,000; Y ~1,930,000-2,000,000) are consistent with this.
PARCEL_CRS = "EPSG:2227"
WGS84 = "EPSG:4326"

# Bounding box covering all three Palo Alto Caltrain stations (lat/lon).
# University Ave ~37.4434,-122.1646; Cal Ave ~37.4290,-122.1418; San Antonio ~37.4072,-122.1078.
PA_BBOX_4326 = (-122.190, 37.395, -122.085, 37.460)  # (minLon, minLat, maxLon, maxLat)

MTC_ZONES_URL = (
    "https://services3.arcgis.com/i2dkYWmb4wHvYPda/arcgis/rest/services/"
    "mtc_sb79_tod_zones/FeatureServer/1/query"
)
MTC_STOPS_URL = (
    "https://services3.arcgis.com/i2dkYWmb4wHvYPda/arcgis/rest/services/"
    "mtc_sb79_tod_stops/FeatureServer/1/query"
)

# Map tightest band -> SB 79 floor in feet.
BAND_FLOORS_FT = {"200ft": 95, "1/4mi": 75, "1/2mi": 65}
# Tightest first — used for classification.
BAND_PRIORITY = ("200ft", "1/4mi", "1/2mi")

# Map zone_label substrings to our short band keys.
ZONE_LABEL_PATTERNS = [
    ("200", "200ft"),
    ("1/4", "1/4mi"),
    ("quarter", "1/4mi"),
    ("0.25", "1/4mi"),
    ("1/2", "1/2mi"),
    ("half", "1/2mi"),
    ("0.5", "1/2mi"),
]

STATION_KEYS = {
    "univ": {"name": "University Ave Caltrain", "match": ["palo alto", "university"]},
    "calave": {"name": "California Ave Caltrain", "match": ["california ave", "california avenue"]},
    "sanantonio": {"name": "San Antonio Caltrain", "match": ["san antonio"]},
}

HEIGHT_REGEX = re.compile(r"(\d+)\s*'")


# -----------------------------------------------------------------------------
# GeoPackage geometry blob decoding
# -----------------------------------------------------------------------------

def decode_gpkg_geom(blob: bytes) -> BaseGeometry | None:
    """Strip the GPKG header, then parse WKB — including CompoundCurve / MultiSurface
    wrappers around plain LineStrings, which the Palo Alto cadastral export uses
    even when the segments are not real circular arcs. Falls back to shapely's
    native parser for plain Polygon / MultiPolygon types.
    """
    if not blob or len(blob) < 8 or blob[:2] != b"GP":
        return None
    flags = blob[3]
    envelope_indicator = (flags >> 1) & 0x07
    envelope_size = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}.get(envelope_indicator)
    if envelope_size is None:
        return None
    wkb = blob[8 + envelope_size:]
    try:
        return _wkb_to_geom(wkb)
    except (struct.error, IndexError, ValueError):
        return None


def _wkb_to_geom(buf: bytes, off: int = 0) -> BaseGeometry | None:
    """Return a shapely geometry, unwrapping CompoundCurve / CurvePolygon / MultiSurface.

    If the geometry contains a true CircularString (type 8) we currently raise —
    none of the Palo Alto parcels use those, but the assertion makes that
    assumption explicit if it ever changes.
    """
    rings_or_polys = _wkb_polys(buf, off)
    if not rings_or_polys:
        return None
    if len(rings_or_polys) == 1:
        return Polygon(rings_or_polys[0][0], rings_or_polys[0][1:] or None)
    return MultiPolygon([Polygon(r[0], r[1:] or None) for r in rings_or_polys])


# WKB type codes
_WKB_LINESTRING = 2
_WKB_POLYGON = 3
_WKB_MULTIPOLYGON = 6
_WKB_CIRCULARSTRING = 8
_WKB_COMPOUNDCURVE = 9
_WKB_CURVEPOLYGON = 10
_WKB_MULTISURFACE = 12


def _read_header(buf: bytes, off: int) -> tuple[str, int, int]:
    bo = buf[off]
    fmt = "<" if bo == 1 else ">"
    t = struct.unpack_from(fmt + "I", buf, off + 1)[0]
    return fmt, t, off + 5


def _read_linestring_pts(buf: bytes, off: int, fmt: str) -> tuple[list[tuple[float, float]], int]:
    n = struct.unpack_from(fmt + "I", buf, off)[0]
    p = off + 4
    pts = list(struct.unpack_from(fmt + f"{2*n}d", buf, p))
    coords = [(pts[i], pts[i + 1]) for i in range(0, len(pts), 2)]
    return coords, p + n * 16


def _read_curve_pts(buf: bytes, off: int) -> tuple[list[tuple[float, float]], int]:
    """Read a curve geometry (LineString | CircularString | CompoundCurve) and return
    its sequence of (x, y) points. For CircularString we currently raise.
    """
    fmt, t, p = _read_header(buf, off)
    if t == _WKB_LINESTRING:
        return _read_linestring_pts(buf, p, fmt)
    if t == _WKB_CIRCULARSTRING:
        raise ValueError("CircularString not supported (no real arcs in PA parcels — abort)")
    if t == _WKB_COMPOUNDCURVE:
        n = struct.unpack_from(fmt + "I", buf, p)[0]
        p += 4
        merged: list[tuple[float, float]] = []
        for _ in range(n):
            sub_pts, p = _read_curve_pts(buf, p)
            if merged and sub_pts and merged[-1] == sub_pts[0]:
                merged.extend(sub_pts[1:])
            else:
                merged.extend(sub_pts)
        return merged, p
    raise ValueError(f"unexpected curve type {t}")


def _read_polygon_rings(buf: bytes, off: int) -> tuple[list[list[tuple[float, float]]], int]:
    fmt, t, p = _read_header(buf, off)
    if t == _WKB_POLYGON:
        n = struct.unpack_from(fmt + "I", buf, p)[0]
        p += 4
        rings = []
        for _ in range(n):
            ring, p = _read_linestring_pts(buf, p, fmt)
            rings.append(ring)
        return rings, p
    if t == _WKB_CURVEPOLYGON:
        n = struct.unpack_from(fmt + "I", buf, p)[0]
        p += 4
        rings = []
        for _ in range(n):
            ring, p = _read_curve_pts(buf, p)
            rings.append(ring)
        return rings, p
    raise ValueError(f"unexpected surface type {t}")


def _wkb_polys(buf: bytes, off: int) -> list[list[list[tuple[float, float]]]]:
    """Return a list of polygons, each a list of rings, each a list of (x, y).
    Handles MultiSurface, MultiPolygon, CurvePolygon, Polygon at the top level.
    """
    fmt, t, p = _read_header(buf, off)
    if t in (_WKB_POLYGON, _WKB_CURVEPOLYGON):
        rings, _ = _read_polygon_rings(buf, off)
        return [rings]
    if t in (_WKB_MULTIPOLYGON, _WKB_MULTISURFACE):
        n = struct.unpack_from(fmt + "I", buf, p)[0]
        p += 4
        polys = []
        for _ in range(n):
            rings, p = _read_polygon_rings(buf, p)
            polys.append(rings)
        return polys
    # Fallback: try shapely's native parser.
    try:
        g = shp_wkb.loads(buf[off:])
    except (NotImplementedError, ValueError):
        return []
    if isinstance(g, Polygon):
        return [[list(g.exterior.coords)] + [list(h.coords) for h in g.interiors]]
    if isinstance(g, MultiPolygon):
        out = []
        for poly in g.geoms:
            out.append([list(poly.exterior.coords)] + [list(h.coords) for h in poly.interiors])
        return out
    return []


# -----------------------------------------------------------------------------
# MTC fetch
# -----------------------------------------------------------------------------

def fetch_mtc_geojson(url: str, *, where: str = "1=1", out_fields: str = "*") -> dict:
    minLon, minLat, maxLon, maxLat = PA_BBOX_4326
    params = {
        "where": where,
        "outFields": out_fields,
        "geometry": f"{minLon},{minLat},{maxLon},{maxLat}",
        "geometryType": "esriGeometryEnvelope",
        "inSR": "4326",
        "outSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
        "returnGeometry": "true",
        "f": "geojson",
    }
    resp = requests.get(url, params=params, timeout=60)
    resp.raise_for_status()
    return resp.json()


def classify_zone_label(label: str) -> str | None:
    if not label:
        return None
    low = label.lower()
    for needle, band in ZONE_LABEL_PATTERNS:
        if needle in low:
            return band
    return None


# -----------------------------------------------------------------------------
# Parcels
# -----------------------------------------------------------------------------

@dataclass
class Parcel:
    apn: str
    address: str
    geom_2227: BaseGeometry  # shapely geometry in EPSG:2227 (ftUS)
    current_zone: str | None
    raw_max_height: str | None
    lot_sf: float | None
    year_built: int | None
    historic_status: str | None


def load_parcels(gpkg_path: Path) -> list[Parcel]:
    conn = sqlite3.connect(str(gpkg_path))
    c = conn.cursor()
    rows = c.execute(
        'SELECT APN, ADDRESSDESCRIPTION, geom, ZONEGIS, MAXBUILDINGHEIGHT, '
        '"SHAPE.AREA", YEARBUILT, HISTORICSTATUS FROM "Parcel Report"'
    ).fetchall()
    out: list[Parcel] = []
    bad = 0
    for apn, addr, blob, zone, maxh, area, year, hist in rows:
        g = decode_gpkg_geom(blob)
        if g is None or g.is_empty:
            bad += 1
            continue
        out.append(
            Parcel(
                apn=apn or "",
                address=(addr or "").strip(),
                geom_2227=g,
                current_zone=(zone or "").strip() or None,
                raw_max_height=(maxh or "").strip() or None,
                lot_sf=float(area) if area is not None else None,
                year_built=int(year) if year else None,
                historic_status=(hist or "").strip() or None,
            )
        )
    if bad:
        print(f"  WARNING: {bad} parcels had unreadable geometry (skipped)", file=sys.stderr)
    return out


def parse_height_ft(raw: str | None) -> int | None:
    if not raw:
        return None
    m = HEIGHT_REGEX.search(raw)
    if not m:
        return None
    return int(m.group(1))


# -----------------------------------------------------------------------------
# Station + band classification
# -----------------------------------------------------------------------------

def station_key_for(stop_name: str) -> str | None:
    low = (stop_name or "").lower()
    for key, info in STATION_KEYS.items():
        if any(term in low for term in info["match"]):
            return key
    return None


def reproject_geom(g: BaseGeometry, src: str, dst: str) -> BaseGeometry:
    tf = Transformer.from_crs(src, dst, always_xy=True).transform
    return shp_transform(tf, g)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--gpkg", required=True, type=Path, help="Path to paloalto.gpkg")
    ap.add_argument(
        "--out-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Repo root (default: parent of scripts/)",
    )
    args = ap.parse_args()

    if not args.gpkg.exists():
        ap.error(f"gpkg not found: {args.gpkg}")
    repo_root = args.out_dir
    data_dir = repo_root / "assets" / "data"
    img_dir = repo_root / "assets" / "img"
    data_dir.mkdir(parents=True, exist_ok=True)
    img_dir.mkdir(parents=True, exist_ok=True)

    # 1. Fetch MTC zones + stops, restrict to PA stations.
    # Note: zones layer has only zone_label (no tod_tier) — the tier is encoded
    # in the label string itself (e.g. "Tier 1 - 200ft").
    print("[1/6] Fetching MTC TOD zones for Palo Alto bbox …")
    zones_geojson = fetch_mtc_geojson(MTC_ZONES_URL, out_fields="zone_label")
    print(f"      {len(zones_geojson.get('features', []))} zone features in bbox")

    print("[2/6] Fetching MTC TOD stops for Palo Alto bbox …")
    stops_geojson = fetch_mtc_geojson(MTC_STOPS_URL, out_fields="stop_name,tod_tier,agency_name")

    # Build station -> point (in EPSG:2227)
    station_points_2227: dict[str, BaseGeometry] = {}
    for feat in stops_geojson.get("features", []):
        props = feat.get("properties", {}) or {}
        key = station_key_for(props.get("stop_name") or "")
        if not key:
            continue
        g = shape(feat["geometry"])
        # If we already have a point for this station, union (multi-stops) and take centroid later.
        existing = station_points_2227.get(key)
        if existing is None:
            station_points_2227[key] = g
        else:
            station_points_2227[key] = unary_union([existing, g])
    # Centroid each, reproject to EPSG:2227.
    for key, g in list(station_points_2227.items()):
        c4326 = g.centroid
        cg2227 = reproject_geom(c4326, WGS84, PARCEL_CRS)
        station_points_2227[key] = cg2227
    if not station_points_2227:
        sys.exit("No Palo Alto stations matched in MTC stops feed; aborting.")
    missing = [k for k in STATION_KEYS if k not in station_points_2227]
    if missing:
        print(f"      WARNING: missing stations from MTC: {missing}", file=sys.stderr)

    # Reproject zone polygons to EPSG:2227 and bucket by band.
    print("[3/6] Reprojecting MTC zones to EPSG:2227 …")
    zones_by_band: dict[str, list[BaseGeometry]] = {b: [] for b in BAND_PRIORITY}
    for feat in zones_geojson.get("features", []):
        props = feat.get("properties", {}) or {}
        label = (props.get("zone_label") or "").lower()
        # Only Tier 1 zones (Palo Alto's three are all Tier 1).
        if "tier 1" not in label:
            continue
        band = classify_zone_label(label)
        if not band:
            continue
        g4326 = shape(feat["geometry"])
        g2227 = reproject_geom(g4326, WGS84, PARCEL_CRS)
        if not g2227.is_empty:
            zones_by_band[band].append(g2227)
    # Union per band for clean per-band queries.
    band_union: dict[str, BaseGeometry] = {
        b: unary_union(geoms) if geoms else None for b, geoms in zones_by_band.items()
    }
    print(
        "      bands: "
        + ", ".join(
            f"{b}={'present' if band_union[b] is not None else 'EMPTY'}" for b in BAND_PRIORITY
        )
    )
    if all(v is None for v in band_union.values()):
        sys.exit("No SB 79 zones returned for Palo Alto bbox; check the MTC service.")

    # 2. Load parcels.
    print("[4/6] Loading parcels from gpkg …")
    parcels = load_parcels(args.gpkg)
    print(f"      {len(parcels)} parcels read")

    # 3. STRtree over parcel geoms; for each band's union, find intersecting parcels.
    print("[5/6] Spatial-joining parcels against SB 79 zones …")
    tree = STRtree([p.geom_2227 for p in parcels])

    # parcel index -> tightest band hit
    band_for_parcel: dict[int, str] = {}
    for band in BAND_PRIORITY:  # tightest first
        zone = band_union[band]
        if zone is None:
            continue
        # query returns indices of geoms whose envelope intersects the input.
        idxs = tree.query(zone, predicate="intersects")
        for i in idxs:
            i = int(i)
            if i not in band_for_parcel:
                # Confirm true intersection (non-trivial area), not just envelope.
                if parcels[i].geom_2227.intersects(zone):
                    band_for_parcel[i] = band

    # 4. For each affected parcel, classify by closest station + emit record.
    print("[6/6] Classifying by station + writing outputs …")
    transformer_back = Transformer.from_crs(PARCEL_CRS, WGS84, always_xy=True).transform

    records = []
    stats = {k: {b: 0 for b in BAND_PRIORITY} for k in STATION_KEYS}

    for i, band in band_for_parcel.items():
        p = parcels[i]
        c2227 = p.geom_2227.centroid
        # Closest station
        nearest_key = None
        nearest_dist = float("inf")
        for k, sp in station_points_2227.items():
            d = c2227.distance(sp)
            if d < nearest_dist:
                nearest_dist = d
                nearest_key = k
        if nearest_key is None:
            continue
        # Lat/Lon for the lookup widget
        lon, lat = transformer_back(c2227.x, c2227.y)
        records.append(
            {
                "apn": p.apn,
                "address": p.address,
                "station": nearest_key,
                "band": band,
                "current_zone": p.current_zone,
                "current_max_height_ft": parse_height_ft(p.raw_max_height),
                "current_max_height_raw": p.raw_max_height,
                "sb79_floor_ft": BAND_FLOORS_FT[band],
                "lot_sf": round(p.lot_sf) if p.lot_sf is not None else None,
                "year_built": p.year_built,
                "historic_status": p.historic_status,
                "lat": round(lat, 6),
                "lon": round(lon, 6),
            }
        )
        stats[nearest_key][band] += 1

    # Sort records by APN for deterministic output.
    records.sort(key=lambda r: r["apn"])

    # JSON
    json_path = data_dir / "sb79-parcels.json"
    json_path.write_text(json.dumps(records, separators=(",", ":")))
    print(f"      wrote {json_path} ({json_path.stat().st_size // 1024} KB, {len(records)} records)")

    # CSV
    csv_path = data_dir / "sb79-parcels.csv"
    with csv_path.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(records[0].keys()) if records else [])
        if records:
            w.writeheader()
            w.writerows(records)
    print(f"      wrote {csv_path} ({csv_path.stat().st_size // 1024} KB)")

    # Stats JSON (committed alongside the script for sanity-checking)
    stats_path = repo_root / "scripts" / "sb79-stats.json"
    # Compute totals (in any band) per station.
    totals = {}
    for k, by_band in stats.items():
        # parcels in 200ft are also in 1/4mi and 1/2mi geographically — but we
        # classified by tightest band, so totals are disjoint sums.
        totals[k] = {
            "in_200ft": by_band["200ft"],
            "in_1_4mi": by_band["1/4mi"],
            "in_1_2mi": by_band["1/2mi"],
            "any_band_total": sum(by_band.values()),
        }
    stats_path.write_text(json.dumps({"per_station": totals}, indent=2))
    print(f"      wrote {stats_path}")
    for k, t in totals.items():
        print(f"        {STATION_KEYS[k]['name']}: 200ft={t['in_200ft']}  ¼mi={t['in_1_4mi']}  ½mi={t['in_1_2mi']}  total={t['any_band_total']}")

    # SVGs (one per station)
    write_svgs(
        repo_root=repo_root,
        parcels=parcels,
        band_for_parcel=band_for_parcel,
        zones_by_band=band_union,
        station_points_2227=station_points_2227,
    )
    print("Done.")


# -----------------------------------------------------------------------------
# SVG output
# -----------------------------------------------------------------------------

SVG_W, SVG_H = 760, 460
SVG_MARGIN = 16

BAND_FILL = {
    "200ft": "#a02b22",
    "1/4mi": "#d96b5a",
    "1/2mi": "#f1d3cd",
}
BAND_STROKE = {
    "200ft": "#5a1612",
    "1/4mi": "#7a2620",
    "1/2mi": "#a04035",
}
ZONE_RING_STROKE = {
    "200ft": "#8a2a20",
    "1/4mi": "#b8392c",
    "1/2mi": "#b8392c",
}


def write_svgs(repo_root, parcels, band_for_parcel, zones_by_band, station_points_2227):
    out_files = {
        "univ": repo_root / "assets" / "img" / "sb79-univ-parcels.svg",
        "calave": repo_root / "assets" / "img" / "sb79-calave-parcels.svg",
        "sanantonio": repo_root / "assets" / "img" / "sb79-sanantonio-parcels.svg",
    }
    # Index parcels by station: for each station, take all parcels whose centroid
    # is within ~3500 ft (just over 1/2 mile) of that station's point. This gives
    # us in-band parcels (highlighted) plus a thin context ring of out-of-band
    # parcels for visual reference.
    CONTEXT_RADIUS_FT = 3500.0

    for key, sp in station_points_2227.items():
        path = out_files.get(key)
        if path is None:
            continue
        ctx_buf = sp.buffer(CONTEXT_RADIUS_FT)
        # Determine the SVG window from the station point + 0.55 mi half-side.
        HALF_FT = 0.55 * 5280  # ~2904 ft, slightly larger than 1/2 mi
        cx, cy = sp.x, sp.y
        minx, maxx = cx - HALF_FT, cx + HALF_FT
        miny, maxy = cy - HALF_FT, cy + HALF_FT
        # Affine: parcel coords (ft, EPSG:2227) -> SVG px.
        # SVG y grows downward; flip y.
        sx = (SVG_W - 2 * SVG_MARGIN) / (maxx - minx)
        sy = (SVG_H - 2 * SVG_MARGIN) / (maxy - miny)
        scale = min(sx, sy)

        def proj(x, y):
            px = SVG_MARGIN + (x - minx) * scale
            py = SVG_H - SVG_MARGIN - (y - miny) * scale
            return px, py

        def geom_to_svg_path(g: BaseGeometry) -> str:
            # Handle Polygon and MultiPolygon (parcels are MultiPolygon).
            from shapely.geometry import Polygon, MultiPolygon
            parts = []
            polys: list[Polygon]
            if isinstance(g, MultiPolygon):
                polys = list(g.geoms)
            elif isinstance(g, Polygon):
                polys = [g]
            else:
                # Some odd geom (e.g. GeometryCollection) — skip.
                return ""
            for poly in polys:
                rings = [poly.exterior, *poly.interiors]
                for ring in rings:
                    coords = list(ring.coords)
                    if not coords:
                        continue
                    px, py = proj(*coords[0])
                    parts.append(f"M{px:.1f} {py:.1f}")
                    for x, y in coords[1:]:
                        px, py = proj(x, y)
                        parts.append(f"L{px:.1f} {py:.1f}")
                    parts.append("Z")
            return " ".join(parts)

        layers = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SVG_W} {SVG_H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="SB 79 affected parcels around the {STATION_KEYS[key]["name"]} station">',
            '<defs>',
            '<style>',
            '.context-parcel{fill:#e3d5b3;fill-opacity:.35;stroke:#c7b890;stroke-width:.4}',
            '.parcel-half{fill:#f1d3cd;fill-opacity:.55;stroke:#a04035;stroke-width:.5}',
            '.parcel-quarter{fill:#d96b5a;fill-opacity:.65;stroke:#7a2620;stroke-width:.6}',
            '.parcel-200{fill:#a02b22;fill-opacity:.85;stroke:#3a0e0a;stroke-width:.7}',
            '.zone-ring{fill:none;stroke:#b8392c;stroke-width:1.4;stroke-dasharray:6 3}',
            '.zone-ring-200{stroke:#8a2a20;stroke-width:1.6;stroke-dasharray:4 2}',
            '.station-dot{fill:#181613;stroke:#fff;stroke-width:2}',
            '.scale-bar{stroke:#181613;stroke-width:2;fill:none}',
            '.label{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace;font-size:10px;fill:#4f4837;letter-spacing:.06em;text-transform:uppercase}',
            '.station-label{font-family:"Fraunces",Georgia,serif;font-size:14px;font-weight:600;fill:#181613;letter-spacing:-.01em}',
            '</style>',
            '</defs>',
            f'<rect width="{SVG_W}" height="{SVG_H}" fill="#f3eada"/>',
        ]

        # Layer 1: context (out-of-band) parcels in the window
        ctx_paths = []
        from shapely.strtree import STRtree as _STRtree
        # We already built a tree above? It's local to main; rebuild here per-station.
        # For perf, only iterate parcels whose centroid lies in the window.
        for i, p in enumerate(parcels):
            ctr = p.geom_2227.centroid
            if not (minx <= ctr.x <= maxx and miny <= ctr.y <= maxy):
                continue
            band = band_for_parcel.get(i)
            if band is not None:
                continue  # in-band parcels drawn in next layers
            d = geom_to_svg_path(p.geom_2227)
            if d:
                ctx_paths.append(d)
        if ctx_paths:
            layers.append(f'<g class="context">' + "".join(f'<path class="context-parcel" d="{d}"/>' for d in ctx_paths) + '</g>')

        # Layers 2-4: in-band parcels, light-to-dark order
        for band, css_class in [("1/2mi", "parcel-half"), ("1/4mi", "parcel-quarter"), ("200ft", "parcel-200")]:
            paths = []
            for i, p in enumerate(parcels):
                if band_for_parcel.get(i) != band:
                    continue
                ctr = p.geom_2227.centroid
                if not (minx <= ctr.x <= maxx and miny <= ctr.y <= maxy):
                    continue
                d = geom_to_svg_path(p.geom_2227)
                if d:
                    paths.append(d)
            if paths:
                layers.append(f'<g class="band-{band}">' + "".join(f'<path class="{css_class}" d="{d}"/>' for d in paths) + '</g>')

        # Zone ring outlines
        if zones_by_band.get("1/2mi") is not None:
            d = geom_to_svg_path(zones_by_band["1/2mi"].intersection(ctx_buf))
            if d:
                layers.append(f'<path class="zone-ring" d="{d}"/>')
        if zones_by_band.get("1/4mi") is not None:
            d = geom_to_svg_path(zones_by_band["1/4mi"].intersection(ctx_buf))
            if d:
                layers.append(f'<path class="zone-ring" d="{d}"/>')
        if zones_by_band.get("200ft") is not None:
            d = geom_to_svg_path(zones_by_band["200ft"].intersection(ctx_buf))
            if d:
                layers.append(f'<path class="zone-ring zone-ring-200" d="{d}"/>')

        # Station dot + label
        spx, spy = proj(sp.x, sp.y)
        layers.append(f'<circle class="station-dot" cx="{spx:.1f}" cy="{spy:.1f}" r="6"/>')
        layers.append(f'<text class="station-label" x="{spx:.1f}" y="{spy - 12:.1f}" text-anchor="middle">{STATION_KEYS[key]["name"]}</text>')

        # Scale bar: 1/4 mile (1320 ft).
        bar_ft = 1320.0
        bar_px = bar_ft * scale
        bar_y = SVG_H - SVG_MARGIN - 6
        bar_x0 = SVG_MARGIN + 6
        layers.append(
            f'<line class="scale-bar" x1="{bar_x0}" y1="{bar_y}" x2="{bar_x0 + bar_px}" y2="{bar_y}"/>'
        )
        layers.append(
            f'<text class="label" x="{bar_x0}" y="{bar_y - 6}">¼ mile</text>'
        )

        # Legend (top right)
        lx = SVG_W - SVG_MARGIN - 130
        ly = SVG_MARGIN + 6
        legend = [
            (lx, ly, "200 ft → 95ft floor", "parcel-200"),
            (lx, ly + 16, "¼ mi → 75ft floor", "parcel-quarter"),
            (lx, ly + 32, "½ mi → 65ft floor", "parcel-half"),
        ]
        for ex, ey, text, cls in legend:
            layers.append(f'<rect x="{ex}" y="{ey - 8}" width="10" height="10" class="{cls}"/>')
            layers.append(f'<text class="label" x="{ex + 16}" y="{ey + 1}">{text}</text>')

        layers.append('</svg>')
        path.write_text("\n".join(layers))
        print(f"      wrote {path} ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
