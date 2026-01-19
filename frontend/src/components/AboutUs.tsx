import { motion } from 'framer-motion';
import { Globe, Users, Sparkles, Award } from 'lucide-react';

export function AboutUs() {
  const stats = [
    { label: 'Active Students', value: '5,000+', icon: Users },
    { label: 'Countries Reached', value: '20+', icon: Globe },
    { label: 'Talents showcased', value: '10K+', icon: Sparkles },
    { label: 'Awards Won', value: '50+', icon: Award },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.span
          className="inline-block px-8 py-3 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 rounded-full text-base font-bold tracking-widest mb-10 border border-orange-200"
          whileHover={{ scale: 1.05 }}
        >
          OUR STORY
        </motion.span>
        <h1 className="text-7xl md:text-8xl font-black mb-10 tracking-tight leading-tight">
          <span className="text-gray-900">
            Empowering UIU's
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
            Creative Minds
          </span>
        </h1>
        <p className="text-3xl text-gray-500 max-w-4xl mx-auto leading-relaxed font-light">
          We believe every student has a unique talent waiting to be shared. The <span className="text-orange-600 font-medium">UIU Talent Showcase</span> is the digital stage where creativity meets opportunity.
        </p>
      </motion.div>

      {/* Mission Section (Clean Text Layout) */}
      <div className="max-w-5xl mx-auto mb-40 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-orange-50 to-purple-50 rounded-full opacity-50 blur-3xl -z-10" />

          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-12 leading-tight">
            Bridging the Gap Between <br />
            <span className="text-orange-600">Talent & Recognition</span>
          </h2>

          <div className="space-y-8 text-2xl text-gray-600 leading-relaxed font-light">
            <p>
              Founded with a clear vision, our platform serves as a digital auditorium for the diverse skills found at UIU. We are more than just a showcase; we are a community.
            </p>
            <p>
              Whether it's filmmaking, music production, or creative writing, we provide the tools and space for students to shine, connect, and grow together in an environment that fosters innovation.
            </p>
          </div>

          <div className="mt-16 inline-flex items-center gap-5 text-orange-600 font-bold text-xl bg-white px-8 py-4 rounded-full shadow-lg border border-orange-100">
            <div className="p-2 bg-orange-100 rounded-full">
              <Sparkles className="w-8 h-8 text-orange-600" />
            </div>
            <span>Built for Excellence at UIU</span>
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div
        className="bg-black rounded-[3rem] p-20 mb-40 text-white relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 to-black z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600 rounded-full opacity-20 blur-[120px] transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full opacity-20 blur-[120px] transform -translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-3xl mb-8 text-orange-500 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-2xl">
                  <Icon className="w-10 h-10" />
                </div>
                <div className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">{stat.value}</div>
                <div className="text-gray-400 font-bold tracking-widest uppercase text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* LionHeart Team Section */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="bg-white rounded-[3rem] p-16 md:p-24 text-center border-2 border-orange-50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-red-500 to-purple-500" />

          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <Award className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-10 tracking-tight">
              Developed by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">LionHeart Team</span>
            </h2>

            <p className="text-2xl text-gray-500 leading-relaxed mb-12 font-light max-w-4xl mx-auto">
              We are a group of passionate developers, designers, and dreamers from UIU.
              United by a single goal: to create the ultimate platform for our peers to showcase their brilliance.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {['🚀 Innovation First', '🎨 Design Driven', '🤝 Community Focused'].map((tag, i) => (
                <span key={i} className="px-8 py-4 bg-gray-50 rounded-2xl text-gray-700 font-bold text-lg shadow-sm border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
