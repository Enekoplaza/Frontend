<script setup>
import { apiFetch } from '@/services/apiFetch'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'

const { t } = useI18n()

const props = defineProps({ mostrar: Boolean })
const emit = defineEmits(['cerrar', 'logeado'])

const esLogin = ref(true)

// ✅ FORM ACTUALIZADO
const form = ref({
  nombre: '',
  dni: '',
  email: '',
  password: '',
  calle: '',
  numero: '',
  piso: '',
  cp: '',
  ciudad: '',
  direccion: '',
  rol: 'socio',
})

// --- COMPUTED ---
const palabrasNombre = computed(() => {
  return form.value.nombre.trim().split(/\s+/).filter((p) => p.length > 0).length
})

const dniValido = computed(() => {
  const letrasValidas = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const dniUpper = form.value.dni.trim().toUpperCase()
  const regex = /^[0-9]{8}[A-Z]$/
  if (!regex.test(dniUpper)) return false
  const numero = parseInt(dniUpper.substring(0, 8))
  const letra = dniUpper.charAt(8)
  return letrasValidas[numero % 23] === letra
})

const swalDarkConfig = {
  background: '#1e293b',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8',
}

// --- RESET ---
const resetForm = () => {
  form.value = {
    nombre: '',
    dni: '',
    email: '',
    password: '',
    calle: '',
    numero: '',
    piso: '',
    cp: '',
    ciudad: '',
    direccion: '',
    rol: 'socio',
  }
  esLogin.value = true
}

const cerrarModal = () => {
  resetForm()
  emit('cerrar')
}

// --- SUBMIT ---
const handleSubmit = async () => {
  if (!esLogin.value) {
    // ✅ NOMBRE
    if (palabrasNombre.value < 3) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'warning',
        title: 'Nombre incompleto',
        text: 'Debes introducir nombre y dos apellidos',
      })
      return
    }

    // ✅ DNI
    if (!dniValido.value) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'warning',
        title: 'DNI incorrecto',
        text: 'Ejemplo válido: 12345678Z',
      })
      return
    }

    // ✅ EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'warning',
        title: t('auth.err_email_tit'),
        text: t('auth.err_email_msg'),
      })
      return
    }

    // ✅ PASSWORD
    if (form.value.password.length < 5) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'warning',
        title: t('auth.err_pass_tit'),
        text: t('auth.err_pass_msg'),
      })
      return
    }

    // ✅ DIRECCIÓN VALIDACIONES
    if (!form.value.calle.trim()) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'warning',
        title: 'Calle requerida',
        text: 'Introduce una calle válida',
      })
      return
    }

    if (!form.value.numero.trim()) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'warning',
        title: 'Número requerido',
        text: 'Introduce el número de la vivienda',
      })
      return
    }

    if (!/^\d{5}$/.test(form.value.cp)) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'warning',
        title: 'Código postal incorrecto',
        text: 'Debe tener 5 números',
      })
      return
    }

    if (!form.value.ciudad.trim()) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'warning',
        title: 'Ciudad requerida',
        text: 'Introduce una ciudad',
      })
      return
    }

    // ✅ CONSTRUIR DIRECCIÓN FINAL
    form.value.direccion = `${form.value.calle}, ${form.value.numero}${
      form.value.piso ? ', ' + form.value.piso : ''
    }, ${form.value.cp} ${form.value.ciudad}`
  }

  const endpoint = esLogin.value ? 'login_api.php' : 'registro_api.php'

  try {
    const data = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(form.value),
    })

    if (data.success) {
      if (esLogin.value) {
        Swal.fire({
          ...swalDarkConfig,
          icon: 'success',
          title: t('auth.ok_login_tit'),
          text: `${t('auth.ok_login_msg')}, ${data.user.nombre}`,
          timer: 2000,
          showConfirmButton: false,
        })

        emit('logeado')
        resetForm()
      } else {
        Swal.fire({
          ...swalDarkConfig,
          icon: 'success',
          title: t('auth.ok_reg_tit'),
          text: t('auth.ok_reg_msg'),
        })

        esLogin.value = true
        form.value.password = ''
      }
    } else {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'error',
        title: t('auth.err_oops'),
        text: data.message,
      })
    }
  } catch (error) {
    Swal.fire({
      ...swalDarkConfig,
      icon: 'error',
      title: t('auth.err_server_tit'),
      text: t('auth.err_server_msg'),
    })
  }
}
</script>
<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-content">
      <button class="btn-close" @click="cerrarModal">X</button>

      <h2>{{ esLogin ? $t('auth.login_title') : $t('auth.register_title') }}</h2>

      <form @submit.prevent="handleSubmit">
        <template v-if="!esLogin">
          <!-- NOMBRE: mínimo 3 palabras -->
          <input
            v-model="form.nombre"
            type="text"
            :placeholder="$t('auth.ph_nombre') + ' y dos apellidos'"
            :class="{
              'input-error': form.nombre && palabrasNombre < 3,
              'input-ok': palabrasNombre >= 3,
            }"
            required
          />
          <p v-if="form.nombre && palabrasNombre < 3" class="msg-error">
            Escribe tu nombre y los dos apellidos
          </p>

          <!-- DNI: formato y letra válidos -->
          <input
            v-model="form.dni"
            type="text"
            :placeholder="$t('auth.ph_dni') + ' (Ej: 12345678Z)'"
            maxlength="9"
            :class="{ 'input-error': form.dni && !dniValido, 'input-ok': form.dni && dniValido }"
            required
          />
          <p v-if="form.dni && !dniValido" class="msg-error">
            DNI incorrecto. Debe tener 8 números y la letra correcta
          </p>

          <div class="direccion-grid">
            <input v-model="form.calle" type="text" placeholder="Calle / Avenida" required />
            <input v-model="form.numero" type="text" placeholder="Nº" required />
            <input v-model="form.piso" type="text" placeholder="Piso (ej: 3ºB)" />
            <input
              v-model="form.cp"
              type="text"
              placeholder="Código Postal"
              maxlength="5"
              required
            />
            <input v-model="form.ciudad" type="text" placeholder="Ciudad" required />
          </div>
        </template>

        <input v-model="form.email" type="email" :placeholder="$t('auth.ph_email')" required />
        <input v-model="form.password" type="password" :placeholder="$t('auth.ph_pass')" required />

        <button type="submit" class="btn-submit">
          {{ esLogin ? $t('auth.btn_entrar') : $t('auth.btn_registrar') }}
        </button>
      </form>

      <p @click="esLogin = !esLogin" class="toggle-auth">
        {{ esLogin ? $t('auth.toggle_to_reg') : $t('auth.toggle_to_login') }}
      </p>
    </div>
  </div>
</template>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 15px;
  /* mejora en móvil */
}

.modal-content {
  background: #1e293b;
  color: white;
  padding: 40px;
  border-radius: 16px;
  width: 95%;
  max-width: 420px;
  position: relative;

  /* mejora UX */
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.btn-close {
  position: absolute;
  top: 15px;
  right: 15px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
}

/* FORM */
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input,
select {
  background: #0f172a;
  color: white;
  padding: 10px;
  border: 1px solid #334155;
  border-radius: 8px;
  font-size: 14px;
}

.btn-submit {
  background: #38bdf8;
  color: #0f172a;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-submit:hover {
  filter: brightness(1.1);
}

.toggle-auth {
  color: #94a3b8;
  text-align: center;
  cursor: pointer;
  margin-top: 20px;
  text-decoration: underline;
}
.input-error {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.05);
}

.input-ok {
  border-color: #10b981 !important;
  background: rgba(16, 185, 129, 0.05);
}

.msg-error {
  color: #ef4444;
  font-size: 0.78rem;
  margin: -8px 0 8px 4px;
  text-align: left;
}

/* =========================================
   📱 TABLET
   ========================================= */
@media (max-width: 1024px) {
  .modal-content {
    max-width: 380px;
    padding: 35px;
  }
}

/* =========================================
   📱 MÓVIL
   ========================================= */
@media (max-width: 768px) {
  .modal-content {
    width: 100%;
    max-width: 100%;
    border-radius: 14px;
    padding: 30px 20px;
  }

  input,
  select {
    padding: 12px;
    font-size: 15px;
  }

  .btn-submit {
    padding: 14px;
    font-size: 15px;
  }
}

/* =========================================
   📱 MÓVIL PEQUEÑO
   ========================================= */
@media (max-width: 480px) {
  .modal-content {
    padding: 25px 15px;
    border-radius: 12px;
  }

  form {
    gap: 12px;
  }

  input,
  select {
    font-size: 14px;
    padding: 11px;
  }

  .toggle-auth {
    font-size: 14px;
  }
}
</style>