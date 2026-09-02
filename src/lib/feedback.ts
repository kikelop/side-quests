type ToastListener = (message: string) => void;
const toastListeners = new Set<ToastListener>();

export function toast(message: string) {
  toastListeners.forEach((l) => l(message));
}

export function onToast(listener: ToastListener) {
  toastListeners.add(listener);
  return () => void toastListeners.delete(listener);
}

export function buzz(ms = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {}
  }
}
