import { useState, useEffect } from 'react'

/**
 * Hook PWA mejorado:
 * - Captura beforeinstallprompt
 * - Si no está disponible, el botón igual aparece y muestra instrucciones
 * - Detecta si ya está instalada (standalone mode)
 * - Monitorea conexión y service worker
 */
export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall]         = useState(false)
  const [isInstalled, setIsInstalled]       = useState(false)
  const [isOnline, setIsOnline]             = useState(navigator.onLine)
  const [swStatus, setSwStatus]             = useState('idle')

  useEffect(() => {
    // ── Detectar modo standalone (ya instalada) ──
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches
      const iosStandalone = window.navigator.standalone === true
      setIsInstalled(standalone || iosStandalone)
    }
    checkInstalled()

    const mq = window.matchMedia('(display-mode: standalone)')
    mq.addEventListener('change', checkInstalled)

    // ── Capturar prompt de instalación ──
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    // ── Conectividad ──
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    // ── Service Worker ──
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => setSwStatus('registered'))
        .catch(() => setSwStatus('error'))
    }

    return () => {
      mq.removeEventListener('change', checkInstalled)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return { outcome: 'not-available' }
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (choice.outcome === 'accepted') setCanInstall(false)
    return choice
  }

  return { canInstall, isInstalled, isOnline, swStatus, promptInstall }
}
