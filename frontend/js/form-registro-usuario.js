import { checkAuth, infoUsuario } from '../auth.js';    


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idEmpleado = urlParams.get('id'); // <- DEFINILA ACÁ


    const userData = checkAuth(); 
    if (!userData) return;

    infoUsuario(userData);
    

    function cerrarSesion() {
      localStorage.removeItem('token');
      window.location.href = "login.html";}

      document.querySelector('.logout-btn').addEventListener('click', cerrarSesion);


    // Elementos del formulario
    const formRegistro = document.getElementById('formRegistro');

    // Función para validar DNI
    function validarDNI(dni) {
        const regex = /^\d{7,8}$/;
        return regex.test(dni);
    }

    // Función para validar teléfono
    function validarTelefono(telefono) {
        const regex = /^\d{10,15}$/;
        return regex.test(telefono);
    }

    // Función para validar contraseña
    function validarContrasena(contrasena) {
        return contrasena.length >= 8;
    }

    // Función para validar que las contraseñas coincidan
    function contrasenasCoinciden(contrasena, confirmacion) {
        return contrasena === confirmacion;
    }

    // Función para validar email
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Función para mostrar errores
    function mostrarError(elemento, mensaje) {
        // Eliminar mensajes de error previos
        const errorExistente = elemento.nextElementSibling;
        if (errorExistente && errorExistente.classList.contains('error-mensaje')) {
            errorExistente.remove();
        }

        // Crear y mostrar nuevo mensaje de error
        const error = document.createElement('div');
        error.className = 'error-mensaje';
        error.textContent = mensaje;
        elemento.insertAdjacentElement('afterend', error);
        elemento.classList.add('input-error');
    }

    // Función para limpiar errores
    function limpiarError(elemento) {
        const error = elemento.nextElementSibling;
        if (error && error.classList.contains('error-mensaje')) {
            error.remove();
        }
        elemento.classList.remove('input-error');
    }



    document.getElementById('telefono').addEventListener('blur', function() {
        if (!validarTelefono(this.value)) {
            mostrarError(this, 'El teléfono debe tener entre 10 y 15 dígitos');
        } else {
            limpiarError(this);
        }
    });

    document.getElementById('correo').addEventListener('blur', function() {
        if (!validarEmail(this.value)) {
            mostrarError(this, 'Ingrese un correo electrónico válido');
        } else {
            limpiarError(this);
        }
    });

    document.getElementById('contraseña').addEventListener('blur', function() {
        if (!validarContrasena(this.value)) {
            mostrarError(this, 'La contraseña debe tener al menos 8 caracteres');
        } else {
            limpiarError(this);
        }
    });

    document.getElementById('confirmarC').addEventListener('blur', function() {
        const contrasena = document.getElementById('contraseña').value;
        if (!contrasenasCoinciden(contrasena, this.value)) {
            mostrarError(this, 'Las contraseñas no coinciden');
        } else {
            limpiarError(this);
        }
    });

    // Validación en tiempo real del DNI (verifica disponibilidad en backend)
document.getElementById('DNI').addEventListener('blur', async function() {
  const dni = this.value.trim();
  const idEmpleado = new URLSearchParams(window.location.search).get('id'); // Para edición

  // Validación local del formato
  if (!/^\d{7,8}$/.test(dni)) {
    mostrarError(this, 'El DNI debe tener 7 u 8 dígitos');
    return;
  }

  try {
    // Llamada al backend incluyendo idExcluido si estamos editando
    const url = `/api/auth/verificar-dni?dni=${encodeURIComponent(dni)}${idEmpleado ? `&idExcluido=${idEmpleado}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error('Error en la respuesta del servidor');

    const { disponible } = await response.json();

    if (!disponible) {
      mostrarError(this, 'Este DNI ya está registrado');
    } else {
      limpiarError(this);
    }
  } catch (error) {
    console.error('Error al validar DNI:', error);
    mostrarError(this, 'No se pudo verificar el DNI. Intente nuevamente.');
  }
});

// Función para cargar datos del empleado a editar
console.log('ID empleado a editar:', idEmpleado);


async function cargarDatosEmpleado(idEmpleado) {
  try {
    const response = await fetch(`/api/auth/${idEmpleado}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar datos del empleado');
    }
    
    const empleado = await response.json();
    
    // Llenar el formulario con los datos
    document.getElementById('nombre').value = empleado.nombre;
    document.getElementById('apellido').value = empleado.apellido;
    document.getElementById('DNI').value = empleado.dni;
    document.getElementById('domicilio').value = empleado.domicilio;
    document.getElementById('telefono').value = empleado.telefono;
    document.getElementById('area').value = empleado.area;
    document.getElementById('correo').value = empleado.correo_electronico;
    document.getElementById('rol').value = empleado.rol;
    

        // Remover atributo required de los campos de contraseña en modo edición
    document.getElementById('contraseña').removeAttribute('required');
    document.getElementById('confirmarC').removeAttribute('required');
    
    // Agregar texto indicativo
    const labelContraseña = document.querySelector('label[for="contraseña"]');
    labelContraseña.innerHTML += ' <span style="color: #666; font-weight: normal;">(dejar en blanco para mantener la actual)</span>';
    

    // Cambiar el texto del botón
    const botonSubmit = document.querySelector('.boton-alta');
    botonSubmit.innerHTML = '<i class="fas fa-user-edit"></i> Actualizar empleado';
    
    // Agregar ID oculto al formulario
    const inputOculto = document.createElement('input');
    inputOculto.type = 'hidden';
    inputOculto.name = 'id_empleado';
    inputOculto.value = idEmpleado;
    formRegistro.appendChild(inputOculto);
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar datos del empleado');
  }
}



// Modificar el evento submit del formulario
formRegistro.addEventListener('submit', async function(e) {
    e.preventDefault();
    let formularioValido = true;

    // Validaciones previas (mantener las existentes)
    
    if (formularioValido) {
        const formData = new FormData(formRegistro);
        const idEmpleado = formData.get('id_empleado');
        const url = idEmpleado ? `/api/auth/actualizar/${idEmpleado}` : '/api/auth/registrar';
        const method = idEmpleado ? 'PUT' : 'POST';

        // Preparar datos para enviar
        const datos = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            dni: formData.get('DNI'),
            domicilio: formData.get('domicilio'),
            telefono: formData.get('telefono'),
            area: formData.get('area'),
            correo_electronico: formData.get('correo'),
            rol: formData.get('rol')
        };

        // Solo incluir contraseña si se proporcionó una nueva
        const nuevaContraseña = formData.get('contraseña');
        console.log('Nueva contraseña:', nuevaContraseña); // DEBUG
        if (nuevaContraseña && nuevaContraseña.trim() !== '') {
            datos.contrasena = nuevaContraseña;
        }

        console.log('Datos a enviar:', datos); // DEBUG


        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(datos)

            });


            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText); // DEBUG
                throw new Error(errorText);
            }

              const result = await response.json();
            console.log('Respuesta del servidor:', result); // DEBUG


            alert(idEmpleado ? 'Empleado actualizado con éxito' : 'Usuario registrado con éxito');
            window.location.href = '../pages/panel-principal.html';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud: ' + error.message);
        }
    }
});

// Verificar si estamos en modo edición (URL tiene parámetro id)

if (idEmpleado) {
    cargarDatosEmpleado(idEmpleado);
}

});