# 🐱 KAT — Bot multipropósito para Discord

KAT es un bot modular para servidores de Discord, con comandos de moderación, ocio, multimedia e integración con IA (Groq). Desarrollado por **Alexander Jerrard (CopyCat)**.

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
│   ├── api.js                  # Funciones para hablar con la API de Discord (vía discord.js)
│   ├── groq.js                 # Función para hablar con la API de Groq (IA)
│   ├── db.js                   # Conexión y esquema de la base de datos SQLite
│   ├── recordatorios.js        # Acceso a datos de recordatorios
│   ├── encuestas.js            # Acceso a datos de encuestas y votos
│   ├── warns.js                # Acceso a datos de advertencias
│   ├── autoroles.js            # Acceso a datos de autoroles (reacción → rol)
│   ├── canalesIA.js            # Activación de memoria de !kat por canal
│   ├── logs.js                 # Canal de logs de moderación + función para publicar ahí
│   ├── automod.js              # Motor que revisa cada mensaje (palabras, links, flood)
│   ├── automodConfig.js        # On/off de cada sistema de auto-moderación, por servidor
│   ├── palabrasProhibidas.js   # Lista de palabras prohibidas por servidor
│   ├── canalesLinks.js         # Canales donde sí se permiten links (whitelist)
│   └── scheduler.js            # Revisa periódicamente recordatorios vencidos
│
├── utilidades/
│   ├── cargadorComandos.js    # Carga los comandos y expone el Map compartido
│   ├── tiempo.js               # Parsea/formatea duraciones ("10m", "2h30m")
│   ├── parseMencion.js         # Extrae un ID de una mención "<@ID>" o texto plano
│   ├── historialIA.js          # Historial de conversación en memoria, por canal
│   ├── cacheUsuarios.js        # Cache de nombres de usuario
│   ├── cacheAdmins.js          # Cache de si un usuario es admin (evita golpear la API por mensaje)
│   ├── cacheCanales.js         # Cache de a qué servidor pertenece cada canal
│   └── antiflood.js            # Contador en memoria de mensajes por usuario/canal
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

- `BOT_TOKEN` (o `DISCORD_TOKEN`/`TOKEN` como alternativa) — token del bot, desde el Developer Portal de Discord.
- `GROQ_API_KEY` — necesaria solo para el comando `!kat`.

---

## 🎮 Comandos actuales

| Comando | Categoría | Admin | Descripción |
|---|---|:---:|---|
| `!dado` | diversión | ❌ | Tira un dado de 6 caras |
| `!chiste` | diversión | ❌ | Cuenta un chiste aleatorio |
| `!bola8 <pregunta>` | diversión | ❌ | Responde preguntas al estilo bola 8 mágica |
| `!kat <pregunta>` | ia | ❌ | Conversa con la IA de KAT (Groq / Llama 3.3) |
| `!canalia [on\|off]` | ia | ✅ | Activa/desactiva que `!kat` recuerde la conversación en este canal |
| `!embed [Título \| Texto]` | multimedia | ❌ | Crea un mensaje embed. Sin argumentos, muestra la guía |
| `!clear <cantidad>` | admin | ✅ | Elimina entre 1 y 100 mensajes del canal |
| `!kick <@usuario> [razón]` | admin | ✅ | Expulsa a un miembro (puede volver a unirse con invitación) |
| `!ban <@usuario> [razón]` | admin | ✅ | Banea a un usuario |
| `!unban <ID>` | admin | ✅ | Quita el baneo a un usuario |
| `!banlist` | admin | ✅ | Lista los usuarios baneados del servidor |
| `!suspender <@usuario> <tiempo> [razón]` | admin | ✅ | Suspende temporalmente a un miembro (timeout) |
| `!desuspender <@usuario>` | admin | ✅ | Quita la suspensión temporal |
| `!warn <@usuario> [razón]` | admin | ✅ | Agrega una advertencia a un usuario |
| `!warns <@usuario>` | admin | ✅ | Lista las advertencias de un usuario |
| `!delwarn <id>` | admin | ✅ | Elimina una advertencia específica |
| `!decir [ID canal] <mensaje>` | admin | ✅ | El bot envía un mensaje por ti (anuncios) |
| `!autorol crear\|quitar\|lista` | admin | ✅ | Configura roles automáticos por reacción |
| `!modlogs [on\|off]` | admin | ✅ | Canal donde se publican los logs de moderación |
| `!palabraprohibida agregar\|quitar\|lista` | admin | ✅ | Administra palabras prohibidas (se borran + se avisa) |
| `!antiflood [on\|off]` | admin | ✅ | Auto-suspende a quien mande mensajes muy seguidos |
| `!filtrolinks [on\|off]` | admin | ✅ | Bloquea links fuera de canales permitidos |
| `!linkscanal permitir\|quitar\|lista` | admin | ✅ | Administra qué canales permiten links |
| `!setrol moderador\|administrador\|ver` | admin | ✅ | Configura qué rol cuenta como moderador/administrador |
| `!historial <@usuario>` | admin | ✅ | Junta todas las acciones de moderación de un usuario |
| `!infokat set\|ver\|borrar` | admin | ✅ | Define reglas/info que `!kat` debe conocer del servidor |
| `!gato` | multimedia | ❌ | Imagen aleatoria de un gato |
| `!help [categoría\|comando]` | utilidad | ❌ | Menú de categorías, comandos de una categoría, o detalle de uno |
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

3. Guarda el archivo. **No hay que tocar `index.js`, `help.js`, ni ningún otro archivo** — el loader recorre `comandos/` de forma recursiva y lo detecta solo la próxima vez que reinicies el bot (`pm2 restart KAT` o `node index.js`). `!help` también se actualiza solo: agrupa por el campo `categoria` que pongas en cada comando, así que si usas una categoría que ya existe (`admin`, `diversion`, `ia`, `multimedia`, `utilidad`) aparece ahí mismo; si inventas una categoría nueva (ej. `categoria: 'musica'`), también aparece automáticamente en `!help`, solo que sin un emoji bonito asignado — para eso, opcionalmente puedes agregar una línea en `NOMBRES_CATEGORIA` dentro de `comandos/utilidad/help.js`, pero no es obligatorio.

### Si tu comando necesita hablar con una API externa

No repitas `fetch` a mano dentro del comando. Sigue el patrón de `servicios/groq.js`:

1. Crea `servicios/tuServicio.js` con la lógica de la llamada (fetch, headers, manejo de errores).
2. Impórtala en tu comando y úsala. Así, si luego otro comando necesita lo mismo, ya está reutilizable.

### Si tu comando necesita hablar con la API de Discord (enviar/borrar mensajes, ver canal, etc.)

Ya existen funciones listas en `servicios/api.js`: `enviarMensaje`, `eliminarMensaje`, `eliminarMensajesEnBloque`, `obtenerMensajes`, `esAdministrador`. Impórtalas en vez de escribir un `fetch` nuevo.

---

## 🎨 Cómo personalizar el bot

Todo lo "de marca" vive en `config/constantes.js`:

```js
module.exports = {
    PREFIX: '!',                 // Cambia el prefijo de todos los comandos a la vez
    COLOR_SERVER: '#FF5757',     // Color por defecto de los embeds
    ANTIFLOOD_MAX_MENSAJES: 5,
    ANTIFLOOD_VENTANA_MS: 5000,
    ANTIFLOOD_SUSPENSION_MS: 120000,
};
```

Si quieres que un comando específico use otro color en su embed, no lo hardcodees — trae `COLOR_SERVER` desde acá o pásalo como parámetro, así el día que cambies la paleta del bot solo tocas un archivo.

### Cambiar la personalidad de la IA (`!kat`)

El texto que define cómo habla KAT está en `servicios/groq.js`, en la constante `SYSTEM_PROMPT`. Ahí puedes ajustar tono, reglas de qué puede o no hacer, o el modelo (`MODELO`) si quieres probar otro disponible en Groq.

---

## 🚀 Levantar el bot (Fedora)

```bash
# Si te hace falta algo de esto (probablemente ya lo tengas):
sudo dnf install nodejs npm git -y
sudo npm install -g pm2

# Dentro de la carpeta del proyecto:
cp .env.example .env
nano .env          # pega tu BOT_TOKEN y GROQ_API_KEY
npm install
npm run pm2        # o: node index.js, para ver logs directo la primera vez
```

**Antes de que arranque necesitas, en el [Developer Portal de Discord](https://discord.com/developers/applications) → tu app → Bot:**
- Activar **Server Members Intent** y **Message Content Intent** (ambos son "Privileged Gateway Intents"). Sin esto el bot se cae al iniciar con un error `DisallowedIntents`.
- Invitarlo a tu servidor desde OAuth2 → URL Generator, marcando el scope `bot` y los permisos que necesite (ver sección de Moderación más abajo).

Para ver logs en vivo:
```bash
pm2 logs KAT
```

Para reiniciar tras cambios (nuevos comandos, edición de `.env`, etc.):
```bash
pm2 restart KAT
```

## 🛡️ Moderación

⚠️ **Primer paso obligatorio en cada servidor nuevo:** ejecuta `!setrol administrador <ID o mención de un rol>` (como dueño del servidor, que siempre tiene acceso). Sin esto, **nadie más que el dueño puede usar ningún comando de moderación o administración**.

Todos los comandos de moderación viven en `comandos/admin/`, así que el loader los marca con el nivel correcto automáticamente según la subcarpeta (`moderacion/` o `administracion/`).

**Antes de usarlos:** el bot necesita los permisos correspondientes activados en su rol dentro del servidor — **Kick Members** para `!kick`, **Ban Members** para `!ban`/`!unban`/`!banlist`, **Timeout Members** (Moderate Members) para `!suspender`/`!desuspender`, **Manage Roles** para `!autorol`, **Manage Server** para el rastreo de invitaciones, y **Add Reactions** para que pueda poner la reacción inicial en los autoroles. El rol del bot también debe estar **por encima**, en la lista de roles del servidor, de cualquier rol que quiera asignar/quitar o de cualquier miembro que quiera moderar. Si un comando falla con un mensaje genérico de "no pude hacer X", esto es lo primero a revisar.

**Warns:** son solo un registro (no hacen nada automáticamente). A partir de 3 advertencias, `!warn` te avisa en el propio mensaje para que decidas si aplicar una suspensión o expulsión — no hay expulsión automática, a propósito, para que la decisión la siga tomando un humano.

### Configurar un autorol paso a paso

1. Activa el "modo desarrollador" en Discord (Configuración de usuario → Avanzado → Modo desarrollador) para poder copiar IDs con click derecho.
2. Envía (o ubica) el mensaje que quieres usar como panel de roles, por ejemplo: "Reacciona con 🎮 para el rol de Gamer".
3. Click derecho sobre ese mensaje → Copiar ID.
4. Ve a Configuración del servidor → Roles, y copia el ID del rol que quieres asignar.
5. En el **mismo canal** donde está el mensaje, ejecuta:
   ```
   !autorol crear <ID_del_mensaje> 🎮 <ID_del_rol>
   ```
6. El bot reacciona solo al mensaje con ese emoji. Cualquiera que reaccione ahí recibe el rol; si quita la reacción, se lo quita.

Puedes tener varios autoroles en el mismo mensaje (uno por cada emoji distinto). `!autorol lista` te muestra todos los configurados en el servidor, y `!autorol quitar <ID_mensaje> <emoji>` elimina uno.

---

## 🧠 KAT y el contexto del servidor

Con `!infokat set <texto>`, los admins le dan a `!kat` información de fondo sobre el servidor (reglas, de qué trata la comunidad, lo que sea útil). A partir de ahí, **cada** llamada a `!kat` (con o sin `!canalia` activado) incluye automáticamente:

- El texto que configuraste con `!infokat`.
- Quiénes son los administradores y moderadores **ahora mismo**, según lo configurado con `!setrol` (se calcula en vivo, no es una lista fija que se desactualice).

Así, si alguien pregunta "¿cuáles son las reglas de este server?" o "¿quién es admin aquí?", KAT puede responder de verdad en vez de decir que no sabe de qué se le habla. Esto es **contexto de fondo, no de la conversación** — no incluye nada de lo que la gente esté hablando ni quién dijo qué, solo la info base del servidor.

Por rendimiento, esto se cachea 5 minutos (`utilidades/cacheContextoServidor.js`) — cambios vía `!infokat` o `!setrol` invalidan la caché al instante, así que no hay que esperar.

---

## 🤖 Auto-moderación

Tres sistemas independientes, cada uno con su propio on/off por servidor — puedes activar solo el que necesites.

### Logs de moderación
`!modlogs on` en el canal que quieras usar como bitácora. A partir de ahí, **todo** lo siguiente se publica ahí automáticamente: `!kick`, `!ban`, `!unban`, `!warn`, `!delwarn`, `!suspender`, `!desuspender`, y las acciones automáticas de los tres sistemas de abajo. Si no activas `!modlogs`, todo sigue funcionando igual, solo que sin quedar registrado en ningún canal.

### Filtro de palabras
`!palabraprohibida agregar <palabra>` activa el filtro automáticamente y la agrega a la lista. Cuando alguien (que no sea admin) escribe un mensaje que contiene alguna palabra de la lista, el mensaje **se borra** y se avisa en el mismo canal — **no** se genera un warn formal, es solo una limpieza automática para mantener la convivencia. Si quieres que además cuente como advertencia, tendrías que aplicar `!warn` a mano.

### Filtro de links
`!filtrolinks on` bloquea cualquier link (`http://`, `https://`) en canales que no estén en la whitelist. Usa `!linkscanal permitir` dentro de cada canal donde SÍ quieras permitir links (por ejemplo, un canal de `#recursos` o `#compartir`).

### Antiflood
`!antiflood on` — si alguien manda más de 5 mensajes en 5 segundos, se le borra el mensaje que rompió el límite y se le suspende automáticamente 2 minutos (configurable en `config/constantes.js`: `ANTIFLOOD_MAX_MENSAJES`, `ANTIFLOOD_VENTANA_MS`, `ANTIFLOOD_SUSPENSION_MS`). Solo borra el mensaje que detectó el flood, no los anteriores que ya se enviaron.

**Los administradores están exentos de los tres sistemas** — así puedes probarlos y seguir usando el bot con normalidad mientras están activos.

**ℹ️ Sobre invitaciones:** en Discord sí es viable — el objeto de invitación trae `uses`, así que se rastrea quién entró por cuál invitación comparando conteos antes/después de un join. Ya está construido (`servicios/invites.js` + `eventos/memberAdd.js`) y se registra automáticamente en `!historial` de cada usuario. Requiere el permiso **Manage Server** en el bot; si falta, simplemente registra "no se pudo determinar" en vez de fallar.

---

## 💾 Persistencia (recordatorios y encuestas)

Estos datos se guardan en `data/kat.db` (SQLite, vía `better-sqlite3`), así que sobreviven a reinicios del bot.

- **Recordatorios:** un `setInterval` en `servicios/scheduler.js` revisa cada 15 segundos si hay recordatorios vencidos y los envía. Corre independiente del gateway de Discord, así que sigue funcionando aunque el bot esté reconectándose.
- **Encuestas:** el voto es por **comando de texto** (`!votar <id> <número>`), no por reacciones a mensajes — así no hace falta manejar el evento de reacciones para esto todavía. Si más adelante quieres votar con reacciones (👍👎 o números como emoji), es una mejora futura que implicaría ampliar `eventos/messageReact.js` (que ahora mismo solo maneja autoroles).
- Un usuario puede cambiar su voto votando de nuevo; solo cuenta su voto más reciente por encuesta.

---

## 📌 Historial del proyecto

Este bot empezó en Stoat/Revolt y se migró a Discord. El sistema de **dos niveles de permisos** (moderador vs. administrador, configurable con `!setrol`) y el comando `!historial` (que ahora también incluye el rastreo de invitaciones) están completos y funcionando.

---

## 💬 Memoria de conversación en !kat (canal IA)

Con `!canalia on` (solo admins), el canal donde lo ejecutes activa la **memoria** para `!kat`: cada vez que alguien use `!kat <pregunta>` en ese canal, la IA recuerda hasta las últimas **20 peticiones** (pregunta + respuesta) de la conversación, en vez de tratar cada pregunta de forma aislada como hace por defecto en cualquier otro canal.

**Importante — sigue siendo por comando, no automático:** `!kat` sigue siendo obligatorio para que responda. `!canalia on` NO hace que responda a todo lo que se escriba sin prefijo — eso se probó y resultó ser demasiado (respondía a cada mensaje suelto del canal, con el riesgo de disparar la API de Groq constantemente). Ahora es memoria opcional, activación explícita por mensaje.

**Cosas a tener en cuenta:**
- La memoria es **compartida entre todos los que usen `!kat` en ese canal** (como una conversación grupal), no privada por persona. Cada pregunta se etiqueta con el nombre de quien la hizo para que la IA distinga quién dice qué.
- El on/off queda guardado en `data/kat.db` (sobrevive reinicios). La conversación en sí vive en memoria (`utilidades/historialIA.js`) y se pierde si el bot se reinicia, o si apagas/prendes la memoria con `!canalia off` / `!canalia on`.
- Al llegar a 20 peticiones guardadas, la más antigua se descarta para dar espacio a la nueva (FIFO) — conversaciones muy largas van a "olvidar" lo de más atrás, a propósito, para no disparar el tamaño/costo de cada llamada a Groq.
