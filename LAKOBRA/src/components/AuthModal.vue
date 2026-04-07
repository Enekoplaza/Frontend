<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n'; // <-- 1. Importamos la librería

const { t } = useI18n(); // <-- 2. Usamos 't' para las alertas de JS

const props = defineProps({ mostrar: Boolean });
const emit = defineEmits(['cerrar', 'logeado']);

const esLogin = ref(true);

const form = ref({
  nombre: '', dni: '', email: '', password: '', direccion: '', rol: 'socio'
});

const swalDarkConfig = { background: '#1e293b', color: '#f8fafc', confirmButtonColor: '#38bdf8' };

const handleSubmit = async () => {
  if (!esLogin.value) {
    if (form.value.nombre.trim().length < 3) {
      Swal.fire({ ...swalDarkConfig, icon: 'warning', title: t('auth.err_nombre_corto_tit'), text: t('auth.err_nombre_corto_msg') });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.value.email)) {
      Swal.fire({ ...swalDarkConfig, icon: 'warning', title: t('auth.err_email_tit'), text: t('auth.err_email_msg') });
      return;
    }
    if (form.value.password.length < 5) {
      Swal.fire({ ...swalDarkConfig, icon: 'warning', title: t('auth.err_pass_tit'), text: t('auth.err_pass_msg') });
      return;
    }
  }

  const endpoint = esLogin.value ? 'login_api.php' : 'registro_api.php';
  const url = `http://localhost/Backend/${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();

    if (data.success) {
      if (esLogin.value) {
        Swal.fire({
          ...swalDarkConfig,
          icon: 'success',
          title: t('auth.ok_login_tit'),
          text: `${t('auth.ok_login_msg')}, ${data.user.nombre}`,
          timer: 2000,
          showConfirmButton: false
        });
        emit('logeado', { nombre: data.user.nombre, rol: data.user.rol });
      } else {
        Swal.fire({ ...swalDarkConfig, icon: 'success', title: t('auth.ok_reg_tit'), text: t('auth.ok_reg_msg') });
        esLogin.value = true;
        form.value.password = '';
      }
    } else {
      Swal.fire({ ...swalDarkConfig, icon: 'error', title: t('auth.err_oops'), text: data.message }); // El mensaje del servidor no lo traducimos por simplicidad ahora
    }
  } catch (error) {
    Swal.fire({ ...swalDarkConfig, icon: 'error', title: t('auth.err_server_tit'), text: t('auth.err_server_msg') });
  }
};
</script>

<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-content">
      <button class="btn-close" @click="$emit('cerrar')">X</button>
      <h2>{{ esLogin ? $t('auth.login_title') : $t('auth.register_title') }}</h2>
      <form @submit.prevent="handleSubmit">
        <template v-if="!esLogin">
          <input v-model="form.nombre" type="text" :placeholder="$t('auth.ph_nombre')" required>
          <input v-model="form.dni" type="text" :placeholder="$t('auth.ph_dni')" required>
          <input v-model="form.direccion" type="text" :placeholder="$t('auth.ph_dir')">
          <select v-model="form.rol">
            <option value="socio">{{ $t('auth.rol_socio') }}</option>
            <option value="txandalari">{{ $t('auth.rol_txandalari') }}</option>
          </select>
        </template>
        <input v-model="form.email" type="email" :placeholder="$t('auth.ph_email')" required>
        <input v-model="form.password" type="password" :placeholder="$t('auth.ph_pass')" required>
        <button type="submit" class="btn-submit">{{ esLogin ? $t('auth.btn_entrar') : $t('auth.btn_registrar') }}</button>
      </form>
      <p @click="esLogin = !esLogin" class="toggle-auth">
        {{ esLogin ? $t('auth.toggle_to_reg') : $t('auth.toggle_to_login') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* (Mantener tus estilos de modal-overlay y modal-content que ya estaban correctos) */
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
}

.modal-content {
    background: #1e293b;
    color: white;
    padding: 40px;
    border-radius: 16px;
    width: 95%;
    max-width: 420px;
    position: relative;
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
}

.btn-submit {
    background: #38bdf8;
    color: #0f172a;
    font-weight: bold;
    padding: 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.toggle-auth {
    color: #94a3b8;
    text-align: center;
    cursor: pointer;
    margin-top: 20px;
    text-decoration: underline;
}
</style>