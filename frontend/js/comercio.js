import { checkAuth, infoUsuario } from '../auth.js';

// Variables globales
let modoEdicion = false;
let idComercio = null;
let comercioOriginal = null;

// Función helper para asignar contenido seguro
/* function safeSetContent(id, value, suffix = '') {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Elemento no encontrado: #${id}`);
    return;
  }
  
  // Manejo especial para campos de fecha
  if (id === 'fecha-vencimiento' || id === 'fecha-registro') {
    if (value) {
      const date = new Date(value);
      const formattedDate = date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      element.value = formattedDate;
    } else {
      element.value = 'No especificado';
    }
    return;
  }

  // Manejo normal para otros campos
  if (element.tagName === 'INPUT') {
    element.value = value ? `${value}${suffix}` : '';
  } else {
    element.textContent = value ? `${value}${suffix}` : 'No especificado';
  }
} */
/*
function safeSetContent(id, value, suffix = '') {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Elemento no encontrado: #${id}`);
    return;
  }
  
  // Manejo especial para campos de fecha
  if (id === 'fecha-vencimiento' || id === 'fecha-registro') {
    if (value) {
      const date = new Date(value);
      
      // Verificación extra para fechas inválidas
      if (isNaN(date.getTime())) {
        console.error(`Fecha inválida para ${id}:`, value);
        element.textContent = 'Fecha inválida';
        return;
      }
      
      const formattedDate = date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // SOLUCIÓN CLAVE: Usar textContent para elementos <p>
      element.textContent = formattedDate;
    } else {
      element.textContent = 'No especificado';
    }
    return;
  }

  // Manejo normal para otros campos
  const displayValue = value ? `${value}${suffix}` : 'No especificado';
  if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
    element.value = displayValue;
  } else {
    element.textContent = displayValue;
  }
} */
function safeSetContent(id, value) {
  const element = document.getElementById(id);
  if (!element) return;

  const formatDate = (dateValue) => {
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? 'Fecha inválida' : 
        date.toLocaleDateString('es-AR');
    } catch {
      return 'Fecha inválida';
    }
  };

  const displayValue = !value ? 'No especificado' : 
    (id.includes('fecha') ? formatDate(value) : value);

  if (element.tagName === 'INPUT') {
    element.value = displayValue;
  } else {
    element.textContent = displayValue;
  }
}
// Función para activar/desactivar el modo edición
function toggleModoEdicion() {
  modoEdicion = !modoEdicion;
  const btnEditar = document.getElementById('btn-editar');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnBaja = document.getElementById('btn-baja');
  
  if (modoEdicion) {
    btnEditar.innerHTML = '<i class="fas fa-save"></i> Guardar cambios';
    btnEditar.classList.remove('boton-primario');
    btnEditar.classList.add('boton-exito');
    btnCancelar.style.display = 'inline-block';
    btnBaja.style.display = 'none';
    
    document.querySelectorAll('.campo-edit').forEach(input => {
      input.disabled = false;
    });

    const fechaVencimiento = document.getElementById('fecha-vencimiento');
    if (fechaVencimiento) {
      fechaVencimiento.readOnly = true;
    }
  } else {
    btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar Comercio';
    btnEditar.classList.remove('boton-exito');
    btnEditar.classList.add('boton-primario');
    btnCancelar.style.display = 'none';
    btnBaja.style.display = 'inline-block';
    
    document.querySelectorAll('.campo-edit').forEach(input => {
      input.disabled = true;
    });
  }
}

// Función para guardar los cambios
async function guardarCambios() {
  try {
    const datosActualizados = {
      nombre_comercial: document.getElementById('nombre-comercial').value,
      razon_social: document.getElementById('razon-social').value,
      direccion: document.getElementById('direccion').value,
      telefono: document.getElementById('telefono').value,
      correo_electronico: document.getElementById('correo').value,
      rubro: document.getElementById('rubro').value,
      categoria: document.getElementById('categoria').value,
      metros_cuadrados: document.getElementById('metros').value
    };

    const response = await fetch(`/api/comercios/${idComercio}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosActualizados)
    });

    if (!response.ok) throw new Error(await response.text());
    window.location.reload();
    
  } catch (error) {
    console.error('Error al guardar:', error);
    alert('Error al guardar cambios: ' + error.message);
    cargarDatosComercio(comercioOriginal);
    toggleModoEdicion();
  }
}

// Función para cargar los datos del comercio
function cargarDatosComercio(comercio) {
  safeSetContent('nombre-comercial', comercio.nombre_comercial);
  // Priorizar titular ambulante si existe, si no usar razon_social o titular de razon_social
  let titularDisplay = comercio.razon_social || '';
  if (comercio.titular_ambulante_nombre || comercio.titular_ambulante_apellido || comercio.titular_ambulante_dni) {
    const n = comercio.titular_ambulante_nombre || '';
    const a = comercio.titular_ambulante_apellido || '';
    const d = comercio.titular_ambulante_dni || '';
    titularDisplay = `${(n + ' ' + a).trim()}${d ? ' (' + d + ')' : ''}`;
  } else if (comercio.titular_nombre || comercio.titular_apellido || comercio.titular_dni) {
    const n2 = comercio.titular_nombre || '';
    const a2 = comercio.titular_apellido || '';
    const d2 = comercio.titular_dni || '';
    titularDisplay = `${(n2 + ' ' + a2).trim()}${d2 ? ' (' + d2 + ')' : ''}`;
  }
  safeSetContent('razon-social', titularDisplay);
  safeSetContent('direccion', comercio.direccion);
  safeSetContent('telefono', comercio.telefono);
  safeSetContent('correo', comercio.correo_electronico);
  safeSetContent('rubro', comercio.rubro);
  safeSetContent('categoria', comercio.categoria);
  safeSetContent('metros', comercio.metros_cuadrados);
  safeSetContent('empleado-registro', comercio.inspector_registro);
  safeSetContent('fecha-vencimiento', comercio.fecha_vencimiento);
  safeSetContent('fecha-registro', comercio.fecha_registro);

  const estadoHabilitacion = document.getElementById('estado-habilitacion');
  if (estadoHabilitacion) {
    if (!comercio.fecha_habilitacion) {
      if (comercio.pendiente_inspeccion) {
        estadoHabilitacion.textContent = 'Pendiente de Inspección';
        estadoHabilitacion.className = 'estado-pendiente';
      } else {
        estadoHabilitacion.textContent = 'Sin Habilitación';
        estadoHabilitacion.className = 'estado-inactivo';
      }
    } else {
      const hoy = new Date();
      const vencimiento = new Date(comercio.fecha_vencimiento);
      const estaVencido = vencimiento < hoy;

      if (estaVencido) {
        estadoHabilitacion.textContent = 'Habilitación vencida';
        estadoHabilitacion.className = 'estado-inactivo';
      } else {
        estadoHabilitacion.textContent = 'Habilitación al día';
        estadoHabilitacion.className = 'estado-activo';
      }
    }
  }
    const contenedorInspeccion = document.getElementById('contenedor-inspeccion');
  console.log('Contenedor inspección encontrado:', !!contenedorInspeccion);
  
  if (contenedorInspeccion) {
    // Verificar explícitamente los valores numéricos
  const pendienteInspeccion = 
    comercio.pendiente_inspeccion === true || 
    comercio.pendiente_inspeccion === 1 || 
    comercio.pendiente_inspeccion === '1';
  
  console.log('Condiciones inspección - DETALLADO:', {
    pendiente_inspeccion: comercio.pendiente_inspeccion,
    tipo_pendiente: typeof comercio.pendiente_inspeccion,
    mostrarBoton: pendienteInspeccion
  });
  
  if (pendienteInspeccion) {
    contenedorInspeccion.style.display = 'block';
    console.log('✅ Mostrando botón de inspección - CONDICIONES CUMPLIDAS');
    
    // Configurar evento para el botón de inspección
    const btnInspeccion = document.getElementById('btn-inspeccion-ocular');
    if (btnInspeccion) {
      console.log('Botón de inspección encontrado');
      
      // Limpiar event listeners previos
      const nuevoBtn = btnInspeccion.cloneNode(true);
      btnInspeccion.parentNode.replaceChild(nuevoBtn, btnInspeccion);
      
      // Agregar nuevo event listener
      document.getElementById('btn-inspeccion-ocular').addEventListener('click', () => {
        console.log('Navegando a procedimiento con ID:', idComercio);
        window.location.href = `procedimiento.html?id_comercio=${idComercio}&tipo-procedimiento=inspeccion-ocular`;
      });
    }
  } else {
    contenedorInspeccion.style.display = 'none';
    console.log('❌ Ocultando botón de inspección - condiciones no cumplidas');
  }
}
  }


document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Verificar autenticación
    const userData = checkAuth();
    if (!userData) {
      window.location.href = 'login.html';
      return;
    }
    infoUsuario(userData);

    // 2. Configurar logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
      });
    }

    // 3. Obtener ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    idComercio = urlParams.get('id');
    if (!idComercio) throw new Error('ID de comercio no especificado');

    // 4. Cargar datos del comercio
    const response = await fetch(`/api/comercios/${idComercio}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);

    const comercio = await response.json();
    comercioOriginal = {...comercio};

    // 5. Mostrar datos
    cargarDatosComercio(comercio);
    await cargarHistorial();
    // 6. Configurar visibilidad según rol
    const contenedorAcciones = document.getElementById('contenedor-acciones');
    const estadoComercialCampo = document.querySelector('.campo:has(#btn-estado-comercial)');
    const contenedorInspeccion = document.getElementById('contenedor-inspeccion');

    // OCULTAR EL BOTÓN DE INSPECCIÓN POR DEFECTO PARA TODOS
    if (contenedorInspeccion) {
      contenedorInspeccion.style.display = 'none';
    }
    
    // Ocultar otros elementos por defecto
    if (contenedorAcciones) contenedorAcciones.style.display = 'none';
    if (estadoComercialCampo) estadoComercialCampo.style.display = 'none';

    if (userData.rol === 'inspector') {
      // SOLO PARA INSPECTOR: Mostrar botón de inspección si cumple condiciones
      if (contenedorInspeccion) {
        const pendienteInspeccion = 
          comercio.pendiente_inspeccion === true || 
          comercio.pendiente_inspeccion === 1 || 
          comercio.pendiente_inspeccion === '1';
        
        console.log('Inspector - Condiciones inspección:', {
          pendienteInspeccion,
          mostrarBoton: pendienteInspeccion
        });
        
        if (pendienteInspeccion) {
          contenedorInspeccion.style.display = 'block';
          console.log('✅ Mostrando botón de inspección para INSPECTOR');
          
          // Configurar evento para el botón de inspección
          const btnInspeccion = document.getElementById('btn-inspeccion-ocular');
          if (btnInspeccion) {
            // Limpiar event listeners previos
            const nuevoBtn = btnInspeccion.cloneNode(true);
            btnInspeccion.parentNode.replaceChild(nuevoBtn, btnInspeccion);
            
            // Agregar nuevo event listener
            document.getElementById('btn-inspeccion-ocular').addEventListener('click', () => {
              window.location.href = `procedimiento.html?id_comercio=${idComercio}&tipo=inspeccion-ocular`;
            });
          }
        }
      }

      // Crear contenedor exclusivo para inspector
      const contenedorInspector = document.createElement('div');
      contenedorInspector.className = 'footer-acciones inspector-actions';
      contenedorInspector.id = 'contenedor-inspector';
      
      // Crear y configurar botón de procedimiento
      const btnProcedimiento = document.createElement('button');
      btnProcedimiento.id = 'btn-procedimiento';
      btnProcedimiento.className = 'boton-primario';
      btnProcedimiento.innerHTML = '<i class="fas fa-clipboard-check"></i> Registrar Procedimiento';
      
      // Insertar en el DOM
      document.querySelector('.detalle-comercio').appendChild(contenedorInspector);
      contenedorInspector.appendChild(btnProcedimiento);
      
      // Configurar evento
      btnProcedimiento.addEventListener('click', () => {
        window.location.href = `procedimiento.html?id_comercio=${idComercio}`;
      });
    } 
    else if (['administrador', 'administrativo'].includes(userData.rol)) {
      // PARA ADMIN/ADMINISTRATIVO: Asegurar que el botón de inspección esté OCULTO
      if (contenedorInspeccion) {
        contenedorInspeccion.style.display = 'none';
      }
      
      // Mostrar elementos para admin/administrativos
      if (contenedorAcciones) contenedorAcciones.style.display = 'flex';
      if (estadoComercialCampo) estadoComercialCampo.style.display = 'block';

      // Configurar botón de estado comercial
      const btnEstadoComercial = document.getElementById('btn-estado-comercial');
      if (btnEstadoComercial) {
        const textoEstado = document.getElementById('texto-estado');
        if (comercio.activo) {
          btnEstadoComercial.className = 'estado-comercial-btn activo';
          textoEstado.textContent = 'Activo';
        } else {
          btnEstadoComercial.className = 'estado-comercial-btn inactivo';
          textoEstado.textContent = 'Inactivo';
        }

        btnEstadoComercial.addEventListener('click', async () => {
          const accion = comercio.activo ? 'inactivar' : 'reactivar';
          if (confirm(`¿Está seguro que desea ${accion} este comercio?`)) {
            try {
              const response = await fetch(`/api/comercios/${idComercio}/estado`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  activo: !comercio.activo
                })
              });
              
              if (!response.ok) throw new Error(await response.text());
              window.location.reload();
            } catch (error) {
              console.error('Error:', error);
              alert(`Error: ${error.message}`);
            }
          }
        });
      }

      // Configurar botones de edición/baja
      const btnEditar = document.getElementById('btn-editar');
      const btnCancelar = document.getElementById('btn-cancelar');
      const btnBaja = document.getElementById('btn-baja');

      if (btnEditar) {
        btnEditar.addEventListener('click', async () => {
          if (modoEdicion) {
            await guardarCambios();
          } else {
            toggleModoEdicion();
          }
        });
      }

      if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
          cargarDatosComercio(comercioOriginal);
          toggleModoEdicion();
        });
      }

      if (btnBaja) {
        btnBaja.innerHTML = comercio.activo 
          ? '<i class="fas fa-trash"></i> Dar de Baja' 
          : '<i class="fas fa-redo"></i> Reactivar';
        
        btnBaja.addEventListener('click', async () => {
          const accion = comercio.activo ? 'inactivar' : 'reactivar';
          if (confirm(`¿Está seguro que desea ${accion} este comercio?`)) {
            try {
              const response = await fetch(`/api/comercios/${idComercio}/estado`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  activo: !comercio.activo
                })
              });
              
              if (!response.ok) throw new Error(await response.text());
              window.location.reload();
            } catch (error) {
              console.error('Error:', error);
              alert(`Error: ${error.message}`);
            }
          }
        });
      }
    }

  } catch (error) {
    console.error('Error general:', error);
    
    const detalleComercio = document.getElementById('detalle-comercio');
    if (detalleComercio) {
      detalleComercio.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${error.message}</p>
          <a href="lista-comercios.html" class="boton-volver">
            <i class="fas fa-arrow-left"></i> Volver al listado
          </a>
        </div>
      `;
    } else {
      alert(`Error: ${error.message}`);
    }
  }
});






















async function cargarHistorial() {
  try {
    console.log('Cargando historial para comercio:', idComercio);
    
    const response = await fetch(`/api/procedimientos?comercio=${idComercio}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    const procedimientos = await response.json();
    console.log('Procedimientos recibidos:', procedimientos);
    
    renderizarHistorial(procedimientos);
  } catch (error) {
    console.error('Error al cargar historial:', error);
    // Mostrar mensaje de error en la tabla
    const tbody = document.getElementById('historial-procedimientos');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #666; padding: 20px;">
            <i class="fas fa-exclamation-triangle"></i>
            Error al cargar el historial: ${error.message}
          </td>
        </tr>
      `;
    }
  }
}

function renderizarHistorial(procedimientos) {
  const tbody = document.getElementById('historial-procedimientos');
  if (!tbody) {
    console.error('No se encontró el elemento historial-procedimientos');
    return;
  }
  
  tbody.innerHTML = '';

  if (procedimientos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #666; padding: 20px;">
          <i class="fas fa-info-circle"></i>
          No hay procedimientos registrados
        </td>
      </tr>
    `;
    return;
  }

  procedimientos.forEach(proc => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${proc.tipo_procedimiento || 'N/A'}</td>
      <td>${proc.fecha_procedimiento ? new Date(proc.fecha_procedimiento).toLocaleDateString('es-AR') : 'N/A'}</td>
      <td><span class="estado-${proc.resultado ? proc.resultado.toLowerCase() : 'desconocido'}">${proc.resultado || 'N/A'}</span></td>
      <td>${proc.inspector_nombre || 'N/A'}</td>
      <td>
        <button class="btn-accion btn-ver" data-id="${proc.id_procedimiento}">
          <i class="fas fa-eye"></i> Ver detalles
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Configurar eventos para botones de ver
  document.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      mostrarDetalleProcedimiento(id);
    });
  });
}


async function mostrarDetalleProcedimiento(id) {
  try {
    const response = await fetch(`/api/procedimientos/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const procedimiento = await response.json();

    // Mostrar datos en el modal
    document.getElementById('modal-detalles-contenido').innerHTML = `
      <p><strong>Tipo:</strong> ${procedimiento.tipo_procedimiento}</p>
      <p><strong>Fecha:</strong> ${new Date(procedimiento.fecha_procedimiento).toLocaleDateString('es-AR')}</p>
      <p><strong>Resultado:</strong> <span class="estado-${procedimiento.resultado.toLowerCase()}">${procedimiento.resultado}</span></p>
      <p><strong>Observaciones:</strong> ${procedimiento.observacion || 'Ninguna'}</p>
      <p><strong>Documentación:</strong> ${procedimiento.documentacion || 'Ninguna'}</p>
    `;

    // Mostrar fotos
    const fotosContainer = document.getElementById('modal-fotos');
    fotosContainer.innerHTML = '';

    if (procedimiento.fotos && procedimiento.fotos.trim() !== '') {
      const fotosArray = procedimiento.fotos.split(',');
      let fotosCargadas = 0;

      fotosArray.forEach(foto => {
        const nombreFoto = foto.trim();
        if (nombreFoto) {
          const imgContainer = document.createElement('div');
          imgContainer.style.position = 'relative';
          imgContainer.style.margin = '10px';
          
          const img = document.createElement('img');
          img.src = `/uploads/procedimientos/${encodeURIComponent(nombreFoto)}`;
          img.style.maxWidth = '200px';
          img.style.maxHeight = '200px';
          img.style.border = '1px solid #ddd';
          img.style.borderRadius = '4px';
          img.style.objectFit = 'cover';
          img.loading = 'lazy';

          // Tooltip con el nombre del archivo
          img.title = nombreFoto;

          // Manejo de errores
          img.onerror = () => {
            imgContainer.innerHTML = `
              <div style="width:200px; height:200px; background:#f5f5f5; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1px dashed #ccc; border-radius:4px;">
                <i class="fas fa-image" style="font-size:40px; color:#ccc;"></i>
                <small style="margin-top:10px; color:#999; text-align:center;">${nombreFoto}</small>
                <small style="color:#ff6b6b;">(No se pudo cargar)</small>
              </div>
            `;
          };

          // Verificación de carga exitosa
          img.onload = () => fotosCargadas++;

          // Descargar imagen
          const downloadBtn = document.createElement('button');
          downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
          downloadBtn.style.position = 'absolute';
          downloadBtn.style.top = '5px';
          downloadBtn.style.right = '5px';
          downloadBtn.style.background = 'rgba(0,0,0,0.5)';
          downloadBtn.style.color = 'white';
          downloadBtn.style.border = 'none';
          downloadBtn.style.borderRadius = '50%';
          downloadBtn.style.width = '25px';
          downloadBtn.style.height = '25px';
          downloadBtn.style.cursor = 'pointer';
          downloadBtn.onclick = (e) => {
            e.preventDefault();
            const link = document.createElement('a');
            link.href = img.src;
            link.download = nombreFoto;
            link.click();
          };

          imgContainer.appendChild(img);
          imgContainer.appendChild(downloadBtn);
          fotosContainer.appendChild(imgContainer);
        }
      });

      // Si ninguna foto cargó
      setTimeout(() => {
        if (fotosCargadas === 0 && fotosArray.length > 0) {
          fotosContainer.innerHTML = `
            <div style="width:100%; padding:20px; text-align:center; color:#666;">
              <i class="fas fa-exclamation-triangle" style="font-size:24px;"></i>
              <p>No se pudieron cargar las fotos adjuntas</p>
              <small>Verifica que los archivos existan en el servidor</small>
            </div>
          `;
        }
      }, 1500);
    } else {
      fotosContainer.innerHTML = `
        <div style="width:100%; padding:20px; text-align:center; color:#999;">
          <i class="far fa-image" style="font-size:24px;"></i>
          <p>No hay fotos adjuntas</p>
        </div>
      `;
    }

    // Mostrar modal
    const modal = document.getElementById('modal-detalles');
    modal.style.display = 'block';

    // Cerrar modal
    const closeModal = () => {
      modal.style.display = 'none';
      document.removeEventListener('keydown', handleEscape);
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    document.querySelector('.cerrar-modal').onclick = closeModal;
    document.addEventListener('keydown', handleEscape);
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

  } catch (error) {
    console.error('Error al cargar detalle:', error);
    alert(`Error al cargar los detalles: ${error.message}\n\nIntenta recargando la página.`);
  }
}

    cargarHistorial();



// PLEGABLE INSPECCIONES CON ICONO MEJORADO
document.addEventListener('DOMContentLoaded', function() {
  const headerInspecciones = document.getElementById('header-inspecciones');
  const contenidoInspecciones = document.getElementById('contenido-inspecciones');
  const toggleIcon = document.getElementById('toggle-inspecciones');
  
  if (headerInspecciones && contenidoInspecciones && toggleIcon) {
    headerInspecciones.addEventListener('click', function() {
      const estaExpandido = contenidoInspecciones.classList.contains('expandido');
      
      if (estaExpandido) {
        contenidoInspecciones.classList.remove('expandido');
        toggleIcon.classList.remove('girado');
      } else {
        contenidoInspecciones.classList.add('expandido');
        toggleIcon.classList.add('girado');
      }
    });
  }
});