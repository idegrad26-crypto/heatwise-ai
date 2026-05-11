const s = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 28px',
    boxShadow: '0 1px 4px rgba(0,0,0,.08)',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#2d3748' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 20 },
  box: {
    background: '#f7fafc',
    borderRadius: 10,
    padding: '16px 20px',
    border: '1.5px solid #e2e8f0',
    textAlign: 'center',
  },
  boxGreen: { borderColor: '#68d391', background: '#f0fff4' },
  boxRed: { borderColor: '#fc8181', background: '#fff5f5' },
  lbl: { fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 },
  val: { fontSize: 30, fontWeight: 800 },
  unit: { fontSize: 13, color: '#a0aec0', marginLeft: 2 },
  deltaPos: { color: '#e53e3e' },
  deltaNeg: { color: '#276749' },
  modelTag: {
    display: 'inline-block', padding: '3px 10px',
    borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: '#ebf8ff', color: '#2b6cb0',
    marginBottom: 12,
  },
  adjTitle: { fontSize: 13, fontWeight: 700, color: '#4a5568', marginBottom: 8 },
  adjList: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  adjTag: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12, fontWeight: 600,
    background: '#ebf8ff', color: '#2c5282',
    border: '1px solid #bee3f8',
  },
  arrow: { fontSize: 20, color: '#a0aec0', textAlign: 'center', alignSelf: 'center' },
}

export default function SimulationResult({ data, onInsight, insightLoading }) {
  if (!data) return null
  const { before_lst, after_lst, delta_T, adjusted_features, model_type } = data
  const isNeg = delta_T < 0

  return (
    <div style={s.card}>
      <div style={s.title}>Step 3 · 시뮬레이션 결과</div>

      <div style={{ ...s.modelTag }}>
        모델: {model_type === 'lightgbm' ? '✅ LightGBM' : '⚠️ Ridge 폴백 (model.pkl 없음)'}
      </div>

      <div style={s.grid}>
        <div style={s.box}>
          <div style={s.lbl}>현재 LST</div>
          <div style={s.val}>{before_lst?.toFixed(2)}<span style={s.unit}>°C</span></div>
        </div>

        <div style={s.arrow}>→</div>

        <div style={{ ...s.box, ...(isNeg ? s.boxGreen : s.boxRed) }}>
          <div style={s.lbl}>예측 LST</div>
          <div style={s.val}>{after_lst?.toFixed(2)}<span style={s.unit}>°C</span></div>
        </div>

        <div style={{ ...s.box, ...(isNeg ? s.boxGreen : s.boxRed) }}>
          <div style={s.lbl}>변화량 ΔT</div>
          <div style={{ ...s.val, ...(isNeg ? { color: '#276749' } : { color: '#e53e3e' }) }}>
            {delta_T > 0 ? '+' : ''}{delta_T?.toFixed(2)}<span style={s.unit}>°C</span>
          </div>
          <div style={{ fontSize: 12, marginTop: 4, color: '#718096' }}>
            {isNeg ? '🟢 냉각 효과' : '🔴 온도 상승'}
          </div>
        </div>
      </div>

      {adjusted_features && Object.keys(adjusted_features).length > 0 && (
        <div>
          <div style={s.adjTitle}>조정된 변수</div>
          <div style={s.adjList}>
            {Object.entries(adjusted_features).map(([label, val]) => (
              <span key={label} style={s.adjTag}>{label}: {Number(val).toFixed(4)}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={onInsight}
          disabled={insightLoading}
          style={{
            padding: '10px 24px',
            background: '#805ad5',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            opacity: insightLoading ? .6 : 1,
          }}
        >
          {insightLoading ? '인사이트 생성 중…' : '💡 정책 인사이트 생성'}
        </button>
      </div>
    </div>
  )
}
