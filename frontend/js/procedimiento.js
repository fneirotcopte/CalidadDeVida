/*
import { checkAuth, infoUsuario } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Verificar autenticación y rol
    const userData = checkAuth();
    if (!userData || userData.rol !== 'inspector') {
      window.location.href = 'login.html';
      return;
    }
    infoUsuario(userData);


    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
  
    // Establecer la fecha actual como valor por defecto
    document.getElementById('fecha-procedimiento').value = formattedDate;

    // 2. Configurar logout
    document.querySelector('.logout-btn').addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });

    // 3. Obtener ID del comercio de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idComercio = urlParams.get('id_comercio');
    if (!idComercio) {
      throw new Error('No se especificó un comercio');
    }

    // 4. Cargar información del comercio
    let comercio = null;
    try {
      const response = await fetch(`/api/comercios/${idComercio}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      comercio = await response.json();
      document.getElementById('info-comercio').textContent = 
        `Procedimientos para: ${comercio.nombre_comercial} - ${comercio.direccion}`;
    } catch (error) {
      console.error('Error al cargar comercio:', error);
    }

    // 5. Configurar botón volver
    document.getElementById('btn-volver').addEventListener('click', () => {
      window.location.href = `comercio.html?id=${idComercio}`;
    });

    // 6. Cargar historial de procedimientos
    async function cargarHistorial() {
      try {
        const response = await fetch(`/api/procedimientos?comercio=${idComercio}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const procedimientos = await response.json();
        renderizarHistorial(procedimientos);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    }

    function renderizarHistorial(procedimientos) {
      const tbody = document.getElementById('historial-procedimientos');
      tbody.innerHTML = '';

      procedimientos.forEach(proc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${proc.tipo_procedimiento}</td>
          <td>${new Date(proc._procedimiento).toLocaleDateString('es-AR')}</td>
          <td><span class="estado-${proc.resultado.toLowerCase()}">${proc.resultado}</span></td>
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
        
        // Mostrar modal o alerta con los detalles
        alert(`Detalles del procedimiento:\n
Tipo: ${procedimiento.tipo_procedimiento}\n
Fecha: ${new Date(procedimiento.fecha_procedimiento).toLocaleDateString('es-AR')}\n
Resultado: ${procedimiento.resultado}\n
Observaciones: ${procedimiento.observacion || 'Ninguna'}\n
Documentación: ${procedimiento.documentacion || 'Ninguna'}`);
      } catch (error) {
        console.error('Error al cargar detalle:', error);
      }
    }

    // 7. Manejar envío del formulario
    document.getElementById('form-procedimiento').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('tipo_procedimiento', document.getElementById('tipo-procedimiento').value);
      formData.append('fecha_procedimiento', document.getElementById('fecha-procedimiento').value);
      formData.append('resultado', document.getElementById('resultado').value);
      formData.append('observacion', document.getElementById('observacion').value);
      formData.append('documentacion', document.getElementById('documentacion').value);
      formData.append('id_comercio', idComercio);
      formData.append('id_inspector', userData.id_empleado);

      // Agregar fotos si hay
      const fotosInput = document.getElementById('fotos');
      if (fotosInput.files.length > 0) {
        for (let i = 0; i < fotosInput.files.length; i++) {
          formData.append('fotos', fotosInput.files[i]);
        }
      }

      try {
        const response = await fetch('/api/procedimientos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) throw new Error(await response.text());

        alert('Procedimiento registrado correctamente');
        cargarHistorial();
        document.getElementById('form-procedimiento').reset();
      } catch (error) {
        console.error('Error al registrar procedimiento:', error);
        alert('Error al registrar procedimiento: ' + error.message);
      }
    });

    // Cargar historial inicial
    cargarHistorial();

  } catch (error) {
    console.error('Error general:', error);
    alert(`Error: ${error.message}`);
    window.location.href = 'lista-comercios.html';
  }
});

*/

import { checkAuth, infoUsuario } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Verificar autenticación y rol
    const userData = checkAuth();
    if (!userData || userData.rol !== 'inspector') {
      window.location.href = 'login.html';
      return;
    }
    infoUsuario(userData);

    // Establecer fecha actual y configurar validación
    const fechaInput = document.getElementById('fecha-procedimiento');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    fechaInput.value = formattedDate;
    fechaInput.max = formattedDate; // Bloquear fechas futuras en el selector

    // Crear elemento para mensajes de error
    const errorElement = document.createElement('small');
    errorElement.className = 'error-message';
    errorElement.style.color = 'red';
    errorElement.style.display = 'none';
    fechaInput.parentNode.appendChild(errorElement);

    // 2. Configurar logout
    document.querySelector('.logout-btn').addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });

    // 3. Obtener ID del comercio de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idComercio = urlParams.get('id_comercio');
    if (!idComercio) {
      throw new Error('No se especificó un comercio');
    }
    const tipoProcedimiento = urlParams.get('tipo');
    if (tipoProcedimiento) {
  const selectTipo = document.getElementById('tipo-procedimiento');
  if (selectTipo) {
    // Buscar la opción que coincida con el tipo
    for (let option of selectTipo.options) {
      if (option.value.toLowerCase() === tipoProcedimiento.toLowerCase()) {
        option.selected = true;
        console.log('Tipo de procedimiento pre-seleccionado:', tipoProcedimiento);
        break;
      }
    }
  }
}




    // 4. Cargar información del comercio
    let comercio = null;
    try {
      const response = await fetch(`/api/comercios/${idComercio}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      comercio = await response.json();
      document.getElementById('info-comercio').textContent = 
        `Procedimientos para: ${comercio.nombre_comercial} - ${comercio.direccion}`;
    } catch (error) {
      console.error('Error al cargar comercio:', error);
    }

    // 5. Configurar botón volver
    document.getElementById('btn-volver').addEventListener('click', () => {
      window.location.href = `comercio.html?id=${idComercio}`;
    });

    // 6. Cargar historial de procedimientos
    async function cargarHistorial() {
      try {
        const response = await fetch(`/api/procedimientos?comercio=${idComercio}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const procedimientos = await response.json();
        renderizarHistorial(procedimientos);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    }
/*
    function renderizarHistorial(procedimientos) {
      const tbody = document.getElementById('historial-procedimientos');
      tbody.innerHTML = '';

      procedimientos.forEach(proc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${proc.tipo_procedimiento}</td>
          <td>${new Date(proc._procedimiento).toLocaleDateString('es-AR')}</td>
          <td><span class="estado-${proc.resultado.toLowerCase()}">${proc.resultado}</span></td>
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
    }  */
function renderizarHistorial(procedimientos) {
  const tbody = document.getElementById('historial-procedimientos');
  tbody.innerHTML = '';

  procedimientos.forEach(proc => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${proc.tipo_procedimiento}</td>
      <td>${new Date(proc.fecha_procedimiento).toLocaleDateString('es-AR')}</td>
      <td><span class="estado-${proc.resultado.toLowerCase()}">${proc.resultado}</span></td>
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
 /*   async function mostrarDetalleProcedimiento(id) {
      try {
        const response = await fetch(`/api/procedimientos/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const procedimiento = await response.json();
        
        // Mostrar modal o alerta con los detalles
        alert(`Detalles del procedimiento:\n
Tipo: ${procedimiento.tipo_procedimiento}\n
Fecha: ${new Date(procedimiento.fecha_procedimiento).toLocaleDateString('es-AR')}\n
Resultado: ${procedimiento.resultado}\n
Observaciones: ${procedimiento.observacion || 'Ninguna'}\n
Documentación: ${procedimiento.documentacion || 'Ninguna'}`);
      } catch (error) {
        console.error('Error al cargar detalle:', error);
      }
    } */
   /*
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
      <p><strong>Resultado:</strong> ${procedimiento.resultado}</p>
      <p><strong>Observaciones:</strong> ${procedimiento.observacion || 'Ninguna'}</p>
      <p><strong>Documentación:</strong> ${procedimiento.documentacion || 'Ninguna'}</p>
    `;

    // Mostrar fotos si existen
    const fotosContainer = document.getElementById('modal-fotos');
    fotosContainer.innerHTML = '';
    
    if (procedimiento.fotos) {
      const fotosArray = procedimiento.fotos.split(',');
      fotosArray.forEach(foto => {
        if (foto.trim()) { // Solo si el nombre no está vacío
          const imgContainer = document.createElement('div');
          imgContainer.innerHTML = `
            <img src="/uploads/${foto}" style="max-width:150px; max-height:150px; border:1px solid #ddd; border-radius:4px;">
          `;
          fotosContainer.appendChild(imgContainer);
        }
      });
    } else {
      fotosContainer.innerHTML = '<p>No hay fotos adjuntas</p>';
    }

    // Mostrar modal
    document.getElementById('modal-detalles').style.display = 'block';

    // Configurar botón de cerrar
    document.querySelector('.cerrar-modal').addEventListener('click', () => {
      document.getElementById('modal-detalles').style.display = 'none';
    });

    // Cerrar al hacer clic fuera del contenido
    document.getElementById('modal-detalles').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-detalles')) {
        document.getElementById('modal-detalles').style.display = 'none';
      }
    });

  } catch (error) {
    console.error('Error al cargar detalle:', error);
    alert('Error al cargar los detalles: ' + error.message);
  }
}
*/

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


    // 7. Manejar envío del formulario (VERSIÓN ACTUALIZADA)
    document.getElementById('form-procedimiento').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validar fecha seleccionada
      const selectedDate = new Date(fechaInput.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Ignorar la hora para comparar solo fechas

      if (selectedDate > today) {
        fechaInput.style.borderColor = 'red';
        errorElement.textContent = 'No se permiten fechas futuras';
        errorElement.style.display = 'block';
        return; // Detener el envío
      }

      // Restablecer estilos si la fecha es válida
      fechaInput.style.borderColor = '';
      errorElement.style.display = 'none';

      // Resto del código de envío del formulario...
      const formData = new FormData();
      formData.append('tipo_procedimiento', document.getElementById('tipo-procedimiento').value);
      formData.append('fecha_procedimiento', fechaInput.value);
      formData.append('resultado', document.getElementById('resultado').value);
      formData.append('observacion', document.getElementById('observacion').value);
      formData.append('documentacion', document.getElementById('documentacion').value);
      formData.append('id_comercio', idComercio);
      formData.append('id_inspector', userData.id_empleado);

      // Agregar fotos si hay
      const fotosInput = document.getElementById('fotos');
      if (fotosInput.files.length > 0) {
        for (let i = 0; i < fotosInput.files.length; i++) {
          formData.append('fotos', fotosInput.files[i]);
        }
      }

      try {
        const response = await fetch('/api/procedimientos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) throw new Error(await response.text());

        alert('Procedimiento registrado correctamente');
        cargarHistorial();
        document.getElementById('form-procedimiento').reset();
        // Restablecer fecha actual después del envío
        fechaInput.value = formattedDate;
      } catch (error) {
        console.error('Error al registrar procedimiento:', error);
        alert('Error al registrar procedimiento: ' + error.message);
      }
    });

    // Validación en tiempo real mientras el usuario selecciona
    fechaInput.addEventListener('change', function() {
      const selectedDate = new Date(this.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        this.style.borderColor = 'red';
        errorElement.textContent = 'No se permiten fechas futuras';
        errorElement.style.display = 'block';
      } else {
        this.style.borderColor = '';
        errorElement.style.display = 'none';
      }
    });

    // Cargar historial inicial
    cargarHistorial();

  } catch (error) {
    console.error('Error general:', error);
    alert(`Error: ${error.message}`);
    window.location.href = 'lista-comercios.html';
  }
});