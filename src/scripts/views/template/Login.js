const createLoginTemplate = ({ error = null, isLoading = false }) => {
  const errorComponent = error
    ? `
          <div class="login-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${error}</p>
          </div>
        `
    : "";

  return `
      <div class="login-wrapper">
        <div class="login-container">
          <div class="login-welcome">
            <div class="login-welcome__content">
              <i class="fas fa-feather-alt login-welcome__icon"></i>
              <h1>Selamat Datang Kembali!</h1>
              <p>Bagikan momen istimewamu dalam sebuah cerita yang menginspirasi</p>
            </div>
          </div>
  
          <div class="login-form">
            <div class="login-form__header">
              <h2>Masuk ke Akunmu</h2>
              ${errorComponent}
            </div>
  
            <form id="loginForm">
              <div class="floating-input">
                <input 
                  type="email" 
                  id="email" 
                  class="floating-input__field" 
                  placeholder=" "
                  required 
                  ${isLoading ? 'disabled' : ''}
                >
                <label for="email" class="floating-input__label">
                  <i class="fas fa-envelope"></i>
                  Alamat Email
                </label>
              </div>
  
              <div class="floating-input">
                <input 
                  type="password" 
                  id="password" 
                  class="floating-input__field" 
                  placeholder=" "
                  required 
                  minlength="8"
                  ${isLoading ? 'disabled' : ''}
                >
                <label for="password" class="floating-input__label">
                  <i class="fas fa-lock"></i>
                  Kata Sandi
                </label>
                <button type="button" class="floating-input__toggle" id="togglePassword">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
  
              <button 
                type="submit" 
                id="loginButton"
                class="login-submit" 
                ${isLoading ? 'disabled' : ''}
              >
                ${isLoading ? `
                  <i class="fas fa-circle-notch fa-spin"></i>
                  <span>Memproses...</span>
                ` : `
                  <i class="fas fa-sign-in-alt"></i>
                  <span>Masuk Sekarang</span>
                `}
              </button>
  
              <div class="login-form__footer">
                <p>Belum punya akun?</p>
                <a href="#/register" class="login-form__link">Daftar di sini</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
};

export default createLoginTemplate;
