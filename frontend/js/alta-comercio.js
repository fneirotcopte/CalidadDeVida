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

// Documentos requeridos (COMERCIO / LOCAL + AMBULANTES)
const documentosRequeridos = {
    comunes: [
        { id: "doc_declaracion_rentas", nombre: "Declaración jurada de Rentas", requerido: true },
        { id: "sellado_bromatologico", nombre: "Último pago / Sell. Bromatológico", requerido: true }
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

// Variables globales
let anexoCount = 1;
let titulares = [];
let documentosCargados = {};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar elementos
    const categoriaSelect = document.getElementById('categoriaPrincipal');
    const rubroSelect = document.getElementById('rubro');
    const btnAddAnexo = document.getElementById('btnAddAnexo');
    const metrosCuadrados = document.getElementById('metrosCuadrados');
    const montoSellado = document.getElementById('montoSellado');
    const montoInspeccion = document.getElementById('montoInspeccion');
    const montoTotal = document.getElementById('montoTotal');
    const btnConfirmar = document.getElementById('btnConfirmar');
    const btnConfirmarModal = document.getElementById('btnConfirmarModal');
    const btnBuscarMapa = document.getElementById('btnBuscarMapa');
    const btnBuscarCuit = document.getElementById('btnBuscarCuit');
    const cuitBuscar = document.getElementById('cuitBuscar');
    const titularNombre = document.getElementById('titularNombre');
    const ubicacionInput = document.getElementById('ubicacion');
    const miniMapa = document.getElementById('miniMapa');

    // Pre-cargar titulares para búsqueda por CUIT
    cargarTitulares();

    // Evento para cambiar categoría
    categoriaSelect.addEventListener('change', function () {
        const categoria = this.value;

        // 👉 Mostrar/ocultar metros cuadrados según categoría
        const filaMetros = document.getElementById('filaMetros');
        const catLower = (categoria || '').toLowerCase();

        if (catLower === 'vendedor ambulante' || catLower === 'food truck') {
            if (filaMetros) {
                filaMetros.classList.add('d-none');
                const inputMetros = filaMetros.querySelector('#metrosCuadrados');
                if (inputMetros) inputMetros.required = false;  // 🚀 desactiva required
            }
        } else {
            if (filaMetros) {
                filaMetros.classList.remove('d-none');
                const inputMetros = filaMetros.querySelector('#metrosCuadrados');
                if (inputMetros) inputMetros.required = true;   // 🚀 vuelve a ser obligatorio
            }
        }

        /// 👉 Nombre comercial opcional en vendedor ambulante
        const nombreComercialInput = document.getElementById('nombreComercial');
        const labelNombreComercial = document.querySelector('label[for="nombreComercial"]');

        if (catLower === 'vendedor ambulante') {
            if (nombreComercialInput) nombreComercialInput.required = false;
            if (labelNombreComercial) labelNombreComercial.textContent = 'Nombre Comercial (opcional)';
        } else {
            if (nombreComercialInput) nombreComercialInput.required = true;
            if (labelNombreComercial) labelNombreComercial.textContent = 'Nombre Comercial *';
        }

        // 🔑 Recargar titulares según categoría (CUIT o DNI)
        cargarTitulares();

        // 🔑 Limpiar siempre los campos de titular al cambiar de categoría
        document.getElementById('cuitBuscar').value = '';
        document.getElementById('titularNombre').value = '';
        document.getElementById('titular').value = '';

        // 🧹 Resetear formulario completo al cambiar de categoría (manteniendo la selección)
        const form = document.getElementById('formAltaComercio');
        if (form) {
            const categoriaActual = categoriaSelect.value; // guarda el valor elegido
            form.reset(); // limpia todo
            categoriaSelect.value = categoriaActual; // restaura la categoría seleccionada
        }

        // 🧾 Limpiar documentación del titular
        const contDocs = document.getElementById('contenedorDocTitular');
        if (contDocs) contDocs.innerHTML = '<p class="text-muted">Seleccione un titular para ver su documentación.</p>';

        // Habilitar rubro principal y cargar opciones
        rubroSelect.disabled = false;
        cargarRubros(rubroSelect, categoria);

        // Habilitar botón para agregar anexos
        btnAddAnexo.disabled = false;

        // Reiniciar contador de anexos
        anexoCount = 1;

        // Limpiar anexos existentes excepto el primero
        const anexosContainer = document.getElementById('anexosContainer');
        const anexos = anexosContainer.querySelectorAll('.anexo-select');
        anexos.forEach(anexo => {
            if (anexo.id !== 'anexo1') {
                anexo.parentElement.parentElement.remove();
            }
        });

        // Reiniciar el primer anexo
        const primerAnexo = document.getElementById('anexo1');
        if (primerAnexo) {
            primerAnexo.innerHTML = '<option value="" selected disabled>Seleccione un rubro adicional</option>';
            primerAnexo.disabled = false;

            // Habilitar botón de eliminar del primer anexo
            const btnEliminar = document.querySelector('#anexo1Group button');
            if (btnEliminar) {
                btnEliminar.disabled = false;
            }

            // Cargar opciones disponibles
            const rubrosDisponibles = obtenerRubrosDisponibles(categoria, 1);
            rubrosDisponibles.forEach(rubro => {
                const option = document.createElement('option');
                option.value = rubro;
                option.textContent = rubro;
                primerAnexo.appendChild(option);
            });
        } else {
            // Si no existe el primer anexo, crearlo
            agregarAnexo(1);
        }

        // Documentos según categoría
        cargarDocumentosEspecificos(categoria);

        // Recalcular montos al cambiar de categoría
        calcularMontos();

        // Ajustar label/placeholder del documento según categoría (CUIT ↔ DNI)
        {
            const labelDoc = document.querySelector('label[for="cuitBuscar"]')
                || document.getElementById('cuitBuscar')?.closest('.col-md-6')?.querySelector('.form-label');
            const inputDoc = document.getElementById('cuitBuscar');
            const categoriaLower = (categoria || '').toLowerCase();

            if (labelDoc && inputDoc) {
                if (categoriaLower === 'vendedor ambulante') {
                    // DNI: sin puntos ni guiones
                    labelDoc.textContent = 'Ingrese DNI *';
                    inputDoc.placeholder = '12345678';
                    inputDoc.value = '';

                    // Forzar solo dígitos cuando la categoría sea ambulante
                    if (!inputDoc._dniSanitizeBound) {
                        const categoriaSelectRef = document.getElementById('categoriaPrincipal');
                        inputDoc.addEventListener('input', () => {
                            const esAmb = (categoriaSelectRef?.value || '').toLowerCase() === 'vendedor ambulante';
                            if (esAmb) inputDoc.value = (inputDoc.value || '').replace(/\D/g, '');
                        });
                        inputDoc._dniSanitizeBound = true; // evita duplicar el listener
                    }
                } else {
                    // CUIT con guiones
                    labelDoc.textContent = 'Ingrese un CUIT *';
                    inputDoc.placeholder = '20-12345678-3';
                    inputDoc.value = '';
                }
            }
        }
    });

    // Evento para cambiar rubro principal
    rubroSelect.addEventListener('change', function () {
        actualizarDisponibilidadRubros();
    });

    // Evento para agregar anexo
    btnAddAnexo.addEventListener('click', function () {
        if (anexoCount < 5) {
            anexoCount++;
            agregarAnexo(anexoCount);
        } else {
            alert("Solo se permiten hasta 5 rubros adicionales");
        }
    });

    // 👉 Calcular montos en vivo mientras se escribe
    metrosCuadrados.addEventListener('input', calcularMontos);

    // Evento para confirmar desde el modal (con verificación de sucursal)
    btnConfirmarModal.addEventListener('click', async function () {
        const form = document.getElementById('formAltaComercio');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const ok = await verificarSucursalAntesDeEnviar();
        if (!ok) return;

        enviarFormulario();
    });

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

    // ==== LUPA ÚNICA: busca por CUIT/DNI o por NOMBRE según categoría ====
    {
        const categoriaSelect = document.getElementById('categoriaPrincipal');
        const btnBuscarCuit = document.getElementById('btnBuscarCuit'); // única lupa
        const inputDoc = document.getElementById('cuitBuscar'); // CUIT o DNI
        const inputNombre = document.getElementById('titularNombre');
        const hiddenId = document.getElementById('titular');

        function norm(s) {
            return (s || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
        }

        if (btnBuscarCuit && inputDoc && inputNombre && hiddenId) {
            btnBuscarCuit.addEventListener('click', () => {
                const cat = (categoriaSelect?.value || '').toLowerCase();
                if (!Array.isArray(titulares) || !titulares.length) {
                    window.alert("No hay titulares cargados.");
                    return;
                }

                const valorDoc = (inputDoc.value || '').trim();
                const valorNom = (inputNombre.value || '').trim();

                let resultado = null;

                // 1️⃣ Si hay algo en el campo de documento (CUIT/DNI)
                if (valorDoc) {
                    const q = valorDoc.replace(/\D/g, '');

                    if (cat === 'vendedor ambulante') {
                        resultado = titulares.find(t => String(t?.dni || '') === q);
                    } else {
                        resultado = titulares.find(
                            t => String(t?.cuit || '').replace(/\D/g, '') === q
                        );
                    }
                }

                // 2️⃣ Si no hubo resultado y hay algo en el campo de nombre
                if (!resultado && valorNom) {
                    const qn = norm(valorNom);
                    const coincidencias = titulares.filter(t => norm(t?.nombre).startsWith(qn));

                    if (coincidencias.length === 1) {
                        resultado = coincidencias[0];
                    } else if (coincidencias.length > 1) {
                        window.alert(`Se encontraron ${coincidencias.length} coincidencias. Refiná la búsqueda.`);
                        return;
                    }
                }

                // 3️⃣ Si no hubo ningún match
                if (!resultado) {
                    window.alert("No se encontró ningún titular con los datos ingresados.");
                    return;
                }

                // 4️⃣ Completar campos (ID robusto)
                const resolvedId = (resultado?.id_razon_social ?? resultado?.id ?? resultado?.id_ambulante ?? null);
                if (!resolvedId) {
                    window.alert('El titular seleccionado no tiene un ID válido. Probá con otra búsqueda o verificá los datos.');
                    return;
                }

                hiddenId.value = String(resolvedId);
                inputNombre.value = resultado.nombre || '';

                if (cat === 'vendedor ambulante') {
                    inputDoc.value = resultado.dni || '';
                } else {
                    const c = String(resultado.cuit || '').replace(/\D/g, '');
                    inputDoc.value = (c.length === 11)
                        ? `${c.slice(0, 2)}-${c.slice(2, 10)}-${c.slice(10)}`
                        : (resultado.cuit || '');
                }

                inputDoc.classList.add('is-valid');
                inputNombre.classList.add('is-valid');

                // 👉 Cargar documentación del titular al seleccionarlo
                cargarDocumentacionTitular(resolvedId, cat);

            });

            // Enter en cualquiera de los dos campos → acciona la lupa
            [inputDoc, inputNombre].forEach(el => {
                el.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        btnBuscarCuit.click();
                    }
                });
            });
        }
    }

    // ==== SUGERENCIAS EN VIVO POR CUIT (categorías NO ambulantes) ====
    (function initSugerenciasCuit() {
        const categoriaSelect = document.getElementById('categoriaPrincipal');
        const input = document.getElementById('cuitBuscar');
        if (!input) return;

        const grupo = input.closest('.input-group');
        grupo.classList.add('position-relative');

        const lista = document.createElement('div');
        lista.id = 'sugerenciasCuit';
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
        input.addEventListener('keydown', (e) => { if (e.key === 'Escape') ocultar(); });

        input.addEventListener('input', () => {
            // 👉 Normalizar a dígitos (máximo 11)
            let digits = input.value.replace(/\D/g, '').slice(0, 11);

            // 👉 Insertar guiones progresivamente
            if (digits.length > 2 && digits.length <= 10) {
                input.value = `${digits.slice(0, 2)}-${digits.slice(2)}`;
            } else if (digits.length > 10) {
                input.value = `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
            } else {
                input.value = digits;
            }

            // 👉 Mantener lógica de sugerencias
            const cat = (categoriaSelect?.value || '').toLowerCase();
            if (cat === 'vendedor ambulante') { ocultar(); return; }

            const q = digits;
            if (q.length < 2 || !Array.isArray(titulares)) { ocultar(); return; }

            const matches = titulares
                .filter(t => String(t?.cuit || '').replace(/\D/g, '').startsWith(q))
                .slice(0, 5);

            if (!matches.length) { ocultar(); return; }

            lista.innerHTML = '';
            matches.forEach(t => {
                const c = String(t.cuit || '').replace(/\D/g, '');
                const label = (c.length === 11)
                    ? `${c.slice(0, 2)}-${c.slice(2, 10)}-${c.slice(10)}`
                    : t.cuit;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'list-group-item list-group-item-action';
                btn.textContent = `${t.nombre} — ${label}`;
                btn.addEventListener('click', () => {
                    input.value = label;
                    ocultar();
                    const hidden = document.getElementById('titular');
                    if (hidden) hidden.value = t.id;
                    const nombreInput = document.getElementById('titularNombre');
                    if (nombreInput) nombreInput.value = t.nombre;

                    // 👉 cargar docs automáticamente
                    const cat = (categoriaSelect?.value || '').toLowerCase();
                    cargarDocumentacionTitular(t.id, cat);
                });

                lista.appendChild(btn);
            });

            mostrar();
        });

    })();

    // ==== SUGERENCIAS EN VIVO POR DNI (categoría AMBULANTE) ====
    (function initSugerenciasDni() {
        const categoriaSelect = document.getElementById('categoriaPrincipal');
        const input = document.getElementById('cuitBuscar'); // acá entra DNI
        if (!input) return;

        const grupo = input.closest('.input-group');
        grupo.classList.add('position-relative');

        const lista = document.createElement('div');
        lista.id = 'sugerenciasDni';
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
        input.addEventListener('keydown', (e) => { if (e.key === 'Escape') ocultar(); });

        input.addEventListener('input', () => {
            const cat = (categoriaSelect?.value || '').toLowerCase();
            if (cat !== 'vendedor ambulante') { ocultar(); return; }

            // 👉 Solo números y máximo 8 dígitos
            let digits = input.value.replace(/\D/g, '').slice(0, 8);
            input.value = digits;

            const q = digits;
            if (q.length < 2 || !Array.isArray(titulares)) { ocultar(); return; }

            const matches = titulares
                .filter(t => String(t?.dni || '').startsWith(q))
                .slice(0, 5);

            if (!matches.length) { ocultar(); return; }

            lista.innerHTML = '';
            matches.forEach(t => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'list-group-item list-group-item-action';
                btn.textContent = `${t.nombre} — DNI: ${t.dni}`;
                btn.addEventListener('click', () => {
                    input.value = t.dni;
                    ocultar();
                    const hidden = document.getElementById('titular');
                    if (hidden) hidden.value = t.id_ambulante || t.id || t.id_razon_social || '';
                    const nombreInput = document.getElementById('titularNombre');
                    if (nombreInput) nombreInput.value = t.nombre;

                    // 👉 cargar docs automáticamente
                    const cat = (categoriaSelect?.value || '').toLowerCase();
                    cargarDocumentacionTitular(hidden.value, cat);
                });

                lista.appendChild(btn);
            });

            mostrar();
        });
    })();

    // ==== SUGERENCIAS EN VIVO POR NOMBRE (todas las categorías) ====
    (function initSugerenciasNombre() {
        const input = document.getElementById('titularNombre');
        if (!input) return;

        const grupo = input.closest('.input-group') || input.parentElement;
        grupo.classList.add('position-relative');

        const lista = document.createElement('div');
        lista.id = 'sugerenciasNombre';
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

        function norm(s) {
            return (s || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
        }
        function ocultar() { lista.style.display = 'none'; }
        function mostrar() { lista.style.display = 'block'; }

        document.addEventListener('click', (e) => { if (!grupo.contains(e.target)) ocultar(); });
        input.addEventListener('keydown', (e) => { if (e.key === 'Escape') ocultar(); });

        input.addEventListener('input', () => {
            const q = norm(input.value);
            if (q.length < 2 || !Array.isArray(titulares)) { ocultar(); return; }

            const matches = titulares
                .filter(t => norm(t?.nombre).startsWith(q))
                .slice(0, 5);

            if (!matches.length) { ocultar(); return; }

            lista.innerHTML = '';
            matches.forEach(t => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'list-group-item list-group-item-action';
                btn.textContent = t.nombre;
                btn.addEventListener('click', () => {
                    input.value = t.nombre;
                    ocultar();
                    const hidden = document.getElementById('titular');
                    if (hidden) hidden.value = t.id_ambulante || t.id || t.id_razon_social || '';
                    const inputDoc = document.getElementById('cuitBuscar');
                    if (inputDoc) inputDoc.value = t.dni || t.cuit || '';

                    // 👉 cargar docs automáticamente
                    const cat = (document.getElementById('categoriaPrincipal')?.value || '').toLowerCase();
                    if (hidden && hidden.value) {
                        cargarDocumentacionTitular(hidden.value, cat);
                    }
                });

                lista.appendChild(btn);
            });

            mostrar();
        });
    })();

    // Validación del formulario al enviar
    document.getElementById('formAltaComercio').addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // 👉 Validación específica para DNI en ambulantes
        const categoria = (document.getElementById('categoriaPrincipal')?.value || '').toLowerCase();
        const inputDoc = document.getElementById('cuitBuscar');

        if (categoria === 'vendedor ambulante') {
            const dni = inputDoc.value.replace(/\D/g, '');
            if (dni.length !== 8) {
                inputDoc.setCustomValidity('DNI inválido: debe tener 8 dígitos');
            } else {
                inputDoc.setCustomValidity('');
            }
        } else {
            // resetear si no es ambulante
            inputDoc.setCustomValidity('');
        }

        if (this.checkValidity() && document.getElementById('titular').value) {
            previsualizarFormulario();
        }

        this.classList.add('was-validated');
    });

    // 👉 Validación combinada de teléfono (código de área + número)
    const form = document.getElementById('formAltaComercio');
    if (form) {
        form.addEventListener('submit', function (e) {
            const codArea = document.getElementById('cod_area_comercio');
            const numero = document.getElementById('telefono_comercio');

            // Reset estado
            codArea.setCustomValidity('');
            numero.setCustomValidity('');

            // Validación combinada: ambos son obligatorios juntos
            if (!codArea.value.trim() || !numero.value.trim()) {
                codArea.setCustomValidity('incompleto');
                numero.setCustomValidity('incompleto');
            }

            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }

            form.classList.add('was-validated');
        });
    }
    // 👉 Validación dinámica de teléfono (alta comercio)
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
    }

});

function actualizarMiniMapa(url) {
    const miniMapa = document.getElementById('miniMapa');

    // Extraer coordenadas o lugar ID del enlace
    let embedUrl = '';

    if (url.includes('@')) {
        // Formato con coordenadas
        const coords = url.match(/@([-]?\d+\.\d+),([-]?\d+\.\d+)/);
        if (coords) {
            embedUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d10000!2d${coords[2]}!3d${coords[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sar!4v1620000000000!5m2!1ses!2sar`;
        }
    } else if (url.includes('maps.app.goo.gl')) {
        // Formato de enlace corto
        embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${url}`;
    }

    if (embedUrl) {
        miniMapa.innerHTML = `
            <iframe src="${embedUrl}" allowfullscreen="" loading="lazy"></iframe>
            <small class="text-muted map-link">Ubicación: <a href="${url}" target="_blank">${url}</a></small>
        `;
        miniMapa.classList.remove('d-none');
    }
}

// Función para cargar rubros según categoría
function cargarRubros(selectElement, categoria) {
    // Limpiar opciones existentes
    selectElement.innerHTML = '<option value="" selected disabled>Seleccione un rubro</option>';

    // Obtener rubros para la categoría seleccionada
    const rubros = rubrosPorCategoria[categoria] || [];

    // Agregar opciones al select
    rubros.forEach(rubro => {
        const option = document.createElement('option');
        option.value = rubro;
        option.textContent = rubro;
        selectElement.appendChild(option);
    });
}

// Función para agregar un nuevo anexo (REEMPLAZO COMPLETO)
function agregarAnexo(numero) {
    const container = document.getElementById('anexosContainer');
    const categoria = document.getElementById('categoriaPrincipal').value; // <- id correcto
    const rubroPrincipal = document.getElementById('rubro').value;

    // Crear nuevo grupo de anexo
    const anexoGroup = document.createElement('div');
    anexoGroup.className = 'row g-2 mb-2';
    anexoGroup.id = `anexo${numero}Group`;

    // Columna del <select>
    const selectCol = document.createElement('div');
    selectCol.className = 'col-md-10';

    const select = document.createElement('select');
    select.className = 'form-select anexo-select';
    select.id = `anexo${numero}`;

    // Opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccione un rubro adicional';
    defaultOption.selected = true;
    defaultOption.disabled = true;
    select.appendChild(defaultOption);

    // Opciones según categoría (excluye ya seleccionados)
    const rubrosDisponibles = obtenerRubrosDisponibles(categoria, numero);
    rubrosDisponibles.forEach(rubro => {
        const option = document.createElement('option');
        option.value = rubro;
        option.textContent = rubro;
        select.appendChild(option);
    });

    // Actualizar disponibilidad al cambiar
    select.addEventListener('change', function () {
        actualizarDisponibilidadRubros();
    });

    selectCol.appendChild(select);

    // Columna del botón eliminar
    const buttonCol = document.createElement('div');
    buttonCol.className = 'col-md-2';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-primary w-100';
    button.innerHTML = '<i class="fas fa-times"></i> Eliminar';
    button.onclick = function () {
        removeAnexo(numero);
        actualizarDisponibilidadRubros();
    };
    buttonCol.appendChild(button);

    // Agregar al grupo
    anexoGroup.appendChild(selectCol);
    anexoGroup.appendChild(buttonCol);

    // Insertar ANTES del botón "Agregar otro rubro"
    const addBtn = document.getElementById('btnAddAnexo');
    container.insertBefore(anexoGroup, addBtn);

    // Habilitar controles
    select.disabled = false;
    button.disabled = false;
}


// Función para actualizar disponibilidad de rubros en todos los selects
function actualizarDisponibilidadRubros() {
    const categoria = document.getElementById('categoriaPrincipal').value;
    const rubroPrincipal = document.getElementById('rubro').value;
    const rubrosSeleccionados = new Set([rubroPrincipal]);

    // Obtener todos los rubros ya seleccionados en anexos
    document.querySelectorAll('.anexo-select').forEach(select => {
        if (select.value) rubrosSeleccionados.add(select.value);
    });

    // Actualizar cada select de anexo
    document.querySelectorAll('.anexo-select').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="" selected disabled>Seleccione un rubro adicional</option>';

        // Agregar solo rubros no seleccionados en otros anexos
        (rubrosPorCategoria[categoria] || []).forEach(rubro => {
            if (!rubrosSeleccionados.has(rubro) || rubro === currentValue) {
                const option = document.createElement('option');
                option.value = rubro;
                option.textContent = rubro;
                if (rubro === currentValue) option.selected = true;
                select.appendChild(option);
            }
        });
    });
}

// Función para obtener rubros disponibles para un anexo
function obtenerRubrosDisponibles(categoria, hastaAnexo) {
    const rubrosPrincipales = rubrosPorCategoria[categoria] || [];
    const rubrosSeleccionados = new Set();

    // Obtener rubro principal
    const rubroPrincipal = document.getElementById('rubro').value;
    if (rubroPrincipal) rubrosSeleccionados.add(rubroPrincipal);

    // Obtener rubros de anexos anteriores
    for (let i = 1; i < hastaAnexo; i++) {
        const anexoSelect = document.getElementById(`anexo${i}`);
        if (anexoSelect && anexoSelect.value) {
            rubrosSeleccionados.add(anexoSelect.value);
        }
    }

    // Filtrar rubros disponibles
    return rubrosPrincipales.filter(rubro => !rubrosSeleccionados.has(rubro));
}

// Función para eliminar un anexo (REEMPLAZO COMPLETO)
function removeAnexo(numero) {
    const anexoGroup = document.getElementById(`anexo${numero}Group`);
    if (anexoGroup) {
        anexoGroup.remove();
    }

    // Recontar selects restantes
    const selects = Array.from(document.querySelectorAll('.anexo-select'));
    anexoCount = selects.length;

    // Renumerar y corregir handlers de todos los botones
    selects.forEach((select, i) => {
        const newNumber = i + 1;
        const group = select.parentElement.parentElement;

        // IDs coherentes
        select.id = `anexo${newNumber}`;
        group.id = `anexo${newNumber}Group`;

        // Botón eliminar con índice CAPTURADO
        const btn = group.querySelector('button');
        const idx = newNumber; // <- captura el valor correcto para este botón
        btn.onclick = function () {
            removeAnexo(idx);
            actualizarDisponibilidadRubros();
        };
    });

    // Actualizar opciones disponibles
    actualizarDisponibilidadRubros();
}

// Función para cargar titulares desde la base de datos
async function cargarTitulares() {
    try {
        const categoria = (document.getElementById('categoriaPrincipal')?.value || '').toLowerCase();

        // Endpoint según categoría
        const url = (categoria === 'vendedor ambulante')
            ? '/api/alta-comercio/titulares-ambulantes'
            : '/api/alta-comercio/titulares';

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar titulares');

        titulares = await response.json();
    } catch (error) {
        console.error("Error:", error);
        titulares = [];
    }
}

function normalizarCuit(valor) {
    return (valor || '').replace(/[^0-9]/g, '');
}

function buscarTitularPorCuit() {
    const input = document.getElementById('cuitBuscar');
    const hiddenId = document.getElementById('titular');
    const nombreOut = document.getElementById('titularNombre');
    const cuit = normalizarCuit(input.value);
    if (!cuit || cuit.length < 8) {
        input.classList.add('is-invalid');
        hiddenId.value = '';
        nombreOut.value = '';
        return;
    }
    input.classList.remove('is-invalid');
    const encontrado = titulares.find(t => normalizarCuit(t.cuit) === cuit);
    if (!encontrado) {
        input.classList.add('is-invalid');
        hiddenId.value = '';
        nombreOut.value = '';
        return;
    }
    hiddenId.value = encontrado.id;
    nombreOut.value = encontrado.nombre;
}

function cargarDocumentosEspecificos(categoria) {
    const container = document.getElementById('documentosEspecificos');
    container.innerHTML = '<h6 class="mb-3">Documentos Específicos</h6><div class="row g-3"></div>';
    const row = container.querySelector('.row');

    // Obtener documentos específicos para la categoría
    const documentos = documentosRequeridos[categoria] || [];

    // Agregar documentos al contenedor
    documentos.forEach(doc => {
        const col = document.createElement('div');
        col.className = 'col-md-6';

        col.innerHTML = `
            <div class="documento-item">
                <label for="${doc.id}" class="form-label">${doc.nombre} ${doc.requerido ? '*' : ''}</label>
                <input type="file" class="form-control" id="${doc.id}" ${doc.requerido ? 'required' : ''}>
                <div class="file-info d-none">
                    <span class="file-name"></span>
                    <span class="file-status documento-cargado">✓ Cargado</span>
                </div>
                <div class="invalid-feedback">
                    Por favor cargue este documento.
                </div>
            </div>
        `;

        // Evento para manejar la carga de archivos
        const input = col.querySelector('input');
        input.addEventListener('change', function () {
            manejarCargaDocumento(this);
        });

        row.appendChild(col);
    });

    // 📌 Ajuste: documentos comunes
    if (categoria !== "vendedor ambulante") {
        // Para comercio/bares/food truck → comunes completos
        cargarDocumentosComunes();
    } else {
        // Para ambulantes → solo el pago/sellado
        const container = document.getElementById('documentosComunes');
        container.innerHTML = '<h6 class="mb-3">Documentos Comunes a Vendedor Ambulante</h6><div class="row g-3"></div>';
        const row = container.querySelector('.row');

        // Buscar solo el doc_pago_inspeccion
        const doc = documentosRequeridos.comunes.find(d => d.id === "doc_pago_inspeccion");
        if (doc) {
            const col = document.createElement('div');
            col.className = 'col-md-6';

            col.innerHTML = `
                <div class="documento-item">
                    <label for="${doc.id}" class="form-label">${doc.nombre} ${doc.requerido ? '*' : ''}</label>
                    <input type="file" class="form-control" id="${doc.id}" ${doc.requerido ? 'required' : ''}>
                    <div class="file-info d-none">
                        <span class="file-name"></span>
                        <span class="file-status documento-cargado">✓ Cargado</span>
                    </div>
                    <div class="invalid-feedback">
                        Por favor cargue este documento.
                    </div>
                </div>
            `;

            // Evento para manejar carga
            const input = col.querySelector('input');
            input.addEventListener('change', function () {
                manejarCargaDocumento(this);
            });

            row.appendChild(col);
        }
    }
}

// Función para cargar documentos comunes
function cargarDocumentosComunes() {
    const container = document.getElementById('documentosComunes');
    container.innerHTML = '<h6 class="mb-3">Documentos Comunes a Todas las Categorías</h6><div class="row g-3"></div>';
    const row = container.querySelector('.row');

    documentosRequeridos.comunes.forEach(doc => {
        const col = document.createElement('div');
        col.className = 'col-md-6';

        col.innerHTML = `
            <div class="documento-item">
                <label for="${doc.id}" class="form-label">${doc.nombre} ${doc.requerido ? '*' : ''}</label>
                <input type="file" class="form-control" id="${doc.id}" ${doc.requerido ? 'required' : ''}>
                <div class="file-info d-none">
                    <span class="file-name"></span>
                    <span class="file-status documento-cargado">✓ Cargado</span>
                </div>
                <div class="invalid-feedback">
                    Por favor cargue este documento.
                </div>
            </div>
        `;

        // Evento para manejar la carga de archivos
        const input = col.querySelector('input');
        input.addEventListener('change', function () {
            manejarCargaDocumento(this);
        });

        row.appendChild(col);
    });
}

// Función para manejar la carga de un documento (miniatura + MODAL con preview + eliminar)
function manejarCargaDocumento(input) {
    const file = input.files && input.files[0];
    const fileInfo = input.nextElementSibling;                 // <div class="file-info">
    const fileName = fileInfo?.querySelector('.file-name');

    // ===== helpers locales para el modal =====
    function ensurePreviewModal() {
        if (document.getElementById('imgPreviewModal')) return;

        // estilos mínimos (incluye fix para que "Cerrar" no desborde)
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
            width: 32px; height: 32px; border: none; border-radius: 50%;
            background: #dc3545; color: #fff; font-size: 20px; line-height: 32px; cursor: pointer;
        }
        .img-preview-actions {
            display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;
        }
        .img-preview-actions .btn-preview-close {
            display: inline-block;               /* ✅ evita desborde */
            white-space: nowrap;                 /* ✅ evita corte de línea */
            line-height: 1.2;                    /* ✅ altura de línea normal */
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

        // cerrar al click en "Cerrar" o fuera de la caja
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

        // Eliminar desde el MODAL (X roja)
        const btnX = overlay.querySelector('.img-preview-close-delete');
        btnX.onclick = (e) => {
            e.stopPropagation();
            const { inputRef, wrapperRef, urlRef, fileInfoRef } = ctx || {};

            if (inputRef) {
                inputRef.value = '';                             // ✅ resetea el campo para volver a cargar
                inputRef.classList.remove('is-valid', 'is-invalid');
                // Notifica cambio en vacío (mantiene UI consistente)
                try { inputRef.dispatchEvent(new Event('change', { bubbles: true })); } catch { }
                inputRef.focus();
            }
            if (wrapperRef) wrapperRef.remove();
            if (fileInfoRef) fileInfoRef.classList.add('d-none');
            if (urlRef) URL.revokeObjectURL(urlRef);

            overlay.style.display = 'none';
        };
    }
    // ===== fin helpers del modal =====

    // Limpieza de wrapper previo si existe
    let wrapper = fileInfo?.querySelector('.file-thumb-wrapper');

    if (file) {
        // Mostrar nombre y marcar como cargado
        if (fileName) fileName.textContent = file.name;
        if (fileInfo) fileInfo.classList.remove('d-none');
        documentosCargados[input.id] = file;
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');

        // Crear/limpiar contenedor de miniatura
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'file-thumb-wrapper';
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.style.marginTop = '6px';
            fileInfo.appendChild(wrapper);
        } else {
            const oldImg = wrapper.querySelector('img');
            if (oldImg && oldImg._objectUrl) URL.revokeObjectURL(oldImg._objectUrl);
            wrapper.innerHTML = '';
        }

        // Si es imagen: miniatura + click → MODAL + botón X en miniatura
        if (/^image\//.test(file.type)) {
            const img = document.createElement('img');
            img.className = 'file-thumb';
            img.alt = 'Vista previa';
            img.style.maxWidth = '120px';
            img.style.maxHeight = '120px';
            img.style.borderRadius = '6px';
            img.style.cursor = 'zoom-in';

            const url = URL.createObjectURL(file);
            img._objectUrl = url;
            img.src = url;

            // Click en miniatura → abrir MODAL
            img.addEventListener('click', () => {
                openPreviewModal(url, { inputRef: input, wrapperRef: wrapper, urlRef: url, fileInfoRef: fileInfo });
            });
            wrapper.appendChild(img);

            // Botón "X" en la MINIATURA
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = '×';
            btn.setAttribute('aria-label', 'Quitar archivo');
            btn.style.position = 'absolute';
            btn.style.top = '-6px';
            btn.style.right = '-6px';
            btn.style.width = '22px';
            btn.style.height = '22px';
            btn.style.border = 'none';
            btn.style.borderRadius = '50%';
            btn.style.cursor = 'pointer';
            btn.style.lineHeight = '22px';
            btn.style.fontSize = '16px';
            btn.style.background = '#dc3545';
            btn.style.color = '#fff';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // ✅ resetea el campo para volver a cargar otra
                input.value = '';
                input.classList.remove('is-valid', 'is-invalid');
                try { input.dispatchEvent(new Event('change', { bubbles: true })); } catch { }
                input.focus();

                if (img._objectUrl) URL.revokeObjectURL(img._objectUrl);
                wrapper.remove();
                if (fileInfo) fileInfo.classList.add('d-none');
            });
            wrapper.appendChild(btn);
        } else {
            // No imagen: solo nombre; quitar wrapper si quedó
            if (wrapper) wrapper.remove();
        }
    } else {
        // Reset si se quitó el archivo desde el input
        delete documentosCargados[input.id];
        input.classList.remove('is-valid');
        if (fileInfo) fileInfo.classList.add('d-none');

        const oldWrapper = fileInfo?.querySelector('.file-thumb-wrapper');
        if (oldWrapper) {
            const oldImg = oldWrapper.querySelector('img');
            if (oldImg && oldImg._objectUrl) URL.revokeObjectURL(oldImg._objectUrl);
            oldWrapper.remove();
        }
    }
}

// Función para calcular montos según metros cuadrados (REEMPLAZO COMPLETO)
function calcularMontos() {
    const categoria = document.getElementById('categoriaPrincipal').value;
    const m2 = parseFloat(document.getElementById('metrosCuadrados').value) || 0;

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
        return;
    }

    // Si es COMERCIO EN GENERAL / BARES:
    // No mostrar nada hasta que ingresen m² (>0)
    if (!m2 || m2 <= 0) {
        // Dejar vacíos; inspección deshabilitada
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

// Función para previsualizar el formulario
function previsualizarFormulario() {
    const form = document.getElementById('formAltaComercio');
    const previewContent = document.getElementById('previewContent');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        const primerInvalido = form.querySelector(':invalid');
        if (primerInvalido) {
            // 🔽 Desplazamiento forzado más compatible
            const y = primerInvalido.getBoundingClientRect().top + window.scrollY - 150;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setTimeout(() => primerInvalido.focus(), 400);
        }
        return;
    }

    // Valores del formulario
    const categoria = document.getElementById('categoriaPrincipal').value;
    const rubro = document.getElementById('rubro').value;
    const titularText = document.getElementById('titularNombre').value;
    const nombreComercial = document.getElementById('nombreComercial').value;
    const direccion = document.getElementById('direccion').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const telefono = `${document.getElementById('cod_area_comercio').value || ''}-${document.getElementById('telefono_comercio').value || ''}`;
    const correoElectronico = document.getElementById('correoElectronico').value;
    const metrosCuadrados = document.getElementById('metrosCuadrados').value;
    const estadoPago = document.getElementById('estadoPago').value;
    const cuitTitular = document.getElementById('cuitBuscar').value;

    // Rubros adicionales
    const rubrosAdicionales = [];
    for (let i = 1; i <= anexoCount; i++) {
        const anexoSelect = document.getElementById(`anexo${i}`);
        if (anexoSelect && anexoSelect.value) rubrosAdicionales.push(anexoSelect.value);
    }

    // Montos
    let montoSellado = document.getElementById('montoSellado').value;
    let montoInspeccion = document.getElementById('montoInspeccion').value;
    let montoTotal = document.getElementById('montoTotal').value;

    // Ajustes según categoría
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
        if (!metrosCuadrados || Number(metrosCuadrados) <= 0) {
            metrosResumen = "No aplica";
        }
        if (!montoInspeccion) {
            montoInspeccion = "No aplica";
        }
    }

    // Documentos cargados
    const documentos = Object.keys(documentosCargados).map(id => {
        const input = document.getElementById(id);
        return input.labels[0].textContent.trim();
    });

    // Construcción del resumen
    let html = `
    <div class="preview-item"><span class="preview-label">Categoría:</span> <span class="preview-value">${categoria}</span></div>
    <div class="preview-item"><span class="preview-label">Titular:</span> <span class="preview-value">${titularText} (${docLabel}: ${cuitTitular})</span></div>
    <div class="preview-item"><span class="preview-label">Rubro Principal:</span> <span class="preview-value">${rubro}</span></div>
`;

    if (rubrosAdicionales.length > 0) {
        html += `
    <div class="preview-item"><span class="preview-label">Rubros Adicionales:</span> <span class="preview-value">${rubrosAdicionales.join(', ')}</span></div>`;
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
    <div class="preview-item"><span class="preview-label">Estado del Pago:</span> <span class="preview-value">${estadoPago}</span></div>
    <div class="preview-item"><span class="preview-label">Documentos Cargados:</span> <span class="preview-value">${documentos.length > 0 ? documentos.join('<br>') : 'Ningún documento cargado'}</span></div>
`;

    previewContent.innerHTML = html;
    new bootstrap.Modal(document.getElementById('previewModal')).show();
}

// Función para enviar el formulario
async function enviarFormulario() {
    try {
        const formData = new FormData();
        const categoria = document.getElementById('categoriaPrincipal').value;

        // ✅ Validar y capturar el ID del titular antes de enviar
        const titularId = (document.getElementById('titular').value || '').trim();
        if (!/^\d+$/.test(titularId)) {
            alert('Debes seleccionar un titular desde la lista de sugerencias o con la lupa.');
            return;
        }

        // Agregar datos básicos
        formData.append('categoria', categoria);
        formData.append('rubro', document.getElementById('rubro').value);
        formData.append('titular', titularId);
        formData.append('nombreComercial', document.getElementById('nombreComercial').value);
        formData.append('direccion', document.getElementById('direccion').value);
        formData.append('ubicacion', document.getElementById('ubicacion').value);

        // 👉 Unificar teléfono comercio
        const codAreaComercio = document.getElementById('cod_area_comercio').value.trim();
        const numeroComercio = document.getElementById('telefono_comercio').value.trim();
        const telefonoFinal = codAreaComercio && numeroComercio ? `${codAreaComercio}-${numeroComercio}` : '';
        formData.append('telefono', telefonoFinal);

        formData.append('correoElectronico', document.getElementById('correoElectronico').value);
        formData.append('metrosCuadrados', document.getElementById('metrosCuadrados').value);
        formData.append('estadoPago', document.getElementById('estadoPago').value);
        formData.append('monto_sellado_inspeccion', document.getElementById('montoTotal').value.replace(/[^\d]/g, ''));

        // Ajuste para categorías con monto fijo (ambulante y food truck)
        if (categoria && ['vendedor ambulante', 'food truck'].includes(categoria.toLowerCase())) {
            const fijo = (document.getElementById('montoAmbulante').value || '').replace(/[^\d]/g, '');
            formData.set('monto_sellado_inspeccion', fijo || '0');
        }

        // NUEVO: sucursal sugerida (si aplica)
        if (window.sucursalSugerida) formData.append('sucursal', String(window.sucursalSugerida));

        // Agregar rubros adicionales
        const anexos = [];
        for (let i = 1; i <= anexoCount; i++) {
            const anexoSelect = document.getElementById(`anexo${i}`);
            if (anexoSelect && anexoSelect.value) {
                anexos.push(anexoSelect.value);
            }
        }
        anexos.forEach(a => formData.append('anexos[]', a));

        // Agregar documentos
        for (const id in documentosCargados) {
            formData.append(id, documentosCargados[id]);
        }

        const response = await fetch('/api/alta-comercio/registrar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        // ⚠️ Si falla, mostrar el error detallado y cerrar el modal
        if (!response.ok) {
            let mensaje = `Error al registrar comercio (HTTP ${response.status})`;
            try {
                const errorData = await response.json();
                mensaje = errorData.error || errorData.details || mensaje;
            } catch {
                const raw = await response.text();
                if (raw) mensaje = raw;
            }

            // 🔻 Cerrar el modal para que no tape el mensaje
            const previewModalEl = document.getElementById('previewModal');
            if (previewModalEl) {
                const modalInstance = bootstrap.Modal.getInstance(previewModalEl);
                if (modalInstance) modalInstance.hide();
            }

            alert(mensaje);
            mostrarToast(mensaje, 'error');
            return; // 🚫 corta acá
        }

        const result = await response.json();

        // ✅ Mostrar notificación inicial
        window.alert("El comercio ha sido dado de alta exitosamente.");

        // 🔑 Ocultar el modal de previsualización inmediatamente
        const previewModalEl = document.getElementById('previewModal');
        if (previewModalEl) {
            const modalInstance = bootstrap.Modal.getInstance(previewModalEl);
            if (modalInstance) modalInstance.hide();
        }

        // 🔎 Evaluar habilitación según condiciones
        const estadoPago = document.getElementById('estadoPago').value;
        const m2 = parseFloat(document.getElementById('metrosCuadrados').value) || 0;

        // if (estadoPago === "Abonado" && m2 <= 20) {
        //     window.alert("✅ Comercio habilitado: pago realizado, sin necesidad de inspección.");
        // } else if (estadoPago !== "Abonado" && m2 > 20) {
        //     window.alert("⚠️ Falta realizar el pago del sellado y la inspección ocular para quedar habilitado.");
        // } else if (estadoPago !== "Abonado") {
        //     window.alert("⚠️ Falta realizar el pago para quedar habilitado.");
        // } else if (m2 > 20) {
        //     window.alert("⚠️ Pendiente de inspección ocular para quedar habilitado.");
        // }
        const categoriasConInspeccion = [
    'comercio en general', 
    'bares nocturnos, confiterias y restaurantes'
];
const categoriaLower = (categoria || '').toLowerCase();

if (categoriasConInspeccion.includes(categoriaLower)) {
    // Para comercios que requieren inspección
    window.alert("✅ Comercio registrado exitosamente. Queda como PENDIENTE DE INSPECCIÓN OCULAR. Un inspector visitará el establecimiento para realizar la verificación correspondiente.");
} else {
    // Para vendedores ambulantes y food trucks - se habilitan inmediatamente
    window.alert("✅ Comercio habilitado exitosamente.");
    
    // Mensajes adicionales según estado de pago para categorías sin inspección
    if (estadoPago !== "Abonado") {
        window.alert("⚠️ Recuerde que debe realizar el pago para mantener la habilitación.");
    }
}

        // 🟣 Generar y mostrar QR en modal (después de las notificaciones)
        try {
            const respQR = await fetch(`/api/alta-comercio/qr/${result.idComercio}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const dataQR = await respQR.json();

            if (dataQR?.ok && dataQR.qr_path) {
                // Insertar estilos + modal una sola vez
                if (!document.getElementById('qrOverlay')) {
                    const style = document.createElement('style');
                    style.textContent = `
    .qr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:2100}
    .qr-box{background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.25);padding:22px;width:min(92vw, 600px)}
    .qr-title{margin:0 0 6px;font-weight:700;font-size:1.2rem}
    .qr-sub{margin:0 0 12px;color:#555}
    .qr-actions{display:flex;justify-content:flex-end;margin-top:12px}
    .qr-close{border:none;border-radius:6px;padding:6px 12px;cursor:pointer;background:#6c757d;color:#fff}
  `;
                    document.head.appendChild(style);

                    const overlay = document.createElement('div');
                    overlay.id = 'qrOverlay';
                    overlay.className = 'qr-overlay';
                    overlay.innerHTML = `
    <div class="qr-box" role="dialog" aria-modal="true">
      <p class="qr-title">Código QR generado</p>
      <p class="qr-sub">Enviado por mail al titular del comercio.</p>
      <img id="qrImage" alt="Código QR" style="display:block;max-width:320px;max-height:320px;margin:auto"/>
      <div class="qr-actions">
        <button type="button" id="qrClose" class="qr-close">Cerrar</button>
      </div>
    </div>
  `;
                    // (Sin cierre por clic fuera)
                    document.body.appendChild(overlay);

                    // Cerrar → recién ahí redirigir
                    document.getElementById('qrClose').onclick = () => {
                        document.getElementById('qrOverlay').style.display = 'none';
                        window.location.href = 'lista-comercios.html';
                    };
                }

                // Setear imagen y mostrar
                const img = document.getElementById('qrImage');
                img.src = dataQR.qr_path; // PNG servido por backend en /uploads/qr/ID.png

                document.getElementById('qrOverlay').style.display = 'flex';
            }
        } catch (e) {
            console.error('Error generando/mostrando QR:', e);
        }

} catch (error) {
    console.error("Error:", error);
    alert('Error al registrar comercio: ' + error.message);
}
}

async function verificarSucursalAntesDeEnviar() {
    try {
        const nombre = (document.getElementById('nombreComercial').value || '').trim();
        const titularId = document.getElementById('titular').value;

        if (!nombre || !titularId) return true;

        const resp = await fetch(`/api/alta-comercio/sucursal-siguiente?nombreComercial=${encodeURIComponent(nombre)}&titular=${encodeURIComponent(titularId)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!resp.ok) return true;

        const data = await resp.json();
        const n = Number(data?.proximaSucursal || 1);

        if (n >= 1) {
            if (n > 1) {
                const confirmar = window.confirm(
                    `Ya existe un comercio con ese nombre y titular.\n¿Desea dar de alta como Sucursal ${n}?`
                );
                if (!confirmar) return false;
            }
            // ✅ Siempre asigna sucursal, incluso si es el primer local (Sucursal 1)
            window.sucursalSugerida = n;
        }

        return true;
    } catch (e) {
        console.error('verificarSucursalAntesDeEnviar error:', e);
        return true; // no bloquear si falla la verificación
    }
}

// ===============================
// Documentación del Titular (miniaturas)
// ===============================
async function cargarDocumentacionTitular(idTitular, tipo) {
    const contenedor = document.getElementById('contenedorDocTitular');
    if (!contenedor) return;
    contenedor.innerHTML = '<p class="text-muted">Cargando documentación...</p>';

    try {
        const res = await fetch(`/api/titular/documentos/${idTitular}?tipo=${encodeURIComponent(tipo)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Error al obtener documentación');
        const docs = await res.json();

        contenedor.innerHTML = '';

        // Construir lista base
        const lista = [
            { clave: 'dni_frente', nombre: 'DNI Frente' },
            { clave: 'dni_dorso', nombre: 'DNI Dorso' },
            { clave: 'cert_salud', nombre: 'Cert. de Salud' },
            { clave: 'cert_residencia', nombre: 'Cert. de Residencia' }
        ];

        // Solo Food truck: agregar Cert. de Conducta
        if ((tipo || '').toLowerCase() === 'food truck') {
            lista.push({ clave: 'cert_conducta', nombre: 'Cert. de Conducta' });
        }



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

            contenedor.appendChild(col);
        }
    } catch (err) {
        console.error(err);
        contenedor.innerHTML = `<p class="text-danger">Error al cargar documentación.</p>`;
    }
}

// 🔽 Ajuste global de scroll al primer campo inválido (más confiable)
document.addEventListener('submit', function (e) {
    const form = e.target.closest('form');
    if (!form) return;

    if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();

        // 🔴 Asegura que Bootstrap marque los campos antes del scroll
        form.classList.add('was-validated');

        setTimeout(() => {
            const primerInvalido = form.querySelector(':invalid');
            if (primerInvalido) {
                primerInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
                primerInvalido.focus({ preventScroll: true });
            }
        }, 250);
    }
}, true);

