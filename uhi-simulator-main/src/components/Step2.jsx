import { useState, useMemo } from 'react'

const CATEGORIES = {
  '녹지': ['녹지율', '가로수 개수', '옥상녹화 면적', '공원 면적'],
  '건축·포장': ['Albedo', '불투수율', '건물밀집도'],
  '폭염 저감': ['쿨루프 면적', '그늘막 면적'],
  '에너지': ['인공열 배출량', '에너지 소비'],
  '교통': ['교통량'],
  '도시구조': ['용적률', '건물밀집도'],
}

function getCategory(label) {
  for (const [cat, labels] of Object.entries(CATEGORIES)) {
    if (labels.some(l => label.includes(l) || l.includes(label))) return cat
  }
  return '기타'
}

export default function Step2({ sliders, summary, onSimulate, simLoading }) {
  const [values, setValues] = useState(() => {
    const init = {}
    if (sliders) sliders.forEach(s => { init[s.col] = s.current_value })
    return init
  })
  const [area, setArea] = useState(1500)
  const [activeCat, setActiveCat] = useState('녹지')
  const [showOpt, setShowOpt] = useState(false)

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

  const allCats = Object.keys(categorized)
  const visibleCats = ['녹지', '건축·포장', '폭염 저감', '에너지', '교통', '도시구조'].filter(c => categorized[c])
  const otherCats = allCats.filter(c => !visibleCats.includes(c))
  const displayCats = [...visibleCats, ...otherCats]

  const currentSliders = categorized[activeCat] || []

  const { background, shap_top3 } = summary || {}

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
      <button className="opt-btn" onClick={() => setShowOpt(!showOpt)}>
        최적 조합 보기
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

      {currentSliders.length === 0 && (
        <div style={{ fontSize: 12, color: '#9ca3af', padding: '8px 0' }}>
          이 카테고리에 슬라이더가 없습니다
        </div>
      )}

      {currentSliders.map(s => (
        <div className="slider-item" key={s.col}>
          <div className="slider-header">
            <span className="slider-label">{s.label}</span>
            <span className="slider-cur">현재 {s.current_value?.toLocaleString()}</span>
          </div>
          <input
            type="range"
            className="slider-range"
            min={s.safe_low}
            max={s.safe_high}
            step={s.step || 0.01}
            value={values[s.col] ?? s.current_value}
            onChange={e => setValues(prev => ({ ...prev, [s.col]: Number(e.target.value) }))}
          />
          <div className="slider-meta">
            조정범위: {s.safe_low} – {s.safe_high} · 단위: {s.step}
          </div>
        </div>
      ))}

      {background && (
        <div className="bg-box">
          <div className="bg-title">
            배경 조건
            <span className="bg-sub">(조정 불가, 시뮬 환경 요인)</span>
          </div>
          <div className="bg-row">
            {background.avg_temp != null && (
              <div className="bg-chip">기온 <span>{background.avg_temp?.toFixed(1)}°C</span></div>
            )}
            {summary?.background?.avg_temp && (
              <div className="bg-chip">계절 <span>{background.season === 'JJA' ? '여름 (6-8월)' : background.season}</span></div>
            )}
          </div>

          {shap_top3?.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                현재 LST에 미치는 배경 요인 영향력
              </div>
              {shap_top3.map((item, i) => (
                <div className="bg-shap-row" key={i}>
                  <span style={{ color: '#9ca3af', width: 16 }}>{i + 1}.</span>
                  <span className="bg-shap-name">{item.feature}</span>
                  <span className={`bg-shap-val ${item.shap_value > 0 ? 'up' : 'down'}`}>
                    {item.shap_value > 0 ? '+' : ''}{item.shap_value?.toFixed(2)}°C
                  </span>
                </div>
              ))}
            </>
          )}
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
