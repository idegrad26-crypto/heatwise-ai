/**
 * 정책 변수 메타데이터
 * - stat_cost_unit.csv 기반 + 임시 safe_low/safe_high (나중에 팀원 데이터로 교체)
 * - 임시 추천 상한 (recommended_upper_bound)도 포함 — 나중에 PDF 12p 표로 교체
 *
 * 향후 교체 포인트:
 * - safeLow/safeHigh: 팀원이 행정동·월별 q5/q95 테이블 주면 거기서 lookup
 * - recommendedUpperBound: 팀원이 월별 권장 상한값 주면 거기서 lookup
 */

export const POLICY_VARIABLES = [
    // ===== 녹지 패키지 =====
    {
        key: '녹지율',
        label: '녹지율',
        package: 'green',
        direction: 'increase',
        unit: '',
        step: 0.05,
        safeLow: 0.0,
        safeHigh: 2.5,
        recommendedUpper: 0.4,
        costPerArea: 150000,        // 가로공원 조성 단가/㎡
        appliesToArea: true,
        csvKey: 'green_ratio',
        description: '단위 면적당 녹지 비율. 가로공원·소공원·녹지대 등 포함. 증발산 효과로 LST 낮춤.',
      },
    {
      key: '총_가로수_개수',
      label: '가로수 개수',
      package: 'green',
      direction: 'increase',
      unit: '본',
      step: 10,
      safeLow: 0,
      safeHigh: 6911,
      recommendedUpper: 1000,
      costPerStep: 10000000,
      csvKey: 'street_tree_count',
      description: '행정동 내 가로수 총 개수. 그늘 + 증산작용으로 도시 열섬 완화.',
    },
    {
      key: '누적_조성면적합계(m^2)',
      label: '옥상녹화 면적',
      package: 'green',
      direction: 'increase',
      unit: '㎡',
      step: 500,
      safeLow: 0,
      safeHigh: 100000,
      recommendedUpper: 3000,
      costPerStep: 61500000,
      csvKey: 'roof_green_area',
      description: '누적 옥상녹화 조성 면적. 건물 표면 온도 직접 저감.',
    },
  
    // ===== 도시계획(건축·포장) 패키지 =====
    {
        key: 'Albedo',
        label: '반사율 (Albedo)',
        package: 'surface',
        direction: 'increase',
        unit: '',
        step: 0.02,
        safeLow: 0.05,
        safeHigh: 0.97,
        recommendedUpper: 0.30,
        costPerArea: 25000,        // 쿨루프 도색 단가/㎡
        appliesToArea: true,        // 시행 면적 영향을 받는 변수
        csvKey: 'Albedo',
        description: '지표면이 햇빛을 반사하는 비율. 0~1. 높을수록 흡수 적어 시원해짐. 쿨루프 도색이 대표 사업.',
      },
    {
      key: '용적률_행정동별',
      label: '용적률',
      package: 'surface',
      direction: 'decrease',
      unit: '%p',
      step: 20,
      safeLow: 0,
      safeHigh: 500,
      recommendedUpper: 0,
      costPerStep: 4440000000,
      csvKey: 'floor_area_ratio',
    },
  
    // ===== 폭염 저감 패키지 =====
    {
      key: '그늘막 개수',
      label: '그늘막 개수',
      package: 'facility',
      direction: 'increase',
      unit: '개',
      step: 1,
      safeLow: 0,
      safeHigh: 41,
      recommendedUpper: 3,
      costPerStep: 8500000,
      csvKey: 'shade_count',
      description: '폭염 대비 인공 그늘막. 보행자 체감온도에 즉각 효과.',
    },
  
    // ===== 에너지 패키지 =====
    {
      key: '에너지사용량_전기',
      label: '전기 사용량',
      package: 'energy',
      direction: 'decrease',
      unit: 'kWh',
      step: 100,
      safeLow: 0,
      safeHigh: 100000,
      recommendedUpper: 7500,
      costPerStep: 30000,
      csvKey: 'energy_elec',
    },
    {
      key: '에너지사용량_가스',
      label: '가스 사용량',
      package: 'energy',
      direction: 'decrease',
      unit: 'MJ',
      step: 50,
      safeLow: 0,
      safeHigh: 5000,
      recommendedUpper: 400,
      costPerStep: 30000,
      csvKey: 'energy_gas',
    },
  
    // ===== 교통량 관리 패키지 =====
    {
      key: '차량밀도',
      label: '차량밀도',
      package: 'mobility',
      direction: 'decrease',
      unit: '대/㎢',
      step: 100,
      safeLow: 0,
      safeHigh: 50000,
      recommendedUpper: 1000,
      costPerStep: 21071793,
      csvKey: 'vehicle_density',
    },
  
    // ===== 도시 생활환경(인구구조) 패키지 =====
    {
      key: '인구밀도',
      label: '인구밀도',
      package: 'urban_structure',
      direction: 'decrease',
      unit: '명/㎢',
      step: 500,
      safeLow: 0,
      safeHigh: 100000,
      recommendedUpper: 7500,
      costPerStep: 7212790716,
      csvKey: 'population_density',
    },
  ]
  
  // 패키지 메타데이터
  export const PACKAGES = [
    { id: 'green', label: '녹지', icon: '🌳' },
    { id: 'surface', label: '건축·포장', icon: '🏢' },
    { id: 'facility', label: '폭염 저감', icon: '⛱️' },
    { id: 'energy', label: '에너지', icon: '⚡' },
    { id: 'mobility', label: '교통', icon: '🚗' },
    { id: 'urban_structure', label: '도시구조', icon: '🏘️' },
  ]
  
  // 패키지별로 변수 묶어서 가져오기
  export function getVariablesByPackage(packageId) {
    return POLICY_VARIABLES.filter((v) => v.package === packageId)
  }
  
  // 키로 변수 찾기
  export function findVariable(key) {
    return POLICY_VARIABLES.find((v) => v.key === key)
  }