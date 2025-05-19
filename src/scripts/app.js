import "./views/components/AppBar.js";
import Router from "./routes/routes.js";
import Database from "./data/database.js";

class App {
    constructor() {
        this._initSkipLink();
        this._initDatabase();
    }

    _initSkipLink() {
        const skipLink = document.querySelector('.skip-to-content');
        const mainContent = document.getElementById('mainContent');

        if (skipLink && mainContent) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    async _initDatabase() {
        try {
            // Initialize database by calling getAllReports
            await Database.getAllReports();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const appBarContainer = document.getElementById("appBar");
    const appBar = document.createElement("app-bar");
    appBarContainer.appendChild(appBar);

    const router = new Router();
    router.init();
});
