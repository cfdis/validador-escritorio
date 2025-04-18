import $ from 'jquery';
import { AppContext } from '../services/AppContext';

export function init() {
    const rs = AppContext.getInstance().router();
    const api = AppContext.getInstance().api();
    const ss = AppContext.getInstance().ss();

    $('#loginButton').on('click', function (e) {
        e.preventDefault();

        const email = $('#email').val().trim().toLowerCase();
        const password = $('#password').val().trim();

        if (!email || !password) {
            alert('Correo y contraseña obligatorios');
            return;
        }

        ss.show();

        api.post('login', {}, { email: email.toLowerCase(), password })
            .then((response) => {
                window.auth.setToken(response.token).then((guardado) => {
                    if (guardado) {
                        rs.navigate('dashboard');
                    } else {
                        alert('Falló el inicio de sesión, inetenta de nuevo más tarde.');
                    }
                });
            })
            .catch((error) => {
                if (error.status === 401 || error.status === 422) {
                    alert('Usuario o contraseña incorrectos');
                } else {
                    api.handleError(error);
                }
                setTimeout(() => $('#email').focus(), 100);
            })
            .finally(() => {
                ss.hide();
            });
    });
}