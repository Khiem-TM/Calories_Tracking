import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// eslint-disable-next-line @typescript-eslint/no-deprecated
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboard } from "@/services/dashboardService";
import { logSteps, logWater } from "@/services/activityService";
import { useUIStore } from "@/stores/uiStore";
import { queryKeys } from "@/utils/queryKeys";
import { useUserStore } from "@/stores/userStore";
import { FoodSearchModal } from "@/features/nutrition/components/FoodSearchModal";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast";
import type { MealLog, MealLogItem, MealType } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const MACRO_TARGETS = { protein: 50, carbs: 275, fat: 78, fiber: 28 };
const MACRO_COLORS = { protein: "#3b82f6", carbs: "#22c55e", fat: "#f97316" };
const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks",
};
const MEAL_EMOJI: Record<MealType, string> = {
  BREAKFAST: "☀️",
  LUNCH: "🥗",
  DINNER: "🌙",
  SNACK: "🍎",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pctColor(pct: number) {
  if (pct >= 100) return "text-blue-600";
  if (pct >= 80) return "text-[#15803d]";
  if (pct >= 50) return "text-amber-500";
  return "text-red-500";
}
function barBg(pct: number) {
  if (pct >= 100) return "bg-blue-500";
  if (pct >= 80) return "bg-[#15803d]";
  if (pct >= 50) return "bg-amber-400";
  return "bg-red-400";
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label, value, valueColor = "text-gray-900", sub, subIcon, progress,
}: {
  label: string; value: number; valueColor?: string;
  sub?: string; subIcon?: React.ReactNode; progress?: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-default">
      <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase font-manrope mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-4xl font-mono font-bold leading-none ${valueColor}`}>
          {Math.round(value).toLocaleString()}
        </span>
        <span className="text-sm text-gray-400 font-manrope">kcal</span>
      </div>
      {progress !== undefined && (
        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#15803d] transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
      {sub && (
        <p className="mt-2 text-xs text-gray-400 font-manrope flex items-center gap-1">
          {subIcon}{sub}
        </p>
      )}
    </div>
  );
}

// ─── Macro Targets Card ───────────────────────────────────────────────────────

function MacroTargetsCard({ protein, carbs, fat, totalCal }: {
  protein: number; carbs: number; fat: number; totalCal: number;
}) {
  const hasMacros = protein > 0 || carbs > 0 || fat > 0;
  const donutData = hasMacros
    ? [
        { name: "Protein", value: Math.round(protein * 4), color: MACRO_COLORS.protein },
        { name: "Carbs",   value: Math.round(carbs * 4),   color: MACRO_COLORS.carbs   },
        { name: "Fat",     value: Math.round(fat * 9),     color: MACRO_COLORS.fat     },
      ]
    : [{ name: "Empty", value: 1, color: "#e5e7eb" }];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-base font-bold text-gray-900 font-newsreader mb-4">
        Macronutrient Targets
      </h2>
      <div className="flex gap-6 items-center">
        {/* Donut chart */}
        <div className="relative shrink-0" style={{ width: 148, height: 148 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData} cx="50%" cy="50%"
                innerRadius={46} outerRadius={66}
                paddingAngle={hasMacros ? 3 : 0}
                dataKey="value" strokeWidth={0}
              >
                {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              {hasMacros && <Tooltip formatter={(v) => [`${v} kcal`]} />}
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-mono font-bold text-gray-900 leading-none">
              {Math.round(totalCal).toLocaleString()}
            </span>
            <span className="text-[9px] font-bold tracking-widest text-gray-400 font-manrope uppercase mt-0.5">
              Total kcal
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1">
          {([
            { label: "Protein", value: protein, target: MACRO_TARGETS.protein, color: MACRO_COLORS.protein },
            { label: "Carbs",   value: carbs,   target: MACRO_TARGETS.carbs,   color: MACRO_COLORS.carbs   },
            { label: "Fat",     value: fat,     target: MACRO_TARGETS.fat,     color: MACRO_COLORS.fat     },
          ]).map(({ label, value, target, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm text-gray-500 font-manrope">{label}</span>
              </div>
              <span className="text-sm font-mono text-gray-700">
                {Math.round(value)}g<span className="text-gray-400">/{target}g</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Nutrient Summary Card ────────────────────────────────────────────────────

function NutrientRow({ label, value, target }: {
  label: string; value: number; target: number; unit?: string;
}) {
  const pct = Math.round(target > 0 ? (value / target) * 100 : 0);
  const pctCapped = Math.min(pct, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-manrope">{label}</span>
        <span className={`text-xs font-bold font-mono ${pctColor(pct)}`}>{pct}%</span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barBg(pct)}`} style={{ width: `${pctCapped}%` }} />
      </div>
    </div>
  );
}

function NutrientSummaryCard({ nutrition }: {
  nutrition: { total_protein: number; total_carbs: number; total_fat: number; total_fiber: number; meal_logs: MealLog[] };
}) {
  const allItems = (nutrition.meal_logs ?? []).flatMap((ml) => ml.items ?? []) as MealLogItem[];
  const sodium = allItems.reduce((s, i) => s + ((i.food?.sodium_per_100g ?? 0) * Number(i.quantity_in_grams)) / 100, 0);
  const sugar  = allItems.reduce((s, i) => s + ((i.food?.sugar_per_100g  ?? 0) * Number(i.quantity_in_grams)) / 100, 0);
  const chol   = allItems.reduce((s, i) => s + ((i.food?.cholesterol_per_100g ?? 0) * Number(i.quantity_in_grams)) / 100, 0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-0.5">
        <h2 className="text-base font-bold text-gray-900 font-newsreader">Nutrient Summary</h2>
        <span className="text-xs text-[#15803d] font-semibold font-manrope flex items-center gap-0.5 cursor-pointer hover:underline">
          View All
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </span>
      </div>
      <p className="text-xs text-gray-400 font-manrope mb-4">Macros & micronutrient tracking</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div className="flex flex-col gap-3">
          <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase font-manrope">Macros</p>
          <NutrientRow label="Protein" value={nutrition.total_protein} target={MACRO_TARGETS.protein} />
          <NutrientRow label="Carbs"   value={nutrition.total_carbs}   target={MACRO_TARGETS.carbs}   />
          <NutrientRow label="Fat"     value={nutrition.total_fat}     target={MACRO_TARGETS.fat}     />
          <NutrientRow label="Fiber"   value={nutrition.total_fiber}   target={MACRO_TARGETS.fiber}   />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase font-manrope">Micros</p>
          <NutrientRow label="Sodium"      value={sodium} target={2300} unit="mg" />
          <NutrientRow label="Sugar"       value={sugar}  target={50}            />
          <NutrientRow label="Cholesterol" value={chol}   target={300}  unit="mg" />
        </div>
      </div>
    </div>
  );
}

// ─── Energy Breakdown Card ────────────────────────────────────────────────────

function EnergyBreakdownCard({ bmr, exercise }: { bmr: number; exercise: number }) {
  const total = bmr + exercise;
  const bmrPct  = total > 0 ? (bmr / total) * 100 : 0;
  const exPct   = total > 0 ? (exercise / total) * 100 : 0;

  return (
    <div className="bg-[#f0fdf4] rounded-2xl p-5 border border-[#dcfce7] hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-[#15803d] font-newsreader uppercase tracking-wide mb-4">
        Energy Breakdown
      </h3>
      <div className="space-y-3">
        {[
          { label: "Basal Metabolic Rate (BMR)", value: bmr,      pct: bmrPct, barClass: "bg-[#15803d]" },
          { label: "Exercise Activity",          value: exercise, pct: exPct,  barClass: "bg-[#4ade80]" },
        ].map(({ label, value, pct, barClass }) => (
          <div key={label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase font-manrope">
                {label}
              </span>
              <span className="text-xs font-mono font-bold text-gray-700">
                {Math.round(value).toLocaleString()} kcal
              </span>
            </div>
            <div className="h-1.5 bg-[#dcfce7] rounded-full overflow-hidden">
              <div className={`h-full ${barClass} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t border-[#bbf7d0]">
          <span className="text-sm text-gray-600 font-manrope">Daily Total Burn</span>
          <span className="text-xl font-mono font-bold text-gray-900">
            {Math.round(total).toLocaleString()}
            <span className="text-sm font-normal text-gray-400 ml-1">kcal</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Steps Card ───────────────────────────────────────────────────────────────

function StepsCard({ steps, date }: { steps: number; date: string }) {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();
  const goal = 10000;
  const pct = Math.min((steps / goal) * 100, 100);
  const r = 52;
  const circ = 2 * Math.PI * r;

  const { mutate, isPending } = useMutation({
    mutationFn: (s: number) => logSteps({ logDate: date, steps: s }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(date) });
      setInput("");
      toast.success("Steps logged!");
    },
    onError: () => toast.error("Failed to log steps"),
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 font-newsreader">Steps</h3>
        <svg className="h-5 w-5 text-[#15803d]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 3.34a10 10 0 110 17.32M7 10l3 3 3-4.5" />
        </svg>
      </div>
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#f0fdf4" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={r} fill="none"
              stroke="#15803d" strokeWidth="10"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-mono font-bold text-gray-900 leading-none">
              {steps.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold tracking-widest text-gray-400 font-manrope uppercase mt-0.5">
              Goal: {goal / 1000}k
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="number" placeholder="Enter steps" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { const v = Number(input); if (v > 0) mutate(v); } }}
          className="flex-1 px-3 py-2 rounded-xl bg-[#f0fdf4] border border-[#dcfce7] text-sm font-manrope text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15803d]/30 focus:border-[#15803d]"
        />
        <button
          disabled={isPending || !input}
          onClick={() => { const v = Number(input); if (v > 0) mutate(v); }}
          className="px-4 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold font-manrope transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {isPending ? <Spinner size="sm" /> : "+ Add"}
        </button>
      </div>
    </div>
  );
}

// ─── Hydration Card ───────────────────────────────────────────────────────────

function HydrationCard({ waterMl, date }: { waterMl: number; date: string }) {
  const goal = 2500;
  const pct = Math.min((waterMl / goal) * 100, 100);
  const drops = 5;
  const filled = Math.ceil((pct / 100) * drops);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (ml: number) => logWater({ logDate: date, waterMl: ml }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(date) });
      toast.success("Water logged!");
    },
    onError: () => toast.error("Failed to log water"),
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 font-newsreader">Hydration</h3>
        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" />
        </svg>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-mono font-bold text-gray-900">{waterMl.toLocaleString()}</span>
        <span className="text-sm text-gray-400 font-manrope">/ {goal.toLocaleString()} ml</span>
      </div>
      <div className="flex gap-1 mb-3">
        {Array.from({ length: drops }).map((_, i) => (
          <svg key={i} className={`h-5 w-5 ${i < filled ? "text-blue-500" : "text-gray-200"}`}
            fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" />
          </svg>
        ))}
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <button
        disabled={isPending}
        onClick={() => mutate(waterMl + 250)}
        className="w-full py-2.5 rounded-xl border-2 border-[#15803d] text-[#15803d] hover:bg-[#f0fdf4] text-sm font-semibold font-manrope transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        {isPending ? <Spinner size="sm" /> : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Add 250ml
          </>
        )}
      </button>
    </div>
  );
}

// ─── Meal Item Row ────────────────────────────────────────────────────────────

function MealItemRow({ item }: { item: MealLogItem }) {
  const serving =
    item.serving_unit?.toLowerCase() === "g"
      ? `${Math.round(Number(item.quantity_in_grams))}g`
      : `${item.quantity} ${item.serving_unit} (${Math.round(Number(item.quantity_in_grams))}g)`;
  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 font-manrope">{item.food?.name}</p>
        <p className="text-xs text-gray-400 font-manrope mt-0.5">{serving}</p>
      </div>
      <span className="text-sm font-mono font-semibold text-gray-600 ml-4 shrink-0">
        {Math.round(Number(item.calories_snapshot))} kcal
      </span>
    </div>
  );
}

// ─── Collapsible Meal Section ─────────────────────────────────────────────────

function CollapsibleMealSection({
  mealType, mealLog, onAddFood, compact = false,
}: {
  mealType: MealType; mealLog?: MealLog; onAddFood: () => void; compact?: boolean;
}) {
  const items = mealLog?.items ?? [];
  const totalCal = items.reduce((s, i) => s + Number(i.calories_snapshot), 0);
  const [open, setOpen] = useState(items.length > 0);

  // Compact empty card for Dinner/Snack grid
  if (compact && items.length === 0) {
    return (
      <button
        onClick={onAddFood}
        className="flex items-center justify-between px-4 py-3.5 bg-[#f9fafb] border border-gray-100 rounded-2xl hover:bg-[#f0fdf4] hover:border-[#dcfce7] transition-all group w-full text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{MEAL_EMOJI[mealType]}</span>
          <span className="text-sm font-semibold text-gray-500 font-manrope">{MEAL_LABELS[mealType]}</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#15803d] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-base">{MEAL_EMOJI[mealType]}</span>
          <span className="font-bold text-gray-900 font-newsreader">{MEAL_LABELS[mealType]}</span>
        </div>
        <span className="text-sm text-gray-400 font-mono font-medium">
          {items.length > 0 ? `${Math.round(totalCal)} kcal` : ""}
        </span>
      </div>

      {open && (
        <div className="border-t border-gray-50 divide-y divide-gray-50">
          {items.map((item) => (
            <MealItemRow key={item.id} item={item} />
          ))}
          <div className="px-5 py-2.5">
            <button
              onClick={(e) => { e.stopPropagation(); onAddFood(); }}
              className="text-xs text-[#15803d] hover:text-[#166534] font-semibold font-manrope flex items-center gap-1 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add food
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const date = useUIStore((s) => s.selectedDate);
  const healthProfile = useUserStore((s) => s.healthProfile);
  const [addMealType, setAddMealType] = useState<MealType | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dashboard(date),
    queryFn: () => getDashboard(date),
    staleTime: 30_000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const nutrition = data?.nutrition ?? {
    total_calories: 0, total_protein: 0, total_fat: 0,
    total_carbs: 0, total_fiber: 0, meal_logs: [],
  };
  const activity = data?.activity ?? {
    steps: 0, calories_burned: 0, active_minutes: 0, water_ml: 0,
  };

  const caloriesGoal = healthProfile?.caloriesGoal ?? 2000;
  const remaining = Math.max(caloriesGoal - nutrition.total_calories, 0);
  const progressPct = caloriesGoal > 0 ? (nutrition.total_calories / caloriesGoal) * 100 : 0;

  // BMR estimate
  let bmr = 1700;
  if (healthProfile?.heightCm && healthProfile?.initialWeightKg && healthProfile?.birthDate && healthProfile?.gender) {
    const age = Math.floor((Date.now() - new Date(healthProfile.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000));
    const w = healthProfile.initialWeightKg;
    const h = healthProfile.heightCm;
    bmr = healthProfile.gender === "male"
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;
  }

  const mealLogMap = (nutrition.meal_logs ?? []).reduce<Record<string, MealLog>>(
    (acc, log) => { acc[log.meal_type] = log; return acc; }, {}
  );

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      <div className="px-4 md:px-6 pt-6 pb-20 md:pb-8 space-y-5">

        {/* ── Row 1: 4 Stat Cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Consumed"
            value={nutrition.total_calories}
            progress={progressPct}
            sub={`${Math.round(progressPct)}% of daily goal`}
          />
          <StatCard
            label="Daily Target"
            value={caloriesGoal}
            sub="Fixed goal based on BMR"
          />
          <StatCard
            label="Remaining"
            value={remaining}
            valueColor="text-blue-600"
            sub={`${Math.round(Math.max(0, 100 - progressPct))}% of your daily budget left`}
          />
          <StatCard
            label="Burned"
            value={activity.calories_burned}
            valueColor="text-amber-500"
            subIcon={
              <svg className="h-3.5 w-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.09 12.97A1 1 0 005 14.5h5.5L8 22l10.91-10.97A1 1 0 0018 9.5h-5.5L13 2z" />
              </svg>
            }
            sub="Active calories"
          />
        </div>

        {/* ── Row 2: Macro Targets + Nutrient Summary ──────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MacroTargetsCard
            protein={nutrition.total_protein}
            carbs={nutrition.total_carbs}
            fat={nutrition.total_fat}
            totalCal={nutrition.total_calories}
          />
          <NutrientSummaryCard nutrition={nutrition} />
        </div>

        {/* ── Row 3: Left sidebar + Daily Diary ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

          {/* Left column */}
          <div className="flex flex-col gap-4">
            <EnergyBreakdownCard bmr={bmr} exercise={activity.calories_burned} />
            <StepsCard steps={activity.steps} date={date} />
            <HydrationCard waterMl={activity.water_ml} date={date} />
          </div>

          {/* Right: Daily Diary */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 font-newsreader">Daily Diary</h2>
              <button
                onClick={() => setAddMealType("BREAKFAST")}
                className="flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white px-5 py-2.5 rounded-full text-sm font-semibold font-manrope transition-colors shadow-sm hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                + Add Food
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Breakfast + Lunch full width */}
              {(["BREAKFAST", "LUNCH"] as MealType[]).map((mt) => (
                <CollapsibleMealSection
                  key={mt}
                  mealType={mt}
                  mealLog={mealLogMap[mt]}
                  onAddFood={() => setAddMealType(mt)}
                />
              ))}

              {/* Dinner + Snacks 2-col compact */}
              <div className="grid grid-cols-2 gap-3">
                {(["DINNER", "SNACK"] as MealType[]).map((mt) => (
                  <CollapsibleMealSection
                    key={mt}
                    mealType={mt}
                    mealLog={mealLogMap[mt]}
                    onAddFood={() => setAddMealType(mt)}
                    compact={!(mealLogMap[mt]?.items?.length)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {addMealType && (
        <FoodSearchModal
          open
          onClose={() => setAddMealType(null)}
          mealType={addMealType}
          existingLogId={mealLogMap[addMealType]?.id}
        />
      )}
    </div>
  );
}
