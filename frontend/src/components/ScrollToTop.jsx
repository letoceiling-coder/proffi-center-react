import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * При смене маршрута прокручивает окно в начало страницы (плавно).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}
