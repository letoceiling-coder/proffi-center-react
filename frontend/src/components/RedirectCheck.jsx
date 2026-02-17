import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkRedirect } from '../api/public.js';
import { ROOM_PAGE_SLUGS } from '../data/roomPagesData.js';

/**
 * Calls /redirects/check for current path. If matched, redirects (replace).
 * Не проверяет редиректы для путей страниц комнат (potolki-v-prihozhuju и т.д.),
 * чтобы API/БД не перенаправляли их на главную.
 */
export default function RedirectCheck({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const pathSlug = (location.pathname || '').replace(/^\/|\/$/g, '');
  const isRoomPage = ROOM_PAGE_SLUGS.includes(pathSlug);

  useEffect(() => {
    if (isRoomPage) return;
    const path = location.pathname + (location.search || '');
    let cancelled = false;
    checkRedirect(path)
      .then((res) => {
        if (cancelled) return;
        if (res?.matched && res?.to) {
          if (res.to.startsWith('http') || res.to.startsWith('//')) {
            window.location.replace(res.to);
          } else {
            navigate(res.to, { replace: true });
          }
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [location.pathname, location.search, navigate, isRoomPage]);

  return children;
}
