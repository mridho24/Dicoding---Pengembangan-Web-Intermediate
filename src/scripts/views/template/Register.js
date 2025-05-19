const createRegisterTemplate = ({ error = null, isLoading = false }) => {
    const errorComponent = error
      ? `
          <div class="register-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${error}</p>
          </div>
        `
      : "";
  
    return `
      <div class="register-wrapper">
        <div class="register-container">
          <div class="register-brand">
            <div class="register-brand__content">
              <div class="register-brand__icon">
                <i class="fas fa-feather-alt"></i>
              </div>
              <h1>Mulai Perjalananmu</h1>
              <p>Bergabunglah dan bagikan cerita inspiratifmu bersama komunitas kami</p>
            </div>
          </div>
  
          <div class="register-form">
            <div class="register-form__header">
              <h2>Buat Akun Baru</h2>
              ${errorComponent}
            </div>
  
            <form id="registerForm">
              <div class="input-floating">
                <input 
                  type="text" 
                  id="name" 
                  class="input-floating__field" 
                  placeholder=" "
                  required 
                  ${isLoading ? 'disabled' : ''}
                >
                <label for="name" class="input-floating__label">
                  <i class="fas fa-user"></i>
                  Nama Lengkap
                </label>
              </div>
  
              <div class="input-floating">
                <input 
                  type="email" 
                  id="email" 
                  class="input-floating__field" 
                  placeholder=" "
                  required 
                  ${isLoading ? 'disabled' : ''}
                >
                <label for="email" class="input-floating__label">
                  <i class="fas fa-envelope"></i>
                  Alamat Email
                </label>
              </div>
  
              <div class="input-floating">
                <input 
                  type="password" 
                  id="password" 
                  class="input-floating__field" 
                  placeholder=" "
                  required 
                  minlength="8"
                  ${isLoading ? 'disabled' : ''}
                >
                <label for="password" class="input-floating__label">
                  <i class="fas fa-lock"></i>
                  Kata Sandi
                </label>
                <button type="button" class="input-floating__toggle" id="togglePassword">
                  <i class="fas fa-eye"></i>
                </button>
                <span class="input-hint">Minimal 8 karakter</span>
              </div>
  
              <div class="input-floating">
                <input 
                  type="password" 
                  id="confirmPassword" 
                  class="input-floating__field" 
                  placeholder=" "
                  required 
                  minlength="8"
                  ${isLoading ? 'disabled' : ''}
                >
                <label for="confirmPassword" class="input-floating__label">
                  <i class="fas fa-lock"></i>
                  Konfirmasi Kata Sandi
                </label>
                <button type="button" class="input-floating__toggle" id="toggleConfirmPassword">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
  
              <button 
                type="submit" 
                class="register-submit" 
                ${isLoading ? 'disabled' : ''}
              >
                ${isLoading ? `
                  <i class="fas fa-circle-notch fa-spin"></i>
                  <span>Mendaftar...</span>
                ` : `
                  <i class="fas fa-user-plus"></i>
                  <span>Daftar Sekarang</span>
                `}
              </button>
  
              <div class="register-form__footer">
                <p>Sudah punya akun?</p>
                <a href="#/login" class="register-form__link">Masuk di sini</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  };
  
  export default createRegisterTemplate;
  