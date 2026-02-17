import { Link } from 'react-router-dom';
import { CEILING_CATEGORY_SLUGS } from '../data/ceilingCategoriesData';

const slugFromHref = (href) => (href || '').replace(/^\//, '');
const isExternal = (href) => (href || '').startsWith('http') || (href || '').startsWith('//');

function MenuLink({ item, onClose }) {
  const ext = isExternal(item.href);
  const linkProps = {
    onClick: onClose,
    ...(item.open_new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    ...(CEILING_CATEGORY_SLUGS.includes(slugFromHref(item.href)) ? { 'data-discover': true } : {}),
  };
  if (ext) {
    return <a href={item.href} {...linkProps}>{item.title}</a>;
  }
  return <Link to={item.href} {...linkProps}>{item.title}</Link>;
}

export default function Menu({ items = [], onClose, isOpen }) {
  return (
    <div id="menunav" className={`menu clearfix ${isOpen ? 'show' : ''}`}>
      <button type="button" id="m_close" className="m_close" onClick={onClose} aria-label="Закрыть меню" style={{ zIndex: 9999 }}>
        <img src="/images/m_close.png" alt="Закрыть" />
      </button>
      <ul>
        {items.map((item, index) => (
          <li key={item.href + (item.title || '')} className={!item.children && index === items.length - 1 ? 'noseparator m_last' : ''}>
            <div>
              <MenuLink item={item} onClose={onClose} />
            </div>
            {item.children && item.children.length > 0 && (
              <ul>
                {item.children.map((sub) => (
                  <li key={sub.href + (sub.title || '')}>
                    <div>
                      <MenuLink item={sub} onClose={onClose} />
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
