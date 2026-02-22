import React from "react";
import { useGTM } from "../hooks/useGTM";
import { useSiteColors, useSiteTheme } from "../contexts/SiteTheme";

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
  const c = useSiteColors();
  const { isDark } = useSiteTheme();
  const s = c.imageSection;

  return (
    <section className="relative py-12 lg:py-16 overflow-hidden max-w-full">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat lg:bg-fixed"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className="absolute inset-0 z-0" style={{ background: s.overlay }} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: s.glowA }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
            <span className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: s.textDimmed }}>
              Get In Touch
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight mb-4 leading-[1.1] tracking-[-0.02em]" style={{ color: s.textPrimary }}>
            {title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
              {subtitle}
            </span>
          </h2>
          <p className="text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed font-light" style={{ color: s.textDimmed }}>
            {description}
          </p>
        </div>

        <div className="mb-16">
          <div className="relative max-w-4xl mx-auto">
            <div
              className="backdrop-blur-md rounded-3xl p-8 lg:p-10"
              style={{ background: s.solidCardBg, border: `1px solid ${s.cardBorder}` }}
            >
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#EAB776]/20 to-[#B18059]/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7" style={{ color: s.iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-light mb-3" style={{ color: s.textPrimary }}>
                  Book Your Demo
                </h3>
                <p className="text-base font-light max-w-xl mx-auto" style={{ color: s.textDimmed }}>
                  See Spectra in action with a personalized walkthrough
                </p>
              </div>

              <div className="mb-8">
                <p className="text-xs uppercase tracking-wider mb-4 text-center" style={{ color: s.textMuted }}>
                  Available This Week
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-2xl mx-auto">
                  {[
                    { day: "Today", time: "2:00 PM" },
                    { day: "Tomorrow", time: "10:00 AM" },
                    { day: "Wed", time: "3:30 PM" },
                    { day: "Thu", time: "1:00 PM" },
                  ].map((slot, i) => (
                    <a
                      key={i}
                      href="/signup?trial=true"
                      onClick={() => trackDemoBooking(`slot-${slot.day}`)}
                      className="group backdrop-blur-sm rounded-xl p-4 transition-all duration-300 text-center cursor-pointer"
                      style={{
                        background: s.cardBg,
                        border: `1px solid ${s.cardBorder}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = s.cardBgHover;
                        e.currentTarget.style.borderColor = "rgba(234,183,118,0.30)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = s.cardBg;
                        e.currentTarget.style.borderColor = s.cardBorder;
                      }}
                    >
                      <div className="text-sm font-medium mb-1" style={{ color: s.textSecondary }}>
                        {slot.day}
                      </div>
                      <div className="text-xs" style={{ color: s.textDimmed }}>
                        {slot.time}
                      </div>
                      <div className="flex items-center justify-center mt-2">
                        <div className="w-2 h-2 bg-emerald-400/80 rounded-full group-hover:scale-125 transition-transform" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8 max-w-xl mx-auto">
                <div className="flex-1 h-px" style={{ background: s.cardBorder }} />
                <span className="text-xs" style={{ color: s.textFaint }}>or start now</span>
                <div className="flex-1 h-px" style={{ background: s.cardBorder }} />
              </div>

              <div className="text-center">
                <a
                  href="/signup?trial=true"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  onClick={() => trackDemoBooking("trial-cta")}
                >
                  Book a Demo
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </a>
                <p className="text-xs mt-4" style={{ color: s.textFaint }}>
                  Free personalized walkthrough · No commitment
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-16 max-w-4xl mx-auto">
          {[
            {
              href: "https://wa.me/972504322680?text=Hi! I'm interested in learning more about Spectra",
              onClick: () => trackSocialClick("WhatsApp", "whatsapp"),
              iconBg: "bg-green-500/20",
              icon: <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg>,
              label: "WhatsApp",
              sub: "Instant support",
            },
            {
              href: "https://www.instagram.com/spectra.ci/",
              iconBg: "bg-pink-500/20",
              icon: <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
              label: "Instagram",
              sub: "@spectra.ci",
            },
            {
              href: "mailto:office@spectra-ci.com",
              iconBg: "bg-gradient-to-br from-[#EAB776]/20 to-[#B18059]/20",
              icon: <svg className="w-6 h-6" style={{ color: s.iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
              label: "Email",
              sub: "office@spectra-ci.com",
            },
            {
              href: "tel:+972504322680",
              iconBg: "bg-emerald-500/20",
              icon: <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
              label: "Call",
              sub: "+972-50-432-2680",
            },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group backdrop-blur-sm rounded-2xl p-6 text-center transition-all duration-300"
              style={{ background: s.cardBg, border: `1px solid ${s.cardBorder}` }}
              onClick={item.onClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = s.cardBgHover;
                e.currentTarget.style.borderColor = s.cardBorderHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = s.cardBg;
                e.currentTarget.style.borderColor = s.cardBorder;
              }}
            >
              <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="font-medium text-sm mb-1" style={{ color: s.textPrimary }}>{item.label}</h3>
              <p className="text-xs" style={{ color: s.textDimmed }}>{item.sub}</p>
            </a>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mb-12">
          {[
            { href: "https://www.youtube.com/@spectracolorintelligence", icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /> },
            { href: "https://www.linkedin.com/company/spectra-ci", icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> },
            { href: "https://www.facebook.com/share/1CFHR3osmZ/?mibextid=wwXIfr", icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.367-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
          ].map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: s.cardBg, border: `1px solid ${s.cardBorder}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = s.cardBgHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = s.cardBg; }}
            >
              <svg className="w-5 h-5" style={{ color: s.textMuted }} fill="currentColor" viewBox="0 0 24 24">
                {link.icon}
              </svg>
            </a>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm font-light" style={{ color: s.textFaint }}>
            Join thousands of salon professionals transforming their business
          </p>
        </div>
      </div>
    </section>
  );
};
