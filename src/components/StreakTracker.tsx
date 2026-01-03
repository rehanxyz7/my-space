import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStreakData, saveStreakData, type StreakData } from '@/lib/safeStorage';

interface StreakTrackerProps {
  onShare?: () => void;
}

const plantStages = [
  { level: 0, emoji: '🌱', name: 'Seed', sessionsRequired: 0 },
  { level: 1, emoji: '🌿', name: 'Sprout', sessionsRequired: 3 },
  { level: 2, emoji: '🪴', name: 'Sapling', sessionsRequired: 7 },
  { level: 3, emoji: '🌳', name: 'Tree', sessionsRequired: 14 },
  { level: 4, emoji: '🌲', name: 'Mighty Tree', sessionsRequired: 30 },
  { level: 5, emoji: '🏔️', name: 'Forest', sessionsRequired: 50 },
];

const causes = [
  { name: 'Plant a Real Tree', emoji: '🌳', threshold: 10 },
  { name: 'Clean Ocean Pledge', emoji: '🌊', threshold: 25 },
  { name: 'Save Wildlife', emoji: '🦁', threshold: 50 },
];

const StreakTracker = ({ onShare }: StreakTrackerProps) => {
  const [streakData, setStreakData] = useState<StreakData>(() => getStreakData());

  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    saveStreakData(streakData);
  }, [streakData]);

  const currentPlant = plantStages.find(
    (p, i) =>
      streakData.totalSessions >= p.sessionsRequired &&
      (i === plantStages.length - 1 ||
        streakData.totalSessions < plantStages[i + 1].sessionsRequired)
  ) || plantStages[0];

  const nextPlant = plantStages.find(
    (p) => p.sessionsRequired > streakData.totalSessions
  );

  const progressToNext = nextPlant
    ? ((streakData.totalSessions - currentPlant.sessionsRequired) /
        (nextPlant.sessionsRequired - currentPlant.sessionsRequired)) *
      100
    : 100;

  const earnedCauses = causes.filter(
    (c) => streakData.totalSessions >= c.threshold
  );

  const handleShare = () => {
    const shareText = `🧘 I've completed ${streakData.totalSessions} focus sessions on My Space!\n🔥 Current streak: ${streakData.currentStreak} days\n${currentPlant.emoji} My plant: ${currentPlant.name}\n\nJoin me in beating procrastination!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Space Progress',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      onShare?.();
    }
  };

  return (
    <div className="space-y-8">
      {/* Streak Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl mb-2"
          >
            🔥
          </motion.div>
          <div className="text-3xl font-display font-bold text-foreground">
            {streakData.currentStreak}
          </div>
          <div className="text-sm text-muted-foreground">Day Streak</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-display font-bold text-foreground">
            {streakData.totalSessions}
          </div>
          <div className="text-sm text-muted-foreground">Sessions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-3xl font-display font-bold text-foreground">
            {streakData.longestStreak}
          </div>
          <div className="text-sm text-muted-foreground">Best Streak</div>
        </motion.div>
      </div>

      {/* Plant Growth */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-emerald-500/10" />
        <div className="relative">
          <div className="text-center mb-6">
            <motion.div
              key={currentPlant.level}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-8xl mb-4 inline-block"
            >
              {currentPlant.emoji}
            </motion.div>
            <h3 className="text-2xl font-display font-bold">{currentPlant.name}</h3>
            <p className="text-muted-foreground">
              Your focus tree is growing!
            </p>
          </div>

          {nextPlant && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to {nextPlant.name}</span>
                <span className="text-primary font-medium">
                  {streakData.totalSessions}/{nextPlant.sessionsRequired} sessions
                </span>
              </div>
              <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Social Causes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-pink-500" />
          <h3 className="font-display font-semibold text-lg">Social Impact</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Complete sessions to unlock contributions to real causes
        </p>
        <div className="space-y-3">
          {causes.map((cause) => {
            const isEarned = streakData.totalSessions >= cause.threshold;
            const progress = Math.min((streakData.totalSessions / cause.threshold) * 100, 100);
            
            return (
              <div key={cause.name} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {cause.emoji} {cause.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isEarned ? '✓ Unlocked!' : `${cause.threshold} sessions`}
                  </span>
                </div>
                <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full rounded-full ${
                      isEarned
                        ? 'bg-gradient-to-r from-pink-500 to-rose-400'
                        : 'bg-gradient-to-r from-primary/50 to-primary'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Share Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Button variant="glass" onClick={handleShare} className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Progress with Friends
        </Button>
      </motion.div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="text-center p-12 glass-card"
            >
              <div className="text-8xl mb-4">🎉</div>
              <h2 className="text-3xl font-display font-bold mb-2">Amazing!</h2>
              <p className="text-muted-foreground">You completed a focus session!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreakTracker;
