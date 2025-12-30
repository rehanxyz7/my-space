import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface AmbientPlayerProps {
  autoPlay?: boolean;
  defaultVolume?: number;
}

const AmbientPlayer = ({ autoPlay = true, defaultVolume = 0.3 }: AmbientPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const createPinkNoise = (audioContext: AudioContext): AudioBuffer => {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
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

    // Create soft drone tones for ambient atmosphere
    const frequencies = [65, 130, 195]; // Low drone frequencies
    frequencies.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      oscGain.gain.value = 0.1 / (index + 1);
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      
      oscillatorsRef.current.push(osc);
    });

    // Add filtered pink noise for wind-like ambient
    const noiseBuffer = createPinkNoise(audioContext);
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400;
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.15;
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    
    noiseNodeRef.current = noise;
    setIsPlaying(true);
  }, [volume]);

  const stopAmbientSound = useCallback(() => {
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    oscillatorsRef.current = [];

    if (noiseNodeRef.current) {
      try { noiseNodeRef.current.stop(); } catch (e) {}
      noiseNodeRef.current = null;
    }

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

  // Handle volume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Auto-play on first user interaction
  useEffect(() => {
    if (autoPlay && hasInteracted && !isPlaying) {
      startAmbientSound();
    }
  }, [autoPlay, hasInteracted, isPlaying, startAmbientSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, [stopAmbientSound]);

  // Listen for first interaction to enable audio
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
    <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
      <div className="flex items-center gap-2">
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-primary" />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">Ambient Sound</span>
      </div>
      
      <Switch
        checked={isPlaying}
        onCheckedChange={toggleAmbient}
        className="data-[state=checked]:bg-primary"
      />
      
      {isPlaying && (
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
      )}
    </div>
  );
};

export default AmbientPlayer;
