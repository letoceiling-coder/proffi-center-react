import { Link } from 'react-router-dom';
import { cities } from '../data/mockPageData';

export default function NavMobile({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="nav-mobail">
      <button type="button" className="overlay" id="win2" onClick={onClose} aria-label="Закрыть" />
      <div className="popup">
        <ul>
          {cities.map((c) => (
            <li key={c.slug}>
              <div>
                <Link to={`/${c.slug}`} onClick={onClose}>
                  {c.name}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
