import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { SongsProvider } from './context/SongsContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <SongsProvider>
        <App />
      </SongsProvider>
    </HashRouter>
  </StrictMode>,
)
