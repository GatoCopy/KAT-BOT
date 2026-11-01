module.exports = {
    nombre: 'elegir',
    descripcion: 'Elige una opción al azar. Ej: !elegir pizza | tacos | sushi',
    categoria: 'diversion',
    ejecutar: async (evento, args, responder) => {
        const opciones = args.join(' ').split('|').map(o => o.trim()).filter(Boolean);

        if (opciones.length < 2) {
            return await responder('⚠️ **Uso:** `!elegir <opción 1> | <opción 2> | ...`\nEj: `!elegir pizza | tacos | sushi`');
        }

        const elegida = opciones[Math.floor(Math.random() * opciones.length)];
        // allowedMentions vacío: si una opción trae "@everyone" o menciones, que no hagan ping.
        await responder({ content: `🤔 Me quedo con: **${elegida}**`, allowedMentions: { parse: [] } });
    }
};
