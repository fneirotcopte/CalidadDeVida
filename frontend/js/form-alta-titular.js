//import { checkAuth, infoUsuario } from '../auth.js';
console.log("✅ form-alta-titular.js cargado");


document.addEventListener('DOMContentLoaded', () => {

  // Manejar cambio de tipo de titular
  const tipoTitularSelect = document.getElementById('tipoTitular');
  const grupoCuit = document.getElementById('grupoCuit');
  const grupoRazonSocial = document.getElementById('grupoRazonSocial');
  const grupoDni = document.getElementById('dni').closest('.col-md-6');

  const foodTruckOption = document.getElementById('foodTruckOption');
  const certConductaField = document.getElementById('certConductaField');
  const habilitaFoodTruck = document.getElementById('habilitaFoodTruck');

  // Ocultar específicos al inicio
  grupoCuit.style.display = 'none';
  grupoRazonSocial.style.display = 'none';
  grupoDni.style.display = 'none';
  foodTruckOption.style.display = 'none';
  certConductaField.style.display = 'none';

  tipoTitularSelect.addEventListener('change', (e) => {

    // 👇 Restaurar labels por si venimos de Persona Jurídica
    const labelsOriginales = {
      dni_frente: 'DNI Frente *',
      dni_dorso: 'DNI Dorso *',
      cert_residencia: 'Certificado de Residencia *',
      cert_salud: 'Certificado de Buena Salud *',
      cert_conducta: 'Certificado de Buena Conducta *'
    };
    Object.entries(labelsOriginales).forEach(([id, texto]) => {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) label.textContent = texto;
    });

    // 👇 Limpiar todos los campos al cambiar de tipo de titular
    const form = document.getElementById('formularioTitular');
    if (form) {
      // Guardar el valor del tipo de titular seleccionado
      const tipoSeleccionado = e.target.value;

      // Reiniciar el formulario completo
      form.reset();

      // Volver a seleccionar el tipo que el usuario eligió
      document.getElementById('tipoTitular').value = tipoSeleccionado;

      // Asegurar que los radios de persona jurídica vuelvan a "No" por defecto
      const juridicaNo = document.getElementById('juridicaNo');
      if (juridicaNo) juridicaNo.checked = true;
    }

    // 👇 Eliminar miniaturas o vistas previas de documentos
    document.querySelectorAll('.file-thumb-wrapper').forEach(wrapper => wrapper.remove());

    // Ocultar los contenedores de información de archivo
    document.querySelectorAll('.file-info').forEach(info => {
      info.classList.add('d-none');
      const nameSpan = info.querySelector('.file-name');
      if (nameSpan) nameSpan.textContent = '';
    });

    // Vaciar todos los inputs de tipo file
    document.querySelectorAll('input[type="file"]').forEach(input => {
      input.value = '';
    });

    if (e.target.value === 'ambulante') {
      grupoCuit.style.display = 'none';
      grupoRazonSocial.style.display = 'none';
      grupoDni.style.display = 'block'; // mostrar DNI

      // limpiar valores de comercio
      const cuitInput = document.querySelector('input[name="cuit"]');
      const razonInput = document.querySelector('input[name="razon_social"]');
      if (cuitInput) cuitInput.value = '';
      if (razonInput) razonInput.value = '';
      document.querySelector('input[name="dni"]').value = '';

      // ocultar opción food truck
      foodTruckOption.style.display = 'none';
      certConductaField.style.display = 'none';
      habilitaFoodTruck.checked = false;

      document.getElementById('juridicaNo').checked = true; // resetear a Persona Física

      // 👉 ocultar bloques de empresa y representante si estaban visibles
      document.getElementById('bloqueEmpresa').style.display = 'none';
      document.getElementById('bloqueRepresentante').style.display = 'none';
      document.getElementById('bloquePersonaFisica').style.display = 'block';

      // 👇 Revertir obligatoriedad al volver desde transporte
      document.getElementById('carnet_frente')?.removeAttribute('required');
      document.getElementById('carnet_dorso')?.removeAttribute('required');
      document.getElementById('cert_salud')?.setAttribute('required', 'true');


      // 👇 Mostrar salud y ocultar carnet si venimos de transporte
      const carnetFrenteField = document.getElementById('carnet_frente')?.closest('.col-md-6');
      const carnetDorsoField = document.getElementById('carnet_dorso')?.closest('.col-md-6');
      const saludField = document.getElementById('cert_salud')?.closest('.col-md-6');

      if (carnetFrenteField) carnetFrenteField.style.display = 'none';
      if (carnetDorsoField) carnetDorsoField.style.display = 'none';
      if (saludField) saludField.style.display = 'block';

      document.getElementById('carnet_frente')?.removeAttribute('required');
      document.getElementById('carnet_dorso')?.removeAttribute('required');
      // 🧹 Quitar required de CUIT y Razón Social al salir de comercio
      document.getElementById('cuit')?.removeAttribute('required');
      document.getElementById('razon_social')?.removeAttribute('required');

    } else if (e.target.value === 'transporte') {
      // Igual que ambulante
      grupoCuit.style.display = 'none';
      grupoRazonSocial.style.display = 'none';
      grupoDni.style.display = 'block'; // mostrar DNI

      // limpiar valores de comercio
      const cuitInput = document.querySelector('input[name="cuit"]');
      const razonInput = document.querySelector('input[name="razon_social"]');
      if (cuitInput) cuitInput.value = '';
      if (razonInput) razonInput.value = '';
      document.querySelector('input[name="dni"]').value = '';

      // ocultar opción food truck
      foodTruckOption.style.display = 'none';
      certConductaField.style.display = 'none';
      habilitaFoodTruck.checked = false;

      document.getElementById('juridicaNo').checked = true; // resetear a Persona Física

      // ocultar empresa/representante, mostrar persona física
      document.getElementById('bloqueEmpresa').style.display = 'none';
      document.getElementById('bloqueRepresentante').style.display = 'none';
      document.getElementById('bloquePersonaFisica').style.display = 'block';

      // 👇 Mostrar/Ocultar campos de documentación
      const carnetFrenteField = document.getElementById('carnet_frente')?.closest('.col-md-6');
      const carnetDorsoField = document.getElementById('carnet_dorso')?.closest('.col-md-6');
      const saludField = document.getElementById('cert_salud')?.closest('.col-md-6');
      const conductaField = document.getElementById('certConductaField');

      // Mostrar carnet frente/dorso y ocultar salud/conducta
      if (carnetFrenteField) carnetFrenteField.style.display = 'block';
      if (carnetDorsoField) carnetDorsoField.style.display = 'block';
      if (saludField) saludField.style.display = 'none';
      if (conductaField) conductaField.style.display = 'none';

      // Ajustar obligatoriedad
      document.getElementById('cert_salud')?.removeAttribute('required');
      document.getElementById('carnet_frente')?.setAttribute('required', 'true');
      document.getElementById('carnet_dorso')?.setAttribute('required', 'true');
      // 🧹 Quitar required de CUIT y Razón Social al salir de comercio
      document.getElementById('cuit')?.removeAttribute('required');
      document.getElementById('razon_social')?.removeAttribute('required');

    } else if (e.target.value === 'comercio') {
      grupoCuit.style.display = 'block';
      grupoRazonSocial.style.display = 'block';
      grupoDni.style.display = 'block'; // mostrar DNI también en comercio
      document.querySelector('input[name="dni"]').value = '';

      // ⚙️ Marcar CUIT y Razón Social como requeridos solo en comercio
      const cuitInput = document.getElementById('cuit');
      const razonInput = document.getElementById('razon_social');
      if (cuitInput) cuitInput.setAttribute('required', 'true');
      if (razonInput) razonInput.setAttribute('required', 'true');

      // mostrar opción food truck
      foodTruckOption.style.display = 'block';

      // Ocultar carnet frente/dorso en comercio
      const carnetFrenteField = document.getElementById('carnet_frente')?.closest('.col-md-6');
      const carnetDorsoField = document.getElementById('carnet_dorso')?.closest('.col-md-6');

      // ocultar ambos carnets
      if (carnetFrenteField) carnetFrenteField.style.display = 'none';
      if (carnetDorsoField) carnetDorsoField.style.display = 'none';

      // asegurar que salud esté visible
      const saludField = document.getElementById('cert_salud')?.closest('.col-md-6');
      if (saludField) saludField.style.display = 'block';

      // ajustar obligatoriedad
      document.getElementById('carnet_frente')?.removeAttribute('required');
      document.getElementById('carnet_dorso')?.removeAttribute('required');
      document.getElementById('cert_salud')?.setAttribute('required', 'true');


    } else {
      grupoCuit.style.display = 'block';
      grupoRazonSocial.style.display = 'block';
      grupoDni.style.display = 'block';

      // ocultar opción food truck
      foodTruckOption.style.display = 'none';
      certConductaField.style.display = 'none';
      habilitaFoodTruck.checked = false;
    }

  });

  // Mostrar/ocultar certificado según el checkbox
  habilitaFoodTruck.addEventListener('change', (e) => {
    if (e.target.checked) {
      certConductaField.style.display = 'block';
      document.getElementById('cert_conducta').setAttribute('required', 'true');
    } else {
      certConductaField.style.display = 'none';
      document.getElementById('cert_conducta').removeAttribute('required');
    }
  });

  // Enviar formulario
  document.getElementById('formularioTitular').addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("📌 submit disparado: alta de titular");

    // 📌 Normalizar datos antes de enviar
    const normalizarDatos = (data) => {
      const capitalizar = (texto) => {
        let valor = texto.trim();
        return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
      };

      if (data.nombre) data.nombre = capitalizar(data.nombre);
      if (data.apellido) data.apellido = capitalizar(data.apellido);
      if (data.razon_social) data.razon_social = capitalizar(data.razon_social);

      if (data.dni) data.dni = data.dni.replace(/\D/g, '');

      if (data.cuit) {
        let cuitNumeros = data.cuit.replace(/\D/g, '');
        if (cuitNumeros.length === 11) {
          data.cuit = `${cuitNumeros.slice(0, 2)}-${cuitNumeros.slice(2, 10)}-${cuitNumeros.slice(10)}`;
        } else {
          data.cuit = cuitNumeros;
        }
      }

      if (data.cod_area && data.telefono) {
        let codArea = data.cod_area.replace(/\D/g, '');
        let telefono = data.telefono.replace(/\D/g, '');
        data.telefono = `${codArea}-${telefono}`;
      }

      return data;
    };

    const formData = new FormData(e.target);
    const tipoTitular = document.getElementById('tipoTitular').value;

    // 👉 Validar campos según tipo de titular
    if (tipoTitular === 'comercio') {
      const esPersonaJuridica = document.getElementById('juridicaSi')?.checked;

      if (esPersonaJuridica) {
        // Copiar empresa a los campos base
        formData.set('cuit', document.getElementById('cuit_empresa')?.value.trim());
        formData.set('razon_social', document.getElementById('razon_social_empresa')?.value.trim());
      }

      if (!formData.get('cuit') || !formData.get('razon_social')) {
        alert('Para titulares de comercio, CUIT y Razón Social son requeridos');
        return;
      }
    }

    // 👉 Unificar teléfono según tipo de titular
    let telefonoFinal = '';
    const esPersonaJuridica = document.getElementById('juridicaSi')?.checked;

    if (esPersonaJuridica) {
      // usar teléfono del representante
      const codAreaRep = document.getElementById('cod_area_representante')?.value.trim();
      const numeroRep = document.getElementById('telefono_representante')?.value.trim();
      telefonoFinal = codAreaRep && numeroRep ? `${codAreaRep}-${numeroRep}` : '';
    } else {
      // usar teléfono del titular (físico o ambulante)
      const codArea = document.getElementById('cod_area')?.value.trim();
      const numero = document.getElementById('telefono')?.value.trim();
      telefonoFinal = codArea && numero ? `${codArea}-${numero}` : '';
    }

    formData.set('telefono', telefonoFinal);

    // 👉 Mapear campos según tipo de titular
    if (esPersonaJuridica) {
      // empresa
      formData.set('cuit', document.getElementById('cuit_empresa')?.value.trim());
      formData.set('razon_social', document.getElementById('razon_social_empresa')?.value.trim());
      formData.set('domicilio', document.getElementById('domicilio_empresa')?.value.trim());

      // representante
      formData.set('nombre', document.getElementById('nombre_representante')?.value.trim());
      formData.set('apellido', document.getElementById('apellido_representante')?.value.trim());
      formData.set('dni', document.getElementById('dni_representante')?.value.trim());
      formData.set('correo_electronico', document.getElementById('correo_representante')?.value.trim());

      // flags
      formData.set('persona_fisica', 0);
      formData.set('vinculo', 'representante');

    } else {
      // persona física o ambulante → ya se capturan los inputs normales
      formData.set('persona_fisica', 1);
      formData.set('vinculo', 'dueño');
    }

    try {
      // ✅ Siempre la misma ruta; el backend decide según "tipo_titular"
      const url = '/api/titular/registrar';

      // ✅ Normalizar datos antes de enviar
      let plainData = Object.fromEntries(formData.entries());
      plainData = normalizarDatos(plainData);

      // Reconstruir FormData con los valores normalizados
      const formDataNormalizado = new FormData();
      for (const [k, v] of Object.entries(plainData)) {
        formDataNormalizado.append(k, v);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataNormalizado
      });

      if (!response.ok) {
        const resultError = await response.json().catch(() => ({}));
        const mensaje = resultError.error || `Error al registrar titular (HTTP ${response.status})`;
        window.alert(mensaje);
        return;
      }

      const result = await response.json();
      window.alert("✅ Titular dado de alta exitosamente.");

      const tipoTitular = document.getElementById('tipoTitular').value;

      if (tipoTitular === 'transporte') {
        // 👇 Redirigir a formulario de habilitación de transporte
        window.location.href = `form-alta-transporte.html?id_titular=${result.id_titular}`;
      } else {
        // 👇 Redirigir a formulario de habilitación de comercio
        window.location.href = `alta-comercio.html?id_titular=${result.id_titular}`;
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar: ' + error.message);
    }
  });

});

// -------------------------------
// 🚀 Previsualización de documentos (idéntico a alta-comercio)
// -------------------------------
function manejarCargaDocumento(input) {
  const file = input.files && input.files[0];
  const fileInfo = input.nextElementSibling; // <div class="file-info">
  const fileName = fileInfo?.querySelector('.file-name');

  // ===== helpers locales para el modal =====
  function ensurePreviewModal() {
    if (document.getElementById('imgPreviewModal')) return;

    // estilos mínimos (fix para botón cerrar)
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
    // 👉 centrado exacto de la “×”
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

// 🚀 Asignar la lógica a todos los inputs de documentación del titular
[
  'dni_frente',
  'dni_dorso',
  'cert_residencia',
  'carnet_frente',
  'carnet_dorso',
  'cert_salud',
  'foto_perfil',
  'cert_conducta'
].forEach(id => {
  const input = document.getElementById(id);
  if (input) input.addEventListener('change', function () {
    manejarCargaDocumento(this);
  });

  // -------------------------------
  // 🚀 Normalización de CUIT, DNI, Teléfono y Textos
  // -------------------------------

  // 👉 Formatear DNI: solo 8 dígitos
  ;['dni', 'dni_representante'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '');
        if (input.value.length > 8) {
          input.value = input.value.slice(0, 8);
        }
      });
    }
  });

  // 👉 Formatear CUIT: XX-XXXXXXXX-X
  ;['cuit', 'cuit_empresa'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        let valor = input.value.replace(/\D/g, ''); // solo números
        if (valor.length > 11) valor = valor.slice(0, 11);

        let formateado = '';
        if (valor.length > 0) formateado = valor.slice(0, 2);
        if (valor.length > 2) formateado += '-' + valor.slice(2, 10);
        if (valor.length > 10) formateado += '-' + valor.slice(10);

        input.value = formateado;
      });
    }
  });

  // 👉 Validación dinámica de teléfono (titular y representante)
  ;[['cod_area', 'telefono'], ['cod_area_representante', 'telefono_representante']].forEach(([idArea, idTel]) => {
    const codAreaInput = document.getElementById(idArea);
    const telInput = document.getElementById(idTel);

    if (codAreaInput && telInput) {
      codAreaInput.addEventListener('input', () => {
        codAreaInput.value = codAreaInput.value.replace(/\D/g, '');
        const len = codAreaInput.value.length;
        let maxLen = 8;
        if (len === 2) maxLen = 8;
        else if (len === 3) maxLen = 7;
        else if (len === 4) maxLen = 6;
        telInput.maxLength = maxLen;
      });

      telInput.addEventListener('input', () => {
        telInput.value = telInput.value.replace(/\D/g, '');
      });
    }
  });

  // 👉 Normalizar Nombre y Apellido (primera letra mayúscula)
  ;['nombre', 'apellido', 'nombre_representante', 'apellido_representante', 'razon_social', 'razon_social_empresa']
    .forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('blur', () => {
          let valor = input.value.trim();
          if (valor.length > 0) {
            input.value = valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
          }
        });
      }
    });

  // 👉 Normalizar Nombre y Apellido (primera letra mayúscula)
  ['nombre', 'apellido'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('blur', () => {
        let valor = input.value.trim();
        if (valor.length > 0) {
          input.value = valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
        }
      });
    }
  });

  const tipoTitular = document.getElementById('tipoTitular');
  const bloquePreguntaJuridica = document.getElementById('bloquePreguntaJuridica');

  tipoTitular.addEventListener('change', () => {
    if (tipoTitular.value === 'comercio') {
      bloquePreguntaJuridica.style.display = 'block';
    } else {
      bloquePreguntaJuridica.style.display = 'none';
      document.getElementById('juridicaNo').checked = true; // reset por defecto
    }
  });

  // 👉 Mostrar/ocultar bloques según Persona Jurídica
  const juridicaSi = document.getElementById('juridicaSi');
  const juridicaNo = document.getElementById('juridicaNo');
  const bloquePersonaFisica = document.getElementById('bloquePersonaFisica');
  const bloqueEmpresa = document.getElementById('bloqueEmpresa');
  const bloqueRepresentante = document.getElementById('bloqueRepresentante');

  // 👇 ÚNICA función para alternar vista y required dinámicos
  function actualizarVistaTitular() {

    if (juridicaSi.checked) {
      // 👉 Mostrar empresa + representante
      bloquePersonaFisica.style.display = 'none';
      bloqueEmpresa.style.display = 'block';
      bloqueRepresentante.style.display = 'block';

      // 👇 Limpiar miniaturas y archivos al cambiar tipo de persona
      document.querySelectorAll('.file-thumb-wrapper').forEach(wrapper => wrapper.remove());
      document.querySelectorAll('.file-info').forEach(info => {
        info.classList.add('d-none');
        const nameSpan = info.querySelector('.file-name');
        if (nameSpan) nameSpan.textContent = '';
      });
      document.querySelectorAll('input[type="file"]').forEach(input => {
        input.value = '';
      });

      // 👉 Quitar required de persona física
      ['nombre', 'apellido', 'dni', 'domicilio', 'cod_area', 'telefono', 'correo_electronico']
        .forEach(id => document.getElementById(id)?.removeAttribute('required'));

      // 👉 Agregar required a empresa + representante
      ['cuit_empresa', 'razon_social_empresa', 'domicilio_empresa',
        'nombre_representante', 'apellido_representante', 'dni_representante',
        'cod_area_representante', 'telefono_representante', 'correo_representante']
        .forEach(id => document.getElementById(id)?.setAttribute('required', 'true'));

      // 👇 Cambiar labels para indicar que son del representante
      const labelsDocs = {
        dni_frente: 'DNI Frente (Representante) *',
        dni_dorso: 'DNI Dorso (Representante) *',
        cert_residencia: 'Certificado de Residencia (Representante) *',
        cert_salud: 'Certificado de Buena Salud (Representante) *',
        cert_conducta: 'Certificado de Buena Conducta (Representante) *'
      };
      Object.entries(labelsDocs).forEach(([id, texto]) => {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) label.textContent = texto;
      });

    } else {
      // 👉 Mostrar persona física
      bloquePersonaFisica.style.display = 'block';
      bloqueEmpresa.style.display = 'none';
      bloqueRepresentante.style.display = 'none';

      // 👇 Limpiar miniaturas y archivos al cambiar tipo de persona
      document.querySelectorAll('.file-thumb-wrapper').forEach(wrapper => wrapper.remove());
      document.querySelectorAll('.file-info').forEach(info => {
        info.classList.add('d-none');
        const nameSpan = info.querySelector('.file-name');
        if (nameSpan) nameSpan.textContent = '';
      });
      document.querySelectorAll('input[type="file"]').forEach(input => {
        input.value = '';
      });

      // 👉 Restaurar required en persona física
      ['nombre', 'apellido', 'dni', 'domicilio', 'cod_area', 'telefono', 'correo_electronico']
        .forEach(id => document.getElementById(id)?.setAttribute('required', 'true'));

      // 👇 Restaurar labels originales
      const labelsOriginales = {
        dni_frente: 'DNI Frente *',
        dni_dorso: 'DNI Dorso *',
        cert_residencia: 'Certificado de Residencia *',
        cert_salud: 'Certificado de Buena Salud *',
        cert_conducta: 'Certificado de Buena Conducta *'
      };
      Object.entries(labelsOriginales).forEach(([id, texto]) => {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) label.textContent = texto;
      });


      // 👉 Quitar required en empresa + representante
      ['cuit_empresa', 'razon_social_empresa', 'domicilio_empresa',
        'nombre_representante', 'apellido_representante', 'dni_representante',
        'cod_area_representante', 'telefono_representante', 'correo_representante']
        .forEach(id => document.getElementById(id)?.removeAttribute('required'));
    }
  }

  // 👇 sincronizar siempre los bloques de Persona Física / Jurídica
  actualizarVistaTitular();

  // Eventos para los radios
  juridicaSi.addEventListener('change', actualizarVistaTitular);
  juridicaNo.addEventListener('change', actualizarVistaTitular);

  // Inicializar vista
  actualizarVistaTitular();

});

// =======================================================
// 🚀 Validación global con scroll al primer campo inválido
// =======================================================
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


