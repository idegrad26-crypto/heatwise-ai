const s = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 28px',
    boxShadow: '0 1px 4px rgba(0,0,0,.08)',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#2d3748' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 },
  block: { borderRadius: 10, padding: '16px 18px' },
  blockTitle: { fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 },
  blockText: { fontSize: 14, lineHeight: 1.65, color: '#2d3748' },
  summary: { background: '#f0fff4', border: '1.5px solid #68d391' },
  summaryTitle: { color: '#276749' },
  caution: { background: '#fffbeb', border: '1.5px solid #f6ad55' },
  cautionTitle: { color: '#744210' },
  outlook: { background: '#ebf8ff', border: '1.5px solid #63b3ed' },
  outlookTitle: { color: '#2c5282' },
}

export default function InsightPanel({ data }) {
  if (!data) return null
  const { summary, caution, outlook } = data

  return (
    <div style={s.card}>
      <div style={s.title}>💡 정책 효과 인사이트</div>
      <div style={s.grid}>
        <div style={{ ...s.block, ...s.summary }}>
          <div style={{ ...s.blockTitle, ...s.summaryTitle }}>핵심 요약</div>
          <div style={s.blockText}>{summary}</div>
        </div>
        <div style={{ ...s.block, ...s.caution }}>
          <div style={{ ...s.blockTitle, ...s.cautionTitle }}>⚠️ 주의사항</div>
          <div style={s.blockText}>{caution}</div>
        </div>
        <div style={{ ...s.block, ...s.outlook }}>
          <div style={{ ...s.blockTitle, ...s.outlookTitle }}>중장기 전망</div>
          <div style={s.blockText}>{outlook}</div>
        </div>
      </div>
    </div>
  )
}
