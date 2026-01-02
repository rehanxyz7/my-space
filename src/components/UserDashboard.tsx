import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Music, Wind, Brain, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import InspirationalQuote from './InspirationalQuote';

interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  meditationSessions: number;
  musicSessions: number;
  soundSessions: number;
}

interface Profile {
  full_name: string | null;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    totalMinutes: 0,
    meditationSessions: 0,
    musicSessions: 0,
    soundSessions: 0,
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch activity sessions
      const { data: sessionsData } = await supabase
        .from('activity_sessions')
        .select('activity_type, duration_minutes')
        .eq('user_id', user.id);

      const meditationSessions = sessionsData?.filter(s => s.activity_type === 'meditation').length || 0;
      const musicSessions = sessionsData?.filter(s => s.activity_type === 'music').length || 0;
      const soundSessions = sessionsData?.filter(s => s.activity_type === 'sounds').length || 0;
      const totalMinutes = sessionsData?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

      setStats({
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
        totalSessions: sessionsData?.length || 0,
        totalMinutes,
        meditationSessions,
        musicSessions,
        soundSessions,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: stats.currentStreak,
      suffix: 'days',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Longest Streak',
      value: stats.longestStreak,
      suffix: 'days',
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
    },
    {
      icon: Clock,
      label: 'Total Time',
      value: stats.totalMinutes,
      suffix: 'mins',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: Calendar,
      label: 'Total Sessions',
      value: stats.totalSessions,
      suffix: '',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
    },
  ];

  const activityBreakdown = [
    {
      icon: Brain,
      label: 'Meditation',
      value: stats.meditationSessions,
      color: 'text-primary',
    },
    {
      icon: Music,
      label: 'Music',
      value: stats.musicSessions,
      color: 'text-pink-500',
    },
    {
      icon: Wind,
      label: 'Sounds',
      value: stats.soundSessions,
      color: 'text-cyan-500',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-secondary/50 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-secondary/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inspirational Quote */}
      <InspirationalQuote userName={profile?.full_name?.split(' ')[0]} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4"
          >
            <div className={`p-2 rounded-lg ${stat.bgColor} w-fit mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.suffix}</span>}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Activity Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Activity Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          {activityBreakdown.map((activity) => (
            <div key={activity.label} className="text-center">
              <div className="flex justify-center mb-2">
                <activity.icon className={`w-8 h-8 ${activity.color}`} />
              </div>
              <p className="text-2xl font-bold">{activity.value}</p>
              <p className="text-sm text-muted-foreground">{activity.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Start Hint */}
      {stats.totalSessions === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 text-center border-dashed border-2 border-primary/30"
        >
          <p className="text-muted-foreground mb-2">No sessions yet!</p>
          <p className="text-sm text-muted-foreground">
            Start your journey by exploring Meditation, Music, or Sounds sections.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default UserDashboard;
