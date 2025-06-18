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
      className={`relative bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
        isActive 
          ? 'shadow-lg scale-100 opacity-100 ring-1 ring-[#c79c6d]/30' 
          : 'shadow-sm scale-95 opacity-75'
      }`}
      onClick={onCardClick}
      whileHover={isActive ? { scale: 1.02, y: -4 } : { scale: 0.97, y: -2 }}
      transition={{ duration: 0.3 }}
    >
      {/* Video/Quote Content */}
      <div className="relative h-64 overflow-hidden">
        <AnimatePresence mode="wait">
          {isVideoOpen ? (
            <motion.div
              key="video"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                poster={client.videoPoster}
              >
                <source src={client.videoUrl} type="video/mp4" />
              </video>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20">
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-1 bg-black/80 rounded-full px-2 py-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-medium">LIVE</span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVideoToggle();
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/80 hover:bg-black/90 rounded-full flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gray-50 p-4 flex flex-col justify-center"
            >
              <div className="mb-4">
                <svg className="w-8 h-8 text-[#c79c6d] opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              
              <blockquote className="font-light text-gray-700 text-sm leading-relaxed mb-4">
                "{client.quote}"
              </blockquote>
              
              <div className="flex items-center gap-2 text-[#c79c6d] opacity-70">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span className="font-medium text-xs">Click to play demo</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Client Info */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#c79c6d]/20">
            <img
              src={client.photo}
              alt={client.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-black text-sm leading-tight">
              {client.name}
            </h4>
            <p className="font-medium text-[#c79c6d] text-xs mt-0.5">
              {client.salon}
            </p>
            <p className="font-light text-gray-500 text-xs">
              {client.location}
            </p>
          </div>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c79c6d] origin-left"
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
      className="relative w-full bg-gray-50 py-16 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="font-light text-black text-3xl sm:text-4xl mb-4 leading-tight">
            What Our Customers Are Saying
          </h2>
          <p className="font-light text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            See how salons like yours are using Spectra every day to reduce waste, increase profits, and streamline operations.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all duration-200 group border border-gray-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-[#c79c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all duration-200 group border border-gray-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-[#c79c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {clientTestimonials.map((client, index) => (
                <div key={client.id} className="flex-[0_0_280px] min-w-0">
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
          <div className="flex justify-center gap-2 mt-8">
            {clientTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === selectedIndex 
                    ? 'bg-[#c79c6d] scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button className="bg-[#c79c6d] hover:bg-[#b8906b] text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200">
            Join These Successful Salons
          </button>
          <p className="mt-2 font-light text-gray-500 text-sm">
            Start your 14-day free trial today
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};