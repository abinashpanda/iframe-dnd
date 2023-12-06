import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import App from './app'
import { ToastProvider } from './components/ui/toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
