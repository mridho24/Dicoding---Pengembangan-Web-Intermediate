import createAddStoryTemplate from "../template/AddStory.js";
import MapHelper from "../../utils/Map_Helper.js";
import CameraHelper from "../../utils/Camera_Helper.js";
import Swal from "sweetalert2";

class AddStoryPage {
  constructor({ isLoading = false, container }) {
    this._isLoading = isLoading;
    this._container = container;
    this._mapHelper = new MapHelper();
    this._cameraHelper = new CameraHelper();
    this._selectedLocation = null;
    this._photoFile = null;
    this._isCameraActive = false;
    this._submitHandler = null;

    // Bind methods
    this._initCamera = this._initCamera.bind(this);
    this._stopCamera = this._stopCamera.bind(this);
    this._takePhoto = this._takePhoto.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._switchCamera = this._switchCamera.bind(this);
    this._onLocationSelected = this._onLocationSelected.bind(this);
    this._getUserLocation = this._getUserLocation.bind(this);
    this._resetPhoto = this._resetPhoto.bind(this);
  }

  render() {
    this._container.innerHTML = createAddStoryTemplate({
      isLoading: this._isLoading,
    });

    // Set focus to main content after render
    const mainContent = this._container.querySelector('#mainContent');
    if (mainContent) {
        mainContent.focus();
    }

    this._initMap();
    this._attachEventListeners();
  }

  _initMap() {
    const mapContainer = this._container.querySelector('#locationMap');
    if (!mapContainer) {
      return;
    }

    const map = this._mapHelper.initMap(mapContainer);

    this._mapHelper.setupLocationSelector(this._onLocationSelected);
  }

  _attachEventListeners() {
    // Camera controls
    const cameraPreview = this._container.querySelector('#camera-preview');
    const photoCanvas = this._container.querySelector('#photo-canvas');
    const captureButton = this._container.querySelector('#capture-button');

    if (cameraPreview && photoCanvas) {
      // Initialize camera when component mounts
      this._initCamera();
    }

    if (captureButton) {
      captureButton.addEventListener("click", this._takePhoto);
    }

    // Form submission
    const form = this._container.querySelector('#addStoryForm');
    if (form) {
      form.addEventListener("submit", this._handleSubmit);
    }

    const startCameraButton = this._container.querySelector('#startCameraButton');
    const takePictureButton = this._container.querySelector('#takePictureButton')
    const switchCameraButton = this._container.querySelector('#switchCameraButton')
    const resetPhotoButton = this._container.querySelector('#resetPhotoButton')

    if (startCameraButton) {
      startCameraButton.addEventListener("click", this._initCamera);
    }

    if (takePictureButton) {
      takePictureButton.addEventListener("click", this._takePhoto);
    }

    if (switchCameraButton) {
      switchCameraButton.addEventListener("click", this._switchCamera);
    }

    if (resetPhotoButton) {
      resetPhotoButton.addEventListener("click", this._resetPhoto);
    }

    const getUserLocationButton = this._container.querySelector(
      '#getUserLocationButton'
    );
    if (getUserLocationButton) {
      getUserLocationButton.addEventListener("click", this._getUserLocation);
    }

    const photoInput = this._container.querySelector('#photoInput');
    if (photoInput) {
      photoInput.addEventListener("change", this._handleFileInput.bind(this));
    }
  }

  async _initCamera() {
    if (this._isCameraActive) {
      return;
    }

    try {
      const videoElement = this._container.querySelector('#cameraPreview');
      if (!videoElement) {
        return;
      }

      await this._cameraHelper.initCamera(videoElement);

      this._isCameraActive = true;
      this._updateCameraUI(true);

      this._showVideoPreview();
    } catch (error) {
      console.error("Failed to initialize camera:", error);
      alert(`Could not access camera: ${error.message}`);
    }
  }

  _stopCamera() {
    if (!this._isCameraActive) {
      return;
    }

    this._cameraHelper.stopCamera();
    this._isCameraActive = false;
    this._updateCameraUI(false);
  }

  async _takePhoto() {
    if (!this._isCameraActive) {
      return;
    }

    try {
      const canvasElement = this._container.querySelector('#photoCanvas');
      if (!canvasElement) {
        return;
      }

      this._cameraHelper.takePhoto(canvasElement);

      this._photoFile = await this._cameraHelper.getPhotoFile();

      this._showPhotoPreview();

      this._updatePhotoUI(true);

      this._stopCamera();
    } catch (error) {
      console.error("Failed to take photo:", error);
      alert(`Could not take photo: ${error.message}`);
    }
  }

  async _switchCamera() {
    if (!this._isCameraActive) {
      return;
    }

    try {
      await this._cameraHelper.switchCamera();
    } catch (error) {
      console.error("Failed to switch camera:", error);
      alert(`Could not switch camera: ${error.message}`);
    }
  }

  /**
   * Handle location selection from map
   * @param {Object} location - { lat, lon } coordinates
   */
  _onLocationSelected(location) {
    this._selectedLocation = location;
    this._updateLocationUI();
  }

  async _getUserLocation() {
    try {
      const location = await this._mapHelper.getUserLocation();
      this._selectedLocation = location;
      this._updateLocationUI();
    } catch (error) {
      console.error("Failed to get user location:", error);
      alert(`Could not get your location: ${error.message}`);
    }
  }

  _resetPhoto() {
    const photoPreview = this._container.querySelector('#photoPreview');
    if (photoPreview) {
      photoPreview.style.backgroundImage = "none";
    }

    const canvas = this._container.querySelector('#photoCanvas');
    if (canvas) {
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    this._photoFile = null;

    const fileInput = this._container.querySelector('#photoInput')
    if (fileInput) {
      fileInput.value = "";
    }

    this._updatePhotoUI(false);
  }

  /**
   * Handle file selection from input
   * @param {Event} event - Change event
   */
  _handleFileInput(event) {
    const file = event.target.files[0];
    if (!file) return;
  
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      event.target.value = "";
      return;
    }
  
    this._photoFile = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const photoPreview = this._container.querySelector('#photoPreview');
      const videoElement = this._container.querySelector('#cameraPreview');
      const canvas = this._container.querySelector('#photoCanvas');
      
      if (photoPreview) {
        // Hide video and canvas
        if (videoElement) videoElement.style.display = 'none';
        if (canvas) canvas.style.display = 'none';
        
        // Show preview with uploaded image
        photoPreview.style.display = 'block';
        photoPreview.style.backgroundImage = `url(${e.target.result})`;
        this._updatePhotoUI(true);
      }
    };
    
    reader.readAsDataURL(file);
  }

  /**
   * Validate form before submission
   * @returns {boolean} Whether form is valid
   */
  _validateForm() {
    const description = this._container.querySelector('#description');
    if (!description || !description.value.trim()) {
      alert("Please enter a description for your story");
      return false;
    }

    if (!this._photoFile) {
      alert("Please take or upload a photo for your story");
      return false;
    }

    return true;
  }

  /**
   * Get form data for submission
   * @returns {Object} Form data
   */
  _getFormData() {
    const description = this._container.querySelector('#description').value.trim();

    const formData = {
      description,
      photo: this._photoFile,
    };

    if (this._selectedLocation) {
      formData.lat = this._selectedLocation.lat;
      formData.lon = this._selectedLocation.lon;
    }

    return formData;
  }

  async _handleSubmit(event) {
    event.preventDefault();
    
    if (!this._validateForm()) return;

    const formData = this._getFormData();
    
    if (typeof this._submitHandler === "function") {
      this._submitHandler(formData);
    }
  }

  _showVideoPreview() {
    const videoElement = this._container.querySelector('#cameraPreview');
    const photoPreview = this._container.querySelector('#photoPreview');
    const canvas = this._container.querySelector('#photoCanvas');

    if (videoElement && photoPreview && canvas) {
      videoElement.style.display = "block";
      photoPreview.style.display = "none";
      canvas.style.display = "none";
    }
  }

  _showPhotoPreview() {
    const videoElement = this._container.querySelector('#cameraPreview');
    const photoPreview = this._container.querySelector('#photoPreview');
    const canvas = this._container.querySelector('#photoCanvas');

    if (videoElement && photoPreview && canvas) {
      videoElement.style.display = "none";
      photoPreview.style.display = "block";

      const photoUrl = canvas.toDataURL("image/jpeg");
      photoPreview.style.backgroundImage = `url(${photoUrl})`;
    }
  }

  /**
   * Update camera UI based on active state
   * @param {boolean} isActive - Whether camera is active
   */
  _updateCameraUI(isActive) {
    const startCameraButton = this._container.querySelector('#startCameraButton');
    const takePictureButton = this._container.querySelector('#takePictureButton');
    const switchCameraButton = this._container.querySelector('#switchCameraButton');

    if (startCameraButton && takePictureButton && switchCameraButton) {
      startCameraButton.disabled = isActive;
      takePictureButton.disabled = !isActive;
      switchCameraButton.disabled = !isActive;
    }
  }

  /**
   * Update photo UI based on whether photo is taken
   * @param {boolean} hasPhoto - Whether photo is taken
   */
  _updatePhotoUI(hasPhoto) {
    const resetPhotoButton = this._container.querySelector('#resetPhotoButton');
    const startCameraButton = this._container.querySelector('#startCameraButton');

    if (resetPhotoButton && startCameraButton) {
      resetPhotoButton.disabled = !hasPhoto;
      startCameraButton.disabled = hasPhoto;
    }
  }

  _updateLocationUI() {
    const selectedLocationElement = this._container.querySelector('#selectedLocation');

    if (!selectedLocationElement) {
      return;
    }

    if (this._selectedLocation) {
      const { lat, lon } = this._selectedLocation;
      selectedLocationElement.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Location selected: <br>
        <strong>Latitude:</strong> ${lat.toFixed(6)}, 
        <strong>Longitude:</strong> ${lon.toFixed(6)}
      `;
      selectedLocationElement.classList.add(
        "location-picker__selected--active"
      );
    } else {
      selectedLocationElement.textContent = "No location selected";
      selectedLocationElement.classList.remove(
        "location-picker__selected--active"
      );
    }
  }

  showSuccessMessage() {
    const formElement = this._container.querySelector('#addStoryForm');
    if (!formElement) return;

    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <p>Your story has been posted successfully!</p>
      <p>Redirecting to home page...</p>
    `;

    formElement.innerHTML = "";
    formElement.appendChild(successMessage);
    
    // Clear form data
    this._resetPhoto();
    this._selectedLocation = null;
    this._updateLocationUI();
    
    // Reset form elements
    const description = this._container.querySelector('#description');
    if (description) description.value = "";
}

  /**
   * Set form submission handler
   * @param {Function} handler - Submission handler
   */
  setSubmitHandler(handler) {
    if (typeof handler === "function") {
      this._submitHandler = handler;
    }
  }

  showAuthenticationWarning() {
    Swal.fire({
      title: "Authentication Required",
      text: "Please login to add a new story",
      icon: "warning",
      confirmButtonColor: "#EB4231",
    }).then(() => {
      window.location.hash = "#/login";
    });
  }
  
  notifySuccess() {
    Swal.fire({
      title: "Story Posted!",
      text: "Your story has been successfully shared",
      icon: "success",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  
    setTimeout(() => {
      window.location.hash = "#/";
      window.location.reload();
    }, 1500);
  }
  
  notifyFailure(message) {
    Swal.fire({
      title: "Failed to Post Story",
      text: message,
      icon: "error",
      confirmButtonColor: "#EB4231",
    });
  }

  /**
   * Set loading state during submission
   * @param {boolean} isLoading - Whether form is submitting
   */
  setLoading(isLoading) {
    this._isLoading = isLoading;

    const submitButton = this._container.querySelector('#submitButton');
    if (submitButton) {
      submitButton.disabled = isLoading;
      submitButton.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Posting...'
        : '<i class="fas fa-paper-plane"></i> Post Story';
    }

    const formElements = this._container.querySelectorAll(
      "button, input, textarea"
    );
    formElements.forEach((el) => {
      if (
        el.id !== "takePictureButton" &&
        el.id !== "switchCameraButton" &&
        el.id !== "resetPhotoButton"
      ) {
        el.disabled = isLoading;
      }
    });
  }

  cleanup() {
    this._stopCamera();
    if (this._mapHelper) {
      this._mapHelper.cleanup();
    }
  }
}

export default AddStoryPage;
