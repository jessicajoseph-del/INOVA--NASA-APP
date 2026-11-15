import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Droplets,
  Plus,
  CheckCircle2,
  AlertCircle,
  Flame,
  Shield,
  Apple,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  Sun,
  Bone,
  Waves
} from 'lucide-react';

const STORAGE_KEY = 'ridge_meal_plan_data';

const DEFAULT_MEALS = [
  {
    id: 'meal-1',
    time: '07:30',
    name: 'Breakfast // Pre-ARED Fuel',
    type: 'Thermostabilized & Fresh Mix',
    calories: 620,
    protein: 34,
    carbs: 68,
    fat: 18,
    sodium: 480,
    calcium: 320,
    vitaminD: 350,
    items: [
      { name: 'Scrambled Eggs with Bell Peppers (Rehydrated)', mass: '140g', type: 'Rehydratable' },
      { name: 'Freeze-Dried Peach Slices', mass: '50g', type: 'Thermostabilized' },
      { name: 'Whole Wheat Space Tortilla (Low-Crumb)', mass: '45g', type: 'Fresh Storage' },
      { name: 'Kona Coffee with Electrolyte Fortification', mass: '250mL', type: 'Beverage Pouch' }
    ],
    status: 'Logged',
    iconColor: 'text-amber-500'
  },
  {
    id: 'meal-2',
    time: '12:30',
    name: 'Mid-Orbit Lunch // Station Operational',
    type: 'Irradiated & Ready-to-Eat',
    calories: 780,
    protein: 48,
    carbs: 82,
    fat: 22,
    sodium: 620,
    calcium: 360,
    vitaminD: 250,
    items: [
      { name: 'NASA Classic Shrimp Cocktail with Horseradish', mass: '120g', type: 'Thermostabilized' },
      { name: 'Brown Rice & Quinoa Pilaf pouch', mass: '160g', type: 'Rehydratable' },
      { name: 'Steamed Broccoli Spears in Olive Dressing', mass: '100g', type: 'Retort Pouch' },
      { name: 'Fortified Orange-Mango Beverage', mass: '300mL', type: 'Beverage Pouch' }
    ],
    status: 'Pending',
    iconColor: 'text-cyan-600'
  },
  {
    id: 'meal-3',
    time: '16:00',
    name: 'Post-Exercise Recovery Snack',
    type: 'High-Density Protein & Electrolytes',
    calories: 380,
    protein: 28,
    carbs: 42,
    fat: 10,
    sodium: 310,
    calcium: 210,
    vitaminD: 200,
    items: [
      { name: 'Whey Isolate Space Slurry (Vanilla Pod)', mass: '250mL', type: 'Pouch' },
      { name: 'Honey-Roasted Macadamia & Cashew Mix', mass: '55g', type: 'Natural Form' },
      { name: 'Dried Tart Cherries (Anti-inflammatory)', mass: '40g', type: 'Dried' }
    ],
    status: 'Pending',
    iconColor: 'text-emerald-600'
  },
  {
    id: 'meal-4',
    time: '19:30',
    name: 'Crew Dinner // Thermal Chamber Sealed',
    type: 'Slow-Release Nutrient Complex',
    calories: 700,
    protein: 44,
    carbs: 65,
    fat: 24,
    sodium: 540,
    calcium: 290,
    vitaminD: 220,
    items: [
      { name: 'Wild Alaskan Sockeye Salmon Fillet (Omega-3)', mass: '150g', type: 'Thermostabilized' },
      { name: 'Sweet Potato Mash with Coconut Nectar', mass: '140g', type: 'Rehydratable' },
      { name: 'Green Asparagus Tips with Lemon Herb', mass: '90g', type: 'Retort Pouch' },
      { name: 'Chamomile-Lavender Sleep Infusion', mass: '250mL', type: 'Beverage Pouch' }
    ],
    status: 'Pending',
    iconColor: 'text-indigo-600'
  }
];

export default function MealPlanPage() {
  const [meals, setMeals] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_MEALS;
  });

  const [waterMl, setWaterMl] = useState(() => {
    try {
      const saved = localStorage.getItem('ridge_water_intake_ml');
      if (saved) return Number(saved) || 2400;
    } catch {}
    return 2400;
  });

  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    } catch {}
  }, [meals]);

  useEffect(() => {
    try {
      localStorage.setItem('ridge_water_intake_ml', String(waterMl));
    } catch {}
  }, [waterMl]);

  // Calculations
  const targetCalories = 2850;
  const targetWaterLiters = 3.0;

  const loggedMeals = meals.filter((m) => m.status === 'Logged');
  const consumedCalories = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const consumedProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);
  const consumedSodium = loggedMeals.reduce((acc, m) => acc + m.sodium, 0);
  const consumedCalcium = loggedMeals.reduce((acc, m) => acc + m.calcium, 0);
  const consumedVitD = loggedMeals.reduce((acc, m) => acc + m.vitaminD, 0);

  const calPercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));
  const waterPercent = Math.min(100, Math.round(((waterMl / 1000) / targetWaterLiters) * 100));

  const toggleMealStatus = (id) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const next = m.status === 'Logged' ? 'Pending' : 'Logged';
          return { ...m, status: next };
        }
        return m;
      })
    );
  };

  const addWater = (amount) => {
    setWaterMl((prev) => Math.min(4000, prev + amount));
  };

  const resetToday = () => {
    setMeals(DEFAULT_MEALS);
    setWaterMl(2400);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* ── TOP HEADER & MISSION EYEBROW ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#DCD5C7]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#DCD5C7] bg-[#FFFFFF] text-xs font-mono font-semibold text-[#5A657D] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#E06D06] animate-pulse" />
            <span>NUTRIORBIT // EXPEDITION 73 CREW METABOLIC PROTOCOL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B1736]">
            Astronaut Nutrition & Hydration Telemetry
          </h1>
          <p className="text-sm text-[#5A657D] max-w-2xl">
            Active microgravity metabolic counters. Designed to prevent bone demineralization, counteract fluid shifts (SANS), and fuel high-resistance ARED countermeasure protocols.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={resetToday}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCD5C7] bg-[#FFFFFF] hover:bg-[#EDE8DE] text-xs font-mono font-semibold text-[#0B1736] transition-all cursor-pointer shadow-xs active:scale-95"
            title="Reset flight ration counters to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5A657D]" />
            <span>Reset Flight Log</span>
          </button>
        </div>
      </div>

      {/* ── TOP KPI ROW (WARM ALABASTER CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Energy Target */}
        <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-2xl p-5 shadow-[0_4px_20px_rgba(11,23,54,0.05)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A657D] font-semibold">
                Daily Energy Intake
              </span>
              <div className="text-2xl font-extrabold text-[#0B1736] mt-1 tracking-tight">
                {consumedCalories.toLocaleString()} <span className="text-xs font-mono font-normal text-[#5A657D]">/ {targetCalories} kcal</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#E06D06] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="w-full h-2 bg-[#EDE8DE] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-[#E06D06] rounded-full transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#5A657D]">
              <span>Progress: {calPercent}%</span>
              <span>Remaining: {Math.max(0, targetCalories - consumedCalories)} kcal</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Potable Hydration */}
        <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-2xl p-5 shadow-[0_4px_20px_rgba(11,23,54,0.05)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A657D] font-semibold">
                Potable Hydration
              </span>
              <div className="text-2xl font-extrabold text-[#0B1736] mt-1 tracking-tight">
                {(waterMl / 1000).toFixed(2)} <span className="text-xs font-mono font-normal text-[#5A657D]">/ {targetWaterLiters.toFixed(1)} L</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => addWater(250)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-[#0F2557] hover:bg-[#1A3B8B] text-white text-xs font-bold font-mono flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log +250 mL</span>
            </button>
            <button
              type="button"
              onClick={() => addWater(500)}
              className="py-1.5 px-3 rounded-lg border border-[#DCD5C7] bg-[#EDE8DE] hover:bg-[#DCD5C7] text-[#0B1736] text-xs font-bold font-mono transition-all cursor-pointer active:scale-95"
            >
              +500 mL
            </button>
          </div>
        </div>

        {/* KPI 3: Bone Protection Micronutrients */}
        <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-2xl p-5 shadow-[0_4px_20px_rgba(11,23,54,0.05)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A657D] font-semibold">
                Bone Density Guard
              </span>
              <div className="text-sm font-bold text-[#0B1736] mt-1.5 space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-[#5A657D]">Vitamin D3:</span>
                  <span className="font-mono font-bold text-[#0B1736]">{consumedVitD} / 1,000 IU</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-[#5A657D]">Calcium:</span>
                  <span className="font-mono font-bold text-[#0B1736]">{consumedCalcium} / 1,100 mg</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Bone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#DCD5C7] text-[11px] font-mono text-[#5A657D] flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-500" />
            <span>Simulated solar pulse active</span>
          </div>
        </div>

        {/* KPI 4: SANS Fluid Shift Prevention (Sodium Cap) */}
        <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-2xl p-5 shadow-[0_4px_20px_rgba(11,23,54,0.05)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A657D] font-semibold">
                Sodium Ceiling (SANS Protocol)
              </span>
              <div className="text-2xl font-extrabold text-[#0B1736] mt-1 tracking-tight">
                {consumedSodium} <span className="text-xs font-mono font-normal text-[#5A657D]">/ 2,300 mg</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Waves className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="w-full h-2 bg-[#EDE8DE] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  consumedSodium > 2300 ? 'bg-rose-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, (consumedSodium / 2300) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#5A657D]">
              <span>Cap: &lt; 2,300 mg</span>
              <span className={consumedSodium > 2300 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                {consumedSodium > 2300 ? 'Warning: Ceil Exceeded' : 'Safe Orbit Buffer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4-BLOCK FLIGHT RATION SCHEDULE ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#0F2557]" />
            <h2 className="text-xl font-extrabold text-[#0B1736] tracking-tight">
              Daily Flight Ration Sequence (4 Cycles)
            </h2>
          </div>
          <span className="text-xs font-mono text-[#5A657D]">
            {loggedMeals.length} OF 4 RATIONS LOGGED
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {meals.map((meal) => {
            const isLogged = meal.status === 'Logged';
            return (
              <div
                key={meal.id}
                className={`bg-[#FFFFFF] border rounded-3xl p-6 transition-all duration-300 shadow-sm flex flex-col justify-between ${
                  isLogged
                    ? 'border-emerald-400/40 bg-emerald-500/5 shadow-[0_4px_24px_rgba(16,185,129,0.06)]'
                    : 'border-[#DCD5C7] hover:border-[#0F2557]/40 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EDE8DE] border border-[#DCD5C7] flex flex-col items-center justify-center font-mono">
                        <span className="text-xs font-extrabold text-[#0B1736] leading-none">{meal.time.split(':')[0]}</span>
                        <span className="text-[10px] text-[#5A657D] leading-none">:{meal.time.split(':')[1]}</span>
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#0B1736] leading-snug">
                          {meal.name}
                        </h3>
                        <span className="text-xs font-mono text-[#5A657D]">
                          {meal.type}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleMealStatus(meal.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                        isLogged
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[#EDE8DE] hover:bg-[#DCD5C7] text-[#0B1736] border border-[#DCD5C7]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isLogged ? 'Consumed' : 'Mark Logged'}</span>
                    </button>
                  </div>

                  {/* Nutrition Badges */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#DCD5C7]/70 font-mono text-[11px] text-center">
                    <div className="p-2 rounded-xl bg-[#EDE8DE]/60 border border-[#DCD5C7]">
                      <span className="text-[#5A657D] block text-[10px]">ENERGY</span>
                      <strong className="text-[#0B1736]">{meal.calories} kcal</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#EDE8DE]/60 border border-[#DCD5C7]">
                      <span className="text-[#5A657D] block text-[10px]">PROTEIN</span>
                      <strong className="text-[#0B1736]">{meal.protein}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#EDE8DE]/60 border border-[#DCD5C7]">
                      <span className="text-[#5A657D] block text-[10px]">CARBS</span>
                      <strong className="text-[#0B1736]">{meal.carbs}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#EDE8DE]/60 border border-[#DCD5C7]">
                      <span className="text-[#5A657D] block text-[10px]">SODIUM</span>
                      <strong className="text-[#0B1736]">{meal.sodium}mg</strong>
                    </div>
                  </div>

                  {/* Itemized Rations */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-mono text-[#5A657D] uppercase tracking-wider block font-semibold">
                      Packaged Rations in Compartment
                    </span>
                    <div className="space-y-1.5">
                      {meal.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#FFFFFF] border border-[#DCD5C7]/70 hover:border-[#0F2557]/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E06D06]" />
                            <span className="font-semibold text-[#0B1736]">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px] text-[#5A657D]">
                            <span>{item.mass}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#EDE8DE] text-[10px]">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#DCD5C7]/70 flex items-center justify-between text-[11px] font-mono text-[#5A657D]">
                  <span>STORAGE: RATION-BAY // MOD-04</span>
                  <span className="text-[#0F2557] font-semibold">Hydration Port 2 Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── NUTRITIONAL GUIDELINES CALLOUT (NASA STD-3001) ── */}
      <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-[#E06D06] flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-[#0B1736]">
              NASA STD-3001 Microgravity Food System Directive
            </h4>
            <p className="text-xs text-[#5A657D] leading-relaxed max-w-3xl">
              All flight rations are packaged in vacuum-sealed retort pouches or septum-injection rehydratable canisters. Ensure hot water temperature exceeds 68°C before rehydrating protein slurry pouches to guarantee pathogen safety and proper re-solubilization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-mono font-bold">
            Allergens: Verified Clear
          </span>
        </div>
      </div>
    </div>
  );
}
