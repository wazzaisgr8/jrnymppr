import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: '/IMG_0120.jpeg',
    headline: 'Organise all your journey maps in one place',
    description: 'Manage every customer journey across your organisation from a clean, centralised workspace.',
  },
  {
    image: '/IMG_0119.jpeg',
    headline: 'Build rich personas with real depth',
    description: 'Define goals, frustrations, attributes, and key quotes to keep your whole team aligned.',
  },
  {
    image: '/IMG_0118.jpeg',
    headline: 'Visualise every touchpoint and emotion',
    description: 'Map phases, channels, needs, and the emotional journey in a single collaborative canvas.',
  },
];

function Carousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 200);
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm">
        <div
          className="w-full h-full transition-opacity duration-300"
          style={{ opacity: animating ? 0 : 1 }}
        >
          <img
            src={slide.image}
            alt={slide.headline}
            className="w-full h-full object-cover object-top rounded-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl" />
        </div>

        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 rounded-b-2xl">
          <p
            className="text-white font-semibold text-lg leading-snug mb-1 transition-opacity duration-300"
            style={{ opacity: animating ? 0 : 1 }}
          >
            {slide.headline}
          </p>
          <p
            className="text-white/75 text-sm leading-relaxed transition-opacity duration-300"
            style={{ opacity: animating ? 0 : 1 }}
          >
            {slide.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all ${
              i === current
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">

        <div className="hidden lg:flex flex-col flex-1 min-h-[580px] rounded-3xl p-8"
          style={{ background: 'linear-gradient(135deg, #2aada0 0%, #1a8a80 50%, #156e66 100%)' }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <rect width="56" height="56" fill="rgba(255,255,255,0.15)"/>
                <path d="M12 36 Q20 20 28 28 Q36 36 44 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="12" cy="36" r="3" fill="white"/>
                <circle cx="28" cy="28" r="3" fill="white"/>
                <circle cx="44" cy="20" r="3" fill="white"/>
                <path d="M18 44 L38 44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <span className="text-white font-bold tracking-widest text-lg">JRNYMPPR</span>
          </div>

          <div className="flex-1">
            <Carousel />
          </div>
        </div>

        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 overflow-hidden bg-teal">
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
                <rect width="56" height="56" fill="#3CBFB0"/>
                <path d="M12 36 Q20 20 28 28 Q36 36 44 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="12" cy="36" r="3" fill="white"/>
                <circle cx="28" cy="28" r="3" fill="white"/>
                <circle cx="44" cy="20" r="3" fill="white"/>
                <path d="M18 44 L38 44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-widest text-neutral-dark">JRNYMPPR</h1>
            <p className="text-neutral-mid text-sm mt-1">Professional customer journey mapping</p>
          </div>

          <div className="hidden lg:block mb-6">
            <h2 className="text-2xl font-bold text-neutral-dark">Welcome back</h2>
            <p className="text-neutral-mid text-sm mt-1">Sign in to your workspace</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-8">
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              {(['signin', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === m ? 'bg-white shadow-sm text-neutral-dark' : 'text-neutral-mid hover:text-neutral-dark'
                  }`}
                >
                  {m === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-mid mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-light text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-neutral-mid mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-light text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-mid mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border border-neutral-light text-sm focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-mid hover:text-neutral-dark"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 mt-2"
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {mode === 'signin' && (
              <p className="text-center text-xs text-neutral-mid mt-4">
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-teal font-medium hover:underline">
                  Sign up free
                </button>
              </p>
            )}
          </div>

          <p className="text-center text-xs text-neutral-mid mt-6">
            Trusted by 2,000+ CX teams worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
