import { useEffect, useState } from 'react'
import { api } from '../api'

/**
 * 선택된 동·연·월의 모든 변수 현재값 (정책 + 위성 + 배경)
 * features[col] = current_value (col은 MODEL_FEATURES 컬럼명)
 */
export function useDongFeatures(selectedDong, year, month, nameToCode) {
  const [features, setFeatures] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDong || !nameToCode[selectedDong]) {
      setFeatures({})
      return
    }

    setLoading(true)
    const adm_cd = String(nameToCode[selectedDong])

    Promise.all([
      api.getSummary(adm_cd, year, month),
      api.getSliderConfig(adm_cd, year, month),
    ])
      .then(([summary, sliderConfig]) => {
        const feats = {}

        // Policy + satellite variable current values from slider config (col → current_value)
        sliderConfig.forEach((s) => {
          feats[s.col] = s.current_value
        })

        // LST and background from summary
        feats['LST'] = summary.current_lst
        feats['avg_temp (℃)'] = summary.background?.avg_temp ?? null
        feats['season'] = summary.background?.season ?? null

        setFeatures(feats)
        setLoading(false)
      })
      .catch((e) => {
        console.error('useDongFeatures error:', e)
        setLoading(false)
      })
  }, [selectedDong, year, month])

  return { features, loading }
}
