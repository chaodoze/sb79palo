// Parcel-lookup widget for palo-alto.html.
//
// Lazy-fetches assets/data/sb79-parcels.json on first focus of the input,
// then powers a <datalist> autocomplete of affected addresses. On selection,
// renders a result panel with the parcel's current zone + height vs the SB 79
// floor.

(function parcelLookup() {
  const input = document.getElementById('parcel-input');
  const listEl = document.getElementById('parcel-suggestions');
  const resultEl = document.getElementById('parcel-result');
  if (!input || !listEl || !resultEl) return;

  const STATION_LABELS = {
    univ: 'University Ave Caltrain',
    calave: 'California Ave Caltrain',
    sanantonio: 'San Antonio Caltrain',
  };
  const BAND_LABELS = {
    '200ft': 'within 200 ft (adjacent)',
    '1/4mi': 'within ¼ mile',
    '1/2mi': 'within ½ mile',
  };
  const BAND_FLOOR = { '200ft': 95, '1/4mi': 75, '1/2mi': 65 };

  let parcels = null;
  let parcelsByAddress = null;
  let loadingPromise = null;

  function load() {
    if (parcels) return Promise.resolve(parcels);
    if (loadingPromise) return loadingPromise;
    setStatus('Loading parcels…');
    loadingPromise = fetch('assets/data/sb79-parcels.json?v=2026-05-07', { cache: 'force-cache' })
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed: ' + r.status);
        return r.json();
      })
      .then((data) => {
        parcels = data;
        parcelsByAddress = new Map();
        data.forEach((p) => {
          if (p.address) parcelsByAddress.set(p.address.toLowerCase(), p);
        });
        clearStatus();
        return parcels;
      })
      .catch((err) => {
        setStatus('Could not load parcel data: ' + err.message);
        loadingPromise = null;
        throw err;
      });
    return loadingPromise;
  }

  function setStatus(msg) {
    resultEl.innerHTML = '<p class="parcel-status">' + escape(msg) + '</p>';
  }
  function clearStatus() {
    if (resultEl.querySelector('.parcel-status')) resultEl.innerHTML = '';
  }

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function suggestionsFor(query) {
    if (!parcels) return [];
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out = [];
    for (let i = 0; i < parcels.length && out.length < 50; i += 1) {
      const p = parcels[i];
      if (p.address && p.address.toLowerCase().includes(q)) out.push(p);
    }
    return out;
  }

  function updateDatalist() {
    const matches = suggestionsFor(input.value);
    listEl.innerHTML = matches
      .map((p) => `<option value="${escape(p.address)}">${escape(p.current_zone || '')}</option>`)
      .join('');
  }

  function findParcel(addr) {
    if (!parcels) return null;
    const lc = addr.trim().toLowerCase();
    if (parcelsByAddress.has(lc)) return parcelsByAddress.get(lc);
    // Substring fallback for slightly-off entries.
    for (const p of parcels) {
      if (p.address && p.address.toLowerCase() === lc) return p;
    }
    for (const p of parcels) {
      if (p.address && p.address.toLowerCase().startsWith(lc)) return p;
    }
    return null;
  }

  function render(p) {
    if (!p) {
      const q = escape(input.value.trim());
      resultEl.innerHTML =
        '<p class="parcel-miss">No SB 79–affected parcel matches <strong>' +
        q +
        '</strong>. Try a number + street (e.g. <em>525 University Ave</em>). Only Palo Alto parcels inside an SB 79 band are listed.</p>';
      return;
    }
    const station = STATION_LABELS[p.station] || p.station;
    const bandLabel = BAND_LABELS[p.band] || p.band;
    const floor = BAND_FLOOR[p.band] || p.sb79_floor_ft;
    const cur = p.current_max_height_ft;
    const heightLine =
      cur != null
        ? `Current zoning caps at <strong>${cur}'</strong>; SB 79 floor is <strong>${floor}'</strong> (${jump(cur, floor)}).`
        : `SB 79 floor is <strong>${floor}'</strong>. Current zoning height: <em>${escape(p.current_max_height_raw || '—')}</em>`;
    const meta = [];
    if (p.lot_sf) meta.push(`Lot ${formatNumber(p.lot_sf)} sf`);
    if (p.year_built) meta.push(`Built ${p.year_built}`);
    if (p.historic_status && p.historic_status.toLowerCase() !== 'none')
      meta.push(`Historic status: ${escape(p.historic_status)}`);
    resultEl.innerHTML =
      `<div class="parcel-card">
        <p class="parcel-apn">APN ${escape(p.apn)}</p>
        <h4 class="parcel-address">${escape(p.address)}</h4>
        <p class="parcel-band"><strong>${station}</strong> · ${bandLabel}</p>
        <p class="parcel-zone">Current zone: <code>${escape(p.current_zone || '—')}</code></p>
        <p class="parcel-height">${heightLine}</p>
        ${meta.length ? `<p class="parcel-meta">${meta.join(' · ')}</p>` : ''}
      </div>`;
  }

  function jump(currentFt, floorFt) {
    const delta = floorFt - currentFt;
    if (delta <= 0) return 'no change required';
    const stories = Math.round(delta / 11);
    return `+${delta} ft, roughly ${stories} more ${stories === 1 ? 'story' : 'stories'}`;
  }

  function formatNumber(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  // --- Wire events ---
  let firstFocus = true;
  input.addEventListener('focus', () => {
    if (firstFocus) {
      firstFocus = false;
      load().then(updateDatalist).catch(() => {});
    }
  });
  input.addEventListener('input', () => {
    if (parcels) updateDatalist();
  });
  input.addEventListener('change', () => {
    load().then(() => render(findParcel(input.value))).catch(() => {});
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      load().then(() => render(findParcel(input.value))).catch(() => {});
    }
  });
})();
