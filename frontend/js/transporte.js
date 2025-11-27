import { checkAuth, infoUsuario } from '../auth.js';

// Variables globales
let modoEdicion = false;
let idTransporte = null;
let transporteOriginal = null;

function safeSetContent(id, value) {
    const element = document.getElementById(id);
    if (!element) return;

    const formatDate = (dateValue) => {
        try {
            const d = new Date(dateValue);
            return isNaN(d.getTime()) ? 'Fecha inválida' : d.toLocaleDateString('es-AR');
        } catch {
            return 'Fecha inválida';
        }
    };

    const displayValue = !value
        ? 'No especificado'
        : id.includes('fecha')
            ? formatDate(value)
            : value;

    if (element.tagName === 'INPUT') {
        element.value = displayValue;
    } else {
        element.textContent = displayValue;
    }
}

function toggleModoEdicion() {
    modoEdicion = !modoEdicion;
    const btnEditar = document.getElementById('btn-editar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnBaja = document.getElementById('btn-baja');

    if (modoEdicion) {
        document.querySelector('.detalle-transporte').classList.add('modo-edicion');

        btnEditar.innerHTML = '<i class="fas fa-save"></i> Guardar cambios';
        btnEditar.classList.remove('boton-primario');
        btnEditar.classList.add('boton-exito');
        btnCancelar.style.display = 'inline-block';
        btnBaja.style.display = 'none';

        // Mostrar ambos bloques del chofer en modo edición (sin habilitar campos)
        document.getElementById('chofer-es-titular').style.display = 'grid';
        document.getElementById('bloque-detalle-chofer').style.display = 'grid';

        // 🔹 Mostrar pregunta y radios en modo edición (habilitados)
        const textoPregunta = document.getElementById('texto-pregunta-chofer');
        const pregunta = document.getElementById('pregunta-chofer');

        // Mostrar pregunta
        if (textoPregunta) textoPregunta.style.display = 'inline';

        // Mostrar radios (flex para mantener estructura)
        if (pregunta) pregunta.style.display = 'flex';

        // 🔸 Asegurar que los radios estén habilitados
        document.querySelectorAll('input[name="chofer-es-titular-radio"]').forEach(radio => {
            radio.disabled = false;
        });

        // Asegurar que todos los campos del chofer quedan deshabilitados por ahora (excepto los radios)
        document.querySelectorAll('#bloque-detalle-chofer input, #chofer-es-titular input[type="text"]').forEach(campo => {
            campo.disabled = true;
        });

        // 🔹 Agregar eventos a los radios para activar/desactivar campos según selección
        document.querySelectorAll('input[name="chofer-es-titular-radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const esTitular = radio.value === 'si';

                // 📌 Campo "Actual chofer"
                const actualChofer = document.getElementById('actual-chofer');
                const camposChofer = document.querySelectorAll('#bloque-detalle-chofer input');

                if (esTitular) {
                    // Si será el titular → habilitar campo actual chofer y deshabilitar los datos del chofer
                    if (actualChofer) {
                        actualChofer.disabled = false;
                        actualChofer.value = "Es el titular";
                    }
                    camposChofer.forEach(campo => {
                        campo.disabled = true;
                        campo.value = ""; // Se vacían
                    });
                } else {
                    // Si NO será el titular → deshabilitar actual chofer y habilitar campos chofer
                    if (actualChofer) {
                        actualChofer.disabled = true;
                        actualChofer.value = ""; // Se limpia
                    }
                    camposChofer.forEach(campo => {
                        campo.disabled = false; // Se pueden editar
                        campo.value = campo.dataset.original || "";
                    });
                }
            });
        });

        document.querySelectorAll('.campo-edit').forEach(input => {
            input.disabled = false;
        });

        const fechaVencimiento = document.getElementById('fecha-vencimiento');
        if (fechaVencimiento) {
            fechaVencimiento.readOnly = true;
        }
    } else {
        document.querySelector('.detalle-transporte').classList.remove('modo-edicion');

        btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar Transporte';
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
            patente: document.getElementById('patente').value,
            telefono_chofer: document.getElementById('telefono-chofer').value,
            tipo_alimento: document.getElementById('tipo-alimento').value,
            tipo_vehiculo: document.getElementById('tipo-vehiculo').value,
            correo_electronico: document.getElementById('correo')?.value || null
        };

        const response = await fetch(`/api/transportes/${idTransporte}`, {
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
        cargarDatosTransporte(transporteOriginal);
        toggleModoEdicion();
    }
}

// Función para cargar los datos del transporte
function cargarDatosTransporte(transporte) {
    safeSetContent('patente', transporte.patente);
    safeSetContent('telefono-chofer', transporte.telefono_chofer);
    safeSetContent('tipo-alimento', transporte.tipo_alimento);
    safeSetContent('tipo-vehiculo', transporte.tipo_vehiculo);
    safeSetContent('correo', transporte.correo_electronico);
    safeSetContent('empleado-registro', transporte.inspector_registro);
    safeSetContent('fecha-vencimiento', transporte.fecha_vencimiento);
    safeSetContent('fecha-registro', transporte.fecha_habilitacion);
    safeSetContent('titular', transporte.titular_nombre);

    // Mostrar u ocultar datos del chofer
    if (transporte.nombre_chofer) {
        // Hay chofer diferente al titular
        document.getElementById('bloque-detalle-chofer').style.display = 'grid';
        document.getElementById('chofer-es-titular').style.display = 'none';

        safeSetContent('chofer-nombre', transporte.nombre_chofer);
        safeSetContent('chofer-telefono', transporte.telefono_chofer);
        safeSetContent('chofer-dni', transporte.dni_chofer);
        safeSetContent('chofer-carnet', transporte.carnet_chofer);

        // 📌 Guardar valores originales del chofer (solo si existen)
        const inputNombreChofer = document.getElementById("chofer-nombre");
        const inputTelefonoChofer = document.getElementById("chofer-telefono");
        const inputDniChofer = document.getElementById("chofer-dni");
        const inputCarnetChofer = document.getElementById("chofer-carnet");

        if (inputNombreChofer) inputNombreChofer.dataset.original = inputNombreChofer.value;
        if (inputTelefonoChofer) inputTelefonoChofer.dataset.original = inputTelefonoChofer.value;
        if (inputDniChofer) inputDniChofer.dataset.original = inputDniChofer.value;
        if (inputCarnetChofer) inputCarnetChofer.dataset.original = inputCarnetChofer.value;

    } else {
        // El titular es el chofer
        document.getElementById('bloque-detalle-chofer').style.display = 'none';
        document.getElementById('chofer-es-titular').style.display = 'block';

        // 🔹 OCULTAR pregunta y radios SOLO en modo vista (NO en edición)
        if (!modoEdicion) {
            const textoPregunta = document.getElementById('texto-pregunta-chofer');
            const pregunta = document.getElementById('pregunta-chofer');

            if (textoPregunta) textoPregunta.style.display = 'none';
            if (pregunta) pregunta.style.display = 'none';
        }
    }

    const estadoHabilitacion = document.getElementById('estado-habilitacion');
    if (estadoHabilitacion) {
        const hoy = new Date();
        const vencimiento = new Date(transporte.fecha_vencimiento);
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

        // 3. Obtener ID desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        idTransporte = urlParams.get('id');
        if (!idTransporte) throw new Error('ID de transporte no especificado');

        // 4. Cargar datos del transporte
        const response = await fetch(`/api/transportes/${idTransporte}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);

        const transporte = await response.json();
        transporteOriginal = { ...transporte };

        // 5. Mostrar datos
        cargarDatosTransporte(transporte);

        // 6. Configurar visibilidad según rol
        const contenedorAcciones = document.getElementById('contenedor-acciones');
        const estadoTransporteCampo = document.querySelector('.campo:has(#btn-estado-transporte)');

        // Ocultar por defecto
        if (contenedorAcciones) contenedorAcciones.style.display = 'none';
        if (estadoTransporteCampo) estadoTransporteCampo.style.display = 'none';

        if (userData.rol === 'inspector') {
            // Acción exclusiva de inspector (si aplica en transporte)
            const contenedorInspector = document.createElement('div');
            contenedorInspector.className = 'footer-acciones inspector-actions';
            contenedorInspector.id = 'contenedor-inspector';

            const btnProcedimiento = document.createElement('button');
            btnProcedimiento.id = 'btn-procedimiento';
            btnProcedimiento.className = 'boton-primario';
            btnProcedimiento.innerHTML = '<i class="fas fa-clipboard-check"></i> Registrar Procedimiento';

            document.querySelector('.detalle-transporte').appendChild(contenedorInspector);
            contenedorInspector.appendChild(btnProcedimiento);

            btnProcedimiento.addEventListener('click', () => {
                window.location.href = `procedimiento.html?id_transporte=${idTransporte}`;
            });
        } else if (['administrador', 'administrativo'].includes(userData.rol)) {
            // Mostrar elementos para administrativos / admin
            if (contenedorAcciones) contenedorAcciones.style.display = 'flex';
            if (estadoTransporteCampo) estadoTransporteCampo.style.display = 'block';

            // Configurar botón de estado
            const btnEstadoTransporte = document.getElementById('btn-estado-transporte');
            if (btnEstadoTransporte) {
                const textoEstado = document.getElementById('texto-estado');
                if (transporte.activo) {
                    btnEstadoTransporte.className = 'estado-transporte-btn activo';
                    textoEstado.textContent = 'Activo';
                } else {
                    btnEstadoTransporte.className = 'estado-transporte-btn inactivo';
                    textoEstado.textContent = 'Inactivo';
                }

                btnEstadoTransporte.addEventListener('click', async () => {
                    const accion = transporte.activo ? 'inactivar' : 'reactivar';
                    if (confirm(`¿Está seguro que desea ${accion} este transporte?`)) {
                        try {
                            const response = await fetch(`/api/transportes/${idTransporte}/estado`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    activo: !transporte.activo
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

            // Configurar botones de edición / cancelar
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
                    cargarDatosTransporte(transporteOriginal);
                    toggleModoEdicion();
                });
            }

            // Configurar baja / reactivación
            if (btnBaja) {
                btnBaja.innerHTML = transporte.activo
                    ? '<i class="fas fa-trash"></i> Dar de Baja'
                    : '<i class="fas fa-redo"></i> Reactivar';

                btnBaja.addEventListener('click', async () => {
                    const accion = transporte.activo ? 'inactivar' : 'reactivar';
                    if (confirm(`¿Está seguro que desea ${accion} este transporte?`)) {
                        try {
                            const response = await fetch(`/api/transportes/${idTransporte}/estado`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    activo: !transporte.activo
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

        const detalleTransporte = document.getElementById('detalle-transporte');
        if (detalleTransporte) {
            detalleTransporte.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${error.message}</p>
          <a href="lista-transportes.html" class="boton-volver">
            <i class="fas fa-arrow-left"></i> Volver al listado
          </a>
        </div>
      `;
        } else {
            alert(`Error: ${error.message}`);
        }
    }
});