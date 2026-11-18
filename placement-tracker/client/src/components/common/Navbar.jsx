import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ variant = 'default' }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const poster = variant === 'poster';

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = poster
    ? [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Topics', href: '#topics' },
      { label: user ? 'Dashboard' : 'Sign in', href: user ? '/dashboard' : '/login' },
    ]
    : [
      { label: 'Features', href: '/#how-it-works' },
      { label: 'Topics', href: '/#topics' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ];

  const linkClass = poster
    ? 'hero-ink font-mono text-xs font-extrabold uppercase transition-opacity hover:opacity-70'
    : 'text-muted transition-colors hover:text-punch-500';

  return (
    <header className={`relative z-40 w-full ${poster ? 'poster-nav' : 'border-b border-line bg-paper/95 backdrop-blur'}`}>
      <div className="mx-auto flex min-h-[4.5rem] max-w-[1400px] items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Placement Prep home">
          <div className={`flex h-10 w-10 items-center justify-center border-2 border-black bg-black font-mono text-lg font-black text-white ${poster ? 'rounded-md shadow-neo-sm' : 'rounded-lg'}`}>P:</div>
          <span className="flex flex-col">
            <span className={`text-sm font-black uppercase leading-none tracking-tight sm:text-base ${poster ? 'hero-ink' : 'text-ink'}`}>
              Placement<span className={poster ? 'hero-ink' : 'text-punch-500'}>.Prep</span>
            </span>
            <span className={`mt-1 font-mono text-[9px] font-bold uppercase tracking-wider ${poster ? 'hero-ink opacity-80' : 'text-muted'}`}>Interview &amp; pattern tracker</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 xl:flex">
          {navLinks.map(({ label, href }) => (
            href.startsWith('/') ? (
              <Link key={label} to={href} className={linkClass}>{label}</Link>
            ) : (
              <a key={label} href={href} className={linkClass}>{label}</a>
            )
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <ThemeToggle poster={poster} />
          {user ? (
            <>
              {!poster && <Link to="/dashboard" className="button-secondary !rounded-md !px-4 !py-2 text-sm"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>}
              {poster && <Link to="/dashboard" className="neo-button inline-flex h-10 items-center gap-2 bg-black px-4 text-[11px] text-white hover:-translate-y-0.5"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>}
              <button onClick={handleLogout} title="Log out" className={`rounded-md p-2 transition-colors ${poster ? 'hero-ink hover:bg-black/10' : 'text-muted hover:bg-mist hover:text-punch-500'}`}><LogOut className="h-4 w-4" /></button>
            </>
          ) : (
            <>
              {!poster && <Link to="/login" className="px-3 py-2 text-sm font-medium text-muted hover:text-ink">Log in</Link>}
              <Link to="/register" className={poster ? 'neo-button inline-flex h-10 items-center gap-2 bg-black px-4 text-[11px] text-white' : 'button-primary !min-h-0 !rounded-full !px-5 !py-2.5 text-sm'}>
                {poster ? '+ Create account' : <>Get started <ArrowRight className="h-4 w-4" /></>}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle compact poster={poster} />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" aria-expanded={mobileMenuOpen} className={`rounded-md p-2 ${poster ? 'hero-ink hover:bg-black/10' : 'text-ink hover:bg-mist'}`}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`border-t px-5 pb-5 pt-3 md:hidden ${poster ? 'border-black/30 bg-punch-500' : 'border-line bg-paper'}`}>
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ label, href }) => href.startsWith('/')
              ? <Link key={label} to={href} onClick={() => setMobileMenuOpen(false)} className={`rounded-md px-3 py-2.5 text-sm font-bold uppercase ${poster ? 'hero-ink hover:bg-black/10' : 'text-muted hover:bg-mist hover:text-ink'}`}>{label}</Link>
              : <a key={label} href={href} onClick={() => setMobileMenuOpen(false)} className={`rounded-md px-3 py-2.5 text-sm font-bold uppercase ${poster ? 'hero-ink hover:bg-black/10' : 'text-muted hover:bg-mist hover:text-ink'}`}>{label}</a>)}
          </nav>
          <div className="mt-3 border-t border-line pt-4">
            {user ? <div className="flex gap-2"><Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="button-secondary flex-1 !rounded-md !py-2.5 text-center text-sm">Dashboard</Link><button onClick={handleLogout} className="button-secondary !rounded-md !py-2.5 text-sm"><LogOut className="h-4 w-4" />Sign out</button></div>
              : <div className="grid grid-cols-2 gap-2"><Link to="/login" onClick={() => setMobileMenuOpen(false)} className="button-secondary !rounded-md !py-2.5 text-center text-sm">Log in</Link><Link to="/register" onClick={() => setMobileMenuOpen(false)} className="button-primary !rounded-md !py-2.5 text-center text-sm">Create account</Link></div>}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
