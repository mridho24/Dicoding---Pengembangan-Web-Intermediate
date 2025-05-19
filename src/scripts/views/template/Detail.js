const createDetailTemplate = ({
  isLoading = false,
  error = null,
  story = null,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return `
        <div class="story-loader">
          <div class="story-loader__spinner"></div>
          <p>Memuat cerita...</p>
        </div>
      `;
  }

  if (error) {
    return `
        <div class="story-error">
          <div class="story-error__content">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Oops! Terjadi Kesalahan</h3>
            <p>${error}</p>
            <button class="story-error__button" id="retryButton">
              <i class="fas fa-sync-alt"></i> Coba Lagi
            </button>
          </div>
        </div>
      `;
  }

  if (!story) {
    return `
        <div class="story-not-found">
          <div class="story-not-found__content">
            <i class="fas fa-folder-open"></i>
            <h3>Cerita Tidak Ditemukan</h3>
            <p>Cerita yang Anda cari tidak tersedia</p>
            <a href="#/" class="story-not-found__button">
              <i class="fas fa-home"></i> Kembali ke Beranda
            </a>
          </div>
        </div>
      `;
  }

  return `
      <div class="story-viewer">
        <nav class="story-viewer__nav">
          <a href="#/" class="story-viewer__back">
            <i class="fas fa-chevron-left"></i>
            <span>Kembali</span>
          </a>
          <div class="story-viewer__actions">
            <button class="story-viewer__save" id="saveStoryButton">
              <i class="fas fa-bookmark"></i>
              <span>Simpan</span>
            </button>
            <button class="story-viewer__cancel" id="cancelSaveButton" style="display: none;">
              <i class="fas fa-times"></i>
              <span>Batal</span>
            </button>
            <button class="story-viewer__remove" id="removeStoryButton" style="display: none;">
              <i class="fas fa-trash"></i>
              <span>Hapus</span>
            </button>
            <button class="story-viewer__share" id="shareButton">
              <i class="fas fa-share-alt"></i>
            </button>
          </div>
        </nav>
  
        <div class="story-viewer__hero">
          <div class="story-viewer__image-wrapper">
            <img 
              src="${story.photoUrl}" 
              alt="Story by ${story.name}"
              class="story-viewer__image"
            />
          </div>
          
          <div class="story-viewer__author">
            <div class="story-viewer__author-pic">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="story-viewer__author-info">
              <h3>${story.name}</h3>
              <time datetime="${story.createdAt}">
                <i class="fas fa-clock"></i> ${formatDate(story.createdAt)}
              </time>
            </div>
          </div>
        </div>
  
        <div class="story-viewer__content">
          <div class="story-viewer__text">
            ${story.description}
          </div>
  
          ${story.lat && story.lon ? `
            <div class="story-viewer__location">
              <div class="story-viewer__location-header">
                <i class="fas fa-map-marked-alt"></i>
                <h4>Lokasi Cerita</h4>
              </div>
              <div id="detailMap" class="story-viewer__map"></div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
};

export default createDetailTemplate;
