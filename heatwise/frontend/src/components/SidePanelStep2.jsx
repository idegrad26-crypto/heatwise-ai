import { useState } from 'react'
import { PACKAGES, getVariablesByPackage } from '../utils/policyMeta'
import PolicySlider from './PolicySlider'
import { useShapData } from '../hooks/useShapData'
import OptimalCombinationModal from './OptimalCombinationModal'

function SidePanelStep2({ selectedDong, year, month, nameToCode, features, adjustments, onAdjust, projectArea, onProjectAreaChange }) {
    const [activePackage, setActivePackage] = useState('green')
    const [modalOpen, setModalOpen] = useState(false)

  const { shapAll } = useShapData(selectedDong, year, month, nameToCode, { all: true })

  let variablesInPackage = getVariablesByPackage(activePackage)

  if (shapAll && shapAll.length > 0) {
    const shapOrder = {}
    shapAll.forEach((s) => { shapOrder[s.feature] = Math.abs(s.value) })
    variablesInPackage = [...variablesInPackage].sort(
      (a, b) => (shapOrder[b.key] || 0) - (shapOrder[a.key] || 0)
    )
  }

  return (
    <div className="step2">
      <div className="step-tag-row">
      <button
  className="optimal-btn"
  onClick={() => setModalOpen(true)}
>
  예산별 최적 조합 추천 보기
</button>
      </div>

      <ProjectAreaInput
        value={projectArea}
        onChange={onProjectAreaChange}
      />

      <div className="package-tabs">
        {PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            className={`package-tab ${activePackage === pkg.id ? 'active' : ''}`}
            onClick={() => setActivePackage(pkg.id)}
          >
            {pkg.label}
          </button>
        ))}
      </div>

      <div className="slider-list">
        {variablesInPackage.length === 0 ? (
          <div className="slider-empty">이 패키지에 변수가 없습니다</div>
        ) : (
          variablesInPackage.map((variable) => (
            <PolicySlider
              key={variable.key}
              variable={variable}
              currentValue={features[variable.key]}
              adjustedValue={adjustments[variable.key]}
              onChange={(newVal) => onAdjust(variable.key, newVal)}
            />
          ))
        )}
      </div>

      <BackgroundVariables features={features} shapAll={shapAll} />

      <OptimalCombinationModal
        open={modalOpen}
        features={features}
        onClose={() => setModalOpen(false)}
        onApply={(finalAdjustments) => {
          Object.entries(finalAdjustments).forEach(([key, value]) => {
            onAdjust(key, value)
          })
        }}
      />
    </div>
  )
}

const SEASON_LABELS = {
  DJF: '겨울 (12~2월)',
  MAM: '봄 (3~5월)',
  JJA: '여름 (6~8월)',
  SON: '가을 (9~11월)',
}

const BG_FEATURE_LABELS = {
  'avg_temp (℃)': '평균기온',
  'avg_humi (%)': '평균습도',
  'avg_ultra_rays (UV)': '자외선',
  'avg_inte_illu (lux)': '조도',
  'avg_elevation': '고도',
}

const BG_FEATURE_KEYS = [
  'avg_temp (℃)',
  'season_JJA',
  'season_DJF',
  'season_MAM',
  'season_SON',
  'year_norm',
  'month_sin',
  'month_cos',
  'avg_humi (%)',
  'avg_ultra_rays (UV)',
  'avg_inte_illu (lux)',
  'avg_elevation',
]

function BackgroundVariables({ features, shapAll }) {
  const tempVal = features['avg_temp (℃)']
  const humiVal = features['avg_humi (%)']
  const seasonCode = features.season
  const seasonLabel = SEASON_LABELS[seasonCode] || seasonCode

  const conditions = []
  if (tempVal != null) conditions.push({ label: '기온', value: `${tempVal.toFixed(1)}°C` })
  if (humiVal != null) conditions.push({ label: '습도', value: `${humiVal.toFixed(0)}%` })
  if (seasonLabel) conditions.push({ label: '계절', value: seasonLabel })

  const bgShap = (shapAll || [])
    .filter((s) => BG_FEATURE_KEYS.includes(s.feature))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 3)

  if (conditions.length === 0 && bgShap.length === 0) return null

  return (
    <div className="bg-var-section">
      <div className="bg-var-title">배경 조건 <span className="bg-var-sub">(조정 불가, 시점·환경 요인)</span></div>

      {conditions.length > 0 && (
        <div className="bg-var-row">
          {conditions.map((c, i) => (
            <span key={i} className="bg-var-chip">
              <span className="bg-var-chip-label">{c.label}</span>
              <span className="bg-var-chip-value">{c.value}</span>
            </span>
          ))}
        </div>
      )}

      {bgShap.length > 0 && (
        <div className="bg-shap-list">
          <div className="bg-shap-title">현재 LST에 미치는 배경 요인 영향력</div>
          {bgShap.map((s, i) => (
            <div key={i} className="bg-shap-item">
              <span className="bg-shap-rank">{i + 1}.</span>
              <span className="bg-shap-name">
                {BG_FEATURE_LABELS[s.feature] || formatBgFeatureName(s.feature)}
              </span>
              <span className={`bg-shap-value ${s.value > 0 ? 'positive' : 'negative'}`}>
                {s.value > 0 ? '+' : ''}{s.value.toFixed(2)}°C
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatBgFeatureName(key) {
  if (key.startsWith('season_')) {
    const map = { 'season_DJF': '겨울', 'season_JJA': '여름', 'season_MAM': '봄', 'season_SON': '가을' }
    return `계절(${map[key] || key.replace('season_', '')})`
  }
  if (key === 'year_norm') return '연도'
  if (key.startsWith('month_')) return '월(주기성)'
  return key
}

function ProjectAreaInput({ value, onChange }) {
  const handleChange = (e) => {
    const v = parseFloat(e.target.value)
    onChange(isNaN(v) ? null : v)
  }

  return (
    <div className="project-area-box">
      <div className="project-area-header">
        <div>
          <div className="project-area-title">사업 시행 면적</div>
          <div className="project-area-hint">
            이 동에서 정책을 시행할 면적 (사업비 계산에 사용)
          </div>
        </div>
      </div>
      <div className="project-area-input-row">
        <input
          type="number"
          className="project-area-input"
          placeholder="예: 1500"
          value={value ?? ''}
          onChange={handleChange}
          min="0"
          step="100"
        />
        <span className="project-area-unit">㎡</span>
      </div>
    </div>
  )
}

export default SidePanelStep2
