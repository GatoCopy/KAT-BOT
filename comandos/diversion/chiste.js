module.exports = {
    nombre: 'chiste',
    descripcion: 'Cuenta un chiste aleatorio',
    categoria: 'diversion',
    ejecutar: async (evento, args, responder) => {
        const chistes = [
            '¿Qué le dice un bit a otro? Nos vemos en el bus. 😂',
            '¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter. 🐦',
            'Hay 10 tipos de personas en el mundo: las que entienden binario y las que no. 🤓'
        ];
        const chiste = chistes[Math.floor(Math.random() * chistes.length)];
        await responder(`🤖 ${chiste}`);
    }
};
