import { useState } from 'react'
import { api } from './api'
import DongSelector from './components/DongSelector'
import SummaryPanel from './components/SummaryPanel'
import SliderPanel from './components/SliderPanel'
import SimulationResult from './components/SimulationResult'
import InsightPanel from './components/InsightPanel'
import OptimizePanel from './components/OptimizePanel'

const s = {
  wrap: { maxWidth: 1080, margin: '0 auto', padding: '0 16px 60px' },
  header: {
    background: 'linear-gradient(135deg,#1a365d 0%,#2b6cb0 100%)',
    padding: '28px 32px',
    marginBottom: 28,
    color: '#fff',
  },
  headerInner: { maxWidth: 1080, margin: '0 auto' },
  h1: { fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 },
  h1sub: { fontSize: 14, opacity: .75 },
  errBanner: {
    background: '#fff5f5',
    border: '1.5px solid #fc8181',
    borderRadius: 8,
    padding: '12px 16px',
    marginBottom: 16,
    fontSize: 13,
    color: '#c53030',
  },
  tabRow: {
    display: 'flex', gap: 8, marginBottom: 20,
  },
  tab: {
    padding: '8px 18px',
    borderRadius: 8,
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    color: '#4a5568',
    transition: 'all .15s',
  },
  tabActive: {
    background: '#2b6cb0',
    borderColor: '#2b6cb0',
    color: '#fff',
  },
}

export default function App() {
  const [selection, setSelection]         = useState(null)   // {adm_cd, year, month}
  const [summary, setSummary]             = useState(null)
  const [sliders, setSliders]             = useState(null)
  const [simResult, setSimResult]         = useState(null)
  const [insight, setInsight]             = useState(null)

  const [summaryLoading, setSummaryLoading]   = useState(false)
  const [simLoading, setSimLoading]           = useState(false)
  const [insightLoading, setInsightLoading]   = useState(false)

  const [err, setErr]                         = useState('')
  const [tab, setTab]                         = useState('simulate') // 'simulate' | 'optimize'

  async function handleSearch({ adm_cd, year, month }) {
    setErr('')
    setSummary(null); setSliders(null); setSimResult(null); setInsight(null)
    setSummaryLoading(true)
    setSelection({ adm_cd, year, month })
    try {
      const [sum, slCfg] = await Promise.all([
        api.getSummary(adm_cd, year, month),
        api.getSliderConfig(adm_cd, year, month),
      ])
      setSummary(sum)
      setSliders(slCfg)
    } catch (e) {
      setErr(`현황 조회 실패: ${e.message}`)
    } finally {
      setSummaryLoading(false)
    }
  }

  async function handleSimulate({ features, albedo_area_ratio }) {
    if (!selection) return
    setErr(''); setSimResult(null); setInsight(null)
    setSimLoading(true)
    try {
      const res = await api.simulate({
        adm_cd: selection.adm_cd,
        year: selection.year,
        month: selection.month,
        features,
        albedo_area_ratio,
      })
      setSimResult(res)
    } catch (e) {
      setErr(`시뮬레이션 실패: ${e.message}`)
    } finally {
      setSimLoading(false)
    }
  }

  async function handleInsight() {
    if (!simResult || !selection) return
    setInsightLoading(true)
    try {
      const res = await api.insight({
        delta_T: simResult.delta_T,
        features: simResult.adjusted_features || {},
        adm_nm: summary?.adm_nm || '',
        month: selection.month,
        background: summary?.background || null,
      })
      setInsight(res)
    } catch (e) {
      setErr(`인사이트 생성 실패: ${e.message}`)
    } finally {
      setInsightLoading(false)
    }
  }

  return (
    <>
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.h1}>🌡️ 서울시 UHI 시뮬레이터</div>
          <div style={s.h1sub}>도시열섬 완화 정책 시뮬레이션 · Powered by heatwise AI</div>
        </div>
      </div>

      <div style={s.wrap}>
        {err && <div style={s.errBanner}>⚠️ {err}</div>}

        <DongSelector onSearch={handleSearch} loading={summaryLoading} />

        {summaryLoading && <LoadingBar text='현황 조회 중…' />}

        {summary && (
          <>
            <SummaryPanel data={summary} />

            <div style={s.tabRow}>
              <button
                style={{ ...s.tab, ...(tab === 'simulate' ? s.tabActive : {}) }}
                onClick={() => setTab('simulate')}
              >
                정책 슬라이더 시뮬레이션
              </button>
              <button
                style={{ ...s.tab, ...(tab === 'optimize' ? s.tabActive : {}) }}
                onClick={() => setTab('optimize')}
              >
                예산 기반 최적 추천
              </button>
            </div>

            {tab === 'simulate' && (
              <>
                <SliderPanel
                  sliders={sliders}
                  onSimulate={handleSimulate}
                  simLoading={simLoading}
                />
                {simLoading && <LoadingBar text='시뮬레이션 계산 중…' />}
                {simResult && (
                  <>
                    <SimulationResult
                      data={simResult}
                      onInsight={handleInsight}
                      insightLoading={insightLoading}
                    />
                    {insightLoading && <LoadingBar text='인사이트 생성 중…' />}
                    {insight && <InsightPanel data={insight} />}
                  </>
                )}
              </>
            )}

            {tab === 'optimize' && selection && (
              <OptimizePanel
                admCd={selection.adm_cd}
                year={selection.year}
                month={selection.month}
              />
            )}
          </>
        )}
      </div>
    </>
  )
}

function LoadingBar({ text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 20px',
      background: '#ebf8ff',
      borderRadius: 10,
      marginBottom: 16,
      fontSize: 13,
      color: '#2c5282',
      fontWeight: 600,
    }}>
      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
      {text}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
