import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { HazriProvider } from './store.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HazriProvider>
      <App />
    </HazriProvider>
  </StrictMode>,
)
