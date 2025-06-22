import React from "react";

export const ContactSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Dark Salon Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)),
            url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Enhanced Floating Glass Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Additional atmospheric elements */}
        <div className="absolute top-10 right-32 w-64 h-64 bg-gradient-to-br from-pink-400/5 to-purple-400/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 left-32 w-48 h-48 bg-gradient-to-br from-cyan-400/8 to-blue-400/8 rounded-full blur-2xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-3xl rounded-full px-8 py-4 mb-8 border border-white/20 shadow-2xl">
            <div className="w-2 h-2 bg-gradient-to-r from-white to-gray-300 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em]">Get In Touch</span>
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-white mb-6 leading-[0.9] tracking-[-0.02em]">
            Ready to
          </h2>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 leading-[0.9] tracking-[-0.02em] drop-shadow-2xl mb-8">
            Connect?
          </h2>
          <p className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
            Let's transform your salon together. We're here to help you succeed.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          
          {/* Call Us Now */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-green-400/30 to-emerald-300/30"></div>
            <div className="relative bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 group-hover:scale-[1.02] group-hover:border-white/30 h-full">
              
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-300 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Call Us Now</h3>
                <a href="tel:+972504322680" className="text-white/70 text-sm hover:text-white transition-colors duration-300">
                  +972-50-432-2680<br />
                  <span className="text-xs text-white/50">Available 24/7</span>
                </a>
              </div>
            </div>
          </div>

          {/* Email Us */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-purple-400/30 to-pink-300/30"></div>
            <div className="relative bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 group-hover:scale-[1.02] group-hover:border-white/30 h-full">
              
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-300 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Email Us</h3>
                <a href="mailto:office@spectra-ci.com" className="text-white/70 text-sm hover:text-white transition-colors duration-300">
                  office@spectra-ci.com<br />
                  <span className="text-xs text-white/50">We reply within 2 hours</span>
                </a>
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-50 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-green-400/40 to-green-500/40"></div>
            <a 
              href="https://wa.me/972504322680?text=Hi! I'm interested in learning more about Spectra"
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-white/15 backdrop-blur-3xl rounded-[2rem] border border-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/40 h-full"
            >
              
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              
              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Chat on WhatsApp</h3>
                <p className="text-white/70 text-sm">Get instant support</p>
              </div>
            </a>
          </div>

          {/* Instagram DM */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-50 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-pink-400/40 to-purple-500/40"></div>
            <a 
              href="https://www.instagram.com/spectra.ci/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-white/15 backdrop-blur-3xl rounded-[2rem] border border-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/40 h-full"
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText("Hi! I'm interested in learning more about Spectra. Can you help me get started?");
                window.open("https://www.instagram.com/spectra.ci/", "_blank");
                const notification = document.createElement('div');
                notification.innerHTML = 'Message copied! Paste it in Instagram DM';
                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
              }}
            >
              
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              
              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.624 5.367 11.99 11.987 11.99s11.987-5.366 11.987-11.99C24.003 5.367 18.641.001 12.017.001zm5.109 18.5l-2.614-2.556V17.5c0 .276-.224.5-.5.5h-4c-.276 0-.5-.224-.5-.5v-1.556L6.908 18.5c-.195.191-.512.191-.707 0s-.191-.512 0-.707L8.056 16H7.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h.556l-1.848-1.793c-.195-.195-.195-.512 0-.707s.512-.195.707 0L9.5 14.944V14.5c0-.276.224-.5.5-.5s.5.224.5.5v.444L12.354 13.2c.195-.195.512-.195.707 0s.195.512 0 .707L11.207 15.5h.556c.276 0 .5.224.5.5s-.224.5-.5.5h-.556l1.848 1.793c.195.195.195.512 0 .707-.098.098-.226.146-.354.146s-.256-.049-.354-.146L10.5 16.944V17.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-.556L7.646 18.8c-.195.195-.512.195-.707 0s-.195-.512 0-.707L8.793 16.5H8.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h.293L7.146 14.146c-.195-.195-.195-.512 0-.707s.512-.195.707 0L9.5 15.293V15c0-.276.224-.5.5-.5s.5.224.5.5v.293l1.854-1.854c.195-.195.512-.195.707 0s.195.512 0 .707L11.207 16H11.5c.276 0 .5.224.5.5s-.224.5-.5.5h-.293l1.854 1.854c.195.195.195.512 0 .707z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">DM on Instagram</h3>
                <p className="text-white/70 text-sm">Message copied automatically</p>
              </div>
            </a>
          </div>

          {/* YouTube Channel */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-red-500/30 to-red-600/30"></div>
            <a 
              href="https://www.youtube.com/@spectracolorintelligence"
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/30 h-full"
            >
              
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">YouTube Channel</h3>
                <p className="text-white/70 text-sm">@spectracolorintelligence - Tutorials & demos</p>
              </div>
            </a>
          </div>

          {/* Instagram Follow */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-pink-400/30 to-purple-500/30"></div>
            <a 
              href="https://www.instagram.com/spectra.ci/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/30 h-full"
            >
              
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">Follow Us</h3>
                <p className="text-white/70 text-sm">@spectra.ci - Tips & updates</p>
              </div>
            </a>
          </div>

          {/* Facebook */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-blue-500/30 to-blue-600/30"></div>
            <a 
              href="https://facebook.com/SpectraSalon"
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/30 h-full"
            >
              
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.367-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">Like Our Page</h3>
                <p className="text-white/70 text-sm">SpectraSalon - Community</p>
              </div>
            </a>
          </div>

          {/* Book a Demo */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-orange-400/30 to-red-500/30"></div>
            <button className="relative bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 w-full group-hover:scale-[1.02] group-hover:border-white/30 h-full">
              
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">Book a Demo</h3>
                <p className="text-white/70 text-sm">Personal walkthrough</p>
              </div>
            </button>
          </div>

        </div>

        {/* Bottom CTA - עיצוב כהה ודרמטי */}
        <div className="text-center">
          <div className="relative max-w-4xl mx-auto">
            <div className="relative p-12 bg-white/10 backdrop-blur-3xl rounded-[3rem] border border-white/20 shadow-2xl overflow-hidden">
              
              {/* Floating Elements */}
              <div className="absolute top-6 right-8 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-300/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-6 left-8 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-lg animate-pulse delay-500"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 leading-tight tracking-[-0.02em]">
                  Ready to Start Your Revolution?
                </h3>
                
                <p className="text-xl text-white/80 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
                  Join thousands of salon professionals transforming their business with Spectra
                </p>
                
                {/* שני כפתורים עם עיצוב כהה ומודרני */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  {/* כפתור כתום */}
                  <button className="group relative px-10 py-5 bg-gradient-to-r from-[#FF9500] to-[#E6850E] hover:from-[#E6850E] hover:to-[#CC7A0D] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] border border-[#FF9500]/20">
                    <span className="relative z-10">Start Free Trial</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#E6850E] to-[#CC7A0D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  {/* כפתור וואטסאפ עם גלאס אפקט כהה */}
                  <a 
                    href="https://wa.me/972504322680?text=Hi! I want to learn more about Spectra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative px-10 py-5 bg-white/5 backdrop-blur-3xl border border-white/15 hover:border-green-400/30 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] overflow-hidden"
                  >
                    {/* גלאס אפקט כהה */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/5 to-transparent"></div>
                    
                    {/* תוכן הכפתור */}
                    <div className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>WhatsApp</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 