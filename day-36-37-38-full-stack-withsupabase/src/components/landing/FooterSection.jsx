import React from 'react';

export const FooterSection = () => {
  return (
    <footer className="parallax-section relative z-50 w-full bg-[#0A0A0B] text-white py-16 px-4 sm:px-6 lg:px-8 -mt-16 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-accent-ink/20">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* About Section */}
        <div className="max-w-2xl">
          <h3 className="font-display font-bold text-2xl mb-4 text-white uppercase tracking-tight">
            About
          </h3>
          <p className="font-body text-gray-400 leading-relaxed">
            Mohammad Huzaifa. Frontend Developer. Computer Science student, Jamia Millia Islamia.
            <br />
            Building interfaces with React, JavaScript and CSS.
            <br />
            Focused on clean structure, motion and detail. Every project designed and built from
            scratch.
            <br />
            Currently exploring GSAP, Three.js and modern web animation.
            <br />
            Open to frontend roles and freelance collaborations. Based in India. Building for a
            global audience.
            <br />
            Let's connect.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="font-display font-bold text-xl text-white tracking-tighter uppercase">
              ZAFORGE
            </div>
            <span className="text-gray-500 text-sm">&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/mohammad43268"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/mohammad-huzaifa-359673344/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
