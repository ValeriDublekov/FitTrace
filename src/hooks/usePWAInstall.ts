import { useState, useEffect } from 'react';

/**
 * Custom hook to handle PWA installation logic.
 * Captures the 'beforeinstallprompt' event and provides a function to trigger the prompt.
 */
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: any) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Track installation success
    const installedHandler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
      setIsInstallable(false);
      setInstallPrompt(null);
    } else {
      console.log('User dismissed the PWA install prompt');
    }
  };

  return {
    isInstallable,
    isInstalled,
    handleInstallClick,
  };
}
