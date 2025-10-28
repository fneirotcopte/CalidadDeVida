// import { checkAuth, infoUsuario } from '../auth.js';

// document.addEventListener('DOMContentLoaded', async () => {
//   // Verificar autenticación
//   const userData = checkAuth();
//   if (!userData) {
//     window.location.href = 'login.html';
//     return;
//   }

//   // Mostrar información del usuario
//   infoUsuario(userData);

//   // Configurar logout
//   document.querySelector('.logout-btn').addEventListener('click', () => {
//     localStorage.removeItem('token');
//     window.location.href = 'login.html';
//   });

//   // Variables de estado
//   let comercios = [];
//   let totalRegistros = 0;
//   const registrosPorPagina = 10;
//   let paginaActual = 1;

//   // Mapeo de categorías a rubros
//   const categoriasRubros = {
//     "Comercio en general": ["Supermercado","Panaderia", "Almacén", "Farmacia", "Carniceria"],
//     "Vendedores ambulantes": ["Comida rápida", "Bebidas", "Artículos varios"],
//     "Bares nocturnos": ["Bar", "Restaurante", "Pub"],
//     "Food trucks": []
//   };

//   // Función para determinar el estado de vencimiento
//   function determinarEstado(fechaVencimiento, pendienteInspeccion, categoria) {
//     if (!fechaVencimiento) return "sin-datos";

//     const categoriasConInspeccion = ['comercio en general', 'bares nocturnos, confiterias y restaurantes'];
//     const categoriaLower = (categoria || '').toLowerCase();
    
//     if (pendienteInspeccion && categoriasConInspeccion.includes(categoriaLower)) {
//         return "pendiente-inspeccion";
//     }
    
//     const hoy = new Date();
//     const vencimiento = new Date(fechaVencimiento);
//     const diffTime = vencimiento - hoy;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays < 0) return "vencido";
//     if (diffDays <= 30) return `proximo-${diffDays}`; // Devuelve el número exacto de días
//     return "vigente";
//   }



// // Función para obtener texto descriptivo del estado
// function obtenerTextoEstado(estado) {
//     switch(estado) {
//         case "vigente": return "Vigente";
//         case "pendiente-inspeccion": return "Falta inspección";
//         case "vencido": return "Vencido";
//         default: 
//             if (estado.startsWith("proximo-")) {
//                 const dias = parseInt(estado.split("-")[1]);
//                 if (dias === 1) return "Vence en 1 día";
//                 return `Vence en ${dias} días`;
//             }
//             return "Sin datos";
//     }
// }

//   // Función para formatear fecha
//   function formatearFecha(fecha) {
//     if (!fecha) return "Sin fecha";
//     return new Date(fecha).toLocaleDateString('es-AR');
//   }

// //   // Función para obtener la clase CSS según el estado
// // function obtenerClaseEstado(estado) {
// //     switch(estado) {
// //         case "vigente": return "estado-vigente";
// //         case "proximo-30": return "estado-proximo-30";
// //         case "proximo-15": return "estado-proximo-15";
// //         case "vencido": return "estado-vencido";
// //         case "pendiente-inspeccion": return "estado-pendiente-inspeccion";
// //         default: return "";
// //     }
// // }

// //   // Función para obtener la clase CSS para la fila según el estado
// // function obtenerClaseFila(estado) {
// //     switch(estado) {
// //         case "vigente": return "fila-vigente";
// //         case "proximo-30": return "fila-proximo-30";
// //         case "proximo-15": return "fila-proximo-15";
// //         case "vencido": return "fila-vencido";
// //         case "pendiente-inspeccion": return "fila-pendiente-inspeccion";
// //         default: return "";
// //     }
// // }

// //   // Función para obtener la clase CSS para la columna de vencimiento
// //   function obtenerClaseVencimiento(estado) {
// //     switch(estado) {
// //       case "vigente": return "vencimiento-vigente";
// //       case "proximo-30": return "vencimiento-proximo-30";
// //       case "proximo-15": return "vencimiento-proximo-15";
// //       case "vencido": return "vencimiento-vencido";
// //       default: return "";
// //     }
// //   }

// // Función para obtener la clase CSS según el estado
// function obtenerClaseEstado(estado) {
//     if (estado.startsWith("proximo-")) {
//         const dias = parseInt(estado.split("-")[1]);
//         if (dias <= 15) return "estado-proximo-15";
//         if (dias <= 30) return "estado-proximo-30";
//     }
    
//     switch(estado) {
//         case "vigente": return "estado-vigente";
//         case "vencido": return "estado-vencido";
//         case "pendiente-inspeccion": return "estado-pendiente-inspeccion";
//         default: return "";
//     }
// }

// // Función para obtener la clase CSS para la fila según el estado
// function obtenerClaseFila(estado) {
//     if (estado.startsWith("proximo-")) {
//         const dias = parseInt(estado.split("-")[1]);
//         if (dias <= 15) return "fila-proximo-15";
//         if (dias <= 30) return "fila-proximo-30";
//     }
    
//     switch(estado) {
//         case "vigente": return "fila-vigente";
//         case "vencido": return "fila-vencido";
//         case "pendiente-inspeccion": return "fila-pendiente-inspeccion";
//         default: return "";
//     }
// }

// // Función para obtener la clase CSS para la columna de vencimiento
// function obtenerClaseVencimiento(estado) {
//     if (estado.startsWith("proximo-")) {
//         const dias = parseInt(estado.split("-")[1]);
//         if (dias <= 15) return "vencimiento-proximo-15";
//         if (dias <= 30) return "vencimiento-proximo-30";
//     }
    
//     switch(estado) {
//         case "vigente": return "vencimiento-vigente";
//         case "vencido": return "vencimiento-vencido";
//         default: return "";
//     }
// }



//   // // Función para obtener texto descriptivo del estado
//   // function obtenerTextoEstado(estado) {
//   //     switch(estado) {
//   //         case "vigente": return "Vigente";
//   //         case "proximo-30": return "Por vencer (30 días)";
//   //         case "proximo-15": return "Por vencer (15 días)";
//   //         case "vencido": return "Vencido";
//   //         case "pendiente-inspeccion": return "Falta inspección";
//   //         default: return "Sin datos";
//   //     }
//   // }

//   // Actualizar rubros al cambiar categoría
//   document.getElementById('filtro-categoria').addEventListener('change', (e) => {
//     const categoriaSeleccionada = e.target.value;
//     const rubroSelect = document.getElementById('filtro-rubro');

//     // Limpiar opciones anteriores
//     rubroSelect.innerHTML = '<option value="">Todos</option>';

//     // Cargar rubros correspondientes
//     const rubros = categoriasRubros[categoriaSeleccionada] || [];
//     rubros.forEach(rubro => {
//       const opcion = document.createElement('option');
//       opcion.value = rubro;
//       opcion.textContent = rubro;
//       rubroSelect.appendChild(opcion);
//     });
//   });

//   // // Cargar comercios desde la API
//   // async function fetchComercios(pagina = 1, filtros = {}) {
//   //   const { estado, categoria, rubro, busqueda } = filtros;
//   //   const params = new URLSearchParams({
//   //     pagina,
//   //     porPagina: registrosPorPagina,
//   //     ...(estado && { estado }),
//   //     ...(categoria && { categoria }),
//   //     ...(rubro && { rubro }),
//   //     ...(busqueda && { busqueda })
//   //   });

//   //   try {
//   //     const response = await fetch(`/api/comercios?${params}`, {
//   //       headers: {
//   //         'Authorization': `Bearer ${localStorage.getItem('token')}`
//   //       }
//   //     });
//   //     return await response.json();
//   //   } catch (error) {
//   //     console.error('Error:', error);
//   //     return { data: [], total: 0 };
//   //   }
//   // }
// // Cargar comercios desde la API
// async function fetchComercios(pagina = 1, filtros = {}) {
//   const { estado, categoria, rubro, busqueda } = filtros;
//   const params = new URLSearchParams({
//     pagina,
//     porPagina: registrosPorPagina,
//     ...(estado && { estado }),
//     ...(categoria && { categoria }),
//     ...(rubro && { rubro }),
//     ...(busqueda && { busqueda })
//   });

//   try {
//     const response = await fetch(`/api/comercios?${params}`, {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       }
//     });
//     return await response.json();
//   } catch (error) {
//     console.error('Error:', error);
//     return { data: [], total: 0 };
//   }
// }

// // Cargar TODOS los comercios sin paginación para filtros
// async function fetchTodosComercios() {
//   try {
//     const response = await fetch(`/api/comercios?porPagina=1000`, {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       }
//     });
//     return await response.json();
//   } catch (error) {
//     console.error('Error:', error);
//     return { data: [], total: 0 };
//   }
// }

//   // Renderizar tabla
//   function renderizarTabla() {
//     const cuerpoTabla = document.getElementById('cuerpo-tabla');
//     cuerpoTabla.innerHTML = '';

//     comercios.forEach(comercio => {
//       const estado = determinarEstado(comercio.fecha_vencimiento, comercio.pendiente_inspeccion, comercio.categoria);
//       const claseFila = obtenerClaseFila(estado);
//       const claseEstado = obtenerClaseEstado(estado);
//       const claseVencimiento = obtenerClaseVencimiento(estado);
//       const textoEstado = obtenerTextoEstado(estado);
//       const fechaFormateada = formatearFecha(comercio.fecha_vencimiento);

//       const fila = document.createElement('tr');
//       if (claseFila) fila.classList.add(claseFila);
      
//       fila.innerHTML = `
//         <td>${comercio.nombre_comercial}</td>
//         <td>${comercio.titular}</td>
//         <td>${comercio.dni || '-'}</td>
//         <td>${comercio.categoria}</td>
//         <td>${comercio.rubro}</td>

//         <td><span class="${claseEstado}">${textoEstado}</span></td>
//         <td>
//           <div class="acciones">
//             <button class="btn-accion btn-ver" data-id="${comercio.id_comercio}">
//               <i class="fas fa-eye"></i> Ver detalles
//             </button>
//             <button class="btn-accion btn-renovar" data-id="${comercio.id_comercio}">
//               <i class="fas fa-sync"></i> Renovar
//             </button>
//           </div>
//         </td>
//       `;
//       cuerpoTabla.appendChild(fila);
//     });

//     // Configurar evento para botones VER
//     document.querySelectorAll('.btn-ver').forEach(btn => {
//       btn.addEventListener('click', (e) => {
//         const id = e.currentTarget.getAttribute('data-id');
//         window.location.href = `comercio.html?id=${id}`;
//       });
//     });

//     // Configurar evento para botones RENOVAR (solo para roles permitidos)
//     const tokenData = checkAuth();
//     const rol = tokenData?.rol?.toLowerCase?.() || '';
//     const puedeRenovar = rol === 'administrador' || rol === 'administrativo';

//     document.querySelectorAll('.btn-renovar').forEach(btn => {
//       if (!puedeRenovar) {
//         btn.style.display = 'none';
//         return;
//       }
//       btn.addEventListener('click', (e) => {
//         const id = e.currentTarget.getAttribute('data-id');
//         window.location.href = `renovacion-comercios.html?id=${id}`;
//       });
//     });

//     actualizarPaginacion();
//   }

//   // Actualizar controles de paginación
// function actualizarPaginacion() {
//   const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
//   document.getElementById('info-pagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;
//   document.getElementById('btn-anterior').disabled = paginaActual <= 1;
//   document.getElementById('btn-siguiente').disabled = paginaActual >= totalPaginas;
// }

// // Función para agrupar estados en los filtros
// function agruparEstadoParaFiltro(estado) {
//     if (estado.startsWith("proximo-")) {
//         const dias = parseInt(estado.split("-")[1]);
//         if (dias <= 15) return "proximo-15";
//         if (dias <= 30) return "proximo-30";
//     }
//     return estado;
// }



//   // // Aplicar filtros
//   // async function aplicarFiltros() {
//   //   const filtros = {
//   //     estado: document.getElementById('filtro-estado').value,
//   //     categoria: document.getElementById('filtro-categoria').value,
//   //     rubro: document.getElementById('filtro-rubro').value,
//   //     busqueda: document.getElementById('filtro-busqueda').value
//   //   };
//   //   const response = await fetchComercios(1, filtros);
//   //   comercios = response.data;
//   //   totalRegistros = response.total;
//   //   paginaActual = 1;
//   //   renderizarTabla();
//   // }

// // async function aplicarFiltros() {
// //     const estadoFiltro = document.getElementById('filtro-estado').value;
// //     const categoriaFiltro = document.getElementById('filtro-categoria').value;
// //     const rubroFiltro = document.getElementById('filtro-rubro').value;
// //     const busquedaFiltro = document.getElementById('filtro-busqueda').value.toLowerCase();

// //     // Primero cargar todos los datos (o usar datos ya cargados)
// //     const response = await fetchComercios(1, {}); // Sin filtros para obtener todos
// //     let comerciosFiltrados = response.data;

// //     // Aplicar filtros en el frontend
// //     if (estadoFiltro) {
// //         comerciosFiltrados = comerciosFiltrados.filter(comercio => {
// //             const estado = determinarEstado(comercio.fecha_vencimiento, comercio.pendiente_inspeccion, comercio.categoria);
// //             const estadoAgrupado = agruparEstadoParaFiltro(estado);
// //             return estadoAgrupado === estadoFiltro;
// //         });
// //     }

// //     if (categoriaFiltro) {
// //         comerciosFiltrados = comerciosFiltrados.filter(comercio => 
// //             comercio.categoria === categoriaFiltro
// //         );
// //     }

// //     if (rubroFiltro) {
// //         comerciosFiltrados = comerciosFiltrados.filter(comercio => 
// //             comercio.rubro === rubroFiltro
// //         );
// //     }

// //     if (busquedaFiltro) {
// //         comerciosFiltrados = comerciosFiltrados.filter(comercio => 
// //             comercio.nombre_comercial.toLowerCase().includes(busquedaFiltro) ||
// //             comercio.titular.toLowerCase().includes(busquedaFiltro)
// //         );
// //     }

// //     comercios = comerciosFiltrados;
// //     totalRegistros = comerciosFiltrados.length;
// //     paginaActual = 1;
// //     renderizarTabla();
// // }
// // Aplicar filtros
// async function aplicarFiltros() {
//   const estadoFiltro = document.getElementById('filtro-estado').value;
//   const categoriaFiltro = document.getElementById('filtro-categoria').value;
//   const rubroFiltro = document.getElementById('filtro-rubro').value;
//   const busquedaFiltro = document.getElementById('filtro-busqueda').value.toLowerCase();

//   // Cargar todos los datos para filtrar en frontend
//   const response = await fetchTodosComercios();
//   let comerciosFiltrados = response.data;

//   // Aplicar filtros en el frontend
//   if (estadoFiltro) {
//     comerciosFiltrados = comerciosFiltrados.filter(comercio => {
//       const estado = determinarEstado(comercio.fecha_vencimiento, comercio.pendiente_inspeccion, comercio.categoria);
//       const estadoAgrupado = agruparEstadoParaFiltro(estado);
//       return estadoAgrupado === estadoFiltro;
//     });
//   }

//   if (categoriaFiltro) {
//     comerciosFiltrados = comerciosFiltrados.filter(comercio => 
//       comercio.categoria === categoriaFiltro
//     );
//   }

//   if (rubroFiltro) {
//     comerciosFiltrados = comerciosFiltrados.filter(comercio => 
//       comercio.rubro === rubroFiltro
//     );
//   }

//   if (busquedaFiltro) {
//     comerciosFiltrados = comerciosFiltrados.filter(comercio => 
//       comercio.nombre_comercial.toLowerCase().includes(busquedaFiltro) ||
//       comercio.titular.toLowerCase().includes(busquedaFiltro)
//     );
//   }

//   comercios = comerciosFiltrados;
//   totalRegistros = comerciosFiltrados.length;
//   paginaActual = 1;
//   renderizarTabla();
// }


//   // // Resetear filtros
//   // function resetearFiltros() {
//   //   document.getElementById('filtro-estado').value = '';
//   //   document.getElementById('filtro-categoria').value = '';
//   //   document.getElementById('filtro-rubro').value = '';
//   //   document.getElementById('filtro-busqueda').value = '';
    
//   //   // Limpiar y resetear el select de rubros
//   //   const rubroSelect = document.getElementById('filtro-rubro');
//   //   rubroSelect.innerHTML = '<option value="">Todos</option>';
    
//   //   // Volver a cargar los datos iniciales
//   //   aplicarFiltros();
//   // }

// // Resetear filtros
// function resetearFiltros() {
//   document.getElementById('filtro-estado').value = '';
//   document.getElementById('filtro-categoria').value = '';
//   document.getElementById('filtro-rubro').value = '';
//   document.getElementById('filtro-busqueda').value = '';
  
//   // Limpiar y resetear el select de rubros
//   const rubroSelect = document.getElementById('filtro-rubro');
//   rubroSelect.innerHTML = '<option value="">Todos</option>';
  

// async function cargarDatosIniciales() {
//   const response = await fetchComercios(1, {});
//   comercios = response.data;
//   totalRegistros = response.total;
//   paginaActual = 1;
//   renderizarTabla();
// }


//   // Volver a cargar los datos iniciales con paginación
//   cargarDatosIniciales();
// }


// function obtenerDatosPaginados() {
//   const inicio = (paginaActual - 1) * registrosPorPagina;
//   const fin = inicio + registrosPorPagina;
//   return comercios.slice(inicio, fin);
// }

//   // Event Listeners
//   document.getElementById('btn-anterior').addEventListener('click', () => {
//     if (paginaActual > 1) {
//       paginaActual--;
//       const filtros = {
//         estado: document.getElementById('filtro-estado').value,
//         categoria: document.getElementById('filtro-categoria').value,
//         rubro: document.getElementById('filtro-rubro').value,
//         busqueda: document.getElementById('filtro-busqueda').value
//       };
//       fetchComercios(paginaActual, filtros).then(response => {
//         comercios = response.data;
//         totalRegistros = response.total;
//         renderizarTabla();
//       });
//     }
//   });

//   document.getElementById('btn-siguiente').addEventListener('click', () => {
//     const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
//     if (paginaActual < totalPaginas) {
//       paginaActual++;
//       const filtros = {
//         estado: document.getElementById('filtro-estado').value,
//         categoria: document.getElementById('filtro-categoria').value,
//         rubro: document.getElementById('filtro-rubro').value,
//         busqueda: document.getElementById('filtro-busqueda').value
//       };
//       fetchComercios(paginaActual, filtros).then(response => {
//         comercios = response.data;
//         totalRegistros = response.total;
//         renderizarTabla();
//       });
//     }
//   });

//   document.getElementById('btn-buscar').addEventListener('click', aplicarFiltros);
//   document.getElementById('btn-reset').addEventListener('click', resetearFiltros);

//   // Inicializar
//   const response = await fetchComercios();
//   comercios = response.data;
//   totalRegistros = response.total;
//   renderizarTabla();
// });

import { checkAuth, infoUsuario } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticación
  const userData = checkAuth();
  if (!userData) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar información del usuario
  infoUsuario(userData);

  // Configurar logout
  document.querySelector('.logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  // Variables de estado
  let comercios = [];
  let totalRegistros = 0;
  const registrosPorPagina = 10;
  let paginaActual = 1;
  let usandoFiltros = false; // Nueva variable para controlar el modo

  // Mapeo de categorías a rubros
  const categoriasRubros = {
    "Comercio en general": ["Supermercado","Panaderia", "Almacén", "Farmacia", "Carniceria"],
    "Vendedores ambulantes": ["Comida rápida", "Bebidas", "Artículos varios"],
    "Bares nocturnos": ["Bar", "Restaurante", "Pub"],
    "Food trucks": []
  };

  // Función para determinar el estado de vencimiento
  function determinarEstado(fechaVencimiento, pendienteInspeccion, categoria) {
    const categoriasConInspeccion = ['comercio en general', 'bares nocturnos, confiterias y restaurantes'];
    const categoriaLower = (categoria || '').toLowerCase();
    
    // Primero verificamos si está pendiente de inspección
    if (pendienteInspeccion && categoriasConInspeccion.includes(categoriaLower)) {
        return "pendiente-inspeccion";
    }

    // Si no tiene fecha de vencimiento y no está pendiente de inspección
    if (!fechaVencimiento) return "sin-datos";
    
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "vencido";
    if (diffDays <= 30) return `proximo-${diffDays}`; // Devuelve el número exacto de días
    return "vigente";
  }

  // Función para obtener texto descriptivo del estado
  function obtenerTextoEstado(estado) {
      switch(estado) {
          case "vigente": return "Vigente";
          case "pendiente-inspeccion": return "Falta inspección";
          case "vencido": return "Vencido";
          default: 
              if (estado.startsWith("proximo-")) {
                  const dias = parseInt(estado.split("-")[1]);
                  if (dias === 1) return "Vence en 1 día";
                  return `Vence en ${dias} días`;
              }
              return "Sin datos";
      }
  }

  // Función para formatear fecha
  function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  // Función para obtener la clase CSS según el estado
  function obtenerClaseEstado(estado) {
      if (estado.startsWith("proximo-")) {
          const dias = parseInt(estado.split("-")[1]);
          if (dias <= 15) return "estado-proximo-15";
          if (dias <= 30) return "estado-proximo-30";
      }
      
      switch(estado) {
          case "vigente": return "estado-vigente";
          case "vencido": return "estado-vencido";
          case "pendiente-inspeccion": return "estado-pendiente-inspeccion";
          default: return "";
      }
  }

  // Función para obtener la clase CSS para la fila según el estado
  function obtenerClaseFila(estado) {
      if (estado.startsWith("proximo-")) {
          const dias = parseInt(estado.split("-")[1]);
          if (dias <= 15) return "fila-proximo-15";
          if (dias <= 30) return "fila-proximo-30";
      }
      
      switch(estado) {
          case "vigente": return "fila-vigente";
          case "vencido": return "fila-vencido";
          case "pendiente-inspeccion": return "fila-pendiente-inspeccion";
          default: return "";
      }
  }

  // Función para obtener la clase CSS para la columna de vencimiento
  function obtenerClaseVencimiento(estado) {
      if (estado.startsWith("proximo-")) {
          const dias = parseInt(estado.split("-")[1]);
          if (dias <= 15) return "vencimiento-proximo-15";
          if (dias <= 30) return "vencimiento-proximo-30";
      }
      
      switch(estado) {
          case "vigente": return "vencimiento-vigente";
          case "vencido": return "vencimiento-vencido";
          default: return "";
      }
  }

  // Función para agrupar estados en los filtros
  function agruparEstadoParaFiltro(estado) {
      if (estado.startsWith("proximo-")) {
          const dias = parseInt(estado.split("-")[1]);
          if (dias <= 15) return "proximo-15";
          if (dias <= 30) return "proximo-30";
      }
      return estado;
  }

  // Actualizar rubros al cambiar categoría
  document.getElementById('filtro-categoria').addEventListener('change', (e) => {
    const categoriaSeleccionada = e.target.value;
    const rubroSelect = document.getElementById('filtro-rubro');

    // Limpiar opciones anteriores
    rubroSelect.innerHTML = '<option value="">Todos</option>';

    // Cargar rubros correspondientes
    const rubros = categoriasRubros[categoriaSeleccionada] || [];
    rubros.forEach(rubro => {
      const opcion = document.createElement('option');
      opcion.value = rubro;
      opcion.textContent = rubro;
      rubroSelect.appendChild(opcion);
    });
  });

  // Cargar comercios desde la API con paginación
  async function fetchComercios(pagina = 1, filtros = {}) {
    const { estado, categoria, rubro, busqueda } = filtros;
    const params = new URLSearchParams({
      pagina,
      porPagina: registrosPorPagina,
      ...(estado && { estado }),
      ...(categoria && { categoria }),
      ...(rubro && { rubro }),
      ...(busqueda && { busqueda })
    });

    try {
      const response = await fetch(`/api/comercios?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return { data: [], total: 0 };
    }
  }

  // Cargar TODOS los comercios sin paginación para filtros
  async function fetchTodosComercios() {
    try {
      const response = await fetch(`/api/comercios?porPagina=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return { data: [], total: 0 };
    }
  }

  // Función para obtener los datos paginados del array filtrado
  function obtenerDatosPaginados() {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    return comercios.slice(inicio, fin);
  }

  // Renderizar tabla
  function renderizarTabla() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '';

    // Obtener datos para la página actual
    const datosPaginados = usandoFiltros ? obtenerDatosPaginados() : comercios;

    datosPaginados.forEach(comercio => {
      const estado = determinarEstado(comercio.fecha_vencimiento, comercio.pendiente_inspeccion, comercio.categoria);
      const claseFila = obtenerClaseFila(estado);
      const claseEstado = obtenerClaseEstado(estado);
      const textoEstado = obtenerTextoEstado(estado);

      const fila = document.createElement('tr');
      if (claseFila) fila.classList.add(claseFila);
      
      fila.innerHTML = `
        <td>${comercio.nombre_comercial}</td>
        <td>${comercio.titular}</td>
        <td>${comercio.dni || '-'}</td>
        <td>${comercio.categoria}</td>
        <td>${comercio.rubro}</td>
        <td><span class="${claseEstado}">${textoEstado}</span></td>
        <td>
          <div class="acciones">
            <button class="btn-accion btn-ver" data-id="${comercio.id_comercio}">
              <i class="fas fa-eye"></i> Ver detalles
            </button>
            <button class="btn-accion btn-renovar" data-id="${comercio.id_comercio}">
              <i class="fas fa-sync"></i> Renovar
            </button>
          </div>
        </td>
      `;
      cuerpoTabla.appendChild(fila);
    });

    // Configurar evento para botones VER
    document.querySelectorAll('.btn-ver').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.location.href = `comercio.html?id=${id}`;
      });
    });

    // Configurar evento para botones RENOVAR (solo para roles permitidos)
    const tokenData = checkAuth();
    const rol = tokenData?.rol?.toLowerCase?.() || '';
    const puedeRenovar = rol === 'administrador' || rol === 'administrativo';

    document.querySelectorAll('.btn-renovar').forEach(btn => {
      if (!puedeRenovar) {
        btn.style.display = 'none';
        return;
      }
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.location.href = `renovacion-comercios.html?id=${id}`;
      });
    });

    actualizarPaginacion();
  }

  // Actualizar controles de paginación
  function actualizarPaginacion() {
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    document.getElementById('info-pagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('btn-anterior').disabled = paginaActual <= 1;
    document.getElementById('btn-siguiente').disabled = paginaActual >= totalPaginas;
  }

  // Aplicar filtros
  async function aplicarFiltros() {
    const estadoFiltro = document.getElementById('filtro-estado').value;
    const categoriaFiltro = document.getElementById('filtro-categoria').value;
    const rubroFiltro = document.getElementById('filtro-rubro').value;
    const busquedaFiltro = document.getElementById('filtro-busqueda').value.toLowerCase();

    // Si no hay filtros activos, volver al modo normal
    if (!estadoFiltro && !categoriaFiltro && !rubroFiltro && !busquedaFiltro) {
      await cargarDatosIniciales();
      return;
    }

    // Cargar todos los datos para filtrar en frontend
    const response = await fetchTodosComercios();
    let comerciosFiltrados = response.data;

    // Aplicar filtros en el frontend
    if (estadoFiltro) {
      comerciosFiltrados = comerciosFiltrados.filter(comercio => {
        const estado = determinarEstado(comercio.fecha_vencimiento, comercio.pendiente_inspeccion, comercio.categoria);
        const estadoAgrupado = agruparEstadoParaFiltro(estado);
        return estadoAgrupado === estadoFiltro;
      });
    }

    if (categoriaFiltro) {
      comerciosFiltrados = comerciosFiltrados.filter(comercio => 
        comercio.categoria === categoriaFiltro
      );
    }

    if (rubroFiltro) {
      comerciosFiltrados = comerciosFiltrados.filter(comercio => 
        comercio.rubro === rubroFiltro
      );
    }

    if (busquedaFiltro) {
      comerciosFiltrados = comerciosFiltrados.filter(comercio => 
        comercio.nombre_comercial.toLowerCase().includes(busquedaFiltro) ||
        comercio.titular.toLowerCase().includes(busquedaFiltro)
      );
    }

    comercios = comerciosFiltrados;
    totalRegistros = comerciosFiltrados.length;
    paginaActual = 1;
    usandoFiltros = true;
    renderizarTabla();
  }

  // Función para cargar datos iniciales con paginación
  async function cargarDatosIniciales() {
    const response = await fetchComercios(1, {});
    comercios = response.data;
    totalRegistros = response.total;
    paginaActual = 1;
    usandoFiltros = false;
    renderizarTabla();
  }

  // Resetear filtros
  async function resetearFiltros() {
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-rubro').value = '';
    document.getElementById('filtro-busqueda').value = '';
    
    // Limpiar y resetear el select de rubros
    const rubroSelect = document.getElementById('filtro-rubro');
    rubroSelect.innerHTML = '<option value="">Todos</option>';
    
    // Volver a cargar los datos iniciales
    await cargarDatosIniciales();
  }

  // Event Listeners para paginación
  document.getElementById('btn-anterior').addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      
      if (usandoFiltros) {
        // Paginación local con datos ya filtrados
        renderizarTabla();
      } else {
        // Paginación del servidor
        fetchComercios(paginaActual, {}).then(response => {
          comercios = response.data;
          totalRegistros = response.total;
          renderizarTabla();
        });
      }
    }
  });

  document.getElementById('btn-siguiente').addEventListener('click', () => {
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      
      if (usandoFiltros) {
        // Paginación local con datos ya filtrados
        renderizarTabla();
      } else {
        // Paginación del servidor
        fetchComercios(paginaActual, {}).then(response => {
          comercios = response.data;
          totalRegistros = response.total;
          renderizarTabla();
        });
      }
    }
  });

  document.getElementById('btn-buscar').addEventListener('click', aplicarFiltros);
  document.getElementById('btn-reset').addEventListener('click', resetearFiltros);

  // Inicializar
  await cargarDatosIniciales();
});