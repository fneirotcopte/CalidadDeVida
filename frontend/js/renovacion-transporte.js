// === renovacion-transporte.js (clásico, sin imports) ===
// Respeta el patrón de form-alta-transporte.js (DOMContentLoaded, ids, sin módulos)

// Mapa para llevar los reemplazos de documentos (tipo_documento -> File)
const reemplazosDocs = new Map();

// === Archivo: renovacion-transporte.js ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ renovacion-transporte.js cargado');

    // ---- Referencias a elementos del DOM ----
    const form = document.getElementById('formRenovacionTransporte');
    const idTransporte = document.getElementById('idTransporte');
    const btnBuscarTransporte = document.getElementById('btnBuscarTransporte');



    // --- Mostrar modal de advertencia al ingresar ---
    const modalEl = document.getElementById('modalAdvertencia');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        const campoId = document.getElementById('idTransporte');
        const boton = modalEl.querySelector('.btn-primary');
        if (boton) {
            boton.addEventListener('click', () => {
                if (campoId) campoId.focus({ preventScroll: true });
            });
        }
    }

    // --- Desactivar todos los campos hasta que se cargue un transporte ---
    // (excepto el buscador y el botón del modal)
    const camposBloqueados = document.querySelectorAll(
        'input, select, textarea, button:not(#btnBuscarTransporte):not(#btnAceptarModal)'
    );
    camposBloqueados.forEach(el => el.disabled = true);

    // 🆕 Botón reset
    const btnResetTransporte = document.getElementById('btnResetTransporte');
    btnResetTransporte.addEventListener('click', () => {
        location.reload();
    });

    // --- Rehabilitar solo el campo del número de habilitación y la lupa ---
    idTransporte.disabled = false;
    btnBuscarTransporte.disabled = false;

    // === Aplicar color y bloqueo a campos no modificables ===
    function aplicarBloqueoCamposInicial() {
        const colorBloqueado = '#e9f7ef'; // verde menta claro, más apagado
        const soloLectura = [
            'nombreTitular',
            'dniTitular',
            'telefonoTitular',
            'domicilioTitular',
            'numeroVehiculo',
            'tipoVehiculo',
            'patente'
        ];

        soloLectura.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.style.backgroundColor = colorBloqueado;
                campo.readOnly = true;
            }
        });

        // Por defecto: chofer no cambia → bloquear y colorear campos de chofer
        const camposChofer = document.querySelectorAll('#bloqueDatosChofer input, #bloqueDatosChofer select');
        camposChofer.forEach(el => {
            el.style.backgroundColor = colorBloqueado;
            el.readOnly = true;
            el.disabled = true;
        });
    }

    // === Quitar bloqueo de chofer cuando se elige "Cambiar de chofer" ===
    function manejarCambioChoferVisual() {
        const colorBloqueado = '#dff7e3';
        const camposChofer = document.querySelectorAll('#bloqueDatosChofer input, #bloqueDatosChofer select');

        const cambioSi = document.getElementById('cambioChoferSi');
        const cambioNo = document.getElementById('cambioChoferNo');

        if (cambioSi) {
            cambioSi.addEventListener('change', () => {
                camposChofer.forEach(el => {
                    el.style.backgroundColor = ''; // vuelve normal
                    el.readOnly = false;
                    el.disabled = false;
                });
            });
        }

        if (cambioNo) {
            cambioNo.addEventListener('change', () => {
                camposChofer.forEach(el => {
                    el.style.backgroundColor = colorBloqueado;
                    el.readOnly = true;
                    el.disabled = true;
                });
            });
        }
    }

    const dniTitular = document.getElementById('dniTitular');
    const nombreTitular = document.getElementById('nombreTitular');

    const cambioChoferSi = document.getElementById('cambioChoferSi');
    const cambioChoferNo = document.getElementById('cambioChoferNo');
    const bloqueNuevoChoferTitular = document.getElementById("bloqueNuevoChoferTitular");

    const choferTitularSi = document.getElementById('choferTitularSi');
    const choferTitularNo = document.getElementById('choferTitularNo');


    const bloqueDatosChofer = document.getElementById('bloqueDatosChofer');
    const nombreChofer = document.getElementById('nombreChofer');
    const dniChofer = document.getElementById('dniChofer');
    const carnetChofer = document.getElementById('carnetChofer');
    const codAreaChofer = document.getElementById('cod_area_chofer');
    const telefonoChofer = document.getElementById('telefono_chofer');
    const avisoTitular = document.getElementById('avisoTitularEsChofer');


    // === LÓGICA FINAL DE CHOFER / TITULAR (completa y reversible) ===
    let esTitularOriginal = false;
    let datosChoferOriginal = {};

    // === Configura el estado inicial de los bloques de chofer según el transporte ===
    function configurarEstadoInicialChofer(choferEsTitular) {
        // Reset visual
        avisoTitular.classList.add("d-none");
        bloqueDatosChofer.style.display = "none";
        bloqueNuevoChoferTitular.style.display = "none";
        cambioChoferSi.checked = false;
        cambioChoferNo.checked = false;
        choferTitularSi.checked = false;
        choferTitularNo.checked = false;

        if (choferEsTitular) {
            // 🧍 Titular es chofer → cartel visible
            avisoTitular.classList.remove("d-none");
            bloqueDatosChofer.style.display = "none";
            bloqueNuevoChoferTitular.style.display = "none";
            cambioChoferNo.checked = true;
            choferTitularSi.checked = true;
        } else {
            // 👥 Chofer distinto → mostrar sus datos
            avisoTitular.classList.add("d-none");
            bloqueDatosChofer.style.display = "flex";
            bloqueNuevoChoferTitular.style.display = "none";
            cambioChoferNo.checked = true;
        }
    }

    // === Manejo del primer grupo de radios ("¿Cambia de chofer?") ===
    function manejarCambioChofer() {

        if (cambioChoferSi.checked) {
            avisoTitular.classList.add("d-none");

            if (esTitularOriginal) {
                // Escenario 1 o 2: era titular → ahora otro chofer (no mostrar segunda pregunta)
                bloqueDatosChofer.style.display = "flex";
                bloqueNuevoChoferTitular.style.display = "none";
            } else {
                // Escenario 3 o 4: ya tenía chofer distinto → mostrar segunda pregunta
                if (window._choferEsTitularActual === false) {
                    bloqueDatosChofer.style.display = "flex";
                    bloqueNuevoChoferTitular.style.display = "block";
                } else {
                    bloqueDatosChofer.style.display = "flex";
                    bloqueNuevoChoferTitular.style.display = "none";
                }
            }

            // Reset segundo grupo
            choferTitularSi.checked = false;
            choferTitularNo.checked = false;

            // Limpiar campos solo si el chofer era el titular originalmente
            if (esTitularOriginal) {
                nombreChofer.value = "";
                dniChofer.value = "";
                carnetChofer.value = "";
                codAreaChofer.value = "";
                telefonoChofer.value = "";
            }
        }

        if (cambioChoferNo.checked) {
            bloqueNuevoChoferTitular.style.display = "none";

            if (esTitularOriginal) {
                // Titular es chofer
                avisoTitular.classList.remove("d-none");
                bloqueDatosChofer.style.display = "none";
                choferTitularSi.checked = true;
                choferTitularNo.checked = false;
            } else {
                // Chofer distinto
                avisoTitular.classList.add("d-none");
                bloqueDatosChofer.style.display = "flex";
                choferTitularSi.checked = false;
                choferTitularNo.checked = false;

                nombreChofer.value = datosChoferOriginal?.nombre || "";
                dniChofer.value = datosChoferOriginal?.dni || "";
                carnetChofer.value = datosChoferOriginal?.carnet || "";
                codAreaChofer.value = datosChoferOriginal?.codArea || "";
                telefonoChofer.value = datosChoferOriginal?.telefono || "";

                // 🔁 Recargar toda la información y documentación como al presionar la lupa
                if (typeof buscarTransporte === "function") {
                    buscarTransporte();
                } else {
                    btnBuscarTransporte?.click();
                }
            }
        }
    }

    // === Manejo del segundo grupo de radios ("¿Será el titular?") ===
    function manejarChoferTitular() {

        const camposChofer = document.querySelectorAll('#bloqueDatosChofer input, #bloqueDatosChofer select');

        if (choferTitularSi.checked) {
            // Será el titular
            avisoTitular.classList.remove("d-none");
            bloqueDatosChofer.style.display = "none";

            // 🧱 Deshabilitar campos del chofer y quitar required
            camposChofer.forEach(el => {
                el.disabled = true;
                el.readOnly = true;

                if (el.hasAttribute('required')) {
                    el.dataset.wasRequired = '1';
                    el.removeAttribute('required');
                }
            });

            // 🔹 Detectar si es escenario 4 (chofer distinto → titular)
            if (cambioChoferSi?.checked && window._choferEsTitularActual === false) {
                document.getElementById("avisoTitularEsChofer").querySelector("input").value =
                    "En la renovación el titular será el chofer";
            } else {
                // Escenario 1 o estado original
                document.getElementById("avisoTitularEsChofer").querySelector("input").value =
                    "El titular es el chofer";
            }

            syncDocsUI();
        }

        if (choferTitularNo.checked) {
            // Será otro chofer
            avisoTitular.classList.add("d-none");
            bloqueDatosChofer.style.display = "flex";

            // 🧱 Rehabilitar campos del chofer y restaurar required si lo tenían
            camposChofer.forEach(el => {
                el.disabled = false;
                el.readOnly = false;

                if (el.dataset.wasRequired === '1') {
                    el.setAttribute('required', '');
                }
            });

            // Limpiar los campos para ingresar nuevo chofer
            nombreChofer.value = "";
            dniChofer.value = "";
            carnetChofer.value = "";
            codAreaChofer.value = "";
            telefonoChofer.value = "";

            // 🟢 Actualizar el estado: ahora el chofer no es el titular
            window._choferEsTitularActual = false;

            // Actualizar miniaturas naturalmente según el nuevo estado
            syncDocsUI();
        }
    }

    // === EVENTOS ===
    cambioChoferSi.addEventListener("change", manejarCambioChofer);
    cambioChoferNo.addEventListener("change", manejarCambioChofer);
    choferTitularSi.addEventListener("change", manejarChoferTitular);
    choferTitularNo.addEventListener("change", manejarChoferTitular);

    const tipoVehiculo = document.getElementById('tipoVehiculo');
    const patente = document.getElementById('patente');
    const numeroVehiculo = document.getElementById('numeroVehiculo');

    const tipoAlimento = document.getElementById('tipoAlimento');
    const otroTipoAlimento = document.getElementById('otroTipoAlimento');

    const vtoFecha = document.getElementById('vtoFecha');
    const seguroFecha = document.getElementById('seguroFecha');

    const montoSellado = document.getElementById('montoSellado');
    const mesesAdelantar = document.getElementById('mesesAdelantar');
    const montoTotal = document.getElementById('montoTotal');
    const etiquetaMeses = document.getElementById('etiquetaMeses');

    const contenedorDocTransporte = document.getElementById('contenedorDocTransporte');

    // Mapa para llevar los reemplazos de documentos (tipo_documento -> File)
    const reemplazosDocs = new Map();

    // ====== Auxiliares ======
    const getToken = () => localStorage.getItem('token') || '';

    const parseCurrencyToNumber = (val) => {
        if (!val) return 0;
        // acepta "$12.345,67" o "12345.67" o "12345"
        const limpio = String(val).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
        const num = Number(limpio);
        return isNaN(num) ? 0 : num;
    };

    const formatCurrencyAR = (num) => {
        try {
            return `$${Number(num || 0).toLocaleString('es-AR')}`;
        } catch {
            return `$${num}`;
        }
    };

    const toISO = (d) => (d ? new Date(d) : null);

    // Calcula meses máximos entre hoy y la menor de las fechas (VTO / Seguro)
    const calcularMaxMesesPorVencimientos = () => {
        const hoy = new Date();
        const fVto = toISO(vtoFecha.value);
        const fSeg = toISO(seguroFecha.value);
        if (!fVto || !fSeg) return 1;

        const limite = fVto < fSeg ? fVto : fSeg;
        if (limite <= hoy) return 1;

        // meses enteros entre hoy y limite
        const years = limite.getFullYear() - hoy.getFullYear();
        const months = years * 12 + (limite.getMonth() - hoy.getMonth());
        // si el día del mes de la fecha límite es menor que hoy, restamos 1
        const ajuste = limite.getDate() >= hoy.getDate() ? 0 : 1;
        const maxMeses = Math.max(1, months - ajuste);
        return maxMeses;
    };

    // Mostrar/ocultar input "otro tipo alimento"
    const syncOtroTipoAlimento = () => {
        if (!tipoAlimento) return;
        if (tipoAlimento.value === 'otros') {
            otroTipoAlimento?.classList.remove('d-none');
        } else {
            otroTipoAlimento?.classList.add('d-none');
            if (otroTipoAlimento) otroTipoAlimento.value = '';
        }
    };

    const actualizarEtiquetaSalud = (texto) => {
        if (!contenedorDocTransporte) return;
        const etiquetas = contenedorDocTransporte.querySelectorAll('p');
        etiquetas.forEach((p) => {
            if ((p.textContent || '').toLowerCase().includes('salud')) {
                p.textContent = texto;
            }
        });
    };

    // ====== Documentación (miniaturas estilo titular del alta con botón verde de renovación) ======
    const esImagen = (nombre = '') => /\.(png|jpe?g|gif|webp)$/i.test(nombre);
    const esPDF = (nombre = '') => /\.pdf$/i.test(nombre);

    // --- Limpia el contenedor antes de volver a renderizar ---
    const limpiarDocumentacionUI = () => {
        if (!contenedorDocTransporte) return;
        contenedorDocTransporte.innerHTML = `<div class="row g-4 justify-content-start"></div>`;
        reemplazosDocs.clear();
    };

    // --- Renderiza las miniaturas replicando el aspecto del titular en alta ---
    const mostrarDocumentacion = (documentos = []) => {
        limpiarDocumentacionUI();
        const row = contenedorDocTransporte.querySelector('.row') || contenedorDocTransporte;

        if (!documentos.length) {
            row.innerHTML = `<p class="text-muted">No hay documentos cargados para este transporte.</p>`;
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
  const formEl = document.getElementById('formRenovacionTransporte'); // adaptado
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

    // volver botón a estado original
    btnRenovar.classList.remove('btn-info');
    btnRenovar.classList.add('btn-success');
    btnRenovar.innerHTML = '<i class="fas fa-sync-alt"></i>';
    return;
  }

  // crear input oculto DENTRO del form para que FormData(form) lo tome
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*,application/pdf';
  inp.name = key; // mismo comportamiento que Comercio
  inp.classList.add('d-none');
  formEl?.appendChild(inp);

  inp.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      // si canceló el diálogo, limpiar el input oculto
      inp.remove();
      return;
    }

    // registrar en el map
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

    // eliminar etiqueta placeholder si existiera
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

    // actualizar botón (exactamente igual que Comercio)
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

            // Etiqueta más descriptiva para cert_salud (versión final: cubre todos los escenarios)
            if ((doc.tipo_documento || doc.tipo) === 'cert_salud') {
                const totalDocs = documentos.length;
                const esTitularAhora = choferTitularSi?.checked === true;
                const esChoferAhora = choferTitularNo?.checked === true;
                const cambioDeChoferSinSegunda = cambioChoferSi?.checked && window._choferEsTitularActual === true;
                const choferDistintoPasaATitular = cambioChoferSi?.checked && window._choferEsTitularActual === false && esTitularAhora;

                // 🟢 Caso especial: chofer distinto → pasa a titular → debe decir titular
                if (choferDistintoPasaATitular) {
                    textoEtiqueta = 'Certificado de buena salud (titular)';

                    // 🟢 Caso especial: titular original cambia de chofer (sin segunda pregunta)
                } else if (cambioDeChoferSinSegunda || (totalDocs === 10 && !esTitularAhora)) {
                    textoEtiqueta = 'Certificado de buena salud (chofer)';

                    // 🟢 Casos normales según cantidad de documentos
                } else if (totalDocs === 6) {
                    textoEtiqueta = 'Certificado de buena salud (titular)';
                } else {
                    // Fallback por seguridad
                    textoEtiqueta = esChoferAhora
                        ? 'Certificado de buena salud (chofer)'
                        : 'Certificado de buena salud (titular)';
                }
            }

            etiqueta.textContent = textoEtiqueta;

            wrap.appendChild(vista);
            wrap.appendChild(btnRenovar);
            col.appendChild(wrap);
            col.appendChild(etiqueta);
            row.appendChild(col);
        });
    };

    // === Filtro para mostrar solo los documentos que correspondan ===
    function filtrarDocumentacionPorChofer(documentos, choferEsTitular, cambiaDeChofer = false) {
        // Documentos del vehículo
        const docsVehiculo = [
            "foto_vehiculo",
            "cedula_verde",
            "seguro_vehiculo",
            "vto_vehiculo",
            "sellado_bromatologico"
        ];

        // Documentos personales del chofer
        const docsChofer = [
            "dni_frente",
            "dni_dorso",
            "carnet_frente",
            "carnet_dorso"
        ];

        // Certificado de salud (común a ambos)
        const certSalud = ["cert_salud"];

        // Determinar tipos esperados
        const tiposEsperados = choferEsTitular
            ? [...docsVehiculo, ...certSalud]          // titular: 6 docs
            : [...docsVehiculo, ...docsChofer, ...certSalud]; // chofer distinto: 10 docs

        // Filtrar existentes
        let existentes = documentos.filter(d => tiposEsperados.includes(d.tipo_documento));

        // 🔹 Si cambia de chofer → aplicar mismo comportamiento para escenarios 2 y 3
        if (cambiaDeChofer) {
            const nuevosDocsChofer = ["dni_frente", "dni_dorso", "carnet_frente", "carnet_dorso"];

            // Forzar placeholder para el cert_salud (nuevo chofer, sin importar si el anterior era titular o no)
            existentes = existentes.map(d => {
                if (d.tipo_documento === "cert_salud") {
                    return { ...d, ruta_archivo: "", faltante: true };
                }
                return d;
            });

            // Agregar placeholders de los 4 documentos de chofer si no existen
            nuevosDocsChofer.forEach(t => {
                if (!existentes.some(d => d.tipo_documento === t)) {
                    existentes.push({ tipo_documento: t, ruta_archivo: "", faltante: true });
                }
            });
        }

        // Detectar faltantes (documentos no existentes aún)
        const faltantes = tiposEsperados
            .filter(t => !existentes.some(d => d.tipo_documento === t))
            .map(t => ({ tipo_documento: t, ruta_archivo: "", faltante: true }));

        return [...existentes, ...faltantes];
    }

    // --- Modal de previsualización (idéntico al alta, con botón Cerrar) ---
    const crearModalPreview = () => {
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

    // --- Rutas públicas de archivos (sin cambios) ---
    const pathPublico = (ruta = '') => {
        if (!ruta) return '';
        const idx = ruta.indexOf('uploads/');
        if (idx !== -1) {
            return '/' + ruta.slice(idx).replace(/\\/g, '/');
        }
        if (ruta.startsWith('/uploads/') || ruta.startsWith('uploads/'))
            return `/${ruta.replace(/^\/?/, '')}`;
        return `/uploads/documentos_transporte/${ruta}`;
    };

    // === FILTRO DINÁMICO DE DOCUMENTOS SEGÚN CHOFER/TITULAR ===
    const docsChofer = ['dni_frente', 'dni_dorso', 'carnet_frente', 'carnet_dorso', 'cert_salud'];
    const docsVehiculo = ['foto_vehiculo', 'cedula_verde', 'seguro_vehiculo', 'vto_vehiculo', 'sellado_bromatologico'];

    function actualizarVisibilidadDocs(opcion = 'original') {
        const miniaturas = document.querySelectorAll('#contenedorDocTransporte .col');
        if (!miniaturas.length) return;

        miniaturas.forEach(col => {
            const tipo = col.dataset.tipoDocumento;
            if (!tipo) return;

            if (opcion === 'titular') {
                col.style.display = (docsVehiculo.includes(tipo) || tipo === 'cert_salud') ? 'block' : 'none';
            } else if (opcion === 'chofer') {
                col.style.display = 'block';
            } else if (opcion === 'nuevoTitular') {
                col.style.display = (docsVehiculo.includes(tipo) || tipo === 'cert_salud') ? 'block' : 'none';
            } else if (opcion === 'nuevoChofer') {
                col.style.display = 'block';
                if (docsChofer.includes(tipo)) {
                    const input = col.querySelector('input[type="file"]');
                    if (input) input.value = '';
                }
            } else {
                col.style.display = 'block';
            }
        });
    }

    // ====== Buscar por número de habilitación ======
    // === FUNCIÓN REUTILIZABLE PARA CARGAR TRANSPORTE ===
    async function buscarTransporte() {
        const id = (idTransporte.value || '').trim();
        if (!id) {
            alert('Ingrese un número de habilitación válido.');
            return;
        }

        try {
            const resp = await fetch(`/api/renovacion-transporte/datos?id_transporte=${encodeURIComponent(id)}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (!resp.ok) {
                if (resp.status === 404) {
                    alert('No se encontró transporte con ese número de habilitación.');
                    return;
                }
                throw new Error('Error en la consulta');
            }

            const data = await resp.json();
            // ✅ Desbloquear campos al cargar transporte correctamente
            camposBloqueados.forEach(el => el.disabled = false);

            // Guardar globalmente los datos del transporte y estado del chofer
            window._dataTransporteActual = data;

            window._choferEsTitularActual =
                (!data.nombre_chofer && !data.dni_chofer) ||
                (
                    data.nombre_chofer?.trim().toUpperCase() === data.nombre_completo_titular?.trim().toUpperCase() &&
                    data.dni_chofer?.trim() === data.dni_titular?.trim()
                );

            // Rellenar campos (respetando readonly de titular y vehículo)
            dniTitular.value = data.dni_titular || '';
            nombreTitular.value = data.nombre_completo_titular || ''; // nombre + apellido concatenados
            tipoVehiculo.value = data.tipo_vehiculo || '';
            patente.value = data.patente || '';
            numeroVehiculo.value = data.numero_vehiculo || '';

            // 🟢 Guardar los datos originales del chofer para restaurarlos si se cancela el cambio
            let codAreaOriginal = data.cod_area_chofer || "";
            let telefonoOriginal = data.telefono_chofer || "";

            // Si el teléfono llega combinado (ej: "3854-567890"), intentar dividirlo
            if (!codAreaOriginal && telefonoOriginal?.includes("-")) {
                const partes = telefonoOriginal.split("-");
                codAreaOriginal = partes[0] || "";
                telefonoOriginal = partes[1] || "";
            }

            datosChoferOriginal = {
                nombre: data.nombre_chofer || "",
                dni: data.dni_chofer || "",
                carnet: data.carnet_chofer || "",
                codArea: codAreaOriginal,
                telefono: telefonoOriginal
            };

            // ====== CARGA DE TIPO DE ALIMENTO ======
            if (data.tipo_alimento) {
                const opcionExiste = Array.from(tipoAlimento.options).some(
                    opt => opt.value === data.tipo_alimento
                );

                if (opcionExiste) {
                    // Si el valor está entre las opciones, se selecciona normalmente
                    tipoAlimento.value = data.tipo_alimento;
                    otroTipoAlimento.classList.add('d-none');
                    otroTipoAlimento.value = '';
                } else {
                    // Si no existe en las opciones, mostrar campo "otros" y colocar el valor
                    tipoAlimento.value = 'otros';
                    otroTipoAlimento.classList.remove('d-none');
                    otroTipoAlimento.value = data.tipo_alimento;
                }
            } else {
                // Si viene vacío
                tipoAlimento.value = '';
                otroTipoAlimento.classList.add('d-none');
                otroTipoAlimento.value = '';
            }

            // Fechas
            vtoFecha.value = normalizarFechaInput(data.vto_fecha || data.vto || '');
            seguroFecha.value = normalizarFechaInput(data.seguro_fecha || data.seguro || '');

            // Monto del sellado (si backend lo envía)
            if (typeof data.monto_sellado !== 'undefined' && data.monto_sellado !== null) {
                montoSellado.value = formatCurrencyAR(Number(data.monto_sellado) || 0);
            }

            // ====== CARGA DE DATOS DEL CHOFER ======
            nombreChofer.value = data.nombre_chofer || '';
            dniChofer.value = data.dni_chofer || '';
            carnetChofer.value = data.carnet_chofer || '';

            if (data.telefono_chofer) {
                const partesTel = data.telefono_chofer.split('-');
                const cod = (partesTel[0] || '').trim();
                const tel = (partesTel[1] || '').trim();

                // 🔹 Solo carga números válidos; si viene solo "-", deja los campos vacíos
                codAreaChofer.value = /^\d+$/.test(cod) ? cod : '';
                telefonoChofer.value = /^\d+$/.test(tel) ? tel : '';
            } else {
                codAreaChofer.value = '';
                telefonoChofer.value = '';
            }


            // === Detectar si el titular es también el chofer ===
            const avisoTitular = document.getElementById("avisoTitularEsChofer");

            const choferEsTitular =
                (!data.nombre_chofer && !data.dni_chofer) ||
                (
                    data.nombre_chofer?.trim().toUpperCase() === data.nombre_completo_titular?.trim().toUpperCase() &&
                    data.dni_chofer?.trim() === data.dni_titular?.trim()
                );

            // === Estado inicial según si el chofer es titular o no ===
            configurarEstadoInicialChofer(choferEsTitular);

            // Documentación (filtrada según si el chofer es titular o no)
            const docsFiltrados = filtrarDocumentacionPorChofer(
                Array.isArray(data.documentacion) ? data.documentacion : [],
                choferEsTitular
            );
            mostrarDocumentacion(docsFiltrados);

            reaplicarFiltroTrasRender();
            // 🟢 Aplicar color y bloqueo visual de campos tras cargar el transporte
            aplicarBloqueoCamposInicial();
            manejarCambioChoferVisual();


            // Ajustar montos y meses
            actualizarMontos();

            // 🔔 Disparar evento para cálculos automáticos al cargar transporte
            document.dispatchEvent(new Event('transporteCargado'));

        } catch (err) {
            console.error(err);
            alert('Error al buscar transporte. Verifique la conexión o intente nuevamente.');
        }
    }

    // ✅ Acción del botón buscar (mismo comportamiento de antes)
    btnBuscarTransporte?.addEventListener('click', buscarTransporte);

    const normalizarFechaInput = (f) => {
        if (!f) return '';
        // acepta "YYYY-MM-DD" o ISO completo
        const d = new Date(f);
        if (isNaN(d)) return '';
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // ====== Eventos de UI ======
    if (tipoAlimento) {
        tipoAlimento.addEventListener('change', syncOtroTipoAlimento);
    }
    [vtoFecha, seguroFecha, mesesAdelantar].forEach(el => {
        el && el.addEventListener('input', actualizarMontos);
        el && el.addEventListener('change', actualizarMontos);
    });

    // ====== Cálculo de meses y montos (versión renovación adaptada del alta) ======

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

    // Bloquear tipoVehiculo y patente (solo lectura en renovación)
    tipoVehiculo.readOnly = true;
    patente.readOnly = true;

    // Ejecutar una vez al cargar transporte
    document.addEventListener('transporteCargado', actualizarMontos);

    // === SINCRONIZACIÓN DOCS ↔ RADIOS ===
    const _DOCS_CHOFER = ['dni_frente', 'dni_dorso', 'carnet_frente', 'carnet_dorso', 'cert_salud'];
    const _DOCS_VEHICULO = ['foto_vehiculo', 'cedula_verde', 'seguro_vehiculo', 'vto_vehiculo', 'sellado_bromatologico'];

    function _decidirModoDocs() {
        if (cambioChoferNo?.checked) {
            return esTitularOriginal ? 'titular' : 'chofer';
        }
        if (cambioChoferSi?.checked) {
            if (esTitularOriginal) return 'nuevoChofer';
            if (choferTitularSi?.checked) return 'nuevoTitular';
            if (choferTitularNo?.checked) return 'nuevoChofer';
            return 'chofer';
        }
        return esTitularOriginal ? 'titular' : 'chofer';
    }

    function _aplicarModoDocs(modo) {
        console.log("📦 _aplicarModoDocs ejecutado con modo:", modo);

        const miniaturas = document.querySelectorAll('#contenedorDocTransporte [data-tipo-documento]');
        if (!miniaturas.length) return;

        miniaturas.forEach(col => {
            const tipo = col.dataset.tipoDocumento;
            if (!tipo) return;

            if (modo === 'titular' || modo === 'nuevoTitular') {
                col.style.display = (_DOCS_VEHICULO.includes(tipo) || tipo === 'cert_salud') ? 'block' : 'none';
            } else if (modo === 'chofer') {
                col.style.display = 'block';
            } else if (modo === 'nuevoChofer') {
                col.style.display = 'block';
                if (_DOCS_CHOFER.includes(tipo)) {
                    const input = col.querySelector('input[type="file"]');
                    if (input) input.value = '';
                }
            } else {
                col.style.display = 'block';
            }
        });
    }

    /**
     * 🔎 NUEVO: Inferir el estado para el RESUMEN a partir de lo ya renderizado
     * - No modifica la lógica de placeholders
     * - Solo lee cuántos docs visibles hay y si alguno es placeholder
     * - Actualiza:
     *    - window._choferEsTitularActual
     *    - (si existe) el valor del input dentro de #avisoTitularEsChofer,
     *      para que el resumen muestre la leyenda correcta.
     */
    function actualizarEstadoResumenPorDocs() {
        const cont = document.getElementById('contenedorDocTransporte');
        if (!cont) return;

        const cols = Array.from(cont.querySelectorAll('[data-tipo-documento]'))
            .filter(col => {
                // visibles en pantalla
                const visible = col.offsetParent !== null && getComputedStyle(col).display !== 'none';
                return visible;
            });

        const visibles = cols.length;

        // detectar si alguna miniatura visible es placeholder (imagen genérica)
        const hayPlaceholderVisible = cols.some(col => {
            const img = col.querySelector('img');
            return img && /Bromat-docu\.png$/i.test(img.src);
        });

        // destino del texto (si existe un input interno, lo usamos; sino no tocamos nada visual)
        const avisoCont = document.getElementById('avisoTitularEsChofer');
        const avisoInput = avisoCont ? avisoCont.querySelector('input') : null;

        // Reglas:
        // 10 visibles -> chofer distinto (mostrar datos del chofer en el resumen)
        // 6 visibles + placeholder -> "En la renovación el titular será el chofer"
        // 6 visibles + sin placeholder -> "El titular es el chofer"
        if (visibles >= 10) {
            window._choferEsTitularActual = false;
            if (avisoInput) avisoInput.value = ""; // evitamos que el resumen muestre el cartel
            return;
        }

        if (visibles === 6) {
            window._choferEsTitularActual = true;
            if (avisoInput) {
                avisoInput.value = hayPlaceholderVisible
                    ? "En la renovación el titular será el chofer"
                    : "El titular es el chofer";
            }
            return;
        }

        // En cualquier otro caso, no tocar estado (por seguridad)
        // (no modificamos window._choferEsTitularActual ni el aviso)
    }

    function syncDocsUI() {
        console.log("🔄 Entrando en syncDocsUI()");

        // Evitar ocultar preguntas si el usuario está eligiendo cambio de chofer
        if (cambioChoferSi?.checked && !choferTitularSi?.checked && !choferTitularNo?.checked) {
            console.log("🟡 Esperando definición de titularidad, no alterar bloques.");
            return;
        }

        const modo = _decidirModoDocs();
        _aplicarModoDocs(modo);

        // 🆕 Tras aplicar el modo (que solo cambia visibilidad), inferimos el estado para el RESUMEN
        actualizarEstadoResumenPorDocs();
    }


    function reaplicarFiltroTrasRender() {
        syncDocsUI(); // sync aplica el modo y, ahora, también actualiza el estado del resumen
    }

    cambioChoferSi?.addEventListener('change', syncDocsUI);
    cambioChoferNo?.addEventListener('change', syncDocsUI);
    choferTitularSi?.addEventListener('change', syncDocsUI);
    choferTitularNo?.addEventListener('change', syncDocsUI);

    // === Refrescar documentos al cambiar de chofer (versión corregida) ===
    let dataActual = null;
    let choferEsTitularActual = false;

    // 🔹 Guardamos y actualizamos la info cuando se carga un transporte
    document.addEventListener('transporteCargado', () => {
        dataActual = window._dataTransporteActual || null;

        // Esperar un tick para asegurar que las variables globales estén definidas
        setTimeout(() => {
            choferEsTitularActual = window._choferEsTitularActual ?? false;
            console.info("✅ Titularidad definida:", choferEsTitularActual ? "Titular = chofer" : "Chofer distinto del titular");
            // 🆕 Tras carga inicial y render, también inferimos por las miniaturas visibles
            actualizarEstadoResumenPorDocs();
        }, 100);
    });


    // === Escenario 2: titular (era chofer) → pasa a nuevo chofer distinto ===
    cambioChoferSi?.addEventListener('change', () => {
        if (cambioChoferSi.checked && dataActual && choferEsTitularActual) {
            const docsFiltrados = filtrarDocumentacionPorChofer(
                Array.isArray(dataActual.documentacion) ? dataActual.documentacion : [],
                choferEsTitularActual,
                true // modo "cambia de chofer"
            );
            mostrarDocumentacion(docsFiltrados);
            reaplicarFiltroTrasRender();
            // 🆕 aseguramos que el estado del resumen se actualice tras el re-render
            actualizarEstadoResumenPorDocs();
        }
    });

    // === Escenario 3: chofer distinto de titular → cambia a otro chofer distinto ===

    // Primera pregunta: ¿Cambia de chofer?
    cambioChoferSi?.addEventListener('change', () => {
        // Si aún no respondió la segunda pregunta, no hacemos nada visual todavía
        if (cambioChoferSi.checked && !choferEsTitularActual) {
            console.log("🟡 Esperando respuesta de la segunda pregunta (titularidad)...");
        }
    });

    // Segunda pregunta: ¿Será el titular?
    choferTitularNo?.addEventListener('change', () => {
        if (choferTitularNo.checked && cambioChoferSi?.checked && dataActual && !choferEsTitularActual) {
            const docsFiltrados = filtrarDocumentacionPorChofer(
                Array.isArray(dataActual.documentacion) ? dataActual.documentacion : [],
                true, // el nuevo chofer no es titular
                true   // fuerza placeholders del nuevo chofer
            );
            mostrarDocumentacion(docsFiltrados);
            reaplicarFiltroTrasRender();
            console.log("🟢 Escenario 3 ejecutado en segunda pregunta (placeholders generados)");
            // 🆕 tras render, actualizar estado para el resumen
            actualizarEstadoResumenPorDocs();
        }
    });

    // 📘 Nota:
    // En esta llamada se usan dos valores `true` intencionalmente:
    //
    // 1️⃣ El primer `true` (choferEsTitular) indica que se filtren solo los documentos del vehículo,
    //     descartando los personales del chofer anterior.
    //
    // 2️⃣ El segundo `true` (cambiaDeChofer) fuerza la creación de los placeholders del nuevo chofer
    //     (DNI, carnet y certificado de salud).
    //
    // De esta manera, el sistema muestra correctamente los 5 documentos del vehículo
    // más los 5 placeholders del nuevo chofer, igual que en el escenario 2.

    // === Escenario 4: chofer distinto de titular → pasa a ser el titular ===
    choferTitularSi?.addEventListener('change', () => {
        if (choferTitularSi.checked && cambioChoferSi?.checked && dataActual && !choferEsTitularActual) {
            const docsFiltrados = filtrarDocumentacionPorChofer(
                Array.isArray(dataActual.documentacion) ? dataActual.documentacion : [],
                true,  // ahora el chofer pasa a ser el titular
                true   // fuerza placeholder del cert_salud (titular)
            );
            mostrarDocumentacion(docsFiltrados);
            reaplicarFiltroTrasRender();
            console.log("🟢 Escenario 4 ejecutado (chofer → titular, cert_salud placeholder actualizado)");
            // 🆕 tras render, actualizar estado para el resumen
            actualizarEstadoResumenPorDocs();
        }
    });


    // === Capitalización automática del nombre del chofer ===
    const inputNombreChofer = document.getElementById('nombreChofer');

    inputNombreChofer?.addEventListener('input', (e) => {
        const valor = e.target.value
            .toLowerCase()
            .replace(/\b\w/g, (letra) => letra.toUpperCase());
        e.target.value = valor;
    });

    // === Formato automático del DNI del chofer ===
    const inputDniChofer = document.getElementById('dniChofer');

    inputDniChofer?.addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, ''); // solo números
        if (valor.length > 2 && valor.length <= 5) {
            valor = valor.replace(/(\d{2})(\d+)/, '$1.$2');
        } else if (valor.length > 5 && valor.length <= 8) {
            valor = valor.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
        } else if (valor.length > 8) {
            valor = valor.substring(0, 8).replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
        }
        e.target.value = valor;
    });

    // === Formato automático del carnet de conducir (sin puntos) ===
    const inputCarnetChofer = document.getElementById('carnetChofer');

    inputCarnetChofer?.addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, ''); // elimina todo lo que no sea número
        if (valor.length > 8) valor = valor.substring(0, 8); // máximo 8 dígitos
        e.target.value = valor;
    });

    // --- Validación dinámica de teléfono del chofer (idéntico al alta) ---
    const codAreaChoferInput = document.getElementById('cod_area_chofer');
    const telChoferInput = document.getElementById('telefono_chofer');

    if (codAreaChoferInput && telChoferInput) {
        codAreaChoferInput.addEventListener('input', () => {
            codAreaChoferInput.value = codAreaChoferInput.value.replace(/\D/g, '');
            const len = codAreaChoferInput.value.length;
            let maxLen = 8;
            if (len === 2) maxLen = 8;
            else if (len === 3) maxLen = 7;
            else if (len === 4) maxLen = 6;
            telChoferInput.maxLength = maxLen;
        });

        telChoferInput.addEventListener('input', () => {
            telChoferInput.value = telChoferInput.value.replace(/\D/g, '');
        });
    }

    // === Función para generar el resumen del formulario de RENOVACIÓN (idéntico al alta) ===
    function previsualizarRenovacion() {

        // --- Determinar si el chofer es el titular según lo cargado en el formulario ---
        const nombreChofer = document.getElementById("nombreChofer")?.value?.trim();
        const dniChofer = document.getElementById("dniChofer")?.value?.trim();
        const carnetChofer = document.getElementById("carnetChofer")?.value?.trim();

        // Detectar si el titular será el chofer (según cartel del formulario)
        let choferEsTitular = false;
        const avisoChofer = document.querySelector("#avisoTitularEsChofer input")?.value?.trim() || "";

        if (avisoChofer === "El titular es el chofer." || avisoChofer === "En la renovación el titular será el chofer") {
            choferEsTitular = true;
        } else {
            choferEsTitular = !nombreChofer && !dniChofer && !carnetChofer;
        }

        // --- TITULAR ---
        let resumenHTML = `
    <div class="preview-item">
      <span class="preview-label">DNI Titular:</span>
      <span class="preview-value">${document.getElementById("dniTitular")?.value || ""}</span>
    </div>
    <div class="preview-item">
      <span class="preview-label">Nombre Titular:</span>
      <span class="preview-value">${document.getElementById("nombreTitular")?.value || ""}</span>
    </div>
  `;

        // --- CHOFER ---
        if (choferEsTitular) {
            resumenHTML += `
      <div class="preview-item">
        <span class="preview-label">Chofer:</span>
        <span class="preview-value fw-semibold text-success">El chofer será el titular</span>
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
      <span class="preview-value">(${document.getElementById("cod_area_chofer")?.value || ""
                }) ${document.getElementById("telefono_chofer")?.value || ""}</span>
    </div>
  `;
        }

        // --- VEHÍCULO ---
        resumenHTML += `
  <div class="preview-item">
    <span class="preview-label">Número de Vehículo:</span>
    <span class="preview-value">${document.getElementById("numeroVehiculo")?.value || ""}</span>
  </div>
  <div class="preview-item">
    <span class="preview-label">Tipo de Vehículo:</span>
    <span class="preview-value">${document.getElementById("tipoVehiculo")?.selectedOptions?.[0]?.text ||
            document.getElementById("tipoVehiculo")?.value || ""
            }</span>
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
        // --- Toma el número real de la BD si existe ---
        const numRenovacionActual = Number(
            window._dataTransporteActual?.numero_renovacion ??
            window._dataTransporteActual?.nro_renovacion ??
            0
        );
        const siguienteRenovacion = numRenovacionActual + 1;

        resumenHTML += `
  <div style="
    text-align: center;
    margin: 18px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #0e3816ff; /* verde del botón Confirmar renovación */
  ">
    Esta será la renovación Nº ${siguienteRenovacion}
  </div>
`;

        // --- DOCUMENTOS CARGADOS (visibles + renovados + faltantes obligatorios) ---
        const placeholders = Array.from(document.querySelectorAll(".documento-item img"))
            .filter(img => img.src.includes("Bromat-docu.png")) // placeholder visual
            .map(img => img.closest(".documento-item")?.querySelector(".form-label")?.textContent.trim())
            .filter(Boolean);

        const renovados = Array.from(reemplazosDocs.keys());

        let documentos = [...new Set([...placeholders, ...renovados])];

        if (choferEsTitular) {
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
            : "Sin documentos nuevos ni pendientes.";

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

    // === Confirmar desde el modal (idéntico al alta) ===
    document.getElementById("btnConfirmarModal")?.addEventListener("click", async function () {
        const form = document.getElementById("formRenovacionTransporte");
        if (!form) return;

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        // 🔹 Llamá aquí a tu función de guardado actual
        await enviarFormularioRenovacion(); // <- usa el mismo nombre que ya tenés para el fetch
    });

    const safeJson = async (resp) => {
        try { return await resp.json(); } catch { return null; }
    };

    // === Validación y previsualización del formulario de RENOVACIÓN (idéntico al ALTA + placeholders) ===
    document.getElementById('formRenovacionTransporte')?.addEventListener('submit', function (e) {

        e.preventDefault();
        e.stopPropagation();

        // 🔹 Primero, validar los placeholders visibles
        if (!validarPlaceholdersCompletos()) {
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
    function resetearEstadoVisualFormulario() {
        const form = document.getElementById("formRenovacionTransporte");
        if (!form) return;

        // Eliminar clases de validación
        form.classList.remove("was-validated");

        // Quitar bordes verdes y rojos de todos los campos
        form.querySelectorAll(".is-valid, .is-invalid").forEach(el => {
            el.classList.remove("is-valid", "is-invalid");
        });
    }

    // === Validar que todos los placeholders visibles tengan imagen cargada (idéntico al alta) ===
    function validarPlaceholdersCompletos() {
        const imgs = Array.from(document.querySelectorAll('#contenedorDocTransporte img'));
        let faltantes = [];
        let primerPlaceholder = null;

        imgs.forEach(img => {
            const cont = img.closest('[data-tipo-documento], .col, .documento-item') || img;
            const visible = cont.offsetParent !== null && getComputedStyle(cont).display !== 'none';
            if (!visible) return;

            const tipo = cont.dataset?.tipoDocumento || img.dataset?.tipoDocumento || img.getAttribute('data-tipo') || '';
            const inputFile = tipo
                ? (
                    document.querySelector(`#contenedorDocTransporte input[type="file"][data-tipo-documento="${tipo}"], 
                    #contenedorDocTransporte input[type="file"][name="${tipo}"]`)
                    || cont.querySelector('input[type="file"]')
                )
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
                msg.textContent = 'Introducir una imagen.';
                cont.appendChild(msg);
            } else {
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
        const btnChequearDatos = document.getElementById("btnChequearDatos");
        const avisoNoModificados = document.getElementById("avisoNoModificados");
        const flechaAviso = document.getElementById("flechaAviso");

        if (!btnChequearDatos) return;

        let primerChequeoHecho = false;

        function resetValidacionNaranja() {

            // Resetear estado interno
            primerChequeoHecho = false;

            // Quitar marcas naranjas en inputs y documentos
            document.querySelectorAll(".campo-no-modificado").forEach(el => {
                el.classList.remove("campo-no-modificado");
            });

            // Ocultar mensajes y flecha de validación naranja
            if (avisoNoModificados) avisoNoModificados.style.display = "none";
            if (flechaAviso) flechaAviso.style.display = "none";
        }

        // ======================================================
        // === 🔁 Reset automático cada vez que se cambia escenario
        // ======================================================

        // Grupo 1: “¿Cambia de chofer?”
        cambioChoferSi.addEventListener("change", () => {
            resetValidacionNaranja();
            manejarCambioChofer(); // ya existente
        });

        cambioChoferNo.addEventListener("change", () => {
            resetValidacionNaranja();
            manejarCambioChofer(); // ya existente
        });

        // Grupo 2: “¿Será el titular?”
        choferTitularSi.addEventListener("change", () => {
            resetValidacionNaranja();
            manejarChoferTitular(); // ya existente
        });

        choferTitularNo.addEventListener("change", () => {
            resetValidacionNaranja();
            manejarChoferTitular(); // ya existente
        });

        // 🔹 Guardar valores originales al cargar transporte
        let datosOriginales = {};
        document.addEventListener("transporteCargado", () => {
            datosOriginales = {};
            document
                .querySelectorAll(
                    "#formRenovacionTransporte input, #formRenovacionTransporte select, #formRenovacionTransporte textarea"
                )
                .forEach((el) => {
                    if (!el.disabled && !el.readOnly && el.id) {
                        datosOriginales[el.id] = el.value;
                    }
                });

            // 🔸 Quitar naranja en vivo cuando el usuario modifica algo (RÉPLICA DE COMERCIO)
            document
                .querySelectorAll(
                    "#formRenovacionTransporte input, #formRenovacionTransporte select, #formRenovacionTransporte textarea"
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
            const form = document.getElementById("formRenovacionTransporte");
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
                validarPlaceholdersCompletos();

                return; // detener aquí si hay errores de campos
            }

            // Segundo: validar placeholders
            if (!validarPlaceholdersCompletos()) {
                form.classList.add("was-validated");

                // Buscar si hay algún campo inválido antes de hacer foco en placeholders
                const primerInvalido = form.querySelector(":invalid");
                if (primerInvalido) {
                    setTimeout(() => {
                        primerInvalido.scrollIntoView({ behavior: "smooth", block: "center" });
                        primerInvalido.focus({ preventScroll: true });
                    }, 60);
                } else {
                    // Si no hay campos inválidos, el foco lo maneja validarPlaceholdersCompletos()
                }

                return; // detener aquí si hay placeholders faltantes
            }

            // --- 2️⃣ VALIDACIÓN NARANJA ---
            const camposEditables = Array.from(
                document.querySelectorAll(
                    "#formRenovacionTransporte input:not([readonly]):not([disabled]):not([type=hidden]):not([type=radio]):not(#idTransporte), #formRenovacionTransporte select:not([disabled]), #formRenovacionTransporte textarea:not([disabled])"
                )
            );

            let noModificados = [];

            // Si quedan placeholders → activar validación roja y detener
            const placeholdersVisibles = Array.from(document.querySelectorAll('#contenedorDocTransporte img'))
                .filter(img => /Bromat-docu\.png$/i.test(img.src) && img.offsetParent !== null);

            console.log("📸 Placeholders visibles:", placeholdersVisibles.length);
            if (placeholdersVisibles.length > 0) {
                validarPlaceholdersCompletos(); // activa bordes rojos y mensajes
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
            const docs = document.querySelectorAll("#contenedorDocTransporte [data-tipo-documento]");
            docs.forEach((col) => {
                const tipo = col.dataset.tipoDocumento;
                const fueReemplazado = reemplazosDocs.has(tipo);
                const img = col.querySelector("img");

                if (!fueReemplazado && img && !/Bromat-docu\.png$/i.test(img.src)) {
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
                    document.getElementById('modalNaranjaTransporte')
                );
                modalNaranja.show();

                avisoNoModificados.textContent = "Si no debe renovar estos campos presione nuevamente";
                flechaAviso.innerHTML = "↓";

                // Se muestran, y damos un pequeño margen de repintado antes del return
                avisoNoModificados.style.display = "block";
                flechaAviso.style.display = "block";

                requestAnimationFrame(() => {
                    avisoNoModificados.offsetHeight; // fuerza repintado del DOM
                });

                primerChequeoHecho = true;
                console.log("🟢 CLICK en Chequear Datos | primerChequeoHecho:", primerChequeoHecho);
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

        // 🔁 Reiniciar validación si se cambia de chofer
        document.querySelectorAll("#cambioChoferSi, #cambioChoferNo").forEach((r) => {
            r.addEventListener("change", () => {
                document
                    .querySelectorAll(".campo-no-modificado")
                    .forEach((el) => el.classList.remove("campo-no-modificado"));
                avisoNoModificados.style.display = "none";
                flechaAviso.style.display = "none";
                primerChequeoHecho = false;
            });
        });
    })();

});

// === Envío final del formulario de renovación (idéntico al alta, sin QR) ===
async function enviarFormularioRenovacion() {
    try {
        const form = document.getElementById('formRenovacionTransporte');
        const formData = new FormData(form);

        // 🔹 Datos básicos del transporte
        formData.append('id_titular_ambulante', window._dataTransporteActual?.id_titular_ambulante || '');
        formData.append('id_transporte', window._dataTransporteActual?.id_transporte || '');
        formData.append('tipo_vehiculo', document.getElementById('tipoVehiculo')?.value || '');
        formData.append('patente', document.getElementById('patente')?.value?.trim() || '');
        formData.append('tipo_alimento', document.getElementById('tipoAlimento')?.value === 'otros'
            ? document.getElementById('otroTipoAlimento')?.value.trim()
            : document.getElementById('tipoAlimento')?.value || '');

        formData.append('vto_fecha', document.getElementById('vtoFecha')?.value || '');
        formData.append('seguro_fecha', document.getElementById('seguroFecha')?.value || '');

        // 🔹 Datos del chofer
        formData.append('nombre_chofer', document.getElementById('nombreChofer')?.value || '');
        formData.append('dni_chofer', document.getElementById('dniChofer')?.value || '');
        formData.append('carnet_chofer', document.getElementById('carnetChofer')?.value || '');
        const codChofer = document.getElementById('cod_area_chofer')?.value?.trim() || '';
        const numChofer = document.getElementById('telefono_chofer')?.value?.trim() || '';
        const telChofer = (codChofer && numChofer)
            ? `${codChofer}-${numChofer}`
            : (document.getElementById('telefonoChofer')?.value || '');
        formData.append('telefono_chofer', telChofer);

        // 🔹 Montos
        formData.append('monto_sellado', (document.getElementById('montoSellado')?.value || '').replace(/[^\d]/g, '') || '0');
        formData.append('meses_adelantados', document.getElementById('mesesAdelantar')?.value || '1');
        formData.append('monto_total', (document.getElementById('montoTotal')?.value || '').replace(/[^\d]/g, '') || '0');

        // 🔹 Número de renovación (dato real desde la base + 1)
        const nroActual = Number(window._dataTransporteActual?.numero_renovacion || 0);
        formData.append('numero_renovacion', nroActual + 1);

        // === Adjuntar documentos al FormData (restaurado como versión anterior) ===
        if (typeof reemplazosDocs !== "undefined" && reemplazosDocs.size > 0) {
            for (const [tipoDoc, archivo] of reemplazosDocs.entries()) {
                formData.append(tipoDoc, archivo);
            }
        }

        // 🧩 Si se eligió que el titular será el chofer, enviar los datos del chofer vacíos
        const choferTitularSi = document.getElementById('choferTitularSi');
        if (choferTitularSi?.checked) {
            formData.set('nombre_chofer', '');
            formData.set('dni_chofer', '');
            formData.set('carnet_chofer', '');
            formData.set('telefono_chofer', '');
        }

        // 📤 Enviar formulario (idéntico a alta, solo cambia la ruta)
        const response = await fetch('/api/renovacion-transporte/actualizar', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });

        if (!response.ok) {
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
        window.location.href = 'panel-principal.html';

    } catch (error) {
        console.error('Error en enviarFormularioRenovacion:', error);
        alert('Ocurrió un error al enviar la renovación.');
    }
}

