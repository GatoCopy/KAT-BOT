// La función de IA está temporalmente deshabilitada a petición del desarrollador.
// Los servicios que la sostienen (groq.js, contextoBot.js, contextoIA.js,
// canalesIA.js, historialIA.js, etc.) NO se tocaron — siguen ahí intactos
// para cuando se retome este trabajo, no hace falta reconstruir nada.
module.exports = {
    nombre: 'kat',
    descripcion: 'Función de IA temporalmente deshabilitada.',
    categoria: 'ia',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        await responder('🔧 La función de IA de KAT está **temporalmente deshabilitada** mientras se ajusta. Vuelve pronto.');
    }
};
