import { useState } from 'react'
import { POLICY_VARIABLES } from '../utils/policyMeta'
import { simulateLST, simulateSingleVariable } from '../utils/mockSimulation'

function SidePanelStep3({ selectedDong, features, adjustments, projectArea, year, month, dongInfo }) {
  const baseLST = features.LST

  const deltas = {}
  Object.entries(adjustments).forEach(([key, adjustedValue]) => {
    const currentValue = features[key]
    if (currentValue != null && adjustedValue != null) {
      deltas[key] = adjustedValue - currentValue
    }
  })

  const { predictedLST, deltaLST, uncertainty } = simulateLST({
    baseLST,
    adjustments: deltas,
  })

  const adjustedKeys = Object.keys(deltas).filter((k) => Math.abs(deltas[k]) > 0)
  const tableRows = adjustedKeys
    .map((key) => {
      const variable = POLICY_VARIABLES.find((v) => v.key === key)
      if (!variable) return null
      const single = simulateSingleVariable(key, deltas[key], baseLST)
      return {
        key,
        label: variable.label,
        deltaLST: single.deltaLST,
        cost: estimateCost(variable, deltas[key], projectArea),
        difficulty: estimateDifficulty(variable.package),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.deltaLST - b.deltaLST)

  if (baseLST == null) return null

  return (
    <div className="step3">

      {/* 1. 예측 결과 */}
      <div className="prediction-row">
        <span className="prediction-label">예상 LST</span>
        <span className="prediction-value">
          {predictedLST != null ? `${predictedLST.toFixed(1)}°C` : '-'}
        </span>
        {Math.abs(deltaLST) > 0.01 && (
          <span className={`prediction-delta ${deltaLST < 0 ? 'cool' : 'warm'}`}>
            ({deltaLST > 0 ? '+' : ''}{deltaLST.toFixed(1)})
          </span>
        )}
        <span className="prediction-uncertainty">| 오차범위 ±{uncertainty.toFixed(1)}°C</span>
      </div>

      {/* 2. 인사이트 요약 */}
      <InsightBox
  deltaLST={deltaLST}
  adjustedKeys={adjustedKeys}
  deltas={deltas}
  dongName={dongInfo?.[selectedDong]?.dongName || ''}
/>

      {/* 3. 정책 효과 비교 테이블 */}
      <div className="effect-table-section">
        <h3 className="section-title">정책 효과 비교</h3>
        {tableRows.length === 0 ? (
          <div className="effect-empty">
            슬라이더를 조정하면 변수별 효과가 표시됩니다
          </div>
        ) : (
          <table className="effect-table">
            <thead>
              <tr>
                <th>정책 변수</th>
                <th>ΔLST</th>
                <th>사업비</th>
                <th>난이도</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td className={row.deltaLST < 0 ? 'cool' : 'warm'}>
                    {row.deltaLST > 0 ? '+' : ''}{row.deltaLST.toFixed(2)}°C
                  </td>
                  <td>{row.cost}</td>
                  <td>
                    <span className={`difficulty difficulty-${row.difficulty.level}`}>
                      {row.difficulty.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 4. 액션 버튼 */}
      <div className="action-row">
        <button className="action-btn" onClick={() => alert('시트 내보내기 (구현 예정)')}>
          시트 내보내기
        </button>
        <button className="action-btn" onClick={() => alert('사업비 삽입 (구현 예정)')}>
          사업비 삽입
        </button>
      </div>

      {/* 5. 주의요망 토글 */}
      <Disclosure title="주의요망">
        <p>
          본 시뮬레이션은 LightGBM 모델 기반 추정이며 실제 정책 효과와 차이가 있을 수 있습니다.
          변수 간 상호작용 효과는 일부만 반영되어 있으며, 극단적 조합(3개 이상 변수 동시 최대 조정) 시
          예측 신뢰도가 저하될 수 있습니다.
        </p>
      </Disclosure>

      {/* 6. 전망 토글 */}
      <Disclosure title="전망">
        <p>
          단기적으로는 그늘막 설치와 쿨루프 도색이 즉시 효과를 볼 수 있으며,
          중장기적으로는 녹지 확대와 건물 밀도 관리가 지속적 LST 저감에 효과적입니다.
          특히 여름철(6-8월) 효과가 가장 크므로 하절기 전 사업 완료를 권장합니다.
        </p>
      </Disclosure>
    </div>
  )
}

/**
 * 접이식 토글 (PDF 명세: "접이식 토글, 닫힘 상태 기본")
 */
function Disclosure({ title, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`disclosure ${open ? 'open' : ''}`}>
      <button className="disclosure-header" onClick={() => setOpen(!open)}>
        <span className="disclosure-arrow">{open ? '▼' : '▶'}</span>
        <span className="disclosure-title">{title}</span>
      </button>
      {open && <div className="disclosure-body">{children}</div>}
    </div>
  )
}

const RELATED_LINKS = {
    Albedo: { label: '쿨루프 보급사업', url: 'https://www.seoul.go.kr/' },
    '녹지율': { label: '서울시 녹지조성 지원사업', url: 'https://parks.seoul.go.kr/' },
    '총_가로수_개수': { label: '가로수 식재 사업', url: 'https://parks.seoul.go.kr/' },
    '그늘막 개수': { label: '폭염 그늘막 설치사업', url: 'https://news.seoul.go.kr/' },
  }
  
  function InsightBox({ deltaLST, adjustedKeys, deltas, dongName }) {
    let message
    if (adjustedKeys.length === 0) {
      message = '슬라이더를 조정하거나 "최적 조합 보기"를 통해 정책별 효과를 분석해드립니다.'
    } else if (deltaLST < -1) {
      message = `${dongName}에서 ${adjustedKeys.length}개 변수 조정으로 약 ${Math.abs(deltaLST).toFixed(1)}°C 저감이 기대됩니다. 현재 조합은 단기 실행 가능한 수준입니다.`
    } else if (deltaLST < -0.3) {
      message = `${dongName}에서 약 ${Math.abs(deltaLST).toFixed(1)}°C 저감이 예상됩니다. 효과를 키우려면 추가 변수 조정을 고려하세요.`
    } else if (deltaLST > 0.3) {
      message = `현재 조정값으로는 LST가 오히려 ${deltaLST.toFixed(1)}°C 상승할 수 있습니다. 변수 조정 방향을 점검해주세요.`
    } else {
      message = `현재 조정값의 LST 변화는 미미합니다. 더 큰 효과를 보려면 SHAP 영향력이 큰 변수를 우선 조정해보세요.`
    }
  
    // 조정된 변수 중 관련 정책 링크가 있는 것
    const relatedLinks = adjustedKeys
      .map((k) => RELATED_LINKS[k] && { key: k, ...RELATED_LINKS[k] })
      .filter(Boolean)
  
    return (
      <div className="insight-box">
        <div className="insight-tag">정책 완화 인사이트 [AI 생성]</div>
        <p className="insight-text">{message}</p>
  
        {relatedLinks.length > 0 && (
          <div className="insight-links">
            <div className="insight-links-label">관련 정책 자료</div>
            {relatedLinks.map((link) => (
  <a
    key={link.key}
    className="insight-link"
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
  >
    {link.label}
  </a>
))}
          </div>
        )}
      </div>
    )
  }

function estimateCost(variable, delta, projectArea) {
    if (delta === 0) return '-'
  
    let totalCost = 0
  
    // 면적 기반 변수 (Albedo, 녹지율 등)
    if (variable.appliesToArea && variable.costPerArea != null) {
      if (!projectArea || projectArea <= 0) return '면적 미입력'
      const intensity = Math.abs(delta / (variable.recommendedUpper || 1))
      totalCost = projectArea * variable.costPerArea * Math.max(0.5, Math.min(2, intensity))
    }
    // 단계당 비용
    else if (variable.costPerStep != null) {
      const stepCount = Math.abs(delta / variable.step)
      totalCost = stepCount * variable.costPerStep
    }
  
    if (totalCost === 0) return '-'
    if (totalCost < 1e8) return `${(totalCost / 1e6).toFixed(0)}백만`
    if (totalCost < 1e12) return `${(totalCost / 1e8).toFixed(1)}억`
    return `${(totalCost / 1e12).toFixed(1)}조`
  }

function estimateDifficulty(packageId) {
  const map = {
    facility: { level: 'low', label: '하' },
    surface: { level: 'mid', label: '중' },
    energy: { level: 'mid', label: '중' },
    green: { level: 'mid', label: '중' },
    mobility: { level: 'high', label: '상' },
    urban_structure: { level: 'high', label: '상' },
  }
  return map[packageId] || { level: 'mid', label: '중' }
}

export default SidePanelStep3