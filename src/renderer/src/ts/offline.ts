import $ from 'jquery';
import { AppContext } from '../services/AppContext';

export function init() {
    const rs = AppContext.getInstance().router();
    
    console.log('Offline ready...');
    $('#retryButton').on('click', () => {
        rs.navigate('dashboard');
    });
}