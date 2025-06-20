import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';

interface ClientTestimonial {
  id: number;
  name: string;
  salon: string;
  location: string;
  photo: string;
  quote: string;
  videoUrl: string;
  videoPoster: string;
}

const clientTestimonials: ClientTestimonial[] = [
  {
    id: 1,
    name: "Sarah Martinez",
    salon: "Luxe Hair Studio",
    location: "Beverly Hills, CA",
    photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300",
    quote: "Spectra has completely transformed how we manage our color inventory. We've reduced waste by 30% and our stylists love how easy it is to use.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    videoPoster: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800&h=450"
  },
  {
    id: 2,
    name: "Marcus Johnson",
    salon: "Urban Edge Salon",
    location: "New York, NY",
    photo: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300",
    quote: "The real-time inventory tracking is a game-changer. We always know exactly what we have in stock and can order precisely what we need.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    videoPoster: "https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=800&h=450"
  },
  {
    id: 3,
    name: "Emma Thompson",
    salon: "Bloom Beauty Bar",
    location: "Austin, TX",
    photo: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300",
    quote: "Our profit margins have improved significantly since implementing Spectra. The barcode scanning feature saves us so much time during busy days.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoPoster: "https://images.pexels.com/photos/3992660/pexels-photo-3992660.jpeg?auto=compress&cs=tinysrgb&w=800&h=450"
  },
  {
    id: 4,
    name: "David Chen",
    salon: "Precision Cuts",
    location: "San Francisco, CA",
    photo: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300&h=300",
    quote: "The analytics dashboard gives us insights we never had before. We can see exactly which products are most profitable and optimize our inventory accordingly.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    videoPoster: "https://images.pexels.com/photos/3992663/pexels-photo-3992663.jpeg?auto=compress&cs=tinysrgb&w=800&h=450"
  },
  {
    id: 5,
    name: "Lisa Rodriguez",
    salon: "Glamour Studio",
    location: "Miami, FL",
    photo: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=300&h=300",
    quote: "Spectra has made our salon more eco-friendly and profitable. We waste less product and our clients appreciate our commitment to sustainability.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    videoPoster: "https://images.pexels.com/photos/3992664/pexels-photo-3992664.jpeg?auto=compress&cs=tinysrgb&w=800&h=450"
  }
];

interface ClientCardProps {
  client: ClientTestimonial;
  isActive: boolean;
  isVideoOpen: boolean;
  onVideoToggle: () => void;
  onCardClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ 
  client, 
  isActive, 
  isVideoOpen, 
  onVideoToggle, 
  onCardClick 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVideoOpen && videoRef.current) {
      const video = videoRef.current;
      if (video.paused || video.ended) {
        video.currentTime = 0;
        video.play().catch(console.error);
      }
    } else if (videoRef.current) {
      const video = videoRef.current;
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isVideoOpen]);

  return (
    <motion.div
      className={`relative group cursor-pointer transition-all duration-500 ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
      }`}
      onClick={onCardClick}
      whileHover={isActive ? { scale: 1.02, y: -8 } : { scale: 0.97, y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* iPhone/iPad Device Frame */}
      <div className="relative">
        {/* Device Shadow */}
        <div className="absolute -inset-8 bg-gradient-to-br from-black/20 via-black/10 to-transparent rounded-[3rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
        
        {/* Device Body - iPad Pro Style */}
        <div className="relative bg-gradient-to-b from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-[2.5rem] p-3 shadow-2xl">
          {/* Apple Logo */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 opacity-20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-300">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
              <path d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
            </svg>
          </div>

          {/* Screen - Large iPad Pro Style */}
          <div className="bg-black rounded-[2rem] overflow-hidden relative">
            {/* Screen Content */}
            <div className="aspect-[4/3] relative">
              <AnimatePresence mode="wait">
                {isVideoOpen ? (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover rounded-[2rem]"
                      muted
                      loop
                      playsInline
                      poster={client.videoPoster}
                    >
                      <source src={client.videoUrl} type="video/mp4" />
                    </video>
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 rounded-[2rem]">
                      {/* Live Indicator */}
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-white text-sm font-medium">LIVE DEMO</span>
                        </div>
                      </div>
                      
                      {/* Close Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onVideoToggle();
                        }}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/80 backdrop-blur-sm hover:bg-black/90 rounded-full flex items-center justify-center transition-all duration-200 group"
                      >
                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Bottom Info */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30">
                              <img
                                src={client.photo}
                                alt={client.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold text-base">
                                {client.name}
                              </h4>
                              <p className="text-white/70 text-sm">
                                {client.salon} • {client.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="quote"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8 flex flex-col justify-center rounded-[2rem]"
                  >
                    {/* Quote Icon */}
                    <div className="mb-6">
                      <svg className="w-12 h-12 text-[#c79c6d] opacity-40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                    </div>
                    
                    {/* Quote Text */}
                    <blockquote className="text-gray-800 text-lg leading-relaxed mb-8 font-light">
                      "{client.quote}"
                    </blockquote>
                    
                    {/* Client Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#c79c6d]/20">
                        <img
                          src={client.photo}
                          alt={client.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div>
                        <h4 className="text-gray-900 font-semibold text-lg">
                          {client.name}
                        </h4>
                        <p className="text-[#c79c6d] font-medium text-base">
                          {client.salon}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {client.location}
                        </p>
                      </div>
                    </div>
                    
                    {/* Play Button */}
                    <div className="flex items-center gap-3 text-[#007AFF] group-hover:text-[#0056CC] transition-colors">
                      <div className="w-12 h-12 bg-[#007AFF] group-hover:bg-[#0056CC] rounded-full flex items-center justify-center shadow-lg transition-all duration-300">
                        <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-base">Watch Demo</div>
                        <div className="text-sm text-gray-500">See results in action</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Screen Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[2rem] pointer-events-none"></div>
          </div>

          {/* Home Indicator (iPad Style) */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full opacity-60"></div>
        </div>

        {/* Device Stand/Base Shadow */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-black/20 to-transparent rounded-full blur-xl"></div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#007AFF] rounded-full shadow-lg"
        />
      )}
    </motion.div>
  );
};

export const ClientCarousel: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'center',
    skipSnaps: false,
    dragFree: false
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openVideoId, setOpenVideoId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setOpenVideoId(null);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const handleVideoToggle = (clientId: number) => {
    setOpenVideoId(openVideoId === clientId ? null : clientId);
  };

  const handleCardClick = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      id="client-testimonials"
      className="relative w-full bg-gradient-to-b from-gray-50 to-white py-24 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative max-w-7xl mx-auto px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-[#1d1d1f] mb-6 leading-tight tracking-[-0.02em]">
            What Our Customers Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            See how salons like yours are using Spectra every day to reduce waste, increase profits, and streamline operations.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-14 h-14 bg-white/90 hover:bg-white backdrop-blur-xl rounded-full flex items-center justify-center transition-all duration-300 group shadow-xl hover:shadow-2xl border border-gray-200/50"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-[#007AFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-14 h-14 bg-white/90 hover:bg-white backdrop-blur-xl rounded-full flex items-center justify-center transition-all duration-300 group shadow-xl hover:shadow-2xl border border-gray-200/50"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-[#007AFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-12">
              {clientTestimonials.map((client, index) => (
                <div key={client.id} className="flex-[0_0_400px] min-w-0">
                  <ClientCard
                    client={client}
                    isActive={index === selectedIndex}
                    isVideoOpen={openVideoId === client.id}
                    onVideoToggle={() => handleVideoToggle(client.id)}
                    onCardClick={() => handleCardClick(index)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-3 mt-16">
            {clientTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === selectedIndex 
                    ? 'bg-[#007AFF] scale-125 shadow-lg' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <button className="group relative px-10 py-5 bg-[#007AFF] hover:bg-[#0056CC] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]">
            <span className="relative z-10">Join These Successful Salons</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF] to-[#0056CC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <p className="mt-4 text-gray-600 text-lg font-light">
            Start your 14-day free trial today
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};