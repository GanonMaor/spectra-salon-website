import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "500K+", label: "Happy Clients", icon: "👥" },
  { value: "15+", label: "Years Experience", icon: "⭐" },
  { value: "50+", label: "Expert Stylists", icon: "✂️" },
  { value: "99%", label: "Satisfaction Rate", icon: "💫" },
];

const visionCards = [
  {
    title: "Revolutionary Technology",
    description:
      "Cutting-edge AI-powered color matching technology that creates perfect formulations every time.",
    gradient: "from-[#FF6B35] via-[#FF8E53] to-[#FFB584]",
    icon: "🚀",
  },
  {
    title: "Artistry & Precision",
    description:
      "Master colorists with decades of experience crafting bespoke looks for every individual.",
    gradient: "from-[#D4A574] via-[#E8C299] to-[#F5E6D3]",
    icon: "🎨",
  },
  {
    title: "Sustainable Beauty",
    description:
      "Eco-friendly formulations and practices that care for both you and our planet.",
    gradient: "from-[#8FBC8F] via-[#A8D5A8] to-[#C5E8C5]",
    icon: "🌿",
  },
];

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Immersive Salon Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat md:bg-fixed"
        style={{
          backgroundImage: `
            linear-gradient(
              135deg,
              rgba(255, 107, 53, 0.15) 0%,
              rgba(212, 165, 116, 0.1) 25%,
              rgba(143, 188, 143, 0.08) 50%,
              rgba(245, 230, 211, 0.12) 75%,
              rgba(255, 139, 83, 0.1) 100%
            ),
            url('https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=2874&q=80')
          `,
        }}
      >
        {/* Floating Orbs for AR/VR Feel */}
        <div className="absolute top-20 left-16 w-32 h-32 bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB584]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#D4A574]/20 to-[#F5E6D3]/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-br from-[#8FBC8F]/15 to-[#C5E8C5]/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-16 w-28 h-28 bg-gradient-to-br from-[#FF8E53]/20 to-[#E8C299]/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Apple Vision Pro Style Interface */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-8 lg:px-16">
        {/* Floating Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -50 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-4 mb-8">
            <div
              className="relative px-8 py-4 rounded-full backdrop-blur-3xl border border-white/20 shadow-2xl"
              style={{
                background: `
                  radial-gradient(circle at center,
                    rgba(255, 255, 255, 0.25) 0%,
                    rgba(255, 255, 255, 0.1) 100%
                  )
                `,
              }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-thin text-white tracking-wide">
                About{" "}
                <span className="font-light bg-gradient-to-r from-[#FF6B35] to-[#D4A574] bg-clip-text text-transparent">
                  Spectra
                </span>
              </h1>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl sm:text-2xl text-white/90 font-light max-w-4xl mx-auto leading-relaxed"
          >
            Where cutting-edge technology meets timeless artistry to redefine
            hair color perfection
          </motion.p>
        </motion.div>

        {/* Vision Cards - Apple Vision Pro Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20"
        >
          {visionCards.map((card, index) => (
            <motion.div
              key={index}
              onHoverStart={() => setActiveCard(index)}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-80 cursor-pointer group"
            >
              {/* Glass Card */}
              <div
                className={`
                  relative h-full p-8 rounded-3xl backdrop-blur-3xl border border-white/20 
                  shadow-2xl overflow-hidden transition-all duration-700 ease-out
                  ${activeCard === index ? "border-white/40" : "border-white/20"}
                `}
                style={{
                  background: `
                    linear-gradient(135deg,
                      rgba(255, 255, 255, 0.2) 0%,
                      rgba(255, 255, 255, 0.05) 100%
                    )
                  `,
                }}
              >
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-br ${card.gradient}`}
                ></div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-4xl mb-4">{card.icon}</div>
                    <h3 className="text-2xl font-light text-white mb-4 tracking-wide">
                      {card.title}
                    </h3>
                    <p className="text-white/80 font-light leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Floating Action Button */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="self-start"
                  >
                    <div className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 text-white font-medium text-sm hover:bg-white/30 transition-all duration-300">
                      Learn More
                    </div>
                  </motion.div>
                </div>

                {/* Floating Particles */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
                <div className="absolute bottom-8 left-6 w-1 h-1 bg-white/60 rounded-full animate-pulse delay-500"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section - Vision Pro Style */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, rotateX: 5 }}
              className="relative p-6 rounded-2xl backdrop-blur-3xl border border-white/20 shadow-xl text-center group"
              style={{
                background: `
                  radial-gradient(circle at center,
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.05) 100%
                  )
                `,
              }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl sm:text-4xl font-thin text-white mb-2 tracking-wider">
                {stat.value}
              </div>
              <div className="text-white/70 font-light text-sm">
                {stat.label}
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF6B35]/10 to-[#D4A574]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-center"
        >
          <div
            className="inline-flex items-center justify-center p-8 rounded-3xl backdrop-blur-3xl border border-white/20 shadow-2xl"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(255, 255, 255, 0.2) 0%,
                  rgba(255, 255, 255, 0.05) 100%
                )
              `,
            }}
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-light text-white mb-6 tracking-wide">
                Ready to Experience the Future?
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-4 bg-gradient-to-r from-[#FF6B35] to-[#D4A574] text-white font-medium text-lg rounded-full shadow-2xl hover:shadow-[#FF6B35]/25 transition-all duration-300"
              >
                Book Your Transformation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Close Button - Vision Pro Style */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1, delay: 2 }}
        onClick={() => window.history.back()}
        className="fixed top-8 right-8 z-50 w-12 h-12 rounded-full backdrop-blur-3xl border border-white/20 shadow-xl flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 transition-all duration-300"
        style={{
          background: `
            radial-gradient(circle at center,
              rgba(255, 255, 255, 0.2) 0%,
              rgba(255, 255, 255, 0.05) 100%
            )
          `,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </motion.button>
    </div>
  );
};

export default About;
