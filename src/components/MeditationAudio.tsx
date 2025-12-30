import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const lfoRef = useRef<OscillatorNode | null>(null);

  const startChantingSound = useCallback(() => {
    if (audioContextRef.current || !audioEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const masterGain = audioContext.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioContext.destination);
    gainNodeRef.current = masterGain;

    // Create OM chanting frequencies (harmonic series)
    // Base frequency for OM is around 136.1 Hz (cosmic OM frequency)
    const baseFreq = 136.1;
    const harmonics = [1, 2, 3, 4, 5];
    
    harmonics.forEach((harmonic, index) => {
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      // Use sine waves for pure tones
      osc.type = 'sine';
      osc.frequency.value = baseFreq * harmonic;
      
      // Decrease amplitude for higher harmonics
      oscGain.gain.value = 0.15 / (harmonic * 1.5);
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      
      oscillatorsRef.current.push(osc);
    });

    // Add a slow LFO for subtle pulsing effect
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow modulation
    lfoGain.gain.value = 0.05;
    
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();
    lfoRef.current = lfo;

    // Add a subtle choir-like effect with detuned oscillators
    [-5, 5].forEach((detune) => {
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = baseFreq;
      osc.detune.value = detune;
      oscGain.gain.value = 0.08;
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      
      oscillatorsRef.current.push(osc);
    });
  }, [audioEnabled, volume]);

  const stopChantingSound = useCallback(() => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    oscillatorsRef.current = [];

    if (lfoRef.current) {
      try {
        lfoRef.current.stop();
      } catch (e) {}
      lfoRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    gainNodeRef.current = null;
  }, []);

  // Start/stop based on meditation state
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

  // Handle volume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  return (
    <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
      <div className="flex items-center gap-2">
        {audioEnabled && isPlaying ? (
          <Volume2 className="w-5 h-5 text-accent" />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">Chanting Sound</span>
      </div>
      
      <Switch
        checked={audioEnabled}
        onCheckedChange={setAudioEnabled}
        className="data-[state=checked]:bg-accent"
      />
      
      <div className="flex items-center gap-2 ml-2">
        <Slider
          value={[volume * 100]}
          onValueChange={([val]) => setVolume(val / 100)}
          max={100}
          step={1}
          className="w-24"
        />
        <span className="text-xs text-muted-foreground w-8">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};

export default MeditationAudio;
