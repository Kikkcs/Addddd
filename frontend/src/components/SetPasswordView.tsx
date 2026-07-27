import React, { useState, useEffect } from 'react';
import { Lock, Mail, CheckCircle2, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface SetPasswordViewProps {
    inviteToken: string;
    onComplete: () => void;
}

export default function SetPasswordView({ inviteToken, onComplete }: SetPasswordViewProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Verify invitation token
        fetch(`${API_BASE_URL}/api/auth/verify-invite?token=${encodeURIComponent(inviteToken)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEmail(data.email);
                    setRole(data.role);
                } else {
                    setError(data.message || 'Invalid or expired invitation link');
                }
            })
            .catch(() => setError('Failed to verify invitation link. Server unreachable.'))
            .finally(() => setLoading(false));
    }, [inviteToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/setup-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: inviteToken, password })
            });

            const data = await res.json();

            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                setSuccess(true);
                setTimeout(() => {
                    // Remove token from query param and log in
                    const url = new URL(window.location.href);
                    url.searchParams.delete('inviteToken');
                    window.history.replaceState({}, '', url.toString());
                    onComplete();
                }, 1500);
            } else {
                setError(data.message || 'Password setup failed. Please try again.');
            }
        } catch {
            setError('Server error during password setup.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 mt-3">Verifying invitation token...</p>
            </div>
        );
    }

    if (error && !email) {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#121215] border border-rose-500/20 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-full mx-auto flex items-center justify-center text-rose-400">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Invalid Invitation</h2>
                    <p className="text-xs text-slate-400">{error}</p>
                    <button
                        onClick={() => {
                            const url = new URL(window.location.href);
                            url.searchParams.delete('inviteToken');
                            window.history.replaceState({}, '', url.toString());
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        Go to Login Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center p-2">
                        <img src="/adeaur-logo.png" alt="Adeaur Admin" className="object-contain mix-blend-multiply" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Set Up Your Password</h1>
                    <p className="text-xs text-slate-400">Welcome to Adeaur BI Operations ({role} Role)</p>
                </div>

                <div className="bg-[#121215]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
                    {success ? (
                        <div className="text-center py-6 space-y-3">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                            <h3 className="text-lg font-bold text-white">Password Set Successfully!</h3>
                            <p className="text-xs text-slate-400">Logging you into your workspace now...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Invited Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="email"
                                        disabled
                                        value={email}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xs cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Choose Your Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-bold text-xs transition-colors mt-4 cursor-pointer"
                            >
                                {submitting ? 'Setting Password...' : (
                                    <>
                                        Complete Account Setup <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Password stored securely with bcrypt hashing
                    </div>
                </div>
            </div>
        </div>
    );
}
