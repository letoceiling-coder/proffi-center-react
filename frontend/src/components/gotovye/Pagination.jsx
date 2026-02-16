import { Link } from 'react-router-dom';

/**
 * Пагинация в формате Laravel: links[] с url, label, active.
 * url может быть null для отключённой кнопки (например next на последней странице).
 */
export default function Pagination({ pagination }) {
  if (!pagination?.links?.length) return null;

  return (
    <div className="pagenation">
      <div className="pagenation">
        {pagination.links.map((link, i) => {
          if (link.label === 'next') {
            if (link.url == null) return null;
            return (
              <Link key="next" className="p_link" to={link.url}>next</Link>
            );
          }
          if (link.active) {
            return <span key={i} className="current_link">{link.label}</span>;
          }
          return (
            <Link key={i} className="p_link" to={link.url}>{link.label}</Link>
          );
        })}
      </div>
    </div>
  );
}
