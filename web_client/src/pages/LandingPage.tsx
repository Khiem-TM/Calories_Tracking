import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="sticky top-0 z-10 glass">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="text-lg font-bold text-on-surface font-newsreader">Cronometer</span>
        <Link
          to="/login"
          className="px-5 py-2 text-sm font-medium bg-gradient-primary text-white rounded-full hover:opacity-90 font-manrope transition-opacity shadow-card"
        >
          Sign In
        </Link>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="bg-gradient-primary py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block bg-white/20 text-white text-xs font-semibold font-manrope px-3 py-1 rounded-full mb-8">
          Free · No credit card required
        </span>
        <h1 className="text-5xl md:text-6xl font-light text-white font-newsreader leading-tight mb-6">
          Your personal<br />
          <em>health journal,</em><br />
          refined.
        </h1>
        <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto font-manrope leading-relaxed">
          Track nutrition, training, and body metrics with medical-grade precision
          and a calm, editorial experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/register"
            className="px-7 py-3 bg-white text-primary font-semibold font-manrope rounded-full hover:bg-surface-lowest transition-colors shadow-ambient"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-7 py-3 bg-white/15 text-white font-semibold font-manrope rounded-full hover:bg-white/25 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: 'Track Nutrition',
      description: 'Log every meal with our extensive food database. Track calories, protein, carbs, fats, and fiber in seconds.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Log Workouts',
      description: 'Record exercises by muscle group and intensity. Track sets, reps, weight and calories burned.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Visualize Progress',
      description: 'Charts and analytics show your trends over time. Watch your weight, strength, and health metrics improve.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Body Metrics',
      description: 'Log weight, measurements and progress photos. Track body fat, BMI, and see how your body transforms.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Daily Streaks',
      description: 'Stay motivated with activity streaks. Log meals, complete workouts and hit your water goal every day.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Smart Goals',
      description: 'Set personalised nutrition and training goals. Get recommendations based on your body type and activity level.',
    },
  ]

  return (
    <section className="py-20 px-4 bg-surface">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-light text-on-surface font-newsreader mb-3">
            Everything you need to succeed
          </h2>
          <p className="text-on-surface-variant font-manrope max-w-xl mx-auto">
            A complete health tracker built for people who take their wellbeing seriously.
          </p>
        </div>
        {/* Alternating surface-low / surface-lowest for depth without borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`rounded-2xl p-6 ${i % 2 === 0 ? 'bg-surface-lowest shadow-card' : 'bg-surface-low'}`}
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-on-surface font-newsreader mb-2">{f.title}</h3>
              <p className="text-sm text-on-surface-variant font-manrope leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { value: '10,000+', label: 'Foods in database' },
    { value: '100+', label: 'Exercises tracked' },
    { value: '100%', label: 'Free forever' },
  ]

  return (
    <section className="py-16 px-4 bg-surface-low">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-light text-primary font-newsreader mb-1 data-value">{s.value}</div>
              <div className="text-sm text-on-surface-variant font-manrope">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTABanner() {
  return (
    <section className="py-20 px-4 bg-gradient-primary">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-light text-white font-newsreader mb-3">
          Ready to begin your journey?
        </h2>
        <p className="text-white/70 font-manrope mb-10 leading-relaxed">
          Join thousands of people already tracking their health with Cronometer.
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-3 bg-white text-primary font-semibold font-manrope rounded-full hover:bg-surface-lowest transition-colors shadow-ambient"
        >
          Create Free Account
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-surface-low py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm font-bold text-on-surface font-newsreader">Cronometer</span>
        <div className="flex items-center gap-5 text-sm text-on-surface-variant font-manrope">
          <Link to="/login" className="hover:text-on-surface transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-on-surface transition-colors">Register</Link>
          <span>© {new Date().getFullYear()} Cronometer</span>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTABanner />
      <Footer />
    </div>
  )
}
