import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startAmbientSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/ambient-meditation.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    audioRef.current.play().catch(console.error);
    setIsPlaying(true);
  };

  const stopAmbientSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const toggleAmbient = () => {
    setHasInteracted(true);
    if (isPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-play on first user interaction
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
  }, [autoPlay, hasInteracted]);

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
          <Music className={`w-5 h-5 ${isPlaying ? 'text-primary' : 'text-muted-foreground'}`} />
        </motion.div>
        <span className="text-sm font-medium whitespace-nowrap">Background Music</span>
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
