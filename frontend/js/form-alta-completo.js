// Función para alternar la visibilidad de la sección
function toggleSection(header) {
  const section = header.parentElement;
  const content = section.querySelector('.section-content');
  const icon = header.querySelector('.section-icon i');
  
  content.classList.toggle('show');
  const isExpanded = content.classList.contains('show');
  
  header.setAttribute('aria-expanded', isExpanded);
  icon.classList.toggle('fa-chevron-down');
  icon.classList.toggle('fa-chevron-up');
}

// Función para mostrar documentos específicos según tipo de comercio
function mostrarDocumentosEspecificos(tipoComercio) {
  document.querySelectorAll('.rubro-specific').forEach(section => {
    section.style.display = 'none';
  });
  
  switch(tipoComercio) {
    case 'ambulante':
      document.querySelector('.vendedor_ambulante').style.display = 'block';
      break;
    case 'bar_nocturno':
      document.querySelector('.bar_nocturno').style.display = 'block';
      break;
    case 'food_truck':
      document.querySelector('.food_truck').style.display = 'block';
      break;
    case 'comercio_general':
      document.querySelector('.comercio_general').style.display = 'block';
      break;
  }
}

// Generar resumen del formulario
function generarResumen() {
  const form = document.getElementById('formularioComercio');
  const resumenContenido = document.getElementById('resumenContenido');
  const datos = new FormData(form);
  let html = '<div class="resumen-grid">';
  
  // Datos del Titular
  html += '<div class="resumen-section"><h4><i class="fas fa-user"></i> Datos del Titular</h4><ul>';
  html += `<li><strong>Nombre:</strong> ${datos.get('nombre') || 'No completado'}</li>`;
  html += `<li><strong>Apellido:</strong> ${datos.get('apellido') || 'No completado'}</li>`;
  html += `<li><strong>DNI:</strong> ${datos.get('dni') || 'No completado'}</li>`;
  html += `<li><strong>CUIT:</strong> ${datos.get('cuit') || 'No completado'}</li>`;
  html += `<li><strong>Teléfono:</strong> ${datos.get('telefono_prop') || 'No completado'}</li>`;
  html += `<li><strong>Email:</strong> ${datos.get('email_prop') || 'No completado'}</li>`;
  html += `<li><strong>Fecha Vencimiento:</strong> ${datos.get('fechaVencimiento') || 'No completado'}</li>`;
  html += '</ul></div>';
  
  // Datos del Comercio
  html += '<div class="resumen-section"><h4><i class="fas fa-store"></i> Datos del Comercio</h4><ul>';
  html += `<li><strong>Nombre Comercial:</strong> ${datos.get('nombreComercial') || 'No completado'}</li>`;
  html += `<li><strong>Ubicación:</strong> ${datos.get('ubicacion') || 'No completado'}</li>`;
  html += `<li><strong>Teléfono:</strong> ${datos.get('telefono') || 'No completado'}</li>`;
  html += `<li><strong>Email:</strong> ${datos.get('email') || 'No completado'}</li>`;
  html += `<li><strong>Tipo de Comercio:</strong> ${document.getElementById('tipoComercio').value || 'No seleccionado'}</li>`;
  html += `<li><strong>Rubro:</strong> ${datos.get('rubro') || 'No completado'}</li>`;
  html += '</ul></div>';
  
  // Documentos
  html += '<div class="resumen-section"><h4><i class="fas fa-file-alt"></i> Documentos Adjuntos</h4><ul>';
  html += `<li><strong>Foto Titular:</strong> ${datos.get('fotoTitular')?.name || 'No seleccionado'}</li>`;
  html += `<li><strong>DNI Titular:</strong> ${datos.get('dni_titular')?.name || 'No seleccionado'}</li>`;
  html += `<li><strong>Certificado Residencia:</strong> ${datos.get('certificado_residencia')?.name || 'No seleccionado'}</li>`;
  html += `<li><strong>Certificado Salud:</strong> ${datos.get('certificado_salud')?.name || 'No seleccionado'}</li>`;
  
  // Documentos específicos según tipo de comercio
  const tipoComercio = document.getElementById('tipoComercio').value;
  if (tipoComercio === 'ambulante') {
    html += `<li><strong>Fotos Carnet:</strong> ${datos.get('fotos_carnet')?.name || 'No seleccionado'}</li>`;
  } else if (tipoComercio === 'bar_nocturno') {
    html += `<li><strong>Pago Inspección:</strong> ${datos.get('pago_inspeccion')?.name || 'No seleccionado'}</li>`;
    html += `<li><strong>Plano Local:</strong> ${datos.get('plano_local')?.name || 'No seleccionado'}</li>`;
  } else if (tipoComercio === 'food_truck') {
    html += `<li><strong>Certificado Manipulación:</strong> ${datos.get('certificado_manipulacion')?.name || 'No seleccionado'}</li>`;
    html += `<li><strong>Póliza Seguro:</strong> ${datos.get('poliza_seguro')?.name || 'No seleccionado'}</li>`;
  } else if (tipoComercio === 'comercio_general') {
    html += `<li><strong>Declaración Jurada:</strong> ${datos.get('declaracion_rentas_general')?.name || 'No seleccionado'}</li>`;
    html += `<li><strong>Plano Local:</strong> ${datos.get('plano_local_general')?.name || 'No seleccionado'}</li>`;
    html += `<li><strong>Contrato Alquiler:</strong> ${datos.get('contrato_alquiler_general')?.name || 'No seleccionado'}</li>`;
  }
  
  html += '</ul></div></div>';
  
  resumenContenido.innerHTML = html;
  document.getElementById('resumenContainer').style.display = 'block';
  document.getElementById('verResumenBtn').style.display = 'none';
  document.getElementById('submitBtn').style.display = 'inline-block';
  
  document.getElementById('resumenContainer').scrollIntoView({ behavior: 'smooth' });
}

// Mostrar mensaje de éxito
function mostrarExito(mensaje) {
  const alerta = document.createElement('div');
  alerta.className = 'alert success';
  alerta.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${mensaje}</span>
  `;
  document.body.appendChild(alerta);
  
  setTimeout(() => {
    alerta.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    alerta.classList.remove('show');
    setTimeout(() => {
      alerta.remove();
    }, 500);
  }, 5000);
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
  const alerta = document.createElement('div');
  alerta.className = 'alert error';
  alerta.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${mensaje}</span>
  `;
  document.body.appendChild(alerta);
  
  setTimeout(() => {
    alerta.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    alerta.classList.remove('show');
    setTimeout(() => {
      alerta.remove();
    }, 500);
  }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  // Configurar el evento click para los headers de sección
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      toggleSection(header);
    });
  });

  // Configurar el evento change para el selector de tipo de comercio
  const tipoComercioSelect = document.getElementById('tipoComercio');
  if (tipoComercioSelect) {
    tipoComercioSelect.addEventListener('change', function() {
      mostrarDocumentosEspecificos(this.value);
    });
    
    if (tipoComercioSelect.value) {
      mostrarDocumentosEspecificos(tipoComercioSelect.value);
    }
  }

  // Botón para ver resumen
  document.getElementById('verResumenBtn').addEventListener('click', generarResumen);

  // Configurar el evento submit para el formulario
  document.getElementById('formularioComercio').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const token = localStorage.getItem('token');

    try {
      // Mostrar loader
      const botonSubmit = form.querySelector('button[type="submit"]');
      const textoOriginal = botonSubmit.innerHTML;
      botonSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      botonSubmit.disabled = true;

      const res = await fetch('http://localhost:3036/registro', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        body: formData
      });

      const result = await res.json();
      
      // Restaurar botón
      botonSubmit.innerHTML = textoOriginal;
      botonSubmit.disabled = false;

      if (res.ok) {
        mostrarExito('Registro exitoso');
        form.reset();
        document.querySelectorAll('.rubro-specific').forEach(section => {
          section.style.display = 'none';
        });
        document.getElementById('resumenContainer').style.display = 'none';
        document.getElementById('verResumenBtn').style.display = 'inline-block';
        document.getElementById('submitBtn').style.display = 'none';
      } else {
        mostrarError('Error en el registro: ' + (result.error || 'Desconocido'));
      }
    } catch (err) {
      console.error(err);
      mostrarError('Error al conectar con el servidor');
      
      const botonSubmit = form.querySelector('button[type="submit"]');
      botonSubmit.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Registro';
      botonSubmit.disabled = false;
    }
  });

  // Cerrar sesión
  document.querySelector('.logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  // Mostrar secciones principales abiertas por defecto
  document.querySelectorAll('.form-section:not(:last-child) .section-header').forEach(header => {
    toggleSection(header);
  });
});