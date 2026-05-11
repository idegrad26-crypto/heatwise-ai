export default function Step1({ summary }) {
  const {
    adm_nm, gu_nm, current_lst, seoul_avg,
    rank_in_gu, rank_total, shap_top3, cause_summary,
  } = summary

  return (
    <>
      <div className="dong-title-gu">{gu_nm}</div>
      <div className="dong-title">{adm_nm} 열환경 시뮬레이터</div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">현재 LST</div>
          <div className="stat-value">{current_lst?.toFixed(1)}°C</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">서울 평균</div>
          <div className="stat-value blue">{seoul_avg?.toFixed(1)}°C</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{gu_nm} 내</div>
          <div className="stat-value gray">
            {rank_in_gu != null ? `${rank_in_gu}위` : '-'}
            {rank_total != null && <span style={{ fontSize: 10, color: '#9ca3af' }}>/{rank_total}</span>}
          </div>
        </div>
      </div>

      <div className="shap-title">
        <span>이 동네 핵심 변수 TOP 3 (SHAP)</span>
        <span className="shap-note">ⓘ 모델 기반 추정</span>
      </div>

      {shap_top3?.length > 0 ? shap_top3.map((item, i) => (
        <div className="shap-row" key={i}>
          <span className="shap-rank">{i + 1}.</span>
          <span className="shap-name">{item.feature}</span>
          <span className={`shap-val ${item.shap_value > 0 ? 'up' : 'down'}`}>
            {item.shap_value > 0 ? '+' : ''}{item.shap_value?.toFixed(2)}°C
          </span>
        </div>
      )) : (
        <div style={{ fontSize: 12, color: '#9ca3af', padding: '8px 0' }}>SHAP 데이터 없음</div>
      )}

      {cause_summary && (
        <div className="cause-box">{cause_summary}</div>
      )}
    </>
  )
}
