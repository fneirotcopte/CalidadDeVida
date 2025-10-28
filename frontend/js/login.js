document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const viewContainer = document.getElementById('viewContainer');
  const loginView = document.getElementById('loginView');
  const errorView = document.getElementById('errorView');
  const accountLockedView = document.getElementById('accountLockedView');

  // Formularios
  const loginForm = document.getElementById('loginForm');

  // Botones y enlaces
  const loginBtn = document.getElementById('loginBtn');
  const tryAgainLink = document.getElementById('tryAgainLink');
  const tryDifferentAccountLink = document.getElementById('tryDifferentAccountLink');
  const useDifferentAccountLink = document.getElementById('useDifferentAccountLink');
  const passwordToggle = document.getElementById('passwordToggle');

  // Campos de entrada
  const usuarioInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');
  const accountLockedMessage = document.getElementById('accountLockedMessage');
  const lockedEmailElement = document.getElementById('lockedEmail');
  const countdownElement = document.getElementById('countdown');
  const attemptsWarning = document.getElementById('attemptsWarning');

  // Constantes de seguridad
  const MAX_ATTEMPTS_PER_ACCOUNT = 5;
  const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos
  let countdownInterval = null;

  // Mostrar vista
  function showView(view) {
    loginView.classList.add('hidden');
    errorView.classList.add('hidden');
    accountLockedView.classList.add('hidden');
    view.classList.remove('hidden');
    
    // Enfocar el primer campo de entrada cuando sea relevante
    if (view === loginView) {
      setTimeout(() => {
        if (!usuarioInput.value) {
          usuarioInput.focus();
        } else {
          passwordInput.focus();
        }
      }, 100);
    }
  }

  // Formatear tiempo en minutos y segundos
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Obtener clave para almacenamiento por cuenta
  function getAccountStorageKey(email) {
    return `loginAttempts_${email.toLowerCase()}`;
  }

  function getAccountLockoutKey(email) {
    return `accountLockedUntil_${email.toLowerCase()}`;
  }

  // Verificar si una cuenta está bloqueada
  function isAccountLocked(email) {
    const lockoutUntil = localStorage.getItem(getAccountLockoutKey(email));
    return lockoutUntil && Date.now() < parseInt(lockoutUntil);
  }

  // Obtener tiempo restante de bloqueo
  function getRemainingLockoutTime(email) {
    const lockoutUntil = localStorage.getItem(getAccountLockoutKey(email));
    if (!lockoutUntil) return 0;
    return Math.max(0, parseInt(lockoutUntil) - Date.now());
  }

  // Manejar intento fallido por cuenta específica
  function handleFailedAttempt(email) {
    const storageKey = getAccountStorageKey(email);
    let attempts = parseInt(localStorage.getItem(storageKey)) || 0;
    attempts++;
    localStorage.setItem(storageKey, attempts.toString());
    
    // Actualizar advertencia de intentos
    updateAttemptsWarning(email, attempts);
    
    // Bloquear cuenta si excede el límite
    if (attempts >= MAX_ATTEMPTS_PER_ACCOUNT) {
      const lockoutUntil = Date.now() + LOCKOUT_TIME;
      localStorage.setItem(getAccountLockoutKey(email), lockoutUntil.toString());
      showAccountLockedView(email);
    }
  }

  // Reiniciar contador de intentos para cuenta específica
  function resetFailedAttempts(email) {
    localStorage.removeItem(getAccountStorageKey(email));
    updateAttemptsWarning(email, 0);
  }

  // Actualizar advertencia de intentos
  function updateAttemptsWarning(email, attempts) {
    const currentEmail = usuarioInput.value.trim().toLowerCase();
    if (email.toLowerCase() === currentEmail && attempts > 0 && attempts < MAX_ATTEMPTS_PER_ACCOUNT) {
      const remainingAttempts = MAX_ATTEMPTS_PER_ACCOUNT - attempts;
      attemptsWarning.textContent = `⚠️ ${attempts} intento(s) fallido(s). ${remainingAttempts} intento(s) restante(s).`;
      attemptsWarning.style.display = 'block';
    } else if (attempts === 0) {
      attemptsWarning.style.display = 'none';
    }
  }

  // Mostrar vista de cuenta bloqueada
  function showAccountLockedView(email) {
    const remainingTime = getRemainingLockoutTime(email);
    lockedEmailElement.textContent = email;
    startCountdown(remainingTime);
    showView(accountLockedView);
  }

  // Iniciar contador
  function startCountdown(remainingTimeMs) {
    let timeLeft = Math.ceil(remainingTimeMs / 1000);
    
    // Actualizar inmediatamente
    updateCountdownDisplay(timeLeft);
    
    // Limpiar intervalo anterior si existe
    clearCountdown();
    
    countdownInterval = setInterval(() => {
      timeLeft--;
      updateCountdownDisplay(timeLeft);
      
      if (timeLeft <= 0) {
        clearCountdown();
        // El usuario puede volver manualmente
      }
    }, 1000);
  }

  // Actualizar display del contador
  function updateCountdownDisplay(seconds) {
    if (countdownElement) {
      countdownElement.textContent = formatTime(seconds);
    }
  }

  // Limpiar contador
  function clearCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  // Mostrar/ocultar contraseña
  passwordToggle.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = passwordToggle.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    passwordToggle.setAttribute('aria-label', type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
  });

  // Evento para el formulario de login
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const correo = usuarioInput.value.trim();
    const pass = passwordInput.value;

    // Validaciones básicas
    if (!correo || !pass) {
      showError('Por favor complete todos los campos requeridos.');
      return;
    }

    // Verificar si la cuenta está bloqueada
    if (isAccountLocked(correo)) {
      showAccountLockedView(correo);
      return;
    }

    // Mostrar estado de carga
    setLoadingState(loginBtn, true);
    loginView.classList.add('loading');

    // Llamada al API
    fetch(window.location.origin + '/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        correo_electronico: correo,
        contraseña: pass
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          handleFailedAttempt(correo);
          
          if (err.error && err.error.includes('inactivo')) {
            showError('Usuario inactivo. Contacte al administrador del sistema.');
          } else {
            showError('Las credenciales ingresadas no son válidas. Verifique su usuario y contraseña.');
          }
          throw err;
        });
      }
      return response.json();
    })
    .then(data => {
      // Reiniciar contador de intentos para esta cuenta en éxito
      resetFailedAttempts(correo);
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/pages/panel-principal.html";
      }
    })
    .catch(error => {
      console.error('Error al intentar loguear:', error);
      setLoadingState(loginBtn, false);
      loginView.classList.remove('loading');
    });
  });

  // Función para mostrar errores
  function showError(message) {
    errorMessage.textContent = message;
    showView(errorView);
    setLoadingState(loginBtn, false);
    loginView.classList.remove('loading');
  }

  // Función para establecer estado de carga
  function setLoadingState(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
      btnText.classList.add('hidden');
      btnLoader.classList.remove('hidden');
      button.disabled = true;
      button.setAttribute('aria-label', 'Verificando credenciales...');
    } else {
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
      button.disabled = false;
      button.removeAttribute('aria-label');
    }
  }

  // Eventos de navegación
  tryAgainLink.addEventListener('click', function(e) {
    e.preventDefault();
    showView(loginView);
    passwordInput.value = '';
    passwordInput.focus();
    loginView.classList.remove('loading');
  });

  tryDifferentAccountLink.addEventListener('click', function(e) {
    e.preventDefault();
    showView(loginView);
    usuarioInput.value = '';
    passwordInput.value = '';
    attemptsWarning.style.display = 'none';
    usuarioInput.focus();
    loginView.classList.remove('loading');
  });

  useDifferentAccountLink.addEventListener('click', function(e) {
    e.preventDefault();
    showView(loginView);
    usuarioInput.value = '';
    passwordInput.value = '';
    attemptsWarning.style.display = 'none';
    usuarioInput.focus();
    loginView.classList.remove('loading');
  });

  // Eventos de teclado para mejor accesibilidad
  passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loginForm.requestSubmit();
    }
  });

  usuarioInput.addEventListener('input', function() {
    const email = usuarioInput.value.trim();
    if (email) {
      const attempts = parseInt(localStorage.getItem(getAccountStorageKey(email))) || 0;
      updateAttemptsWarning(email, attempts);
    } else {
      attemptsWarning.style.display = 'none';
    }
  });

  // Cargar estado inicial
  function initialize() {
    usuarioInput.focus();
    
    // Limpiar el contador al cargar la página
    clearCountdown();
  }

  // Inicializar
  initialize();

  // Limpiar el contador al cerrar la página
  window.addEventListener('beforeunload', function() {
    clearCountdown();
  });
});