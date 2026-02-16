import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const GOTOVYE_BASE = '/gotovye-potolki';

/**
 * При смене маршрута прокручивает окно в начало страницы (плавно).
 * Исключение: переходы внутри «Готовые потолки» (категории, пагинация) — скролл не сбрасываем.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    const stayOnGotovye = prev.startsWith(GOTOVYE_BASE) && pathname.startsWith(GOTOVYE_BASE);
    if (stayOnGotovye) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}
