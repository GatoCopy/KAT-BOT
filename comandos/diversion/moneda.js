module.exports = {
    nombre: 'moneda',
    descripcion: 'Lanza una moneda: cara o cruz',
    categoria: 'diversion',
    ejecutar: async (evento, args, responder) => {
        const resultado = Math.random() < 0.5 ? 'Cara' : 'Cruz';
        await responder(`🪙 Lanzaste la moneda y salió: **${resultado}**`);
    }
};
