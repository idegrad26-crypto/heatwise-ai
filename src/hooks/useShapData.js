import { useEffect, useState } from 'react'
import Papa from 'papaparse'

/**
 * SHAP 데이터를 가져오는 hook
 * @param options.all - true이면 전체 SHAP 정렬 결과를 추가로 반환
 */
export function useShapData(dongName, year, month, nameToCode, options = {}) {
  const [result, setResult] = useState({ shapTop3: [], shapAll: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dongName || !nameToCode || !nameToCode[dongName]) {
      setResult({ shapTop3: [], shapAll: [] })
      return
    }

    setLoading(true)
    const targetCode = String(nameToCode[dongName])

    fetch('/data/stat_shap.csv')
      .then((r) => r.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        })

        const filtered = parsed.data.filter(
          (row) =>
            String(row.adm_cd) === targetCode &&
            row.year === year &&
            row.month === month &&
            row.shap_value != null
        )

        // 절대값 큰 순으로 정렬
        const sorted = filtered
          .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
          .map((row) => ({
            feature: row.feature_name,
            value: row.shap_value,
          }))

        setResult({
          shapTop3: sorted.slice(0, 3),
          shapAll: sorted,
        })
        setLoading(false)
      })
  }, [dongName, year, month])

  return { ...result, loading }
}