import React from 'react';

export const FooterSection = () => {
  return (
    <footer className="w-full bg-bg-warm py-12 px-4 sm:px-6 lg:px-8 border-t border-accent-ink/20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center gap-2">
          <div className="font-display font-bold text-xl text-text-primary tracking-tighter uppercase">
            ZAFORGE
          </div>
          <span className="text-text-muted text-sm">&copy; {new Date().getFullYear()}</span>
        </div>
        
        <div className="flex items-center gap-8">
          <a href="#" className="font-body text-sm text-text-muted hover:text-text-primary transition-colors">Manifesto</a>
          <a href="#" className="font-body text-sm text-text-muted hover:text-text-primary transition-colors">Twitter</a>
          <a href="#" className="font-body text-sm text-text-muted hover:text-text-primary transition-colors">GitHub</a>
        </div>
        
      </div>
    </footer>
  );
};
