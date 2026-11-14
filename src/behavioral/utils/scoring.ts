import { FACTOR_METADATA, PART_A_TRAIT_ITEMS } from '../data/assessmentData';
import {
  AssessmentStatus,
  BaselineMetrics,
  BigFiveFactor,
  FactorBand,
  FactorResult,
  PartAAnswers,
  PartAResult,
  PartBEntry,
  ScoredDay,
} from '../types/assessment';

const round1 = (n: number): number => Math.round(n * 10) / 10;

export function getFactorBand(mean: number): { band: FactorBand; meaning: string } {
  if (mean <= 2.5) return { band: 'Low', meaning: 'Trait rarely expressed' };
  if (mean <= 4.4) return { band: 'Average', meaning: 'Typical range' };
  if (mean <= 5.9) return { band: 'High', meaning: 'Trait prominent' };
  return { band: 'Very high', meaning: 'Trait dominant, may be rigid' };
}

export function scorePartA(answers: PartAAnswers): PartAResult {
  const factorOrder: BigFiveFactor[] = ['N', 'E', 'O', 'A', 'C'];
  let allTraitsAnswered = true;

  const factors: FactorResult[] = factorOrder.map((factor) => {
    const items = PART_A_TRAIT_ITEMS.filter((item) => item.factor === factor);
    let sum = 0;

    for (const item of items) {
      const raw = answers.traits[item.id];
      if (!raw || raw < 1 || raw > 7) {
        allTraitsAnswered = false;
        sum += 4;
      } else {
        const scored = item.reversed ? 8 - raw : raw;
        sum += scored;
      }
    }

    const mean = round1(sum / 5);
    const { band, meaning } = getFactorBand(mean);

    return {
      factor,
      label: FACTOR_METADATA[factor].name,
      rawSum: sum,
      mean,
      band,
      bandMeaning: meaning,
      contextNote: FACTOR_METADATA[factor].contextNote,
    };
  });

  const sdValues = [26, 27, 28, 29, 30].map((id) => answers.socialDesirability[id]);
  const socialDesirabilityAnswered = sdValues.filter((v) => v !== null && v !== undefined).length;
  const socialDesirabilityScore = sdValues.filter((v) => v === true).length;
  const isContaminated = socialDesirabilityScore >= 3;

  const parsedDays = Number(answers.iceDays);
  const auto25Plus = !Number.isNaN(parsedDays) && parsedDays >= 25;
  const iceEvidenceScore =
    (answers.iceEvidence.confined25Plus || auto25Plus ? 1 : 0) +
    (answers.iceEvidence.concreteCoping ? 1 : 0) +
    (answers.iceEvidence.honestConflict ? 1 : 0);

  let iceSummaryLabel = '0/3 — No prior ICE evidence recorded (a blank, not a bad sign)';
  if (iceEvidenceScore === 3) {
    iceSummaryLabel = '3/3 — Strong predictor on record';
  } else if (iceEvidenceScore > 0) {
    iceSummaryLabel = `${iceEvidenceScore}/3 — Partial prior confinement evidence`;
  }

  return {
    factors,
    socialDesirabilityScore,
    socialDesirabilityAnswered,
    isContaminated,
    iceEvidenceScore,
    iceSummaryLabel,
    isComplete: allTraitsAnswered && socialDesirabilityAnswered === 5,
  };
}

export function computeBaseline(entries: PartBEntry[]): BaselineMetrics {
  const sorted = [...entries].sort((a, b) => a.day - b.day);
  const baselineEntries = sorted.filter((e) => e.day >= 1 && e.day <= 7);
  const sample = baselineEntries.length > 0 ? baselineEntries : sorted.slice(0, 7);

  if (sample.length === 0) {
    return {
      negativeMean: 4.5,
      positiveMean: 12.0,
      daysUsed: 0,
      isCalibrated: false,
    };
  }

  const negSum = sample.reduce(
    (acc, e) => acc + (e.mood[1] || 1) + (e.mood[2] || 1) + (e.mood[3] || 1),
    0
  );
  const posSum = sample.reduce(
    (acc, e) => acc + (e.mood[4] || 3) + (e.mood[5] || 3) + (e.mood[6] || 3),
    0
  );

  return {
    negativeMean: round1(negSum / sample.length),
    positiveMean: round1(posSum / sample.length),
    daysUsed: sample.length,
    isCalibrated: sample.length >= 7,
  };
}

function synthesizeB3Hypothesis(
  before: string | null,
  behaviours: string[],
  after: string | null
): string | null {
  const activeBehaviours = behaviours.filter((b) => b !== 'none of these');
  if (!before && activeBehaviours.length === 0 && !after) return null;

  const bText = activeBehaviours.length > 0 ? activeBehaviours[0].toLowerCase() : 'distress response';

  if (after === 'task removed' || after === 'someone stepped in') {
    return `${bText} is being reinforced by task relief — adjust workload antecedent rather than the person.`;
  }
  if (after === 'conflict avoided') {
    return `${bText} is serving short-term conflict avoidance — schedule structured low-stakes check-in.`;
  }
  if (after === 'attention') {
    return `${bText} is eliciting crew check-ins — establish predictable proactive social contact.`;
  }
  if (after === 'nothing changed') {
    return `${bText} occurred without relief following ${before ?? 'the trigger'} — monitor cumulative fatigue.`;
  }
  return `Antecedent (${before ?? 'unspecified'}) linked to ${bText}.`;
}

export function scoreMissionEntries(
  entries: PartBEntry[],
  partAResult: PartAResult
): { baseline: BaselineMetrics; scoredDays: ScoredDay[] } {
  const sorted = [...entries].sort((a, b) => a.day - b.day);
  const baseline = computeBaseline(sorted);

  let consecutiveDriftCount = 0;

  const scoredDays: ScoredDay[] = sorted.map((entry) => {
    const negativeScore = (entry.mood[1] || 1) + (entry.mood[2] || 1) + (entry.mood[3] || 1);
    const positiveScore = (entry.mood[4] || 3) + (entry.mood[5] || 3) + (entry.mood[6] || 3);

    const negDeviation = round1(negativeScore - baseline.negativeMean);
    const posDeviation = round1(positiveScore - baseline.positiveMean);

    const rawDebt = round1(7 - entry.hoursSlept);
    const sleepDebt = rawDebt > 0 ? rawDebt : 0;
    const sleepSurplus = rawDebt < 0 ? round1(Math.abs(rawDebt)) : 0;

    const loadIndex = round1(entry.workload * (1 + sleepDebt / 7));
    let loadTier: ScoredDay['loadTier'] = 'low';
    if (loadIndex >= 5.5) loadTier = 'critical';
    else if (loadIndex >= 4.2) loadTier = 'high';
    else if (loadIndex >= 2.8) loadTier = 'moderate';

    const b3Triggered = negativeScore >= 9;
    const activeBehaviours = entry.b3.behaviours.filter((b) => b !== 'none of these');
    const hasSubstantiveB3 =
      b3Triggered &&
      Boolean(entry.b3.before || activeBehaviours.length > 0 || entry.b3.after);

    const b3Hypothesis = b3Triggered
      ? synthesizeB3Hypothesis(entry.b3.before, entry.b3.behaviours, entry.b3.after)
      : null;

    const hasWatchDeviation = negDeviation >= 2 || posDeviation <= -2;
    if (hasWatchDeviation) {
      consecutiveDriftCount += 1;
    } else {
      consecutiveDriftCount = 0;
    }

    let status: AssessmentStatus = 'On track';
    let flagAction = 'No action required.';
    let interpretationText = 'Within your normal range. Nothing to do.';

    const isAlert = negativeScore >= 12 || positiveScore <= 6 || hasSubstantiveB3;
    const isDrift = consecutiveDriftCount >= 3;
    const isWatch = hasWatchDeviation;

    if (isAlert) {
      status = 'Alert';
      flagAction = 'Private Psychological Conference within 24 h';
      interpretationText =
        "Today's scores are meaningfully off. Someone will reach out within 24 hours.";
    } else if (isDrift) {
      status = 'Drift';
      flagAction = 'Private Psychological Conference within 48 h';
      interpretationText =
        'Three days below your baseline. This is worth a conversation, not a concern about your performance. Talk to the psych team within 48 hours.';
    } else if (isWatch) {
      status = 'Watch';
      flagAction = 'Nothing. Note it.';
      interpretationText = 'One rough day, which is normal. No action.';
    }

    // Divergence Rule: self-report appears fine/coping while crew observes withdrawn/irritable
    const selfSaysFine = negativeScore < 9 && positiveScore >= 9;
    const selfReportLabel = selfSaysFine ? 'coping' : 'strained';
    const crewSuggestsDistress =
      entry.crewObservation === 'Withdrawn' || entry.crewObservation === 'Irritable';
    const isDiscordant = selfSaysFine && crewSuggestsDistress;

    const recommendedActions: string[] = [];
    if (status === 'Alert') {
      recommendedActions.push('Psych conference ≤ 24 h');
    } else if (status === 'Drift') {
      recommendedActions.push('Psych conference ≤ 48 h');
    }

    if (loadTier === 'high' || loadTier === 'critical') {
      recommendedActions.push("Reduce tomorrow's task load one tier");
    }
    if (sleepDebt >= 1.0) {
      recommendedActions.push('Protect sleep window — non-negotiable');
    }
    if (b3Hypothesis) {
      recommendedActions.push(`Pattern note: ${b3Hypothesis}`);
    }
    if (isDiscordant) {
      recommendedActions.push(
        'Bring discordant self-report vs. crew rating directly to conference — do not average'
      );
    }
    if (partAResult.isContaminated) {
      recommendedActions.push(
        'Part A social desirability ≥ 3: treat baseline trait scores as inflated; rely on Part B trend only'
      );
    }
    if (recommendedActions.length === 0) {
      recommendedActions.push('Maintain current cadence and sleep schedule');
    }

    return {
      day: entry.day,
      dateLabel: entry.dateLabel,
      negativeScore,
      positiveScore,
      negDeviation,
      posDeviation,
      hoursSlept: entry.hoursSlept,
      sleepDebt,
      sleepSurplus,
      sleepQuality: entry.sleepQuality,
      workload: entry.workload,
      notableEvent: entry.notableEvent,
      loadIndex,
      loadTier,
      b3Triggered,
      hasSubstantiveB3,
      b3: entry.b3,
      b3Hypothesis,
      status,
      consecutiveDriftDays: consecutiveDriftCount,
      flagAction,
      interpretationText,
      selfReportLabel,
      crewObservation: entry.crewObservation,
      isDiscordant,
      recommendedActions,
      note: entry.note,
    };
  });

  return { baseline, scoredDays };
}

export function formatPlainTextReport(
  day: ScoredDay,
  baseline: BaselineMetrics,
  partAResult: PartAResult
): string {
  const statusTag =
    day.status === 'Alert'
      ? '■ ALERT'
      : day.status === 'Drift'
        ? `◆ DRIFT — ${day.consecutiveDriftDays} consecutive days`
        : day.status === 'Watch'
          ? '▲ WATCH — 1-day shift'
          : '● ON TRACK';

  const negSign = day.negDeviation >= 0 ? `+${day.negDeviation.toFixed(1)}` : day.negDeviation.toFixed(1);
  const posSign = day.posDeviation >= 0 ? `+${day.posDeviation.toFixed(1)}` : day.posDeviation.toFixed(1);

  const lines = [
    `─── BEHAVIOURAL CHECK · DAY ${day.day} ─────────────────────────`,
    '',
    `  STATUS              ${statusTag}`,
    partAResult.isContaminated
      ? '  PART A FLAG         ○ CONTAMINATED (Social Desirability ≥ 3 — trust Part B only)'
      : '',
    '',
    '  MOOD (3–15 scale)',
    `    Negative   ${day.negativeScore}/15   dev ${negSign}   (baseline ${baseline.negativeMean.toFixed(1)})`,
    `    Positive   ${day.positiveScore}/15   dev ${posSign}   (baseline ${baseline.positiveMean.toFixed(1)})`,
    '',
    '  LOAD',
    `    Sleep      ${day.hoursSlept.toFixed(1)} h   ${day.sleepDebt > 0 ? `debt ${day.sleepDebt.toFixed(1)} h` : `surplus +${day.sleepSurplus.toFixed(1)} h`}`,
    `    Workload   ${day.workload}/5     Load index ${day.loadIndex.toFixed(1)} (${day.loadTier})`,
    '',
  ];

  if (day.b3Triggered) {
    lines.push('  PATTERN (from B3)');
    lines.push(`    Before     ${day.b3.before ?? '—'}`);
    lines.push(
      `    Behaviour  ${day.b3.behaviours.length > 0 ? day.b3.behaviours.join(', ') : '—'}`
    );
    lines.push(`    After      ${day.b3.after ?? '—'}`);
    if (day.b3Hypothesis) {
      lines.push(`    → hypothesis: ${day.b3Hypothesis}`);
    }
    lines.push('');
  }

  lines.push('  CONVERGENCE');
  lines.push(`    Self-report  "${day.selfReportLabel}"        Crew rating  "${day.crewObservation.toLowerCase()}"`);
  lines.push(
    day.isDiscordant
      ? '    ⚠ DISCORDANT — treat as a finding, not an error.'
      : '    ✓ CONCORDANT'
  );
  lines.push('');
  lines.push('  RECOMMENDED');
  day.recommendedActions.forEach((act, idx) => {
    lines.push(`    ${idx + 1}. ${act}`);
  });
  lines.push('');
  lines.push('  THIS IS A SCREEN, NOT A DIAGNOSIS.');
  lines.push('───────────────────────────────────────────────────────────');

  return lines.filter((l) => l !== undefined).join('\n');
}
