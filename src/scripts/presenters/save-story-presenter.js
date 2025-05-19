import SavedStoriesPage from "../views/pages/save-story.js";
import { applyCustomAnimation } from "../utils/view-transition.js";

class SaveStoryPresenter {
    constructor(params = {}) {
        this._container = params.container;
        this._view = null;
    }

    async init() {
        await applyCustomAnimation("#pageContent", {
            name: "fade-in",
            duration: 400,
        });

        this._view = new SavedStoriesPage({
            container: this._container
        });

        await this._view.init();
    }

    cleanup() {
        if (this._view) {
            this._view.cleanup();
        }
    }
}

export default SaveStoryPresenter; 