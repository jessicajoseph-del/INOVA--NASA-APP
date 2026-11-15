import React, { useState } from 'react';
import { ArrowRight, UserPlus, LogIn, Shield, HeartPulse, Sparkles, Orbit } from 'lucide-react';

// ── DAILY ASTRONAUT MESSAGING SYSTEM ────────────────────────────────────
const GENERAL_MESSAGES = [
  "Even across galaxies, your heartbeat belongs to humanity.",
  "Earth is far away, but its care travels with you.",
  "Every heartbeat carries a little piece of home.",
  "You are never just a signal in the silence.",
  "Somewhere on Earth, millions of hearts beat alongside yours.",
  "Your vitals tell a story Earth is listening to.",
  "Distance separates worlds, never the lives connecting them.",
  "Even in silence, your body speaks, and we listen.",
  "A universe apart, yet connected by every heartbeat.",
  "Your solitude is vast, but so is our care.",
  "Across the darkness, your heartbeat remains our brightest signal.",
  "Every breath connects you to the world you left behind.",
  "The stars may surround you, but humanity travels within you.",
  "Your heartbeat is a familiar rhythm in an unfamiliar world.",
  "Even light-years cannot measure the distance between caring hearts.",
  "Beyond Earth's atmosphere, you remain part of its heartbeat.",
  "Your wellbeing echoes across every mile between us.",
  "The universe is quiet; your connection to Earth is not.",
  "Every vital sign brings us a little closer.",
  "Home is listening, one heartbeat at a time.",
  "Your strength travels further than any spacecraft.",
  "In the quiet of space, remember the warmth of belonging.",
  "Millions of miles away, never outside the circle of care.",
  "Your heartbeat is a message we never stop receiving.",
  "Even the loneliest orbit carries a connection home.",
  "Your body holds the rhythm of a world behind you.",
  "The stars are distant; our attention is not.",
  "Every signal from you reminds us how connected we are.",
  "Let the quiet remind you of your inner strength.",
  "Your heartbeat bridges the silence between worlds.",
  "Earth may be a distant blue, but its care remains close.",
  "Every breath is proof of your remarkable resilience.",
  "Your health connects two worlds through one shared purpose.",
  "In infinite space, your wellbeing is never a small thing.",
  "The silence outside cannot quiet the strength within.",
  "Your vital signs carry whispers of life across the cosmos.",
  "Somewhere beneath the same stars, someone is thinking of you.",
  "Every heartbeat is another thread connecting you to home.",
  "Space may feel endless; our care has no distance.",
  "Your pulse keeps time with the human story.",
  "A quiet moment can still hold countless connections.",
  "Your wellbeing matters beyond the boundaries of Earth.",
  "Even in orbit, you belong to something greater.",
  "Your heartbeat travels farther than you can imagine.",
  "Let each steady breath bring a little piece of Earth closer.",
  "The universe surrounds you; humanity stands behind you.",
  "Your signals cross the stars, carrying life and hope.",
  "You are Earth's explorer, never its stranger.",
  "Every synced heartbeat reminds us that nobody stands alone.",
  "Your body is extraordinary; so is the care surrounding it.",
  "The stars witness your courage; your data tells your story.",
  "In the vastness, find comfort in the rhythm within.",
  "Your connection to home is stronger than the distance.",
  "Even far from Earth, you remain deeply rooted.",
  "A thousand stars above, countless hearts beside you.",
  "Your pulse is a gentle reminder that you belong.",
  "Beyond the atmosphere, the human connection remains constant.",
  "Every health signal carries a little reassurance from home.",
  "The distance is astronomical; the care is immeasurable.",
  "Your heartbeat is never just your own.",
  "Even when Earth disappears from view, belonging remains.",
  "Let your steady pulse anchor you among the stars.",
  "Your wellbeing is part of humanity's greatest journey.",
  "Across the cosmic silence, your life keeps us connected.",
  "The universe is enormous, but you are never insignificant.",
  "Each breath carries the resilience of those who came before.",
  "Your health data travels; our thoughts travel further.",
  "There is strength in solitude and comfort in connection.",
  "One small heartbeat, one extraordinary connection to Earth.",
  "Wherever your orbit takes you, you are part of us.",
  "Even light-years away, you are held by countless hearts.",
  "Your heartbeat makes the silence feel a little less distant.",
  "Every signal home carries a reminder that you belong.",
  "The stars may feel endless, but connection knows no boundaries.",
  "One steady breath closer to home, one heartbeat stronger."
];

const SPECIAL_DAYS = {
  "04-22": { text: "Every planet deserves the care we give our own home.", event: "Earth Day" },
  "06-05": { text: "A cleaner atmosphere begins with understanding every breath.", event: "World Environment Day" },
  "04-07": { text: "Healthy bodies make extraordinary journeys possible.", event: "World Health Day" },
  "10-10": { text: "Mental wellbeing matters, even millions of miles from home.", event: "World Mental Health Day" },
  "09-07": { text: "Clean air is life's invisible foundation, on Earth and beyond.", event: "International Day of Clean Air" },
  "03-22": { text: "Every drop matters, whether in oceans or spacecraft.", event: "World Water Day" },
  "04-12": { text: "Humanity's journey into space began with one remarkable flight.", event: "International Day of Human Space Flight" },
  "11-10": { text: "Every discovery begins with the courage to question.", event: "World Science Day for Peace and Development" },
  "07-30": { text: "Across galaxies, human connection remains our greatest constant.", event: "International Day of Friendship" },
  "10-16": { text: "Nourishment is the foundation of every extraordinary expedition.", event: "World Food Day" },
  "05-16": { text: "Light helps us explore the universe and understand life.", event: "International Day of Light" },
  "06-08": { text: "Our oceans regulate the blue planet we call home.", event: "World Oceans Day" },
  "05-22": { text: "Protecting biodiversity means protecting the future of life.", event: "International Day for Biological Diversity" },
  "03-21": { text: "Every forest contributes to the planet's breathing system.", event: "International Day of Forests" },
  "03-13": { text: "Sleep restores the mind and body for tomorrow's discoveries.", event: "World Sleep Day" },
  "07-11": { text: "A growing population deserves healthier environments and sustainable futures.", event: "World Population Day" },
  "06-07": { text: "Safe food sustains healthy explorers across every frontier.", event: "World Food Safety Day" },
  "05-03": { text: "The Sun powers life, discovery, and our changing planet.", event: "International Sun Day" },
  "09-29": { text: "Every heartbeat deserves attention, wherever humanity travels.", event: "World Heart Day" },
  "12-05": { text: "Healthy soil sustains the food systems that sustain us.", event: "World Soil Day" },
  "04-21": { text: "Innovation transforms scientific curiosity into meaningful progress.", event: "World Creativity and Innovation Day" },
  "09-21": { text: "A peaceful mind supports a resilient human spirit.", event: "International Day of Peace" },
  "10-02": { text: "Every breath reminds us how precious Earth's atmosphere is.", event: "World Space Week" },
  "03-03": { text: "Protecting wildlife means preserving the balance of our ecosystems.", event: "World Wildlife Day" },
  "11-20": { text: "Every generation inherits the responsibility of a living planet.", event: "World Children's Day" },
  "03-23": { text: "Understanding our climate helps protect tomorrow's explorers.", event: "World Meteorological Day" },
  "12-20": { text: "Human resilience grows through knowledge, care, and connection.", event: "International Human Solidarity Day" },
  "12-08": { text: "Our planet's changing climate deserves our scientific attention.", event: "World Climate Day" },
  "03-18": { text: "Every step toward sustainability shapes humanity's future among the stars.", event: "Global Recycling Day" },
  "02-11": { text: "Scientific discoveries flourish when every mind has room to explore.", event: "International Day of Women and Girls in Science" }
};

const getDailyMessage = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;

  if (SPECIAL_DAYS[dateKey]) {
    return SPECIAL_DAYS[dateKey];
  }
  
  const randomGenMsg = GENERAL_MESSAGES[Math.floor(Math.random() * GENERAL_MESSAGES.length)];
  return { text: randomGenMsg, event: null };
};


export default function WelcomeScreen({ onContinue, onNavigateToSignUp }) {
  const [dailyGreeting] = useState(getDailyMessage());

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#0F2557] text-[#F7F4EE] p-4 sm:p-6 overflow-hidden">
      {/* Background Subtle Navy Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-900/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Elevated Warm Alabaster Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#FFFFFF] border border-[#DCD5C7] rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(11,23,54,0.08)] flex flex-col items-center text-center">
        
        {/* Emblem Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#EDE8DE] border border-[#DCD5C7] flex items-center justify-center text-[#0F2557] shadow-sm mb-5">
          <Orbit className="w-8 h-8 text-[#0F2557]" />
        </div>

        {/* Header Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE8DE] border border-[#DCD5C7] text-xs font-mono font-semibold text-[#5A657D] uppercase tracking-wider mb-3">
          <Shield className="w-3.5 h-3.5 text-[#0F2557]" />
          <span>Secured Mission Portal</span>
        </div>

        {/* Welcome Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1736] tracking-tight leading-snug mb-4">
          Welcome to RIDGE
        </h2>
        
        {/* Dynamic Daily Wishing Message */}
        <div className="w-full p-4 rounded-xl bg-[#0F2557] border border-[#1A3B8B] shadow-inner mb-6 flex flex-col items-center gap-2 text-center">
          <h3 className="text-[1.1rem] text-[#f6eedb] font-medium leading-relaxed italic">
            "{dailyGreeting.text}"
          </h3>
          {dailyGreeting.event && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#ead9b2] text-[10px] font-mono uppercase tracking-widest mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
              {dailyGreeting.event}
            </div>
          )}
        </div>
        
        <p className="text-xs sm:text-sm text-[#5A657D] font-normal leading-relaxed max-w-md">
          Autonomous Crew Health, Real-Time Biometric Monitoring & 3D Mission Telemetry Environment.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 w-full my-6 font-mono text-[11px] text-[#5A657D]">
          <div className="p-3 rounded-xl bg-[#EDE8DE]/60 border border-[#DCD5C7] text-left flex items-start gap-2">
            <HeartPulse className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B1736] block">Suit Vitals</span>
              <span>1 Hz telemetry stream</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#EDE8DE]/60 border border-[#DCD5C7] text-left flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B1736] block">Zero-Trust</span>
              <span>Face & Fingerprint ID</span>
            </div>
          </div>
        </div>

        {/* Primary Action: Continue to Login (Strict Auth Gate) */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0F2557] hover:bg-[#1A3B8B] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Continue to Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Secondary Action: Create Account */}
        <div className="mt-5 pt-4 border-t border-[#DCD5C7] w-full flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <span className="text-[#5A657D]">First time on mission?</span>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="inline-flex items-center gap-1.5 font-bold text-[#0F2557] hover:underline cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Crew Account (Sign Up)</span>
          </button>
        </div>

      </div>

      {/* Security Footer Notice */}
      <div className="relative z-10 mt-6 text-[11px] font-mono text-[#EDE8DE] text-center">
        <span>ENCRYPTED PROTOCOL • COMPLIANT WITH NASA MISSION DEFENSE DIRECTIVE 44</span>
      </div>
    </div>
  );
}