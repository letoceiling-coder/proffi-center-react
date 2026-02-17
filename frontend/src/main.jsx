import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { SiteProvider } from './context/SiteContext.jsx'
import { MenuProvider } from './context/MenuContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <SiteProvider>
        <MenuProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </MenuProvider>
      </SiteProvider>
    </HelmetProvider>
  </StrictMode>,
)
