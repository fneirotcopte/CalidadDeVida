
export function getToken() {
  return localStorage.getItem('token');
}

// Cerrar sesión
export function logout(redirectURL = '/pages/login.html') {
  localStorage.removeItem('token');
  localStorage.removeItem('rolUsuario');
  localStorage.removeItem('nombreUsuario');
  window.location.href = redirectURL;
}

export function parseaToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Token inválido:', e);
    return null;
  }
}

export function checkAuth() {
  const token = getToken();
  if (!token) {
    logout();
    return null;
  }

  const userData = parseaToken(token);
  if (!userData) {
    logout();
    return null;
  }

  return userData;
}

export function infoUsuario(userData) {
  const userInfoElements = {
    img: document.querySelector('.user-info img'),
    name: document.querySelector('.user-info h3'),
    role: document.querySelector('.user-info p')
  };

  if (userData.nombre) userInfoElements.name.textContent = userData.nombre;
  if (userData.rol) userInfoElements.role.textContent = userData.rol;
  // if (userData.imagen) userInfoElements.img.src = userData.imagen; 
}

export function checkUserRole(requiredRole) {
  const token = getToken();
  if (!token) return false;
  
  const userData = parseaToken(token);
  if (!userData || !userData.rol) return false;

  // Jerarquía de roles: admin > empleado > inspector
  const roleHierarchy = {
    'admin': 3,
    'empleado': 2,
    'inspector': 1
  };

  return roleHierarchy[userData.rol] >= roleHierarchy[requiredRole];
}