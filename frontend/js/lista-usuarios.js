import { checkAuth, infoUsuario } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const userData = checkAuth();
    if (!userData) return;

    infoUsuario(userData);

    // Estado en memoria
    let usuariosFuente = [];
    let paginaActual = 1;
    const itemsPorPagina = 10;

    // Función para cargar usuarios
    async function cargarUsuarios() {
        try {
            const response = await fetch('/api/auth/usuarios', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al cargar usuarios');
            }
            
            const usuarios = await response.json();
            console.log('Usuarios cargados:', usuarios.map(u => ({ id: u.id_empleado, nombre: u.nombre, area: u.area })));
            // Ordenar por fecha de alta (desc), fallback por id
            usuarios.sort((a, b) => {
                const fa = a.fecha_alta || a.fecha_registro || a.created_at || null;
                const fb = b.fecha_alta || b.fecha_registro || b.created_at || null;
                if (fa && fb) return new Date(fb) - new Date(fa);
                return (b.id_empleado || 0) - (a.id_empleado || 0);
            });
            usuariosFuente = usuarios;
            poblarFiltros(usuariosFuente);
            aplicarFiltrosYBusqueda();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar usuarios: ' + error.message);
        }
    }

    // Función para mostrar usuarios en la tabla
    function mostrarUsuarios(usuarios) {
        const tbody = document.querySelector('#usuariosTable tbody');
        tbody.innerHTML = '';

        // Calcular paginación
        const totalItems = usuarios.length;
        const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        const usuariosEnPagina = usuarios.slice(inicio, fin);

        // Actualizar contador total
        document.getElementById('totalEmpleados').textContent = `Cantidad de empleados: ${totalItems}`;

        // Mostrar usuarios de la página actual
        usuariosEnPagina.forEach(usuario => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${usuario.nombre || '-'}</td>
                <td>${usuario.apellido || '-'}</td>
                <td>${usuario.dni || '-'}</td>
                <td>${usuario.area || '-'}</td>
                <td>${usuario.rol || '-'}</td>
                <td>${usuario.activo ? 'Activo' : 'Inactivo'}</td>
                <td>
                    <a href="form-registro-usuario.html?id=${usuario.id_empleado}" class="btn-action btn-edit">
                        <i class="fas fa-edit"></i> Editar
                    </a>
                    ${
                        usuario.activo
                        ? `<button class="btn-action btn-delete" data-id="${usuario.id_empleado}"><i class="fas fa-trash-alt"></i> Dar de baja</button>`
                        : `<button class="btn-action btn-activate" data-id="${usuario.id_empleado}"><i class="fas fa-user-check"></i> Reactivar</button>`
                    }
                </td>
            `;
            if (!usuario.activo) {
               tr.classList.add('fila-inactiva');
            }

            tbody.appendChild(tr);
        });

        // Agregar event listeners para los botones de eliminar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => desactivarUsuario(btn.dataset.id));
        });
   
        document.querySelectorAll('.btn-activate').forEach(btn => {
            btn.addEventListener('click', () => activarUsuario(btn.dataset.id));
        });

        // Renderizar paginación
        renderizarPaginacion(totalPaginas, totalItems);
    }

    // Búsqueda, filtros y sugerencias
    const inputBuscar = document.getElementById('buscarUsuario');
    const filtroArea = document.getElementById('filtroArea');
    const filtroRol = document.getElementById('filtroRol');
    const filtroEstado = document.getElementById('filtroEstado');
    const btnReset = document.getElementById('btnResetFiltros');

    function poblarFiltros(data) {
        if (!data) return;
        // Solo poblamos el filtro de roles ya que las áreas están fijas en el HTML
        const roles = Array.from(new Set(data.map(u => u.rol).filter(Boolean))).sort();
        if (filtroRol) filtroRol.innerHTML = '<option value="">Todos</option>' + roles.map(r => `<option value="${r}">${r}</option>`).join('');
    }

    function aplicarFiltrosYBusqueda() {
        let data = usuariosFuente.slice();
        const q = (inputBuscar?.value || '').trim();
        const soloNumeros = q.replace(/\D+/g, '');

        if (q.length > 0) {
            if (soloNumeros.length > 0 && /^[0-9]+$/.test(q)) {
                // Buscar DNI que comience con los números ingresados
                data = data.filter(u => String(u.dni || '').startsWith(soloNumeros));
            } else {
                const qLower = q.toLowerCase();
                data = data.filter(u => (u.nombre || '').toLowerCase().includes(qLower) || (u.apellido || '').toLowerCase().includes(qLower));
            }
        }

        const vArea = filtroArea?.value || '';
        const vRol = filtroRol?.value || '';
        const vEstado = filtroEstado?.value || '';
        
        if (vArea) {
            data = data.filter(u => {
                const userArea = (u.area || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const selectedArea = vArea.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return userArea === selectedArea;
            });
        }
        if (vRol) data = data.filter(u => (u.rol || '').toLowerCase() === vRol.toLowerCase());
        if (vEstado) data = data.filter(u => vEstado === 'activo' ? !!u.activo : !u.activo);

        mostrarUsuarios(data);
        renderizarSugerenciasBusqueda(q, data);
    }

    function aplicarFiltrosYBusquedaConReset() {
        // Resetear a página 1 cuando se aplican filtros
        paginaActual = 1;
        aplicarFiltrosYBusqueda();
    }

    function renderizarSugerenciasBusqueda(q, dataFiltrada) {
        const contId = 'buscarSugerencias';
        let cont = document.getElementById(contId);
        if (!inputBuscar) return;
        if (!cont) {
            cont = document.createElement('div');
            cont.id = contId;
            cont.style.position = 'absolute';
            cont.style.top = '100%';
            cont.style.left = '0';
            cont.style.right = '0';
            cont.style.zIndex = '1050';
            cont.style.background = '#fff';
            cont.style.border = '1px solid rgba(0,0,0,0.125)';
            cont.style.borderTop = 'none';
            cont.style.maxHeight = '260px';
            cont.style.overflowY = 'auto';
            cont.style.display = 'none';
            const group = inputBuscar.closest('.input-group');
            if (group) {
                group.style.position = 'relative';
                group.appendChild(cont);
            }
        }

        if (!q || q.length < 2) {
            cont.style.display = 'none';
            cont.innerHTML = '';
            return;
        }
        const sample = dataFiltrada.slice(0, 8);
        if (sample.length === 0) {
            cont.style.display = 'none';
            cont.innerHTML = '';
            return;
        }
        cont.innerHTML = sample.map((u, idx) => `
            <button type="button" class="list-group-item list-group-item-action" data-idx="${idx}" style="display:block;width:100%;text-align:left;">
                <div class=\"d-flex justify-content-between\"> 
                    <span>${u.apellido || ''} ${u.nombre || ''}</span>
                    <small class=\"text-muted\">${u.dni || ''}</small>
                </div>
            </button>
        `).join('');
        cont.className = 'list-group';
        cont.style.display = 'block';
        Array.from(cont.querySelectorAll('button')).forEach((btn, idx) => {
            btn.addEventListener('click', () => {
                const u = sample[idx];
                inputBuscar.value = String(u.dni || '').length ? String(u.dni) : `${u.apellido || ''} ${u.nombre || ''}`.trim();
                cont.style.display = 'none';
                cont.innerHTML = '';
                aplicarFiltrosYBusqueda();
            });
        });
    }

    const debouncedBuscar = crearDebounce(() => aplicarFiltrosYBusquedaConReset(), 200);
    inputBuscar?.addEventListener('input', debouncedBuscar);
    filtroArea?.addEventListener('change', aplicarFiltrosYBusquedaConReset);
    filtroRol?.addEventListener('change', aplicarFiltrosYBusquedaConReset);
    filtroEstado?.addEventListener('change', aplicarFiltrosYBusquedaConReset);
    btnReset?.addEventListener('click', () => {
        if (inputBuscar) inputBuscar.value = '';
        if (filtroArea) filtroArea.value = '';
        if (filtroRol) filtroRol.value = '';
        if (filtroEstado) filtroEstado.value = '';
        const sug = document.getElementById('buscarSugerencias');
        if (sug) { sug.style.display = 'none'; sug.innerHTML = ''; }
        aplicarFiltrosYBusquedaConReset();
    });

    function crearDebounce(fn, delay) {
        let t;
        return function() {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, arguments), delay);
        };
    }

    // Función para renderizar la paginación
    function renderizarPaginacion(totalPaginas, totalItems) {
        const containerPaginas = document.getElementById('paginasContainer');
        const btnPrev = document.getElementById('btnPrevPagina');
        const btnNext = document.getElementById('btnNextPagina');
        
        containerPaginas.innerHTML = '';

        // Mostrar botones de paginación solo si hay más de una página
        if (totalPaginas > 1) {
            // Botón anterior
            if (paginaActual > 1) {
                btnPrev.style.display = 'block';
                btnPrev.onclick = null; // Limpiar onclick anterior
                btnPrev.removeEventListener('click', btnPrev._clickHandler);
                btnPrev._clickHandler = () => irAPagina(paginaActual - 1);
                btnPrev.addEventListener('click', btnPrev._clickHandler);
            } else {
                btnPrev.style.display = 'none';
            }

            // Números de página
            for (let i = 1; i <= totalPaginas; i++) {
                const btnPagina = document.createElement('button');
                btnPagina.className = 'btn-numero-pagina';
                btnPagina.type = 'button';
                btnPagina.textContent = i;
                
                if (i === paginaActual) {
                    btnPagina.classList.add('activa');
                    btnPagina.style.cssText = 'background-color: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;';
                } else {
                    btnPagina.style.cssText = 'background-color: #f0f0f0; border: 1px solid #ddd; padding: 8px 12px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s;';
                    btnPagina.onmouseover = () => btnPagina.style.backgroundColor = '#e0e0e0';
                    btnPagina.onmouseout = () => btnPagina.style.backgroundColor = '#f0f0f0';
                }
                
                btnPagina.addEventListener('click', () => irAPagina(i));
                containerPaginas.appendChild(btnPagina);
            }

            // Botón siguiente
            if (paginaActual < totalPaginas) {
                btnNext.style.display = 'block';
                btnNext.onclick = null; // Limpiar onclick anterior
                btnNext.removeEventListener('click', btnNext._clickHandler);
                btnNext._clickHandler = () => irAPagina(paginaActual + 1);
                btnNext.addEventListener('click', btnNext._clickHandler);
            } else {
                btnNext.style.display = 'none';
            }
        } else {
            btnPrev.style.display = 'none';
            btnNext.style.display = 'none';
        }
    }

    // Función para ir a una página específica
    function irAPagina(numPagina) {
        paginaActual = numPagina;
        aplicarFiltrosYBusqueda();
        // Scroll al inicio de la tabla
        document.querySelector('#usuariosTable').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Función para eliminar usuario
    async function desactivarUsuario(id) {
        if (!confirm('¿Está seguro que desea dar de baja este usuario?')) return;

        try {
            const response = await fetch(`/api/auth/desactivar/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al dar de baja al usuario');
            }

            alert('Usuario dado de baja con éxito');
            cargarUsuarios(); // o refrescar tabla
        } catch (error) {
            console.error('Error:', error);
            alert('Error al dar de baja al usuario: ' + error.message);
        }
    }

    // dar de alta
    async function activarUsuario(id) {
        try {
            const response = await fetch(`/api/auth/activar/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al dar de alta al usuario.');
            }

            alert('Usuario dado de alta con éxito');
            cargarUsuarios(); // o refrescar tabla
        } catch (error) {
            console.error('Error:', error);
            alert('Error al dar de alta al usuario: ' + error.message);
        }
    }


    // Cargar usuarios al iniciar
    cargarUsuarios();

    // Manejar cierre de sesión
    document.querySelector('.logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = "login.html";
    });
});