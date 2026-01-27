import { motion } from 'framer-motion';
import { Heart, Code, Globe, Users, Sparkles } from 'lucide-react';

export function AboutUs() {
    return (
        <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-orange-50 via-white to-purple-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 mb-6">
                            The Heart of UIU
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed px-4">
                            We are a passionate community dedicated to showcasing the brilliance, creativity, and immense talent of United International University students.
                        </p>
                    </motion.div>
                </div>

                {/* Mission Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative order-2 lg:order-1 lg:col-span-2 mx-auto w-full max-w-md lg:max-w-none"
                    >
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-200 to-purple-200 rounded-3xl blur-2xl opacity-30"></div>
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                            alt="Team Collaboration"
                            className="relative rounded-2xl shadow-2xl w-full h-auto object-cover"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8 order-1 lg:order-2 lg:col-span-3"
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-100 text-orange-700 rounded-full font-bold text-base">
                            <Sparkles className="w-5 h-5" />
                            <span>Our Mission</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">Empowering Student Creativity</h2>
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                            The <span className="font-bold text-orange-600">UIU Talent Showcase</span> isn't just a platform; it's a stage. We believe every student has a unique voice, whether through cinema, melody, or prose.
                        </p>
                        <div className="space-y-6 pt-6">
                            {[
                                { icon: Code, text: "Built for students, by students" },
                                { icon: Globe, text: "Showcasing UIU to the world" },
                                { icon: Users, text: "Fostering a creative community" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold text-gray-900 text-lg md:text-xl">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Team Section (LionHeart) */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-purple-500 to-indigo-500"></div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center mb-6 md:mb-8 shadow-2xl">
                            <Heart className="w-8 h-8 md:w-10 md:h-10 text-white fill-white animate-pulse" />
                        </div>

                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 md:mb-8">
                            Developed by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">LionHeart</span>
                        </h2>

                        <p className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto mb-10 md:mb-14 px-4 leading-relaxed">
                            We are a team of visionary developers from United International University. Driven by passion and code, we craft digital experiences that matter.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto px-4">
                            <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">Innovation</div>
                                <div className="text-base md:text-lg text-gray-600 leading-relaxed">Pushing boundaries</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">Passion</div>
                                <div className="text-base md:text-lg text-gray-600 leading-relaxed">Code with heart</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="font-bold text-gray-900 text-2xl md:text-3xl mb-3">Excellence</div>
                                <div className="text-base md:text-lg text-gray-600 leading-relaxed">Quality first</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Background Decorative Pattern */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 md:w-80 md:h-80 bg-orange-100 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 md:w-80 md:h-80 bg-purple-100 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}
