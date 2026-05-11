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
  statBox: {
    background: '#f7fafc',
    borderRadius: 10,
    padding: '16px 20px',
    border: '1.5px solid #e2e8f0',
  },
  statLabel: { fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 },
  statVal: { fontSize: 28, fontWeight: 800, color: '#2d3748' },
  statUnit: { fontSize: 13, fontWeight: 500, color: '#a0aec0', marginLeft: 3 },
  highlight: { color: '#e53e3e' },
  green: { color: '#276749' },
  shapSection: {},
  shapTitle: { fontSize: 13, fontWeight: 700, color: '#4a5568', marginBottom: 10 },
  shapList: { display: 'flex', flexDirection: 'column', gap: 8 },
  shapItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    background: '#f7fafc',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  shapRank: {
    width: 22, height: 22,
    borderRadius: '50%',
    background: '#3182ce',
    color: '#fff',
    fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  shapFeat: { flex: 1, fontSize: 13, fontWeight: 600, color: '#2d3748' },
  shapVal: { fontSize: 13, fontWeight: 700 },
  causeBox: {
    marginTop: 12,
    padding: '10px 14px',
    background: '#fffbeb',
    borderRadius: 8,
    borderLeft: '3px solid #f6ad55',
    fontSize: 13,
    color: '#744210',
  },
}

function lstColor(lst) {
  if (lst >= 40) return '#e53e3e'
  if (lst >= 35) return '#dd6b20'
  if (lst >= 30) return '#d69e2e'
  return '#276749'
}

export default function SummaryPanel({ data }) {
  if (!data) return null
  const { current_lst, seoul_avg, three_yr_avg_lst, rank_in_gu, rank_total,
          adm_nm, gu_nm, year, month, shap_top3, cause_summary } = data

  return (
    <div style={s.card}>
      <div style={s.title}>
        현황 진단 — {gu_nm} {adm_nm} ({year}년 {month}월)
      </div>

      <div style={s.grid}>
        <div style={s.statBox}>
          <div style={s.statLabel}>현재 LST</div>
          <div style={s.statVal}>
            <span style={{ color: lstColor(current_lst) }}>{current_lst?.toFixed(2)}</span>
            <span style={s.statUnit}>°C</span>
          </div>
        </div>

        <div style={s.statBox}>
          <div style={s.statLabel}>서울 평균 LST</div>
          <div style={s.statVal}>
            {seoul_avg?.toFixed(2)}<span style={s.statUnit}>°C</span>
          </div>
          <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
            차이 {(current_lst - seoul_avg).toFixed(2) > 0 ? '+' : ''}{(current_lst - seoul_avg).toFixed(2)}°C
          </div>
        </div>

        {three_yr_avg_lst != null && (
          <div style={s.statBox}>
            <div style={s.statLabel}>3개년 평균</div>
            <div style={s.statVal}>
              {three_yr_avg_lst?.toFixed(2)}<span style={s.statUnit}>°C</span>
            </div>
          </div>
        )}

        {rank_in_gu != null && (
          <div style={s.statBox}>
            <div style={s.statLabel}>자치구 내 순위</div>
            <div style={s.statVal}>
              <span style={{ color: rank_in_gu <= 3 ? '#e53e3e' : '#2d3748' }}>{rank_in_gu}</span>
              <span style={s.statUnit}>/ {rank_total}</span>
            </div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>(1위 = 가장 뜨거운 동)</div>
          </div>
        )}
      </div>

      {shap_top3?.length > 0 && (
        <div style={s.shapSection}>
          <div style={s.shapTitle}>LST 영향 상위 3개 변수 (SHAP)</div>
          <div style={s.shapList}>
            {shap_top3.map((sh, i) => (
              <div key={sh.feature} style={s.shapItem}>
                <div style={s.shapRank}>{i + 1}</div>
                <div style={s.shapFeat}>{sh.feature}</div>
                <div style={{ ...s.shapVal, color: sh.shap_value > 0 ? '#e53e3e' : '#276749' }}>
                  {sh.shap_value > 0 ? '+' : ''}{sh.shap_value?.toFixed(4)}°C
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 20,
                  background: sh.direction === '상승' ? '#fff5f5' : '#f0fff4',
                  color: sh.direction === '상승' ? '#e53e3e' : '#276749',
                }}>
                  {sh.direction}
                </div>
              </div>
            ))}
          </div>
          {cause_summary && (
            <div style={s.causeBox}>💡 {cause_summary}</div>
          )}
        </div>
      )}
    </div>
  )
}
