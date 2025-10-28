// === renovacion-transporte.js (clásico, sin imports) ===
// Respeta el patrón de form-alta-transporte.js (DOMContentLoaded, ids, sin módulos)

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ renovacion-transporte.js cargado');

    // ---- Referencias a elementos del DOM (mismos ids del HTML) ----
    const form = document.getElementById('formRenovacionTransporte');

    const idTransporte = document.getElementById('idTransporte');
    const btnBuscarTransporte = document.getElementById('btnBuscarTransporte');

    // --- Mostrar modal de advertencia al ingresar ---
    window.addEventListener('DOMContentLoaded', () => {
        const modal = new bootstrap.Modal(document.getElementById('modalAdvertencia'));
        modal.show();

        const campoId = document.getElementById('idTransporte');
        const boton = document.querySelector('#modalAdvertencia .btn-primary');
        boton.addEventListener('click', () => {
            if (campoId) campoId.focus({ preventScroll: true });
        });
    });

    // --- Desactivar todos los campos hasta que se cargue un transporte ---
    // (excepto el buscador y el botón del modal)
    const camposBloqueados = document.querySelectorAll(
        'input, select, textarea, button:not(#btnBuscarTransporte):not(#btnAceptarModal)'
    );
    camposBloqueados.forEach(el => el.disabled = true);

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
        if (choferTitularSi.checked) {
            // Será el titular
            avisoTitular.classList.remove("d-none");
            bloqueDatosChofer.style.display = "none";

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
            col.className = 'col-md-3 text-center mb-3';
            col.dataset.tipoDocumento = doc.tipo_documento || doc.tipo || '';

            const wrap = document.createElement('div');
            wrap.className = 'position-relative d-inline-block';
            wrap.style.width = '180px';
            wrap.style.height = '130px';
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
                const key = (doc.tipo_documento || doc.tipo || 'documento').toString();

                if (reemplazosDocs.has(key)) {
                    reemplazosDocs.delete(key);
                    vista.src = pathPublico(doc.ruta_archivo || '/img/Bromat-docu.png');
                    btnRenovar.classList.remove('btn-info');
                    btnRenovar.classList.add('btn-success');
                    btnRenovar.innerHTML = '<i class="fas fa-sync-alt"></i>';
                    return;
                }

                const inp = document.createElement('input');
                inp.type = 'file';
                inp.accept = 'image/*,application/pdf';
                inp.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    reemplazosDocs.set(key, file);

                    if (file.type.startsWith('image/')) {
                        const url = URL.createObjectURL(file);
                        vista.src = url;
                    } else {
                        vista.src = '/img/pdf_icon.png';
                    }

                    btnRenovar.classList.remove('btn-success');
                    btnRenovar.classList.add('btn-info');
                    btnRenovar.innerHTML = '<i class="fas fa-check" style="font-size:1.1rem;color:white;"></i>';
                };
                inp.click();
            });

            const etiqueta = document.createElement('p');
            etiqueta.className = 'small mt-1';

            let textoEtiqueta = doc.tipo_documento || doc.tipo || 'Documento';

            // Etiqueta más descriptiva para cert_salud (corrige escenario 4)
            if ((doc.tipo_documento || doc.tipo) === 'cert_salud') {
                const esEscenario4 =
                    cambioChoferSi?.checked &&
                    choferTitularSi?.checked &&
                    window._dataTransporteActual &&
                    window._choferEsTitularActual === false;

                if (esEscenario4) {
                    textoEtiqueta = 'Certificado de buena salud (titular)';
                } else {
                    textoEtiqueta = doc.faltante
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
                codAreaChofer.value = partesTel[0] || '';
                telefonoChofer.value = partesTel[1] || data.telefono_chofer || '';
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

    function syncDocsUI() {
        console.log("🔄 Entrando en syncDocsUI()");

        // Evitar ocultar preguntas si el usuario está eligiendo cambio de chofer
        if (cambioChoferSi?.checked && !choferTitularSi?.checked && !choferTitularNo?.checked) {
            console.log("🟡 Esperando definición de titularidad, no alterar bloques.");
            return;
        }

        const modo = _decidirModoDocs();
        _aplicarModoDocs(modo);
    }

    function reaplicarFiltroTrasRender() {
        syncDocsUI();
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
        }, 100);
    });


    // 🔹 Al buscar transporte, guardamos estas variables globales
    //btnBuscarTransporte?.addEventListener('click', () => {
    //    window._dataTransporteActual = data;
    //   window._choferEsTitularActual = choferEsTitular;
    //});

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

    // ====== Envío de renovación ======
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!idTransporte.value.trim()) {
            alert('Ingrese el número de habilitación.');
            idTransporte.focus();
            return;
        }

        const formData = new FormData();

        // Campos principales
        formData.append('id_transporte', idTransporte.value.trim());
        formData.append('nombre_chofer', nombreChofer.value.trim());
        formData.append('dni_chofer', dniChofer.value.trim());
        formData.append('carnet_chofer', carnetChofer.value.trim());

        const codChofer = codAreaChofer.value.trim();
        const numChofer = telefonoChofer.value.trim();
        const telChofer = (codChofer && numChofer)
            ? `${codChofer}-${numChofer}`
            : '';

        formData.append('telefono_chofer', telChofer);

        formData.append('tipo_vehiculo', tipoVehiculo.value);
        formData.append('tipo_alimento', tipoAlimento.value === 'otros' ? otroTipoAlimento.value : tipoAlimento.value);
        formData.append('patente', patente.value.trim());
        formData.append('vto_fecha', vtoFecha.value);
        formData.append('seguro_fecha', seguroFecha.value);

        // Montos (mismo criterio que alta)
        formData.append('monto_sellado', (document.getElementById('montoSellado')?.value || '').replace(/[^\d]/g, '') || '0');
        formData.append('meses_adelantados', document.getElementById('mesesAdelantar')?.value || '1');
        formData.append('monto_total', (document.getElementById('montoTotal')?.value || '').replace(/[^\d]/g, '') || '0');

        // 🔹 Solo documentos reemplazados (enviamos uno por tipo de documento)
        if (reemplazosDocs.size > 0) {
            reemplazosDocs.forEach((file, tipoDoc) => {
                formData.append(tipoDoc, file);
            });
        }

        // Token de autenticación
        const token = getToken();
        if (!token) {
            alert('Error: sesión no válida. Inicie sesión nuevamente.');
            return;
        }

        try {
            const resp = await fetch('/api/renovacion-transporte/actualizar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al guardar la renovación.');
            }

            const data = await resp.json();

            // Guardar datos globalmente para otros eventos
            window._dataTransporteActual = data;

            // Detectar si el chofer es titular
            const choferEsTitular =
                (!data.nombre_chofer && !data.dni_chofer) ||
                (
                    data.nombre_chofer?.trim().toUpperCase() === data.nombre_completo_titular?.trim().toUpperCase() &&
                    data.dni_chofer?.trim() === data.dni_titular?.trim()
                );

            // Guardar también esta condición globalmente
            window._choferEsTitularActual = choferEsTitular;

            // Emitir evento global (otros módulos pueden escucharlo)
            document.dispatchEvent(new Event("transporteCargado"));

            alert(`✅ Renovación guardada correctamente.\nNúmero de renovación: ${data.numero_renovacion}\nNueva fecha de vencimiento: ${new Date(data.fecha_vencimiento).toLocaleDateString('es-AR')}`);

            // 👉 Redirigir al panel principal
            window.location.href = 'panel-principal.html';

            reemplazosDocs.clear();
        } catch (error) {
            console.error('Error al guardar la renovación:', error);
            alert('❌ Ocurrió un error al guardar la renovación.');
        }
    });

    const safeJson = async (resp) => {
        try { return await resp.json(); } catch { return null; }
    };
});
