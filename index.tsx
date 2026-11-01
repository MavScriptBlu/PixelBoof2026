/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {createRoot} from 'react-dom/client'
import App from './src/components/App.jsx'
import './index.css'

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', event => {
    const msg = String(event?.reason?.message || event?.reason || '')
    if (msg.includes('WebSocket closed without opened')) {
      event.preventDefault()
    }
  })
}

createRoot(document.getElementById('root')).render(<App />)
