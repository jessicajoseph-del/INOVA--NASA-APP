import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Utensils,
  Plus,
  CheckCircle2,
  AlertCircle,
  Flame,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Search,
  Filter,
  Clock,
  Trash2,
  Copy,
  Edit3,
  X,
  ChevronRight,
  Hand,
  Bell,
  Sliders,
  Check,
  Scale
} from 'lucide-react';

export const INITIAL_FOODS = [
  { id: 'rice', name: 'Cooked brown rice', category: 'prepared', stock_g: 1000, portion_g: 100, kcal: 130, protein: 2.7, carbs: 28, fat: 1, fiber: 1.8, sodium: 5, color: 'amber', storage: 'Keep sealed; demo storage only' },
  { id: 'chicken', name: 'Prepared chicken curry', category: 'prepared', stock_g: 900, portion_g: 100, kcal: 160, protein: 20, carbs: 8, fat: 5, fiber: 1, sodium: 350, color: 'rust', storage: 'Use approved preparation procedure' },
  { id: 'vegetables', name: 'Cooked mixed vegetables', category: 'prepared', stock_g: 800, portion_g: 100, kcal: 65, protein: 3, carbs: 10, fat: 1.5, fiber: 3.5, sodium: 70, color: 'green', storage: 'Demo item — not flight qualified' },
  { id: 'eggs', name: 'Prepared scrambled eggs', category: 'prepared', stock_g: 500, portion_g: 100, kcal: 155, protein: 12, carbs: 2, fat: 11, fiber: 0, sodium: 180, color: 'gold', storage: 'Demo prepared food' },
  { id: 'bread', name: 'Wheat flatbread', category: 'ingredients', stock_g: 600, portion_g: 60, kcal: 190, protein: 5, carbs: 33, fat: 5, fiber: 1.6, sodium: 380, color: 'cream', storage: 'Sealed dry storage; demonstration' },
  { id: 'banana', name: 'Banana', category: 'snacks', stock_g: 600, portion_g: 100, kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sodium: 1, color: 'yellow', storage: 'Fresh food availability is illustrative' },
  { id: 'almonds', name: 'Almonds', category: 'snacks', stock_g: 400, portion_g: 30, kcal: 174, protein: 6, carbs: 6, fat: 15, fiber: 3.5, sodium: 1, color: 'brown', storage: 'Contains nuts' },
  { id: 'oats', name: 'Prepared oatmeal', category: 'prepared', stock_g: 800, portion_g: 150, kcal: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, sodium: 90, color: 'cream', storage: 'Prepared food; demo storage only' },
  { id: 'salmon', name: 'Prepared salmon', category: 'prepared', stock_g: 500, portion_g: 100, kcal: 170, protein: 23, carbs: 0, fat: 8, fiber: 0, sodium: 300, color: 'coral', storage: 'Contains fish' },
  { id: 'soup', name: 'Vegetable soup', category: 'prepared', stock_g: 900, portion_g: 200, kcal: 100, protein: 4, carbs: 16, fat: 2, fiber: 3, sodium: 400, color: 'rust', storage: 'Demo storage only' },
  { id: 'milk', name: 'Milk beverage', category: 'drinks', stock_g: 1000, portion_g: 200, kcal: 100, protein: 7, carbs: 10, fat: 3.5, fiber: 0, sodium: 90, color: 'cream', storage: 'Contains dairy; demo storage only' },
  { id: 'juice', name: 'Orange beverage', category: 'drinks', stock_g: 1000, portion_g: 200, kcal: 90, protein: 1, carbs: 21, fat: 0, fiber: 0, sodium: 10, color: 'orange', storage: 'Demo prepared beverage' },
  { id: 'water', name: 'Drinking water', category: 'drinks', stock_g: 3000, portion_g: 250, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, color: 'blue', storage: 'Demo water allocation' },
  { id: 'bar', name: 'Energy bar', category: 'snacks', stock_g: 400, portion_g: 50, kcal: 200, protein: 8, carbs: 25, fat: 8, fiber: 3, sodium: 140, color: 'brown', storage: 'Check product allergens' },
  { id: 'spice', name: 'Seasoning blend', category: 'ingredients', stock_g: 100, portion_g: 5, kcal: 10, protein: 0.3, carbs: 2, fat: 0.1, fiber: 0.5, sodium: 120, color: 'rust', storage: 'Demonstration seasoning' },
];

const SLOTS = ['breakfast', 'lunch', 'snacks', 'dinner'];
const TIMES = { breakfast: '08:00', lunch: '12:30', snacks: '16:00', dinner: '19:00' };

function getLocalDateStr(dateObj = new Date()) {
  const d = dateObj;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function SpaceKitchen() {
  const todayStr = useMemo(() => getLocalDateStr(), []);
  const [selectedDay, setSelectedDay] = useState(todayStr);
  const [currentView, setCurrentView] = useState('daily'); // 'daily' | 'pantry' | 'weekly'
  const [gloveActive, setGloveActive] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Profile targets
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('space_kitchen_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'CDR. Alex Vance',
      weight_kg: 75,
      height_cm: 175,
      age: 35,
      gender: 'Commander',
      kcal_target: 2600,
      protein_target: 110,
      carbs_target: 320,
      fat_target: 80,
    };
  });

  // Food inventory
  const [foods, setFoods] = useState(() => {
    try {
      const saved = localStorage.getItem('space_kitchen_foods');
      if (saved) return JSON.parse(saved);
    } catch {}
    const exp = addDays(todayStr, 35);
    return INITIAL_FOODS.map((f) => ({ ...f, expiry: exp }));
  });

  // Meals array
  const [meals, setMeals] = useState(() => {
    try {
      const saved = localStorage.getItem('space_kitchen_meals');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed initial demo meals for today
    return [
      {
        id: 101,
        day: todayStr,
        slot: 'breakfast',
        time: '08:00',
        status: 'eaten',
        items: [
          { food_id: 'eggs', grams: 120 },
          { food_id: 'bread', grams: 60 },
          { food_id: 'juice', grams: 200 },
        ],
        consumption: {
          fraction: 1,
          totals: { kcal: 466, protein: 20.4, carbs: 55.4, fat: 18.2, fiber: 1.6, sodium: 606, mass: 380 },
        },
        baseline: { kcal: 466, protein: 20.4, carbs: 55.4, fat: 18.2 },
      },
      {
        id: 102,
        day: todayStr,
        slot: 'lunch',
        time: '12:30',
        status: 'planned',
        items: [
          { food_id: 'salmon', grams: 140 },
          { food_id: 'rice', grams: 150 },
          { food_id: 'vegetables', grams: 100 },
        ],
        baseline: { kcal: 498, protein: 39.3, carbs: 52, fat: 14.2 },
      },
    ];
  });

  // Modals state
  const [builderModal, setBuilderModal] = useState({ open: false, day: '', slot: '', id: null });
  const [draftItems, setDraftItems] = useState({}); // { [foodId]: grams }
  const [mealTimeInput, setMealTimeInput] = useState('08:00');
  const [pantrySearch, setPantrySearch] = useState('');
  const [pantryCategory, setPantryCategory] = useState('all');
  const [builderSearch, setBuilderSearch] = useState('');
  const [builderCategory, setBuilderCategory] = useState('all');

  const [openContainerModal, setOpenContainerModal] = useState({ open: false, mealId: null, boxOpen: false });
  const [consumptionFraction, setConsumptionFraction] = useState(1);
  const [prepModal, setPrepModal] = useState({ open: false, stepText: '', dishes: [], mealId: null });
  const [copyModal, setCopyModal] = useState({ open: false, mealId: null, date: '', slot: 'lunch' });
  const [profileModal, setProfileModal] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('space_kitchen_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('space_kitchen_foods', JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem('space_kitchen_meals', JSON.stringify(meals));
  }, [meals]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Calculate available grams for a food
  const getReservedGrams = (foodId, excludeMealId = null) => {
    let sum = 0;
    meals.forEach((m) => {
      if (m.status === 'planned' && m.id !== excludeMealId) {
        m.items?.forEach((it) => {
          if (it.food_id === foodId) sum += it.grams;
        });
      }
    });
    return sum;
  };

  const getAvailableGrams = (foodId, excludeMealId = null) => {
    const f = foods.find((item) => item.id === foodId);
    if (!f) return 0;
    const reserved = getReservedGrams(foodId, excludeMealId);
    return Math.max(0, f.stock_g - reserved);
  };

  // Helper to calculate totals for a list of items
  const calculateTotals = (itemsList) => {
    const t = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, mass: 0 };
    itemsList.forEach((it) => {
      const f = foods.find((food) => food.id === it.food_id);
      if (!f) return;
      t.mass += it.grams;
      t.kcal += (f.kcal * it.grams) / f.portion_g;
      t.protein += (f.protein * it.grams) / f.portion_g;
      t.carbs += (f.carbs * it.grams) / f.portion_g;
      t.fat += (f.fat * it.grams) / f.portion_g;
      t.fiber += (f.fiber * it.grams) / f.portion_g;
      t.sodium += (f.sodium * it.grams) / f.portion_g;
    });
    Object.keys(t).forEach((k) => (t[k] = Math.round(t[k] * 10) / 10));
    return t;
  };

  // Find meal
  const getMeal = (day, slot) => meals.find((m) => m.day === day && m.slot === slot);

  // Macro progress for selectedDay
  const dayProgress = useMemo(() => {
    const recorded = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    meals
      .filter((m) => m.day === selectedDay && m.consumption)
      .forEach((m) => {
        Object.keys(recorded).forEach((k) => {
          recorded[k] += m.consumption.totals[k] || 0;
        });
      });
    return {
      kcal: Math.round(recorded.kcal),
      protein: Math.round(recorded.protein),
      carbs: Math.round(recorded.carbs),
      fat: Math.round(recorded.fat),
    };
  }, [meals, selectedDay]);

  // Handle open Meal Builder
  const handleOpenBuilder = (day, slot) => {
    const existing = getMeal(day, slot);
    if (existing?.status === 'eaten') {
      showToast('This ration is already consumed and locked in telemetry.');
      return;
    }
    const initialDraft = {};
    if (existing?.items) {
      existing.items.forEach((it) => {
        initialDraft[it.food_id] = it.grams;
      });
    }
    setDraftItems(initialDraft);
    setMealTimeInput(existing?.time || TIMES[slot]);
    setBuilderModal({ open: true, day, slot, id: existing?.id || null });
    setBuilderSearch('');
    setBuilderCategory('all');
  };

  // Save meal and trigger preparation animation
  const handleSaveMeal = () => {
    const itemsList = Object.entries(draftItems)
      .filter(([_, g]) => g > 0)
      .map(([food_id, grams]) => ({ food_id, grams }));

    if (!itemsList.length) {
      showToast('Select at least one food item for your container.');
      return;
    }

    const { day, slot, id } = builderModal;
    const totals = calculateTotals(itemsList);
    const existing = id ? meals.find((m) => m.id === id) : null;
    const baseline = existing?.baseline || { ...totals };

    const mealId = id || Date.now();
    const newMeal = {
      id: mealId,
      day,
      slot,
      time: mealTimeInput,
      status: 'planned',
      items: itemsList,
      totals,
      baseline,
    };

    setMeals((prev) => {
      const filtered = prev.filter((m) => !(m.day === day && m.slot === slot));
      return [...filtered, newMeal];
    });

    setBuilderModal({ open: false, day: '', slot: '', id: null });

    // Trigger preparation sequence
    startPreparationAnimation(newMeal);
  };

  // Preparation sequence animation
  const startPreparationAnimation = (meal) => {
    setPrepModal({ open: true, stepText: 'Initializing food vacuum seal release...', dishes: [], mealId: meal.id });
    let i = 0;
    const loadedDishes = [];

    const interval = setInterval(() => {
      if (i < meal.items.length) {
        const item = meal.items[i];
        const f = foods.find((food) => food.id === item.food_id);
        loadedDishes.push(f?.color || 'amber');
        setPrepModal({
          open: true,
          stepText: `Arranging ${f?.name || 'Ration'} (${item.grams}g)`,
          dishes: [...loadedDishes],
          mealId: meal.id,
        });
        i++;
      } else {
        clearInterval(interval);
        setPrepModal({
          open: true,
          stepText: 'Container pressurized & sealed. Ready for consumption.',
          dishes: [...loadedDishes],
          mealId: meal.id,
        });
        setTimeout(() => {
          setPrepModal({ open: false, stepText: '', dishes: [], mealId: null });
          openMealContainer(meal.id);
        }, 1100);
      }
    }, 800);
  };

  // Open Meal Container Modal
  const openMealContainer = (mealId) => {
    setOpenContainerModal({ open: true, mealId, boxOpen: false });
    setTimeout(() => {
      setOpenContainerModal((prev) => ({ ...prev, boxOpen: true }));
    }, 150);
  };

  // Confirm amount eaten & deduct stock
  const handleConfirmEaten = () => {
    const meal = meals.find((m) => m.id === openContainerModal.mealId);
    if (!meal) return;

    const fraction = Number(consumptionFraction);
    const totals = calculateTotals(meal.items);
    const eatenTotals = {
      kcal: Math.round(totals.kcal * fraction),
      protein: Math.round(totals.protein * fraction * 10) / 10,
      carbs: Math.round(totals.carbs * fraction * 10) / 10,
      fat: Math.round(totals.fat * fraction * 10) / 10,
      fiber: Math.round(totals.fiber * fraction * 10) / 10,
      sodium: Math.round(totals.sodium * fraction),
      mass: Math.round(totals.mass * fraction),
    };

    // Deduct stock
    setFoods((prevFoods) =>
      prevFoods.map((f) => {
        const matched = meal.items.find((it) => it.food_id === f.id);
        if (matched) {
          const deducted = matched.grams * fraction;
          return { ...f, stock_g: Math.max(0, f.stock_g - deducted) };
        }
        return f;
      })
    );

    // Update meal status to eaten
    setMeals((prev) =>
      prev.map((m) =>
        m.id === meal.id
          ? {
              ...m,
              status: 'eaten',
              consumption: {
                fraction,
                totals: eatenTotals,
              },
            }
          : m
      )
    );

    setOpenContainerModal({ open: false, mealId: null, boxOpen: false });
    showToast(`Consumption confirmed (${fraction * 100}%). Onboard pantry stock updated.`);
  };

  // Clear / delete meal
  const handleDeleteMeal = (mealId) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
    setOpenContainerModal({ open: false, mealId: null, boxOpen: false });
    showToast('Planned meal cleared. Reserved food released to pantry.');
  };

  // Suggestions algorithm for rest-of-day
  const restOfDaySuggestions = useMemo(() => {
    const dayMeals = meals.filter((m) => m.day === selectedDay);
    let totalUsedKcal = 0;
    let totalUsedProtein = 0;

    dayMeals.forEach((m) => {
      const t = m.consumption ? m.consumption.totals : m.totals || calculateTotals(m.items || []);
      totalUsedKcal += t.kcal || 0;
      totalUsedProtein += t.protein || 0;
    });

    const gapKcal = Math.max(0, profile.kcal_target - totalUsedKcal);
    const gapProtein = Math.max(0, profile.protein_target - totalUsedProtein);

    const available = foods
      .filter((f) => getAvailableGrams(f.id) >= f.portion_g && f.kcal > 0)
      .map((f) => ({
        ...f,
        diff: Math.abs(f.kcal - gapKcal) + Math.abs(f.protein - gapProtein) * 4,
      }))
      .sort((a, b) => a.diff - b.diff);

    return {
      usedKcal: Math.round(totalUsedKcal),
      usedProtein: Math.round(totalUsedProtein),
      gapKcal: Math.round(gapKcal),
      gapProtein: Math.round(gapProtein),
      recommendations: available.slice(0, 3),
    };
  }, [meals, selectedDay, foods, profile]);

  return (
    <div className={`space-kitchen-root ${gloveActive ? 'sk-glove-active' : ''}`}>
      {/* ── EMBEDDED CSS ART & ANIMATIONS ── */}
      <style>{`
        .sk-dish {
          width: 54px;
          height: 80px;
          border-radius: 45%;
          box-shadow: inset -8px -6px 14px rgba(0,0,0,0.22), 3px 3px 8px rgba(0,0,0,0.12);
          display: inline-block;
          flex-shrink: 0;
        }
        .sk-amber, .sk-gold { background: repeating-radial-gradient(ellipse, #d9ab60 0 4px, #b88032 5px 8px); }
        .sk-green { background: repeating-radial-gradient(ellipse, #71984a 0 5px, #2b6a47 7px 12px); }
        .sk-rust, .sk-orange { background: repeating-radial-gradient(ellipse, #cb8040 0 6px, #a04d29 8px 13px); }
        .sk-cream { background: repeating-radial-gradient(ellipse, #f5dfb1 0 4px, #ccb48b 6px 11px); }
        .sk-brown { background: repeating-radial-gradient(ellipse, #b88c5d 0 4px, #775039 5px 9px); }
        .sk-coral { background: repeating-linear-gradient(25deg, #edb096 0 5px, #ca816b 7px 15px); }
        .sk-yellow { background: #e9c868; }
        .sk-blue { background: linear-gradient(130deg, #d9f5f6, #6ab9c4); }

        .sk-mealbox {
          height: 190px;
          border-radius: 28px;
          background: #e2d9cb;
          border: 9px solid #b9b3a8;
          position: relative;
          margin: 18px auto;
          perspective: 800px;
          max-width: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.15), 0 10px 25px rgba(11,23,54,0.1);
        }
        .sk-lid {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: rgba(188, 214, 212, 0.94);
          backdrop-filter: blur(4px);
          z-index: 10;
          display: grid;
          place-items: center;
          color: #102832;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.25em;
          transform-origin: top;
          transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
          border: 1px solid rgba(255,255,255,0.4);
        }
        .sk-mealbox.open .sk-lid {
          transform: rotateX(110deg);
          opacity: 0;
          pointer-events: none;
        }
        .sk-prep-bowl {
          height: 180px;
          background: #e2d9cb;
          border-radius: 40% 40% 35% 35%;
          border: 10px solid #bdb5a8;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 20px auto;
          max-width: 420px;
          box-shadow: 0 12px 30px rgba(11,23,54,0.15);
        }
        .sk-dish-drop {
          animation: skDrop 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes skDrop {
          from {
            transform: translateY(-90px) scale(0.6) rotate(-15deg);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .sk-glove-active, .sk-glove-active * {
          cursor: crosshair !important;
        }
      `}</style>

      {/* ── TOAST ALERT ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#0B1736] text-[#F7F4EE] border border-[#DCD5C7] shadow-xl text-xs font-mono flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#E06D06]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── TOP ACTION & SUB-NAV BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCD5C7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0B1736] text-[#F7F4EE] flex items-center justify-center font-bold font-mono text-sm shadow-sm">
            🍳
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1736] tracking-tight">
              Space Kitchen Onboard Studio
            </h2>
            <p className="text-xs text-[#5A657D]">
              Microgravity food pantry, daily meal assembler, thermal box opening & stock depletion ledger.
            </p>
          </div>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-[#EDE8DE] p-1 border border-[#DCD5C7]">
            <button
              type="button"
              onClick={() => setCurrentView('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                currentView === 'daily'
                  ? 'bg-[#0B1736] text-[#F7F4EE] shadow-xs'
                  : 'text-[#5A657D] hover:text-[#0B1736]'
              }`}
            >
              Daily Rations
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('pantry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                currentView === 'pantry'
                  ? 'bg-[#0B1736] text-[#F7F4EE] shadow-xs'
                  : 'text-[#5A657D] hover:text-[#0B1736]'
              }`}
            >
              Onboard Pantry ({foods.length})
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                currentView === 'weekly'
                  ? 'bg-[#0B1736] text-[#F7F4EE] shadow-xs'
                  : 'text-[#5A657D] hover:text-[#0B1736]'
              }`}
            >
              Weekly Matrix
            </button>
          </div>

          <button
            type="button"
            onClick={() => setProfileModal(true)}
            className="px-3 py-1.5 rounded-xl border border-[#DCD5C7] bg-[#FFFFFF] hover:bg-[#EDE8DE] text-xs font-mono font-bold text-[#0B1736] transition-all flex items-center gap-1.5"
            title="Edit metabolic profile & nutritional targets"
          >
            <Sliders className="w-3.5 h-3.5 text-[#5A657D]" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setGloveActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              gloveActive
                ? 'bg-amber-100 border-amber-300 text-[#E06D06]'
                : 'border-[#DCD5C7] bg-[#FFFFFF] hover:bg-[#EDE8DE] text-[#5A657D]'
            }`}
            title="Toggle EVA Glove Cursor"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>{gloveActive ? 'Glove: ON' : 'Glove Cursor'}</span>
          </button>
        </div>
      </div>

      {/* ── DATE SELECTION & DAILY MACRO TELEMETRY ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#5A657D]" />
          <span className="text-xs font-mono text-[#5A657D] uppercase tracking-wider font-semibold">Active Date:</span>
          <input
            type="date"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[#DCD5C7] bg-[#FFFFFF] text-[#0B1736] focus:outline-none focus:ring-1 focus:ring-[#0B1736]"
          />
          {selectedDay === todayStr && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-mono font-bold">
              TODAY (FLIGHT DAY)
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono text-[#5A657D]">
          Crew Member: <strong className="text-[#0B1736]">{profile.name}</strong> • Target: {profile.kcal_target} kcal
        </span>
      </div>

      {/* ── 4 NUTRITIONAL PROGRESS METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* ENERGY */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DCD5C7] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#5A657D] uppercase">Energy Consumed</span>
            <span className="text-xs font-mono font-bold text-[#E06D06]">
              {Math.min(100, Math.round((dayProgress.kcal / profile.kcal_target) * 100))}%
            </span>
          </div>
          <div className="text-lg font-extrabold text-[#0B1736] mt-1 font-mono">
            {dayProgress.kcal} <span className="text-xs text-[#5A657D] font-normal">/ {profile.kcal_target} kcal</span>
          </div>
          <div className="w-full h-1.5 bg-[#EDE8DE] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-[#E06D06] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (dayProgress.kcal / profile.kcal_target) * 100)}%` }}
            />
          </div>
        </div>

        {/* PROTEIN */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DCD5C7] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#5A657D] uppercase">Protein Recorded</span>
            <span className="text-xs font-mono font-bold text-cyan-600">
              {Math.min(100, Math.round((dayProgress.protein / profile.protein_target) * 100))}%
            </span>
          </div>
          <div className="text-lg font-extrabold text-[#0B1736] mt-1 font-mono">
            {dayProgress.protein} <span className="text-xs text-[#5A657D] font-normal">/ {profile.protein_target} g</span>
          </div>
          <div className="w-full h-1.5 bg-[#EDE8DE] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-cyan-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (dayProgress.protein / profile.protein_target) * 100)}%` }}
            />
          </div>
        </div>

        {/* CARBS */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DCD5C7] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#5A657D] uppercase">Carbohydrates</span>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {Math.min(100, Math.round((dayProgress.carbs / profile.carbs_target) * 100))}%
            </span>
          </div>
          <div className="text-lg font-extrabold text-[#0B1736] mt-1 font-mono">
            {dayProgress.carbs} <span className="text-xs text-[#5A657D] font-normal">/ {profile.carbs_target} g</span>
          </div>
          <div className="w-full h-1.5 bg-[#EDE8DE] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (dayProgress.carbs / profile.carbs_target) * 100)}%` }}
            />
          </div>
        </div>

        {/* FAT */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DCD5C7] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#5A657D] uppercase">Lipids & Fats</span>
            <span className="text-xs font-mono font-bold text-indigo-600">
              {Math.min(100, Math.round((dayProgress.fat / profile.fat_target) * 100))}%
            </span>
          </div>
          <div className="text-lg font-extrabold text-[#0B1736] mt-1 font-mono">
            {dayProgress.fat} <span className="text-xs text-[#5A657D] font-normal">/ {profile.fat_target} g</span>
          </div>
          <div className="w-full h-1.5 bg-[#EDE8DE] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (dayProgress.fat / profile.fat_target) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}

      {/* 1. DAILY MEALS VIEW */}
      {currentView === 'daily' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SLOTS.map((slot) => {
              const meal = getMeal(selectedDay, slot);
              const isEaten = meal?.status === 'eaten';
              const isPlanned = meal?.status === 'planned';
              const items = meal?.items || [];
              const totals = meal ? (meal.consumption ? meal.consumption.totals : meal.totals) : null;

              return (
                <div
                  key={slot}
                  className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                    isEaten
                      ? 'bg-emerald-500/5 border-emerald-300'
                      : isPlanned
                      ? 'bg-[#FFFFFF] border-[#DCD5C7] hover:border-[#0B1736]'
                      : 'bg-[#EDE8DE]/40 border-dashed border-[#DCD5C7]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E06D06]" />
                        <h3 className="text-sm font-mono font-extrabold uppercase tracking-wider text-[#0B1736]">
                          {slot}
                        </h3>
                        <span className="text-xs font-mono text-[#5A657D]">
                          ({meal?.time || TIMES[slot]})
                        </span>
                      </div>
                      {isEaten && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>CONSUMED ({meal.consumption.fraction * 100}%)</span>
                        </span>
                      )}
                      {isPlanned && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#E06D06] text-[10px] font-mono font-bold">
                          PLANNED (RESERVED)
                        </span>
                      )}
                    </div>

                    {/* Food artwork miniature plate */}
                    <div className="my-4 h-28 rounded-2xl bg-[#EDE8DE] border border-[#DCD5C7] flex items-center justify-center gap-3 p-3 overflow-hidden shadow-inner">
                      {items.length > 0 ? (
                        items.slice(0, 4).map((it, idx) => {
                          const f = foods.find((food) => food.id === it.food_id);
                          return (
                            <div
                              key={idx}
                              className={`sk-dish sk-${f?.color || 'amber'}`}
                              title={`${f?.name} (${it.grams}g)`}
                            />
                          );
                        })
                      ) : (
                        <span className="text-xs font-mono text-[#5A657D] italic">
                          No rations selected for this slot
                        </span>
                      )}
                    </div>

                    {/* Description & food item list */}
                    {items.length > 0 ? (
                      <div className="space-y-1 mb-3">
                        <div className="text-xs font-bold text-[#0B1736]">
                          {items
                            .map((it) => {
                              const f = foods.find((food) => food.id === it.food_id);
                              return `${f?.name || it.food_id} (${it.grams}g)`;
                            })
                            .join(' + ')}
                        </div>
                        {totals && (
                          <div className="text-[11px] font-mono text-[#5A657D]">
                            <strong>{totals.kcal} kcal</strong> • P {totals.protein}g • C {totals.carbs}g • F {totals.fat}g • {totals.mass}g mass
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-[#5A657D] mb-3">
                        Choose rations from your unreserved onboard pantry stock.
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-[#DCD5C7]/70 flex items-center gap-2">
                    {meal ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openMealContainer(meal.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#0B1736] hover:bg-[#1A2E5A] text-[#F7F4EE] text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                          <span>Open Meal Container</span>
                        </button>
                        {!isEaten && (
                          <button
                            type="button"
                            onClick={() => handleOpenBuilder(selectedDay, slot)}
                            className="py-2 px-3 rounded-xl border border-[#DCD5C7] bg-[#FFFFFF] hover:bg-[#EDE8DE] text-xs font-mono font-bold text-[#0B1736] transition-all"
                            title="Edit grams & food composition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenBuilder(selectedDay, slot)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#EDE8DE] hover:bg-[#DCD5C7] text-[#0B1736] text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 border border-[#DCD5C7]"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#E06D06]" />
                        <span>Assemble {slot}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rest-of-day gap suggestions */}
          <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#DCD5C7] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E06D06]" />
              <h4 className="text-sm font-extrabold text-[#0B1736] tracking-tight">
                Metabolic Rest-of-Day Gap Analysis
              </h4>
            </div>
            <p className="text-xs text-[#5A657D] leading-relaxed">
              Based on logged intake and remaining planned rations: Projected intake is{' '}
              <strong className="text-[#0B1736]">{restOfDaySuggestions.usedKcal} kcal</strong> and{' '}
              <strong className="text-[#0B1736]">{restOfDaySuggestions.usedProtein}g protein</strong>. Remaining target gap:{' '}
              <strong className="text-[#E06D06]">{restOfDaySuggestions.gapKcal} kcal</strong> /{' '}
              <strong className="text-cyan-700">{restOfDaySuggestions.gapProtein}g protein</strong>.
            </p>
            {restOfDaySuggestions.recommendations.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono text-[#5A657D] font-bold">Suggested additions:</span>
                {restOfDaySuggestions.recommendations.map((rec) => (
                  <span
                    key={rec.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE8DE] border border-[#DCD5C7] text-xs font-mono text-[#0B1736]"
                  >
                    <span className={`w-2 h-2 rounded-full sk-${rec.color}`} />
                    <span>{rec.name}</span>
                    <span className="text-[#5A657D] text-[10px]">({rec.portion_g}g • {rec.kcal} kcal)</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ONBOARD PANTRY VIEW */}
      {currentView === 'pantry' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A657D]" />
              <input
                type="text"
                placeholder="Search pantry provisions (rice, salmon, fruit)..."
                value={pantrySearch}
                onChange={(e) => setPantrySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-[#DCD5C7] bg-[#FFFFFF] text-[#0B1736] focus:outline-none focus:ring-1 focus:ring-[#0B1736]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#5A657D]" />
              <select
                value={pantryCategory}
                onChange={(e) => setPantryCategory(e.target.value)}
                className="px-3 py-2 text-xs font-mono rounded-xl border border-[#DCD5C7] bg-[#FFFFFF] text-[#0B1736] focus:outline-none focus:ring-1 focus:ring-[#0B1736]"
              >
                <option value="all">All Categories ({foods.length})</option>
                <option value="prepared">Prepared Foods</option>
                <option value="ingredients">Ingredients</option>
                <option value="drinks">Drinks & Hydration</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {foods
              .filter((f) => {
                const matchesCat = pantryCategory === 'all' || f.category === pantryCategory;
                const matchesSearch = f.name.toLowerCase().includes(pantrySearch.toLowerCase());
                return matchesCat && matchesSearch;
              })
              .map((f) => {
                const reserved = getReservedGrams(f.id);
                const available = Math.max(0, f.stock_g - reserved);

                return (
                  <div
                    key={f.id}
                    className="rounded-2xl border border-[#DCD5C7] bg-[#FFFFFF] overflow-hidden shadow-xs hover:border-[#0B1736] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Food Art Canvas */}
                      <div className="h-28 bg-[#EDE8DE] flex items-center justify-center p-3 border-b border-[#DCD5C7]/70">
                        <div className={`sk-dish sk-${f.color}`} title={f.name} />
                      </div>

                      {/* Food Details */}
                      <div className="p-4 space-y-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-sm font-extrabold text-[#0B1736] leading-snug">{f.name}</h4>
                          <span className="px-1.5 py-0.5 rounded bg-[#EDE8DE] text-[9px] font-mono uppercase text-[#5A657D]">
                            {f.category}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-[#5A657D] space-y-0.5 pt-1">
                          <div className="flex justify-between">
                            <span>Physical Stock:</span>
                            <strong className="text-[#0B1736]">{f.stock_g}g</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Unreserved:</span>
                            <strong className={available > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                              {available}g
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Demo Portion:</span>
                            <span>{f.portion_g}g ({f.kcal} kcal)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Protein / Carbs:</span>
                            <span>{f.protein}g / {f.carbs}g</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-[#5A657D] italic pt-1 border-t border-[#DCD5C7]/50 truncate">
                          {f.storage}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#EDE8DE]/40 border-t border-[#DCD5C7]/70">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('daily');
                          handleOpenBuilder(selectedDay, 'lunch');
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#0B1736] hover:bg-[#1A2E5A] text-[#F7F4EE] text-xs font-mono font-bold transition-all shadow-xs"
                      >
                        Add to Meal Plan
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 3. WEEKLY PLANNER MATRIX */}
      {currentView === 'weekly' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0B1736]">
              7-Day Expedition Ration Matrix
            </h3>
            <span className="text-xs font-mono text-[#5A657D]">
              Starts: {selectedDay}
            </span>
          </div>

          <div className="overflow-x-auto border border-[#DCD5C7] rounded-3xl bg-[#FFFFFF] shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#DCD5C7] bg-[#EDE8DE]/60 text-[11px] font-mono uppercase text-[#5A657D]">
                  <th className="p-3.5 font-bold">Date</th>
                  {SLOTS.map((slot) => (
                    <th key={slot} className="p-3.5 font-bold">{slot}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD5C7]">
                {Array.from({ length: 7 }, (_, i) => {
                  const dayStr = addDays(selectedDay, i);
                  return (
                    <tr key={dayStr} className="hover:bg-[#EDE8DE]/20 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#0B1736] whitespace-nowrap">
                        {dayStr}
                        {dayStr === todayStr && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px]">
                            TODAY
                          </span>
                        )}
                      </td>
                      {SLOTS.map((slot) => {
                        const m = getMeal(dayStr, slot);
                        const isEaten = m?.status === 'eaten';
                        return (
                          <td key={slot} className="p-3 min-w-[150px]">
                            {m ? (
                              <div className="space-y-1">
                                <button
                                  type="button"
                                  onClick={() => openMealContainer(m.id)}
                                  className={`w-full text-left p-2 rounded-xl border text-xs transition-all ${
                                    isEaten
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                      : 'bg-[#EDE8DE]/60 border-[#DCD5C7] hover:border-[#0B1736]'
                                  }`}
                                >
                                  <div className="font-bold flex items-center justify-between">
                                    <span>{m.time}</span>
                                    {isEaten && <span className="text-[10px]">✓ Eaten</span>}
                                  </div>
                                  <div className="text-[11px] text-[#5A657D] truncate">
                                    {m.items?.map((it) => it.food_id).join(', ')}
                                  </div>
                                  {m.totals && (
                                    <div className="text-[10px] font-mono text-[#0B1736]">
                                      {m.totals.kcal} kcal
                                    </div>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenBuilder(dayStr, slot)}
                                className="w-full py-2 px-2.5 rounded-xl border border-dashed border-[#DCD5C7] hover:border-[#0B1736] hover:bg-[#EDE8DE]/40 text-[#5A657D] text-[11px] font-mono transition-all text-center"
                              >
                                + Plan
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: ASSEMBLE MEAL BUILDER ── */}
      {builderModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1736]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-[#DCD5C7] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E06D06] font-bold">
                  FLIGHT CONTAINER ASSEMBLER
                </span>
                <h3 className="text-xl font-extrabold text-[#0B1736]">
                  {builderModal.slot.toUpperCase()} • {builderModal.day}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#5A657D]" />
                  <input
                    type="time"
                    value={mealTimeInput}
                    onChange={(e) => setMealTimeInput(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-[#DCD5C7] text-xs font-mono font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setBuilderModal({ open: false, day: '', slot: '', id: null })}
                  className="p-1.5 rounded-xl hover:bg-[#EDE8DE] text-[#5A657D]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body: Left Foods + Right Draft Tray */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Food list (2 cols) */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search available rations..."
                    value={builderSearch}
                    onChange={(e) => setBuilderSearch(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl border border-[#DCD5C7]"
                  />
                  <select
                    value={builderCategory}
                    onChange={(e) => setBuilderCategory(e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-mono rounded-xl border border-[#DCD5C7]"
                  >
                    <option value="all">All</option>
                    <option value="prepared">Prepared</option>
                    <option value="ingredients">Ingredients</option>
                    <option value="drinks">Drinks</option>
                    <option value="snacks">Snacks</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {foods
                    .filter((f) => {
                      const matchesCat = builderCategory === 'all' || f.category === builderCategory;
                      const matchesSearch = f.name.toLowerCase().includes(builderSearch.toLowerCase());
                      return matchesCat && matchesSearch;
                    })
                    .map((f) => {
                      const avail = getAvailableGrams(f.id, builderModal.id);
                      const isSelected = !!draftItems[f.id];

                      return (
                        <div
                          key={f.id}
                          className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-50/70 border-amber-300'
                              : 'bg-[#FFFFFF] border-[#DCD5C7] hover:border-[#0B1736]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`sk-dish sk-${f.color} scale-75 -my-2`} />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-[#0B1736] truncate">{f.name}</h5>
                              <span className="text-[10px] font-mono text-[#5A657D]">
                                {f.kcal} kcal / {f.portion_g}g
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-[#DCD5C7]/60 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-[#5A657D]">Avail: {avail}g</span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentG = draftItems[f.id] || 0;
                                const nextG = Math.min(avail, currentG + f.portion_g);
                                setDraftItems((prev) => ({ ...prev, [f.id]: nextG }));
                              }}
                              disabled={avail <= (draftItems[f.id] || 0)}
                              className="px-2 py-0.5 rounded-lg bg-[#0B1736] text-[#F7F4EE] text-[10px] font-bold disabled:opacity-40"
                            >
                              + {f.portion_g}g
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Column: Selected Container Items & Totals */}
              <div className="rounded-2xl border border-[#DCD5C7] bg-[#EDE8DE]/40 p-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B1736]">
                    Your Container Tray
                  </h4>

                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {Object.entries(draftItems).filter(([_, g]) => g > 0).length === 0 ? (
                      <p className="text-xs text-[#5A657D] italic">No items added to container yet.</p>
                    ) : (
                      Object.entries(draftItems)
                        .filter(([_, g]) => g > 0)
                        .map(([foodId, grams]) => {
                          const f = foods.find((food) => food.id === foodId);
                          const avail = getAvailableGrams(foodId, builderModal.id);
                          return (
                            <div
                              key={foodId}
                              className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#DCD5C7] space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-xs font-bold text-[#0B1736]">
                                <span className="truncate">{f?.name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDraftItems((prev) => {
                                      const next = { ...prev };
                                      delete next[foodId];
                                      return next;
                                    });
                                  }}
                                  className="text-[#5A657D] hover:text-rose-600"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-xs font-mono">
                                <span className="text-[#5A657D] text-[10px]">Grams:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max={avail}
                                  value={grams}
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(avail, Number(e.target.value) || 0));
                                    setDraftItems((prev) => ({ ...prev, [foodId]: val }));
                                  }}
                                  className="w-16 px-1.5 py-0.5 rounded border border-[#DCD5C7] text-right font-bold text-xs"
                                />
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="pt-3 border-t border-[#DCD5C7] space-y-2">
                  {(() => {
                    const itemsList = Object.entries(draftItems)
                      .filter(([_, g]) => g > 0)
                      .map(([food_id, grams]) => ({ food_id, grams }));
                    const totals = calculateTotals(itemsList);
                    return (
                      <div className="text-[11px] font-mono text-[#5A657D] space-y-0.5">
                        <div className="flex justify-between text-[#0B1736] font-bold text-xs">
                          <span>Calculated Energy:</span>
                          <span>{totals.kcal} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein: {totals.protein}g</span>
                          <span>Carbs: {totals.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fat: {totals.fat}g</span>
                          <span>Total Mass: {totals.mass}g</span>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={handleSaveMeal}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0B1736] hover:bg-[#1A2E5A] text-[#F7F4EE] text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Save & Prepare Meal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: PREPARATION SEQUENCE ANIMATION ── */}
      {prepModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1736]/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-3xl w-full max-w-lg p-6 text-center space-y-4 shadow-2xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E06D06] font-bold">
              FLIGHT RATION PREPARATION CYLINDER
            </span>
            <h3 className="text-xl font-extrabold text-[#0B1736]">
              Preparing Space Ration
            </h3>

            {/* Preparation Bowl Animation */}
            <div className="sk-prep-bowl">
              {prepModal.dishes.map((color, idx) => (
                <div key={idx} className={`sk-dish sk-${color} sk-dish-drop`} />
              ))}
            </div>

            <p className="text-sm font-mono text-[#0B1736] font-semibold animate-pulse">
              {prepModal.stepText}
            </p>

            <button
              type="button"
              onClick={() => {
                const id = prepModal.mealId;
                setPrepModal({ open: false, stepText: '', dishes: [], mealId: null });
                if (id) openMealContainer(id);
              }}
              className="py-1.5 px-4 rounded-xl border border-[#DCD5C7] bg-[#EDE8DE] hover:bg-[#DCD5C7] text-xs font-mono font-bold text-[#0B1736]"
            >
              Skip Animation & Open Meal Container
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 3: MEAL CONTAINER WITH OPENING LID ANIMATION ── */}
      {openContainerModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1736]/70 backdrop-blur-sm animate-fadeIn">
          {(() => {
            const meal = meals.find((m) => m.id === openContainerModal.mealId);
            if (!meal) return null;
            const isEaten = meal.status === 'eaten';
            const totals = meal.consumption ? meal.consumption.totals : meal.totals || calculateTotals(meal.items);

            return (
              <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#DCD5C7]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#E06D06] font-bold">
                      FLIGHT MEAL CONTAINER
                    </span>
                    <h3 className="text-xl font-extrabold text-[#0B1736]">
                      {meal.slot.toUpperCase()} • {meal.day} ({meal.time})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenContainerModal({ open: false, mealId: null, boxOpen: false })}
                    className="p-1.5 rounded-xl hover:bg-[#EDE8DE] text-[#5A657D]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 3D Meal Box with Animated Opening Lid */}
                <div className={`sk-mealbox ${openContainerModal.boxOpen ? 'open' : ''}`}>
                  <div className="sk-lid">
                    <span>YOUR SPACE KITCHEN</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    {meal.items?.map((it, idx) => {
                      const f = foods.find((food) => food.id === it.food_id);
                      return (
                        <div
                          key={idx}
                          className={`sk-dish sk-${f?.color || 'amber'}`}
                          title={`${f?.name} (${it.grams}g)`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Nutrition and Items List */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-[#EDE8DE]/40 border border-[#DCD5C7]">
                  <div className="text-xs font-bold text-[#0B1736]">
                    {meal.items
                      ?.map((it) => {
                        const f = foods.find((food) => food.id === it.food_id);
                        return `${f?.name} (${it.grams}g)`;
                      })
                      .join(' • ')}
                  </div>
                  <div className="text-[11px] font-mono text-[#5A657D]">
                    <strong>{totals.kcal} kcal</strong> • Protein {totals.protein}g • Carbs {totals.carbs}g • Fat {totals.fat}g • Sodium {totals.sodium}mg
                  </div>
                  {isEaten && (
                    <div className="pt-2 border-t border-[#DCD5C7] text-xs font-mono text-emerald-700 font-bold">
                      Status: {meal.consumption.fraction * 100}% consumed & locked in flight telemetry.
                    </div>
                  )}
                </div>

                {/* Actions: Start eating / Confirm consumption */}
                {!isEaten ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between gap-3 text-xs font-mono">
                      <span className="font-bold text-[#0B1736]">Amount Finished:</span>
                      <select
                        value={consumptionFraction}
                        onChange={(e) => setConsumptionFraction(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-xl border border-[#DCD5C7] bg-[#FFFFFF] font-bold text-[#0B1736]"
                      >
                        <option value={1}>100% (Entire Meal)</option>
                        <option value={0.75}>75% (Three Quarters)</option>
                        <option value={0.5}>50% (Half)</option>
                        <option value={0.25}>25% (Quarter)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmEaten}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B1736] hover:bg-[#1A2E5A] text-[#F7F4EE] text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Confirm Amount Eaten (Deduct Stock)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="py-2.5 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-mono"
                        title="Clear meal & release reserved stock"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOpenContainerModal({ open: false, mealId: null, boxOpen: false })}
                      className="py-2 px-5 rounded-xl bg-[#0B1736] text-[#F7F4EE] text-xs font-mono font-bold"
                    >
                      Close Container
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── MODAL 4: PROFILE EDIT ── */}
      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1736]/65 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCD5C7]">
              <h3 className="text-base font-extrabold text-[#0B1736]">
                Astronaut Metabolic Profile
              </h3>
              <button
                type="button"
                onClick={() => setProfileModal(false)}
                className="p-1 rounded-lg text-[#5A657D] hover:bg-[#EDE8DE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#5A657D] mb-1">Astronaut Name / Callsign</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#DCD5C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A657D] mb-1">Body Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weight_kg}
                    onChange={(e) => setProfile((p) => ({ ...p, weight_kg: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#DCD5C7]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A657D] mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={profile.height_cm}
                    onChange={(e) => setProfile((p) => ({ ...p, height_cm: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#DCD5C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A657D] mb-1">Daily Target (kcal)</label>
                  <input
                    type="number"
                    value={profile.kcal_target}
                    onChange={(e) => setProfile((p) => ({ ...p, kcal_target: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#DCD5C7]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A657D] mb-1">Protein Target (g)</label>
                  <input
                    type="number"
                    value={profile.protein_target}
                    onChange={(e) => setProfile((p) => ({ ...p, protein_target: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#DCD5C7]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setProfileModal(false);
                  showToast('Metabolic profile updated.');
                }}
                className="py-2 px-5 rounded-xl bg-[#0B1736] text-[#F7F4EE] text-xs font-mono font-bold"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

