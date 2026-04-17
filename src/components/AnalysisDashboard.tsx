import { useMemo } from 'react';
import type { AnalysisResult } from '../core/AnalysisEngine';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { AlertTriangle, CheckCircle, Activity, Clock, FileWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface AnalysisDashboardProps {
    result: AnalysisResult;
    isRecording: boolean;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, isRecording }) => {
    
    const statusColor = useMemo(() => {
        if (result.confidenceScore >= 80) return 'text-accent-cyan shadow-[0_0_20px_rgba(0,240,255,0.3)] border-accent-cyan/40 bg-accent-cyan/10';
        if (result.confidenceScore >= 50) return 'text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] border-yellow-500/40 bg-yellow-500/10';
        return 'text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] border-red-500/40 bg-red-500/10';
    }, [result.confidenceScore]);

    const statusHex = useMemo(() => {
        if (result.confidenceScore >= 80) return '#00f0ff';
        if (result.confidenceScore >= 50) return '#eab308';
        return '#ef4444';
    }, [result.confidenceScore]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="glass-panel flex flex-col h-full p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Authentication Analysis</h2>
                    <p className="text-white/50 text-sm">Real-time behavioral signatures</p>
                </div>
                {result.cpm > 0 && !isRecording && (
                     <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`flex items-center gap-2 px-5 py-2 border rounded-full font-bold ${statusColor}`}
                     >
                         {result.confidenceScore >= 80 ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
                         Confidence: {result.confidenceScore}%
                     </motion.div>
                )}
            </div>

            {result.cpm === 0 && !isRecording ? (
                <div className="flex-1 flex items-center justify-center text-white/40 text-lg">
                    <Activity size={24} className="mr-3 opacity-50" />
                    Awaiting telemetry stream...
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-12 gap-6 mt-8"
                >
                    {/* Top Metrics */}
                    <motion.div variants={itemVariants} className="col-span-3 glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                            <Activity size={16} className="text-accent-cyan" /> Typing Speed
                        </div>
                        <div className="font-mono text-4xl font-bold text-white flex items-baseline gap-2 drop-shadow-md">
                            {result.cpm} <span className="font-main text-base text-white/50 font-normal">CPM</span>
                        </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="col-span-3 glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                            <Clock size={16} className="text-accent-magenta" /> Revision Ratio
                        </div>
                        <div className="font-mono text-4xl font-bold text-white flex items-baseline gap-2 drop-shadow-md">
                            {result.revisionRatio}<span className="font-main text-base text-white/50 font-normal">%</span>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="col-span-3 glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                            <FileWarning size={16} className="text-yellow-500" /> Paste Events
                        </div>
                        <div className="font-mono text-4xl font-bold text-white flex items-baseline gap-2 drop-shadow-md">
                            {result.pasteCount}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="col-span-3 glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                            Human Likelihood
                        </div>
                        <div className="font-mono text-4xl font-bold flex items-baseline gap-2" style={{ color: statusHex, textShadow: `0 0 15px ${statusHex}80` }}>
                            {result.confidenceScore}<span className="font-main text-base opacity-70 font-normal">%</span>
                        </div>
                    </motion.div>

                    {/* Charts */}
                    <motion.div variants={itemVariants} className="col-span-6 glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent min-h-[320px]">
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-6">Typing Rhythm over Time</h3>
                        {result.cpmHistory.length > 0 ? (
                           <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={result.cpmHistory}>
                                    <defs>
                                        <linearGradient id="colorCpm" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'JetBrains Mono'}} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'JetBrains Mono'}} />
                                    <Tooltip 
                                        contentStyle={{ background: 'rgba(10,10,12,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }} 
                                        itemStyle={{ color: '#00f0ff', fontWeight: 'bold' }} 
                                    />
                                    <Area type="monotone" dataKey="cpm" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorCpm)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                           <div className="h-[220px] flex items-center justify-center text-white/40">Accumulating data points...</div>
                        )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="col-span-6 glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent min-h-[320px]">
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-6">Pause Distribution</h3>
                        {result.pauseHistogram.some(h => h.count > 0) ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={result.pauseHistogram}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'JetBrains Mono'}} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'JetBrains Mono'}} />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                                        contentStyle={{ background: 'rgba(10,10,12,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }} 
                                        itemStyle={{ color: '#ff003c', fontWeight: 'bold' }} 
                                    />
                                    <Bar dataKey="count" fill="#ff003c" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                           <div className="h-[220px] flex items-center justify-center text-white/40">Waiting for natural cadence patterns...</div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};
