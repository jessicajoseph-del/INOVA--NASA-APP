/**
 * ASTRI (Autonomous Space Telemetry & Reconnaissance Intelligence)
 * Gemini AI Service for Ridge Astronaut Crew
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

// Onboard knowledge fallback for offline / disconnected deep space operations
const ONBOARD_AUTONOMOUS_RESPONSES: Record<string, string> = {
  heart: `**ASTRI Telemetry Analysis // Cardiovascular Diagnostics:**
• Current Heart Rate: **72 BPM** (Baseline resting range: 60–80 BPM)
• Heart Rate Variability (HRV): **68 ms** (Optimal autonomic nervous balance)
• Cardiac Output: **5.2 L/min** under microgravity fluid-shift equilibrium
• Sinus Rhythm: **100% Stable** — no arrhythmias or premature ventricular contractions recorded.

*Recommendation:* Maintain scheduled 07:00 ARED resistance session and stay hydrated with 500 mL electrolytic fluid prior to EVA egress.`,

  oxygen: `**ASTRI Life Support Status // EVA Suit Pressure Seal:**
• O₂ Primary Reserve: **99.4%** (Sufficient for 8.5 hours EVA duration)
• Secondary Emergency Reserve: **100% Locked & Verified**
• Suit Internal Pressure: **4.3 psi (100% pure oxygen atmosphere)**
• Cabin Differential: Nominal seal integrity at 0.00 psi/min leak rate
• CO₂ Scrubber (LiOH Canister): **12% saturation** (88% absorption life remaining).

*All environmental telemetry channels 01–16 indicate Green / Nominal status.*`,

  schedule: `**ASTRI Mission Chrono // Upcoming Flight Schedule:**
1. **06:00 – 06:10 AM**: Urine Test // Bio-specimen collection for UPA osmolarity.
2. **06:10 – 06:40 AM**: Blood Test Planner // i-STAT venous pH, lactate, & hematocrit.
3. **06:40 – 07:00 AM**: Breakfast Reconstitution // Lyophilized oatmeal + Vit D3/Calcium.
4. **07:00 – 08:30 AM**: Physical Exercise (Morning) // 1200 kg ARED squat protocol.
5. **12:00 – 13:00**: Mid-Day Nutrition & Hydration in Unity module.
6. **13:30 – 15:30**: Wet Clean Maintenance // Columbus & Destiny habitat wipe-down.
7. **16:15 – 18:15**: T2 Colbert Treadmill & CEVIS Cardio countermeasure.
8. **18:45 – 19:36**: ODF Medical Support Analysis // Houston CAPCOM flight surgeon sync.
9. **19:45 – 20:30**: Dinner & Crew Debrief // Behavioral wellness journal logging.`,

  anomaly: `**ASTRI Diagnostic Scan // System Integrity Audit:**
• Orbital Vector: 408 km circular orbit @ 27,600 km/h (inclination 51.6°)
• External Radiation Flux: 0.18 mSv/day (Within ALARA mission limits)
• Starlink / TDRSS Optical Laser Link: **1.2 Gbps active downlink**
• Zero-G Touch Sensors: 100% Online
• Helmet Visor Reticle Tracking: 30° parallax lock calibrated.

*No mission critical anomalies detected across any avionics or biometric channels.*`,

  mindfulness: `**ASTRI Behavioral Support // Zero-G Grounding Routine:**
Commander, take three deep, diaphragmatic breaths. Notice your body floating neutrally in microgravity.
1. **Inhale (4 seconds)**: Inhale pure suit oxygen; feel your chest expand against the pressure bladder.
2. **Hold (4 seconds)**: Savor the silence of the orbital horizon passing beneath you.
3. **Exhale (6 seconds)**: Release shoulder and neck tension from the EVA harness.

*Your current neurological telemetry shows optimal alpha-wave focus. I am here by your side throughout the orbital pass.*`,
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
    '';

  // If API key is available, call Google Gemini REST endpoint directly
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
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

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Gemini API call failed, falling back to autonomous onboard intelligence:', errorText);
        return fallbackAstriResponse(prompt);
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText && typeof candidateText === 'string') {
        return candidateText.trim();
      }
    } catch (err) {
      console.warn('Network error reaching Gemini endpoint, using autonomous onboard engine:', err);
      return fallbackAstriResponse(prompt);
    }
  }

  // Autonomous high-fidelity onboard fallback
  return fallbackAstriResponse(prompt);
}

function fallbackAstriResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('heart') || lower.includes('cardio') || lower.includes('pulse') || lower.includes('bpm')) {
    return ONBOARD_AUTONOMOUS_RESPONSES.heart;
  }
  if (lower.includes('oxygen') || lower.includes('suit') || lower.includes('pressure') || lower.includes('o2') || lower.includes('psi')) {
    return ONBOARD_AUTONOMOUS_RESPONSES.oxygen;
  }
  if (lower.includes('schedule') || lower.includes('task') || lower.includes('to-do') || lower.includes('today') || lower.includes('routine') || lower.includes('flight plan')) {
    return ONBOARD_AUTONOMOUS_RESPONSES.schedule;
  }
  if (lower.includes('anomaly') || lower.includes('status') || lower.includes('orbit') || lower.includes('diagnostic') || lower.includes('check')) {
    return ONBOARD_AUTONOMOUS_RESPONSES.anomaly;
  }
  if (lower.includes('relax') || lower.includes('stress') || lower.includes('mindful') || lower.includes('calm') || lower.includes('sleep') || lower.includes('breathe')) {
    return ONBOARD_AUTONOMOUS_RESPONSES.mindfulness;
  }

  // Contextual natural synthesis response
  return `**ASTRI Onboard Flight Intelligence // Acknowledgement:**
Roger that, Commander. Telemetry processing confirmed for query: *"${prompt}"*.

• **Biometric Status:** All 16 suit biometric channels are transmitting nominal values.
• **Environmental Support:** Cabin air scrubbers and thermal loops operating within green zone tolerances.
• **Flight Vector:** Station position tracking maintains optimal orbital inclination.

Would you like me to run a deep-scan telemetry audit, review your daily flight roadmap, or synchronize comms with Houston CAPCOM?`;
}

