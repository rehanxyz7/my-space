import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Headphones, Volume2, Music, ArrowRight, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import UserDashboard from '@/components/UserDashboard';
import { useAuth } from '@/hooks/useAuth';

const features = [
  {
    icon: Headphones,
    title: 'Guided Meditation',
    description: 'Breathing exercises to center your mind and boost focus',
    color: 'from-primary/20 to-cyan-500/20',
    link: '/meditate',
  },
  {
    icon: Volume2,
    title: 'Ambient Sounds',
    description: 'Mix rain, ocean waves, and more to create your perfect soundscape',
    color: 'from-green-500/20 to-emerald-500/20',
    link: '/sounds',
  },
  {
    icon: Music,
    title: 'Focus Music',
    description: 'Curated playlists designed to enhance concentration',
    color: 'from-purple-500/20 to-pink-500/20',
    link: '/music',
  },
];

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.1),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl float-animation" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl float-animation" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Logged In User Dashboard */}
      {user && !loading && (
        <section className="pt-28 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-end mb-6">
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
            <UserDashboard />
          </div>
        </section>
      )}

      {/* Hero Section - Only show for non-logged in users */}
      {!user && !loading && (
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
                <Sparkles className="w-4 h-4" />
                Free forever. No distractions.
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
                Find Your
                <span className="gradient-text block">Inner Calm</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Break free from procrastination with meditation, ambient sounds, and focus music. 
                Your sanctuary for productivity, completely free.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="xl">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/sounds">
                  <Button variant="glass" size="xl">
                    Explore Sounds
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Floating Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="mt-16 relative"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl breathing-animation" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl breathing-animation" style={{ animationDelay: '-1s' }} />
                <div className="absolute inset-8 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20 breathing-animation flex items-center justify-center" style={{ animationDelay: '-2s' }}>
                  <Headphones className="w-12 h-12 text-primary" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything You Need to Focus
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple, powerful tools designed to help you stay productive and calm
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={feature.link}>
                  <div className="glass-card p-8 h-full group hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(174_72%_56%/0.1)]">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-8 h-8 text-foreground" />
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Beat Procrastination?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of focused minds. Start your journey to better productivity today.
              </p>
              <Link to="/meditate">
                <Button variant="hero" size="xl">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2024 My Space. Free and open for everyone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
