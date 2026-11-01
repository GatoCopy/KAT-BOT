const { crearComandoMensaje } = require('../../../utilidades/crearComandoMensaje');

module.exports = crearComandoMensaje({
    tipo: 'bienvenida',
    descripcion: 'Configura el mensaje que se envía cuando alguien entra al servidor',
    cuando: '(cuando alguien entra)',
});
