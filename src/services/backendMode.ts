/**
 * Управление на активния източник на данни (v1 Firebase vs v2 .NET API)
 */

export type BackendMode = 'firebase' | 'dotnet';

const STORAGE_KEY = 'fittrace_backend_mode';

export function getBackendMode(): BackendMode {
  if (typeof window === 'undefined') return 'firebase';
  const saved = localStorage.getItem(STORAGE_KEY);
  return (saved === 'dotnet' || saved === 'firebase') ? saved : 'firebase';
}

export function setBackendMode(mode: BackendMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent('fittrace_backend_mode_change', { detail: mode }));
}

export function subscribeBackendMode(callback: (mode: BackendMode) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<BackendMode>;
    callback(customEvent.detail);
  };
  window.addEventListener('fittrace_backend_mode_change', handler);
  return () => window.removeEventListener('fittrace_backend_mode_change', handler);
}
