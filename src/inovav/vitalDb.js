// IndexedDB Service for VITAL Human Systems Observatory NASA Baselines & Telemetry Logs

const DB_NAME = 'VitalObservatoryDB';
const DB_VERSION = 1;

const DEFAULT_BASELINES = {
  cardiovascular: {
    id: 'cardiovascular',
    systemNumber: '01',
    name: 'Cardiovascular Health Monitoring',
    shortName: 'Cardiovascular',
    organLabel: 'Heart & Arteries',
    currentVitals: {
      heartRate: 72,
      bloodPressure: '118/76',
      cardiacOutput: 4.8,
      spo2: 99.4,
    },
    baselineRanges: {
      heartRate: { min: 60, max: 82, baseline: 72, unit: 'bpm' },
      bloodPressure: { sysMin: 110, sysMax: 125, diaMin: 70, diaMax: 82, baseline: '118/76', unit: 'mmHg' },
      cardiacOutput: { min: 4.4, max: 5.6, baseline: 4.8, unit: 'L/min' },
    },
    nominalAnalysis:
      'Cardiac output and arterial pressure remain nominal under microgravity fluid shift; resting rhythm is stable at 72 bpm.',
    subAnalysis:
      'Cephalad fluid redistribution is counteracted by normal systemic vascular resistance. Lead-II sinus rhythm is intact.',
    recommendations: [
      { id: 'rec-1', title: 'Targeted Hydration', desc: 'Hydration intake target: 2.8 L/day with oral electrolyte replenishment salts.' },
      { id: 'rec-2', title: 'Resistive Exercise', desc: '45-minute continuous aerobic/resistive ergometer session at 70% VO2 max.' },
      { id: 'rec-3', title: 'Autonomic Cadence', desc: 'Execute 4-4-6 pacing cycle to stabilize baroreflex sensitivity.' },
    ],
  },
  metabolic: {
    id: 'metabolic',
    systemNumber: '02',
    name: 'Metabolic Health Monitoring',
    shortName: 'Metabolic',
    organLabel: 'Liver & Pancreas',
    currentVitals: {
      bloodSugar: 94,
      ketones: 0.3,
      metabolicRate: 1920,
      insulinSensitivity: 'Optimal',
    },
    baselineRanges: {
      bloodSugar: { min: 80, max: 110, baseline: 94, unit: 'mg/dL' },
      ketones: { min: 0.1, max: 0.5, baseline: 0.3, unit: 'mmol/L' },
      metabolicRate: { min: 1800, max: 2100, baseline: 1920, unit: 'kcal/day' },
    },
    nominalAnalysis:
      'Hepatic glycogenolysis and insulin sensitivity are balanced. Zero-G nutrient absorption rate is within nominal parameters.',
    subAnalysis:
      'Pancreatic beta-cell response is prompt. No signs of insulin resistance or sub-clinical ketosis observed.',
    recommendations: [
      { id: 'rec-1', title: 'Glycemic Balance', desc: 'Consume low-GI orbital nutrient rations with complex slow-release carbohydrates.' },
      { id: 'rec-2', title: 'Metabolic Flush', desc: 'Drink 500 mL warm electrolyte fluid 20 minutes post-caloric intake.' },
      { id: 'rec-3', title: 'Digestive Mobility', desc: 'Perform 10-minute abdominal core decompression stretches in microgravity.' },
    ],
  },
  thermal: {
    id: 'thermal',
    systemNumber: '03',
    name: 'Thermal Regulation Monitoring',
    shortName: 'Thermal Regulation',
    organLabel: 'Skin & Thermal Aura',
    currentVitals: {
      coreTemp: 36.8,
      skinTemp: 33.4,
      sweatRate: 0.12,
      thermalComfortIndex: 'Neutral (0.0)',
    },
    baselineRanges: {
      coreTemp: { min: 36.4, max: 37.3, baseline: 36.8, unit: '°C' },
      skinTemp: { min: 32.2, max: 34.6, baseline: 33.4, unit: '°C' },
      sweatRate: { min: 0.08, max: 0.25, baseline: 0.12, unit: 'L/hr' },
    },
    nominalAnalysis:
      'Core thermoregulation optimal. Liquid cooling garment (LCG) loop maintaining skin surface gradient within 1.2°C tolerance.',
    subAnalysis:
      'Vasomotor peripheral tone is balanced. Full-body infrared thermal aura indicates symmetric bilateral heat dispersion.',
    recommendations: [
      { id: 'rec-1', title: 'Cooling Loop Setting', desc: 'Keep suit Liquid Cooling Garment (LCG) flow rate at Medium (0.8 L/min).' },
      { id: 'rec-2', title: 'Habitat Atmosphere', desc: 'Verify cabin environmental thermal control is stabilized at 21.5°C / 42% RH.' },
      { id: 'rec-3', title: 'Extremity Dissipation', desc: 'Check boot and glove thermal conduits for moisture accumulation.' },
    ],
  },
  circadian: {
    id: 'circadian',
    systemNumber: '04',
    name: 'Circadian & Sleep Monitoring',
    shortName: 'Circadian & Sleep',
    organLabel: 'Pineal Gland & Epiphysis',
    currentVitals: {
      sleepDuration: 7.8,
      remPercentage: 24,
      melatoninSuppression: 12,
      sleepEfficiency: 92,
    },
    baselineRanges: {
      sleepDuration: { min: 7.0, max: 8.5, baseline: 7.8, unit: 'hrs' },
      remPercentage: { min: 20, max: 28, baseline: 24, unit: '%' },
      melatoninSuppression: { min: 5, max: 15, baseline: 12, unit: '%' },
    },
    nominalAnalysis:
      'Circadian rhythm locked to 24-hour ISS/Orion lighting schedule. Melatonin release phase-shift is minimal.',
    subAnalysis:
      'Suprachiasmatic nucleus activity exhibits strong entrainment. REM and slow-wave sleep cycles show high restorative index.',
    recommendations: [
      { id: 'rec-1', title: 'Spectrum Cutoff', desc: 'Shift crew quarters illumination to 480nm amber cutoff at T-60min to sleep window.' },
      { id: 'rec-2', title: 'Acoustic Barrier', desc: 'Deploy noise-cancelling active acoustic baffles in private sleep pod.' },
      { id: 'rec-3', title: 'Phase Entrainment', desc: 'Perform 10-minute progressive somatic relaxation before latching sleep restraint.' },
    ],
  },
  neurological: {
    id: 'neurological',
    systemNumber: '05',
    name: 'Neurological & Mood Monitoring',
    shortName: 'Neurological & Mood',
    organLabel: 'Cerebral Cortex & Cranium',
    currentVitals: {
      cognitiveStability: 98.4,
      alphaWaveRatio: 1.42,
      stressIndex: 14,
      reactionLatency: 198,
    },
    baselineRanges: {
      cognitiveStability: { min: 95.0, max: 100.0, baseline: 98.4, unit: '%' },
      alphaWaveRatio: { min: 1.2, max: 1.7, baseline: 1.42, unit: 'index' },
      stressIndex: { min: 5, max: 20, baseline: 14, unit: '%' },
    },
    nominalAnalysis:
      'Frontal cortex executive functioning and spatial orientation reflexes are fully adapted to zero-gravity sensory conflict.',
    subAnalysis:
      'Alpha/theta synchronization confirms alert calmness. No neuro-vestibular space motion sickness (SMS) biomarkers present.',
    recommendations: [
      { id: 'rec-1', title: 'Cognitive Calibration', desc: 'Complete daily orbital spatial trajectory and docking reaction drill.' },
      { id: 'rec-2', title: 'Earth Viewing Window', desc: 'Spend 15 minutes of unstructured viewing at the cupola observation port.' },
      { id: 'rec-3', title: 'Sensory Decompression', desc: 'Listen to binaural acoustic soundscapes during EVA rest transition.' },
    ],
  },
};

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('nasa_baselines')) {
        const baselineStore = db.createObjectStore('nasa_baselines', { keyPath: 'id' });
        Object.values(DEFAULT_BASELINES).forEach((item) => {
          baselineStore.add(item);
        });
      }
      if (!db.objectStoreNames.contains('checkup_logs')) {
        db.createObjectStore('checkup_logs', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getSystemBaseline(systemId) {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction('nasa_baselines', 'readonly');
      const store = tx.objectStore('nasa_baselines');
      const req = store.get(systemId);
      req.onsuccess = () => resolve(req.result || DEFAULT_BASELINES[systemId]);
      req.onerror = () => resolve(DEFAULT_BASELINES[systemId]);
    });
  } catch (err) {
    console.warn('IndexedDB fallback to memory:', err);
    return DEFAULT_BASELINES[systemId];
  }
}

export async function getAllBaselines() {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction('nasa_baselines', 'readonly');
      const store = tx.objectStore('nasa_baselines');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result && req.result.length ? req.result : Object.values(DEFAULT_BASELINES));
      req.onerror = () => resolve(Object.values(DEFAULT_BASELINES));
    });
  } catch (err) {
    return Object.values(DEFAULT_BASELINES);
  }
}

export async function logCheckup(record) {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction('checkup_logs', 'readwrite');
      const store = tx.objectStore('checkup_logs');
      const req = store.add({
        ...record,
        timestamp: new Date().toISOString(),
      });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB write error:', err);
    return null;
  }
}

export { DEFAULT_BASELINES };

