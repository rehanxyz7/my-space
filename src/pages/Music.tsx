import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { MoodSelector, Mood } from '@/components/MoodSelector';
import MoodBasedPlayer from '@/components/MoodBasedPlayer';
import SessionTimer from '@/components/SessionTimer';
import StreakTracker from '@/components/StreakTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Timer, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { getStreakData, saveStreakData } from '@/lib/safeStorage';

const MusicPage = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [activeTab, setActiveTab] = useState('music');

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleSessionComplete = useCallback(() => {
    const data = getStreakData();
    data.totalSessions += 1;
    data.currentStreak += 1;
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
    saveStreakData(data);
    toast.success('Session complete! Your plant is growing 🌱');
  }, []);

  const handleShare = () => {
    toast.success('Progress copied to clipboard!');
  };

  return (
    <div className="min-h-screen relative overflow-hidden page-music">
      <Navbar />
      
      {/* Background Effects - Pink/Rose theme */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(330_70%_60%/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(280_60%_65%/0.05),transparent_50%)]" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[hsl(330_70%_60%/0.05)] rounded-full blur-3xl float-animation" />
      </div>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Focus <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">Music</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Set your mood, start a timer, and track your focus journey
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="music" className="gap-2">
                <Music className="w-4 h-4" /> Music
              </TabsTrigger>
              <TabsTrigger value="timer" className="gap-2">
                <Timer className="w-4 h-4" /> Timer
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <Trophy className="w-4 h-4" /> Progress
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="music" className="mt-0">
                <motion.div
                  key="music"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {selectedMood ? (
                    <MoodBasedPlayer mood={selectedMood} onChangeMood={() => setSelectedMood(null)} />
                  ) : (
                    <MoodSelector onMoodSelect={handleMoodSelect} selectedMood={selectedMood} />
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="timer" className="mt-0">
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SessionTimer onSessionComplete={handleSessionComplete} />
                </motion.div>
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StreakTracker onShare={handleShare} />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MusicPage;
