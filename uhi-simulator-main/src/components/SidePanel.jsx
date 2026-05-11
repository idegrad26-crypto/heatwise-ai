import { useState, useEffect } from 'react'
import { api } from '../api'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'

export default function SidePanel({ selected, year, month, onClose }) {
  const [step, setStep] = useState(1)
  const [summary, setSummary] = useState(null)
  const [sliders, setSliders] = useState(null)
  const [simResult, setSimResult] = useState(null)
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [simLoading, setSimLoading] = useState(false)
  const [insightLoading, setInsightLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset and load when selection changes
  useEffect(() => {
    if (!selected) return
    setStep(1)
    setSummary(null)
    setSliders(null)
    setSimResult(null)
    setInsight(null)
    setError('')
    setLoading(true)

    Promise.all([
      api.getSummary(selected.adm_cd, year, month),
      api.getSliderConfig(selected.adm_cd, year, month),
    ]).then(([sum, sld]) => {
      setSummary(sum)
      setSliders(sld)
    }).catch(e => {
      setError(e.message)
    }).finally(() => setLoading(false))
  }, [selected, year, month])

  async function handleSimulate(adjustments, albedoRatio) {
    if (!selected) return
    setSimLoading(true)
    setSimResult(null)
    setInsight(null)
    setError('')
    try {
      const res = await api.simulate({
        adm_cd: selected.adm_cd,
        year,
        month,
        features: adjustments,
        albedo_area_ratio: albedoRatio,
      })
      setSimResult(res)
      setStep(3)
      // Generate insight
      setInsightLoading(true)
      try {
        const ins = await api.insight({
          delta_T: res.delta_T,
          features: res.adjusted_features || adjustments,
          adm_nm: summary?.adm_nm || '',
          month,
          background: summary?.background || null,
        })
        setInsight(ins)
      } catch {}
      setInsightLoading(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSimLoading(false)
    }
  }

  if (!selected) {
    return (
      <div className="side-panel">
        <div className="empty-panel">
          <div className="empty-icon">🗺️</div>
          <div className="empty-text">행정동을 선택하세요</div>
          <div className="empty-sub">
            지도에서 행정동을 클릭하거나<br />
            검색창에서 동/구를 검색하세요
          </div>
        </div>
      </div>
    )
  }

  const stepStatus = n => {
    if (n < step) return 'done'
    if (n === step) return 'active'
    return ''
  }

  return (
    <div className="side-panel">
      {/* Header */}
      <div className="panel-header">
        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
          {year}년 {month}월
        </span>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>

      {/* Step indicator */}
      <div className="step-indicator">
        {[['현황 진단', 1], ['정책 시뮬레이션', 2], ['효과 분석', 3]].map(([label, n]) => (
          <div key={n} className={`step-item ${stepStatus(n)}`}>
            <div className="step-circle">
              {n < step ? '✓' : n}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="panel-body">
        {loading && (
          <div className="loading-overlay">
            <span className="spin">⟳</span> 데이터 불러오는 중…
          </div>
        )}
        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, padding: '8px 0' }}>
            ⚠️ {error}
          </div>
        )}
        {!loading && summary && step === 1 && (
          <Step1 summary={summary} />
        )}
        {!loading && summary && step === 2 && (
          <Step2
            sliders={sliders}
            summary={summary}
            onSimulate={handleSimulate}
            simLoading={simLoading}
          />
        )}
        {!loading && step === 3 && (
          <Step3
            simResult={simResult}
            insight={insight}
            insightLoading={insightLoading}
            summary={summary}
          />
        )}
      </div>

      {/* Footer */}
      <div className="panel-footer">
        {step > 1 ? (
          <button className="btn-prev" onClick={() => setStep(s => s - 1)}>
            ← 이전
          </button>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        {step === 1 && (
          <button
            className="btn-next"
            disabled={!summary}
            onClick={() => setStep(2)}
          >
            다음 →
          </button>
        )}
        {step === 2 && (
          <button
            className="btn-next"
            disabled={simLoading}
            onClick={() => {
              // Step2 triggers simulate via its own button; here just go to step3 if already done
              if (simResult) setStep(3)
            }}
          >
            {simLoading ? <span className="spin">⟳</span> : '효과 분석 →'}
          </button>
        )}
        {step === 3 && (
          <button className="btn-next" onClick={() => { setStep(1); setSimResult(null); setInsight(null) }}>
            처음으로 ↺
          </button>
        )}
      </div>
    </div>
  )
}
