import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { findOptimalCombination } from '../utils/optimalCombination'

function OptimalCombinationModal({ open, features, onClose, onApply }) {
  const [result, setResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (!open) {
      setResult(null)
      return
    }

    setAnalyzing(true)
    const t = setTimeout(() => {
      const baseLST = features?.LST
      if (baseLST == null) {
        setAnalyzing(false)
        setResult({ steps: [], finalDeltaLST: 0, finalAdjustments: {} })
        return
      }
      const r = findOptimalCombination(features, baseLST)
      setResult(r)
      setAnalyzing(false)
    }, 600)

    return () => clearTimeout(t)
  }, [open, features])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card">
        <div className="modal-header">
          <h3>🔍 최적 조합 탐색</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {analyzing || !result ? (
          <div className="modal-loading">
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <p>임팩트 큰 변수부터 차례로 추가하며 탐색 중...</p>
          </div>
        ) : result.steps.length === 0 ? (
          <div className="modal-empty">
            <p>유의미한 추천 조합을 찾지 못했습니다.</p>
            <p className="empty-sub">현재 변수값이 이미 최적에 가깝거나, 데이터가 부족할 수 있습니다.</p>
          </div>
        ) : (
          <>
            <div className="modal-summary">
              <div className="modal-summary-label">탐색된 최적 조합으로</div>
              <div className="modal-summary-value">
                약 <span className="big-temp">{Math.abs(result.finalDeltaLST).toFixed(1)}°C</span> 저감 기대
              </div>
              <div className="modal-summary-sub">
                {result.steps.length}개 변수 단계적 적용 시
              </div>
            </div>

            <div className="modal-steps">
              <div className="modal-steps-title">단계별 추가 효과</div>
              {result.steps.map((step, i) => (
                <div key={step.variable.key} className="modal-step">
                  <div className="step-number">{i + 1}</div>
                  <div className="step-content">
                    <div className="step-row">
                      <span className="step-name">{step.variable.label}</span>
                      <span className="step-impact">
                        {step.addedImpact > 0 ? '+' : ''}{step.addedImpact.toFixed(2)}°C
                      </span>
                    </div>
                    <div className="step-detail">
                      변화량 {formatDelta(step.deltaValue, step.variable)} ·
                      누적 {step.cumulativeDelta.toFixed(2)}°C
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                닫기
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={() => {
                  onApply(result.finalAdjustments)
                  onClose()
                }}
              >
                이 조합 적용하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

function formatDelta(d, variable) {
  const sign = d > 0 ? '+' : ''
  if (variable.step >= 1) return `${sign}${Math.round(d).toLocaleString()}${variable.unit}`
  return `${sign}${d.toFixed(2)}${variable.unit}`
}

export default OptimalCombinationModal