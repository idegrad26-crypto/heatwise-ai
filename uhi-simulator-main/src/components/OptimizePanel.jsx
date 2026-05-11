import { useState } from 'react'
import { api } from '../api'

const PACKAGES = ['전체', '녹지', '건축포장', '에너지', '폭염저감']

const s = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 28px',
    boxShadow: '0 1px 4px rgba(0,0,0,.08)',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4, color: '#2d3748' },
  sub: { fontSize: 13, color: '#718096', marginBottom: 16 },
  row: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 },
  group: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: '#718096' },
  input: {
    padding: '8px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    width: 180,
  },
  select: {
    padding: '8px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    background: '#fff',
  },
  btn: {
    padding: '9px 22px',
    background: '#dd6b20',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  resultBox: {
    background: '#f7fafc',
    borderRadius: 10,
    padding: '16px 20px',
    border: '1.5px solid #e2e8f0',
  },
  kv: { display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 },
  recTitle: { fontSize: 13, fontWeight: 700, color: '#4a5568', marginTop: 12, marginBottom: 8 },
  recList: { display: 'flex', flexDirection: 'column', gap: 8 },
  recItem: {
    padding: '10px 14px',
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: 13,
  },
  err: { color: '#e53e3e', fontSize: 13, marginTop: 8 },
}

export default function OptimizePanel({ admCd, year, month }) {
  const [budget, setBudget]     = useState(50000000)
  const [pkg, setPkg]           = useState('전체')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState('')

  async function handleOptimize() {
    if (!admCd) return
    setLoading(true); setErr(''); setResult(null)
    try {
      const res = await api.optimize({ adm_cd: admCd, year, month, budget: Number(budget), package: pkg })
      setResult(res)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.card}>
      <div style={s.title}>최적 정책 추천 (예산 기반)</div>
      <div style={s.sub}>예산과 패키지를 설정하면 가장 효과적인 정책 조합을 추천합니다.</div>

      <div style={s.row}>
        <div style={s.group}>
          <label style={s.label}>예산 (원)</label>
          <input
            type='number'
            style={s.input}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min={0}
            step={1000000}
          />
        </div>
        <div style={s.group}>
          <label style={s.label}>패키지</label>
          <select style={s.select} value={pkg} onChange={(e) => setPkg(e.target.value)}>
            {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button style={{ ...s.btn, opacity: loading ? .6 : 1 }} onClick={handleOptimize} disabled={loading || !admCd}>
          {loading ? '분석 중…' : '최적 추천 실행'}
        </button>
      </div>

      {err && <div style={s.err}>{err}</div>}

      {result && (
        <div style={s.resultBox}>
          <div style={s.kv}>
            <span>투입 예산</span><strong>{result.used_budget?.toLocaleString()}원</strong>
          </div>
          <div style={s.kv}>
            <span>예상 ΔT</span>
            <strong style={{ color: result.expected_delta_T < 0 ? '#276749' : '#e53e3e' }}>
              {result.expected_delta_T > 0 ? '+' : ''}{result.expected_delta_T?.toFixed(2)}°C
            </strong>
          </div>
          <div style={s.kv}>
            <span>현재 LST → 예측 LST</span>
            <strong>{result.before_lst?.toFixed(2)} → {result.after_lst?.toFixed(2)}°C</strong>
          </div>

          {result.recommended?.length > 0 && (
            <>
              <div style={s.recTitle}>추천 조치 ({result.recommended.length}개)</div>
              <div style={s.recList}>
                {result.recommended.map((r) => (
                  <div key={r.feature_label} style={s.recItem}>
                    <strong>{r.feature_label}</strong>
                    {' '}현재 {r.current_value} → {r.recommended_value}
                    {' '}(변화량: {r.delta > 0 ? '+' : ''}{r.delta},
                    {' '}비용: {r.cost?.toLocaleString()}원)
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
