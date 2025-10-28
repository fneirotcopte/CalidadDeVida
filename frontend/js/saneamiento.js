document.addEventListener('DOMContentLoaded', function() {
  const datosUsuario = JSON.parse(localStorage.getItem('token'));

  if (!datosUsuario) {
    window.location.href = "login.html";
  } else {
    document.querySelector('.user-info img').src = datosUsuario.imagen || "../img/empleado.png";
    document.querySelector('.user-info h3').textContent = datosUsuario.nombre || "Usuario";
    document.querySelector('.user-info p').textContent = datosUsuario.rol || "Rol no definido";

    document.querySelector('.logout-btn').addEventListener('click', function() {
      localStorage.removeItem('token');
      window.location.href = "login.html";
    });
  }
});