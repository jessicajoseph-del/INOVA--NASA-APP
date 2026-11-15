/**
 * ASTRI (Autonomous Space Telemetry & Reconnaissance Intelligence)
 * Advanced Gemini AI & Onboard Deep-Space Flight Intelligence Service
 * for RIDGE ISS & Artemis Astronaut Crew
 */

export interface AstriMessage {
  id: string;
  sender: 'user' | 'astri';
  text: string;
  timestamp: string;
  telemetryRef?: string;
  isStreaming?: boolean;
}

const DEFAULT_SYSTEM_INSTRUCTION = `You are ASTRI (Autonomous Space Telemetry & Reconnaissance Intelligence), the advanced onboard AI flight companion and bio-medical intelligence assistant for the RIDGE astronaut crew aboard the International Space Station and Artemis deep-space missions.

Your core mission directives:
1. Provide precise, authoritative, and calm spaceflight guidance.
2. Monitor and interpret real-time astronaut telemetry (heart rate variability, oxygen reserves, suit pressure seal at 4.3 psi, metabolic load, zero-g bone density countermeasures).
3. Coordinate the astronaut's daily flight roadmap and mission schedule (urine bio-tests, i-STAT blood panels, ARED resistance workouts, T2 treadmill runs, station wet clean, ODF medical checklists).
4. Assist with station operations, orbital mechanics (Hohmann transfers, solar beta angles), and Houston CAPCOM comms.
5. Provide psychological support, mindfulness, and calm cognitive balance during high-stress EVA operations.

Communication tone:
- Professional, supportive, analytical yet warm (like a reliable flight director combined with a zero-g medical officer).
- Use concise bullet points for actionable operational procedures.
- When referencing biometric health, remind the crew that telemetry parameters are within nominal safety bounds.
- Keep responses engaging, space-accurate, and well-structured.`;

// Comprehensive onboard spaceflight knowledge bank for offline / zero-latency operations
const ONBOARD_AUTONOMOUS_RESPONSES: Record<string, string> = {
  greeting: `**ASTRI Onboard Flight Intelligence // Systems Online:**
Greetings, Commander! ASTRI is active and fully synchronized with your suit telemetry.

• **Orbital Status:** 408 km circular orbit, 51.6° inclination, 27,600 km/h ground speed.
• **Bio-Telemetry:** Channels 01–16 nominal (HR: 72 BPM, SpO₂: 99%, Core Temp: 36.8°C).
• **Cabin Environment:** 14.7 psi (78% N₂, 21% O₂), CO₂ scrubber at 12% saturation.

How can I assist your flight operations or physiological monitoring right now?`,

  identity: `**ASTRI Mission Dossier // Autonomous Space Intelligence:**
I am **ASTRI** (*Autonomous Space Telemetry & Reconnaissance Intelligence*), your zero-G AI flight director and bio-medical companion engineered for the RIDGE astronaut program.

• **Core Engine:** Dual-mode architecture (Google Gemini 1.5/2.0 API neural reasoning + Onboard Autonomous Space Intelligence).
• **Directives:** Real-time biometric surveillance, EVA suit pressure seal verification, flight roadmap orchestration, and orbital telemetry navigation.
• **Houston Ground Link:** Optical laser comm link verified with Johnson Space Center CAPCOM.

Feel free to ask me anything regarding your biometrics, daily tasks, EVA operations, or station status!`,

  capabilities: `**ASTRI Core Capabilities & Command Menu:**
You can command or query me across any of the following operational domains:

1. **Biometric & Vital Health:** "Analyze my heart rate", "Check blood pressure", "i-STAT blood panel", "Hydration osmolarity".
2. **Life Support & EVA Suits:** "Check oxygen reserve", "Suit 4.3 psi seal", "LiOH CO₂ scrubber status".
3. **Daily Mission Roadmap:** "What is my task schedule?", "When is my ARED workout?", "Wet clean maintenance".
4. **Orbital Mechanics & ISS Systems:** "Station altitude & speed", "Solar array alignment", "Next downlink pass".
5. **Psychological & Behavioral Wellness:** "I feel stressed / need to relax", "Zero-G breathing guide", "Circadian sleep tips".
6. **RIDGE Application Tools:** "How to use 3D Face Visor", "Touchless AR HUD", "3D ISS Digital Twin".`,

  heart: `**ASTRI Telemetry Analysis // Cardiovascular Diagnostics:**
• **Current Heart Rate:** **72 BPM** (Baseline resting range: 60–80 BPM)
• **Heart Rate Variability (HRV):** **68 ms** (Optimal autonomic nervous balance)
• **Cardiac Output:** **5.2 L/min** under microgravity cephalad fluid-shift equilibrium
• **Sinus Rhythm:** **100% Stable** — zero arrhythmias or premature ventricular contractions recorded.

*Recommendation:* Maintain scheduled 07:00 ARED resistance session and stay hydrated with 500 mL electrolytic fluid prior to EVA egress.`,

  bloodPressure: `**ASTRI Hemodynamic Audit // Arterial Pressure:**
• **Current BP:** **118 / 76 mmHg** (Mean Arterial Pressure: 90 mmHg)
• **Cephalad Fluid Shift:** Normal adaptation — internal jugular vein diameter within expected zero-G range.
• **Orthostatic Countermeasures:** Lower-body negative pressure (LBNP) garment calibrated and on standby.

All cardiovascular pressure indices remain within optimal green-zone parameters.`,

  bloodTest: `**ASTRI Bio-Specimen Terminal // i-STAT Blood Gas Analysis:**
• **Venous pH:** **7.39** (Nominal range: 7.35–7.45)
• **Blood Lactate:** **1.1 mmol/L** (Resting metabolic clearance nominal)
• **Hematocrit:** **43.5%** (Consistent with microgravity plasma volume reduction)
• **Electrolytes:** Na⁺ 141 mEq/L, K⁺ 4.2 mEq/L, Ca²⁺ 9.2 mg/dL.

*Conclusion:* Biochemical biomarkers confirm complete readiness for scheduled physical exercise and EVA duty.`,

  urine: `**ASTRI Bio-Telemetry // Urine Specimen & Hydration Analysis:**
• **Urine Specific Gravity:** **1.015** (Optimal hydration state)
• **Urine Osmolarity:** **520 mOsm/kg** (Healthy kidney filtration efficiency)
• **Urine Processor Assembly (UPA):** Water Recovery System recycling yield at **98.2%**.

*Advisory:* Keep sipping from your station drink bag to maintain hydration equilibrium against zero-g insensible fluid loss.`,

  oxygen: `**ASTRI Life Support Status // EVA Suit Pressure Seal:**
• **O₂ Primary Reserve:** **99.4%** (Sufficient for 8.5 hours EVA duration)
• **Secondary Emergency Reserve:** **100% Locked & Verified**
• **Suit Internal Pressure:** **4.3 psi (100% pure oxygen atmosphere)**
• **Cabin Differential:** Nominal seal integrity at 0.00 psi/min leak rate
• **CO₂ Scrubber (LiOH Canister):** **12% saturation** (88% absorption life remaining).

*All environmental telemetry channels 01–16 indicate Green / Nominal status.*`,

  co2: `**ASTRI Environmental Telemetry // Carbon Dioxide Scrubber:**
• **Cabin CO₂ Partial Pressure:** **2.4 mmHg** (Well below the 3.0 mmHg threshold for astronaut headache prevention)
• **CDRA (Carbon Dioxide Removal Assembly):** Dual beds cycling normally every 20 minutes
• **LiOH Backup Canisters:** 12 fresh units stowed in Node 3 (Tranquility).

Atmospheric scrubbers are operating at peak efficiency.`,

  radiation: `**ASTRI Space Weather & Dosimeter Telemetry:**
• **Daily Radiation Dose:** **0.18 mSv/day** (Nominal quiet Sun conditions)
• **Cumulative Mission Dose:** **12.4 mSv** (Well inside the 350 mSv lifetime career limit)
• **South Atlantic Anomaly (SAA):** Next transit in **42 minutes**; internal shielding protocols automatically queued.
• **Solar Flux:** Solar Alpha angle +18.2°, no coronal mass ejection alerts active.`,

  schedule: `**ASTRI Mission Chrono // Upcoming Daily Flight Schedule:**
1. **06:00 – 06:10 AM**: Urine Bio-specimen Test // UPA osmolarity analysis.
2. **06:10 – 06:40 AM**: i-STAT Blood Test // Venous pH, lactate, & hematocrit verification.
3. **06:40 – 07:00 AM**: Breakfast Reconstitution // Lyophilized oatmeal + Vit D3/Calcium.
4. **07:00 – 08:30 AM**: Physical Exercise (Morning) // 1200 kg ARED squat & deadlift protocol.
5. **12:00 – 13:00 PM**: Mid-Day Nutrition & Hydration in Unity module.
6. **13:30 – 15:30 PM**: Habitat Wet Clean // Columbus & Destiny laboratory disinfectant wipe-down.
7. **16:15 – 18:15 PM**: T2 Colbert Treadmill & CEVIS Cycle countermeasure.
8. **18:45 – 19:36 PM**: ODF Medical Support Analysis // Houston CAPCOM flight surgeon sync.
9. **19:45 – 20:30 PM**: Dinner & Crew Debrief // Behavioral wellness journal logging.`,

  exercise: `**ASTRI Physical Countermeasures // ARED & T2 Protocol:**
• **Objective:** Prevent microgravity bone mineral density loss and maintain lower-extremity muscle mass.
• **ARED (Advanced Resistive Exercise Device):** 
  - Squats: 4 sets × 10 reps @ 120 kg equivalent vacuum load.
  - Heel raises & deadlifts: 3 sets × 12 reps.
• **T2 Colbert Treadmill:** 30 minutes interval training with bungee harness loading at 70% body weight.
• **Vibration Isolation:** T2 pneumatic dampeners verified active to protect station solar arrays.`,

  clean: `**ASTRI Maintenance Task // Wet Clean Procedures:**
• **Modules:** Columbus (ESA) & Destiny (US Lab) modules.
• **Materials:** Cavicide / fungicidal biocidal wipes, HEPA vacuum, sterile microfiber swabs.
• **Focus Zones:** Air return diffusers, handrails, crew sleep quarters (CQs), and galley table.
• **Rationale:** Microbial control in closed environmental microgravity to prevent bacterial biofilm buildup.`,

  station: `**ASTRI Station Architecture // ISS Subsystems:**
• **Pressurized Modules:** Destiny (US Lab), Columbus (ESA), Kibo (JAXA), Node 2 (Harmony), Node 3 (Tranquility), Cupola.
• **Power Generation:** 8 Solar Array Wings generating ~120 kW electrical output.
• **External Robotics:** Canadarm2 & Dextre robotic manipulator on Mobile Base System.
• **Viewing:** Cupola 7-window bay offering 360° nadir observation of Earth horizon.`,

  orbit: `**ASTRI Orbital Dynamics & Flight Trajectory:**
• **Mean Altitude:** **408.4 km** above Earth mean sea level.
• **Orbital Velocity:** **27,600 km/h** (7.66 km/s).
• **Period:** **92.6 minutes per complete Earth revolution** (15.5 sunrises/sunsets each 24 hours).
• **Beta Angle:** **+18.4°** — optimal thermal and solar array illumination.
• **Ground Track:** Currently traversing the South Pacific approaching South America.`,

  eva: `**ASTRI EVA Operations // Spacewalk Telemetry:**
• **EMU Space Suit:** Suit Serial 3004 / 3008 checked.
• **Pre-Breathe Protocol:** 2.0 hours pure oxygen pre-breathe completed to eliminate nitrogen bubbles and prevent decompression sickness.
• **Airlock Depressurization:** Quest joint airlock pumped down to 0.5 psi prior to final outer hatch swing.
• **Safety Tethers:** Dual 85-foot retractable steel tethers inspected.`,

  food: `**ASTRI Nutrition & Metabolic Diagnostics:**
• **Daily Target:** 2,800 kcal / day (balanced protein, complex carbs, and omega-3 fatty acids).
• **Microgravity Supplements:** 2,000 IU Vitamin D3 + 1,000 mg Calcium daily for bone matrix stabilization.
• **Water Intake:** 2.5 Liters / day from the Water Recovery System dispenser (ambient or 70°C hot water).`,

  mindfulness: `**ASTRI Behavioral Support // Zero-G Grounding Routine:**
Commander, take three deep diaphragmatic breaths. Notice your body floating neutrally in microgravity.
1. **Inhale (4 seconds):** Breathe in pure cabin oxygen; feel your lungs expand comfortably.
2. **Hold (4 seconds):** Savor the silence of the orbital horizon passing serenely beneath you.
3. **Exhale (6 seconds):** Release all shoulder, neck, and back tension from your suit harness.

*Your neurological telemetry reflects optimal alpha-wave focus. I am here by your side throughout every orbital pass.*`,

  anomaly: `**ASTRI Diagnostic Scan // System Integrity Audit:**
• **Orbital Vector:** 408 km circular orbit @ 27,600 km/h (inclination 51.6°)
• **External Radiation Flux:** 0.18 mSv/day (Within ALARA mission limits)
• **Starlink / TDRSS Optical Laser Link:** **1.2 Gbps active downlink**
• **Zero-G Touch Sensors:** 100% Online
• **Helmet Visor Reticle Tracking:** 30° parallax lock calibrated.

*No mission critical anomalies detected across any avionics or biometric channels.*`,

  joke: `**ASTRI Onboard Humor Module // Recreation Protocol:**
*Why did the astronaut break up with the space station?*
...Because they just needed a little more **space**, and there was too much gravity in the relationship! 🚀😄

*Telemetry update:* Your facial micro-expressions register a smile. Mission morale indices elevated by +12%.`,

  ridge: `**ASTRI System Guide // RIDGE NASA Application Features:**
1. **Suit & Vitals Portal:** Live biometric gauges, 3D biometric visor mirror, and astronaut DB.
2. **3D ISS Digital Twin (AURA):** Photorealistic interactive ISS station with ECLSS module inspection.
3. **Trend & Telemetry:** Comparative KPI graphs, baseline shifts, and AstroCare mission telemetry.
4. **CrewMind Behavioral Health:** Daily psychological assessments, sleep hygiene logs, and PVT reaction tests.
5. **Interactive Mission Roadmap:** Gamified astronaut daily schedule with milestone summits and task inspectors.
6. **ASTRI AI Chatbot:** Gemini AI neural copilot with floating 3D astronaut companion!`,
};

export async function askAstriGemini(
  prompt: string,
  history: AstriMessage[] = [],
  customApiKey?: string
): Promise<string> {
  const apiKey =
    customApiKey?.trim() ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('astri_gemini_api_key') || ''
      : '') ||
    (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ||
    (import.meta.env.GEMINI_API_KEY as string | undefined) ||
    '';

  // If API key is available, call Google Gemini REST endpoint directly
  if (apiKey) {
    // Try primary Gemini 1.5/2.0 Flash models
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];
    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`;

        const contents = [
          {
            role: 'user',
            parts: [{ text: `${DEFAULT_SYSTEM_INSTRUCTION}\n\nNow respond to the astronaut crew.` }],
          },
          {
            role: 'model',
            parts: [{ text: 'ASTRI systems online. All telemetry verified. Ready for transmission, Commander.' }],
          },
          ...history.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ];

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && typeof candidateText === 'string') {
            return candidateText.trim();
          }
        }
      } catch (err) {
        console.warn(`Gemini API call with ${model} failed, trying next option:`, err);
      }
    }
  }

  // Autonomous high-fidelity onboard intelligence fallback (works 100% offline without any API key)
  return fallbackAstriResponse(prompt);
}

function fallbackAstriResponse(prompt: string): string {
  const lower = prompt.toLowerCase().trim();

  // 1. Greetings
  if (
    lower.match(/^(hi|hello|hey|greetings|morning|good morning|evening|good evening|howdy|sup|hola)\b/) ||
    lower === 'hi' ||
    lower === 'hello'
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.greeting;
  }

  // 2. Identity & Who are you
  if (
    lower.includes('who are you') ||
    lower.includes('what are you') ||
    lower.includes('your name') ||
    lower.includes('what is astri') ||
    lower.includes('introduce')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.identity;
  }

  // 3. Capabilities & Help
  if (
    lower.includes('help') ||
    lower.includes('can you do') ||
    lower.includes('commands') ||
    lower.includes('features') ||
    lower.includes('menu') ||
    lower.includes('capabilities')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.capabilities;
  }

  // 4. Cardiovascular & Heart
  if (
    lower.includes('heart') ||
    lower.includes('cardio') ||
    lower.includes('pulse') ||
    lower.includes('bpm') ||
    lower.includes('ecg') ||
    lower.includes('hrv')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.heart;
  }

  // 5. Blood Pressure
  if (
    lower.includes('blood pressure') ||
    lower.includes('systolic') ||
    lower.includes('diastolic') ||
    lower.includes('bp') ||
    lower.includes('mmhg')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.bloodPressure;
  }

  // 6. Blood Test & i-STAT
  if (
    lower.includes('blood test') ||
    lower.includes('i-stat') ||
    lower.includes('istat') ||
    lower.includes('lactate') ||
    lower.includes('hematocrit') ||
    lower.includes('venous ph')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.bloodTest;
  }

  // 7. Urine & Hydration
  if (
    lower.includes('urine') ||
    lower.includes('hydration') ||
    lower.includes('osmolarity') ||
    lower.includes('upa') ||
    lower.includes('kidney')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.urine;
  }

  // 8. Oxygen & Suit Pressure
  if (
    lower.includes('oxygen') ||
    lower.includes('o2') ||
    lower.includes('suit') ||
    lower.includes('psi') ||
    lower.includes('pressure seal') ||
    lower.includes('cabin pressure')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.oxygen;
  }

  // 9. CO2 & Scrubbers
  if (
    lower.includes('co2') ||
    lower.includes('carbon dioxide') ||
    lower.includes('scrubber') ||
    lower.includes('lioh') ||
    lower.includes('canister')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.co2;
  }

  // 10. Radiation & Space Weather
  if (
    lower.includes('radiation') ||
    lower.includes('cosmic') ||
    lower.includes('solar flare') ||
    lower.includes('dosimeter') ||
    lower.includes('msv') ||
    lower.includes('saa')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.radiation;
  }

  // 11. Daily Flight Roadmap & Schedule
  if (
    lower.includes('schedule') ||
    lower.includes('task') ||
    lower.includes('to-do') ||
    lower.includes('today') ||
    lower.includes('routine') ||
    lower.includes('flight plan') ||
    lower.includes('roadmap')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.schedule;
  }

  // 12. Exercise & Countermeasures
  if (
    lower.includes('exercise') ||
    lower.includes('workout') ||
    lower.includes('ared') ||
    lower.includes('squat') ||
    lower.includes('treadmill') ||
    lower.includes('t2') ||
    lower.includes('cevis') ||
    lower.includes('bone density')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.exercise;
  }

  // 13. Habitat Wet Clean
  if (
    lower.includes('clean') ||
    lower.includes('maintenance') ||
    lower.includes('wipe') ||
    lower.includes('disinfect') ||
    lower.includes('biofilm')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.clean;
  }

  // 14. Station & Modules
  if (
    lower.includes('iss') ||
    lower.includes('station') ||
    lower.includes('columbus') ||
    lower.includes('destiny') ||
    lower.includes('kibo') ||
    lower.includes('cupola') ||
    lower.includes('canadarm')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.station;
  }

  // 15. Orbit & Physics
  if (
    lower.includes('orbit') ||
    lower.includes('speed') ||
    lower.includes('velocity') ||
    lower.includes('altitude') ||
    lower.includes('inclination') ||
    lower.includes('sunset') ||
    lower.includes('sunrise') ||
    lower.includes('distance')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.orbit;
  }

  // 16. Spacewalk & EVA
  if (
    lower.includes('eva') ||
    lower.includes('spacewalk') ||
    lower.includes('airlock') ||
    lower.includes('quest') ||
    lower.includes('tether') ||
    lower.includes('pre-breathe')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.eva;
  }

  // 17. Food & Nutrition
  if (
    lower.includes('food') ||
    lower.includes('nutrition') ||
    lower.includes('eat') ||
    lower.includes('meal') ||
    lower.includes('breakfast') ||
    lower.includes('dinner') ||
    lower.includes('calories')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.food;
  }

  // 18. Mindfulness & Behavioral Wellness
  if (
    lower.includes('relax') ||
    lower.includes('stress') ||
    lower.includes('mindful') ||
    lower.includes('calm') ||
    lower.includes('sleep') ||
    lower.includes('breathe') ||
    lower.includes('tired') ||
    lower.includes('anxious') ||
    lower.includes('homesick')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.mindfulness;
  }

  // 19. Anomaly & Warning
  if (
    lower.includes('anomaly') ||
    lower.includes('alarm') ||
    lower.includes('warning') ||
    lower.includes('danger') ||
    lower.includes('emergency') ||
    lower.includes('leak') ||
    lower.includes('fire')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.anomaly;
  }

  // 20. Humor & Morale
  if (
    lower.includes('joke') ||
    lower.includes('funny') ||
    lower.includes('laugh') ||
    lower.includes('humor')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.joke;
  }

  // 21. RIDGE App
  if (
    lower.includes('ridge') ||
    lower.includes('inova') ||
    lower.includes('visor') ||
    lower.includes('observatory') ||
    lower.includes('feature') ||
    lower.includes('app')
  ) {
    return ONBOARD_AUTONOMOUS_RESPONSES.ridge;
  }

  // 22. Dynamic Contextual Natural Language Synthesis
  const cleanQuery = prompt.replace(/[^\w\s-]/g, '').trim();
  return `**ASTRI Onboard Flight Intelligence // Mission Analysis:**
Roger that, Commander. Telemetry processing confirmed for: *"${prompt}"*.

• **Biometric Correlation:** All 16 astronaut telemetry sensors (cardiac rhythm, suit differential pressure at 4.3 psi, metabolic index) are tracking in the Green / Nominal safety envelope.
• **Flight Environment:** Microgravity atmosphere verified (O₂: 21%, N₂: 78%, CO₂: 2.4 mmHg).
• **Actionable Guidance regarding "${cleanQuery || 'your mission query'}":**
  1. Telemetry confirms your current physiological readiness score is **98.4%**.
  2. Mission operations schedule remains on track with zero orbital trajectory drift.
  3. You can ask me to run detailed diagnostics on your **heart rate**, **EVA suit O₂ reserves**, **flight roadmap schedule**, or **orbital position**.

Would you like me to log this in your daily flight log or synchronize telemetry with Houston CAPCOM?`;
}
