/**
 * GeoJSON ↔ CSV 매핑 (adm_cd8 직접 매칭 방식)
 *
 * GeoJSON properties:
 *   - adm_cd8: '11010530' (8자리, CSV의 ADM_CD와 일치)
 *   - sggnm: '종로구'
 *   - adm_nm: '서울특별시 종로구 사직동'
 *   - sidonm: '서울특별시'
 */

/**
 * GeoJSON feature → 매칭 키 (8자리 코드)
 */
export function getMatchKey(feature) {
    const props = feature.properties || {}
    return props.adm_cd8 || null
  }

  /**
   * 자치구 이름
   */
  export function getGuName(feature) {
    return feature.properties?.sggnm || ''
  }

  /**
   * 동 이름만 추출 ('서울특별시 종로구 사직동' → '사직동')
   */
  export function getDongName(feature) {
    const props = feature.properties || {}
    if (props.adm_nm) {
      const parts = props.adm_nm.split(' ')
      return parts[parts.length - 1]
    }
    return ''
  }

  /**
   * 서울 외 행정동 필터링
   */
  export function isSeoul(feature) {
    return feature.properties?.sidonm === '서울특별시'
  }

  /**
   * adm_cd8 키 → 표시용 이름 (동만)
   * App에서 selectedDong은 코드(예: '11010530')가 됨
   */
  export function keyToDongName(key, lookupTable) {
    if (!key) return ''
    return lookupTable?.[key]?.dongName || key
  }

  export function keyToGuName(key, lookupTable) {
    if (!key) return ''
    return lookupTable?.[key]?.guName || ''
  }

  export function keyToDisplayName(key, lookupTable) {
    if (!key) return ''
    const info = lookupTable?.[key]
    if (info) return `${info.guName} ${info.dongName}`
    return key
  }
