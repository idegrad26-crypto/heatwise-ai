import { useState, useEffect } from 'react'

const DIRECTION_LABEL = { up: '▲ 높일수록 냉각', down: '▼ 낮출수록 냉각' }

const s = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 28px',
    boxShadow: '0 1px 4px rgba(0,0,0,.08)',
    marginBottom: 20,
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 700, color: '#2d3748' },
  resetBtn: {
    padding: '6px 14px',
    background: '#edf2f7',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#4a5568',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16, marginBottom: 20 },
  item: {
    padding: '14px 16px',
    background: '#f7fafc',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    transition: 'border-color .15s',
  },
  itemActive: { borderColor: '#3182ce', background: '#ebf8ff' },
  itemTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: 700, color: '#2d3748' },
  dirTag: { fontSize: 10, fontWeight: 600, color: '#718096' },
  sliderRow: { display: 'flex', alignItems: 'center', gap: 8 },
  slider: { flex: 1, accentColor: '#3182ce', cursor: 'pointer' },
  valDisplay: {
    width: 72, textAlign: 'right',
    fontSize: 13, fontWeight: 700, color: '#2d3748',
    fontVariantNumeric: 'tabular-nums',
  },
  rangeLine: { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#a0aec0', marginTop: 2 },
  costTag: { marginTop: 6, fontSize: 11, color: '#4a5568' },
  footerRow: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  albedoGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  albedoLabel: { fontSize: 12, fontWeight: 600, color: '#4a5568' },
  albedoInput: {
    width: 120, padding: '6px 10px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 6, fontSize: 13,
    outline: 'none',
  },
  simBtn: {
    padding: '10px 28px',
    background: '#38a169',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    transition: 'background .15s',
  },
  changedNote: { fontSize: 12, color: '#718096' },
}

export default function SliderPanel({ sliders, onSimulate, simLoading }) {
  const [vals, setVals]               = useState({})
  const [albedoRatio, setAlbedoRatio] = useState(0.25)

  useEffect(() => {
    if (!sliders?.length) return
    const init = {}
    sliders.forEach((sl) => { init[sl.col] = sl.current_value })
    setVals(init)
  }, [sliders])

  if (!sliders?.length) return null

  function handleChange(col, raw) {
    setVals((prev) => ({ ...prev, [col]: Number(raw) }))
  }

  function handleReset() {
    const init = {}
    sliders.forEach((sl) => { init[sl.col] = sl.current_value })
    setVals(init)
  }

  function handleSimulate() {
    const features = {}
    sliders.forEach((sl) => {
      if (Math.abs((vals[sl.col] ?? sl.current_value) - sl.current_value) > 1e-9) {
        features[sl.label] = vals[sl.col]
      }
    })
    if (!Object.keys(features).length) {
      alert('슬라이더를 조정한 변수가 없습니다.')
      return
    }
    onSimulate({ features, albedo_area_ratio: albedoRatio })
  }

  const changedCount = sliders.filter(
    (sl) => Math.abs((vals[sl.col] ?? sl.current_value) - sl.current_value) > 1e-9,
  ).length

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div style={s.title}>Step 2 · 정책 변수 조정</div>
        <button style={s.resetBtn} onClick={handleReset}>초기화</button>
      </div>

      <div style={s.grid}>
        {sliders.map((sl) => {
          const cur = vals[sl.col] ?? sl.current_value
          const changed = Math.abs(cur - sl.current_value) > 1e-9
          return (
            <div key={sl.col} style={{ ...s.item, ...(changed ? s.itemActive : {}) }}>
              <div style={s.itemTop}>
                <span style={s.label}>{sl.label}</span>
                <span style={s.dirTag}>{DIRECTION_LABEL[sl.direction]}</span>
              </div>
              <div style={s.sliderRow}>
                <input
                  type='range'
                  min={sl.safe_low}
                  max={sl.safe_high}
                  step={sl.step}
                  value={cur}
                  onChange={(e) => handleChange(sl.col, e.target.value)}
                  style={s.slider}
                />
                <span style={s.valDisplay}>{Number(cur).toFixed(4)}</span>
              </div>
              <div style={s.rangeLine}>
                <span>{sl.safe_low}</span>
                <span>현재: {sl.current_value}</span>
                <span>{sl.safe_high}</span>
              </div>
              {sl.cost_per_step > 0 && (
                <div style={s.costTag}>
                  단위 비용: {sl.cost_per_step.toLocaleString()}원 / {sl.adjustment_unit || '단위'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={s.footerRow}>
        <div style={s.albedoGroup}>
          <label style={s.albedoLabel}>Albedo 적용 면적 비율 (0~1)</label>
          <input
            type='number'
            min={0} max={1} step={0.05}
            value={albedoRatio}
            onChange={(e) => setAlbedoRatio(Number(e.target.value))}
            style={s.albedoInput}
          />
        </div>

        <button
          style={{ ...s.simBtn, opacity: simLoading ? .6 : 1 }}
          onClick={handleSimulate}
          disabled={simLoading}
        >
          {simLoading ? '시뮬레이션 중…' : '시뮬레이션 실행'}
        </button>

        {changedCount > 0 && (
          <span style={s.changedNote}>{changedCount}개 변수 조정됨</span>
        )}
      </div>
    </div>
  )
}
