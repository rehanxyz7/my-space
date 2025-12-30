import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface MeditationAudioProps {
  isPlaying: boolean;
  defaultVolume?: number;
}

const MeditationAudio = ({ isPlaying, defaultVolume = 0.4 }: MeditationAudioProps) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(defaultVolume);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const startChantingSound = useCallback(() => {
    if (audioContextRef.current || !audioEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const masterGain = audioContext.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioContext.destination);
    gainNodeRef.current = masterGain;

    // OM frequency (cosmic frequency 136.1 Hz)
    const omFreq = 136.1;
    
    // Create rich OM drone with multiple layers
    // Layer 1: Base OM tone
    const baseOsc = audioContext.createOscillator();
    baseOsc.type = 'sine';
    baseOsc.frequency.value = omFreq;
    
    const baseGain = audioContext.createGain();
    baseGain.gain.value = 0.2;
    
    baseOsc.connect(baseGain);
    baseGain.connect(masterGain);
    baseOsc.start();
    nodesRef.current.push(baseOsc);

    // Layer 2: Octave harmonics for richness
    [2, 3, 4].forEach((mult, i) => {
      const osc = audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = omFreq * mult;
      
      const gain = audioContext.createGain();
      gain.gain.value = 0.1 / (mult);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      nodesRef.current.push(osc);
    });

    // Layer 3: Detuned voices for choir effect
    [-8, -4, 4, 8].forEach((detune) => {
      const osc = audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = omFreq;
      osc.detune.value = detune;
      
      const gain = audioContext.createGain();
      gain.gain.value = 0.06;
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      nodesRef.current.push(osc);
    });

    // Layer 4: Fifth harmony (203.4 Hz) for depth
    const fifthOsc = audioContext.createOscillator();
    fifthOsc.type = 'sine';
    fifthOsc.frequency.value = omFreq * 1.5;
    
    const fifthGain = audioContext.createGain();
    fifthGain.gain.value = 0.08;
    
    fifthOsc.connect(fifthGain);
    fifthGain.connect(masterGain);
    fifthOsc.start();
    nodesRef.current.push(fifthOsc);

    // Layer 5: Sub-bass for warmth
    const subOsc = audioContext.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = omFreq / 2;
    
    const subGain = audioContext.createGain();
    subGain.gain.value = 0.12;
    
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    nodesRef.current.push(subOsc);

    // Layer 6: Slow amplitude modulation for breathing effect
    const lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // Very slow ~8 second cycle
    
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = 0.15;
    
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();
    nodesRef.current.push(lfo);

    // Layer 7: Subtle shimmer with high frequencies
    const shimmer = audioContext.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = omFreq * 8;
    
    const shimmerGain = audioContext.createGain();
    shimmerGain.gain.value = 0.02;
    
    const shimmerLfo = audioContext.createOscillator();
    shimmerLfo.type = 'sine';
    shimmerLfo.frequency.value = 0.3;
    
    const shimmerLfoGain = audioContext.createGain();
    shimmerLfoGain.gain.value = 0.01;
    
    shimmerLfo.connect(shimmerLfoGain);
    shimmerLfoGain.connect(shimmerGain.gain);
    
    shimmer.connect(shimmerGain);
    shimmerGain.connect(masterGain);
    shimmer.start();
    shimmerLfo.start();
    nodesRef.current.push(shimmer, shimmerLfo);

  }, [audioEnabled, volume]);

  const stopChantingSound = useCallback(() => {
    nodesRef.current.forEach(node => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          (node as OscillatorNode).stop();
        }
      } catch (e) {}
    });
    nodesRef.current = [];

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    gainNodeRef.current = null;
  }, []);

  useEffect(() => {
    if (isPlaying && audioEnabled) {
      startChantingSound();
    } else {
      stopChantingSound();
    }

    return () => {
      stopChantingSound();
    };
  }, [isPlaying, audioEnabled, startChantingSound, stopChantingSound]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  }, [volume]);

  const isActive = audioEnabled && isPlaying;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col sm:flex-row items-center gap-4 p-4 glass-card rounded-xl"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={isActive ? { rotate: [0, 360] } : {}}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        >
          <Sparkles className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
        </motion.div>
        <span className="text-sm font-medium whitespace-nowrap">OM Chanting</span>
      </div>
      
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant={audioEnabled ? 'glow' : 'outline'}
          size="sm"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="min-w-[80px]"
        >
          {audioEnabled ? (
            <>
              <Volume2 className="w-4 h-4" /> On
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" /> Off
            </>
          )}
        </Button>
      </motion.div>
      
      <div className="flex items-center gap-3">
        <Slider
          value={[volume * 100]}
          onValueChange={([val]) => setVolume(val / 100)}
          max={100}
          step={1}
          className="w-28"
        />
        <span className="text-xs text-muted-foreground w-10 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </motion.div>
  );
};

export default MeditationAudio;
