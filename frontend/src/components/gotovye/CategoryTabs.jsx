import { Link, useLocation } from 'react-router-dom';

/**
 * Табы категорий для страницы «Готовые потолки».
 * Активная вкладка — по текущему path (например /gotovye-potolki/matovyye).
 */
export default function CategoryTabs({ categories, basePath = '/gotovye-potolki' }) {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/list\/\d+$/, '');
  const currentSlug = pathname === basePath ? '' : pathname.replace(basePath + '/', '');

  return (
    <div className="cat_menu">
      {categories.map((cat) => {
        const href = cat.slug ? `${basePath}/${cat.slug}` : basePath;
        const isActive = (cat.slug === '' && pathname === basePath) || (cat.slug && pathname.startsWith(basePath + '/' + cat.slug));
        return (
          <Link
            key={cat.slug || 'all'}
            to={href}
            className={isActive ? 'cat_tab_active' : ''}
            aria-current={isActive ? 'page' : undefined}
          >
            <img src={isActive ? (cat.imageActive ?? cat.image) : cat.image} alt={cat.label} />
          </Link>
        );
      })}
    </div>
  );
}
