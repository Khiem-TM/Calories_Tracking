import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { updateHealthProfile } from '@/services/userService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { queryKeys } from '@/utils/queryKeys'
import { toast } from '@/components/ui/Toast'
import { clsx } from 'clsx'
import type { ActivityLevel, DietType, FoodAllergyType } from '@/types'

// ── Step schemas ─────────────────────────────────────────────────────────────
const step1Schema = z.object({
  birthDate: z.string().min(1, 'Required'),
  gender: z.enum(['male', 'female', 'other'] as const),
  heightCm: z.coerce.number().min(100).max(250),
  initialWeightKg: z.coerce.number().min(30).max(300),
})

const step2Schema = z.object({
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'] as const),
  weightGoalKg: z.coerce.number().min(30).max(300).optional(),
  waterGoalMl: z.coerce.number().min(500).max(5000),
  caloriesGoal: z.coerce.number().min(1000).max(10000),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Desk job, no exercise',
  light: '1–3 days/week',
  moderate: '3–5 days/week',
  active: '6–7 days/week',
  very_active: '2× per day',
}

const DIET_TYPES: { value: DietType; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'gluten_free', label: 'Gluten-free' },
  { value: 'dairy_free', label: 'Dairy-free' },
]

const ALLERGIES: { value: FoodAllergyType; label: string }[] = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'tree_nuts', label: 'Tree Nuts' },
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'soy', label: 'Soy' },
  { value: 'pork', label: 'Pork' },
  { value: 'beef', label: 'Beef' },
]

const STEP_TITLES = ['Body Metrics', 'Eating Routine', 'Health Goals']
const STEP_SUBTITLES = [
  'Tell us about your body so we can calculate your needs.',
  'How active are you and what are your nutritional goals?',
  'Choose your diet type and any food restrictions.',
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [selectedDiet, setSelectedDiet] = useState<DietType | undefined>()
  const [selectedAllergies, setSelectedAllergies] = useState<FoodAllergyType[]>([])

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: updateHealthProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.healthProfile() })
      navigate('/dashboard', { replace: true })
    },
    onError: () => {
      toast.error('Failed to save profile. Please try again.')
    },
  })

  const {
    register: r1,
    handleSubmit: hs1,
    formState: { errors: e1 },
  } = useForm({ resolver: zodResolver(step1Schema) })

  const {
    register: r2,
    handleSubmit: hs2,
    watch: w2,
    formState: { errors: e2 },
  } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { activityLevel: 'moderate' as const, waterGoalMl: 2000, caloriesGoal: 2000 },
  })

  const onStep1 = (data: Step1Data) => { setStep1Data(data); setStep(2) }
  const onStep2 = (data: Step2Data) => { setStep2Data(data); setStep(3) }
  const onStep3 = () => {
    if (!step1Data || !step2Data) return
    saveProfile({ ...step1Data, ...step2Data, dietType: selectedDiet, foodAllergies: selectedAllergies })
  }

  const toggleAllergy = (a: FoodAllergyType) => {
    setSelectedAllergies((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a])
  }

  const selectedActivity = w2('activityLevel')

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left accent panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-primary flex-col justify-between p-12">
        <span className="text-xl font-bold text-white font-newsreader">Cronometer</span>
        <div>
          <p className="text-white/60 text-xs font-manrope uppercase tracking-widest mb-4">Step {step} of 3</p>
          <h2 className="text-3xl font-light text-white font-newsreader leading-snug">
            {STEP_TITLES[step - 1]}
          </h2>
          <p className="text-white/70 font-manrope text-sm mt-3 leading-relaxed max-w-xs">
            {STEP_SUBTITLES[step - 1]}
          </p>
        </div>
        {/* Step dots */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={clsx(
                'h-1.5 rounded-full transition-all duration-300',
                s <= step ? 'bg-white w-8' : 'bg-white/30 w-4',
              )}
            />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-on-surface font-newsreader">Cronometer</span>
              <span className="text-xs text-on-surface-variant font-manrope">Step {step} of 3</span>
            </div>
            <div className="h-1 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-surface-lowest rounded-2xl shadow-card p-6">
            {/* ── Step 1: Body Metrics ─────────────────────────────── */}
            {step === 1 && (
              <form onSubmit={hs1(onStep1)} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-lg font-semibold text-on-surface font-newsreader">Body Metrics</h2>
                  <p className="text-sm text-on-surface-variant font-manrope mt-0.5">
                    We use this to calculate your daily calorie needs.
                  </p>
                </div>
                <Input
                  label="Date of Birth"
                  type="date"
                  error={e1.birthDate?.message}
                  {...r1('birthDate')}
                />
                <div>
                  <label className="text-sm font-medium text-on-surface font-manrope block mb-2">Gender</label>
                  <div className="flex gap-2">
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <label key={g} className="flex-1 cursor-pointer">
                        <input type="radio" value={g} className="sr-only peer" {...r1('gender')} />
                        <span className="block text-center px-3 py-2.5 rounded-full text-sm font-medium font-manrope capitalize transition-colors ring-1 ring-outline-variant/60 peer-checked:bg-gradient-primary peer-checked:text-white peer-checked:ring-0 hover:bg-surface-highest">
                          {g}
                        </span>
                      </label>
                    ))}
                  </div>
                  {e1.gender && <p className="text-xs text-error mt-1 font-manrope">{e1.gender.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Height (cm)"
                    type="number"
                    min={100}
                    max={250}
                    error={e1.heightCm?.message}
                    {...r1('heightCm')}
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    min={30}
                    max={300}
                    step={0.1}
                    error={e1.initialWeightKg?.message}
                    {...r1('initialWeightKg')}
                  />
                </div>
                <Button type="submit" className="mt-1 w-full">
                  Continue
                </Button>
              </form>
            )}

            {/* ── Step 2: Eating Routine ────────────────────────────── */}
            {step === 2 && (
              <form onSubmit={hs2(onStep2)} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-lg font-semibold text-on-surface font-newsreader">Eating Routine</h2>
                  <p className="text-sm text-on-surface-variant font-manrope mt-0.5">
                    Set your activity level and nutritional goals.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface font-manrope block mb-2">Activity Level</label>
                  <div className="flex flex-col gap-2">
                    {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                      <label key={level} className="cursor-pointer">
                        <input type="radio" value={level} className="sr-only peer" {...r2('activityLevel')} />
                        <div className={clsx(
                          'px-4 py-3 rounded-lg text-sm transition-colors ring-1',
                          selectedActivity === level
                            ? 'bg-primary/5 ring-primary text-on-surface'
                            : 'ring-outline-variant/40 text-on-surface-variant hover:ring-outline-variant',
                        )}>
                          <span className="font-medium font-manrope capitalize">{level.replace('_', ' ')}</span>
                          <span className="text-xs text-on-surface-variant ml-2 font-manrope">{ACTIVITY_LABELS[level]}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Calorie Goal (kcal)"
                    type="number"
                    min={1000}
                    max={10000}
                    error={e2.caloriesGoal?.message}
                    {...r2('caloriesGoal')}
                  />
                  <Input
                    label="Water Goal (ml)"
                    type="number"
                    min={500}
                    max={5000}
                    error={e2.waterGoalMl?.message}
                    {...r2('waterGoalMl')}
                  />
                </div>
                <Input
                  label="Target Weight (kg, optional)"
                  type="number"
                  min={30}
                  max={300}
                  step={0.1}
                  {...r2('weightGoalKg')}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {/* ── Step 3: Health Goals (Diet & Allergies) ───────────── */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-lg font-semibold text-on-surface font-newsreader">Health Goals</h2>
                  <p className="text-sm text-on-surface-variant font-manrope mt-0.5">
                    Customize your diet preferences and restrictions.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-on-surface font-manrope block mb-2">Diet Type</label>
                  <div className="flex flex-wrap gap-2">
                    {DIET_TYPES.map((dt) => (
                      <button
                        key={dt.value}
                        type="button"
                        onClick={() => setSelectedDiet(selectedDiet === dt.value ? undefined : dt.value)}
                        className={clsx(
                          'px-3.5 py-1.5 rounded-full text-sm font-medium font-manrope transition-colors ring-1',
                          selectedDiet === dt.value
                            ? 'bg-gradient-primary text-white ring-0 shadow-card'
                            : 'ring-outline-variant/60 text-on-surface-variant hover:bg-surface-highest',
                        )}
                      >
                        {dt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-on-surface font-manrope block mb-2">
                    Food Allergies / Intolerances
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGIES.map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => toggleAllergy(a.value)}
                        className={clsx(
                          'px-3.5 py-1.5 rounded-full text-sm font-medium font-manrope transition-colors ring-1',
                          selectedAllergies.includes(a.value)
                            ? 'bg-error text-on-error ring-0'
                            : 'ring-outline-variant/60 text-on-surface-variant hover:bg-surface-highest',
                        )}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-1">
                  <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={onStep3} loading={isPending} className="flex-1">
                    Get Started
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
