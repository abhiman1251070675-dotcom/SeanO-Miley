import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import './styles/global.css'
import App from './App'
import BlenderApp from './BlenderApp'

function Root() {
  const [mode, setMode] = useState(() => new URLSearchParams(window.location.search).get('mode'))

  useEffect(() => {
    const handleLocationChange = () => {
      setMode(new URLSearchParams(window.location.search).get('mode'))
    }
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('pushstate', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('pushstate', handleLocationChange)
    }
  }, [])

  return mode === 'blender' ? <BlenderApp /> : <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
