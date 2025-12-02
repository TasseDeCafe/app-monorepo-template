import ReactDOM from 'react-dom/client'
import { logWithSentry } from './analytics/sentry/log-with-sentry'
import { App } from './app'
import './index.css'
import { useTrackingStore } from './stores/tracking-store'

window.addEventListener('vite:preloadError', (event: VitePreloadErrorEvent) => {
  // https://vite.dev/guide/build#load-error-handling
  // This event listener is needed to fix dynamic import errors caused by clients not having the latest version of the frontend as described in this ticket:
  // https://www.notion.so/grammarians/TypeError-Failed-to-fetch-dynamically-imported-module-122168e7b01a809f9230dc584daefc11?pvs=4
  logWithSentry(`vite:preloadError: ${event.payload.message}`, 'debug')
  window.location.reload()
})

// Initialize tracking params from URL (localStorage values are automatically loaded by Zustand persist)
useTrackingStore.getState().initializeFromUrl()

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element #root not found in DOM')
}

ReactDOM.createRoot(container).render(<App />)
