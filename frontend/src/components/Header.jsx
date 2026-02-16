import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Menu from './Menu';
import { siteConfig, cities, menuItems } from '../data/mockPageData';

const SCROLL_THRESHOLD_ON = 120;
const SCROLL_THRESHOLD_OFF = 70;
const MOBILE_BREAKPOINT = 992;

export default function Header({ onCallClick, onZamerClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [popUpFixed, setPopUpFixed] = useState(false);
  const rafRef = useRef(null);
  const lastFixedRef = useRef(false);

  useEffect(() => {
    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    const handler = () => {
      if (!isMobile()) return;
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const y = window.scrollY;
        let next = lastFixedRef.current;
        if (next) {
          if (y <= SCROLL_THRESHOLD_OFF) next = false;
        } else {
          if (y >= SCROLL_THRESHOLD_ON) next = true;
        }
        if (next !== lastFixedRef.current) {
          lastFixedRef.current = next;
          setPopUpFixed(next);
        }
      });
    };

    const onResize = () => {
      if (!isMobile()) {
        lastFixedRef.current = false;
        setPopUpFixed(false);
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.classList.add('menu-open');
    else document.body.classList.remove('menu-open');
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  useEffect(() => {
    const setNewblockHeight = () => {
      const h = window.innerHeight - 100;
      document.querySelectorAll('.newblock').forEach((el) => {
        el.style.height = `${h}px`;
      });
    };
    setNewblockHeight();
    window.addEventListener('resize', setNewblockHeight);
    window.addEventListener('load', setNewblockHeight);
    return () => {
      window.removeEventListener('resize', setNewblockHeight);
      window.removeEventListener('load', setNewblockHeight);
    };
  }, []);

  const handleCallClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onCallClick?.();
  };

  return (
    <>
      <div className={`section s_top ${popUpFixed ? 'pop_up_block fixed' : ''}`}>
        <div className="container" itemScope itemType="http://schema.org/PostalAddress">
          <meta itemProp="addressLocality" content={siteConfig.address.locality} />
          <meta itemProp="streetAddress" content={siteConfig.address.street} />
          <meta itemProp="postalCode" content={siteConfig.address.postalCode} />
          <div className="row">
            <div className="col-sm-12 clearfix padding0">
              <div className="col-sm-6 col-md-4 col-xs-6 logo">
                <Link to="/">
                  <img itemProp="image" src={siteConfig.logo} alt={siteConfig.logoAlt} />
                </Link>
              </div>
              <div className="col-sm-6 col-md-8 col-xs-6">
                <div className="row">
                  <div className="col-lg-3 hidden-md hidden-sm hidden-xs">
                    <div
                      className="moscow"
                      data-town={siteConfig.city}
                      style={{
                        background: "rgba(0,0,0,0) url('/images/m_gerb.png') no-repeat scroll left top",
                      }}
                    >
                      {siteConfig.city}&nbsp;&#9660;
                      <br />
                      <span className="under">- - - - - - - - - -</span>
                      <div className="newblock">
                        <ul>
                          {cities.map((c) => (
                            <li key={c.slug}>
                              <div>
                                <a href={c.href}>{c.name}</a>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rasprod_moscow">{siteConfig.citySuffix}</div>
                    </div>
                  </div>
                  <div className="col-lg-3 hidden-md hidden-sm hidden-xs">
                    <div className="rasprod">
                      <Link to={siteConfig.promo.href}>{siteConfig.promo.title}</Link>
                      <br />
                      <Link to="/skidki-na-potolki" className="rasprod_comment">
                        {siteConfig.promo.comment}
                      </Link>
                    </div>
                  </div>
                  <div className="hidden-sm col-md-12 col-lg-6 hidden-xs">
                    <div className="tel">
                      <p>
                        <a className="comagic_phone" itemProp="telephone" href={`tel:${siteConfig.phone.replace(/\s/g, '')}`} style={{ textDecoration: 'none' }}>
                          {siteConfig.phone}
                        </a>
                      </p>
                      <button type="button" className="call" onClick={handleCallClick}>
                        Вам перезвонить?
                      </button>
                    </div>
                  </div>
                  <div className="col-sm-12 hidden-md hidden-lg col-xs-12">
                    <div className="mmenu" onClick={() => setMenuOpen(true)} role="button" tabIndex={0}>
                      Меню
                      <img src="/images/mmenu.png" alt="" />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12 col-sm-12 col-xs-12 padding0">
                    <Menu items={menuItems} onClose={() => setMenuOpen(false)} isOpen={menuOpen} />
                  </div>
                </div>
              </div>
              <div className="clearfix" />
              <div className="b_line">
                <div className="menu_place clearfix">
                  <div className="tel">
                    <a className="comagic_phone" href={`tel:${siteConfig.phone.replace(/\s/g, '')}`} style={{ textDecoration: 'none' }}>
                      {siteConfig.phone}
                    </a>
                  </div>
                  <button type="button" className="call" onClick={handleCallClick}>
                    Вам перезвонить?
                  </button>
                  <div className="trubka">
                    <a href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}>
                      <img src="/images/trubka.png" alt="" />
                    </a>
                  </div>
                  <div className="clearfix" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
