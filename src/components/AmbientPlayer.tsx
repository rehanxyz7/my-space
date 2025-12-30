import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AmbientPlayerProps {
  autoPlay?: boolean;
  defaultVolume?: number;
}

const AmbientPlayer = ({ autoPlay = true, defaultVolume = 0.25 }: AmbientPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const createBrownNoise = (audioContext: AudioContext): AudioBuffer => {
    const bufferSize = audioContext.sampleRate * 4;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    }
    return buffer;
  };

  const startAmbientSound = useCallback(() => {
    if (audioContextRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const masterGain = audioContext.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioContext.destination);
    gainNodeRef.current = masterGain;

    // Create brown noise for rain-like ambient
    const noiseBuffer = createBrownNoise(audioContext);
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    // Filter for soft rain sound
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    lowpass.Q.value = 0.5;

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 100;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.4;
    
    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    nodesRef.current.push(noise);

    // Add subtle wind whoosh with modulation
    const windNoise = audioContext.createBufferSource();
    windNoise.buffer = noiseBuffer;
    windNoise.loop = true;

    const windFilter = audioContext.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 300;
    windFilter.Q.value = 2;

    // Modulate the wind filter frequency
    const windLfo = audioContext.createOscillator();
    const windLfoGain = audioContext.createGain();
    windLfo.type = 'sine';
    windLfo.frequency.value = 0.05;
    windLfoGain.gain.value = 150;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    windLfo.start();

    const windGain = audioContext.createGain();
    windGain.gain.value = 0.15;

    windNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windNoise.start();
    nodesRef.current.push(windNoise, windLfo);

    // Add very low drone for depth
    const drone = audioContext.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 55;
    
    const droneGain = audioContext.createGain();
    droneGain.gain.value = 0.08;
    
    drone.connect(droneGain);
    droneGain.connect(masterGain);
    drone.start();
    nodesRef.current.push(drone);

    setIsPlaying(true);
  }, [volume]);

  const stopAmbientSound = useCallback(() => {
    nodesRef.current.forEach(node => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          (node as OscillatorNode | AudioBufferSourceNode).stop();
        }
      } catch (e) {}
    });
    nodesRef.current = [];

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    gainNodeRef.current = null;
    setIsPlaying(false);
  }, []);

  const toggleAmbient = () => {
    setHasInteracted(true);
    if (isPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current?.currentTime || 0);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, [stopAmbientSound]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        if (autoPlay) {
          startAmbientSound();
        }
      }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [autoPlay, hasInteracted, startAmbientSound]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center gap-4 p-4 glass-card rounded-xl"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Wind className={`w-5 h-5 ${isPlaying ? 'text-primary' : 'text-muted-foreground'}`} />
        </motion.div>
        <span className="text-sm font-medium whitespace-nowrap">Ambient Rain</span>
      </div>
      
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant={isPlaying ? 'glow' : 'outline'}
          size="sm"
          onClick={toggleAmbient}
          className="min-w-[80px]"
        >
          {isPlaying ? (
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

export default AmbientPlayer;
