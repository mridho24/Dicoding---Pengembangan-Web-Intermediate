import webPushHelper from "../utils/WebPush_Helper.js";
import Swal from "sweetalert2";

class NotificationToggle extends HTMLElement {
    constructor() {
        super();
        this._isSubscribed = false;
        this._isInitialized = false;
        this._isLoading = false;
        this._isSupported = true;

        // Bind methods
        this._handleClick = this._handleClick.bind(this);
    }

    async connectedCallback() {
        this._render();
        await this._initialize();
    }

    disconnectedCallback() {
        this._removeEventListeners();
    }

    async _initialize() {
        // Check browser support first
        this._isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

        if (!this._isSupported) {
            this._isInitialized = true;
            this._render();
            return;
        }

        try {
            this._isLoading = true;
            this._render();

            const initialized = await webPushHelper.init();
            if (!initialized) {
                throw new Error('Push notification initialization failed');
            }

            this._isSubscribed = await webPushHelper.isSubscribed();
            this._isInitialized = true;
        } catch (error) {
            console.error('Notification initialization error:', error);
            this._isSupported = false;
        } finally {
            this._isLoading = false;
            this._render();
        }
    }

    _render() {
        this.innerHTML = this._createButtonHTML();
        this._attachEventListeners();
    }

    _createButtonHTML() {
        // Case 1: Browser tidak support
        if (!this._isSupported) {
            return `
                <button class="notification-toggle disabled" disabled>
                    <i class="fas fa-bell-slash"></i>
                    <span>Notifikasi tidak didukung</span>
                </button>
            `;
        }

        // Case 2: Sedang loading
        if (this._isLoading) {
            return `
                <button class="notification-toggle loading" disabled>
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Memuat...</span>
                </button>
            `;
        }

        // Case 3: Sudah terinisialisasi
        const buttonClass = `notification-toggle ${this._isSubscribed ? "active" : ""}`;
        const icon = this._isSubscribed ? "fa-bell" : "fa-bell-slash";
        const text = this._isSubscribed ? "Nonaktifkan Notifikasi" : "Aktifkan Notifikasi";

        return `
            <button class="${buttonClass}">
                <i class="fas ${icon}"></i>
                <span>${text}</span>
            </button>
        `;
    }

    _attachEventListeners() {
        const button = this.querySelector("button");
        if (button && !button.disabled) {
            button.addEventListener("click", this._handleClick);
        }
    }

    _removeEventListeners() {
        const button = this.querySelector("button");
        if (button) {
            button.removeEventListener("click", this._handleClick);
        }
    }

    async _handleClick() {
        if (!this._isInitialized || this._isLoading) return;

        try {
            this._isLoading = true;
            this._render();

            if (this._isSubscribed) {
                const result = await Swal.fire({
                    title: 'Nonaktifkan Notifikasi?',
                    text: 'Anda tidak akan menerima notifikasi cerita baru.',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#EB4231',
                    cancelButtonColor: '#6B7280',
                    confirmButtonText: 'Ya, nonaktifkan',
                    cancelButtonText: 'Batal'
                });

                if (result.isConfirmed) {
                    await webPushHelper.unsubscribe();
                    this._isSubscribed = false;
                }
            } else {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    await webPushHelper.subscribe();
                    this._isSubscribed = true;
                } else {
                    throw new Error('Izin notifikasi ditolak');
                }
            }
        } catch (error) {
            console.error("Notification toggle error:", error);
            Swal.fire({
                title: "Gagal",
                text: error.message || "Terjadi kesalahan saat mengubah status notifikasi",
                icon: "error",
                confirmButtonColor: '#2563EB',
            });
        } finally {
            this._isLoading = false;
            this._render();
        }
    }
}

customElements.define("notification-toggle", NotificationToggle);
export default NotificationToggle;