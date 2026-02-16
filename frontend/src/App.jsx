import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import MainPage from './pages/MainPage'
import GotovyePotolkiPage from './pages/GotovyePotolkiPage'
import KalkuljatorPage from './pages/KalkuljatorPage'
import SkidkiPage from './pages/SkidkiPage'
import AktsiyaPage from './pages/AktsiyaPage'
import OKompaniiPage from './pages/OKompaniiPage'
import OtzyvyPage from './pages/OtzyvyPage'
import GdeZakazatPage from './pages/GdeZakazatPage'
import DogovorPage from './pages/DogovorPage'
import PotolkiVRassrochkuPage from './pages/PotolkiVRassrochkuPage'
import VozvratPage from './pages/VozvratPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CeilingCategoryPage from './pages/CeilingCategoryPage'
import './App.css'

function RouteTransition({ children }) {
  const location = useLocation()
  return (
    <div key={location.pathname} className="route-transition">
      {children}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
          <Route path="/product/:productSlug" element={<ProductDetailPage />} />
          <Route path="/:ceilingCategorySlug" element={<CeilingCategoryPage />} />
        </Routes>
      </RouteTransition>
    </BrowserRouter>
  )
}

export default App
