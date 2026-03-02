import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trash2, MapPin, BarChart3, ArrowRight, Leaf } from 'lucide-react';

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
                <ShieldCheck className="w-4 h-4" />
                Community Driven Initiative
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                Keep Your City <span className="text-primary italic">Clean</span> & Green.
              </h1>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
                Report garbage issues in seconds. Our AI-powered system classifies waste and alerts local authorities for immediate action.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/report" className="btn-primary flex items-center justify-center gap-2 py-4 px-8 text-lg">
                  Report Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/register" className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-4 px-8 rounded-xl transition-all text-center">
                  Join the Movement
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-slate-900">10k+</div>
                  <div className="text-sm text-slate-500">Reports Resolved</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-500">Cities Covered</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1000" 
                  alt="Clean City"
                  className="w-full h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
              
              <div className="absolute -bottom-6 -right-6 glass p-6 rounded-2xl shadow-xl z-20 max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Leaf className="text-primary w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-900">AI Verified</span>
                </div>
                <p className="text-xs text-slate-500">Every report is automatically classified for faster processing.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600">Simple steps to make a big difference in your community.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Trash2 className="w-8 h-8 text-primary" />,
                title: "Spot & Snap",
                desc: "Notice a garbage problem? Just take a photo and upload it to our platform."
              },
              {
                icon: <MapPin className="w-8 h-8 text-primary" />,
                title: "Tag Location",
                desc: "Our system automatically detects your location or you can pin it on the map."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-primary" />,
                title: "Track Progress",
                desc: "Watch as your report moves from pending to resolved in real-time."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
