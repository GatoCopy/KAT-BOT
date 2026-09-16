// Depende de !kat (IA), que está temporalmente deshabilitado. Se deja este
// stub en vez de borrar el archivo para no perder el nivel de permiso ni la
// posición en !help; la lógica original sigue en el historial de git.
module.exports = {
    nombre: 'canalia',
    descripcion: 'Depende de la IA, que está temporalmente deshabilitada.',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        await responder('🔧 Esta función depende de la IA de KAT, que está temporalmente deshabilitada. Vuelve pronto.');
    }
};
