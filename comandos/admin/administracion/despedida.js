const { crearComandoMensaje } = require('../../../utilidades/crearComandoMensaje');

module.exports = crearComandoMensaje({
    tipo: 'despedida',
    descripcion: 'Configura el mensaje que se envía cuando alguien sale del servidor',
    cuando: '(cuando alguien sale)',
});
