import AddStoryPage from "../views/pages/AddStory-Page.js";
import storyRepository from "../data/StoryRepository.js";
import authRepository from "../data/Authentcation-Rep.js";
import webPushHelper from "../utils/WebPush_Helper.js";
import { applyCustomAnimation } from "../utils/view-transition.js";

class AddStoryPresenter {
  constructor(params = {}) {
    this._params = params;
    this._view = null;
    this._isLoading = false;

    this._handleSubmit = this._handleSubmit.bind(this);
  }

  async init() {
    if (!authRepository.isAuthenticated()) {
      this._view = new AddStoryPage({ container: this._container });
      this._view.showAuthenticationWarning();
      return;
    }

    applyCustomAnimation("#pageContent", {
      name: "add-story-transition",
      duration: 400,
    });

    this._renderView();
  }

  _renderView() {
    const container = document.querySelector("#pageContent"); // akses DOM hanya di sini
    this._view = new AddStoryPage({
      isLoading: this._isLoading,
      container: container,
    });
  
    this._view.render();
    this._view.setSubmitHandler(this._handleSubmit);
  }

  async _handleSubmit(storyData) {
    if (this._isLoading) return;

    this._isLoading = true;
    this._view?.setLoading(true);

    try {
      const isAuthenticated = authRepository.isAuthenticated();
      await storyRepository.addStory(storyData, isAuthenticated);

      this._view?.showSuccessMessage();
      this._triggerPushNotification(storyData.description);
      this._view?.notifySuccess();
    } catch (error) {
      console.error("Failed to submit story:", error);
      this._view?.notifyFailure(error.message || "An error occurred while posting your story");
    } finally {
      this._isLoading = false;
      this._view?.setLoading(false);
    }
  }

  async _triggerPushNotification(description) {
    try {
      if (webPushHelper.isSubscribed()) {
        console.log("Push notification may be sent by the server");
      }
    } catch (error) {
      console.error("Failed to handle push notification:", error);
    }
  }

  cleanup() {
    if (this._view) {
      this._view.cleanup();
    }
  }
}

export default AddStoryPresenter;
