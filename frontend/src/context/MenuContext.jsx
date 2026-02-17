import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSite } from './SiteContext.jsx';
import { getMenu } from '../api/public.js';

const MenuContext = createContext(null);

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}

export function MenuProvider({ children }) {
  const { site, isLoading: siteLoading } = useSite();
  const [headerMenu, setHeaderMenu] = useState([]);
  const [footerMenu, setFooterMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siteLoading || !site) {
      setLoading(siteLoading);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([getMenu('header'), getMenu('footer')])
      .then(([hRes, fRes]) => {
        if (cancelled) return;
        setHeaderMenu(Array.isArray(hRes?.data) ? hRes.data : []);
        setFooterMenu(Array.isArray(fRes?.data) ? fRes.data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setHeaderMenu([]);
          setFooterMenu([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [site, siteLoading]);

  const value = useMemo(
    () => ({ headerMenu, footerMenu, loading }),
    [headerMenu, footerMenu, loading]
  );

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}
