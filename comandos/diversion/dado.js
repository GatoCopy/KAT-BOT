module.exports = {
    nombre: 'dado',
    descripcion: 'Tira un dado de 6 caras',
    categoria: 'diversion',
    ejecutar: async (evento, args, responder) => {
        const resultado = Math.floor(Math.random() * 6) + 1;
        await responder(`🎲 Tiraste el dado y salió: **${resultado}**`);
    }
};
