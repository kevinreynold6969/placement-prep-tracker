import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t-4 border-black bg-inverse px-5 py-10 font-mono text-xs text-white sm:px-8 lg:px-10">
    <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
      <Link to="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-black bg-paper font-black text-ink shadow-neo-sm">P:</span>
        <span>
          <span className="block font-sans text-sm font-black uppercase tracking-tight">Placement Prep</span>
          <span className="mt-1 block text-[10px] text-white/60">A personal DSA practice ledger.</span>
        </span>
      </Link>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 font-bold uppercase tracking-wide text-white/80">
        <a className="transition-colors hover:text-punk-500" href="/#how-it-works">How it works</a>
        <a className="transition-colors hover:text-punk-500" href="/#topics">Topics</a>
        <Link className="transition-colors hover:text-punk-500" to="/terms">Terms</Link>
        <Link className="transition-colors hover:text-punk-500" to="/privacy">Privacy</Link>
      </nav>
    </div>
  </footer>
);

export default Footer;
