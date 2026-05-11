import { useState } from 'react'

const COST_TABLE_URL = 'https://www.notion.so'  // TODO: 실제 노션 비용 단위 페이지 URL로 교체

export default function Step3({ simResult, insight, insightLoading, summary }) {
  const [showCaution, setShowCaution] = useState(true)
  const [showOutlook, setShowOutlook] = useState(true)

  if (!simResult) {
    return (
      <div className="loading-overlay">
        <span className="spin">⟳</span> 시뮬레이션 결과 대기 중…
      </div>
    )
  }

  const { after_lst, delta_T, adjusted_features } = simResult
  const deltaSign = delta_T <= 0 ? 'neg' : 'pos'

  const changedFeatures = Object.entries(adjusted_features || {}).filter(([, v]) => v != null)

  return (
    <>
      <div className="result-lst">
        <div className="result-lst-left">
          <div className="result-lst-label">예상 LST</div>
          <div className="result-lst-value">{after_lst?.toFixed(1)}°C</div>
          <div className="result-err">오차범위 ±0.4°C</div>
        </div>
        <div className={`result-delta ${deltaSign}`}>
          {delta_T > 0 ? '+' : ''}{delta_T?.toFixed(2)}°C
        </div>
      </div>

      {insightLoading && (
        <div className="loading-overlay">
          <span className="spin">⟳</span> AI 인사이트 생성 중…
        </div>
      )}

      {insight && (
        <div className="insight-box">
          <div className="insight-title">정책 완화 인사이트 [AI 생성]</div>
          <div className="insight-text">{insight.summary}</div>
        </div>
      )}

      <div className="compare-title">정책 효과 비교</div>
      {changedFeatures.length === 0 ? (
        <div className="compare-empty">슬라이더를 조정하면 변수별 효과가 표시됩니다</div>
      ) : (
        changedFeatures.slice(0, 6).map(([key, val]) => (
          <div className="compare-row" key={key}>
            <span className="compare-name">{key}</span>
            <span className="compare-val">{typeof val === 'number' ? val.toFixed(3) : val}</span>
          </div>
        ))
      )}

      <div className="action-row">
        <button className="action-btn">📊 시트 내보내기</button>
        <button className="action-btn">💵 사업비 삽입</button>
      </div>

      <a
        href={COST_TABLE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="cost-link"
      >
        📋 단위 비용 환산표 보기 →
      </a>

      {insight?.caution && (
        <div className="caution-section">
          <button className="caution-toggle" onClick={() => setShowCaution(v => !v)}>
            {showCaution ? '▾' : '▸'} 주의요망
          </button>
          {showCaution && <div className="caution-body">{insight.caution}</div>}
        </div>
      )}

      {insight?.outlook && (
        <div className="caution-section">
          <button className="caution-toggle" onClick={() => setShowOutlook(v => !v)}>
            {showOutlook ? '▾' : '▸'} 전망
          </button>
          {showOutlook && <div className="caution-body">{insight.outlook}</div>}
        </div>
      )}
    </>
  )
}
