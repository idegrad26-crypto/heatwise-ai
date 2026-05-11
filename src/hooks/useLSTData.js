import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { computeLSTRange } from '../utils/colorScale'

/**
 * 행정동별 LST + 메타 데이터 로드
 * - 키: adm_cd 8자리 (예: '11010530')
 * - dongInfo: { '11010530': { guName: '종로구', dongName: '사직동' } }
 */
export function useLSTData(year, month) {
    const [data, setData] = useState({
        lstByDong: {},
        dongInfo: {},
        dongsByGu: {},
        nameToCode: {},
        seoulAvg: null,
        lstRange: { min: 15, max: 35 },
      })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    Promise.all([
      fetch('/data/feat_anthropogenic_2020_2024.csv').then((r) => r.text()),
      fetch('/data/feat_satellite_2020_2024.csv').then((r) => r.text()),
    ]).then(([anthCsv, satCsv]) => {
      const anth = Papa.parse(anthCsv, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      })

      const dongInfo = {}
      const nameToCode = {}
      const dongsByGu = {}

      anth.data.forEach((row) => {
        if (!row.adm_cd || !row.adm_nm || !row.gu_nm) return
        const code = String(row.adm_cd)
        dongInfo[code] = { guName: row.gu_nm, dongName: row.adm_nm }
        nameToCode[code] = code
        if (!dongsByGu[row.gu_nm]) dongsByGu[row.gu_nm] = new Set()
        dongsByGu[row.gu_nm].add(code)
      })
      Object.keys(dongsByGu).forEach((gu) => {
        dongsByGu[gu] = Array.from(dongsByGu[gu])
      })

      const sat = Papa.parse(satCsv, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      })

      const lstByDong = {}
      const lstValues = []
      sat.data.forEach((row) => {
        if (row.year === year && row.month === month && row.LST != null) {
          const code = String(row.ADM_CD)
          if (dongInfo[code]) {
            lstByDong[code] = row.LST
            lstValues.push(row.LST)
          }
        }
      })

      const seoulAvg =
      lstValues.length > 0
        ? lstValues.reduce((a, b) => a + b, 0) / lstValues.length
        : null
    
    const lstRange = computeLSTRange(lstValues)
    
    console.log(`[LST 매핑] ${year}년 ${month}월: ${Object.keys(lstByDong).length}개 행정동, 서울평균 ${seoulAvg?.toFixed(1)}°C, 범위 ${lstRange.min}~${lstRange.max}°C`)
    
    setData({ lstByDong, dongInfo, dongsByGu, nameToCode, seoulAvg, lstRange })
      setLoading(false)
    })
  }, [year, month])

  return { ...data, loading }
}