import { useState, useEffect, useMemo } from 'react'
import { api } from '../api'

const s = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 28px',
    boxShadow: '0 1px 4px rgba(0,0,0,.08)',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#2d3748' },
  row: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' },
  group: { display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 160px', minWidth: 120 },
  label: { fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '.04em' },
  select: {
    padding: '10px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    background: '#fff',
    color: '#2d3748',
    outline: 'none',
    transition: 'border-color .15s',
  },
  input: {
    padding: '10px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    width: '100%',
  },
  btn: {
    padding: '10px 24px',
    background: '#3182ce',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
    transition: 'background .15s',
  },
  err: { marginTop: 8, color: '#e53e3e', fontSize: 13 },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: '#ebf8ff',
    color: '#2b6cb0',
    marginLeft: 8,
    verticalAlign: 'middle',
  },
}

export default function DongSelector({ onSearch, loading }) {
  const [dongList, setDongList]     = useState([])
  const [years, setYears]           = useState([])
  const [months, setMonths]         = useState([])
  const [guFilter, setGuFilter]     = useState('')
  const [admCd, setAdmCd]          = useState('')
  const [year, setYear]             = useState('')
  const [month, setMonth]           = useState('')
  const [initErr, setInitErr]       = useState('')

  useEffect(() => {
    Promise.all([api.getDongList(), api.getYearsMonths()])
      .then(([dongs, ym]) => {
        setDongList(dongs)
        const ys = ym.years || []
        const ms = ym.months || []
        setYears(ys)
        setMonths(ms)
        setYear(String(ys[ys.length - 1] || ''))
        setMonth(String(ms[ms.length - 1] || ''))
      })
      .catch(() => setInitErr('백엔드에 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.'))
  }, [])

  const guList = useMemo(
    () => [...new Set(dongList.map((d) => d.gu_nm))].sort(),
    [dongList],
  )
  const filteredDongs = useMemo(
    () => (guFilter ? dongList.filter((d) => d.gu_nm === guFilter) : dongList),
    [dongList, guFilter],
  )

  function handleSubmit(e) {
    e.preventDefault()
    if (!admCd || !year || !month) return
    onSearch({ adm_cd: admCd, year: Number(year), month: Number(month) })
  }

  const selectedDong = dongList.find((d) => d.adm_cd === admCd)

  return (
    <div style={s.card}>
      <div style={s.title}>
        Step 1 · 행정동 · 연월 선택
        {selectedDong && (
          <span style={s.badge}>{selectedDong.gu_nm} {selectedDong.adm_nm}</span>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={s.row}>
          <div style={s.group}>
            <label style={s.label}>자치구 필터</label>
            <select style={s.select} value={guFilter} onChange={(e) => { setGuFilter(e.target.value); setAdmCd('') }}>
              <option value=''>전체</option>
              {guList.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ ...s.group, flex: '2 1 220px' }}>
            <label style={s.label}>행정동</label>
            <select style={s.select} value={admCd} onChange={(e) => setAdmCd(e.target.value)} required>
              <option value=''>행정동 선택</option>
              {filteredDongs.map((d) => (
                <option key={d.adm_cd} value={d.adm_cd}>
                  {d.gu_nm} {d.adm_nm}
                </option>
              ))}
            </select>
          </div>

          <div style={s.group}>
            <label style={s.label}>연도</label>
            <select style={s.select} value={year} onChange={(e) => setYear(e.target.value)} required>
              <option value=''>연도</option>
              {years.map((y) => <option key={y} value={y}>{y}년</option>)}
            </select>
          </div>

          <div style={s.group}>
            <label style={s.label}>월</label>
            <select style={s.select} value={month} onChange={(e) => setMonth(e.target.value)} required>
              <option value=''>월</option>
              {months.map((m) => <option key={m} value={m}>{m}월</option>)}
            </select>
          </div>

          <button
            type='submit'
            style={{ ...s.btn, opacity: loading ? .6 : 1 }}
            disabled={loading || !admCd}
          >
            {loading ? '조회 중…' : '현황 조회'}
          </button>
        </div>
        {initErr && <div style={s.err}>{initErr}</div>}
      </form>
    </div>
  )
}
