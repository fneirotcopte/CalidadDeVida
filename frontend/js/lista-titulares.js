import { checkAuth, infoUsuario } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userData = checkAuth();
  if (!userData) return window.location.href = 'login.html';
  infoUsuario(userData);

  document.querySelector('.logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  let titulares = [];
  let totalRegistros = 0;
  const porPagina = 10;
  let paginaActual = 1;

  async function fetchTitulares(pagina = 1, filtros = {}) {
    const params = new URLSearchParams({ pagina, porPagina, ...(filtros.tipo && { tipo: filtros.tipo }), ...(filtros.busqueda && { busqueda: filtros.busqueda }) });
    try {
      const resp = await fetch(`/api/titulares-unificados?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return await resp.json();
    } catch (err) {
      console.error(err);
      return { data: [], total: 0 };
    }
  }

  function render() {
    const cuerpo = document.getElementById('cuerpo-tabla');
    cuerpo.innerHTML = '';
    titulares.forEach(t => {
      const fila = document.createElement('tr');
      // Si es razon_social, mostrar nombre y razon_social separados; si es ambulante, razon_social vacío
      let nombre = t.nombre || '';
      let razonSocial = '';
      if (t.tipo === 'razon_social') {
        razonSocial = t.razon_social_nombre || '';
        // Si el nombre está incluido en razon_social_nombre, intentar separar
        if (!nombre && razonSocial) {
          // Si el backend trae todo en razon_social_nombre, intentar separar por convención (opcional)
          // nombre = razonSocial; razonSocial = '';
        }
      }
      let nombreCompleto = (t.nombre || '') + (t.apellido ? ' ' + t.apellido : '');
      fila.innerHTML = `
        <td>${t.tipo === 'razon_social' ? 'Razón Social' : t.tipo === 'transporte' ? 'Transporte' : 'Ambulante'}</td>
        <td>${nombreCompleto}</td>
        <td>${t.tipo === 'razon_social' ? razonSocial : ''}</td>
        <td>${t.domicilio || ''}</td>
        <td>${t.correo_electronico || t.email || ''}</td>
        <td>${t.dni || ''}</td>
        <td>${t.telefono || ''}</td>
      `;
      cuerpo.appendChild(fila);
    });

    document.querySelectorAll('.btn-ver').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tipo = e.currentTarget.getAttribute('data-tipo');
        const id = e.currentTarget.getAttribute('data-id');
        // Redirigir a la página de detalle correspondiente (utiliza la existente de comercio o una nueva)
        if (tipo === 'ambulante') {
          // No hay página específica; redirigimos a la lista de comercios filtrada por titular ambulante
          window.location.href = `lista-comercios.html?titular_ambulante=${id}`;
        } else {
          // Para razon_social redirigimos a la lista de comercios filtrada por razon social
          window.location.href = `lista-comercios.html?razon_social=${id}`;
        }
      });
    });

    const totalPaginas = Math.ceil(totalRegistros / porPagina) || 1;
    document.getElementById('info-pagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('btn-anterior').disabled = paginaActual <= 1;
    document.getElementById('btn-siguiente').disabled = paginaActual >= totalPaginas;
  }

  async function aplicarFiltros() {
    const filtros = {
      tipo: document.getElementById('filtro-tipo').value,
      busqueda: document.getElementById('filtro-busqueda').value
    };
    const resp = await fetchTitulares(1, filtros);
    titulares = resp.data;
    totalRegistros = resp.total;
    paginaActual = 1;
    render();
  }

  document.getElementById('btn-buscar').addEventListener('click', aplicarFiltros);
  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('filtro-tipo').value = 'todos';
    document.getElementById('filtro-busqueda').value = '';
    aplicarFiltros();
  });

  document.getElementById('btn-anterior').addEventListener('click', async () => {
    if (paginaActual > 1) {
      paginaActual--;
      const filtros = { tipo: document.getElementById('filtro-tipo').value, busqueda: document.getElementById('filtro-busqueda').value };
      const resp = await fetchTitulares(paginaActual, filtros);
      titulares = resp.data; totalRegistros = resp.total; render();
    }
  });

  document.getElementById('btn-siguiente').addEventListener('click', async () => {
    const totalPaginas = Math.ceil(totalRegistros / porPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      const filtros = { tipo: document.getElementById('filtro-tipo').value, busqueda: document.getElementById('filtro-busqueda').value };
      const resp = await fetchTitulares(paginaActual, filtros);
      titulares = resp.data; totalRegistros = resp.total; render();
    }
  });

  // Inicializar
  const inicial = await fetchTitulares();
  titulares = inicial.data; totalRegistros = inicial.total; render();
});
