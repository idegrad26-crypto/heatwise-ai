function PolicySlider({ variable, currentValue, adjustedValue, onChange }) {
    const baseline = currentValue != null ? currentValue : (variable.safeLow + variable.safeHigh) / 2
    const value = adjustedValue != null ? adjustedValue : baseline
    const delta = value - baseline
  
    const min = variable.safeLow
    const max = variable.safeHigh
    const recommendedPos = ((variable.recommendedUpper - min) / (max - min)) * 100
  
    const handleChange = (e) => onChange(parseFloat(e.target.value))
  
    const formatValue = (v) => {
      if (v == null) return '-'
      if (variable.step >= 1) return Math.round(v).toLocaleString()
      return v.toFixed(2)
    }
  
    const formatDelta = (d) => {
      if (Math.abs(d) < variable.step / 2) return ''
      const sign = d > 0 ? '+' : ''
      if (variable.step >= 1) return `${sign}${Math.round(d).toLocaleString()}`
      return `${sign}${d.toFixed(2)}`
    }
  
    return (
      <div className="policy-slider">
        <div className="slider-header">
  <span className="slider-label">
    {variable.label}
    {variable.description && (
      <span className="slider-info" title={variable.description}>ⓘ</span>
    )}
  </span>
          <span
            className="slider-current"
            title={`3년 평균: 데이터 준비 중\n작년 동월: 데이터 준비 중`}
          >
            현재 {formatValue(baseline)}
          </span>
        </div>
  
        <div className="slider-track-wrap">
          <div
            className="slider-recommended"
            style={{ width: `${Math.min(100, recommendedPos)}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={variable.step}
            value={value}
            onChange={handleChange}
            className="slider-input"
          />
        </div>
  
        <div className="slider-footer">
          <span className="slider-range">
            조정범위: {formatValue(min)} ~ {formatValue(max)} · 단위: {variable.step}{variable.unit}
          </span>
          {delta !== 0 && (
            <span className={`slider-delta ${delta > 0 ? 'positive' : 'negative'}`}>
              {formatDelta(delta)}
            </span>
          )}
        </div>
      </div>
    )
  }
  
  export default PolicySlider