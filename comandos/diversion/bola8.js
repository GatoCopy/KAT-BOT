module.exports = {
    nombre: 'bola8',
    descripcion: 'Responde a tus preguntas existenciales',
    categoria: 'diversion',
    ejecutar: async (evento, args, responder) => {
        if (!args.length) {
            return await responder('🎱 ¡Tienes que hacerme una pregunta! Ej: `!bola8 ¿Voy a ser millonario?`');
        }
        const respuestas = [
            'Sí, totalmente. 🔮',
            'No lo creo... ❌',
            'Definitivamente sí. ✨',
            'Pregúntame más tarde, estoy durmiendo. 😴',
            'Mis fuentes dicen que no. 🤫',
            '¡Por supuesto que sí! 🔥'
        ];
        const aleatorio = respuestas[Math.floor(Math.random() * respuestas.length)];
        await responder(`🎱 **Bola Mágica:** ${aleatorio}`);
    }
};
