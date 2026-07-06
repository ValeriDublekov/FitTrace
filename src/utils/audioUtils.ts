import { NotificationSound } from '../types';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

/**
 * Play a notification sound based on type.
 * If type is a filename, it tries to play /sounds/filename.mp3
 * Otherwise it plays a synthesized fallback sound.
 */
export const playNotificationSound = async (type: string = 'default') => {
  try {
    // If it's a specific file from the folder, try playing it
    if (type !== 'default' && type !== 'beep') {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const audio = new Audio(`${cleanBaseUrl}sounds/${type}`);
      await audio.play();
      return;
    }

    // Fallback synthesized sound (refined "modern" style)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.01);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.08);
    gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    
    oscillator.frequency.setValueAtTime(1500, audioCtx.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    console.warn('Audio feedback failed', e);
  }
};
