import { Link } from 'react-router-dom';
import { CEILING_CATEGORY_SLUGS } from '../data/ceilingCategoriesData';

const slugFromHref = (href) => (href || '').replace(/^\//, '');

export default function Menu({ items = [], onClose, isOpen }) {
  return (
    <div id="menunav" className={`menu clearfix ${isOpen ? 'show' : ''}`}>
      <button type="button" id="m_close" className="m_close" onClick={onClose} aria-label="Закрыть меню" style={{ zIndex: 9999 }}>
        <img src="/images/m_close.png" alt="Закрыть" />
      </button>
      <ul>
        {items.map((item, index) => (
          <li key={item.href + item.title} className={!item.children && index === items.length - 1 ? 'noseparator m_last' : ''}>
            <div>
              <Link to={item.href} onClick={onClose} {...(CEILING_CATEGORY_SLUGS.includes(slugFromHref(item.href)) ? { 'data-discover': true } : {})}>
                {item.title}
              </Link>
            </div>
            {item.children && item.children.length > 0 && (
              <ul>
                {item.children.map((sub) => (
                  <li key={sub.href}>
                    <div>
                      <Link to={sub.href} onClick={onClose} {...(CEILING_CATEGORY_SLUGS.includes(slugFromHref(sub.href)) ? { 'data-discover': true } : {})}>
                        {sub.title}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
