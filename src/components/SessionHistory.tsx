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
                <h2 className="text-2xl font-bold mb-1">Telemetry Archive</h2>
                <p className="text-white/50 text-sm">Review the authenticity analysis of your persistent documents.</p>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar"
            >
                {sessions.map((session: SavedSession) => {
                    const colorClasses = getStatusColor(session.analysis.confidenceScore);
                    const isAuthentic = session.analysis.confidenceScore >= 80;

                    return (
                        <motion.div 
                            key={session.id} 
                            variants={itemVariants}
                            whileHover={{ y: -4, scale: 1.01 }}
                            className="glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent flex flex-col gap-5 relative overflow-hidden group cursor-pointer"
                        >
                            {/* Hover accent line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-white/50 font-mono">
                                    {new Date(session.date).toLocaleString()}
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-1.5 border rounded-full text-xs font-bold ${colorClasses}`}>
                                    {isAuthentic ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                                    Score: {session.analysis.confidenceScore}%
                                </div>
                            </div>
                            
                            <div className="bg-black/30 p-5 rounded-xl text-white/70 font-light leading-relaxed border border-white/5 relative max-h-[120px] overflow-hidden">
                                "{session.text.substring(0, 300)}{session.text.length > 300 ? '...' : ''}"
                                {session.text.length > 300 && (
                                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
                                )}
                            </div>

                            <div className="flex gap-8 font-mono text-xs text-white/50 mt-1">
                                <div><strong className="text-white font-main mr-1.5">CPM:</strong>{session.analysis.cpm}</div>
                                <div><strong className="text-white font-main mr-1.5">PASTES:</strong>{session.analysis.pasteCount} chunks</div>
                                <div><strong className="text-white font-main mr-1.5">REVISIONS:</strong>{session.analysis.revisionRatio}%</div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};
