import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import RedirectCheck from './components/RedirectCheck'
import MainPage from './pages/MainPage'
import GotovyePotolkiPage from './pages/GotovyePotolkiPage'
import KalkuljatorPage from './pages/KalkuljatorPage'
import SkidkiPage from './pages/SkidkiPage'
import AktsiyaPage from './pages/AktsiyaPage'
import OtzyvyPage from './pages/OtzyvyPage'
import GdeZakazatPage from './pages/GdeZakazatPage'
import DogovorPage from './pages/DogovorPage'
import PotolkiVRassrochkuPage from './pages/PotolkiVRassrochkuPage'
import VozvratPage from './pages/VozvratPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CeilingCategoryPage from './pages/CeilingCategoryPage'
import RoomPage from './pages/RoomPage'
import ApiPageBySlugPage from './pages/ApiPageBySlugPage'
import ApiServicePage from './pages/ApiServicePage'
import ApiProductCategoryPage from './pages/ApiProductCategoryPage'
import ApiProductPage from './pages/ApiProductPage'
import OKompaniiPage from './pages/OKompaniiPage'
import CitySelectPopup from './components/CitySelectPopup'
import './App.css'

function RouteTransition({ children }) {
  const location = useLocation()
  const pathname = location.pathname
  const key = pathname.startsWith('/gotovye-potolki')
    ? '/gotovye-potolki'
    : pathname
  return (
    <div key={key} className="route-transition">
      {children}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CitySelectPopup />
      <ScrollToTop />
      <RedirectCheck>
        <RouteTransition>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/gotovye-potolki/list/:page" element={<GotovyePotolkiPage />} />
            <Route path="/gotovye-potolki/:categorySlug" element={<GotovyePotolkiPage />} />
            <Route path="/gotovye-potolki" element={<GotovyePotolkiPage />} />
            <Route path="/natjazhnye-potolki-kalkuljator" element={<KalkuljatorPage />} />
            <Route path="/skidki-na-potolki" element={<SkidkiPage />} />
            <Route path="/aktsiya" element={<AktsiyaPage />} />
            <Route path="/o-kompanii" element={<OKompaniiPage />} />
            <Route path="/natyazhnyye-potolki-otzyvy" element={<OtzyvyPage />} />
            <Route path="/gde-zakazat-potolki" element={<GdeZakazatPage />} />
            <Route path="/dogovor" element={<DogovorPage />} />
            <Route path="/potolki-v-rassrochku" element={<PotolkiVRassrochkuPage />} />
            <Route path="/vozvrat" element={<VozvratPage />} />
            <Route path="/uslugi/:slug" element={<ApiServicePage />} />
            <Route path="/catalog" element={<ApiProductCategoryPage slugOverride="catalog" />} />
            <Route path="/catalog/:productSlug" element={<ApiProductPage />} />
            <Route path="/catalog/:catSlug/:productSlug" element={<ApiProductPage />} />
            <Route path="/product/:productSlug" element={<ProductDetailPage />} />
            <Route path="/potolki-v-prihozhuju" element={<RoomPage />} />
            <Route path="/potolki-v-gostinuju" element={<RoomPage />} />
            <Route path="/potolki-v-spalnju" element={<RoomPage />} />
            <Route path="/potolki-na-kuhnju" element={<RoomPage />} />
            <Route path="/potolki-v-detskuju" element={<RoomPage />} />
            <Route path="/potolki-v-vannuju" element={<RoomPage />} />
            <Route path="/:slug" element={<ApiPageBySlugPage />} />
            <Route path="/:ceilingCategorySlug" element={<CeilingCategoryPage />} />
          </Routes>
        </RouteTransition>
      </RedirectCheck>
    </BrowserRouter>
  )
}

export default App
