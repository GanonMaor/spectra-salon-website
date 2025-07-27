import React, { useState } from "react";
import { Navigation } from "../../components/Navigation";
import { CTAButton } from "../../components/CTAButton";
import { ContactSection } from "../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../constants/backgroundImages";

// Core team structure
const coreTeam = [
  {
    name: "Maor Ganon",
    age: 37,
    title: "Co-founder & CEO",
    description: "Professional hair colorist with 20+ years of experience. Founded Spectra to revolutionize salon operations through AI-powered intelligence.",
    image: "/team/maor-ganon.jpg",
    fallback: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Danny Michaeli", 
    age: 37,
    title: "Co-founder & CTO",
    description: "Technology expert with extensive experience in global development teams. Architect of the Spectra platform and AI systems.",
    image: "/team/danny-michaeli.jpg",
    fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Elad Gotlib",
    age: 47, 
    title: "Co-founder & COO",
    description: "Business operations specialist focused on scaling technology solutions. Drives strategic growth and operational excellence.",
    image: "/team/elad-gotlib.jpg",
    fallback: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Mika Bachur",
    age: 42,
    title: "VP of Operations & Strategic Partnerships", 
    description: "Leads operational excellence and strategic business development. Ensures seamless platform scaling for our growing artist community.",
    image: "/team/mika-bachur.jpg",
    fallback: "https://images.unsplash.com/photo-1494790108755-2616b612b97c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Yaar Ben-Jay",
    age: 23,
    title: "Head of Customer Success & Data Intelligence",
    description: "Drives customer satisfaction through data insights and user experience optimization. Ensures maximum platform value for every artist.",
    image: "/team/yaar-ben-jay.jpg",
    fallback: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
  }
];

// Board of Directors
const boardOfDirectors = [
  {
    name: "Roy Gefen",
    title: "Marketing Director",
    description: "Former CMO at accessiBe with over a decade of experience in marketing and brand leadership for global technology companies.",
    image: "/team/roy-gefen.jpg",
    fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Nava Ravid",
    title: "Strategic Director", 
    description: "Former CEO of L'Oréal Israel with 24 years in beauty industry leadership. Expert in market growth and strategic business development.",
    image: "/team/nava-ravid.jpg",
    fallback: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Brian Cooper",
    title: "Technology Director",
    description: "Founder of Retailx with proven expertise in scaling retail technology solutions. Acquired by NCR for $650M, bringing deep industry insights.",
    image: "/team/brian-cooper.jpg",
    fallback: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
  }
];

export const AboutPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track that user is on About page (not home)
  React.useEffect(() => {
    localStorage.setItem('ugc_current_page', 'about');
    localStorage.setItem('ugc_left_home_page', 'true');
  }, []);

  return (
    <div className="bg-white w-full min-h-screen font-sans antialiased">
      <Navigation />
      
      {/* Hero Section - Keep as is but add background */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        {/* Beautiful background image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-spectra-cream/30 to-spectra-gold/20 z-10"></div>
          <div className="w-full h-full opacity-10"
          style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4c4a8' fill-opacity='0.3'%3E%3Cpath d='M50 15c19.33 0 35 15.67 35 35 0 19.33-15.67 35-35 35-19.33 0-35-15.67-35-35 0-19.33 15.67-35 35-35zm0 5c-16.569 0-30 13.431-30 30s13.431 30 30 30 30-13.431 30-30-13.431-30-30-30z'/%3E%3Ccircle cx='50' cy='25' r='2'/%3E%3Ccircle cx='25' cy='50' r='2'/%3E%3Ccircle cx='75' cy='50' r='2'/%3E%3Ccircle cx='50' cy='75' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '150px 150px',
              backgroundPosition: '0 0, 75px 75px'
            }}
          />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center z-20">
          {/* Elegant badge */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full px-6 py-3 mb-10 border border-spectra-gold/30 shadow-sm">
            <div className="w-1.5 h-1.5 bg-spectra-gold rounded-full animate-pulse"></div>
            <span className="text-spectra-gold-dark text-sm font-medium uppercase tracking-wider">Our Story</span>
          </div>
          
          {/* Main headline - emotional and clean */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extralight text-spectra-charcoal mb-8 leading-[0.85] tracking-tight">
            For Every Artist
          </h1>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark leading-[0.85] tracking-tight mb-12">
            Who Dreams in Color
          </h1>
          
          {/* Emotional subtitle */}
          <p className="text-2xl lg:text-3xl text-spectra-charcoal-light max-w-4xl mx-auto leading-relaxed font-light mb-8">
            You pour your heart into every shade, every formula, every client's transformation.
          </p>
          <p className="text-xl text-spectra-charcoal/70 max-w-3xl mx-auto leading-relaxed">
            We're here to honor that artistry with tools that understand your craft as deeply as you do.
          </p>
        </div>
      </section>

      {/* Floating 3D Carousel - Revolutionary "We See You" Section */}
      <section className="py-32 lg:py-40 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-spectra-gold/5 to-rose-100/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-100/10 to-spectra-cream/15 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s', animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          {/* Minimal heading */}
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-7xl font-extralight text-slate-800 mb-6 tracking-[-0.02em]">
              We See <span className="bg-clip-text text-transparent bg-gradient-to-r from-spectra-gold via-rose-400 to-blue-400 font-light">You</span>
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
          </div>

          {/* 3D Floating Carousel */}
          <div className="relative h-96 lg:h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center">
              
              {/* Main floating container with 3D perspective */}
              <div className="relative w-full max-w-6xl h-full" 
                   style={{perspective: '1200px', transformStyle: 'preserve-3d'}}>
                
                {/* Center card - The message */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
                     style={{
                       transform: 'translate(-50%, -50%) translateZ(50px)',
                       animation: 'float 6s ease-in-out infinite'
                     }}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-[0_25px_80px_rgba(0,0,0,0.1)] border border-white/40 max-w-lg text-center">
                    <div className="text-3xl mb-6">✨</div>
                    <h3 className="text-2xl lg:text-3xl font-light text-slate-800 mb-6 leading-tight">
                      The Artist Behind <br/>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-spectra-gold to-rose-400">Every Formula</span>
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-light">
                      Whether you're perfecting that signature blonde or building your dream salon
                    </p>
                  </div>
                </div>

                {/* Left floating card - Hair colorist */}
                <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20"
                     style={{
                       transform: 'translateY(-50%) translateZ(-20px) rotateY(15deg)',
                       animation: 'floatLeft 8s ease-in-out infinite'
                     }}>
                  <div className="relative group">
                    {/* Glow effects */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-rose-200/30 to-orange-200/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-white/50 to-rose-50/50 rounded-3xl blur-lg"></div>
                    
                    <div className="relative w-72 h-80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-white/60">
                      <img 
                        src="/hair_colorist_in_a_color_bar.png"
                        alt="Professional hair colorist"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                      
                      {/* Floating label */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/40">
                          <p className="text-slate-700 font-light text-sm">Behind every perfect color</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right floating card - Salon workspace */}
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20"
                     style={{
                       transform: 'translateY(-50%) translateZ(-20px) rotateY(-15deg)',
                       animation: 'floatRight 8s ease-in-out infinite 2s'
                     }}>
                  <div className="relative group">
                    {/* Glow effects */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-white/50 to-blue-50/50 rounded-3xl blur-lg"></div>
                    
                    <div className="relative w-72 h-80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-white/60">
                      <img 
                        src="https://i.pinimg.com/1200x/32/3d/05/323d05c8e81ea3e3508f2ec0177b98e6.jpg"
                        alt="Professional salon workspace"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                      
                      {/* Floating label */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/40">
                          <p className="text-slate-700 font-light text-sm">Your creative sanctuary</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background floating elements */}
                <div className="absolute top-16 left-1/3 w-20 h-20 bg-gradient-to-br from-spectra-gold/20 to-rose-200/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-16 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
                <div className="absolute top-1/3 right-12 w-12 h-12 bg-gradient-to-br from-rose-200/20 to-orange-200/20 rounded-full blur-lg animate-pulse" style={{animationDelay: '2s'}}></div>

              </div>
            </div>
          </div>

          {/* Minimal description */}
          <div className="text-center mt-20">
            <p className="text-xl lg:text-2xl text-slate-600 font-light max-w-4xl mx-auto leading-relaxed">
              Solo artist or salon owner, every stroke of genius deserves tools that understand your vision
            </p>
          </div>

        </div>

        {/* Custom animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(-50%, -50%) translateZ(50px) translateY(0px); }
            50% { transform: translate(-50%, -50%) translateZ(50px) translateY(-20px); }
          }
          
          @keyframes floatLeft {
            0%, 100% { transform: translateY(-50%) translateZ(-20px) rotateY(15deg) translateX(0px); }
            50% { transform: translateY(-50%) translateZ(-20px) rotateY(15deg) translateX(-10px); }
          }
          
          @keyframes floatRight {
            0%, 100% { transform: translateY(-50%) translateZ(-20px) rotateY(-15deg) translateX(0px); }
            50% { transform: translateY(-50%) translateZ(-20px) rotateY(-15deg) translateX(10px); }
          }
        `}</style>
        
      </section>

      {/* Who We Serve - More Emotional and Delicate */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          
          {/* Main story about the customer */}
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-extralight text-spectra-charcoal mb-16 leading-tight tracking-wide">
              We See <span className="text-gradient-spectra font-light relative">
                You
                <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-spectra-gold/60 to-transparent"></div>
              </span>
            </h2>
            
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                
                {/* Left side - Your hair colorist image */}
                <div className="relative order-1">
                  <div className="relative w-full max-w-sm mx-auto">
                    {/* Soft glow effects behind the image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 to-rose-200/30 rounded-[2rem] blur-3xl opacity-60 scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-rose-50/40 rounded-[2rem] blur-2xl scale-105"></div>
                    
                    <div className="relative rounded-[2rem] overflow-hidden border-2 border-white/60 shadow-[0_20px_60px_rgba(212,196,168,0.2)]">
                      <img 
                        src="/hair_colorist_in_a_color_bar.png"
                        alt="Professional hair colorist working at color bar"
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Fallback to hair designer hugging satisfied client
                          target.src = "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      
                      {/* Subtle overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
                      
                      {/* Small floating elements for magic */}
                      <div className="absolute top-6 right-6 w-3 h-3 bg-rose-300/30 rounded-full blur-sm animate-pulse"></div>
                      <div className="absolute bottom-8 left-8 w-2 h-2 bg-white/40 rounded-full blur-sm animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    {/* Floating caption */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-spectra-gold/20 shadow-lg">
                      <p className="text-xs text-spectra-charcoal font-light tracking-wide">🎨 Your artistry in action</p>
                    </div>
                  </div>
                </div>
                
                {/* Center - Beautiful quote box */}
                <div className="relative order-3 lg:order-2">
                  {/* Soft background elements */}
                  <div className="absolute -top-8 -left-8 w-32 h-32 bg-spectra-gold/5 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-spectra-cream/40 rounded-full blur-xl"></div>
                  
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 lg:p-10 border border-spectra-gold/15 shadow-[0_8px_40px_rgba(212,196,168,0.12)]">
                    {/* Delicate opening quote mark */}
                    <div className="text-5xl text-spectra-gold/30 font-serif leading-none mb-4">"</div>
                    
                    <blockquote className="text-lg lg:text-xl text-spectra-charcoal/90 leading-relaxed mb-6 font-light tracking-wide">
                      You're the artist who opens early and closes late. The one who remembers exactly how Mrs. Chen likes her highlights, who stays up researching the perfect formula for a challenging color correction. 
                      <br /><br />
                      You're building something beautiful—whether it's a solo practice or a growing salon—and every decision matters.
                </blockquote>

                    {/* Elegant divider - more delicate */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-6 h-px bg-gradient-to-r from-transparent via-spectra-gold/40 to-transparent"></div>
                      <div className="w-1.5 h-1.5 bg-spectra-gold/50 rounded-full mx-3"></div>
                      <div className="w-6 h-px bg-gradient-to-r from-transparent via-spectra-gold/40 to-transparent"></div>
                    </div>
                    
                    <p className="text-base text-spectra-charcoal/70 italic font-light leading-relaxed">
                      This is for you—the passionate professional who deserves tools as dedicated as you are.
                    </p>
                    
                    {/* Delicate closing quote mark */}
                    <div className="text-5xl text-spectra-gold/30 font-serif leading-none text-right mt-4">"</div>
                  </div>
                </div>

                {/* Right side - Your custom image */}
                <div className="relative order-2 lg:order-3">
                  <div className="relative w-full max-w-sm mx-auto">
                    {/* Soft glow effects behind the image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-spectra-gold/10 to-spectra-gold/20 rounded-[2rem] blur-3xl opacity-60 scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-spectra-cream/30 rounded-[2rem] blur-2xl scale-105"></div>
                    
                    <div className="relative rounded-[2rem] overflow-hidden border-2 border-white/60 shadow-[0_20px_60px_rgba(212,196,168,0.2)]">
                      <img 
                        src="/your-custom-salon.jpg"
                        alt="Beautiful salon workspace"
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // התמונה שלך מ-Pinterest
                          target.src = "https://i.pinimg.com/1200x/32/3d/05/323d05c8e81ea3e3508f2ec0177b98e6.jpg";
                        }}
                      />
                      
                      {/* Subtle overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
                      
                      {/* Small floating elements for magic */}
                      <div className="absolute top-6 left-6 w-2 h-2 bg-spectra-gold/30 rounded-full blur-sm animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-6 right-6 w-3 h-3 bg-spectra-gold/20 rounded-full blur-sm animate-pulse" style={{animationDelay: '2s'}}></div>
                    </div>
                    
                    {/* Floating caption */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-spectra-gold/20 shadow-lg">
                      <p className="text-xs text-spectra-charcoal font-light tracking-wide">✨ Your professional space</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Three pillars - more delicate and emotional */}
          <div className="grid lg:grid-cols-3 gap-10 mt-20">
            <div className="text-center group">
              {/* More delicate icon container */}
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-spectra-gold/20 to-spectra-gold/10 rounded-full flex items-center justify-center mx-auto border border-spectra-gold/20 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                  <span className="text-2xl">✨</span>
                </div>
                {/* Soft glow effect */}
                <div className="absolute inset-0 w-16 h-16 bg-spectra-gold/10 rounded-full blur-xl mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <h3 className="text-xl font-light text-spectra-charcoal mb-5 tracking-wide">Solo Artists</h3>
              <p className="text-spectra-charcoal-light leading-relaxed font-light">
                Whether you're building your dream chair rental or independent studio, every formula matters, every client is precious.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto border border-blue-200/30 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                  <span className="text-2xl">💫</span>
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-blue-200/10 rounded-full blur-xl mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

              <h3 className="text-xl font-light text-spectra-charcoal mb-5 tracking-wide">Salon Leaders</h3>
              <p className="text-spectra-charcoal-light leading-relaxed font-light">
                You're guiding talented artists, ensuring consistency while nurturing creativity. You need systems that work as hard as you do.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-200/30 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                  <span className="text-2xl">🌱</span>
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-rose-200/10 rounded-full blur-xl mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

              <h3 className="text-xl font-light text-spectra-charcoal mb-5 tracking-wide">Growing Dreams</h3>
              <p className="text-spectra-charcoal-light leading-relaxed font-light">
                From your first client to your tenth stylist, we grow with you. Intelligence that scales from artistry to mastery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Founder's Heart - Delicate and Emotional */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-spectra-cream/20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extralight text-spectra-charcoal mb-8 tracking-wide">
              A Story of <span className="text-gradient-spectra font-light relative">
                Passion & Purpose
                <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-spectra-gold/60 to-transparent"></div>
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                {/* Soft background elements */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-spectra-gold/5 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-spectra-cream/30 rounded-full blur-lg"></div>
                
                <div className="relative bg-white/90 backdrop-blur-sm rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_40px_rgba(212,196,168,0.12)] border border-spectra-gold/15">
                  <h3 className="text-2xl font-light text-spectra-charcoal mb-6 tracking-wide">From Frustration to Innovation</h3>
                  
                  <div className="space-y-6 text-lg text-spectra-charcoal-light leading-relaxed font-light">
                    <p>
                      "After 20 years behind the chair, I knew something had to change. I was tired of watching talented colorists struggle with the same problems I faced every day."
                    </p>
                    <p>
                      "Formulas scribbled on scraps of paper. Inventory that disappeared overnight. The heartbreak of not being able to recreate that perfect shade."
                    </p>
                    <p>
                      "But mostly, I was tired of seeing incredible artists doubt themselves when the tools failed them, not their talent."
                    </p>
                    
                    {/* Elegant divider */}
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-px bg-gradient-to-r from-transparent via-spectra-gold/40 to-transparent"></div>
                      <div className="w-1 h-1 bg-spectra-gold/50 rounded-full mx-3"></div>
                      <div className="w-6 h-px bg-gradient-to-r from-transparent via-spectra-gold/40 to-transparent"></div>
                </div>

                    <p className="text-spectra-gold font-light italic text-xl">
                      "So we built something different. Something worthy of your artistry."
                    </p>
                    <p className="text-sm text-spectra-charcoal/60 font-light tracking-wide">— Maor Ganon</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="w-80 h-80 mx-auto relative">
                  {/* Soft glow effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-spectra-gold/10 to-spectra-gold/20 rounded-full blur-3xl opacity-60"></div>
                  <div className="absolute inset-4 bg-gradient-to-br from-white/50 to-spectra-cream/30 rounded-full blur-2xl"></div>
                  
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/60 shadow-[0_20px_60px_rgba(212,196,168,0.2)]">
                    <img 
                      src="/team/maor-ganon.jpg"
                      alt="Maor Ganon - Founder"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=Maor%20Ganon&size=320&background=d4c4a8&color=000&format=png`;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Team - Delicate and Refined */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-extralight text-spectra-charcoal mb-8 tracking-wide">
              Our <span className="text-gradient-spectra font-light relative">
                Core Team
                <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-spectra-gold/60 to-transparent"></div>
              </span>
            </h2>
            <p className="text-xl text-spectra-charcoal-light max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              Artists, engineers, and dreamers united by one mission: empowering your creativity
            </p>
          </div>

          {/* Team grid - delicate and refined */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {coreTeam.map((member, index) => (
              <div key={member.name} className="group">
                <div className="relative">
                  {/* Soft background elements */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-spectra-gold/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-[0_8px_40px_rgba(212,196,168,0.08)] border border-spectra-gold/10 hover:shadow-[0_16px_60px_rgba(212,196,168,0.15)] hover:border-spectra-gold/20 transition-all duration-500 text-center h-full">
                    {/* Photo */}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-spectra-gold/15 group-hover:border-spectra-gold/30 transition-colors duration-500 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-spectra-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img 
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover relative z-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = member.fallback;
                        }}
                      />
                    </div>
                    
                    {/* Info */}
                    <h4 className="text-lg font-light text-spectra-charcoal mb-2 tracking-wide">
                      {member.name}
                      <span className="text-spectra-charcoal/60 font-extralight">, {member.age}</span>
                    </h4>
                    <p className="text-spectra-gold font-light mb-4 text-sm tracking-wide">{member.title}</p>
                    
                    {/* Description */}
                    <p className="text-spectra-charcoal-light leading-relaxed font-light text-sm">
                      {member.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board of Directors - Delicate and Refined */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-spectra-cream/20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-extralight text-spectra-charcoal mb-8 tracking-wide">
              Board of <span className="text-gradient-spectra font-light relative">
                Directors
                <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-spectra-gold/60 to-transparent"></div>
              </span>
            </h2>
            <p className="text-xl text-spectra-charcoal-light max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              Industry leaders guiding our strategic vision and growth
              </p>
            </div>

          {/* Directors grid - refined */}
          <div className="grid lg:grid-cols-3 gap-10">
            {boardOfDirectors.map((director) => (
              <div key={director.name} className="group">
                <div className="relative">
                  {/* Soft background elements */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-spectra-gold/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-[0_8px_40px_rgba(212,196,168,0.08)] border border-spectra-gold/10 hover:shadow-[0_16px_60px_rgba(212,196,168,0.15)] hover:border-spectra-gold/20 transition-all duration-500 text-center h-full">
                    {/* Photo */}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-2 border-spectra-gold/15 group-hover:border-spectra-gold/30 transition-colors duration-500 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-spectra-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img 
                        src={director.image}
                        alt={director.name}
                        className="w-full h-full object-cover relative z-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = director.fallback;
                        }}
                      />
                    </div>
                    
                    {/* Info */}
                    <h4 className="text-lg font-light text-spectra-charcoal mb-2 tracking-wide">{director.name}</h4>
                    <p className="text-spectra-gold font-light mb-4 text-sm tracking-wide">{director.title}</p>
                    
                    {/* Description */}
                    <p className="text-spectra-charcoal-light leading-relaxed font-light text-sm">
                      {director.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise - Delicate and Emotional */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-spectra-cream/30 to-spectra-gold/15">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extralight text-spectra-charcoal mb-8 tracking-wide">
              Our <span className="text-gradient-spectra font-light relative">
                Promise
                <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-spectra-gold/60 to-transparent"></div>
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-light text-spectra-charcoal mb-8 tracking-wide">To Every Artist We Serve</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-spectra-gold rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-light text-spectra-charcoal mb-2 text-lg tracking-wide">We Honor Your Expertise</h4>
                    <p className="text-spectra-charcoal-light leading-relaxed font-light">Our AI learns from you, not the other way around. Your years of experience guide every algorithm.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-spectra-gold rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-light text-spectra-charcoal mb-2 text-lg tracking-wide">We Preserve Your Artistry</h4>
                    <p className="text-spectra-charcoal-light leading-relaxed font-light">Every formula, every technique, every breakthrough becomes part of your growing intelligence.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-spectra-gold rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-light text-spectra-charcoal mb-2 text-lg tracking-wide">We Amplify Your Impact</h4>
                    <p className="text-spectra-charcoal-light leading-relaxed font-light">Tools that help you serve more clients, create more beauty, and build the business you've dreamed of.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Soft background elements */}
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-spectra-gold/5 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/50 rounded-full blur-lg"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_40px_rgba(212,196,168,0.12)] border border-spectra-gold/15">
                <blockquote className="text-xl lg:text-2xl text-spectra-charcoal leading-relaxed italic mb-6 font-light tracking-wide">
                  "Technology should feel like an extension of your hands, not a barrier to your creativity. We're building tools that disappear into your workflow and amplify what you already do brilliantly."
                </blockquote>
                
                <div className="flex items-center justify-center mb-6">
                  <div className="w-6 h-px bg-gradient-to-r from-transparent via-spectra-gold/40 to-transparent"></div>
                  <div className="w-1 h-1 bg-spectra-gold/50 rounded-full mx-3"></div>
                  <div className="w-6 h-px bg-gradient-to-r from-transparent via-spectra-gold/40 to-transparent"></div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spectra-gold-light/80 to-spectra-gold/80 flex items-center justify-center">
                    <span className="text-white text-lg">💝</span>
                  </div>
                  <div>
                    <p className="font-light text-spectra-charcoal tracking-wide">Our commitment to you</p>
                    <p className="text-sm text-spectra-charcoal/60 font-light">Every day, every feature, every update</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats - Elegant and Refined */}
      <section className="py-20 lg:py-28 bg-spectra-charcoal relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4c4a8' fill-opacity='0.3'%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px'
          }}
        />
        
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extralight text-white mb-6 tracking-wide">
              Growing <span className="text-spectra-gold font-light relative">
                Together
                <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-spectra-gold/60 to-transparent"></div>
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              Every number represents an artist whose craft we're honored to support
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-4">
                <div className="text-5xl lg:text-6xl font-extralight text-spectra-gold mb-4 transition-transform duration-500 group-hover:scale-110">500+</div>
                <div className="absolute inset-0 bg-spectra-gold/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="text-white/90 font-light text-lg mb-2 tracking-wide">Artists Supported</div>
              <div className="text-white/60 text-sm font-light">Across 20+ countries</div>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-4">
                <div className="text-5xl lg:text-6xl font-extralight text-spectra-gold mb-4 transition-transform duration-500 group-hover:scale-110">15K+</div>
                <div className="absolute inset-0 bg-spectra-gold/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="text-white/90 font-light text-lg mb-2 tracking-wide">Perfect Formulas</div>
              <div className="text-white/60 text-sm font-light">Created with AI assistance</div>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-4">
                <div className="text-5xl lg:text-6xl font-extralight text-spectra-gold mb-4 transition-transform duration-500 group-hover:scale-110">92%</div>
                <div className="absolute inset-0 bg-spectra-gold/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="text-white/90 font-light text-lg mb-2 tracking-wide">Success Rate</div>
              <div className="text-white/60 text-sm font-light">In formula consistency</div>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-4">
                <div className="text-5xl lg:text-6xl font-extralight text-spectra-gold mb-4 transition-transform duration-500 group-hover:scale-110">∞</div>
                <div className="absolute inset-0 bg-spectra-gold/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="text-white/90 font-light text-lg mb-2 tracking-wide">Possibilities</div>
              <div className="text-white/60 text-sm font-light">When artistry meets intelligence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection 
        backgroundImage={BACKGROUND_IMAGES.luxurySalon}
        title="Ready to Transform"
        subtitle="Your Artistry?"
        description="Join the community of passionate colorists who are creating the future of beauty, one perfect formula at a time."
      />
    </div>
  );
};

export default AboutPage; 