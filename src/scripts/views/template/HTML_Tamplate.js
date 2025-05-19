const createCameraTemplate = () => `
  <div class="camera-container">
    <video id="camera-preview" autoplay playsinline></video>
    <canvas id="photo-canvas"></canvas>
    <div class="camera-controls">
      <button id="capture-button">Take Photo</button>
    </div>
  </div>
`;

export default createCameraTemplate;