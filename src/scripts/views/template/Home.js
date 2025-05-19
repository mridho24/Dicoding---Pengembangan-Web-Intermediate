const createHomeTemplate = ({
    isLoading = false,
    error = null,
    stories = [],
  }) => {
    if (isLoading) {
      return `
        <section class="home">
          <h2 class="home__title">Cerita Terbaru</h2>
          
          <div class="loading-indicator">
            <div class="loading-spinner"></div>
            <p>Memuat cerita...</p>
          </div>
        </section>
      `;
    }
  
    if (error) {
      return `
        <section class="home">
          <h2 class="home__title">Cerita Terbaru</h2>
          
          <div class="error-container">
            <i class="fas fa-exclamation-circle error-icon"></i>
            <p class="error-message">${error}</p>
            <button class="button" id="retryButton">
              <i class="fas fa-redo"></i> Coba Lagi
            </button>
          </div>
        </section>
      `;
    }
  
    const mapTemplate = `
      <div class="map-container">
        <h3 class="map-title">
          <i class="fas fa-map-marked-alt"></i>
          Lokasi Cerita
        </h3>
        <div id="storyMap" class="story-map"></div>
      </div>
    `;
  
    const welcomeTemplate = `
      <div class="welcome-section">
        <div class="welcome-card">
          <span class="welcome-badge">For You</span>
          
          <h1 class="welcome-heading">Cerita Kita</h1>
          <p class="welcome-tagline">Tempat di mana setiap kata bermakna, setiap kisah berharga</p>
          
          <div class="welcome-features">
            <div class="feature">
              <i class="fas fa-pen-nib"></i>
              <span>Tulis Ceritamu</span>
            </div>
            <div class="feature">
              <i class="fas fa-heart"></i>
              <span>Bagikan Inspirasi</span>
            </div>
          </div>
    
          <div class="welcome-actions">
            <a href="#/login" class="action-btn action-btn--primary">
              <i class="fas fa-door-open"></i>
              <span>Masuk Sekarang</span>
            </a>
            <a href="#/register" class="action-btn action-btn--secondary">
              <i class="fas fa-user-plus"></i>
              <span>Bergabung</span>
            </a>
          </div>
        </div>
      </div>
    `;
  
    const emptyTemplate = `
      <div class="empty-stories">
        <div class="story-prompt">
          <div class="prompt-circle">
            <i class="fas fa-pencil-alt"></i>
          </div>
          <h2 class="prompt-title">Mulai Petualangan Menulis</h2>
          <p class="prompt-text">Setiap kisah unik, seperti dirimu. Bagikan ceritamu hari ini.</p>
          <a href="#/add" class="prompt-button">
            <span>Tulis Cerita Pertamamu</span>
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;
  
    const storiesTitle = stories.length > 0 ? `
      <div class="home__header">
        <h2 class="home__title">Cerita Terbaru</h2>
        <a href="#/add" class="button">
          <i class="fas fa-plus-circle"></i> Tambah Cerita
        </a>
      </div>
    ` : '';
  
    const storiesTemplate = stories.length > 0 
      ? `<div class="stories-list" id="storiesList"></div>`
      : emptyTemplate;
  
    return `
      <section class="home">
        ${stories.length === 0 ? welcomeTemplate : ''}
        
        ${stories.some(story => story.lat && story.lon) ? mapTemplate : ''}
        
        <div class="home__content">
          ${storiesTitle}
          ${storiesTemplate}
        </div>
      </section>
    `;
  };
  
  export default createHomeTemplate;