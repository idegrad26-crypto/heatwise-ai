import { POLICY_VARIABLES } from './policyMeta'
import { simulateLST } from './mockSimulation'

/**
 * 그리디 누적 방식으로 최적 정책 조합 탐색
 *
 * 각 단계에서 "이 변수를 추가하면 추가로 얼마나 더 시원해지나?" 를 계산하여
 * 가장 큰 추가 효과를 주는 변수를 채택. 효과 미미 시 종료.
 *
 * @param features - 동의 현재 변수값 객체
 * @param baseLST - 베이스 LST
 * @param options.minImpact - 최소 추가 효과(°C). 이보다 작으면 추가 안 함 (기본 0.05)
 * @param options.maxSteps - 최대 단계 수 (기본 5)
 *
 * @returns {
 *   steps: [{ variable, deltaValue, adjustedValue, addedImpact, cumulativeDelta }],
 *   finalAdjustments: { 변수키: 조정값 },  // 슬라이더에 그대로 적용 가능
 *   finalDeltaLST: 누적 °C
 * }
 */
export function findOptimalCombination(features, baseLST, options = {}) {
  const minImpact = options.minImpact ?? 0.05
  const maxSteps = options.maxSteps ?? 5

  // 후보 = 현재값이 있는 변수만 (슬라이더로 조정 가능한 것)
  const candidates = POLICY_VARIABLES.filter((v) => features[v.key] != null)

  const used = new Set()
  const steps = []
  let cumulativeDelta = 0
  // 누적 조정값 (각 변수에 적용된 최종값)
  const cumulativeAdjustments = {}

  for (let step = 0; step < maxSteps; step++) {
    // 남은 변수들에 대해 "현재 상태에서 이 변수를 추천 상한까지 밀었을 때 추가 효과" 계산
    let bestVariable = null
    let bestImpact = 0
    let bestDeltaValue = 0
    let bestAdjustedValue = null

    candidates.forEach((variable) => {
      if (used.has(variable.key)) return
      const currentValue = features[variable.key]
      if (currentValue == null) return

      // 추천 상한값 또는 추천 하한값 (변수 방향에 따라)
      // direction이 'increase'면 currentValue + recommendedUpper 만큼 증가
      // direction이 'decrease'면 감소
      let targetValue
      let deltaValue
      if (variable.direction === 'increase') {
        targetValue = Math.min(variable.safeHigh, currentValue + variable.recommendedUpper)
        deltaValue = targetValue - currentValue
      } else {
        targetValue = Math.max(variable.safeLow, currentValue - Math.abs(variable.recommendedUpper))
        deltaValue = targetValue - currentValue
      }

      if (Math.abs(deltaValue) < variable.step / 2) return  // 효과 너무 작음

      // 누적 조정값 + 이 변수 시도값을 함께 시뮬레이션 → 추가 효과
      const trialDeltas = { ...cumulativeAdjustments, [variable.key]: deltaValue }
      const trialResult = simulateLST({ baseLST, adjustments: trialDeltas })
      const totalDelta = trialResult.deltaLST  // 음수면 시원해짐
      const addedImpact = totalDelta - cumulativeDelta  // 이 변수 추가로 얻은 추가 ΔLST

      // 시원해지는 방향 (음수)이 더 많이 떨어진 쪽이 "좋은" 것
      if (addedImpact < bestImpact) {
        bestImpact = addedImpact
        bestVariable = variable
        bestDeltaValue = deltaValue
        bestAdjustedValue = targetValue
      }
    })

    // 효과 미미 → 종료
    if (!bestVariable || Math.abs(bestImpact) < minImpact) break

    // 채택
    used.add(bestVariable.key)
    cumulativeAdjustments[bestVariable.key] = bestDeltaValue
    cumulativeDelta += bestImpact

    steps.push({
      variable: bestVariable,
      deltaValue: bestDeltaValue,
      adjustedValue: bestAdjustedValue,
      addedImpact: bestImpact,
      cumulativeDelta,
    })
  }

  // finalAdjustments: 변수키 → 슬라이더에 들어갈 절대값 (currentValue + delta)
  const finalAdjustments = {}
  steps.forEach((s) => {
    finalAdjustments[s.variable.key] = s.adjustedValue
  })

  return {
    steps,
    finalAdjustments,
    finalDeltaLST: cumulativeDelta,
  }
}