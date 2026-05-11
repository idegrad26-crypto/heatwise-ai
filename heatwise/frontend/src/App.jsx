import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import { api } from './api'
import SidePanel from './components/SidePanel'

// LST colour scale: cool(cyan) → green → yellow → orange → red
function lstColor(lst, min = 33, max = 47) {
  const t = Math.max(0, Math.min(1, (lst - min) / (max - min)))
  // 5-stop gradient
  const stops = [
    [34, 211, 238],  // cyan  t=0
    [134, 239, 172], // green t=0.25
    [253, 224, 71],  // yellow t=0.5
    [251, 146, 60],  // orange t=0.75
    [239, 68,  68],  // red   t=1
  ]
  const seg = t * (stops.length - 1)
  const i = Math.min(Math.floor(seg), stops.length - 2)
  const f = seg - i
  const [r, g, b] = stops[i].map((c, j) => Math.round(c + f * (stops[i + 1][j] - c)))
  return `rgb(${r},${g},${b})`
}

const YEARS = [2020, 2021, 2022, 2023, 2024]
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export default function App() {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const geoRef = useRef(null)

  const [year, setYear] = useState(2024)
  const [month, setMonth] = useState(8)
  const [dongList, setDongList] = useState([])
  const [lstMap, setLstMap] = useState({})          // adm_cd → lst
  const [selected, setSelected] = useState(null)    // {adm_cd, adm_nm, gu_nm}
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // Init map once
  useEffect(() => {
    if (mapRef.current) return
    const map = L.map('map', {
      center: [37.5665, 126.978],
      zoom: 11,
      zoomControl: false,
    })
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map
    setMapReady(true)
  }, [])

  // Load dong list
  useEffect(() => {
    api.getDongList().then(setDongList).catch(() => {})
  }, [])

  // Load GeoJSON once
  useEffect(() => {
    if (!mapReady) return
    fetch('/data/seoul_dong.geojson')
      .then(r => r.json())
      .then(data => { geoRef.current = data })
      .catch(() => {})
  }, [mapReady])

  // Load LST and re-render layer when year/month changes
  useEffect(() => {
    if (!mapReady) return
    api.getAllLst(year, month)
      .then(rows => {
        const m = {}
        rows.forEach(r => { m[r.adm_cd] = r.lst })
        setLstMap(m)
      })
      .catch(() => {})
  }, [year, month, mapReady])

  // Re-render GeoJSON layer when lstMap or selection changes
  const renderLayer = useCallback(() => {
    const map = mapRef.current
    const geo = geoRef.current
    if (!map || !geo || Object.keys(lstMap).length === 0) return

    if (layerRef.current) { map.removeLayer(layerRef.current) }

    const layer = L.geoJSON(geo, {
      style: feature => {
        const cd = feature.properties.adm_cd
        const lst = lstMap[cd]
        const isSelected = selected && selected.adm_cd === cd
        if (lst == null) {
          return { fillColor: '#d1d5db', fillOpacity: 0.5, color: '#fff', weight: 0.5 }
        }
        return {
          fillColor: lstColor(lst),
          fillOpacity: isSelected ? 0.95 : 0.75,
          color: isSelected ? '#1d4ed8' : '#fff',
          weight: isSelected ? 2.5 : 0.5,
        }
      },
      onEachFeature: (feature, lyr) => {
        const { adm_cd, adm_nm, gu_nm } = feature.properties
        lyr.on('click', () => {
          setSelected({ adm_cd, adm_nm, gu_nm })
        })
        lyr.on('mouseover', e => {
          const lst = lstMap[adm_cd]
          e.target.setStyle({ weight: 2, color: '#1d4ed8', fillOpacity: 0.9 })
          const tooltip = `<b>${gu_nm} ${adm_nm}</b>${lst != null ? `<br/>LST: ${lst.toFixed(1)}°C` : ''}`
          lyr.bindTooltip(tooltip, { sticky: true, opacity: 0.95 }).openTooltip()
        })
        lyr.on('mouseout', e => {
          layer.resetStyle(e.target)
          lyr.unbindTooltip()
        })
      },
    }).addTo(map)

    layerRef.current = layer
  }, [lstMap, selected])

  useEffect(() => { renderLayer() }, [renderLayer])

  // Search filter
  const filtered = search.trim().length > 0
    ? dongList.filter(d =>
        d.adm_nm.includes(search) ||
        d.gu_nm.includes(search)
      ).slice(0, 20)
    : []

  function handleSearchSelect(dong) {
    setSelected({ adm_cd: dong.adm_cd, adm_nm: dong.adm_nm, gu_nm: dong.gu_nm })
    setSearch('')
    setShowDropdown(false)
    // Zoom to dong on map
    if (geoRef.current) {
      const feature = geoRef.current.features.find(f => f.properties.adm_cd === dong.adm_cd)
      if (feature && mapRef.current) {
        const layer = L.geoJSON(feature)
        mapRef.current.fitBounds(layer.getBounds(), { padding: [60, 60] })
      }
    }
  }

  return (
    <div className="app-wrap">
      <div id="map" />

      {/* Top bar */}
      <div className="top-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="자치구 또는 동 검색"
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
          {showDropdown && filtered.length > 0 && (
            <div className="search-dropdown">
              {filtered.map(d => (
                <div
                  key={d.adm_cd}
                  className="search-dropdown-item"
                  onMouseDown={() => handleSearchSelect(d)}
                >
                  <span>{d.adm_nm}</span>
                  <span className="gu">{d.gu_nm}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <select
          className="year-select"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
        >
          {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
        </select>

        <select
          className="month-select"
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
        >
          {MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}
        </select>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-title">
          <span>지표면 온도 (LST)</span>
          <span>{year}.{String(month).padStart(2, '0')}</span>
        </div>
        <div className="legend-bar" />
        <div className="legend-labels">
          <span>33.5°C</span>
          <span>36.5°C</span>
          <span>39.5°C</span>
          <span>42.5°C</span>
          <span>45.5°C</span>
        </div>
        <div className="legend-note">데이터 없음 = 회색</div>
      </div>

      {/* Side panel */}
      <SidePanel
        selected={selected}
        year={year}
        month={month}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
