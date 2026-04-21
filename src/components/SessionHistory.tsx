import { SessionService } from '../core/SessionService';
import type { SavedSession } from '../core/SessionService';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface SessionHistoryProps {
    userId: string;
}

export const SessionHistory = ({ userId }: SessionHistoryProps) => {
    const sessions = SessionService.getSessions(userId);

    const getStatusColor = (score: number) => {
        if (score >= 80) return 'text-accent-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)] border-accent-cyan/40 bg-accent-cyan/10';
        if (score >= 50) return 'text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)] border-yellow-500/40 bg-yellow-500/10';
        return 'text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] border-red-500/40 bg-red-500/10';
    };

    if (sessions.length === 0) {
        return (
            <div className="glass-panel flex flex-col h-full items-center justify-center p-8 text-center">
                <motion.div 
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                >
                    <Clock size={64} className="mb-6 opacity-30 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">No Telemetry Records Found</h3>
                <p className="text-white/50 max-w-sm">You haven't initialized any secure writing sessions yet. Return to the editor to begin.</p>
            </div>
        );
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="glass-panel flex flex-col h-full p-8 overflow-hidden">
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-1">Your Saved Sessions</h2>
                <p className="text-white/50 text-sm">Review the authenticity analyses of your past documents.</p>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar"
            >
                {sessions.map((session: SavedSession, index: number) => {
                    const colorClasses = getStatusColor(session.analysis.confidenceScore);
                    const isAuthentic = session.analysis.confidenceScore >= 80;
                    const sessionNumber = sessions.length - index;

                    return (
                        <motion.div 
                            key={session.id} 
                            variants={itemVariants}
                            whileHover={{ y: -4, scale: 1.01 }}
                            className="glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent flex flex-col gap-5 relative overflow-hidden group cursor-pointer"
                        >
                            {/* Hover accent line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex flex-col gap-4">
                                <div className="text-lg font-bold text-white">
                                    {sessionNumber} Editor
                                </div>
                                <div className="text-sm text-white/50 font-mono">
                                    {new Date(session.date).toLocaleString()}
                                </div>
                                <div>
                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-xs font-bold ${colorClasses}`}>
                                        {isAuthentic ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                                        Score: {session.analysis.confidenceScore.toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-sm font-bold text-white mb-2">Analysis Dashboard</div>
                                <div className="text-xs text-white/50 mb-1">Preview:</div>
                                <div className="bg-black/30 p-5 rounded-xl text-white font-normal leading-relaxed border border-white/5 text-base whitespace-pre-wrap">
                                    {session.text}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-bold text-white mb-2">Session History</div>
                                <div className="flex flex-col gap-2 font-mono text-xs text-white/50">
                                    <div><strong className="text-white font-main mr-1.5">CPM:</strong>{session.analysis.cpm}</div>
                                    <div><strong className="text-white font-main mr-1.5">Paste Count:</strong>{session.analysis.pasteCount}</div>
                                    <div><strong className="text-white font-main mr-1.5">Revision %:</strong>{session.analysis.revisionRatio}%</div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};
