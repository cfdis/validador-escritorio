import $ from 'jquery';
import { AppContext } from '../services/AppContext';
import { ApiService } from '../services/ApiService';
import { UserService } from '../services/UserService';
import { RouterService } from '../services/RouterService';

export function initListeners(api: ApiService, us: UserService, rs: RouterService) {
    $('#verEmpresas').on('click', function (e) {
        e.preventDefault();
    });

    $('#userButton').on('click', function (e) {
        e.preventDefault();
        let menuElement = $('#userDropdown');
        if (menuElement.css('display') === 'none') {
            menuElement.show();
        }
        else {
            menuElement.hide();
        }
    });

    $('#logoutButton').on('click', function (e) {
        e.preventDefault();
        us.logout().then(() => {
            rs.navigate('login');
        });
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('#userMenu').length) {
            $('#userDropdown').hide();
        }
    });

    $('#scanFromCamera').on('click', function (e) {
        e.preventDefault();
        rs.navigate('camera');
    });

    $('#scanFromImage').on('click', function (e) {
        e.preventDefault();
        rs.navigate('image');
    });
}

function getUserInfo(us: UserService) {
    let currentUser = us.getUser();

    if (currentUser) {
        $('#userName').text(currentUser.name || 'Usuario');
        $('#userEmail').text(currentUser.email || '');
        $('#userAvatar').attr('src', currentUser.avatar || 'assets/img/default-user.jpg');
        $('#userMenu').show();
    }
}

export function init() {
    const rs = AppContext.getInstance().router();
    const api = AppContext.getInstance().api();
    const us = AppContext.getInstance().us();
    const ss = AppContext.getInstance().ss();

    initListeners(api, us, rs);
    getUserInfo(us);
}