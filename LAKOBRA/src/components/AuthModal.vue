<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2'; // Importamos SweetAlert

const props = defineProps({ mostrar: Boolean });
const emit = defineEmits(['cerrar', 'logeado']);

const esLogin = ref(true);

const form = ref({
    nombre: '',
    dni: '',
    email: '',
    password: '',
    direccion: '',
    rol: 'socio'
});

// Configuración base para que las alertas combinen con tu diseño oscuro
const swalDarkConfig = {
    background: '#1e293b', // Color de fondo del modal
    color: '#f8fafc',      // Color del texto
    confirmButtonColor: '#38bdf8', // Azul Lakobra para el botón
};

const handleSubmit = async () => {
    // --- NUEVAS VALIDACIONES DE FRONTEND ---
    if (!esLogin.value) { // Solo comprobamos esto si se está registrando
        // 1. Nombre mínimo 3 caracteres
        if (form.value.nombre.trim().length < 3) {
            Swal.fire({
                ...swalDarkConfig,
                icon: 'warning',
                title: 'Nombre muy corto',
                text: 'El nombre debe tener al menos 3 caracteres.'
            });
            return; // Detiene la función y no envía nada al backend
        }

        // 2. Email válido (usando una expresión regular)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.value.email)) {
            Swal.fire({
                ...swalDarkConfig,
                icon: 'warning',
                title: 'Email inválido',
                text: 'Por favor, introduce una dirección de correo válida.'
            });
            return;
        }

        // 3. Contraseña mínimo 5 caracteres
        if (form.value.password.length < 5) {
            Swal.fire({
                ...swalDarkConfig,
                icon: 'warning',
                title: 'Contraseña débil',
                text: 'La contraseña debe tener al menos 5 caracteres por seguridad.'
            });
            return;
        }
    }
    // --- FIN VALIDACIONES ---
    const endpoint = esLogin.value ? 'login_api.php' : 'registro_api.php';
    const url = `http://localhost/Backend/${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include', // <--- ¡FALTABA ESTO! Permite guardar la sesión del PHP
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form.value)
        });

        const data = await response.json();

        if (data.success) {
            if (esLogin.value) {
                // ALERTA DE LOGIN EXITOSO
                Swal.fire({
                    ...swalDarkConfig,
                    icon: 'success',
                    title: `¡Bienvenido de nuevo!`,
                    text: `Hola, ${data.user.nombre}`,
                    timer: 2000, // Se cierra sola a los 2 segundos
                    showConfirmButton: false
                });

                emit('logeado', { nombre: data.user.nombre, rol: data.user.rol });
            } else {
                // ALERTA DE REGISTRO EXITOSO
                Swal.fire({
                    ...swalDarkConfig,
                    icon: 'success',
                    title: '¡Registro completado!',
                    text: 'Ahora puedes iniciar sesión con tu nueva cuenta.',
                });

                esLogin.value = true; // Cambiamos a la vista de login
                // Limpiamos la contraseña por seguridad
                form.value.password = '';
            }
        } else {
            // ALERTA DE ERROR DESDE EL BACKEND (Ej: Email ya existe o contraseña mal)
            Swal.fire({
                ...swalDarkConfig,
                icon: 'error',
                title: 'Oops...',
                text: data.message,
            });
        }
    } catch (error) {
        // ALERTA DE ERROR GRAVE (Ej: XAMPP apagado)
        Swal.fire({
            ...swalDarkConfig,
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor. Revisa tu conexión.',
        });
    }
};
</script>

<template>
    <div v-if="mostrar" class="modal-overlay">
        <div class="modal-content">
            <button class="btn-close" @click="$emit('cerrar')">X</button>
            <h2>{{ esLogin ? 'Iniciar Sesión' : 'Registro' }}</h2>
            <form @submit.prevent="handleSubmit">
                <template v-if="!esLogin">
                    <input v-model="form.nombre" type="text" placeholder="Nombre completo" required>
                    <input v-model="form.dni" type="text" placeholder="DNI" required>
                    <input v-model="form.direccion" type="text" placeholder="Dirección">
                    <select v-model="form.rol">
                        <option value="socio">Socio</option>
                        <option value="txandalari">Txandalari</option>
                    </select>
                </template>
                <input v-model="form.email" type="email" placeholder="Email" required>
                <input v-model="form.password" type="password" placeholder="Contraseña" required>
                <button type="submit" class="btn-submit">{{ esLogin ? 'Entrar' : 'Registrar' }}</button>
            </form>
            <p @click="esLogin = !esLogin" class="toggle-auth">
                {{ esLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
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