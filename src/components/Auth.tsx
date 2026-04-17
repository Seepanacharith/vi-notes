import { useState } from 'react';
import { AuthService } from '../core/AuthService';
import type { User } from '../core/AuthService';
import { ShieldCheck, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthProps {
    onLogin: (user: User) => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        try {
            if (!email || !password) {
                throw new Error("Fields cannot be empty.");
            }
            
            let user: User;
            if (isLogin) {
                user = AuthService.login(email, password);
            } else {
                user = AuthService.register(email, password);
            }
            onLogin(user);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An error occurred.");
            }
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-full w-full">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="glass-panel w-full max-w-[440px] p-12 relative z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="relative mb-6"
                    >
                        <ShieldCheck size={56} className="text-accent-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
                    </motion.div>
                    <h2 className="m-0 text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">Vi-Notes</h2>
                    <p className="mt-2 uppercase tracking-[0.1em] text-xs font-bold text-white/50">Secure Authorization</p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium overflow-hidden"
                        >
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <label className="block text-xs text-white/50 mb-2 font-bold uppercase tracking-wider">Email Context</label>
                        <input 
                            type="email" 
                            className="w-full bg-black/30 border border-white/10 text-white px-4 py-3.5 rounded-xl font-main text-base outline-none transition-all duration-300 focus:border-accent-cyan focus:bg-accent-cyan/5 focus:shadow-[0_0_0_4px_rgba(0,240,255,0.1)] placeholder-white/20" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="agent@domain.com"
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-xs text-white/50 mb-2 font-bold uppercase tracking-wider">Access Token</label>
                        <input 
                            type="password" 
                            className="w-full bg-black/30 border border-white/10 text-white px-4 py-3.5 rounded-xl font-main text-base outline-none transition-all duration-300 focus:border-accent-cyan focus:bg-accent-cyan/5 focus:shadow-[0_0_0_4px_rgba(0,240,255,0.1)] placeholder-white/20" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full mt-4 p-4 flex items-center justify-center gap-2 bg-accent-cyan text-black font-bold rounded-xl shadow-[0_4px_20px_rgba(0,240,255,0.3)] hover:shadow-[0_6px_24px_rgba(0,240,255,0.4)] transition-shadow"
                    >
                        {isLogin ? <><LogIn size={18} /> Initialize Session</> : <><UserPlus size={18} /> Generate Identity</>}
                    </motion.button>
                </form>

                <div className="mt-8 text-center text-sm text-white/50">
                    {isLogin ? "No existing profile? " : "Active profile found? "}
                    <button 
                        type="button"
                        className="text-accent-cyan font-bold hover:text-white transition-colors"
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                    >
                        {isLogin ? "Create One" : "Authenticate"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
