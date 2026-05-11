import { useEffect, useState } from 'react'
import Papa from 'papaparse'

/**
 * 선택된 동·연·월의 모든 변수 현재값 (정책 + 위성 + 배경)
 */
export function useDongFeatures(dongName, year, month, nameToCode) {
  const [features, setFeatures] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dongName || !nameToCode[dongName]) {
      setFeatures({})
      return
    }

    setLoading(true)
    const targetCode = String(nameToCode[dongName])

    Promise.all([
      fetch('/data/feat_anthropogenic_2020_2024.csv').then((r) => r.text()),
      fetch('/data/feat_satellite_2020_2024.csv').then((r) => r.text()),
      fetch('/data/feat_weather.csv').then((r) => r.text()),
    ]).then(([anthCsv, satCsv, weatherCsv]) => {
      const anth = Papa.parse(anthCsv, { header: true, skipEmptyLines: true, dynamicTyping: true })
      const sat = Papa.parse(satCsv, { header: true, skipEmptyLines: true, dynamicTyping: true })
      const weather = Papa.parse(weatherCsv, { header: true, skipEmptyLines: true, dynamicTyping: true })

      const anthRow = anth.data.find(
        (r) => String(r.adm_cd) === targetCode && r.year === year && r.month === month
      )
      const satRow = sat.data.find(
        (r) => String(r.ADM_CD) === targetCode && r.year === year && r.month === month
      )
      const weatherRow = weather.data.find(
        (r) => String(r.ADM_CD) === targetCode && r.year === year && r.month === month
      )

      const merged = {
        // 정책 변수
        '녹지율': anthRow?.green_ratio,
        '총_가로수_개수': anthRow?.street_tree_count,
        '누적_조성면적합계(m^2)': anthRow?.roof_green_area,
        '그늘막 개수': anthRow?.shade_count,
        '에너지사용량_전기': anthRow?.energy_elec,
        '에너지사용량_가스': anthRow?.energy_gas,
        '차량밀도': anthRow?.vehicle_density,
        '인구밀도': anthRow?.population_density,
        '용적률_행정동별': anthRow?.floor_area_ratio,
        // 위성
        Albedo: satRow?.Albedo,
        NDVI: satRow?.NDVI,
        NDBI: satRow?.NDBI,
        LST: satRow?.LST,
        // 배경 (weather)
        'avg_temp (℃)': weatherRow?.['avg_temp (℃)'],
        'avg_humi (%)': weatherRow?.['avg_humi (%)'],
        'avg_ultra_rays (UV)': weatherRow?.['avg_ultra_rays (UV)'],
        'avg_inte_illu (lux)': weatherRow?.['avg_inte_illu (lux)'],
        'avg_noise (dB )': weatherRow?.['avg_noise (dB )'],
        'avg_elevation': weatherRow?.avg_elevation,
        'season': weatherRow?.season,
      }

      setFeatures(merged)
      setLoading(false)
    })
  }, [dongName, year, month])

  return { features, loading }
}