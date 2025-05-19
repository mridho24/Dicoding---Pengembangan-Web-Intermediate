import createDetailTemplate from "../template/Detail.js";
import MapHelper from "../../utils/Map_Helper.js";
import Database from "../../data/database.js";
import Swal from "sweetalert2";

class DetailPage {
  constructor({ story = null, isLoading = false, error = null, container }) {
    this._story = story;
    this._isLoading = isLoading;
    this._error = error;
    this._container = container;
    this._mapHelper = new MapHelper();
    this._mapInitialized = false;

    // Bind methods
    this._initSaveButton = this._initSaveButton.bind(this);
    this._handleSaveClick = this._handleSaveClick.bind(this);
    this._handleCancelClick = this._handleCancelClick.bind(this);
    this._handleRemoveClick = this._handleRemoveClick.bind(this);
  }

  render() {
    this._container.innerHTML = createDetailTemplate({
      isLoading: this._isLoading,
      error: this._error,
      story: this._story,
    });

    if (this._story && !this._isLoading && !this._error) {
      this._initMap();
      this._initSaveButton();
    }

    if (this._error) {
      this._attachRetryHandler();
    }
  }

  _initMap() {
    const { lat, lon } = this._story;

    if (!lat || !lon || isNaN(lat) || isNaN(lon) || this._mapInitialized) {
      return;
    }

    const mapContainer = document.getElementById("detailMap");
    if (!mapContainer) {
      return;
    }

    const map = this._mapHelper.initMap(mapContainer, {
      center: [lat, lon],
      zoom: 15,
    });

    const marker = L.marker([lat, lon]).addTo(map);
    marker
      .bindPopup(
        `
      <div class="map-popup">
        <strong>${this._story.name}</strong>
        <p>Posted this story from here</p>
      </div>
    `
      )
      .openPopup();

    this._mapInitialized = true;
  }

  _attachRetryHandler() {
    const retryButton = document.getElementById("retryButton");
    if (retryButton && this._retryHandler) {
      retryButton.addEventListener("click", this._retryHandler);
    }
  }

  /**
   * Set retry handler function
   * @param {Function} handler - Retry handler function
   */
  setRetryHandler(handler) {
    this._retryHandler = handler;

    if (this._error) {
      this._attachRetryHandler();
    }
  }

  async _initSaveButton() {
    if (!this._story) return;

    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");

    if (!saveButton || !cancelButton || !removeButton) return;

    try {
      const isSaved = await Database.isStorySaved(this._story.id);
      this._updateSaveButtonState(saveButton, cancelButton, removeButton, isSaved);

      saveButton.addEventListener("click", this._handleSaveClick);
      cancelButton.addEventListener("click", this._handleCancelClick);
      removeButton.addEventListener("click", this._handleRemoveClick);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  }

  async _handleSaveClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");

    if (!saveButton || !cancelButton || !removeButton) return;

    // Show cancel button first
    saveButton.style.display = "none";
    cancelButton.style.display = "block";

    try {
      const result = await Swal.fire({
        title: "Simpan Cerita",
        text: "Apakah Anda ingin menyimpan cerita ini?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, simpan!",
        cancelButtonText: "Batal"
      });

      if (result.isConfirmed) {
        await Database.saveStory(this._story);
        this._updateSaveButtonState(saveButton, cancelButton, removeButton, true);

        await Swal.fire({
          title: "Tersimpan!",
          text: "Cerita berhasil disimpan",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        this._updateSaveButtonState(saveButton, cancelButton, removeButton, false);
      }
    } catch (error) {
      console.error("Error saving story:", error);
      await Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error"
      });
      this._updateSaveButtonState(saveButton, cancelButton, removeButton, false);
    }
  }

  _handleCancelClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");

    if (!saveButton || !cancelButton || !removeButton) return;

    this._updateSaveButtonState(saveButton, cancelButton, removeButton, false);
  }

  async _handleRemoveClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");

    if (!saveButton || !cancelButton || !removeButton) return;

    try {
      const result = await Swal.fire({
        title: "Hapus Cerita",
        text: "Apakah Anda yakin ingin menghapus cerita ini dari daftar tersimpan?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal"
      });

      if (result.isConfirmed) {
        await Database.removeReport(this._story.id);
        this._updateSaveButtonState(saveButton, cancelButton, removeButton, false);

        await Swal.fire({
          title: "Terhapus!",
          text: "Cerita berhasil dihapus dari daftar tersimpan",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error removing story:", error);
      await Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error"
      });
    }
  }

  _updateSaveButtonState(saveButton, cancelButton, removeButton, isSaved) {
    if (!saveButton || !cancelButton || !removeButton) return;

    if (isSaved) {
      saveButton.style.display = "none";
      cancelButton.style.display = "none";
      removeButton.style.display = "block";
    } else {
      saveButton.style.display = "block";
      cancelButton.style.display = "none";
      removeButton.style.display = "none";
    }
  }

  cleanup() {
    if (this._mapInitialized && this._mapHelper) {
      this._mapHelper.clearMarkers();
    }

    // Remove event listeners
    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");

    if (saveButton) saveButton.removeEventListener("click", this._handleSaveClick);
    if (cancelButton) cancelButton.removeEventListener("click", this._handleCancelClick);
    if (removeButton) removeButton.removeEventListener("click", this._handleRemoveClick);
  }
}

export default DetailPage;
