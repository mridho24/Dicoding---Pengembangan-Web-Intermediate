import CameraHelper from '../utils/Camera_Helper.js';

class CameraComponent {
  constructor() {
    this.cameraHelper = new CameraHelper();
    
    // Coba dapatkan elemen dengan querySelector
    this.videoElement = document.querySelector('#camera-preview');
    this.canvasElement = document.querySelector('#photo-canvas');
    this.captureButton = document.querySelector('#capture-button');
    
    // Log untuk debugging
    console.log('CameraComponent initialized');
    console.log('Video element:', this.videoElement);
    console.log('Canvas element:', this.canvasElement);
    console.log('Capture button:', this.captureButton);
    
    // Cek apakah elemen ditemukan
    if (!this.videoElement) {
      console.error('Video element not found! Using fallback method...');
      // Coba metode alternatif, sering diperlukan saat DOM belum sepenuhnya load
      setTimeout(() => {
        this.videoElement = document.querySelector('#camera-preview');
        console.log('Retried video element:', this.videoElement);
        if (this.videoElement) this.initializeCamera();
      }, 500);
    }
    
    if (!this.canvasElement) {
      console.error('Canvas element not found!');
    }
    
    if (!this.captureButton) {
      console.error('Capture button not found!');
    }
    
    // Cache untuk photo blob
    this.photoBlob = null;

    // Initially hide canvas if it exists
    if (this.canvasElement) {
      this.canvasElement.style.display = 'none';
      // Tambahkan border untuk memudahkan debugging visual
      this.canvasElement.style.border = '2px solid red';
    }
    
    // Inisialisasi jika elemen sudah ditemukan
    if (this.videoElement) {
      this.initializeCamera();
    }
    
    if (this.captureButton) {
      this.setupEventListeners();
    }
  }

  async initializeCamera() {
    try {
      console.log('Initializing camera...');
      await this.cameraHelper.initCamera(this.videoElement);
      this.videoElement.style.display = 'block';
      console.log('Camera initialized successfully');
    } catch (error) {
      console.error('Failed to initialize camera:', error);
    }
  }

  setupEventListeners() {
    console.log('Setting up event listeners');
    
    this.captureButton.addEventListener('click', async () => {
      try {
        console.log('Capture button clicked');
        
        if (!this.canvasElement) {
          console.error('Canvas element not found when trying to capture!');
          return;
        }

        if (this.captureButton.textContent === 'Retake Photo') {
          // Reset to camera mode
          console.log('Switching back to camera mode');
          this.videoElement.style.display = 'block';
          this.canvasElement.style.display = 'none';
          this.captureButton.textContent = 'Take Photo';
          return;
        }

        // Hide video preview
        console.log('Hiding video preview');
        this.videoElement.style.display = 'none';
        
        // Take photo and ensure canvas is visible
        console.log('Taking photo...');
        this.photoBlob = await this.cameraHelper.takePhoto(this.canvasElement);
        
        // Explicitly make canvas visible with !important style
        console.log('Making canvas visible');
        this.canvasElement.style.display = 'block';
        this.canvasElement.classList.add('visible');
        
        // Verifikasi canvas dimensions
        console.log('Canvas dimensions:', this.canvasElement.width, 'x', this.canvasElement.height);
        
        // Update capture button
        this.captureButton.textContent = 'Retake Photo';
        
        // Tambahkan delay untuk memastikan canvas dirender
        setTimeout(() => {
          // Cek apakah canvas masih ditampilkan
          const displayStyle = window.getComputedStyle(this.canvasElement).display;
          console.log('Canvas display style after delay:', displayStyle);
          
          if (displayStyle === 'none') {
            console.warn('Canvas is still hidden! Forcing display...');
            this.canvasElement.style.cssText = 'display: block !important; border: 3px solid blue;';
          }
        }, 100);
        
        console.log('Photo captured and displayed on canvas');
      } catch (error) {
        console.error('Failed to capture photo:', error);
      }
    });
  }

  getPhotoFile(filename = 'photo.jpg') {
    if (!this.photoBlob) {
      console.error('No photo has been taken yet!');
      return null;
    }
    return this.cameraHelper.getPhotoFile(filename);
  }

  cleanup() {
    console.log('Cleaning up camera resources');
    this.cameraHelper.stopCamera();
  }
}

export default CameraComponent;