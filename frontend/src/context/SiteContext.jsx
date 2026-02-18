import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { siteResolve, getSiteByCity, suggestCity, getHost } from '../api/public.js';

const STORAGE_KEY = 'selected_city_slug';
const DEFAULT_CITY = 'anapa';

function isMainDomain(host) {
  if (!host) return false;
  const h = host.toLowerCase();
  return h === 'proffi-center.ru' || h === 'www.proffi-center.ru';
}

const SiteContext = createContext(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
}

export function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [contacts, setContacts] = useState(null);
  const [seoSettings, setSeoSettings] = useState(null);
  const [selectedCitySlug, setSelectedCitySlugState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_CITY;
    return window.localStorage?.getItem(STORAGE_KEY) || DEFAULT_CITY;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoCitySlug, setGeoCitySlug] = useState(null);

  const setSelectedCitySlug = useCallback((slug) => {
    const s = slug || DEFAULT_CITY;
    setSelectedCitySlugState(s);
    try {
      window.localStorage?.setItem(STORAGE_KEY, s);
    } catch (_) {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    const host = typeof window !== 'undefined' ? (window.location.host || '') : '';
    const isMain = isMainDomain(host);
    const slug = typeof window !== 'undefined' ? (window.localStorage?.getItem(STORAGE_KEY) || DEFAULT_CITY) : DEFAULT_CITY;

    const finish = (siteData, contactsData) => {
      if (cancelled) return;
      setSite(siteData);
      setContacts(contactsData ?? null);
      setIsLoading(false);
    };

    const runMainDomain = (siteData, contactsData) => {
      suggestCity()
        .then((geoRes) => {
          if (cancelled) return;
          const suggestedSlug = geoRes?.data?.city_slug;
          const slugToUse = suggestedSlug || slug;
          if (suggestedSlug) {
            setSelectedCitySlugState(suggestedSlug);
            try { window.localStorage?.setItem(STORAGE_KEY, suggestedSlug); } catch (_) {}
            setGeoCitySlug(suggestedSlug);
          } else {
            setGeoCitySlug(null);
          }
          return getSiteByCity(slugToUse).then((r) => {
            if (cancelled) return;
            const s = r?.data?.site;
            finish(s || siteData, s?.contacts ?? contactsData);
          });
        })
        .catch(() => {
          if (cancelled) return;
          setGeoCitySlug(null);
          return getSiteByCity(slug).then((r) => {
            if (cancelled) return;
            const s = r?.data?.site;
            finish(s || siteData, s?.contacts ?? contactsData);
          });
        });
    };

    siteResolve()
      .then((res) => {
        if (cancelled) return;
        const d = res?.data;
        const siteData = d?.site;
        const contactsData = d?.site?.contacts ?? null;
        if (d?.seo_settings) setSeoSettings(d.seo_settings);
        if (isMain) {
          return runMainDomain(siteData, contactsData);
        }
        finish(siteData, contactsData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load site');
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const prevCitySlugRef = useRef(selectedCitySlug);
  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.host : '';
    if (!isMainDomain(host)) return;
    if (prevCitySlugRef.current === selectedCitySlug) return;
    prevCitySlugRef.current = selectedCitySlug;
    let cancelled = false;
    getSiteByCity(selectedCitySlug).then((r) => {
      if (cancelled) return;
      const s = r?.data?.site;
      if (s) {
        setSite(s);
        setContacts(s.contacts ?? null);
      }
    });
    return () => { cancelled = true; };
  }, [selectedCitySlug]);

  const isMain = isMainDomain(getHost());
  const value = useMemo(
    () => ({ site, contacts, seoSettings, isLoading, error, selectedCitySlug, setSelectedCitySlug, isMain, geoCitySlug }),
    [site, contacts, seoSettings, isLoading, error, selectedCitySlug, setSelectedCitySlug, isMain, geoCitySlug]
  );

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
}
