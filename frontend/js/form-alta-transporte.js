// === Inicializar contenedor de documentos cargados (idéntico a comercio) ===
let documentosCargados = {};

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ form-alta-transporte.js cargado');

  const radioSi = document.getElementById('choferSi');
  const radioNo = document.getElementById('choferNo');
  const bloqueChofer = document.getElementById('bloqueDatosChofer');
  const bloqueComplementarios = document.getElementById('bloqueDatosComplementarios');

  // 👉 Mostrar/ocultar según selección
  const actualizarBloques = () => {
    if (radioSi.checked) {
      bloqueChofer.style.display = 'none';
      bloqueComplementarios.style.display = 'block';
    } else {
      bloqueChofer.style.display = 'block';
      bloqueComplementarios.style.display = 'none';
    }
  };

  // 👉 Mostrar/ocultar inputs de documentación y actualizar etiquetas
  const camposDocumentacion = [
    'dni_frente',
    'dni_dorso',
    'carnet_frente',
    'carnet_dorso'
  ];

  const labelSalud = document.getElementById('label-cert_salud');

  function actualizarDocumentacion() {
    const mostrarChofer = radioNo.checked; // por defecto es "No" = chofer distinto del titular

    camposDocumentacion.forEach(id => {
      const input = document.getElementById(id);
      const bloque = input?.closest('.col-md-6');
      if (!bloque) return;

      if (mostrarChofer) {
        bloque.style.display = 'block';
        input.setAttribute('required', 'true');
      } else {
        bloque.style.display = 'none';
        input.removeAttribute('required');
      }
    });

    // 🔄 Actualizar etiqueta del certificado de salud
    if (labelSalud) {
      labelSalud.textContent = radioSi.checked
        ? 'Certificado de Buena Salud (Titular) *'
        : 'Certificado de Buena Salud (Chofer) *';
    }
  }

  // Escuchar cambios en los radios
  radioSi.addEventListener('change', actualizarDocumentacion);
  radioNo.addEventListener('change', actualizarDocumentacion);

  // Estado inicial al cargar la página
  actualizarDocumentacion();

  radioSi.addEventListener('change', actualizarBloques);
  radioNo.addEventListener('change', actualizarBloques);

  // Estado inicial
  actualizarBloques();

  // --- Cálculo de montos y control de meses ---
  const tipoVehiculo = document.getElementById('tipoVehiculo');
  const mesesAdelantar = document.getElementById('mesesAdelantar');
  const etiquetaMeses = document.getElementById('etiquetaMeses');
  const montoSellado = document.getElementById('montoSellado');
  const montoTotal = document.getElementById('montoTotal');
  const vtoFecha = document.getElementById('vtoFecha');
  const seguroFecha = document.getElementById('seguroFecha');

  // Montos base por tipo de vehículo (según Ordenanza N° 6424/24)
  const montosVehiculos = {
    camioneta: 2800,
    camion350: 5700,
    furgon: 8500,
    superior: 11300
  };

  function actualizarMontos() {
    const tipo = tipoVehiculo.value;
    const vto = new Date(vtoFecha.value);
    const seguro = new Date(seguroFecha.value);
    const hoy = new Date();

    // Calcular meses posibles según vencimiento más cercano
    let mesesVto = vtoFecha.value ? Math.max(0, (vto.getFullYear() - hoy.getFullYear()) * 12 + (vto.getMonth() - hoy.getMonth())) : 0;
    let mesesSeguro = seguroFecha.value ? Math.max(0, (seguro.getFullYear() - hoy.getFullYear()) * 12 + (seguro.getMonth() - hoy.getMonth())) : 0;
    let maxMeses = Math.min(mesesVto, mesesSeguro);
    if (!isFinite(maxMeses) || maxMeses < 0) maxMeses = 0;

    // Actualizar etiqueta y restricción del input
    etiquetaMeses.style.visibility = 'visible';
    etiquetaMeses.style.color = '#7e7c89ff';      // gris Bootstrap estándar
    etiquetaMeses.style.fontWeight = '400';     // sin negrita
    etiquetaMeses.style.fontSize = '0.95rem';   // igual que los otros textos
    etiquetaMeses.style.fontFamily = 'inherit'; // misma fuente del formulario
    etiquetaMeses.classList.remove('text-primary', 'fw-bold');

    if (maxMeses > 0) {
      etiquetaMeses.textContent = `Puede adelantar: ${maxMeses}`;
    } else {
      etiquetaMeses.textContent = 'Puede adelantar: 0';
    }


    mesesAdelantar.max = maxMeses > 0 ? maxMeses : 1;

    // Si el valor actual supera el máximo, lo ajusta automáticamente
    if (parseInt(mesesAdelantar.value) > maxMeses && maxMeses > 0) {
      mesesAdelantar.value = maxMeses;
    }


    // Actualizar montos
    const base = montosVehiculos[tipo] || 0;
    montoSellado.value = `$${base.toLocaleString('es-AR')}`;
    const mesesSeleccionados = parseInt(mesesAdelantar.value) || 1;
    montoTotal.value = `$${(base * mesesSeleccionados).toLocaleString('es-AR')}`;
  }

  // 👉 Eventos: recalcula automáticamente al interactuar
  [tipoVehiculo, mesesAdelantar, vtoFecha, seguroFecha].forEach(el => {
    el.addEventListener('change', actualizarMontos);
    el.addEventListener('input', actualizarMontos);
  });

});

// ✅ Cargar documentación en alta de transporte (idéntico a comercio)
document.addEventListener('DOMContentLoaded', () => {

  const contComunes = document.querySelector('#documentosComunes .row');
  const contVehiculo = document.querySelector('#documentosEspecificos .row');
  if (!contComunes || !contVehiculo) return;

  // 🧩 Documentos Comunes (chofer/titular) — usar snake_case
  const docsComunes = [
    { id: 'dni_frente', label: 'DNI Frente *' },
    { id: 'dni_dorso', label: 'DNI Dorso *' },
    { id: 'carnet_frente', label: 'Carnet Frente *' },
    { id: 'carnet_dorso', label: 'Carnet Dorso *' },
    { id: 'cert_salud', label: 'Certificado de Buena Salud (Chofer) *', dinamico: true }
  ];

  // 🚗 Documentos del Vehículo — usar snake_case
  const docsVehiculo = [
    { id: 'foto_vehiculo', label: 'Foto del Vehículo *' },
    { id: 'cedula_verde', label: 'Cédula Verde *' },
    { id: 'seguro_vehiculo', label: 'Seguro Vigente *' },
    { id: 'vto_vehiculo', label: 'VTO Vigente *' },
    { id: 'sellado_bromatologico', label: 'Sellado Bromatológico *' } // ← ADICIONADO
  ];

  // 👉 Función para crear la estructura idéntica a comercio
  const crearDocumentoItem = (doc) => {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    col.innerHTML = `
      <div class="documento-item">
        <label for="${doc.id}" class="form-label" id="label-${doc.id}">${doc.label}</label>
        <input type="file" class="form-control" id="${doc.id}" name="${doc.id}" accept="image/*" required>
        <div class="file-info d-none">
          <span class="file-name"></span>
          <span class="file-status documento-cargado">✓ Cargado</span>
        </div>
        <div class="invalid-feedback">Por favor cargue este documento.</div>
      </div>
    `;
    return col;
  };

  // 📄 Cargar documentos comunes
  docsComunes.forEach(doc => {
    contComunes.appendChild(crearDocumentoItem(doc));
  });

  // 🚙 Cargar documentos del vehículo
  docsVehiculo.forEach(doc => {
    contVehiculo.appendChild(crearDocumentoItem(doc));
  });

  // 🩺 Cambiar dinámicamente la etiqueta de Buena Salud
  const radioSi = document.getElementById('choferSi');
  const radioNo = document.getElementById('choferNo');
  const labelSalud = document.getElementById('label-certSalud');

  function actualizarLabelSalud() {
    if (!labelSalud) return;
    labelSalud.textContent = radioSi.checked
      ? 'Certificado de Buena Salud (Titular) *'
      : 'Certificado de Buena Salud (Chofer) *';
  }

  radioSi?.addEventListener('change', actualizarLabelSalud);
  radioNo?.addEventListener('change', actualizarLabelSalud);
  actualizarLabelSalud();

});

// -------------------------------
// 🚀 Previsualización de documentos (idéntico a alta-titular)
// -------------------------------
function manejarCargaDocumento(input) {
  const file = input.files && input.files[0];
  const fileInfo = input.nextElementSibling; // <div class="file-info">
  const fileName = fileInfo?.querySelector('.file-name');

  // ===== helpers locales para el modal =====
  function ensurePreviewModal() {
    if (document.getElementById('imgPreviewModal')) return;

    const style = document.createElement('style');
    style.id = 'imgPreviewModalStyles';
    style.textContent = `
      .img-preview-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,.6);
        display: none; align-items: center; justify-content: center; z-index: 2000;
      }
      .img-preview-box {
        position: relative; background: #111; padding: 12px; border-radius: 10px;
        max-width: 90vw; max-height: 90vh; box-shadow: 0 8px 30px rgba(0,0,0,.6);
      }
      .img-preview-box img {
        max-width: 86vw; max-height: 80vh; display: block; border-radius: 6px;
      }
      .img-preview-close-delete {
        position: absolute; top: -10px; right: -10px;
        width: 32px; height: 32px;
        border: none; border-radius: 50%;
        background: #dc3545; color: #fff;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; line-height: 1;
      }
      .img-preview-actions {
        display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;
      }
      .img-preview-actions .btn-preview-close {
        display: inline-block;
        white-space: nowrap;
        line-height: 1.2;
        padding: 6px 12px;
        border: none; border-radius: 6px; cursor: pointer;
        background: #6c757d; color: #fff;
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'imgPreviewModal';
    overlay.className = 'img-preview-overlay';
    overlay.innerHTML = `
      <div class="img-preview-box" role="dialog" aria-modal="true">
        <button type="button" class="img-preview-close-delete" title="Eliminar (X)">×</button>
        <img id="imgPreviewModalImg" alt="Previsualización">
        <div class="img-preview-actions">
          <button type="button" class="btn-preview-close">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // cerrar con botón "Cerrar" o clic fuera
    overlay.querySelector('.btn-preview-close').addEventListener('click', () => overlay.style.display = 'none');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });
  }

  function openPreviewModal(url, ctx) {
    ensurePreviewModal();
    const overlay = document.getElementById('imgPreviewModal');
    const img = overlay.querySelector('#imgPreviewModalImg');
    img.src = url;
    overlay.style.display = 'flex';

    // Eliminar desde la X roja del modal
    const btnX = overlay.querySelector('.img-preview-close-delete');
    btnX.onclick = () => {
      if (ctx.inputRef) ctx.inputRef.value = '';
      if (ctx.wrapperRef) ctx.wrapperRef.remove();
      if (ctx.fileInfoRef) ctx.fileInfoRef.classList.add('d-none');
      if (ctx.urlRef) URL.revokeObjectURL(ctx.urlRef);
      overlay.style.display = 'none';
    };
  }
  // ===== fin helpers =====

  // Reset si no hay archivo
  if (!file) {
    if (fileInfo) fileInfo.classList.add('d-none');
    const oldWrapper = fileInfo?.querySelector('.file-thumb-wrapper');
    if (oldWrapper) oldWrapper.remove();
    return;
  }

  // Mostrar nombre
  if (fileName) fileName.textContent = file.name;
  if (fileInfo) fileInfo.classList.remove('d-none');

  // Crear/limpiar wrapper
  let wrapper = fileInfo.querySelector('.file-thumb-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'file-thumb-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.marginTop = '6px';
    fileInfo.appendChild(wrapper);
  } else {
    wrapper.innerHTML = '';
  }

  if (/^image\//.test(file.type)) {
    const url = URL.createObjectURL(file);

    // Miniatura
    const img = document.createElement('img');
    img.className = 'file-thumb';
    img.style.maxWidth = '120px';
    img.style.maxHeight = '120px';
    img.style.borderRadius = '6px';
    img.style.cursor = 'zoom-in';
    img.src = url;
    img._objectUrl = url;
    img.addEventListener('click', () => {
      openPreviewModal(url, { inputRef: input, wrapperRef: wrapper, urlRef: url, fileInfoRef: fileInfo });
    });
    wrapper.appendChild(img);

    // Botón eliminar miniatura
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '×';
    btn.style.position = 'absolute';
    btn.style.top = '-6px';
    btn.style.right = '-6px';
    btn.style.width = '22px';
    btn.style.height = '22px';
    btn.style.border = 'none';
    btn.style.borderRadius = '50%';
    btn.style.background = '#dc3545';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.fontSize = '14px';
    btn.style.lineHeight = '1';

    btn.addEventListener('click', e => {
      e.stopPropagation();
      input.value = '';
      wrapper.remove();
      if (fileInfo) fileInfo.classList.add('d-none');
      if (url) URL.revokeObjectURL(url);
    });

    wrapper.appendChild(btn);
  }
}

// 🚀 Asignar la lógica a todos los inputs de documentación del transporte
[
  'dni_frente',
  'dni_dorso',
  'carnet_frente',
  'carnet_dorso',
  'cert_salud',
  'foto_vehiculo',
  'cedula_verde',
  'seguro_vehiculo',
  'vto_vehiculo',
  'sellado_bromatologico'
].forEach(id => {
  const input = document.getElementById(id);
  if (input) input.addEventListener('change', function () {
    manejarCargaDocumento(this);
  });
});


// ======================================================
// 🔁 CARGA DE TITULARES (tipo=transporte) + BÚSQUEDA IDÉNTICA A COMERCIO (DNI/NOMBRE)
// ======================================================

let titularesTransporte = [];

// Cargar titulares transporte al abrir la página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/alta-comercio/titulares-ambulantes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Error al cargar titulares de transporte');
    titularesTransporte = await res.json();
  } catch (e) {
    console.error('No se pudieron cargar titulares transporte:', e);
    titularesTransporte = [];
  }
});

// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const res = await fetch('/api/alta-comercio/titulares-ambulantes?tipo=transporte', {
//       headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//     });
//     if (!res.ok) throw new Error('Error al cargar titulares de transporte');
//     titularesTransporte = await res.json();
//   } catch (e) {
//     console.error('No se pudieron cargar titulares transporte:', e);
//     titularesTransporte = [];
//   }
// });




// Helpers
function norm(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
function soloDigitos(s) { return String(s || '').replace(/\D/g, ''); }

// Referencias
const inputDni = document.getElementById('dniBuscar');
const inputNombre = document.getElementById('titularNombre');
const hiddenId = document.getElementById('titular');
const btnBuscarDni = document.getElementById('btnBuscarDni');
const contDocs = document.getElementById('contenedorDocTitular');

// =============== SUGERENCIAS EN VIVO POR DNI (idéntico a comercio) ===============
(function initSugerenciasDniTransporte() {
  if (!inputDni) return;

  const grupo = inputDni.closest('.input-group');
  grupo.classList.add('position-relative');

  const lista = document.createElement('div');
  lista.id = 'sugerenciasDniTransporte';
  lista.className = 'list-group position-absolute w-100';
  Object.assign(lista.style, {
    top: '100%',
    left: '0',
    zIndex: '1060',
    maxHeight: '220px',
    overflowY: 'auto',
    display: 'none'
  });
  grupo.appendChild(lista);

  function ocultar() { lista.style.display = 'none'; }
  function mostrar() { lista.style.display = 'block'; }

  document.addEventListener('click', (e) => { if (!grupo.contains(e.target)) ocultar(); });
  inputDni.addEventListener('keydown', (e) => { if (e.key === 'Escape') ocultar(); });

  inputDni.addEventListener('input', () => {
    // 👉 Solo números y máximo 8 dígitos (como comercio ambulante)
    let digits = soloDigitos(inputDni.value).slice(0, 8);
    inputDni.value = digits;

    const q = digits;
    if (q.length < 2 || !Array.isArray(titularesTransporte)) { ocultar(); return; }

    const matches = titularesTransporte
      .filter(t => String(t?.dni || '').startsWith(q))
      .slice(0, 5);

    if (!matches.length) { ocultar(); return; }

    lista.innerHTML = '';
    matches.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-group-item list-group-item-action';
      btn.textContent = `${t.nombre} — DNI: ${t.dni}`;
      btn.addEventListener('click', async () => {
        inputDni.value = t.dni;
        ocultar();

        // Seteo de campos (exacto a comercio)
        hiddenId.value = t.id_ambulante || t.id || t.id_razon_social || '';
        inputNombre.value = t.nombre || '';

        // Cargar documentación miniaturas
        await cargarDocumentacionTitularTransporte(hiddenId.value);
      });

      lista.appendChild(btn);
    });

    mostrar();
  });

  // Click en la lupa → búsqueda exacta (como comercio)
  btnBuscarDni?.addEventListener('click', () => {
    const q = soloDigitos(inputDni.value);
    if (!q || q.length < 8) {
      alert('Ingrese un DNI válido (8 dígitos).');
      return;
    }
    const t = titularesTransporte.find(x => String(x?.dni || '') === q);
    if (!t) {
      alert('No se encontró un titular con ese DNI.');
      hiddenId.value = '';
      inputNombre.value = 'Sin selección';
      if (contDocs) contDocs.innerHTML = '<p class="text-muted">Sin documentación disponible.</p>';
      return;
    }
    hiddenId.value = t.id_ambulante || t.id || t.id_razon_social || '';
    inputNombre.value = t.nombre || '';
    cargarDocumentacionTitularTransporte(hiddenId.value);
  });

  // Enter en el input DNI → acciona la lupa (igual comercio)
  inputDni.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnBuscarDni?.click();
    }
  });
})();

// =============== SUGERENCIAS EN VIVO POR NOMBRE (idéntico a comercio) ===============
(function initSugerenciasNombreTransporte() {
  if (!inputNombre) return;

  const grupo = inputNombre.closest('.input-group') || inputNombre.parentElement;
  grupo.classList.add('position-relative');

  const lista = document.createElement('div');
  lista.id = 'sugerenciasNombreTransporte';
  lista.className = 'list-group position-absolute w-100';
  Object.assign(lista.style, {
    top: '100%',
    left: '0',
    zIndex: '1060',
    maxHeight: '220px',
    overflowY: 'auto',
    display: 'none'
  });
  grupo.appendChild(lista);

  function ocultar() { lista.style.display = 'none'; }
  function mostrar() { lista.style.display = 'block'; }

  document.addEventListener('click', (e) => { if (!grupo.contains(e.target)) ocultar(); });
  inputNombre.addEventListener('keydown', (e) => { if (e.key === 'Escape') ocultar(); });

  inputNombre.addEventListener('input', () => {
    const q = norm(inputNombre.value);
    if (q.length < 2 || !Array.isArray(titularesTransporte)) { ocultar(); return; }

    const matches = titularesTransporte
      .filter(t => norm(t?.nombre).startsWith(q))
      .slice(0, 5);

    if (!matches.length) { ocultar(); return; }

    lista.innerHTML = '';
    matches.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-group-item list-group-item-action';
      btn.textContent = t.nombre;
      btn.addEventListener('click', async () => {
        inputNombre.value = t.nombre;
        ocultar();
        hiddenId.value = t.id_ambulante || t.id || t.id_razon_social || '';
        inputDni.value = t.dni || '';
        await cargarDocumentacionTitularTransporte(hiddenId.value);
      });
      lista.appendChild(btn);
    });

    mostrar();
  });
})();

// =============== MINIATURAS DE DOCUMENTACIÓN (idéntico a comercio) ===============
async function cargarDocumentacionTitularTransporte(idTitular) {
  if (!contDocs) return;
  contDocs.innerHTML = '<p class="text-muted">Cargando documentación...</p>';

  try {
    // Misma ruta/convención que comercio ambulante
    const res = await fetch(`/api/titular/documentos/${idTitular}?tipo=${encodeURIComponent('vendedor ambulante')}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Error al obtener documentación');
    const docs = await res.json();

    contDocs.innerHTML = '';

    const lista = [
      { clave: 'dni_frente', nombre: 'DNI Frente' },
      { clave: 'dni_dorso', nombre: 'DNI Dorso' },
      { clave: 'carnet_frente', nombre: 'Carnet Frente' },
      { clave: 'carnet_dorso', nombre: 'Carnet Dorso' },
      { clave: 'cert_residencia', nombre: 'Cert. de Residencia' }
    ];

    for (const doc of lista) {
      const ruta = docs[doc.clave];
      const col = document.createElement('div');
      col.className = 'col-md-3 text-center';

      if (ruta) {
        col.innerHTML = `
          <div class="doc-thumb">
            <img src="${ruta}" alt="${doc.nombre}" class="img-thumbnail" style="max-height:120px; cursor:pointer;">
            <p class="small mt-1">${doc.nombre}</p>
          </div>
        `;
        col.querySelector('img').addEventListener('click', () => window.open(ruta, '_blank'));
      } else {
        col.innerHTML = `
          <div class="doc-thumb border p-3 bg-light text-muted" style="height:120px; display:flex; align-items:center; justify-content:center;">
            No cargado
          </div>
          <p class="small mt-1">${doc.nombre}</p>
        `;
      }

      contDocs.appendChild(col);
    }
  } catch (err) {
    console.error(err);
    contDocs.innerHTML = `<p class="text-danger">Error al cargar documentación.</p>`;
  }
}

// ======================================================
// 🚛 Alta de Transporte - idéntico a alta de comercio
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAltaTransporte');
  result = null;

  if (!form) return;

  // === Envío del formulario ===
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();

    const patenteInput = document.getElementById('patente');
    const valor = patenteInput?.value.trim().toUpperCase() || '';
    const formatoPatente = /^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;

    // 🔹 Limpia cualquier error previo
    patenteInput.setCustomValidity('');
    patenteInput.value = valor;

    // 🔹 1. Validación local del formato
    if (!valor) {
      patenteInput.setCustomValidity('Debe ingresar una patente.');
    } else if (!formatoPatente.test(valor)) {
      patenteInput.setCustomValidity('Formato inválido. Ej: ABC123 o AB123CD.');
    } else {
      // 🔹 2. Validación remota (verificar si existe en el backend)
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alta-transporte/existe-patente?patente=${encodeURIComponent(valor)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.existe) {
          patenteInput.setCustomValidity('La patente ya está registrada.');
        } else {
          patenteInput.setCustomValidity('');
        }
      } catch (err) {
        console.error('Error verificando patente:', err);
        patenteInput.setCustomValidity('Error al verificar la patente.');
      }
    }

    // 🔹 3. Mostrar mensajes nativos del navegador
    if (!this.checkValidity()) {
      patenteInput.reportValidity(); // fuerza el mensaje del navegador si hay error
      this.classList.add('was-validated');
      return;
    }

    // ✅ 4. Si todo está correcto, continuar al resumen
    previsualizarTransporte();
  });

  // === Validación en vivo del campo "Patente" (fluida con espera en 6° carácter) ===
  const patenteInput = document.getElementById('patente');
  const formatoPatente = /^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;
  const invalidFeedback = patenteInput?.parentElement.querySelector('.invalid-feedback');
  let debounceTimer; // ⏱️ temporizador global

  if (patenteInput) {
    patenteInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const valor = patenteInput.value.trim().toUpperCase();
      patenteInput.value = valor;

      // Si está vacío → limpiar estados
      if (!valor) {
        patenteInput.classList.remove('is-invalid');
        patenteInput.setCustomValidity('');
        if (invalidFeedback) invalidFeedback.textContent = '';
        return;
      }

      // 🔹 Lógica fluida:
      // - menos de 6 → no validar
      // - 6 caracteres → esperar 2 s
      // - 7 caracteres → validar inmediatamente
      if (valor.length < 6) {
        patenteInput.classList.remove('is-invalid');
        patenteInput.setCustomValidity('');
        if (invalidFeedback) invalidFeedback.textContent = '';
        return;
      } else if (valor.length === 6) {
        debounceTimer = setTimeout(() => validarPatente(valor), 2000);
      } else if (valor.length === 7) {
        validarPatente(valor);
      } else if (valor.length > 7) {
        patenteInput.classList.add('is-invalid');
        patenteInput.setCustomValidity('La patente no puede tener más de 7 caracteres.');
        if (invalidFeedback) invalidFeedback.textContent = 'La patente no puede tener más de 7 caracteres.';
      }
    });

    // Validar también al salir del campo
    patenteInput.addEventListener('blur', () => {
      clearTimeout(debounceTimer);
      const valor = patenteInput.value.trim().toUpperCase();
      if (!valor) {
        patenteInput.classList.add('is-invalid');
        patenteInput.setCustomValidity('Debe ingresar una patente.');
        if (invalidFeedback) invalidFeedback.textContent = 'Debe ingresar una patente.';
      } else {
        validarPatente(valor);
      }
    });
  }

  // === Función central de validación ===
  async function validarPatente(valor) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/alta-transporte/existe-patente?patente=${encodeURIComponent(valor)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!formatoPatente.test(valor)) {
        patenteInput.classList.add('is-invalid');
        patenteInput.setCustomValidity('Formato inválido. Ej: ABC123 o AB123CD.');
        if (invalidFeedback) invalidFeedback.textContent = 'Formato inválido. Ej: ABC123 o AB123CD.';
      } else if (data.existe) {
        patenteInput.classList.add('is-invalid');
        patenteInput.setCustomValidity('La patente ya está registrada.');
        if (invalidFeedback) invalidFeedback.textContent = 'La patente ya está registrada.';
      } else {
        patenteInput.classList.remove('is-invalid');
        patenteInput.setCustomValidity('');
        if (invalidFeedback) invalidFeedback.textContent = '';
      }
    } catch (err) {
      console.error('Error verificando patente:', err);
      patenteInput.classList.add('is-invalid');
      patenteInput.setCustomValidity('Error al verificar la patente.');
      if (invalidFeedback) invalidFeedback.textContent = 'Error al verificar la patente.';
    }
  }

  // === Mostrar input adicional si elige "Otros (especificar)" ===
  const tipoAlimentoSelect = document.getElementById("tipoAlimento");
  const otroTipoInput = document.getElementById("otroTipoAlimento");

  if (tipoAlimentoSelect && otroTipoInput) {
    tipoAlimentoSelect.addEventListener("change", () => {
      if (tipoAlimentoSelect.value === "otros") {
        otroTipoInput.classList.remove("d-none");
        otroTipoInput.required = true;
        otroTipoInput.focus();
      } else {
        otroTipoInput.classList.add("d-none");
        otroTipoInput.required = false;
        otroTipoInput.value = "";
      }
    });
  }

});

// --- Capitalizar nombre del chofer ---
document.getElementById("nombreChofer")?.addEventListener("input", function (e) {
  const valor = e.target.value
    .toLowerCase()
    .replace(/\b\w/g, letra => letra.toUpperCase());
  e.target.value = valor;
});

document.addEventListener('hidden.bs.modal', function () {
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});

// --- Validar campo N° Carnet de Conducir: solo números y máximo 8 dígitos ---
document.getElementById("carnetChofer")?.addEventListener("input", function (e) {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
});

// --- Validación dinámica de teléfono del chofer (igual que comercio) ---
const codAreaChofer = document.getElementById('cod_area_chofer');
const telChofer = document.getElementById('telefono_chofer');

if (codAreaChofer && telChofer) {
  codAreaChofer.addEventListener('input', () => {
    codAreaChofer.value = codAreaChofer.value.replace(/\D/g, '');
    const len = codAreaChofer.value.length;
    let maxLen = 8;
    if (len === 2) maxLen = 8;
    else if (len === 3) maxLen = 7;
    else if (len === 4) maxLen = 6;
    telChofer.maxLength = maxLen;
  });

  telChofer.addEventListener('input', () => {
    telChofer.value = telChofer.value.replace(/\D/g, '');
  });
}

// === Validación y previsualización del formulario de transporte (idéntico a comercio) ===
document.getElementById('formAltaTransporte')?.addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();

  // Validar formulario
  if (this.checkValidity()) {
    previsualizarTransporte();
  } else {
    // 🔴 Asegurar foco y desplazamiento cuando hay errores
    setTimeout(() => {
      const primerInvalido = this.querySelector(':invalid');
      if (primerInvalido) {
        primerInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
        primerInvalido.focus({ preventScroll: true });
      }
    }, 50);
  }

  this.classList.add('was-validated');
});

// === Controlar visibilidad y validación de los datos del chofer ===
const choferSi = document.getElementById("choferSi");
const choferNo = document.getElementById("choferNo");
const bloqueChofer = document.getElementById("bloqueDatosChofer");

const camposChofer = [
  "nombreChofer",
  "dniChofer",
  "carnetChofer",
  "cod_area_chofer",
  "telefono_chofer"
].map(id => document.getElementById(id));

if (choferSi && choferNo) {
  // Si el titular es el chofer
  choferSi.addEventListener("change", () => {
    bloqueChofer.style.display = "none"; // ocultar bloque
    camposChofer.forEach(c => {
      c.removeAttribute("required");
      c.value = "";
    });
  });

  // Si el chofer es distinto del titular
  choferNo.addEventListener("change", () => {
    bloqueChofer.style.display = "block"; // mostrar bloque
    camposChofer.forEach(c => {
      c.setAttribute("required", true);
    });
  });
}

// === Función para generar el resumen del formulario de transporte (idéntico al comercio) ===
function previsualizarTransporte() {
  const choferEsTitular = document.getElementById("choferSi")?.checked;

  // --- TITULAR ---
  let resumenHTML = `
    <div class="preview-item">
      <span class="preview-label">DNI Titular:</span>
      <span class="preview-value">${document.getElementById("dniBuscar")?.value || ""}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Nombre Titular:</span>
      <span class="preview-value">${document.getElementById("titularNombre")?.value || ""}</span>
    </div>
  `;

  // --- CHOFER ---
  if (choferEsTitular) {
    resumenHTML += `
      <div class="preview-item">
        <span class="preview-label">Chofer:</span>
        <span class="preview-value fw-semibold text-success">El titular es el chofer.</span>
      </div>
    `;
  } else {
    resumenHTML += `
      <div class="preview-item">
        <span class="preview-label">Nombre del Chofer:</span>
        <span class="preview-value">${document.getElementById("nombreChofer")?.value || ""}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">DNI:</span>
        <span class="preview-value">${document.getElementById("dniChofer")?.value || ""}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">Carnet N°:</span>
        <span class="preview-value">${document.getElementById("carnetChofer")?.value || ""}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">Teléfono:</span>
        <span class="preview-value">(${document.getElementById("cod_area_chofer")?.value || ""}) ${document.getElementById("telefono_chofer")?.value || ""}</span>
      </div>
    `;
  }

  // --- VEHÍCULO ---
  resumenHTML += `
    <div class="preview-item">
      <span class="preview-label">Tipo de Vehículo:</span>
      <span class="preview-value">${document.getElementById("tipoVehiculo")?.selectedOptions[0]?.text || ""}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Patente:</span>
      <span class="preview-value">${document.getElementById("patente")?.value || ""}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Tipo de Alimento:</span>
      <span class="preview-value">${document.getElementById("tipoAlimento")?.value === "otros"
      ? document.getElementById("otroTipoAlimento")?.value.trim() || "Otros (especificar)"
      : document.getElementById("tipoAlimento")?.selectedOptions[0]?.text || ""}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Vencimiento VTO:</span>
      <span class="preview-value">${document.getElementById("vtoFecha")?.value || ""}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Vencimiento Seguro:</span>
      <span class="preview-value">${document.getElementById("seguroFecha")?.value || ""}</span>
    </div>
  `;

  // --- MONTOS Y PAGO ---
  resumenHTML += `
    <div class="preview-item">
      <span class="preview-label">Monto Sellado:</span>
      <span class="preview-value">${document.getElementById("montoSellado")?.value || ""}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Meses Abonados:</span>
      <span class="preview-value">${document.getElementById("mesesAdelantar")?.value || ""}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Monto Total:</span>
      <span class="preview-value fw-bold">${document.getElementById("montoTotal")?.value || ""}</span>
    </div>
  `;

  // --- DOCUMENTOS CARGADOS (solo visibles) ---
  const esChoferTitular = (typeof choferEsTitular !== "undefined")
    ? choferEsTitular
    : document.getElementById("choferSi")?.checked;

  // Tomar solo los labels visibles dentro del formulario
  let documentos = Array.from(document.querySelectorAll(".documento-item .form-label"))
    .filter(label => label.offsetParent !== null) // ✅ Solo los visibles en pantalla
    .map(label => label.textContent.trim().replace(/\*+$/, "").trim())
    .filter(texto => texto !== "");

  // Si el chofer es titular, se mantienen los del titular (como Certificado de Buena Salud)
  // y se excluyen solo los del chofer (DNI, Carnet)
  if (esChoferTitular) {
    const excluir = [
      "DNI Frente (Chofer)",
      "DNI Dorso (Chofer)",
      "Carnet Frente (Chofer)",
      "Carnet Dorso (Chofer)"
    ];
    documentos = documentos.filter(d => !excluir.includes(d));
  }

  const listaDocumentos = documentos.length
    ? documentos.map(d => `${d} *`).join("<br>")
    : "Sin documentos cargados.";

  resumenHTML += `
  <div class="preview-item">
    <span class="preview-label">Documentos Cargados:</span>
    <span class="preview-value">${listaDocumentos}</span>
  </div>
`;

  // --- Mostrar en el modal ---
  const preview = document.getElementById("previewContent");
  if (preview) preview.innerHTML = resumenHTML;

  const modal = new bootstrap.Modal(document.getElementById("previewModal"));
  modal.show();
}

// === Cargar archivos en documentosCargados (idéntico a comercio) ===
document.querySelectorAll('input[type="file"]').forEach(input => {
  input.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      documentosCargados[this.name] = this.files[0];
    } else {
      delete documentosCargados[this.name];
    }
  });
});

// === Confirmación final: igual que comercio, adaptado a transporte ===
document.getElementById('btnConfirmarModal')?.addEventListener('click', async function () {
  const form = document.getElementById('formAltaTransporte');
  if (!form) return;

  // misma validación que comercio
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  // confirmar → verificar (solo titular) → enviar
  const ok = await verificarVehiculoAntesDeEnviar();
  if (!ok) return;

  await enviarFormularioTransporte();
});


// === Verificación previa antes de enviar (idéntico a comercio, adaptado a transporte) ===
async function verificarVehiculoAntesDeEnviar() {
  try {
    const titularId = document.getElementById('titular')?.value;
    if (!titularId) return true;

    // igual que comercio: consultar el "siguiente número" SOLO por titular
    const resp = await fetch(`/api/alta-transporte/vehiculo-siguiente?titular=${encodeURIComponent(titularId)}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!resp.ok) return true;

    const data = await resp.json();
    const n = Number(data?.proximoVehiculo || 1);

    if (n >= 1) {
      if (n > 1) {
        const confirmar = window.confirm(
          `Ya existe un transporte para este titular.\n¿Desea dar de alta como Vehículo ${n}?`
        );
        if (!confirmar) return false;
      }
      // igual que comercio: guardar el número sugerido para el envío
      window.vehiculoSugerido = n;
    }

    return true;
  } catch (e) {
    console.error('verificarVehiculoAntesDeEnviar error:', e);
    // igual que comercio: no bloquear si la verificación falla
    return true;
  }
}

// === Envío final del formulario (idéntico al comercio, adaptado a transporte) ===
async function enviarFormularioTransporte() {
  try {
    const form = document.getElementById('formAltaTransporte');
    const formData = new FormData(form);

    // Agregar datos básicos (idéntico estilo a Comercio, adaptado a transporte)
    formData.append('id_titular_ambulante', document.getElementById('id_titular_ambulante')?.value || document.getElementById('titular')?.value || '');
    formData.append('tipo_vehiculo', document.getElementById('tipo_vehiculo')?.value || document.getElementById('tipoVehiculo')?.value || '');

    const tipoAlimento =
      document.getElementById("tipoAlimento").value === "otros"
        ? document.getElementById("otroTipoAlimento").value.trim()
        : document.getElementById("tipoAlimento").value;

    formData.append("tipo_alimento", tipoAlimento || "");


    formData.append('vto_fecha', document.getElementById('vtoFecha')?.value || '');
    formData.append('seguro_fecha', document.getElementById('seguroFecha')?.value || '');

    // Datos del chofer (exactos como los espera el backend)
    formData.append('nombre_chofer', document.getElementById('nombreChofer')?.value || '');
    formData.append('dni_chofer', document.getElementById('dniChofer')?.value || '');
    formData.append('carnet_chofer', document.getElementById('carnetChofer')?.value || '');
    const codChofer = document.getElementById('cod_area_chofer')?.value?.trim() || '';
    const numChofer = document.getElementById('telefono_chofer')?.value?.trim() || '';
    const telChofer = (codChofer && numChofer)
      ? `${codChofer}-${numChofer}`
      : (document.getElementById('telefonoChofer')?.value || '');

    formData.append('telefono_chofer', telChofer);

    // Montos (mismo criterio que Comercio)
    formData.append('monto_sellado', (document.getElementById('montoSellado')?.value || '').replace(/[^\d]/g, '') || '0');
    formData.append('meses_adelantados', document.getElementById('mesesAdelantar')?.value || '1');
    formData.append('monto_total', (document.getElementById('montoTotal')?.value || '').replace(/[^\d]/g, '') || '0');


    // 📦 Si existe número sugerido, agregarlo (igual que comercio)
    if (window.vehiculoSugerido) {
      formData.append('numeroVehiculo', window.vehiculoSugerido);
    }

    // 📤 Enviar formulario
    const response = await fetch('/api/alta-transporte/registrar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });

    if (!response.ok) {
      alert('Error al registrar el transporte.');
      return;
    }

    const data = await response.json();
    // Mensaje de éxito solo para el primer vehículo (igual criterio que comercio con Sucursal 1)
    const nro = Number(window.vehiculoSugerido || formData.get('numeroVehiculo') || 1);
    alert('El registro y habilitación del vehículo fueron exitosas.');


    // ✅ Ocultar modal de previsualización (si está abierto)
    const previewModalEl = document.getElementById('previewModal');
    if (previewModalEl) {
      const modalInstance = bootstrap.Modal.getInstance(previewModalEl);
      if (modalInstance) modalInstance.hide();
    }

    // === Generar y mostrar QR (idéntico a comercio, adaptado) ===
    const respQR = await fetch(`/api/alta-transporte/qr/${data.idTransporte}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const dataQR = await respQR.json();
    if (dataQR?.ok && dataQR.qr_path) {
      // 🧹 Eliminar overlay anterior si existía
      const oldOverlay = document.getElementById('qrOverlay');
      if (oldOverlay) oldOverlay.remove();

      // 💅 Estilos del overlay (idéntico a comercio)
      const style = document.createElement('style');
      style.textContent = `
.qr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:2100}
.qr-box{background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.25);padding:22px;width:min(92vw,600px);text-align:center}
.qr-title{margin:0 0 6px;font-weight:700;font-size:1.2rem}
.qr-sub{margin:0 0 12px;color:#555}
.qr-actions{display:flex;justify-content:flex-end;margin-top:12px}
.qr-close{border:none;border-radius:6px;padding:6px 12px;cursor:pointer;background:#6c757d;color:#fff}
      `;
      document.head.appendChild(style);

      // 🧱 Crear overlay QR
      const overlay = document.createElement('div');
      overlay.id = 'qrOverlay';
      overlay.className = 'qr-overlay';
      overlay.innerHTML = `
<div class="qr-box" role="dialog" aria-modal="true">
  <p class="qr-title">Código QR generado</p>
  <p class="qr-sub">Enviado por mail al titular del vehículo.</p>
  <img id="qrImage" alt="Código QR" style="display:block;max-width:320px;max-height:320px;margin:auto"/>
  <div class="qr-actions">
    <button type="button" id="qrClose" class="qr-close">Cerrar</button>
  </div>
</div>`;
      document.body.appendChild(overlay);

      // 🖼️ Mostrar QR
      const img = document.getElementById('qrImage');
      img.src = dataQR.qr_path;

      // 🎯 Redirigir solo al cerrar (igual que comercio)
      document.getElementById('qrClose').onclick = () => {
        document.getElementById('qrOverlay').style.display = 'none';
        window.location.href = 'bromatologia.html';
      };
    }

  } catch (error) {
    console.error('Error en enviarFormularioTransporte:', error);
    alert('Ocurrió un error al enviar el formulario de transporte.');
  }
}





