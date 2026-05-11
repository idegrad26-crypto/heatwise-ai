import { useState, useMemo } from 'react'

const CATEGORIES = {
  '녹지': ['녹지율', '가로수', '옥상녹화', '공원'],
  '건축·포장': ['Albedo', '불투수', '건물밀집'],
  '폭염 저감': ['쿨루프', '그늘막'],
  '에너지': ['인공열', '에너지'],
  '교통': ['교통'],
  '도시구조': ['용적률', '건물밀집'],
}

function getCategory(label) {
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => label.includes(k))) return cat
  }
  return '기타'
}

function SliderItem({ s, value, onChange }) {
  const pct = s.safe_high === s.safe_low
    ? 0
    : Math.round(((value - s.safe_low) / (s.safe_high - s.safe_low)) * 100)
  const changed = value !== s.current_value

  return (
    <div className="slider-item">
      <div className="slider-header">
        <span className="slider-label">{s.label}</span>
        <span className={`slider-val-badge ${changed ? 'changed' : ''}`}>
          {Number(value).toLocaleString(undefined, { maximumFractionDigits: 3 })}
        </span>
      </div>
      <div className="slider-track-wrap">
        <input
          type="range"
          className="slider-range"
          min={s.safe_low}
          max={s.safe_high}
          step={s.step || 0.01}
          value={value}
          onChange={e => onChange(s.col, Number(e.target.value))}
        />
      </div>
      <div className="slider-meta-row">
        <span className="slider-meta">{s.safe_low}</span>
        <span className="slider-baseline">현재값 {s.current_value?.toLocaleString()}</span>
        <span className="slider-meta">{s.safe_high}</span>
      </div>
    </div>
  )
}

export default function Step2({ sliders, summary, onSimulate, simLoading }) {
  const [values, setValues] = useState(() => {
    const init = {}
    if (sliders) sliders.forEach(s => { init[s.col] = s.current_value })
    return init
  })
  const [area, setArea] = useState(1500)
  const [activeCat, setActiveCat] = useState('녹지')

  const categorized = useMemo(() => {
    if (!sliders) return {}
    const map = {}
    sliders.forEach(s => {
      const cat = getCategory(s.label)
      if (!map[cat]) map[cat] = []
      map[cat].push(s)
    })
    return map
  }, [sliders])

  const displayCats = ['녹지', '건축·포장', '폭염 저감', '에너지', '교통', '도시구조']
    .filter(c => categorized[c])
    .concat(Object.keys(categorized).filter(c =>
      !['녹지','건축·포장','폭염 저감','에너지','교통','도시구조'].includes(c)
    ))

  const currentSliders = categorized[activeCat] || []
  const { background } = summary || {}

  function handleSimulate() {
    const adjustments = {}
    if (sliders) {
      sliders.forEach(s => {
        if (values[s.col] !== s.current_value) {
          adjustments[s.col] = values[s.col]
        }
      })
    }
    const albedoRatio = area > 0 ? Math.min(area / 10000, 1) : 1
    onSimulate(adjustments, albedoRatio)
  }

  return (
    <>
      <button className="opt-btn">
        💰 예산별 최적 조합 추천 보기
      </button>

      <div className="area-box">
        <div className="area-label">사업 시행 면적</div>
        <div className="area-sub">이 동에서 정책을 시행할 면적 (사업비 계산에 사용)</div>
        <div className="area-input-row">
          <input
            className="area-input"
            type="number"
            value={area}
            onChange={e => setArea(Number(e.target.value))}
            placeholder="예: 1500"
          />
          <span className="area-unit">m²</span>
        </div>
      </div>

      <div className="cat-tabs">
        {displayCats.map(cat => (
          <button
            key={cat}
            className={`cat-tab ${activeCat === cat ? 'active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {currentSliders.length === 0 ? (
        <div style={{ fontSize: 12, color: '#9ca3af', padding: '8px 0' }}>
          이 카테고리에 슬라이더가 없습니다
        </div>
      ) : currentSliders.map(s => (
        <SliderItem
          key={s.col}
          s={s}
          value={values[s.col] ?? s.current_value}
          onChange={(col, val) => setValues(prev => ({ ...prev, [col]: val }))}
        />
      ))}

      {background && (
        <div className="bg-box">
          <div className="bg-title">배경 조건 <span className="bg-sub">(조정 불가)</span></div>
          <div className="bg-row">
            {background.avg_temp != null && (
              <div className="bg-chip">기온 <span>{background.avg_temp?.toFixed(1)}°C</span></div>
            )}
            {background.season && (
              <div className="bg-chip">
                계절 <span>{background.season === 'JJA' ? '여름(6-8월)' : background.season}</span>
              </div>
            )}
            {background.year && (
              <div className="bg-chip">연도 <span>{background.year}</span></div>
            )}
          </div>
        </div>
      )}

      <button
        className="btn-next"
        style={{ width: '100%', marginTop: 16 }}
        disabled={simLoading}
        onClick={handleSimulate}
      >
        {simLoading ? <span className="spin">⟳</span> : '시뮬레이션 실행 →'}
      </button>
    </>
  )
}
