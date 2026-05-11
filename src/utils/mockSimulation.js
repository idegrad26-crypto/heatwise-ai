/**
 * 가짜 LST 예측 함수
 *
 * ⚠️ 이 파일은 임시 모킹입니다. 향후 팀원의 모델 API로 교체할 예정.
 *
 * 인터페이스:
 *   입력: { dongName, year, month, baseLST, adjustments }
 *     - adjustments: { 'Albedo': 0.04, '녹지율': 0.1, ... } 형태의 변화량(Δ)
 *   출력: { predictedLST, deltaLST, uncertainty }
 *
 * 가짜 계산 방식:
 *   각 변수마다 임시 LST 영향 계수를 정의 → adjustments * 계수의 합으로 ΔLST 계산
 *   실제 모델과 부호/크기는 비슷하게 맞춰둠 (Albedo 증가→온도↓, 녹지율↑→온도↓ 등)
 */

// 변수별 임시 영향 계수 (단위 변화량당 ΔLST in °C)
// 부호: 음수면 LST를 낮추는 방향
const MOCK_COEFFICIENTS = {
    Albedo: -15,                      // +0.1 변화시 -1.5°C
    '녹지율': -3.5,                    // +1.0 변화시 -3.5°C
    '총_가로수_개수': -0.0008,         // +1000본 시 -0.8°C
    '누적_조성면적합계(m^2)': -0.00015, // +5000㎡ 시 -0.75°C
    '그늘막 개수': -0.05,              // +10개 시 -0.5°C
    '에너지사용량_전기': 0.00005,      // -1000 감축 시 -0.05°C
    '에너지사용량_가스': 0.0008,
    '차량밀도': 0.00008,
    '인구밀도': 0.00003,
    '용적률_행정동별': 0.005,           // -20%p 시 -0.1°C
  }
  
  export function simulateLST({ baseLST, adjustments = {} }) {
    if (baseLST == null) {
      return { predictedLST: null, deltaLST: 0, uncertainty: 0.4 }
    }
  
    let deltaLST = 0
    Object.entries(adjustments).forEach(([key, deltaValue]) => {
      const coef = MOCK_COEFFICIENTS[key]
      if (coef != null && deltaValue != null) {
        deltaLST += coef * deltaValue
      }
    })
  
    // 비현실적으로 많이 떨어지지 않게 한도 (-10°C 까지만)
    if (deltaLST < -10) deltaLST = -10
    if (deltaLST > 5) deltaLST = 5
  
    const predictedLST = baseLST + deltaLST
  
    return {
      predictedLST,
      deltaLST,
      uncertainty: 0.4, // 임시 ±0.4°C
    }
  }
  
  /**
   * 변수 하나의 단독 영향만 빠르게 계산 (STEP3 효율 비교용)
   */
  export function simulateSingleVariable(variableKey, deltaValue, baseLST) {
    return simulateLST({
      baseLST,
      adjustments: { [variableKey]: deltaValue },
    })
  }