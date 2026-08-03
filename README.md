# 🐱 KAT — Bot multipropósito para Revolt.chat

KAT es un bot modular para servidores de Revolt.chat, con comandos de moderación, ocio, multimedia e integración con IA (Groq). Desarrollado por **Alexander Jerrard (CopyCat)**.

---

## 📂 Estructura del proyecto

```
kat-bot/
├── index.js                 # Punto de entrada: conecta el WebSocket y carga comandos
├── ecosystem.config.js      # Configuración de PM2
├── .env                     # Variables de entorno (NO subir a git)
│
├── comandos/                # Todos los comandos del bot, organizados por categoría
│   ├── admin/                # Comandos que requieren permisos de administrador
│   ├── diversion/             # Comandos de entretenimiento
│   ├── ia/                    # Comandos relacionados con IA
│   ├── multimedia/            # Embeds, imágenes, etc.
│   └── utilidad/               # Comandos de utilidad general
│
├── eventos/                  # Handlers de cada tipo de evento del WebSocket
│   ├── authenticated.js
│   ├── ready.js
│   └── message.js
│
├── servicios/                # Lógica reutilizable (llamadas a APIs externas)
│   ├── api.js                  # Funciones para hablar con la API de Revolt
│   ├── groq.js                 # Función para hablar con la API de Groq (IA)
│   ├── db.js                   # Conexión y esquema de la base de datos SQLite
│   ├── recordatorios.js        # Acceso a datos de recordatorios
│   ├── encuestas.js            # Acceso a datos de encuestas y votos
│   └── scheduler.js            # Revisa periódicamente recordatorios vencidos
│
├── data/
│   └── kat.db                # Base de datos SQLite (se crea sola, NO subir a git)
│
└── config/
    └── constantes.js         # PREFIX, colores, URLs, intervalos, etc.
```

---

## ⚙️ Configuración (.env)

```env
BOT_TOKEN=tu_token_del_bot_aqui
GROQ_API_KEY=tu_api_key_de_groq_aqui
```

- `BOT_TOKEN` (o `TOKEN` como alternativa) — token del bot en Revolt.
- `GROQ_API_KEY` — necesaria solo para el comando `!kat`.

---

## 🎮 Comandos actuales

| Comando | Categoría | Admin | Descripción |
|---|---|:---:|---|
| `!dado` | diversión | ❌ | Tira un dado de 6 caras |
| `!chiste` | diversión | ❌ | Cuenta un chiste aleatorio |
| `!bola8 <pregunta>` | diversión | ❌ | Responde preguntas al estilo bola 8 mágica |
| `!kat <pregunta>` | ia | ❌ | Conversa con la IA de KAT (Groq / Llama 3.3) |
| `!canalia [on\|off]` | ia | ✅ | Activa/desactiva que KAT responda a todo (sin `!kat`) en el canal |
| `!embed [Título \| Texto]` | multimedia | ❌ | Crea un mensaje embed. Sin argumentos, muestra la guía |
| `!clear <cantidad>` | admin | ✅ | Elimina entre 1 y 100 mensajes del canal |
| `!help [comando]` | utilidad | ❌ | Lista todos los comandos agrupados por categoría, o detalla uno |
| `!ping` | utilidad | ❌ | Muestra la latencia actual del bot |
| `!userinfo [@usuario]` | utilidad | ❌ | Info de un usuario (o de quien ejecuta el comando) |
| `!serverinfo` | utilidad | ❌ | Info general del servidor (miembros, canales, roles, dueño) |
| `!recordatorio <tiempo> <mensaje>` | utilidad | ❌ | Crea un recordatorio persistente (ej: `1h30m`) |
| `!misrecordatorios` | utilidad | ❌ | Lista tus recordatorios pendientes |
| `!encuesta <pregunta> \| <op1> \| <op2>...` | utilidad | ❌ | Crea una encuesta con hasta 9 opciones |
| `!votar <id> <número>` | utilidad | ❌ | Vota (o cambia tu voto) en una encuesta |
| `!cerrarencuesta <id>` | utilidad | ❌* | Cierra y muestra resultados (*solo creador o admin*) |

> Los comandos dentro de `comandos/admin/` (o cualquier subcarpeta suya) se marcan automáticamente como `soloAdmin: true`, sin importar lo que digas en el archivo — no hace falta declararlo a mano, aunque es buena práctica dejarlo explícito para que se entienda al leer el código.

---

## ➕ Cómo agregar un comando nuevo

1. Crea un archivo `.js` dentro de la subcarpeta de `comandos/` que corresponda (o crea una nueva categoría, ej. `comandos/musica/`).
2. Usa esta plantilla base:

```js
module.exports = {
    nombre: 'saludo',              // Lo que el usuario escribirá: !saludo
    descripcion: 'Saluda al usuario',
    categoria: 'diversion',        // Solo informativo, ayuda a un futuro !help
    soloAdmin: false,              // true si solo lo pueden usar admins

    ejecutar: async (evento, args, responder) => {
        // evento    → el objeto del mensaje original (evento.channel, evento.author, etc.)
        // args      → array con las palabras después del comando: "!saludo Copy" → ['Copy']
        // responder → función para responder: puede recibir texto o un objeto { embeds: [...] }

        await responder(`👋 ¡Hola, ${args[0] || 'amigo'}!`);
    }
};
```

3. Guarda el archivo. **No hay que tocar `index.js` ni ningún otro archivo** — el loader recorre `comandos/` de forma recursiva y lo detecta solo la próxima vez que reinicies el bot (`pm2 restart KAT` o `node index.js`).

### Si tu comando necesita hablar con una API externa

No repitas `fetch` a mano dentro del comando. Sigue el patrón de `servicios/groq.js`:

1. Crea `servicios/tuServicio.js` con la lógica de la llamada (fetch, headers, manejo de errores).
2. Impórtala en tu comando y úsala. Así, si luego otro comando necesita lo mismo, ya está reutilizable.

### Si tu comando necesita hablar con la API de Revolt (enviar/borrar mensajes, ver canal, etc.)

Ya existen funciones listas en `servicios/api.js`: `enviarMensaje`, `eliminarMensaje`, `eliminarMensajesEnBloque`, `obtenerMensajes`, `esAdministrador`. Impórtalas en vez de escribir un `fetch` nuevo.

---

## 🎨 Cómo personalizar el bot

Todo lo "de marca" vive en `config/constantes.js`:

```js
module.exports = {
    PREFIX: '!',                 // Cambia el prefijo de todos los comandos a la vez
    API_URL: 'https://api.revolt.chat',
    WS_URL: 'wss://ws.revolt.chat',
    COLOR_SERVER: '#FF5757',     // Color por defecto de los embeds
    PING_INTERVAL_MS: 30000,
    RECONEXION_MS: 3000,
};
```

Si quieres que un comando específico use otro color en su embed, no lo hardcodees — trae `COLOR_SERVER` desde acá o pásalo como parámetro, así el día que cambies la paleta del bot solo tocas un archivo.

### Cambiar la personalidad de la IA (`!kat`)

El texto que define cómo habla KAT está en `servicios/groq.js`, en la constante `SYSTEM_PROMPT`. Ahí puedes ajustar tono, reglas de qué puede o no hacer, o el modelo (`MODELO`) si quieres probar otro disponible en Groq.

---

## 🚀 Levantar el bot

```bash
npm install
npm install better-sqlite3
pm2 start ecosystem.config.js
```

> ⚠️ **Importante:** agrega `data/*.db` (o toda la carpeta `data/`, menos un `.gitkeep`) a tu `.gitignore`. Es el archivo de base de datos con recordatorios y encuestas — no debe subirse a git, igual que `.env`.

Para ver logs en vivo:
```bash
pm2 logs KAT
```

Para reiniciar tras cambios (nuevos comandos, edición de `.env`, etc.):
```bash
pm2 restart KAT
```

---

## 💾 Persistencia (recordatorios y encuestas)

Estos datos se guardan en `data/kat.db` (SQLite, vía `better-sqlite3`), así que sobreviven a reinicios del bot.

- **Recordatorios:** un `setInterval` en `servicios/scheduler.js` revisa cada 15 segundos si hay recordatorios vencidos y los envía. Corre independiente del WebSocket, así que sigue funcionando aunque el bot esté reconectándose.
- **Encuestas:** el voto es por **comando de texto** (`!votar <id> <número>`), no por reacciones a mensajes — así no hace falta manejar el evento de reacciones de Revolt todavía. Si más adelante quieres votar con reacciones (👍👎 o números como emoji), es una mejora futura que implicaría agregar un handler para el evento `MessageReact` en `eventos/`.
- Un usuario puede cambiar su voto votando de nuevo; solo cuenta su voto más reciente por encuesta.

---

## 💬 Modo conversación (canal IA)

Con `!canalia on` (solo admins), el canal donde lo ejecutes deja de necesitar el prefijo `!kat` — KAT responde a **todo** lo que se escriba ahí, manteniendo el hilo de la conversación (últimos ~10 intercambios). Los comandos con `!` siguen funcionando normal en ese mismo canal.

**Cosas a tener en cuenta:**
- ⚠️ **Cada mensaje sin prefijo en ese canal dispara una llamada a la API de Groq.** En un canal activo, esto puede consumir tu cuota rápido — revisa tus límites en el dashboard de Groq.
- El historial es **compartido entre todos los que escriban en el canal** (como una conversación grupal con KAT), no uno privado por persona. Cada mensaje se etiqueta con el nombre de quien lo escribió para que la IA distinga quién dice qué.
- El on/off queda guardado en `data/kat.db` (sobrevive reinicios). El historial de la conversación en sí vive en memoria (`utilidades/historialIA.js`) y se pierde si el bot se reinicia, o si apagas/prendes el modo con `!canalia off` / `!canalia on`.
- Si `!kat` responde bien pero el canal en modo conversación no dice nada, revisa los logs del bot (`pm2 logs KAT`) — los errores de la IA en este modo no se muestran en el chat a propósito, para no spamear el canal si algo como la API key falla.
