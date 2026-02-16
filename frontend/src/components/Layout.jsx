import { Outlet, Link } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <Link to="/" className="layout-brand">React Proffi</Link>
          <nav className="layout-nav">
            <Link to="/">Главная</Link>
          </nav>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <div className="layout-footer-inner">
          &copy; {new Date().getFullYear()} React Proffi. API v1.
        </div>
      </footer>
    </div>
  )
}
