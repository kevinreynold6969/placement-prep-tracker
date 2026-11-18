import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const STITCH_REFERENCE_URL = '/stitch_placement_prep_tracker_ui/code.html';

const LandingPage = () => {
  const frameRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    const syncTheme = () => {
      const childTheme = frame.contentDocument?.documentElement?.dataset.theme;
      const expectedTheme = theme === 'dark' ? 'sakura' : 'light';
      if (childTheme !== expectedTheme) frame.contentWindow?.toggleTheme?.();
    };

    const handleThemeMessage = (event) => {
      if (event.source !== frame.contentWindow || event.origin !== window.location.origin) return;
      const requestedTheme = event.data?.theme;
      if (event.data?.type === 'placement-stitch-theme' && requestedTheme !== theme) toggleTheme();
      if (event.data?.type !== 'placement-tracker-action') return;

      if (event.data.action === 'navigate') {
        const path = event.data.path;
        if (['/login', '/register', '/dashboard'].includes(path)) navigate(path);
      }
      if (event.data.action === 'add-problem' && event.data.problem) {
        sessionStorage.setItem('placement-prep-quick-problem', JSON.stringify(event.data.problem));
        navigate(isAuthenticated ? '/dashboard?quickAdd=1' : '/login?quickAdd=1');
      }
    };

    frame.addEventListener('load', syncTheme);
    window.addEventListener('message', handleThemeMessage);
    if (frame.contentDocument?.readyState === 'complete') syncTheme();
    return () => {
      frame.removeEventListener('load', syncTheme);
      window.removeEventListener('message', handleThemeMessage);
    };
  }, [theme, toggleTheme, navigate, isAuthenticated]);

  return (
    <iframe
      ref={frameRef}
      src={STITCH_REFERENCE_URL}
      title="Placement Prep Tracker landing page"
      className="block h-screen min-h-screen w-full border-0"
      style={{ height: '100vh' }}
      scrolling="auto"
    />
  );
};

export default LandingPage;
