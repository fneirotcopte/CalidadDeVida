// Datos de rubros por categoría
const rubrosPorCategoria = {
  "comercio en general": [
    "Almacén", "Autoservicio", "Carnicería", "Despensa",
    "Dietética/Herboristería", "Expendio de bebidas", "Fiambrería",
    "Heladería", "Hipermercado", "Kiosco", "Minimercado",
    "Panadería", "Pescadería", "Pollería", "Supermercado",
    "Verdulería", "Vinoteca"
  ],
  "vendedor ambulante": [
    "Venta de golosinas", "Venta de panificados caseros",
    "Venta de frutas y verduras", "Venta de productos regionales",
    "Venta de artesanías", "Venta de ropa usada",
    "Venta de bijouterie", "Venta de baratijas y juguetes",
    "Venta de chipá/tortillas/empanadas",
    "Venta de escobas y artículos de limpieza",
    "Venta de alimentos envasados", "Venta de plantas",
    "Venta de accesorios para celulares"
  ],
  "bares nocturnos, confiterias y restaurantes": [
    "Bar", "Confitería", "Restaurante", "Boliche/Discoteca",
    "Cervecería artesanal", "Parrilla", "Rotisería", "Pizzería",
    "Cafetería", "Comedor", "Buffet", "Casa de Té",
    "Patio de comidas", "Local de comidas rápidas", "Food hall",
    "Delivery de comidas preparadas", "Catering de eventos",
    "Bar cultural/Peña/Pub", "Bar con espectáculo en vivo", "Cantina"
  ],
  "food truck": [
    "Hamburguesas gourmet", "Pizzas al paso",
    "Pochoclos/Algodón de azúcar", "Papas fritas/Snacks",
    "Comida Mexicana (tacos, burritos)", "Sándwiches/Lomitos",
    "Comida vegana/vegetariana", "Jugos naturales/smoothies",
    "Postres/Repostería", "Comida árabe (shawarma, kebab)",
    "Empanadas", "Wafles/Panqueques", "Helados artesanales",
    "Café móvil", "Sushi/Comida Japonesa",
    "Arepas/Comida venezolana", "Cervezas Artesanales"
  ]
};

// === CARGA AUTOMÁTICA DE RUBROS Y ANEXOS SEGÚN CATEGORÍA ===

// Cargar rubros para un select específico según la categoría
function cargarRubros(selectElement, categoria) {
  selectElement.innerHTML = '<option value="" selected disabled>Seleccione un rubro</option>';

  // Siempre usar categoría en minúscula para evitar desajustes
  const categoriaKey = (categoria || '').toLowerCase();
  const rubros = rubrosPorCategoria[categoriaKey] || [];

  rubros.forEach(rubro => {
    const option = document.createElement('option');
    option.value = rubro;
    option.textContent = rubro;
    selectElement.appendChild(option);
  });
}

// Obtener rubros disponibles para anexos según la categoría y los seleccionados
function obtenerRubrosDisponibles(categoria, cantidadAnexos) {
  const categoriaKey = (categoria || '').toLowerCase();
  const rubrosDisponibles = rubrosPorCategoria[categoriaKey] ? [...rubrosPorCategoria[categoriaKey]] : [];

  for (let i = 1; i <= cantidadAnexos; i++) {
    const anexoSelect = document.getElementById(`anexo${i}`);
    if (anexoSelect && anexoSelect.value) {
      const index = rubrosDisponibles.indexOf(anexoSelect.value);
      if (index !== -1) rubrosDisponibles.splice(index, 1);
    }
  }
  return rubrosDisponibles;
}

// Actualizar disponibilidad de rubros en todos los anexos
function actualizarDisponibilidadRubros(categoria) {
  const anexosContainer = document.getElementById('anexosContainer');
  const anexos = anexosContainer.querySelectorAll('.anexo-select');
  const cantidadAnexos = anexos.length;

  const categoriaKey = (categoria || '').toLowerCase();
  const rubrosDisponibles = obtenerRubrosDisponibles(categoriaKey, cantidadAnexos);

  anexos.forEach(anexo => {
    const valorActual = anexo.value;

    anexo.innerHTML = '<option value="" selected disabled>Seleccione un rubro adicional</option>';

    rubrosDisponibles.forEach(rubro => {
      const option = document.createElement('option');
      option.value = rubro;
      option.textContent = rubro;
      anexo.appendChild(option);
    });

    // Mantener valor actual si corresponde
    if (valorActual && !rubrosDisponibles.includes(valorActual)) {
      const option = document.createElement('option');
      option.value = valorActual;
      option.textContent = valorActual;
      anexo.appendChild(option);
      anexo.value = valorActual;
    }
  });
}

// Agregar nuevo anexo
let anexoCount = 1;
function agregarAnexo() {
  const categoria = document.getElementById('categoriaComercio').value;
  anexoCount++;

  const anexosContainer = document.getElementById('anexosContainer');
  const nuevoAnexoDiv = document.createElement('div');
  nuevoAnexoDiv.classList.add('row', 'g-2', 'mb-2');
  nuevoAnexoDiv.id = `anexo${anexoCount}Group`;

  nuevoAnexoDiv.innerHTML = `
    <div class="col-md-10">
      <select class="form-select anexo-select" id="anexo${anexoCount}">
        <option value="" selected disabled>Seleccione un rubro adicional</option>
      </select>
    </div>
    <div class="col-md-2">
      <button type="button" class="btn btn-outline-primary w-100" onclick="removeAnexo(${anexoCount})">
        <i class="fas fa-times"></i> Eliminar
      </button>
    </div>
  `;

  anexosContainer.insertBefore(nuevoAnexoDiv, document.getElementById('btnAddAnexo'));

  // Cargar rubros disponibles
  const rubrosDisponibles = obtenerRubrosDisponibles(categoria, anexoCount);
  const nuevoSelect = document.getElementById(`anexo${anexoCount}`);

  rubrosDisponibles.forEach(rubro => {
    const option = document.createElement('option');
    option.value = rubro;
    option.textContent = rubro;
    nuevoSelect.appendChild(option);
  });

  actualizarDisponibilidadRubros(categoria);
}

// Eliminar anexo
function removeAnexo(numero) {
  const anexoDiv = document.getElementById(`anexo${numero}Group`);
  if (anexoDiv) anexoDiv.remove();
  const categoria = document.getElementById('categoriaComercio').value;
  actualizarDisponibilidadRubros(categoria);
}

// Listener del botón "Agregar otro rubro"
const btnAddAnexo = document.getElementById('btnAddAnexo');
if (btnAddAnexo) {
  btnAddAnexo.addEventListener('click', agregarAnexo);
}

// === CARGA AUTOMÁTICA DE ANEXOS DESDE LA BASE DE DATOS ===
function cargarAnexosDesdeBD(data) {
  const categoria = data.categoria;
  const anexosContainer = document.getElementById('anexosContainer');
  const btnAddAnexo = document.getElementById('btnAddAnexo');

  // Limpiar anexos anteriores (excepto el primero)
  anexosContainer.querySelectorAll('.row.g-2.mb-2').forEach((div, i) => {
    if (i > 0) div.remove();
  });

  if (data.anexos && data.anexos.length > 0) {
    const totalAnexos = data.anexos.length;

    // Generar los selects necesarios
    for (let i = 1; i < totalAnexos; i++) {
      agregarAnexo();
    }

    // Asignar valores de BD
    data.anexos.forEach((anexo, index) => {
      const anexoSelect = document.getElementById(`anexo${index + 1}`);
      if (anexoSelect) {
        cargarRubros(anexoSelect, categoria);
        anexoSelect.value = anexo || '';

        // Evento artificial para que el formulario detecte el cambio
        anexoSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

  } else {
    // Si no tiene anexos, dejar solo el primero vacío
    const anexo1 = document.getElementById('anexo1');
    cargarRubros(anexo1, categoria);
    anexo1.value = '';
  }

  if (btnAddAnexo) btnAddAnexo.disabled = false;

  // Sincronizar contador global
  anexoCount = document.querySelectorAll('#anexosContainer .anexo-select').length;
}

// 🔄 Quitar naranja en vivo cuando un campo cambia
document.addEventListener("input", (e) => {
  const el = e.target;

  if (el.classList.contains("campo-no-modificado")) {
    el.classList.remove("campo-no-modificado");
  }
});

// Documentos requeridos (COMERCIO / LOCAL + AMBULANTES)
const documentosRequeridos = {
  comunes: [
    { id: "doc_declaracion_rentas", nombre: "Declaración jurada de Rentas", requerido: true },
    { id: "sellado_bromatologico", nombre: "Último pago / Sellado Bromatológico", requerido: true }
  ],

  "comercio en general": [
    { id: "doc_plano", nombre: "Plano del local aprobado", requerido: true },
    { id: "doc_alquiler", nombre: "Contrato de alquiler", requerido: true }
  ],

  "bares nocturnos, confiterias y restaurantes": [
    { id: "doc_plano", nombre: "Plano del local aprobado", requerido: true },
    { id: "doc_alquiler", nombre: "Contrato de alquiler", requerido: true },
    { id: "doc_seguridad", nombre: "Factibilidad de seguridad", requerido: true },
    { id: "doc_bomberos", nombre: "Certificado de bomberos", requerido: true }
  ],

  "food truck": [
    { id: "doc_manipulacion", nombre: "Certificado de manipulación de alimentos", requerido: true },
    { id: "doc_seguro", nombre: "Póliza de seguro", requerido: true },
    { id: "doc_permiso", nombre: "Permiso de ubicación", requerido: true }
    // El comprobante de pago ya está en "comunes"
  ],

  "vendedor ambulante": [
    { id: "doc_frentista", nombre: "Conformidad del frentista", requerido: true }
    // El pago/sellado ya está en documentos comunes
    // No se pide declaración jurada de rentas
  ]
};

// === Modal idéntico a transporte (se crea si no existe) ===
crearModalPreview = () => {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'modalPreview';
  modal.tabIndex = -1;
  modal.setAttribute('data-bs-backdrop', 'static');
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content bg-dark text-center">
        <div class="modal-body">
          <img src="" class="img-fluid rounded mb-3" style="max-height: 80vh; object-fit: contain;">
          <div>
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  return modal;
};

// --- Rutas públicas de archivos (idéntico a transporte, adaptado a comercio) ---
const pathPublico = (ruta = '') => {
  if (!ruta) return '';
  const idx = ruta.indexOf('uploads/');
  if (idx !== -1) {
    return '/' + ruta.slice(idx).replace(/\\/g, '/');
  }
  if (ruta.startsWith('/uploads/') || ruta.startsWith('uploads/'))
    return `/${ruta.replace(/^\/?/, '')}`;
  return `/uploads/documentos_comercio/${ruta}`;
};

// --- Limpiar UI (idéntico a transporte, adaptado a contenedor de comercio) ---
limpiarDocumentacionUI = () => {
  if (!contenedorDocComercio) return;
  contenedorDocComercio.innerHTML = `<div class="row g-4 justify-content-start"></div>`;
  reemplazosDocs.clear();
};

// --- Renderiza las miniaturas replicando el aspecto del titular en alta (COPIA EXACTA DE TRANSPORTE, ADAPTADA A COMERCIO) ---
const mostrarDocumentacionComercio = (documentos = []) => {
  limpiarDocumentacionUI();
  const row = contenedorDocComercio.querySelector('.row') || contenedorDocComercio;

  if (!documentos.length) {
    row.innerHTML = `<p class="text-muted">No hay documentos cargados para este comercio.</p>`;
    return;
  }

  documentos.forEach((doc) => {
    const col = document.createElement('div');
   col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 text-center mb-3';
    col.dataset.tipoDocumento = doc.tipo_documento || doc.tipo || '';

    const wrap = document.createElement('div');
    wrap.className = 'position-relative d-inline-block';
    wrap.style.width = '100%';
    wrap.style.height = '140px';
    wrap.style.overflow = 'hidden';

    // === Imagen real o genérica ===
    let srcVista = '';
    if (!doc.ruta_archivo || doc.faltante) {
      srcVista = '/img/Bromat-docu.png';
    } else {
      srcVista = pathPublico(doc.ruta_archivo || doc.archivo || '');
    }

    const vista = document.createElement('img');
    vista.src = srcVista;

    vista.alt = doc.tipo_documento || doc.tipo || 'documento';
    vista.className = 'img-thumbnail';
    vista.style.maxHeight = '120px';
    vista.style.height = '100%';
    vista.style.cursor = 'pointer';
    vista.style.objectFit = 'contain';

    vista.addEventListener('click', () => {
      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('modalPreview') || crearModalPreview()
      );
      const img = document.querySelector('#modalPreview img');
      img.src = vista.src;
      modal.show();
    });

    const btnRenovar = document.createElement('button');
    btnRenovar.type = 'button';
    btnRenovar.className =
      'btn btn-success btn-sm rounded-circle position-absolute shadow d-flex align-items-center justify-content-center';
    btnRenovar.style.top = '3px';
    btnRenovar.style.right = '3px';
    btnRenovar.style.width = '28px';
    btnRenovar.style.height = '28px';
    btnRenovar.title = 'Reemplazar documento';
    btnRenovar.innerHTML = '<i class="fas fa-sync-alt"></i>';

    btnRenovar.addEventListener('click', () => {
      const formEl = document.getElementById('formRenovacionComercio');
      const key = (doc.tipo_documento || doc.tipo || 'documento').toString();

      // Si ya estaba seleccionado, des-seleccionar y limpiar
      if (reemplazosDocs.has(key)) {
        reemplazosDocs.delete(key);

        // quitar input oculto previo (si existe)
        const previo = formEl?.querySelector(`input[type="file"][name="${key}"]`);
        if (previo) previo.remove();

        // restaurar vista
        if (!doc.ruta_archivo || doc.faltante) {
          vista.src = '/img/Bromat-docu.png';
        } else {
          vista.src = pathPublico(doc.ruta_archivo);
        }

        // 🔹 restaurar borde “normal” (verde) y estado
        vista.style.border = '1px solid #1b7937ff';
        vista.classList.remove('doc-reemplazado', 'campo-no-modificado', 'is-invalid');

        // eliminar etiqueta azul si existía
        const etiquetaAzul = col.querySelector('.doc-reemplazado-etiqueta');
        if (etiquetaAzul) etiquetaAzul.remove();

        btnRenovar.classList.remove('btn-info');
        btnRenovar.classList.add('btn-success');
        btnRenovar.innerHTML = '<i class="fas fa-sync-alt"></i>';
        return;
      }

      // crear input oculto DENTRO del form para que FormData(form) lo tome
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*,application/pdf';
      inp.name = key;                 // ← CLAVE: nombre de campo que Multer espera
      inp.classList.add('d-none');
      formEl?.appendChild(inp);

      inp.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
          // si canceló el diálogo, limpiar el input oculto
          inp.remove();
          return;
        }

        // registrar en el map (por compatibilidad con tu lógica actual)
        reemplazosDocs.set(key, file);

        // previsualizar
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          vista.src = url;
        } else {
          vista.src = '/img/pdf_icon.png';
        }

        // 🔹 borde CELESTE para documento reemplazado
        vista.style.border = '2px solid #0dcaf0';
        vista.classList.add('doc-reemplazado');
        vista.classList.remove('campo-no-modificado', 'is-invalid');

        // remover etiqueta roja si existe
        const msgPlaceholder = col.querySelector('.msg-placeholder');
        if (msgPlaceholder) msgPlaceholder.remove();

        // crear / actualizar etiqueta azul
        let etiquetaAzul = col.querySelector('.doc-reemplazado-etiqueta');
        if (!etiquetaAzul) {
          etiquetaAzul = document.createElement('span');
          etiquetaAzul.className = 'doc-reemplazado-etiqueta';
          col.appendChild(etiquetaAzul);
        }
        etiquetaAzul.textContent = 'Reemplazado';

        btnRenovar.classList.remove('btn-success');
        btnRenovar.classList.add('btn-info');
        btnRenovar.innerHTML = '<i class="fas fa-check" style="font-size:1.1rem;color:white;"></i>';

      };

      // abrir selector
      inp.click();
    });

    const etiqueta = document.createElement('p');
    etiqueta.className = 'small mt-1';
    let textoEtiqueta = doc.tipo_documento || doc.tipo || 'Documento';
    etiqueta.textContent = textoEtiqueta;

    wrap.appendChild(vista);
    wrap.appendChild(btnRenovar);
    col.appendChild(wrap);
    col.appendChild(etiqueta);
    row.appendChild(col);
  });
};



// ====== Estado global ======
let _dataOriginal = null;           // Datos originales del comercio (para validación naranja)
const reemplazosDocs = new Map();   // Map(tipoDoc -> File)

// =======================================
// renovacion-comercio.js
// Replica exacta de la lógica de renovación transporte adaptada
// =======================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ renovacion-comercios.js cargado');

  // ====== Referencias del DOM ======
  const idComercio = document.getElementById('idComercio');
  const btnBuscarComercio = document.getElementById('btnBuscarComercio');
  const categoriaEl = document.getElementById('categoriaComercio');

  // 🆕 Botón reset
  const btnResetComercio = document.getElementById('btnResetComercio');
  btnResetComercio.addEventListener('click', () => {
    location.reload();
  });

  // --- Mostrar modal de advertencia al ingresar ---
  const modalEl = document.getElementById('modalAdvertencia');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    const campoId = document.getElementById('idComercio');
    const boton = modalEl.querySelector('.btn-primary');
    if (boton) {
      boton.addEventListener('click', () => {
        if (campoId) campoId.focus({ preventScroll: true });
      });
    }
  }

  // --- Desactivar todos los campos hasta que se cargue un comercio ---
  const camposBloqueados = document.querySelectorAll(
    'input, select, textarea, button:not(#btnBuscarComercio):not(#btnAceptarModal)'
  );
  camposBloqueados.forEach(el => el.disabled = true);

  // --- Rehabilitar solo el campo del número de habilitación y la lupa ---
  idComercio.disabled = false;
  btnBuscarComercio.disabled = false;

  // === Aplicar color y bloqueo a campos no modificables ===
  function aplicarBloqueoCamposInicial() {
    const colorBloqueado = '#e4f8e9ff'; // verde menta claro, más apagado
    const soloLectura = [
      'categoriaComercio',
      'tipoPersona',
      'docIdentidad',
      'nombreRazon',
      'nombreRepresentante',
      'dni_representante',
      'cod_area_representante',
      'telefono_representante',
      'correo_representante',
      'rubro',              // 🟢 agregado
      'numeroSucursal',     // 🟢 agregado
      'nombreComercial'     // 🟢 agregado
    ];

    soloLectura.forEach(id => {
      const campo = document.getElementById(id);
      if (campo) {
        campo.style.backgroundColor = colorBloqueado;
        campo.readOnly = true;
      }
    });
  }

  // ====== Buscar por número de habilitación ======
  // === FUNCIÓN REUTILIZABLE PARA CARGAR COMERCIO ===
  async function buscarComercio() {
    const id = (idComercio.value || '').trim();
    if (!id) {
      alert('Ingrese un número de habilitación válido.');
      return;
    }

    try {
      const resp = await fetch(`/api/renovacion-comercio/datos?id_comercio=${encodeURIComponent(id)}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (!resp.ok) {
        if (resp.status === 404) {
          alert('No se encontró comercio con ese número de habilitación.');
          return;
        }
        throw new Error('Error en la consulta');
      }

      const data = await resp.json();

      _dataOriginal = data;
      console.log("DATA ORIGINAL COMPLETA:", _dataOriginal);

      // 🔥 Necesario para que el resumen y todo el sistema lean datos reales
      window._dataComercioActual = data;

      // ✅ Desbloquear campos al cargar comercio correctamente
      camposBloqueados.forEach(el => el.disabled = false);

      // === Rellenar campos (respetando readonly de titular y representante) ===
      // Comercios
      categoriaComercio.value = data.categoria
        ? data.categoria.charAt(0).toUpperCase() + data.categoria.slice(1)
        : '';

      // === CARGA DE RUBRO, SUCURSAL Y NOMBRE COMERCIAL (readonly) ===
      const rubroPrincipal = document.getElementById('rubro');
      const numeroSucursal = document.getElementById('numeroSucursal');
      const nombreComercial = document.getElementById('nombreComercial');

      // Cargar desde la BD
      if (rubroPrincipal) {
        rubroPrincipal.value = data.rubro || '';
        rubroPrincipal.readOnly = true;
      }

      if (numeroSucursal) {
        numeroSucursal.value = data.sucursal || '';
        numeroSucursal.readOnly = true;
      }

      if (nombreComercial) {
        nombreComercial.value = data.nombre_comercial || '';
        nombreComercial.readOnly = true;
      }

      direccion.value = data.direccion || '';
      ubicacion.value = data.geolocalizacion || '';

      // === GOOGLE MAPS (REPLICA EXACTA DE ALTA DE COMERCIO) ===
      const btnBuscarMapa = document.getElementById('btnBuscarMapa');
      const ubicacionInput = document.getElementById('ubicacion');

      // Evento para abrir Google Maps directamente
      btnBuscarMapa.addEventListener('click', function () {
        const direccion = document.getElementById('direccion').value;
        const url = direccion
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
          : 'https://www.google.com/maps';
        window.open(url, '_blank');

        // Mostrar instrucciones
        alert('Por favor:\n1. Busque la ubicación en Google Maps\n2. Haga clic en "Compartir"\n3. Seleccione "Copiar enlace"\n4. Pegue el enlace en el campo de Ubicación');
      });

      // Validar formato del enlace al pegar
      ubicacionInput.addEventListener('paste', function (e) {
        setTimeout(() => {
          const textoPegado = e.clipboardData?.getData('text') || this.value;
          if (textoPegado.includes('maps.app.goo.gl') || textoPegado.includes('google.com/maps')) {
            this.value = textoPegado;
            actualizarMiniMapa(textoPegado);
          } else {
            alert('Por favor pegue un enlace válido de Google Maps (formato maps.app.goo.gl/...)');
            this.value = '';
          }
        }, 10);
      });


      cod_area_comercio.value = data.cod_area_comercio || ''; // si no viene en backend, queda vacío
      telefono_comercio.value = data.telefono || '';
      correoElectronico.value = data.correo_electronico || '';

      // === Teléfono del comercio: separar código de área y número ===
      if (data.telefono) {
        const partesTel = data.telefono.split('-').map(p => p.trim());
        cod_area_comercio.value = partesTel[0] || '';
        telefono_comercio.value = partesTel[1] || '';
      } else {
        cod_area_comercio.value = '';
        telefono_comercio.value = '';
      }


      // === Validación dinámica del teléfono (réplica EXACTA de alta comercio) ===
      const codAreaInput = document.getElementById('cod_area_comercio');
      const telefonoInput = document.getElementById('telefono_comercio');

      if (codAreaInput && telefonoInput) {

        codAreaInput.addEventListener('input', () => {

          // Solo dígitos
          codAreaInput.value = codAreaInput.value.replace(/\D/g, '');

          const len = codAreaInput.value.length;
          let maxLen = 8; // por defecto

          if (len === 2) maxLen = 8;
          else if (len === 3) maxLen = 7;
          else if (len === 4) maxLen = 6;

          telefonoInput.maxLength = maxLen;
        });

        telefonoInput.addEventListener('input', () => {
          // Solo dígitos
          telefonoInput.value = telefonoInput.value.replace(/\D/g, '');
        });
        // Activar el ajuste del maxLength después de cargar los datos y después de crear los listeners
        codAreaInput.dispatchEvent(new Event("input"));
      }

      metrosCuadrados.value = data.metros_cuadrados || '';

      // === Cargar rubros anexos automáticamente desde la BD ===
      if (typeof cargarAnexosDesdeBD === 'function') {
        cargarAnexosDesdeBD(data);
      }

      // Convertir a número entero y recalcular montos automáticamente
      metrosCuadrados.value = parseInt(metrosCuadrados.value) || 0;
      if (typeof calcularMontos === 'function') {
        calcularMontos();
      }

      // Titular / Empresa
      const nombreCompleto = [data.nombre_titular, data.apellido_titular].filter(Boolean).join(' ');
      if (data.persona_fisica === 1) {
        // Persona física: nombre y apellido del titular
        nombreRazon.value = nombreCompleto || data.nombre_completo_titular || '';
      } else {
        // Persona jurídica: Razón Social desde tabla razon_social
        nombreRazon.value = data.razon_social || '';
      }

      docIdentidad.value = data.dni_titular || data.cuit_titular || '';

      // Documento de identidad o CUIT/CUIL según tipo de persona
      if (data.persona_fisica === 1) {
        // Persona física: usar CUIT o CUIL (no DNI)
        docIdentidad.value = data.cuit_titular || '';
      } else {
        // Persona jurídica: CUIT desde tabla razon_social
        docIdentidad.value = data.cuit_titular || '';
      }
      console.log('📞 Valor recibido de telefono_titular:', data.telefono_titular);
      // Teléfono (desde tabla razon_social)
      if (data.telefono_titular) {
        const partesTel = data.telefono_titular.split('-').map(p => p.trim());
        cod_area_representante.value = partesTel[0] || '';
        telefono_representante.value = partesTel[1] || '';
      } else {
        cod_area_representante.value = '';
        telefono_representante.value = '';
      }


      // Correo electrónico (desde tabla razon_social)
      correo_representante.value = data.correo_titular || '';

      // Representante legal (solo si es persona jurídica)
      if (data.persona_fisica === 0) {
        nombreRepresentante.value = [data.nombre_representante, data.apellido_representante]
          .filter(Boolean)
          .join(' ') || '';
        dni_representante.value = data.dni_representante || '';
      } else {
        nombreRepresentante.value = '';
        dni_representante.value = '';
      }

      // ====== Ajuste visual según tipo de persona ======
      let tipoPersonaValor = data.persona_fisica === 1 ? 'fisica' : 'juridica';

      // 🟣 Si la categoría es vendedor ambulante, tratarlo como persona física
      if (data.categoria && data.categoria.toLowerCase().includes('vendedor ambulante')) {
        tipoPersonaValor = 'fisica';
      }

      const bloqueRepresentante = document.getElementById('bloqueRepresentante');
      const tituloBloque = document.getElementById('tituloBloquePersona');
      const labelDni = document.querySelector("label[for='docIdentidad']");
      const labelNombre = document.querySelector("label[for='nombreRazon']");

      // Detectar líneas separadoras (hr) antes y después del bloque del representante
      const repCard = bloqueRepresentante?.closest('.card-body');
      const hrAntes = bloqueRepresentante?.closest('.card-body')?.previousElementSibling || null;
      const hrDespues = repCard?.nextElementSibling?.tagName === 'HR' ? repCard.nextElementSibling : null;

      console.log('💡 Valor real de tipoPersonaValor:', tipoPersonaValor);
      if (tipoPersonaValor.includes('fisica')) {
        // === Persona Física ===
        const repCard = document.getElementById('bloqueRepresentante')?.closest('.card-body');
        if (repCard) repCard.style.display = 'none';
        const lineaAntesRepresentante = document.getElementById('lineaAntesRepresentante');
        if (lineaAntesRepresentante) lineaAntesRepresentante.style.display = 'none';
        if (lineaAntesRepresentante) lineaAntesRepresentante.style.margin = '0';
        // 🔧 eliminar salto visual
        const titularCard = document.getElementById('bloqueTitular')?.closest('.card-body');

        console.log('Estado del hr antes de ocultar:', getComputedStyle(document.getElementById('lineaAntesRepresentante')).display);
        if (tituloBloque) tituloBloque.textContent = 'Datos del Titular';

        if (labelNombre) labelNombre.textContent = 'Nombre y Apellido *';
        tipoPersona.value = 'Física';
        // Ajuste dinámico de etiqueta según categoría
        if (categoriaComercio.value && categoriaComercio.value.toLowerCase().includes('vendedor ambulante')) {
          if (labelDni) labelDni.textContent = 'DNI *';

          // 🟣 Ajustes visuales específicos para vendedor ambulante
          if (categoriaComercio.value && categoriaComercio.value.toLowerCase().includes('vendedor ambulante')) {
            // Campo "Es persona" y su etiqueta
            const campoTipoPersona = document.getElementById('tipoPersona');
            const labelTipoPersona = document.querySelector("label[for='tipoPersona']");
            if (campoTipoPersona) {
              campoTipoPersona.style.backgroundColor = '#e0e0e0'; // gris claro
              campoTipoPersona.readOnly = true;
            }
            if (labelTipoPersona) {
              labelTipoPersona.style.color = '#888'; // gris tenue
            }

            // Campo "N° sucursal" y su etiqueta
            const campoSucursal = document.getElementById('numeroSucursal');
            const labelSucursal = document.querySelector("label[for='numeroSucursal']");
            if (campoSucursal) {
              campoSucursal.style.backgroundColor = '#e0e0e0';
              campoSucursal.readOnly = true;
            }
            if (labelSucursal) {
              labelSucursal.style.color = '#888';
            }

            // Cambiar etiqueta de CUIT/CUIL a DNI (ya existe arriba, lo reafirmamos)
            if (labelDni) labelDni.textContent = 'DNI *';

            // Valor visual para el campo tipoPersona
            if (campoTipoPersona) campoTipoPersona.value = 'N/A';
          }

        } else {
          if (labelDni) labelDni.textContent = 'CUIT o CUIL *';
        }
      } else if (tipoPersonaValor.includes('juridica')) {
        // === Persona Jurídica ===
        if (bloqueRepresentante) bloqueRepresentante.style.display = 'block';

        // Restaurar también el contenedor .card-body y la línea separadora
        const repCardShow = document.getElementById('bloqueRepresentante')?.closest('.card-body');
        if (repCardShow) repCardShow.style.display = 'block';
        const lineaAntesRepresentante2 = document.getElementById('lineaAntesRepresentante');
        if (lineaAntesRepresentante2) lineaAntesRepresentante2.style.display = 'block';

        if (tituloBloque) tituloBloque.textContent = 'Datos de la Empresa';
        if (labelDni) labelDni.textContent = 'CUIT o CUIL *';
        if (labelNombre) labelNombre.textContent = 'Razón Social *';
        tipoPersona.value = 'Jurídica';
      } else {
        // === Desconocido ===
        if (bloqueRepresentante) bloqueRepresentante.style.display = 'none';
        if (tituloBloque) tituloBloque.textContent = 'Datos del Titular';
        if (labelDni) labelDni.textContent = 'DNI *';
        if (labelNombre) labelNombre.textContent = 'Nombre y Apellido *';
        tipoPersona.value = '';
      }

      // === Restaurar color y bloqueo de campos no editables ===
      aplicarBloqueoCamposInicial();

      // 🟣 Ambulante: dejar "Es persona" y "N° sucursal" gris, vacíos e inhabilitados
      if ((data.categoria || '').toLowerCase().includes('vendedor ambulante')) {

        // 🟣 Cargar DNI del titular ambulante en el campo correcto
        const campoDniAmbulante = document.getElementById('docIdentidad');
        if (campoDniAmbulante) {
          campoDniAmbulante.value = data.dni_titular || '';
        }

        const campoTipoPersona = document.getElementById('tipoPersona');
        const labelTipoPersona = document.querySelector("label[for='tipoPersona']");
        const campoSucursal = document.getElementById('numeroSucursal');
        const labelSucursal = document.querySelector("label[for='numeroSucursal']");

        if (campoTipoPersona) {
          campoTipoPersona.disabled = true;      // inhabilitado
          campoTipoPersona.readOnly = false;     // evitar estilo readonly verde
          campoTipoPersona.value = '';           // sin texto
          campoTipoPersona.style.backgroundColor = '#e9ecef'; // gris
        }
        if (labelTipoPersona) {
          labelTipoPersona.style.color = '#888'; // etiqueta gris
        }

        if (campoSucursal) {
          campoSucursal.disabled = true;
          campoSucursal.readOnly = false;
          campoSucursal.value = '';
          campoSucursal.style.backgroundColor = '#e9ecef';
        }
        if (labelSucursal) {
          labelSucursal.style.color = '#888';
        }


      }

      // === Generar lista completa de documentos esperados según la categoría ===
      const categoria = (data.categoria || '').toLowerCase();

      // 📌 Ajuste: documentos comunes
      let docsComunes = [];
      if (categoria !== "vendedor ambulante") {
        // Para comercio/bares/food truck → comunes completos
        docsComunes = documentosRequeridos.comunes || [];
      } else {
        // Para ambulantes → solo el sellado bromatológico
        const docSellado = documentosRequeridos.comunes.find(d => d.id === "sellado_bromatologico");
        if (docSellado) docsComunes = [docSellado];
      }

      // Documentos específicos por categoría
      const docsCategoria = documentosRequeridos[categoria] || [];

      // Unión de comunes + específicos
      const docsEsperados = [...docsComunes, ...docsCategoria];

      // Documentos reales desde BD
      const docsBD = data.documentacion || [];

      console.group('🔎 DIAGNÓSTICO DOCS');
      console.log('Esperados (ids):', docsEsperados.map(d => d.id));
      console.log('BD (tipo_documento):', (data.documentacion || []).map(d => d.tipo_documento));
      console.groupEnd();

      // Fusionar esperados con los existentes
      const docsFinal = docsEsperados.map(doc => {
        const existente = docsBD.find(d => d.tipo_documento === doc.id);
        return existente
          ? { ...existente, tipo_documento: doc.id }
          : { tipo_documento: doc.id, nombre: doc.nombre, ruta_archivo: null, faltante: true };
      });

      // Renderizar todos (placeholder si falta)
      mostrarDocumentacionComercio(docsFinal, data.categoria || "");

      // 🟢 Si no es food truck ni vendedor ambulante, habilitar "Metros cuadrados"
      if (!((data.categoria || '').toLowerCase().includes('food truck') ||
        (data.categoria || '').toLowerCase().includes('vendedor ambulante'))) {
        const campoMetros = document.getElementById('metrosCuadrados');
        const labelMetros = document.querySelector('label[for="metrosCuadrados"]');
        if (campoMetros) {
          campoMetros.disabled = false;
          campoMetros.readOnly = false;
          campoMetros.style.backgroundColor = ''; // vuelve al color normal
        }
        if (labelMetros) {
          labelMetros.style.color = ''; // vuelve al color normal
        }
      }

      // 🔔 Disparar evento para registrar los valores originales
      document.dispatchEvent(new Event("comercioCargado"));

    } catch (err) {
      console.error('❌ Error:', err);
      alert('No se encontró el comercio o hubo un error al cargar los datos.');
    }
  }

  console.log('🔍 Línea encontrada:', document.getElementById('lineaAntesRepresentante'));

  // === Asociar evento al botón de búsqueda ===
  btnBuscarComercio.addEventListener('click', buscarComercio);

  // Titular / empresa (solo lectura)
  const tipoPersonaEl = document.getElementById('tipoPersona');
  const docIdentEl = document.getElementById('docIdentidad');
  const nombreRazonEl = document.getElementById('nombreRazon');

  // Editables (comercio)
  const rubroEl = document.getElementById('rubro');
  const nombreComEl = document.getElementById('nombreComercial');
  const direccionEl = document.getElementById('direccion');
  const ubicacionEl = document.getElementById('ubicacion');
  const codAreaEl = document.getElementById('cod_area_comercio');
  const telEl = document.getElementById('telefono_comercio');
  const mailEl = document.getElementById('correoElectronico');
  const m2El = document.getElementById('metrosCuadrados');

  // Montos (solo lectura – cálculo automático como en el alta)
  const montoSelladoEl = document.getElementById('montoSellado');
  const montoInspeccionEl = document.getElementById('montoInspeccion');
  const montoTotalEl = document.getElementById('montoTotal');

  // Documentos
  const contenedorDocComercio = document.getElementById('contenedorDocComercio');

  // Mapa para llevar los reemplazos de documentos (tipo_documento -> File)
  //const reemplazosDocs = new Map();

  // ====== Auxiliares ======
  const getToken = () => localStorage.getItem('token') || '';

  // Chequeo / modal
  const btnChequear = document.getElementById('btnChequearDatosComercio');
  const modalPrev = document.getElementById('previewModal');
  const prevBody = document.getElementById('previewContent');
  const btnConfirm = document.getElementById('btnConfirmarModal');



  // ====== Utilidades ======
  const fmt = (n) => `\$${Number(n || 0).toLocaleString('es-AR')}`;

  // === Función para calcular montos según metros cuadrados (RÉPLICA DEL ALTA) ===
  function calcularMontos() {
    if (!categoriaEl || !m2El) return;  // guarda si aún no existen en el DOM
    const categoria = (categoriaEl.value || "").toLowerCase();
    const m2 = parseFloat(m2El.value) || 0;

    const montoSellado = document.getElementById('montoSellado');
    const montoInspeccion = document.getElementById('montoInspeccion');
    const montoTotal = document.getElementById('montoTotal');

    const bloqueGenerales = document.querySelectorAll('.montos-generales');
    const bloqueAmbulante = document.querySelector('.montos-ambulante');
    const montoAmbulante = document.getElementById('montoAmbulante');
    const labelAmbulante = document.querySelector('label[for="montoAmbulante"]');

    // Reset visibilidad por defecto
    bloqueGenerales.forEach(div => div.classList.remove('d-none'));
    if (bloqueAmbulante) bloqueAmbulante.classList.add('d-none');

    // Limpieza de campos generales
    montoSellado.value = "";
    montoInspeccion.value = "";
    montoInspeccion.disabled = true;
    montoTotal.value = "";

    let sellado = 0;

    if (categoria === "food truck") {
      bloqueGenerales.forEach(div => div.classList.add('d-none'));
      if (bloqueAmbulante) {
        bloqueAmbulante.classList.remove('d-none');
        const fijo = 50000;
        if (montoAmbulante) montoAmbulante.value = `$${fijo.toLocaleString()}`;
        const leyenda = document.getElementById('montoAmbulanteLeyenda');
        if (leyenda) leyenda.textContent = "(Anual)";
      }

      // 🟣 Food Truck: deshabilitar "Metros cuadrados"
      const campoMetros = document.getElementById('metrosCuadrados');
      const labelMetros = document.querySelector('label[for="metrosCuadrados"]');
      if (campoMetros) {
        campoMetros.disabled = true;
        campoMetros.readOnly = false;
        campoMetros.value = '';
        campoMetros.style.backgroundColor = '#e9ecef'; // gris inhabilitado
      }
      if (labelMetros) {
        labelMetros.style.color = '#888'; // etiqueta gris
      }

      return;
    }

    if (categoria === "vendedor ambulante") {
      bloqueGenerales.forEach(div => div.classList.add('d-none'));
      if (bloqueAmbulante) {
        bloqueAmbulante.classList.remove('d-none');
        const fijo = 15000;
        if (montoAmbulante) montoAmbulante.value = `$${fijo.toLocaleString()}`;

        const leyenda = document.getElementById('montoAmbulanteLeyenda');
        if (leyenda) leyenda.textContent = "(Mensual)";
      }

      // 🟣 Vendedor ambulante: deshabilitar "Metros cuadrados"
      const campoMetros = document.getElementById('metrosCuadrados');
      const labelMetros = document.querySelector('label[for="metrosCuadrados"]');
      if (campoMetros) {
        campoMetros.disabled = true;
        campoMetros.readOnly = false;
        campoMetros.value = '';
        campoMetros.style.backgroundColor = '#e9ecef';
      }
      if (labelMetros) {
        labelMetros.style.color = '#888';
      }

      return;
    }

    // Si es COMERCIO EN GENERAL / BARES:
    if (!m2 || m2 <= 0) {
      return;
    }

    // ---- ESCALA POR m² ----
    if (m2 <= 5) sellado = 15000;
    else if (m2 <= 20) sellado = 26000;
    else if (m2 <= 50) sellado = 64000;
    else if (m2 <= 100) sellado = 106000;
    else if (m2 <= 200) sellado = 188000;
    else if (m2 <= 400) sellado = 234000;
    else sellado = 312000;

    montoSellado.value = `$${sellado.toLocaleString()}`;

    if (m2 > 20) {
      const inspeccion = 14200;
      const total = sellado + inspeccion;
      montoInspeccion.value = `$${inspeccion.toLocaleString()}`;
      montoInspeccion.disabled = false;
      montoTotal.value = `$${total.toLocaleString()}`;
    } else {
      montoInspeccion.value = "";
      montoInspeccion.disabled = true;
      montoTotal.value = `$${sellado.toLocaleString()}`;
    }
  }

  function getDocsRequeridosPorCategoria(cat) {
    const comunes = DOCS.comunes;
    const espec = DOCS[cat?.toLowerCase()] || [];
    // Nota: en ambulante no se pide renta (según tu alta); si querés ese ajuste, podemos excluirlo aquí.
    return [...comunes, ...espec];
  }



  // === Validación y previsualización del formulario de RENOVACIÓN (idéntico al ALTA + placeholders) ===
  document.getElementById('formRenovacionComercio')?.addEventListener('submit', function (e) {

    e.preventDefault();
    e.stopPropagation();

    // 🔹 Primero, validar los placeholders visibles
    if (!validarPlaceholdersCompletosComercio()) {
      this.classList.add('was-validated');

      // 🔹 Llevar el foco al primer campo inválido visible
      setTimeout(() => {
        const primerInvalido = this.querySelector(':invalid');
        if (primerInvalido) {
          primerInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
          primerInvalido.focus({ preventScroll: true });
        }
      }, 50);

      return;
    }

    // Validar formulario general
    if (this.checkValidity()) {
      previsualizarRenovacion();
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

  // === Limpia completamente el estado visual del formulario ===
  function resetearEstadoVisualFormularioComercio() {
    const form = document.getElementById("formRenovacionComercio");
    if (!form) return;

    // Eliminar clases de validación
    form.classList.remove("was-validated");

    // Quitar bordes verdes y rojos de todos los campos
    form.querySelectorAll(".is-valid, .is-invalid").forEach(el => {
      el.classList.remove("is-valid", "is-invalid");
    });
  }

  // === Validar que todos los placeholders visibles tengan imagen cargada (idéntico al alta) ===
  function validarPlaceholdersCompletosComercio() {
    const imgs = Array.from(document.querySelectorAll('#contenedorDocComercio img'));
    let faltantes = [];
    let primerPlaceholder = null;

    imgs.forEach(img => {
      const cont = img.closest('[data-tipo-documento], .col, .documento-item') || img;
      const visible = cont.offsetParent !== null && getComputedStyle(cont).display !== 'none';
      if (!visible) return;

      const tipo = cont.dataset?.tipoDocumento || img.dataset?.tipoDocumento || img.getAttribute('data-tipo') || '';
      const inputFile = tipo
        ? (document.querySelector(`#contenedorDocComercio input[type="file"][data-tipo-documento="${tipo}"], #contenedorDocComercio input[type="file"][name="${tipo}"]`) || cont.querySelector('input[type="file"]'))
        : cont.querySelector('input[type="file"]');
      const tieneArchivo = !!(inputFile && inputFile.files && inputFile.files.length);
      const tieneReemplazo = (typeof reemplazosDocs !== "undefined") && reemplazosDocs.has(tipo);
      const esPlaceholder = /Bromat-docu\.png$/i.test(img.src) && !tieneArchivo && !tieneReemplazo;

      // 🔸 Excepción: el "sellado bromatológico" debe renovarse siempre, aunque tenga imagen previa
      const esSellado = tipo === 'sellado_bromatologico';
      const debeRenovarSellado = esSellado && !(typeof reemplazosDocs !== "undefined" && reemplazosDocs.has(tipo));

      // limpiar mensajes previos si los hubiera
      const existente = cont.querySelector('.msg-placeholder');
      if (existente) existente.remove();

      if ((esPlaceholder && !tieneArchivo) || debeRenovarSellado) {
        if (!primerPlaceholder) primerPlaceholder = img;
        img.style.border = '2px solid #f23346ff';

        const tipoDoc = cont.dataset?.tipoDocumento || 'Documento';
        faltantes.push(tipoDoc);

        // 🔹 insertar mensaje debajo del placeholder
        const msg = document.createElement('small');
        msg.className = 'msg-placeholder text-danger';
        msg.style.display = 'block';
        msg.style.marginTop = '4px';

        // texto según si es el sellado bromatológico
        msg.textContent = esSellado
          ? 'Reemplace este documento'
          : 'Introducir una imagen.';

        // centrar solo para el sellado
        if (esSellado) {
          msg.style.textAlign = 'center';
        }

        cont.appendChild(msg);
      } else {

        // tipo YA existe y está arriba en esta misma función
        const fueReemplazado = reemplazosDocs.has(tipo);

        // 🚫 NO tocar el borde si fue reemplazado
        if (fueReemplazado) {
          return; // mantener borde celeste
        }

        // ✔ borde verde normal
        img.style.border = '1px solid #1b7937ff';
      }

    });

    if (faltantes.length > 0) {
      if (primerPlaceholder) {
        primerPlaceholder.scrollIntoView({ behavior: 'smooth', block: 'center' });
        primerPlaceholder.focus?.({ preventScroll: true });
      }
      return false;
    }

    return true;
  }

  // === VALIDACIÓN NARANJA (campos no modificados y aviso visual) ===
  (() => {
    const btnChequearDatos = document.getElementById("btnChequearDatosComercio");
    const avisoNoModificados = document.getElementById("avisoNoModificadosComercio");
    const flechaAviso = document.getElementById("flechaAvisoComercio");

    if (!btnChequearDatos) return;

    let primerChequeoHecho = false;

    // 🔹 Guardar valores originales al cargar comercio
    let datosOriginales = {};
    document.addEventListener("comercioCargado", () => {
      datosOriginales = {};
      document
        .querySelectorAll(
          "#formRenovacionComercio input, #formRenovacionComercio select, #formRenovacionComercio textarea"
        )
        .forEach((el) => {
          if (!el.disabled && !el.readOnly && el.id) {
            datosOriginales[el.id] = el.value;
          }
        });

      // 🔸 Quitar naranja en vivo cuando el usuario modifica algo
      document
        .querySelectorAll(
          "#formRenovacionComercio input, #formRenovacionComercio select, #formRenovacionComercio textarea"
        )
        .forEach((el) => {
          el.addEventListener("input", () => {
            el.classList.remove("campo-no-modificado");
          });
          el.addEventListener("change", () => {
            el.classList.remove("campo-no-modificado");
          });
        });
    });

    // === CLICK PRINCIPAL DEL BOTÓN ===
    btnChequearDatos.addEventListener("click", () => {
      const form = document.getElementById("formRenovacionComercio");
      if (!form) return;

      // Primero: validar campos del formulario
      if (!form.checkValidity()) {

        // 🔥 RESET TOTAL DE VALIDACIÓN NARANJA CUANDO HAY ROJO
        primerChequeoHecho = false;

        // Quitar todas las marcas naranjas existentes
        document.querySelectorAll(".campo-no-modificado").forEach(el => {
          el.classList.remove("campo-no-modificado");
        });

        // Ocultar aviso naranja y flecha si estaban visibles
        if (avisoNoModificados) avisoNoModificados.style.display = "none";
        if (flechaAviso) flechaAviso.style.display = "none";

        // ❗ recién ahora marcamos validación roja
        form.classList.add("was-validated");

        setTimeout(() => {
          const primerInvalido = form.querySelector(":invalid");
          if (primerInvalido) {
            primerInvalido.scrollIntoView({ behavior: "smooth", block: "center" });
            primerInvalido.focus({ preventScroll: true });
          }
        }, 60);

        // 🔹 Asegura que el sellado bromatológico también se marque en rojo
        validarPlaceholdersCompletosComercio();

        return; // detener aquí si hay errores de campos
      }

      // Segundo: validar placeholders
      if (!validarPlaceholdersCompletosComercio()) {
        form.classList.add("was-validated");

        // Buscar si hay algún campo inválido antes de hacer foco en placeholders
        const primerInvalido = form.querySelector(":invalid");
        if (primerInvalido) {
          setTimeout(() => {
            primerInvalido.scrollIntoView({ behavior: "smooth", block: "center" });
            primerInvalido.focus({ preventScroll: true });
          }, 60);
        } else {
          // Si no hay campos inválidos, el foco lo maneja validarPlaceholdersCompletosComercio()
        }

        return; // detener aquí si hay placeholders faltantes
      }

      // --- 2️⃣ VALIDACIÓN NARANJA ---
      const camposEditables = Array.from(
        document.querySelectorAll(
          "#formRenovacionComercio input:not([readonly]):not([disabled]):not([type=hidden]):not([type=radio]):not(#idComercio), #formRenovacionComercio select:not([disabled]), #formRenovacionComercio textarea:not([disabled])"
        )
      );

      let noModificados = [];

      // Si quedan placeholders → activar validación roja y detener
      const placeholdersVisibles = Array.from(document.querySelectorAll('#contenedorDocComercio img'))
        .filter(img => /Bromat-docu\.png$/i.test(img.src) && img.offsetParent !== null);

      console.log("📸 Placeholders visibles:", placeholdersVisibles.length);
      if (placeholdersVisibles.length > 0) {
        validarPlaceholdersCompletosComercio(); // activa bordes rojos y mensajes
        return;
      }

      // Campos editables no modificados
      camposEditables.forEach((el) => {
        const original = datosOriginales[el.id] ?? "";
        if (el.value.trim() === original.trim()) {
          el.classList.add("campo-no-modificado");
          noModificados.push(el);
        } else {
          el.classList.remove("campo-no-modificado");
        }
      });

      // 💾 Mantener referencias activas de los archivos antes del render
      for (const [tipo, archivo] of reemplazosDocs.entries()) {
        reemplazosDocs.set(tipo, archivo);
      }

      // Documentos no renovados (ya sin placeholders)
      const docs = document.querySelectorAll("#contenedorDocComercio [data-tipo-documento]");
      docs.forEach((col) => {
        const tipo = (col.dataset.tipoDocumento || "").toLowerCase().trim();
        const fueReemplazado = reemplazosDocs.has(tipo);
        const img = col.querySelector("img");

        // 🔸 Excepción: el sellado bromatológico se trata como no modificado aunque tenga imagen
        const esSellado = tipo.includes("sellado") && tipo.includes("bromatologico");

        // NO marcar nunca el sellado en naranja (si no fue reemplazado lo bloquea la roja)
        if (!esSellado && !fueReemplazado && img && !/Bromat-docu\.png$/i.test(img.src)) {
          img.classList.add("campo-no-modificado");
          noModificados.push(img);
        } else if (img) {
          img.classList.remove("campo-no-modificado");
        }
      });

      // --- Mostrar aviso solo si corresponde ---
      if (!primerChequeoHecho && noModificados.length > 0) {

        // 🔶 ENFOCAR el primer campo naranja
        try {
          noModificados[0].focus();
        } catch (e) {
          console.warn("No se pudo enfocar el primer campo naranja:", e);
        }

        // 🔶 MOSTRAR MODAL NARANJA
        const modalNaranja = new bootstrap.Modal(
          document.getElementById('modalNaranjaComercio')
        );
        modalNaranja.show();

        // 🔶 Mostrar el aviso original (flecha + texto)
        avisoNoModificados.textContent = "Si no debe renovar estos campos presione nuevamente";
        flechaAviso.innerHTML = "↓";

        avisoNoModificados.style.display = "block";
        flechaAviso.style.display = "block";

        requestAnimationFrame(() => {
          avisoNoModificados.offsetHeight; // fuerza repintado
        });

        primerChequeoHecho = true;
        console.log("🟠 Validación naranja activada | primerChequeoHecho:", primerChequeoHecho);
        return;
      }

      // --- 3️⃣ Si no hay no-modificados y ya se había mostrado advertencia → abrir resumen ---
      if (primerChequeoHecho) {
        console.log("✅ Segundo clic detectado, abriendo resumen...");
        previsualizarRenovacion();
        return;
      }

      // Si no hay no-modificados y es el primer clic → va directo al resumen
      previsualizarRenovacion();
    });

  })();

  // === Función para previsualizar el formulario de RENOVACIÓN (réplica del ALTA con adaptaciones) ===
  function previsualizarRenovacion() {
    const form = document.getElementById('formRenovacionComercio');
    const previewContent = document.getElementById('previewContent');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      const primerInvalido = form.querySelector(':invalid');
      if (primerInvalido) {
        const y = primerInvalido.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setTimeout(() => primerInvalido.focus(), 400);
      }
      return;
    }

    const categoria = document.getElementById('categoriaComercio')?.value || '';
    const rubro = document.getElementById('rubro')?.value || '';
    const titularText = document.getElementById('nombreRazon')?.value || '';
    const cuitTitular = document.getElementById('cuitBuscar')?.value || '';
    const nombreComercial = document.getElementById('nombreComercial')?.value || '';
    const direccion = document.getElementById('direccion')?.value || '';
    const ubicacion = document.getElementById('ubicacion')?.value || '';
    const telefono = `${document.getElementById('cod_area_comercio')?.value || ''}-${document.getElementById('telefono_comercio')?.value || ''}`;
    const correoElectronico = document.getElementById('correoElectronico')?.value || '';
    const metrosCuadrados = document.getElementById('metrosCuadrados')?.value || '';


    const rubrosAdicionales = [];
    for (let i = 1; i <= anexoCount; i++) {
      const anexoSelect = document.getElementById(`anexo${i}`);
      if (anexoSelect && anexoSelect.value) rubrosAdicionales.push(anexoSelect.value);
    }

    let montoSellado = document.getElementById('montoSellado')?.value || '';
    let montoInspeccion = document.getElementById('montoInspeccion')?.value || '';
    let montoTotal = document.getElementById('montoTotal')?.value || '';

    let docLabel = "CUIT";
    let metrosResumen = metrosCuadrados ? `${metrosCuadrados} m²` : "No aplica";

    if (categoria.toLowerCase() === "vendedor ambulante") {
      docLabel = "DNI";
      metrosResumen = "No aplica";
      montoSellado = "$15.000";
      montoInspeccion = "No aplica";
      montoTotal = "$15.000";
    } else if (categoria.toLowerCase() === "food truck") {
      docLabel = "CUIT";
      metrosResumen = "No aplica";
      montoSellado = "$50.000";
      montoInspeccion = "No aplica";
      montoTotal = "$50.000";
    } else {
      if (!metrosCuadrados || Number(metrosCuadrados) <= 0) metrosResumen = "No aplica";
      if (!montoInspeccion) montoInspeccion = "No aplica";
    }

    // --- DOCUMENTOS REEMPLAZADOS (idéntico a transporte) ---
    const renovados = Array.from(reemplazosDocs.keys());
    const documentos = [...new Set(renovados)];
    const listaDocumentos = documentos.length
      ? documentos.map(d => `${d} *`).join("<br>")
      : "Sin documentos nuevos ni pendientes.";

    // 🔹 Número de renovación (réplica de transporte, adaptada a comercio)
    const numRenovacionActual = Number(
      window._dataComercioActual?.numero_renovacion ??
      window._dataComercioActual?.nro_renovacion ??
      0
    );
    const siguienteRenovacion = numRenovacionActual + 1;

    // 🧩 Construcción del resumen (actualizado con CUIT/DNI y representante)
    let html = `
     <div class="preview-item"><span class="preview-label">Categoría:</span> <span class="preview-value">${categoria}</span></div>
     `;

    // === Titular según tipo de persona ===
    const tipoPersona = document.getElementById('tipoPersona')?.value?.toLowerCase() || '';
    const cuitCuil = document.getElementById('docIdentidad')?.value || '';

    if (tipoPersona.includes('jurídica') || tipoPersona.includes('juridica')) {
      const representante = document.getElementById('nombreRepresentante')?.value || '';
      html += `
    <div class="preview-item"><span class="preview-label">Titular:</span> <span class="preview-value">${titularText} (CUIT/CUIL: ${cuitCuil})</span></div>
    <div class="preview-item"><span class="preview-label">Representante:</span> <span class="preview-value">${representante || 'No especificado'}</span></div>
   `;
    } else if (categoria.toLowerCase() === "vendedor ambulante") {
      html += `
    <div class="preview-item"><span class="preview-label">Titular:</span> <span class="preview-value">${titularText} (DNI: ${cuitCuil})</span></div>
   `;
    } else {
      html += `
    <div class="preview-item"><span class="preview-label">Titular:</span> <span class="preview-value">${titularText} (CUIT/CUIL: ${cuitCuil})</span></div>
   `;
    }

    // === Resto del resumen idéntico ===
    html += `
   <div class="preview-item"><span class="preview-label">Rubro Principal:</span> <span class="preview-value">${rubro}</span></div>
   `;

    if (rubrosAdicionales.length > 0) {
      html += `
    <div class="preview-item"><span class="preview-label">Rubros Adicionales:</span> <span class="preview-value">${rubrosAdicionales.join(', ')}</span></div>
   `;
    }

    html += `
   <div class="preview-item"><span class="preview-label">Nombre Comercial:</span> <span class="preview-value">${nombreComercial}</span></div>
   <div class="preview-item"><span class="preview-label">Dirección:</span> <span class="preview-value">${direccion}</span></div>
   <div class="preview-item"><span class="preview-label">Ubicación:</span> <span class="preview-value">${ubicacion || 'No especificada'}</span></div>
   <div class="preview-item"><span class="preview-label">Teléfono:</span> <span class="preview-value">${telefono}</span></div>
   <div class="preview-item"><span class="preview-label">Correo Electrónico:</span> <span class="preview-value">${correoElectronico}</span></div>
   <div class="preview-item"><span class="preview-label">Metros Cuadrados:</span> <span class="preview-value">${metrosResumen}</span></div>
   <div class="preview-item"><span class="preview-label">Monto Sellado Bromatológico:</span> <span class="preview-value">${montoSellado}</span></div>
   <div class="preview-item"><span class="preview-label">Monto Inspección Ocular:</span> <span class="preview-value">${montoInspeccion}</span></div>
   <div class="preview-item"><span class="preview-label">Monto Total:</span> <span class="preview-value">${montoTotal}</span></div>
  
   <div style="
    text-align: center;
    margin: 18px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #0e3816ff;
   ">
    Esta será la renovación Nº ${siguienteRenovacion}
   </div>
   <div class="preview-item"><span class="preview-label">Documentos Reemplazados:</span> <span class="preview-value">${documentos.length > 0 ? documentos.join('<br>') : 'Ningún documento reemplazado'}</span></div>
   `;

    previewContent.innerHTML = html;
    new bootstrap.Modal(document.getElementById('previewModal')).show();
  }

  // ====== Envío ======
  async function enviar() {
    const formData = new FormData();

    formData.append('id_comercio', _dataOriginal?.id_comercio || "");

    // Dirección / ubicación
    formData.append('direccion', direccionEl.value || "");
    formData.append('geolocalizacion', ubicacionEl.value || "");

    // Teléfono comercio (código + número)
    const cod = (codAreaEl.value || "").trim();
    const num = (telEl.value || "").trim();
    const telFinal = cod && num ? `${cod}-${num}` : (telEl.value || "");
    formData.append('telefono_comercio', telFinal);

    // Correo
    formData.append('correo_electronico', mailEl.value || "");

    // Metros cuadrados
    formData.append('metros_cuadrados', m2El.value || "");

    // Monto total (sellado + inspección si corresponde)
    formData.append(
      'monto_sellado_inspeccion',
      (montoTotalEl.value || "").replace(/[^\d]/g, '') || '0'
    );

    // Estado de pago (siempre pagado)
    formData.append('estado_pago_final', "1");

    // Número de renovación
    const nroActual = Number(_dataOriginal?.numero_renovacion || 0);
    formData.append('numero_renovacion', nroActual + 1);

    // Documentos reemplazados
    if (reemplazosDocs.size > 0) {
      for (const [tipoDoc, file] of reemplazosDocs.entries()) {
        formData.append(tipoDoc, file);
      }
    }

    // === Anexos ===
    const anexos = Array.from(
      document.querySelectorAll('#anexosContainer .anexo-select')
    ).map(sel => sel.value || null);

    formData.append('anexos', JSON.stringify(anexos));

    // Enviar
    const resp = await fetch('/api/renovacion-comercio/actualizar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });

    if (!resp.ok) {
      alert('❌ Error al registrar la renovación.');
      return;
    }

    // ✅ Éxito
    alert(`✅ Renovación Nº ${nroActual + 1} realizada con éxito.`);

    // Cerrar modal
    const modalEl = document.getElementById('previewModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }

    // Redirigir igual que el alta
    window.location.href = 'lista-comercios.html';
  }

  // ====== Listeners ======
  btnBuscarComercio?.addEventListener('click', buscarComercio);
  idComercio?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarComercio();
    }
  });
  m2El?.addEventListener('input', calcularMontos);

  categoriaEl?.addEventListener('change', () => {
    calcularMontos();
    const categoria = categoriaEl.value?.toLowerCase() || '';
    const docs = [
      ...documentosRequeridos.comunes,
      ...(documentosRequeridos[categoria] || [])
    ];
    mostrarDocumentacionComercio(docs);
  });

  btnConfirm?.addEventListener('click', () => {
    enviar().catch(err => console.error(err));
  });

  // === Marcar documentos reemplazados con borde celeste (réplica de transporte) ===
  document.getElementById("contenedorDocComercio")?.addEventListener("change", (e) => {
    if (e.target.type !== "file") return;

    const cont = e.target.closest("[data-tipo-documento]");
    const img = cont?.querySelector("img");
    if (!img) return;

    const tipo = cont.dataset?.tipoDocumento?.toLowerCase().trim() || "";

    // Si el usuario selecciona un archivo nuevo
    if (e.target.files && e.target.files.length > 0) {
      img.style.border = "2px solid #0d6efd"; // celeste igual al botón
      img.classList.add("doc-reemplazado");
      img.classList.remove("campo-no-modificado", "is-invalid");

      if (typeof reemplazosDocs !== "undefined") {
        reemplazosDocs.set(tipo, e.target.files[0]);
      }
    } else {
      // Si se quita archivo o vuelve al placeholder
      img.style.border = "1px solid #1b7937ff";
      img.classList.remove("doc-reemplazado");

      if (typeof reemplazosDocs !== "undefined") {
        reemplazosDocs.delete(tipo);
      }
    }
  });

}); // cierre DOMContentLoaded

