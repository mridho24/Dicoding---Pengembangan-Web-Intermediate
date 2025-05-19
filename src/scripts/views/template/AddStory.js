const createAddStoryTemplate = ({ isLoading }) => `
  <div class="story-creator">
    <nav class="story-creator__nav">
      <a href="#/" class="story-creator__back">
        <i class="fas fa-arrow-left"></i>
        Back to Home
      </a>
      <h1 class="story-creator__title">
        <i class="fas fa-plus-circle"></i>
        Create New Story
      </h1>
    </nav>

    <div class="story-creator__container">
      <form id="addStoryForm" class="story-creator__form">
        <!-- Story Description -->
        <div class="input-group">
          <label class="input-label" for="description">Story Description</label>
          <textarea 
            id="description" 
            class="story-input" 
            required 
            placeholder="Share your story..."
          ></textarea>
        </div>

        <!-- Media Box -->
        <div class="media-box">
          <div class="media-box__preview">
            <video id="cameraPreview" class="photo-capture__camera" autoplay playsinline></video>
            <canvas id="photoCanvas" class="photo-capture__canvas"></canvas>
            <div id="photoPreview" class="photo-capture__preview"></div>
          </div>

          <div class="media-box__tools">
            <button type="button" id="startCameraButton" class="tool-button">
              <i class="fas fa-camera"></i> Start Camera
            </button>
            <button type="button" id="takePictureButton" class="tool-button" disabled>
              <i class="fas fa-camera-retro"></i> Take Photo
            </button>
            <button type="button" id="switchCameraButton" class="tool-button" disabled>
              <i class="fas fa-sync"></i> Switch Camera
            </button>
            <button type="button" id="resetPhotoButton" class="tool-button" disabled>
              <i class="fas fa-undo"></i> Reset
            </button>
          </div>

          <div class="media-box__upload">
            <label class="upload-zone" for="photoInput">
              <i class="fas fa-cloud-upload-alt"></i>
              <span>Or click to upload a photo</span>
              <input type="file" id="photoInput" accept="image/*">
            </label>
          </div>
        </div>

        <!-- Location Picker -->
        <div class="location-box">
          <div id="locationMap" class="location-box__map"></div>
          <div id="selectedLocation" class="location-box__selected">
            No location selected
          </div>
          <button type="button" id="getUserLocationButton" class="tool-button">
            <i class="fas fa-location-arrow"></i> Use My Location
          </button>
        </div>

        <button 
          type="submit" 
          id="submitButton" 
          class="submit-button"
          ${isLoading ? 'disabled' : ''}
        >
          ${isLoading ? 
            '<i class="fas fa-spinner fa-spin"></i> Posting...' : 
            '<i class="fas fa-paper-plane"></i> Share Story'
          }
        </button>
      </form>
    </div>
  </div>
`;

export default createAddStoryTemplate;
