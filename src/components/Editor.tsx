import { useState, useRef, useEffect } from 'react';
import type { SessionTracker } from '../core/SessionTracker';
import { Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';

interface EditorProps {
    tracker: SessionTracker;
    onSessionStateChange: (isRecording: boolean) => void;
    onSaveSession?: (text: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ tracker, onSessionStateChange, onSaveSession }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        onSessionStateChange(isRecording);
    }, [isRecording, onSessionStateChange]);

    const handleStart = () => {
        tracker.startSession();
        setIsRecording(true);
        if (textareaRef.current) textareaRef.current.focus();
    };

    const handleStop = () => {
        setIsRecording(false);
        if (text.length > 0 && onSaveSession) {
            onSaveSession(text);
            handleReset();
        }
    };

    const handleReset = () => {
        tracker.clear();
        setText('');
        setIsRecording(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isRecording) {
            tracker.startSession();
            setIsRecording(true);
        }
        if (e.ctrlKey || e.metaKey) return;
        tracker.handleKeyDown(e.key, false);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isRecording) return;
        tracker.handleKeyUp(e.key);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (!isRecording) {
            tracker.startSession();
            setIsRecording(true);
        }
        const pastedText = e.clipboardData.getData('text');
        if (pastedText.length > 0) {
            tracker.recordPaste(pastedText.length);
        }
    };

    return (
        <div className="glass-panel flex flex-col h-full p-8 relative overflow-hidden group">
            {/* Ambient Background Glow when recording */}
            <motion.div 
                className="absolute inset-0 bg-accent-magenta/5 pointer-events-none"
                animate={{ opacity: isRecording ? 1 : 0 }}
                transition={{ duration: 1 }}
            />

            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Secure Editor</h2>
                    <p className="text-white/50 text-sm">Behavioral telemetry is captured locally for authenticity validation.</p>
                </div>
                <div className="flex gap-4 items-center">
                    {isRecording && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-4 py-1.5 bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/40 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(255,0,60,0.3)]"
                        >
                            <motion.span 
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="inline-block w-2 h-2 rounded-full bg-accent-magenta"
                            />
                            Active Tracking
                        </motion.div>
                    )}
                    {!isRecording && text.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 text-white border border-white/10 rounded-full text-sm font-bold">
                            Ready
                        </div>
                    )}

                    {!isRecording ? (
                        <div className="flex gap-3">
                            <motion.button 
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent-cyan text-black font-bold rounded-xl shadow-[0_4px_15px_rgba(0,240,255,0.2)] hover:shadow-[0_6px_20px_rgba(0,240,255,0.4)] transition-shadow" 
                                onClick={handleStart}
                            >
                                <Play size={16} /> Initialize Session
                            </motion.button>
                            {text.length > 0 && onSaveSession && (
                                <motion.button 
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-accent-cyan/50 text-accent-cyan font-bold rounded-xl hover:bg-accent-cyan/10 transition-colors" 
                                    onClick={() => {
                                        onSaveSession(text);
                                        handleReset();
                                    }}
                                >
                                    Persist Log
                                </motion.button>
                            )}
                        </div>
                    ) : (
                        <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-accent-magenta/50 text-accent-magenta font-bold rounded-xl hover:bg-accent-magenta/10 transition-colors" 
                            onClick={handleStop}
                        >
                            <Square size={16} /> Terminate
                        </motion.button>
                    )}

                    <motion.button 
                        whileHover={{ rotate: 90 }}
                        className="p-3 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-colors" 
                        onClick={handleReset} 
                        title="Reset Editor"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                    </motion.button>
                </div>
            </div>

            <textarea
                ref={textareaRef}
                className="flex-1 w-full bg-transparent border-none text-white font-main font-light text-xl leading-relaxed resize-none outline-none placeholder-white/20 mt-4 relative z-10 custom-scrollbar"
                placeholder="Awaiting input stream..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onPaste={handlePaste}
            />
        </div>
    );
};
