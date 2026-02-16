import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PopupPozdr from '../components/PopupPozdr';
import PreLoader from '../components/PreLoader';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import CategoryTabs from '../components/gotovye/CategoryTabs';
import ProductCard from '../components/gotovye/ProductCard';
import Pagination from '../components/gotovye/Pagination';
import {
  gotovyeCategories,
  gotovyeProductsMock,
  buildPagination,
} from '../data/gotovyePotolkiData';
import { footerMenuData, footerData } from '../data/mockPageData';

const BASE_PATH = '/gotovye-potolki';
const PER_PAGE = 6;

export default function GotovyePotolkiPage() {
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const { categorySlug, page: pageParam } = useParams();
  const location = useLocation();
  const pathname = location.pathname;

  // Страница: из /gotovye-potolki/list/2 → 2, иначе 1
  const currentPage = pathname.match(/\/list\/(\d+)$/)?.[1]
    ? parseInt(pathname.match(/\/list\/(\d+)$/)[1], 10)
    : 1;

  // Категория: если в URL есть segment после basePath и это не "list" — это categorySlug
  const segment = pathname.replace(BASE_PATH, '').replace(/^\/|\/list\/\d+$/g, '').split('/')[0];
  const activeCategory = segment && segment !== 'list' ? segment : '';

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);

  const filtered = activeCategory
    ? gotovyeProductsMock.filter((p) => p.categorySlug === activeCategory)
    : gotovyeProductsMock;
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.max(1, Math.min(currentPage, lastPage));
  const start = (page - 1) * PER_PAGE;
  const items = filtered.slice(start, start + PER_PAGE);

  const pathForPagination = activeCategory ? `${BASE_PATH}/${activeCategory}` : BASE_PATH;
  const pagination = buildPagination({
    current_page: page,
    last_page: lastPage,
    path: pathForPagination,
  });

  return (
    <PreLoader>
      <div className="toptop" />
      <Header onCallClick={openCallback} onZamerClick={openCallback} />

      <NavMobile isOpen={navMobileOpen} onClose={() => setNavMobileOpen(false)} />

      {(popupCallback || popupSpasibo) && (
        <div
          className="hide-layout"
          id="hide-layout"
          style={{ display: 'block', zIndex: 10000 }}
          onClick={() => { closeCallback(); setPopupSpasibo(false); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && (closeCallback(), setPopupSpasibo(false))}
          aria-label="Закрыть"
        />
      )}
      {popupPozdr && (
        <div
          className="hide-layout"
          id="hide-layout_pozdr"
          style={{ display: 'block', zIndex: 10000 }}
          onClick={() => setPopupPozdr(false)}
          role="button"
          tabIndex={0}
          aria-label="Закрыть"
        />
      )}

      <PopupCallback isOpen={popupCallback} onClose={closeCallback} onSuccess={onCallbackSuccess} />
      <PopupSpasibo isOpen={popupSpasibo} onClose={() => setPopupSpasibo(false)} />
      <PopupPozdr isOpen={popupPozdr} onClose={() => setPopupPozdr(false)} onSuccess={onCallbackSuccess} />

      <div className="probel" />

      <section className="s_market">
        <div className="container">
          <h1>Готовые натяжные потолки</h1>
          <p className="s_market_desc">
            В каталоге представлены готовые натяжные потолки с фиксированными размерами и ценами. Выберите категорию и оформите заказ.
          </p>
          <CategoryTabs categories={gotovyeCategories} basePath={BASE_PATH} />
          <div className="row">
            {items.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination pagination={pagination} />
        </div>
      </section>

      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
