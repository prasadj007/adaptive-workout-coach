import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Dumbbell,
  History,
  Home,
  Info,
  Leaf,
  Menu,
  Play,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRound,
  Zap,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

type Goal = 'muscle' | 'stronger' | 'recomp' | 'fitness';
type Experience = 'new' | 'six-months' | 'two-years';
type Equipment = 'full-gym' | 'home-gym' | 'dumbbells' | 'bodyweight' | 'mix';
type Duration = '20' | '30' | '45' | '60' | '90';
type Frequency = '2' | '3' | '4' | '5' | '6';
type Selections = {
  goal?: Goal;
  experience?: Experience;
  equipment?: Equipment;
  duration?: Duration;
  frequency?: Frequency;
};
type NavKey = 'today' | 'progress' | 'history' | 'profile';

const queryClient = new QueryClient();

const questions = [
  {
    key: 'goal' as const,
    eyebrow: 'Step 1 of 5',
    title: 'What are you working toward?',
    detail: 'Your plan will keep this goal in view.',
    options: [
      { value: 'muscle' as Goal, title: 'Build muscle', description: 'Add size with focused, progressive training.', icon: Dumbbell },
      { value: 'stronger' as Goal, title: 'Get stronger', description: 'Build strength with clear, repeatable workouts.', icon: Zap },
      { value: 'recomp' as Goal, title: 'Lose fat + build muscle', description: 'Train for a stronger, leaner body.', icon: RotateCcw },
      { value: 'fitness' as Goal, title: 'General fitness', description: 'Move better and feel more capable.', icon: Sparkles },
    ],
  },
  {
    key: 'experience' as const,
    eyebrow: 'Step 2 of 5',
    title: 'How much training experience do you have?',
    detail: 'There is no wrong starting point.',
    options: [
      { value: 'new' as Experience, title: 'New to training', description: 'Keep it simple and learn the basics.', icon: Leaf },
      { value: 'six-months' as Experience, title: '6 months – 2 years', description: 'Build momentum with a clear progression.', icon: RotateCcw },
      { value: 'two-years' as Experience, title: '2+ years', description: 'Give me a little more to work with.', icon: BarChart3 },
    ],
  },
  {
    key: 'equipment' as const,
    eyebrow: 'Step 3 of 5',
    title: 'Where do you train?',
    detail: 'Your plan adapts to the equipment you actually have.',
    options: [
      { value: 'full-gym' as Equipment, title: 'Full gym', description: 'Machines, racks, and free weights.', icon: Settings2 },
      { value: 'home-gym' as Equipment, title: 'Home gym', description: 'A personal setup with multiple options.', icon: Dumbbell },
      { value: 'dumbbells' as Equipment, title: 'Dumbbells', description: 'A pair of weights is all you need.', icon: Dumbbell },
      { value: 'bodyweight' as Equipment, title: 'Bodyweight', description: 'No equipment needed.', icon: UserRound },
      { value: 'mix' as Equipment, title: 'Mix of equipment', description: 'A little bit of everything.', icon: Sparkles },
    ],
  },
  {
    key: 'duration' as const,
    eyebrow: 'Step 4 of 5',
    title: 'How much time do you usually have?',
    detail: 'Short counts. We will make it intentional.',
    options: [
      { value: '20' as Duration, title: '20 minutes', description: 'A focused reset for busy days.', icon: Timer },
      { value: '30' as Duration, title: '30 minutes', description: 'The everyday sweet spot.', icon: Clock3 },
      { value: '45' as Duration, title: '45 minutes', description: 'Space to warm up and go deeper.', icon: Clock3 },
      { value: '60' as Duration, title: '60 minutes', description: 'A full session with room to progress.', icon: Clock3 },
      { value: '90' as Duration, title: '90+ minutes', description: 'Take your time and train with intention.', icon: Clock3 },
    ],
  },
  {
    key: 'frequency' as const,
    eyebrow: 'Step 5 of 5',
    title: 'How often can you train?',
    detail: 'We will leave room for life between sessions.',
    options: [
      { value: '2' as Frequency, title: '2 days/week', description: 'A calm, dependable start.', icon: Leaf },
      { value: '3' as Frequency, title: '3 days/week', description: 'Enough repetition to feel progress.', icon: BarChart3 },
      { value: '4' as Frequency, title: '4 days/week', description: 'A steady training rhythm.', icon: Zap },
      { value: '5' as Frequency, title: '5 days/week', description: 'A consistent training rhythm.', icon: Zap },
      { value: '6' as Frequency, title: '6+ days/week', description: 'Train often with room to adapt.', icon: Zap },
    ],
  },
];

const labels = {
  goal: { muscle: 'Build muscle', stronger: 'Get stronger', recomp: 'Lose fat + build muscle', fitness: 'General fitness' },
  experience: { new: 'New to training', 'six-months': '6 months – 2 years', 'two-years': '2+ years' },
  equipment: { 'full-gym': 'Full gym', 'home-gym': 'Home gym', dumbbells: 'Dumbbells', bodyweight: 'Bodyweight', mix: 'Mix of equipment' },
  duration: { '20': '20 minutes', '30': '30 minutes', '45': '45 minutes', '60': '60 minutes', '90': '90+ minutes' },
  frequency: { '2': '2 days/week', '3': '3 days/week', '4': '4 days/week', '5': '5 days/week', '6': '6+ days/week' },
};

const baseExercises = [
  { id: 'bench-press', name: 'Bench Press', cue: 'Chest · shoulders · triceps', sets: '3 sets', reps: '8–12 reps' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', cue: 'Back · arms · posture', sets: '3 sets', reps: '8–12 reps' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', cue: 'Back · arms · control', sets: '3 sets', reps: '8–12 reps' },
  { id: 'shoulder-press', name: 'Shoulder Press', cue: 'Shoulders · arms · stability', sets: '3 sets', reps: '8–12 reps' },
  { id: 'lateral-raise', name: 'Lateral Raise', cue: 'Shoulders · control · posture', sets: '3 sets', reps: '12–15 reps' },
  { id: 'biceps-curl', name: 'Biceps Curl', cue: 'Biceps · arms · control', sets: '2 sets', reps: '10–15 reps' },
];

function App() {
  const [selections, setSelections] = useState<Selections>({});
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [view, setView] = useState<'onboarding' | 'today'>('onboarding');
  const [activeNav, setActiveNav] = useState<NavKey>('today');
  const [completed, setCompleted] = useState<string[]>([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const saved = window.localStorage.getItem('adaptive-coach-plan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { selections?: Selections; view?: 'onboarding' | 'today' };
        if (parsed.selections && Object.keys(parsed.selections).length === questions.length) {
          setSelections(parsed.selections);
          setView(parsed.view === 'today' ? 'today' : 'onboarding');
          setOnboardingStep(parsed.view === 'today' ? questions.length + 1 : 0);
        }
      } catch {
        window.localStorage.removeItem('adaptive-coach-plan');
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(selections).length === questions.length) {
      window.localStorage.setItem('adaptive-coach-plan', JSON.stringify({ selections, view }));
    }
  }, [selections, view]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const activeQuestion = questions[onboardingStep - 1];
  const selectedValue = activeQuestion ? selections[activeQuestion.key] : undefined;
  const workoutExercises = useMemo(() => baseExercises, []);

  const chooseOption = (value: string) => {
    if (!activeQuestion) return;
    setSelections((current) => ({ ...current, [activeQuestion.key]: value } as Selections));
  };

  const continueOnboarding = () => {
    if (onboardingStep === 0) {
      setOnboardingStep(1);
      return;
    }
    if (onboardingStep <= questions.length && selectedValue) {
      setOnboardingStep((step) => step + 1);
    }
  };

  const goBack = () => {
    if (onboardingStep > 0) setOnboardingStep((step) => step - 1);
  };

  const showNotice = (message: string) => setNotice(message);

  const startPlan = () => {
    setView('today');
    setActiveNav('today');
    setSessionFinished(false);
    showNotice('Your first session is ready.');
  };

  const resetPlan = () => {
    setSelections({});
    setCompleted([]);
    setSessionStarted(false);
    setSessionFinished(false);
    setOnboardingStep(0);
    setView('onboarding');
    window.localStorage.removeItem('adaptive-coach-plan');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary resetKey={view}>
          <div className="grain min-h-[100dvh] bg-background text-foreground">
            {view === 'onboarding' ? (
              <Onboarding
                step={onboardingStep}
                activeQuestion={activeQuestion}
                selectedValue={selectedValue}
                selections={selections}
                onChoose={chooseOption}
                onContinue={continueOnboarding}
                onBack={goBack}
                onStartPlan={startPlan}
              />
            ) : (
              <AppShell
                activeNav={activeNav}
                onNavigate={(next) => setActiveNav(next)}
                onResetPlan={resetPlan}
              >
                {activeNav === 'today' ? (
                  <Today
                    selections={selections}
                    exercises={workoutExercises}
                    completed={completed}
                    sessionStarted={sessionStarted}
                    sessionFinished={sessionFinished}
                    onStart={() => { setSessionStarted(true); showNotice('Session started. One good rep at a time.'); }}
                    onToggle={(id) => setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
                    onFinish={() => { setSessionFinished(true); setSessionStarted(false); showNotice('Session logged. Nice work showing up.'); }}
                    onShortSession={() => showNotice('Trimmed to a focused 15-minute session.')}
                    onEquipmentChange={() => showNotice('Swapped to bodyweight alternatives.')}
                    onRestart={() => { setCompleted([]); setSessionFinished(false); setSessionStarted(false); }}
                    onHelp={() => showNotice('Tap Start workout when you are ready to begin.')}
                  />
                ) : (
                  <SecondaryView activeNav={activeNav} onBackToToday={() => setActiveNav('today')} />
                )}
              </AppShell>
            )}
            {notice && <div data-testid="status-notice" role="status" className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--foreground))] px-4 py-3 text-xs font-bold text-[hsl(var(--background))] shadow-[var(--shadow-md)]">{notice}<Check size={14} /></div>}
          </div>
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" data-testid="brand-mark">
      <div className="relative grid h-9 w-9 place-items-center rounded-[11px] bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(34,92,76,.18)]">
        <span className="absolute h-4 w-1 rounded-full bg-accent -rotate-45" />
        <span className="absolute h-4 w-1 rounded-full bg-accent rotate-45" />
        <span className="absolute h-1 w-4 rounded-full bg-accent" />
      </div>
      {!compact && <span className="display text-[15px] font-bold tracking-[-.03em]">adaptive<span className="text-primary">.</span></span>}
    </div>
  );
}

function Onboarding({
  step,
  activeQuestion,
  selectedValue,
  selections,
  onChoose,
  onContinue,
  onBack,
  onStartPlan,
}: {
  step: number;
  activeQuestion?: typeof questions[number];
  selectedValue?: string;
  selections: Selections;
  onChoose: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onStartPlan: () => void;
}) {
  const isWelcome = step === 0;
  const isSummary = step > questions.length;
  const progress = isWelcome ? 0 : isSummary ? 100 : (step / questions.length) * 100;
  const summaryRows = [
    ['Your focus', selections.goal ? labels.goal[selections.goal] : '—'],
    ['Starting point', selections.experience ? labels.experience[selections.experience] : '—'],
    ['Your space', selections.equipment ? labels.equipment[selections.equipment] : '—'],
    ['Session length', selections.duration ? labels.duration[selections.duration] : '—'],
    ['Weekly rhythm', selections.frequency ? labels.frequency[selections.frequency] : '—'],
  ];

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[1280px] flex-col px-5 pb-7 pt-5 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between">
        <LogoMark />
        {!isWelcome && !isSummary && (
          <span data-testid="text-onboarding-count" className="mono text-[11px] font-medium tracking-[.12em] text-muted-foreground">{String(step).padStart(2, '0')} / 05</span>
        )}
      </header>
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-muted" aria-label="Onboarding progress">
        <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {isWelcome ? (
        <section className="flex flex-1 flex-col justify-center py-14 sm:py-20 lg:mx-auto lg:w-full lg:max-w-[950px] lg:flex-row lg:items-center lg:gap-20">
          <div className="max-w-[570px] rise-in">
            <p className="mono mb-5 text-[11px] font-medium uppercase tracking-[.18em] text-primary">A calmer way to train</p>
            <h1 data-testid="heading-welcome" className="display max-w-[600px] text-[clamp(3.4rem,11vw,7.8rem)] font-bold leading-[.9] tracking-[-.075em] text-foreground">
              Train<br /><span className="text-primary">smarter.</span>
            </h1>
            <p className="mt-7 max-w-[440px] text-[15px] leading-7 text-muted-foreground sm:text-[17px]">Your workout plan adapts to you — your progress, your time, and the equipment you actually have.</p>
            <button data-testid="button-start-setup" onClick={onContinue} className="touch-target mt-9 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_10px_24px_rgba(34,92,76,.2)] transition-transform hover:-translate-y-0.5 active:translate-y-0">
              Start my plan <ArrowRight size={17} />
            </button>
            <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={15} className="text-primary" /> No complicated programming. Just train.</div>
          </div>
          <div className="relative mt-16 h-[245px] w-full max-w-[390px] self-center lg:mt-0 lg:h-[390px] lg:w-[360px]">
            <div className="absolute inset-0 rounded-[45%_55%_48%_52%/52%_45%_55%_48%] bg-[hsl(var(--secondary))] rotate-[-7deg]" />
            <div className="absolute bottom-2 left-4 right-3 top-8 rounded-[42%_58%_54%_46%/49%_43%_57%_51%] border border-primary/20 bg-[hsl(var(--primary)/.08)]" />
            <div className="absolute left-[19%] top-[29%] h-24 w-24 rounded-full border-[13px] border-accent/80" />
            <div className="absolute bottom-[22%] right-[18%] h-16 w-16 rounded-full bg-primary" />
            <div className="absolute left-[31%] top-[45%] h-3 w-28 -rotate-[26deg] rounded-full bg-foreground/85" />
            <div className="absolute right-[24%] top-[25%] h-3 w-16 rotate-[35deg] rounded-full bg-accent" />
            <div className="absolute bottom-[18%] left-[17%] mono text-[10px] uppercase tracking-[.18em] text-primary">move / adapt / repeat</div>
          </div>
        </section>
      ) : isSummary ? (
        <section className="mx-auto flex w-full max-w-[820px] flex-1 flex-col justify-center py-10 rise-in">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(34,92,76,.18)]"><Check size={26} strokeWidth={2.5} /></div>
          <p className="mono text-[11px] uppercase tracking-[.18em] text-primary">Your plan is ready</p>
          <h1 data-testid="heading-plan-ready" className="display mt-3 text-[clamp(2.8rem,8vw,5.4rem)] font-bold leading-[.95] tracking-[-.065em]">A plan with<br /><span className="text-primary">room to breathe.</span></h1>
          <p className="mt-6 max-w-[520px] text-[15px] leading-7 text-muted-foreground">We’ll start with focused upper-body work, keep your sessions to {selections.duration ? labels.duration[selections.duration] : '30 minutes'}, and build a {selections.frequency ? labels.frequency[selections.frequency].toLowerCase() : 'steady'} rhythm.</p>
          <div className="mt-9 divide-y divide-border overflow-hidden rounded-2xl border border-card-border bg-card shadow-[var(--shadow-sm)]">
            {summaryRows.map(([label, value], index) => <div key={label} data-testid={`summary-row-${index}`} className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"><span className="text-sm text-muted-foreground">{label}</span><span className="text-right text-sm font-bold">{value}</span></div>)}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button data-testid="button-summary-back" onClick={onBack} className="touch-target inline-flex items-center gap-2 rounded-full px-3 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft size={17} /> Back</button>
            <button data-testid="button-start-plan" onClick={onStartPlan} className="touch-target flex flex-1 items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-[0_10px_24px_rgba(34,92,76,.2)] transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:flex-none">Start today's workout <ArrowRight size={17} /></button>
          </div>
        </section>
      ) : activeQuestion ? (
        <section className="mx-auto flex w-full max-w-[900px] flex-1 flex-col justify-center py-10 slide-in" key={activeQuestion.key}>
          <p className="mono text-[11px] uppercase tracking-[.18em] text-primary">{activeQuestion.eyebrow}</p>
          <h1 data-testid={`heading-${activeQuestion.key}`} className="display mt-3 max-w-[700px] text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[.98] tracking-[-.065em]">{activeQuestion.title}</h1>
          <p className="mt-4 text-[15px] text-muted-foreground">{activeQuestion.detail}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {activeQuestion.options.map((option, index) => {
              const Icon = option.icon;
              const selected = selectedValue === option.value;
              return <button key={option.value} data-testid={`option-${activeQuestion.key}-${option.value}`} aria-pressed={selected} onClick={() => onChoose(option.value)} className={`option-card group flex min-h-[102px] items-center gap-4 rounded-2xl border px-4 py-4 text-left sm:min-h-[126px] sm:flex-col sm:items-start sm:justify-between sm:p-5 ${selected ? 'selected border-primary bg-[hsl(var(--primary)/.1)]' : 'border-card-border bg-card hover:border-primary/50 hover:bg-[hsl(var(--card)/.7)]'} rise-in delay-${Math.min(index + 1, 4)}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'} transition-colors`}><Icon size={20} strokeWidth={1.8} /></span>
                <span className="min-w-0 flex-1 sm:flex-none"><span className="block text-sm font-bold sm:text-[15px]">{option.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span></span>
                <span className={`ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent'}`}><Check size={12} strokeWidth={3} /></span>
              </button>;
            })}
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <button data-testid="button-onboarding-back" onClick={onBack} className="touch-target inline-flex items-center gap-2 rounded-full px-3 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft size={17} /> Back</button>
            <button data-testid="button-onboarding-continue" disabled={!selectedValue} onClick={onContinue} className="touch-target inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_8px_20px_rgba(34,92,76,.16)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none">Continue <ArrowRight size={17} /></button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function AppShell({ activeNav, onNavigate, onResetPlan, children }: { activeNav: NavKey; onNavigate: (key: NavKey) => void; onResetPlan: () => void; children: ReactNode }) {
  const navItems: { key: NavKey; label: string; icon: typeof Home }[] = [
    { key: 'today', label: 'Today', icon: Home },
    { key: 'progress', label: 'Progress', icon: BarChart3 },
    { key: 'history', label: 'History', icon: History },
    { key: 'profile', label: 'Profile', icon: UserRound },
  ];
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1440px]">
      <aside className="hidden w-[235px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-5 py-7 text-sidebar-foreground lg:flex">
        <LogoMark compact={false} />
        <div className="mt-14 flex flex-1 flex-col gap-1">
          <p className="mono mb-3 px-3 text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/45">Your space</p>
          {navItems.map(({ key, label, icon: Icon }) => <button key={key} data-testid={`nav-sidebar-${key}`} onClick={() => onNavigate(key)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition-colors ${activeNav === key ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}><Icon size={18} strokeWidth={1.8} />{label}{key === 'today' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}</button>)}
        </div>
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4"><p className="text-xs font-bold leading-5">Small steps compound.</p><p className="mt-2 text-[11px] leading-5 text-sidebar-foreground/55">You only need to meet today.</p></div>
        <button data-testid="button-reset-plan" onClick={onResetPlan} className="mt-5 flex items-center gap-2 px-3 py-2 text-xs font-bold text-sidebar-foreground/45 transition-colors hover:text-sidebar-foreground"><RotateCcw size={14} /> Rebuild plan</button>
      </aside>
      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto w-full max-w-[1040px] px-5 pb-28 pt-5 sm:px-8 lg:px-12 lg:pb-12 lg:pt-8">
          <div className="mb-7 flex items-center justify-between lg:hidden"><LogoMark /><button data-testid="button-mobile-menu" onClick={() => onNavigate('profile')} aria-label="Open profile" className="touch-target grid place-items-center rounded-full border border-border text-muted-foreground"><Menu size={19} /></button></div>
          {children}
        </div>
      </div>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-[hsl(var(--background)/.93)] px-3 pt-2 backdrop-blur-lg lg:hidden">
        {navItems.map(({ key, label, icon: Icon }) => <button key={key} data-testid={`nav-mobile-${key}`} onClick={() => onNavigate(key)} className={`flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors ${activeNav === key ? 'text-primary' : 'text-muted-foreground'}`}><Icon size={19} strokeWidth={activeNav === key ? 2.3 : 1.7} /><span>{label}</span></button>)}
      </nav>
    </div>
  );
}

function Today({ selections, exercises, completed, sessionStarted, sessionFinished, onStart, onToggle, onFinish, onShortSession, onEquipmentChange, onRestart, onHelp }: { selections: Selections; exercises: typeof baseExercises; completed: string[]; sessionStarted: boolean; sessionFinished: boolean; onStart: () => void; onToggle: (id: string) => void; onFinish: () => void; onShortSession: () => void; onEquipmentChange: () => void; onRestart: () => void; onHelp: () => void }) {
  const doneCount = completed.length;
  const completion = Math.round((doneCount / exercises.length) * 100);
  const goalLabel = selections.goal ? labels.goal[selections.goal] : 'Your practice';
  return (
    <main>
        <header className="flex items-start justify-between">
         <div><p className="mono text-[10px] uppercase tracking-[.18em] text-primary">Today's focus</p><h1 data-testid="heading-today" className="display mt-2 text-[clamp(2.3rem,6vw,4.1rem)] font-bold leading-none tracking-[-.065em]">Today's <span className="text-primary">workout.</span></h1><p className="mt-3 text-sm text-muted-foreground">A clear start. Let’s use it.</p></div>
        <button data-testid="button-help" onClick={onHelp} aria-label="Workout guidance" className="touch-target grid place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><CircleHelp size={19} /></button>
      </header>
      <section className="relative mt-8 overflow-hidden rounded-[1.7rem] bg-primary p-5 text-primary-foreground shadow-[var(--shadow-md)] sm:p-7">
        <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full border-[28px] border-primary-foreground/10" /><div className="absolute -bottom-24 right-20 h-40 w-40 rounded-full border-[16px] border-accent/30" />
        <div className="relative">
           <div className="flex items-center justify-between"><span className="mono text-[10px] uppercase tracking-[.17em] text-primary-foreground/60">Today’s session</span><span data-testid="status-session-type" className="rounded-full bg-primary-foreground/10 px-3 py-1 text-[10px] font-bold">Upper Body</span></div>
           <h2 data-testid="text-workout-title" className="display mt-8 max-w-[480px] text-[clamp(2.2rem,7vw,4.3rem)] font-bold leading-[.92] tracking-[-.07em]">Upper Body</h2>
           <div className="mt-8 flex flex-wrap gap-5 text-xs font-bold text-primary-foreground/75"><span className="flex items-center gap-2"><Clock3 size={14} /> Approximately 43 minutes</span><span className="flex items-center gap-2"><Dumbbell size={14} /> {labels.equipment[equipmentKey(selections.equipment)]}</span><span className="flex items-center gap-2"><Zap size={14} /> {labels.goal[goalKey(selections.goal)]}</span></div>
          {!sessionStarted && !sessionFinished && <button data-testid="button-start-workout" onClick={onStart} className="touch-target mt-8 inline-flex items-center gap-3 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-[0_8px_20px_rgba(234,162,104,.23)] transition-transform hover:-translate-y-0.5 active:translate-y-0"><Play size={16} fill="currentColor" /> Start workout</button>}
          {sessionFinished && <div className="mt-8 flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={19} /> Session complete</div>}
        </div>
      </section>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_280px]">
        <section>
          <div className="mb-4 flex items-end justify-between"><div><p className="mono text-[10px] uppercase tracking-[.17em] text-primary">The work</p><h2 className="display mt-1 text-2xl font-bold tracking-[-.04em]">Upper body</h2></div><span data-testid="text-exercise-progress" className="mono text-xs text-muted-foreground">{doneCount} / {exercises.length}</span></div>
          {sessionStarted && <div className="mb-5 h-1.5 overflow-hidden rounded-full progress-track"><div className="h-full rounded-full progress-fill" style={{ width: `${completion}%` }} /></div>}
          <div className="space-y-2">
            {exercises.map((exercise, index) => {
              const isDone = completed.includes(exercise.id);
              return <button key={exercise.id} data-testid={`button-exercise-${exercise.id}`} onClick={() => sessionStarted && onToggle(exercise.id)} aria-pressed={isDone} className={`exercise-row flex w-full items-center gap-3 rounded-2xl border p-3 text-left sm:p-4 ${isDone ? 'border-primary/30 bg-[hsl(var(--primary)/.07)]' : 'border-card-border bg-card hover:border-primary/40'} ${!sessionStarted ? 'cursor-default' : ''}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl mono text-xs ${isDone ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{isDone ? <Check size={17} strokeWidth={3} /> : String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1"><span className={`block text-sm font-bold ${isDone ? 'text-primary line-through decoration-primary/50' : ''}`}>{exercise.name}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{exercise.cue}</span></span>
                <span className="shrink-0 text-right"><span className="block text-xs font-bold">{exercise.sets}</span><span className="mt-1 block mono text-[10px] text-muted-foreground">{exercise.reps}</span></span>
              </button>;
            })}
          </div>
          {sessionStarted && <button data-testid="button-finish-workout" disabled={!doneCount} onClick={onFinish} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35">Finish session <Check size={16} /></button>}
          {sessionFinished && <button data-testid="button-restart-workout" onClick={onRestart} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-muted-foreground hover:border-primary hover:text-primary">Do it again <RotateCcw size={15} /></button>}
        </section>
        <aside className="space-y-3">
          <div className="rounded-2xl border border-card-border bg-card p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold text-muted-foreground">This week</span><span className="mono text-[10px] text-primary">{frequencyLabel(selections.frequency)}</span></div><div className="mt-5 flex items-end gap-1.5">{[true, true, false, false, false, false, false].map((active, index) => <span key={index} data-testid={`week-day-${index}`} className={`h-${[4, 7, 5, 4, 6, 8, 5][index]} flex-1 rounded-t-md ${active ? 'bg-primary' : 'bg-muted'}`} style={{ height: `${[22, 38, 28, 22, 33, 46, 28][index]}px` }} />)}</div><div className="mt-3 flex justify-between mono text-[9px] text-muted-foreground"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div>
          <button data-testid="button-short-session" onClick={onShortSession} className="flex w-full items-center gap-3 rounded-2xl border border-card-border bg-card p-4 text-left transition-colors hover:border-primary/40"><span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary"><Timer size={17} /></span><span className="flex-1"><span className="block text-xs font-bold">Short on time?</span><span className="mt-1 block text-[11px] text-muted-foreground">A focused 15-minute version</span></span><ChevronRight size={16} className="text-muted-foreground" /></button>
          <button data-testid="button-equipment-unavailable" onClick={onEquipmentChange} className="flex w-full items-center gap-3 rounded-2xl border border-card-border bg-card p-4 text-left transition-colors hover:border-primary/40"><span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary"><Dumbbell size={17} /></span><span className="flex-1"><span className="block text-xs font-bold">Equipment unavailable?</span><span className="mt-1 block text-[11px] text-muted-foreground">Swap for bodyweight moves</span></span><ChevronRight size={16} className="text-muted-foreground" /></button>
          <div className="rounded-2xl bg-[hsl(var(--accent)/.2)] p-5"><div className="flex items-center gap-2 text-accent-foreground"><Info size={15} /><span className="text-xs font-bold">A note for today</span></div><p data-testid="text-adaptive-note" className="mt-3 text-xs leading-5 text-foreground/75">Showing up is the adaptation. Keep one rep in reserve and leave feeling better than you arrived.</p></div>
        </aside>
      </div>
      <div className="mt-9 flex items-center gap-2 text-xs text-muted-foreground"><Sparkles size={14} className="text-primary" /> Built around {goalLabel.toLowerCase()}</div>
    </main>
  );
}

function SecondaryView({ activeNav, onBackToToday }: { activeNav: Exclude<NavKey, 'today'>; onBackToToday: () => void }) {
  const content = {
    progress: { icon: BarChart3, eyebrow: 'Your arc', title: 'Progress is a practice.', body: 'Complete a few sessions and this space will start to show your rhythm — not just a number.' },
    history: { icon: History, eyebrow: 'Your record', title: 'Nothing to look back on yet.', body: 'Your completed sessions will land here. The first one is waiting on Today.' },
    profile: { icon: UserRound, eyebrow: 'Your settings', title: 'Keep the plan yours.', body: 'Your preferences are shaping every session. Rebuild your plan any time from the sidebar.' },
  }[activeNav];
  const Icon = content.icon;
  return <section className="flex min-h-[75vh] flex-col justify-center py-10 rise-in"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary"><Icon size={25} strokeWidth={1.8} /></div><p className="mono mt-8 text-[10px] uppercase tracking-[.18em] text-primary">{content.eyebrow}</p><h1 data-testid={`heading-${activeNav}`} className="display mt-3 max-w-[600px] text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[.96] tracking-[-.07em]">{content.title}</h1><p className="mt-5 max-w-[430px] text-sm leading-7 text-muted-foreground">{content.body}</p><button data-testid="button-back-to-today" onClick={onBackToToday} className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Back to Today <ArrowRight size={16} /></button></section>;
}

function durationKey(value?: Duration): Duration {
  return value ?? '30';
}

function equipmentKey(value?: Equipment): Equipment {
  return value ?? 'full-gym';
}

function goalKey(value?: Goal): Goal {
  return value ?? 'fitness';
}

function frequencyLabel(value?: Frequency) {
  return value ? labels.frequency[value] : '3 days / week';
}

export default App;