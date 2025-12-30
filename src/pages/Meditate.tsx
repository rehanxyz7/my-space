import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import MeditationTimer from '@/components/MeditationTimer';
import MeditationAudio from '@/components/MeditationAudio';
import AmbientPlayer from '@/components/AmbientPlayer';
import { toast } from 'sonner';

const Meditate = () => {
  const [isMeditating, setIsMeditating] = useState(false);

  const handleStateChange = useCallback((isActive: boolean) => {
    setIsMeditating(isActive);
  }, []);

  const handleComplete = useCallback(() => {
    toast.success('Meditation complete! Take a moment to appreciate your practice. 🧘');
    
    // Update streak data
    const saved = localStorage.getItem('serenity-streak');
    const data = saved ? JSON.parse(saved) : { currentStreak: 0, longestStreak: 0, totalSessions: 0 };
    data.totalSessions += 1;
    data.currentStreak += 1;
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
    localStorage.setItem('serenity-streak', JSON.stringify(data));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden page-meditate">
      <Navbar />
      
      {/* Background Effects - Purple theme */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(260_60%_65%/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(280_70%_55%/0.08),transparent_50%)]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[hsl(260_60%_65%/0.05)] rounded-full blur-3xl float-animation" />
      </div>

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Breathing <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Meditation</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose your session length, breathe deeply, and find your center.
            </p>
          </motion.div>

          {/* Audio Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <AmbientPlayer autoPlay={true} defaultVolume={0.3} />
            <MeditationAudio isPlaying={isMeditating} defaultVolume={0.4} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MeditationTimer 
              onStateChange={handleStateChange}
              onComplete={handleComplete}
            />
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 glass-card p-8"
          >
            <h2 className="text-xl font-display font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Breathing Tips
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm shrink-0 mt-0.5">1</span>
                Find a comfortable position and relax your shoulders
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm shrink-0 mt-0.5">2</span>
                Breathe through your nose when inhaling
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm shrink-0 mt-0.5">3</span>
                Let your exhale be slow and natural
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm shrink-0 mt-0.5">4</span>
                If your mind wanders, gently bring focus back to your breath
              </li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Meditate;
