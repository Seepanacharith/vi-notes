import { useState, useEffect, useMemo } from 'react';
import { Editor } from './components/Editor';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { SessionTracker } from './core/SessionTracker';
import { AnalysisEngine } from './core/AnalysisEngine';
import type { AnalysisResult } from './core/AnalysisEngine';
import { Auth } from './components/Auth';
import { AuthService } from './core/AuthService';
import type { User } from './core/AuthService';
import { SessionHistory } from './components/SessionHistory';
import { SessionService } from './core/SessionService';
import { Edit3, Activity, ShieldCheck, LogOut, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './utils';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(AuthService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'editor' | 'analysis' | 'history'>('editor');
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(AnalysisEngine.analyze([]));
  
  // Keep a persistent tracker instance
  const tracker = useMemo(() => new SessionTracker(), []);

  // Poll for updates every second if recording, or compute once when tab switches
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = setInterval(() => {
        setAnalysisResult(AnalysisEngine.analyze(tracker.getLog()));
      }, 200) as unknown as number;
    } else {
        const log = tracker.getLog();
        if (log.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAnalysisResult(AnalysisEngine.analyze(log));
        }
    }
    return () => clearInterval(interval);
  }, [isRecording, tracker, activeTab]);

  return (
    <div className="flex h-screen w-screen bg-cyber-bg text-white font-main antialiased overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="w-[280px] bg-cyber-panel backdrop-blur-2xl border-r border-cyber-border flex flex-col p-8 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center gap-3 text-2xl font-bold text-white mb-12 tracking-tight">
          <ShieldCheck className="text-accent-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]" size={32} />
          <span>Vi-Notes</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <NavItem active={activeTab === 'editor'} onClick={() => setActiveTab('editor')} icon={<Edit3 size={18} />} label="Editor" />
          <NavItem active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={<Activity size={18} />} label="Analysis Dashboard" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18} />} label="Session History" />
        </div>

        <div className="mt-auto flex flex-col gap-4">
             {currentUser && (
                <div className="glass-panel flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm">
                        <div className="text-white/50 uppercase tracking-widest mb-1 text-[10px] font-bold">Logged In</div>
                        <div className="text-white font-medium overflow-hidden text-ellipsis max-w-[130px]">{currentUser.email}</div>
                    </div>
                    <button 
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors" 
                        onClick={() => { AuthService.logout(); setCurrentUser(null); }} 
                        title="Log out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
             )}
             <div className="text-xs text-white/40 text-center leading-relaxed">
                 Secure local session active.<br/>Zero telemetry transmitted.
             </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-12 overflow-y-auto relative">
        {!currentUser ? (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full w-full"
            >
              <Auth onLogin={setCurrentUser} />
            </motion.div>
        ) : (
            <>
                <div className={cn("h-full", activeTab === 'editor' ? 'block' : 'hidden')}>
                  <Editor 
                      tracker={tracker} 
                      onSessionStateChange={setIsRecording} 
                      onSaveSession={(text) => {
                          const finalLog = tracker.getLog();
                          const finalResult = finalLog.length > 0 ? AnalysisEngine.analyze(finalLog) : analysisResult;
                          SessionService.saveSession(currentUser.id, text, finalResult);
                          setAnalysisResult(finalResult);
                          setActiveTab('history');
                      }}
                  />
                </div>
                
                {activeTab === 'analysis' && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <AnalysisDashboard result={analysisResult} isRecording={isRecording} />
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <SessionHistory userId={currentUser.id} />
                  </motion.div>
                )}
            </>
        )}
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/60 font-medium transition-all duration-300 overflow-hidden text-left",
        "hover:text-white hover:bg-white/5",
        active && "text-white bg-accent-cyan/5 border-none"
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-bg"
          className="absolute inset-0 bg-gradient-to-r from-accent-cyan/10 to-transparent z-0"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className={cn("relative z-10", active && "text-accent-cyan drop-shadow-[0_0_4px_rgba(0,240,255,0.5)]")}>
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

export default App;
