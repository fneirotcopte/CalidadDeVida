import { checkAuth, infoUsuario } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userData = checkAuth();
  if (!userData) return;
  infoUsuario(userData);

  document.querySelector('.logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    window.location.href = 'lista-comercios.html';
    return;
  }

  // Traer detalle para decidir si requiere VT
  try {
    const res = await fetch(`/api/comercios/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      const data = await res.json();
      const rubro = (data.rubro || '').toLowerCase();
      if (rubro.includes('bar')) {
        document.getElementById('campo-vt').style.display = 'block';
      }
    }
  } catch {}

  document.getElementById('btn-cancelar').addEventListener('click', () => {
    window.history.back();
  });

  const form = document.getElementById('form-renovacion');
  const alerta = document.getElementById('alerta');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alerta.textContent = '';
    const formData = new FormData(form);

    try {
      const resp = await fetch(`/api/comercios/${id}/renovar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await resp.json();
      if (!resp.ok) {
        alerta.style.color = 'crimson';
        alerta.textContent = data.error || 'No se pudo renovar.';
        if (data.faltantes) {
          alerta.textContent += ` Faltantes: ${data.faltantes.join(', ')}`;
        }
        return;
      }
      alerta.style.color = 'green';
      alerta.textContent = 'Renovación realizada correctamente.';
    } catch (err) {
      alerta.style.color = 'crimson';
      alerta.textContent = 'Error de red.';
    }
  });
});


