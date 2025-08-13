import React from "react";
import { useGTM } from "../hooks/useGTM";

interface ContactSectionProps {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  backgroundImage = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop",
  title = "Ready to",
  subtitle = "Connect?",
  description = "Let's transform your salon together. We're here to help you succeed.",
}) => {
  const { trackSocialClick, trackDemoBooking } = useGTM();
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden max-w-full">
      {/* Dynamic Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)),
            url('${backgroundImage}')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-3xl rounded-full px-8 py-4 mb-8 border border-white/20 shadow-2xl">
            <div className="w-2 h-2 bg-gradient-to-r from-white to-gray-300 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em]">
              Get In Touch
            </span>
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full animate-pulse"></div>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-white mb-6 leading-[0.9] tracking-[-0.02em]">
            {title}
          </h2>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 leading-[0.9] tracking-[-0.02em] drop-shadow-2xl mb-8">
            {subtitle}
          </h2>
          <p className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
            {description}
          </p>
        </div>

        {/* 1. DEMO WIDGET - TOP SECTION */}
        <div className="mb-16 px-4">
          <div className="relative max-w-4xl mx-auto">
            <div className="relative p-4 sm:p-8 lg:p-12 bg-white/15 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] border border-white/25 shadow-2xl overflow-hidden">
              {/* 3D Effect Elements */}
              <div className="absolute top-6 right-8 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-6 left-8 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-lg animate-pulse delay-500"></div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <h3 className="text-3xl lg:text-4xl font-light text-white mb-4 leading-tight tracking-[-0.02em]">
                  Book Your Demo
                </h3>

                <p className="text-lg text-white/80 mb-8 leading-relaxed font-light max-w-2xl mx-auto">
                  See Spectra in action with a personalized walkthrough
                </p>

                {/* Available Slots Preview */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
                  <h4 className="text-white font-semibold mb-4">
                    Available This Week:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <div className="text-white/90 text-sm font-medium">
                        Today
                      </div>
                      <div className="text-white/70 text-xs">2:00 PM</div>
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <div className="text-white/90 text-sm font-medium">
                        Tomorrow
                      </div>
                      <div className="text-white/70 text-xs">10:00 AM</div>
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <div className="text-white/90 text-sm font-medium">
                        Wed
                      </div>
                      <div className="text-white/70 text-xs">3:30 PM</div>
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <div className="text-white/90 text-sm font-medium">
                        Thu
                      </div>
                      <div className="text-white/70 text-xs">1:00 PM</div>
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                    </div>
                  </div>
                </div>

                <a
                  href="https://calendly.com/spectra-ci/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#FF9500] to-[#E6850E] hover:from-[#E6850E] hover:to-[#CC7A0D] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] border border-[#FF9500]/20"
                  onClick={() => trackDemoBooking("calendly")}
                >
                  <span className="relative z-10">Schedule Demo</span>
                  <svg
                    className="w-5 h-5 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E6850E] to-[#CC7A0D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2. COMMUNICATION METHODS - 2x2 GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-16 max-w-4xl mx-auto px-4">
          {/* WhatsApp */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-50 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-green-400/40 to-green-500/40"></div>
            <a
              href="https://wa.me/972504322680?text=Hi! I'm interested in learning more about Spectra"
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-white/15 backdrop-blur-3xl rounded-[2rem] border border-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/40 h-full"
              onClick={() => trackSocialClick("WhatsApp", "whatsapp")}
            >
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                  WhatsApp
                </h3>
                <p className="text-white/70 text-sm">Instant support</p>
              </div>
            </a>
          </div>

          {/* Instagram DM */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-50 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-pink-400/40 to-purple-500/40"></div>
            <button
              className="relative bg-white/15 backdrop-blur-3xl rounded-[2rem] border border-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 w-full group-hover:scale-[1.02] group-hover:border-white/40 h-full"
              onClick={() => {
                const message =
                  "Hi! I'm interested in learning more about Spectra. Can you help me get started?";
                navigator.clipboard.writeText(message);
                window.open("https://www.instagram.com/spectra.ci/", "_blank");

                // Show notification
                const notification = document.createElement("div");
                notification.innerHTML = `
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Message copied! Paste it in Instagram DM</span>
                  </div>
                `;
                notification.className =
                  "fixed top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-50 border border-gray-700";
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 4000);
              }}
            >
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 48 48"
                  >
                    <path d="M24.0001 0.0955811C10.5343 0.0955811 0.0957031 9.95949 0.0957031 23.2828C0.0957031 30.2524 2.9518 36.2734 7.60264 40.4337C7.99371 40.7827 8.22893 41.2733 8.24519 41.7963L8.37522 46.0494C8.41634 47.4052 9.81809 48.2878 11.0583 47.7399L15.8028 45.6449C16.2053 45.468 16.6557 45.4345 17.0793 45.5522C19.2603 46.1517 21.58 46.471 23.9991 46.471C37.4649 46.471 47.9035 36.6071 47.9035 23.2838C47.9035 9.96044 37.4659 0.0955811 24.0001 0.0955811ZM38.8132 17.0954L30.4906 29.9579C30.068 30.611 29.1969 30.7974 28.5438 30.3748L20.8342 25.3864C20.5359 25.1933 20.1496 25.199 19.857 25.4008L11.1673 31.3941C9.89937 32.268 8.34941 30.7639 9.18606 29.4712L17.5096 16.6087C17.9322 15.9557 18.8033 15.7692 19.4554 16.1918L27.1669 21.1812C27.4653 21.3743 27.8516 21.3686 28.1441 21.1668L36.832 15.1745C38.0998 14.2996 39.6498 15.8046 38.8132 17.0973V17.0954Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                  Instagram DM
                </h3>
                <p className="text-white/70 text-sm">Direct message</p>
              </div>
            </button>
          </div>

          {/* Email Us */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-purple-400/30 to-pink-300/30"></div>
            <a
              href="mailto:office@spectra-ci.com"
              className="relative bg-white/15 backdrop-blur-3xl rounded-[2rem] border border-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/40 h-full"
            >
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-300 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
                  Email Us
                </h3>
                <p className="text-white/70 text-sm">office@spectra-ci.com</p>
              </div>
            </a>
          </div>

          {/* Call Us Now */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-green-400/30 to-emerald-300/30"></div>
            <a
              href="tel:+972504322680"
              className="relative bg-white/15 backdrop-blur-3xl rounded-[2rem] border border-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/40 h-full"
            >
              <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-300 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
                  Call Us
                </h3>
                <p className="text-white/70 text-sm">+972-50-432-2680</p>
              </div>
            </a>
          </div>
        </div>

        {/* 3. SOCIAL ICONS ROW - BOTTOM */}
        <div className="flex justify-center items-center gap-6 mb-16">
          {/* YouTube */}
          <a
            href="https://www.youtube.com/@spectracolorintelligence"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-14 h-14 bg-red-500/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          >
            <svg
              className="w-7 h-7 text-red-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/spectra-ci"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-14 h-14 bg-blue-500/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          >
            <svg
              className="w-7 h-7 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/share/1CFHR3osmZ/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-14 h-14 bg-blue-600/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          >
            <svg
              className="w-7 h-7 text-blue-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.367-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/spectra.ci/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-14 h-14 bg-pink-500/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          >
            <svg
              className="w-7 h-7 text-pink-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative p-8 bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl lg:text-3xl font-light text-white mb-4 leading-tight tracking-[-0.02em]">
                  Ready to Start Your Revolution?
                </h3>

                <p className="text-lg text-white/80 mb-8 leading-relaxed font-light">
                  Join thousands of salon professionals transforming their
                  business
                </p>

                <a
                  href="https://app.spectra-ci.com/signup?trial=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#FF9500] to-[#E6850E] hover:from-[#E6850E] hover:to-[#CC7A0D] text-white font-semibold text-base rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] border border-[#FF9500]/20"
                >
                  <span className="relative z-10">Start Free Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E6850E] to-[#CC7A0D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
