import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
    setAuth: (val: boolean) => void;
}

export default function LoginView({ setAuth }: LoginViewProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                // Optionally save user data: localStorage.setItem('user', JSON.stringify(data.user));
                setAuth(true);
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Server unreachable. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Premium background effects */}
            <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] top-[-100px] left-[-100px] pointer-events-none"></div>
            <div className="absolute w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] bottom-[-50px] right-[-50px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center p-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <img src="/adeaur-logo.png" alt="Adeaur Admin" className="object-contain mix-blend-multiply" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Adeaur Operations</h1>
                    <p className="text-sm text-slate-400">Restricted BI Dashboard & Command Center</p>
                </div>

                <div className="bg-[#121215]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">

                        {error && (
                            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-slate-600"
                                    placeholder="admin@adeaur.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-slate-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-white text-slate-950 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors mt-2"
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    Secure Login <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-800/60 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> End-to-end encrypted session
                    </div>
                </div>
            </div>
        </div>
    );
}
