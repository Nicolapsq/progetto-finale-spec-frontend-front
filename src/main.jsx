import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './assets/css/tailwind.css'
// import './assets/css/tailwind-shop.css'
import './assets/css/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
