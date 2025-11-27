import { checkAuth, infoUsuario } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticación
  const userData = checkAuth();
  if (!userData) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar información del usuario
  infoUsuario(userData);

  // Configurar logout
  document.querySelector('.logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  // Variables de estado
  let transportes = [];
  let totalRegistros = 0;
  const registrosPorPagina = 10;
  let paginaActual = 1;

  // Mapeo de vehículos a alimentos
  const vehiculoAlimentos = {
    "Camioneta": ["Panaderia", "Embutidos", "Farmacia", "Carniceria"],
    "Camión modelo 350 o similar": ["Congelados", "Bebidas", "Artículos varios"],
    "Camión chasis o furgón grande": ["Helados", "No perecederos", "Sodas"],
    "Vehículos superiores": []
  };

  function determinarEstado(fechaVencimiento) {
  if (!fechaVencimiento) return "sin-datos";

  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diffTime = vencimiento - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "vencido";        // ⚠ Ya venció
  if (diffDays <= 10) return "proximo-10";   // ⏳ 10 días o menos
  return "vigente";                          // ✔ Más de 10 días
}

  // Función para formatear fecha
  function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  // Función para obtener la clase CSS según el estado
  function obtenerClaseEstado(estado) {
    switch (estado) {
      case "vigente": return "estado-vigente";
      case "proximo-10": return "estado-proximo-10";
      case "vencido": return "estado-vencido";
      default: return "";
    }
  }

  // Función para obtener la clase CSS para la fila según el estado
  function obtenerClaseFila(estado) {
    switch (estado) {
      case "vigente": return "fila-vigente";
      case "proximo-10": return "fila-proximo-10";
      case "vencido": return "fila-vencido";
      default: return "";
    }
  }

  // Función para obtener la clase CSS para la columna de vencimiento
  function obtenerClaseVencimiento(estado) {
    switch (estado) {
      case "vigente": return "vencimiento-vigente";
      case "proximo-10": return "vencimiento-proximo";
      case "vencido": return "vencimiento-vencido";
      default: return "";
    }
  }

  // Función para obtener texto descriptivo del estado
 function obtenerTextoEstado(estado) {
  switch (estado) {
    case "vigente": return "Vigente";
    case "proximo-10": return "Por vencer";  // 👈 AGREGAR ESTA LÍNEA
    case "vencido": return "Vencido";
    default: return "Sin datos";
  }
}

  // Actualizar alimentos al cambiar tipo de vehículo
  document.getElementById('filtro-tipo-vehiculo').addEventListener('change', (e) => {
    const vehiculoSeleccionado = e.target.value;
    const alimentoSelect = document.getElementById('filtro-alimento');

    // Limpiar opciones anteriores
    alimentoSelect.innerHTML = '<option value="">Todos</option>';

    // Cargar alimentos correspondientes
    const alimentos = vehiculoAlimentos[vehiculoSeleccionado] || [];
    alimentos.forEach(alimento => {
      const opcion = document.createElement('option');
      opcion.value = alimento;
      opcion.textContent = alimento;
      alimentoSelect.appendChild(opcion);
    });
  });

  // Cargar transportes desde la API
  async function fetchTransportes(pagina = 1, filtros = {}) {
    const { estado, id_transporte, vehiculo, patente, titular } = filtros;

    const params = new URLSearchParams({
      pagina,
      porPagina: registrosPorPagina,
      ...(estado && { estado }),
      ...(id_transporte && { id_transporte }),
      ...(vehiculo && { tipo_vehiculo: vehiculo }),
      ...(patente && { patente }),
      ...(titular && { titular })
    });

    try {
      const response = await fetch(`/api/transportes?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return { data: [], total: 0 };
    }
  }

  // Renderizar tabla
  function renderizarTabla() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '';

    transportes.forEach(transporte => {
      const estado = determinarEstado(transporte.fecha_vencimiento);
      const claseFila = obtenerClaseFila(estado);
      const claseEstado = obtenerClaseEstado(estado);
      const claseVencimiento = obtenerClaseVencimiento(estado);
      const textoEstado = obtenerTextoEstado(estado);
      const fechaFormateada = formatearFecha(transporte.fecha_vencimiento);

      //console.log(transporte);
      const fila = document.createElement('tr');
      if (claseFila) fila.classList.add(claseFila);

      fila.innerHTML = `
      <td>${transporte.titular_dni || '-'}</td>
      <td>${transporte.titular_nombre || '-'}</td>
      <td>${transporte.tipo_vehiculo || '-'}</td>
      <td>${transporte.tipo_alimento || '-'}</td>
      <td class="columna-vencimiento ${claseVencimiento}">${fechaFormateada}</td>
      <td><span class="${claseEstado}">${textoEstado}</span></td>
      <td>
        <div class="acciones">
           <button class="btn-accion btn-ver" data-id="${transporte.id_transporte}">
           <i class="fas fa-eye"></i> Ver detalles
           </button>
           <button class="btn-accion btn-renovar" data-id="${transporte.id_transporte}">
           <i class="fas fa-sync"></i> Renovar
          </button>
        </div>
      </td>
      `;
      cuerpoTabla.appendChild(fila);
    });

    // Configurar evento para botones VER
    document.querySelectorAll('.btn-ver').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.location.href = `transporte.html?id=${id}`;
      });
    });

    // Configurar evento para botones RENOVAR (solo para roles permitidos)
    const tokenData = checkAuth();
    const rol = tokenData?.rol?.toLowerCase?.() || '';
    const puedeRenovar = rol === 'administrador' || rol === 'administrativo';

    document.querySelectorAll('.btn-renovar').forEach(btn => {
      if (!puedeRenovar) {
        btn.style.display = 'none';
        return;
      }
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.location.href = `renovacion-transporte.html?id=${id}`;
      });
    });

    actualizarPaginacion();
  }

  // Actualizar controles de paginación
  function actualizarPaginacion() {
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    document.getElementById('info-pagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('btn-anterior').disabled = paginaActual <= 1;
    document.getElementById('btn-siguiente').disabled = paginaActual >= totalPaginas;
  }

  // Aplicar filtros
  async function aplicarFiltros() {
    const filtros = {
      estado: document.getElementById('filtro-estado').value,
      id_transporte: document.getElementById('filtro-numero-habilitacion').value,
      vehiculo: document.getElementById('filtro-tipo-vehiculo').value,
      patente: document.getElementById('filtro-patente').value,
      titular: document.getElementById('filtro-titular').value
    };

    const response = await fetchTransportes(1, filtros);
    transportes = response.data;
    totalRegistros = response.total;
    paginaActual = 1;
    renderizarTabla();
  }

  // Resetear filtros
  function resetearFiltros() {
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-numero-habilitacion').value = '';
    document.getElementById('filtro-tipo-vehiculo').value = '';
    document.getElementById('filtro-patente').value = '';
    document.getElementById('filtro-titular').value = '';

    aplicarFiltros();
  }

  // Event Listeners
  document.getElementById('btn-anterior')?.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      const filtros = {
        estado: document.getElementById('filtro-estado').value,
        id_transporte: document.getElementById('filtro-numero-habilitacion').value,
        vehiculo: document.getElementById('filtro-tipo-vehiculo').value,
        patente: document.getElementById('filtro-patente').value,
        titular: document.getElementById('filtro-titular').value
      };
      fetchTransportes(paginaActual, filtros).then(response => {
        transportes = response.data;
        totalRegistros = response.total;
        renderizarTabla();
      });
    }
  });

  document.getElementById('btn-siguiente')?.addEventListener('click', () => {
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      const filtros = {
        estado: document.getElementById('filtro-estado').value,
        id_transporte: document.getElementById('filtro-numero-habilitacion').value,
        vehiculo: document.getElementById('filtro-tipo-vehiculo').value,
        patente: document.getElementById('filtro-patente').value,
        titular: document.getElementById('filtro-titular').value
      };
      fetchTransportes(paginaActual, filtros).then(response => {
        transportes = response.data;
        totalRegistros = response.total;
        renderizarTabla();
      });
    }
  });

  document.getElementById('btn-buscar').addEventListener('click', aplicarFiltros);
  document.getElementById('btn-reset').addEventListener('click', resetearFiltros);

  // Inicializar
  const response = await fetchTransportes();
  transportes = response.data;
  totalRegistros = response.total;
  renderizarTabla();
});