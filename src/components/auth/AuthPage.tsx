import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Map, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
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
  );
}
