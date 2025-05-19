import { registerSW as registerVitePWA } from "virtual:pwa-register";
import Swal from "sweetalert2";

export const registerSW = () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported in this browser');
    return;
  }

  const updateSW = registerVitePWA({
    immediate: false,
    onNeedRefresh() {
      Swal.fire({
        title: "Update tersedia!",
        text: "Aplikasi telah diperbarui. Refresh untuk melihat versi terbaru.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#2563EB",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Refresh",
        cancelButtonText: "Nanti",
      }).then((result) => {
        if (result.isConfirmed) {
          updateSW(true);
        }
      });
    },
    onOfflineReady() {
      Swal.fire({
        title: "Aplikasi siap offline!",
        text: "Anda dapat menggunakan aplikasi ini tanpa koneksi internet.",
        icon: "success",
        confirmButtonColor: "#2563EB",
        confirmButtonText: "OK",
      });
    },
    onRegistered(registration) {
      console.log('Service worker registered:', registration);

      if (!navigator.serviceWorker.controller) {
        registration.addEventListener('activate', () => {
          registration.claim();
        });
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration failed:', error);
      Swal.fire({
        title: "Error",
        text: "Gagal mendaftarkan service worker. Beberapa fitur mungkin tidak tersedia.",
        icon: "error",
        confirmButtonColor: "#2563EB",
      });
    }
  });

  // Handle service worker updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker controller changed');
  });

  // Handle service worker errors
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('Failed to register a ServiceWorker')) {
      console.error('Service Worker registration failed:', event.reason);
      Swal.fire({
        title: "Error",
        text: "Gagal mendaftarkan service worker. Beberapa fitur mungkin tidak tersedia.",
        icon: "error",
        confirmButtonColor: "#2563EB",
      });
    }
  });

  return updateSW;
};
