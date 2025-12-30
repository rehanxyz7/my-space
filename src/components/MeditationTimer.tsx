import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

interface MeditationTimerProps {
  onStateChange: (isActive: boolean) => void;
  onComplete: () => void;
}

const timerPresets = [
  { label: '1 min', value: 1 },
  { label: '5 min', value: 5 },
  { label: '7 min', value: 7 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '25 min', value: 25 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
];

const MeditationTimer = ({ onStateChange, onComplete }: MeditationTimerProps) => {
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(selectedDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [breathCountdown, setBreathCountdown] = useState(4);
  const [cycles, setCycles] = useState(0);

  const inhaleTime = 4;
  const holdTime = 4;
  const exhaleTime = 4;
  const restTime = 2;

  const phaseConfig = {
    inhale: { duration: inhaleTime, next: 'hold' as BreathPhase, label: 'Breathe In', scale: 1.3 },
    hold: { duration: holdTime, next: 'exhale' as BreathPhase, label: 'Hold', scale: 1.3 },
    exhale: { duration: exhaleTime, next: 'rest' as BreathPhase, label: 'Breathe Out', scale: 1 },
    rest: { duration: restTime, next: 'inhale' as BreathPhase, label: 'Rest', scale: 1 },
  };

  const progress = 1 - timeLeft / (selectedDuration * 60);
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    setTimeLeft(selectedDuration * 60);
  }, [selectedDuration]);

  useEffect(() => {
    onStateChange(isActive);
  }, [isActive, onStateChange]);

  // Main timer countdown
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onComplete]);

  // Breathing phase timer
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setBreathCountdown((prev) => {
        if (prev <= 1) {
          const currentConfig = phaseConfig[phase];
          const nextPhase = currentConfig.next;
          setPhase(nextPhase);
          
          if (nextPhase === 'inhale') {
            setCycles((c) => c + 1);
          }
          
          return phaseConfig[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedDuration * 60);
      setCycles(0);
      setPhase('inhale');
      setBreathCountdown(inhaleTime);
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration * 60);
    setPhase('inhale');
    setBreathCountdown(inhaleTime);
    setCycles(0);
  };

  const currentConfig = phaseConfig[phase];
  const isComplete = timeLeft === 0;

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Timer Selection */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {timerPresets.map((preset) => (
          <motion.button
            key={preset.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isActive) {
                setSelectedDuration(preset.value);
              }
            }}
            disabled={isActive}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedDuration === preset.value
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>

      {/* Main Timer Circle with Breathing */}
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-secondary/30"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="140"
            fill="none"
            stroke="url(#meditationGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="meditationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(260 60% 65%)" />
              <stop offset="100%" stopColor="hsl(280 70% 55%)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Breathing animation ring */}
        {isActive && (
          <>
            <motion.div
              className="absolute inset-8 rounded-full border-2 border-accent/20"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </>
        )}

        {/* Main breathing circle */}
        <motion.div
          className="absolute inset-12 md:inset-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 backdrop-blur-sm border border-accent/30 flex items-center justify-center"
          animate={{
            scale: isActive ? currentConfig.scale : 1,
            boxShadow: isActive 
              ? '0 0 60px hsl(260 60% 65% / 0.4), inset 0 0 40px hsl(260 60% 65% / 0.1)'
              : '0 0 30px hsl(260 60% 65% / 0.2)',
          }}
          transition={{ duration: currentConfig.duration, ease: 'easeInOut' }}
        >
          <div className="text-center">
            {isComplete ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-6xl mb-2">🧘</div>
                <p className="text-xl font-display font-semibold">Complete!</p>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.p
                      key={phase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-lg md:text-xl font-display font-semibold text-foreground"
                    >
                      {currentConfig.label}
                    </motion.p>
                  )}
                </AnimatePresence>
                
                <motion.p
                  className="text-4xl md:text-5xl font-display font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary"
                >
                  {formatTime(timeLeft)}
                </motion.p>
                
                {isActive && (
                  <motion.p
                    key={breathCountdown}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-accent/80 mt-1"
                  >
                    {breathCountdown}
                  </motion.p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="hero"
            size="xl"
            onClick={toggleTimer}
            className="min-w-[160px] bg-gradient-to-r from-accent to-primary"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" /> {isComplete ? 'Restart' : 'Start'}
              </>
            )}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="glass" size="xl" onClick={reset}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Duration: <span className="text-primary font-medium">{selectedDuration} min</span>
          </span>
        </div>
        <div className="text-sm">
          Cycles: <span className="text-accent font-semibold">{cycles}</span>
        </div>
      </div>
    </div>
  );
};

export default MeditationTimer;
