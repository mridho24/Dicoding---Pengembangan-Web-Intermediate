import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "leaflet/dist/leaflet.css";
import "./styles/main.css";

import "./scripts/app.js";
import { registerSW } from "./scripts/utils/Register_Helper.js";

// Initialize the app first
const init = async () => {
    try {
        // Register service worker for both dev and prod
        const swRegistration = await registerSW();

        // Export registration for use in other parts of the app
        window.__SW_REGISTRATION__ = swRegistration;

        // Log successful initialization
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize the application:', error);
    }
};

// Start initialization
init();
