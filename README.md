# MCP para la API de actores — guía para la clase

MCP (Model Context Protocol) es un estándar para que un agente de IA use
herramientas externas. En vez de que el agente "adivine" cómo hablarle a una
API, alguien define un puñado de **tools** (funciones con nombre, descripción
y parámetros) y el agente las invoca en lenguaje natural cuando las necesita.

## Paso 1 — Instalar dependencias

```bash
cd mcp-actores
npm install
```

## Paso 2 — Apuntar al server GraphQL desplegado

Abrir `server.js` y reemplazar esta línea con la URL real del Server GraphQL:

```js
const GRAPHQL_URL = process.env.ACTORES_API_URL || "https://TU-APP.onrender.com/graphql";
```

## Paso 3 — Conectar el servidor MCP a un agente de dialogo, como Claude Desktop u OpenCode

Suele ser la configuración de un json 
Verificar que efectivamente está cargando el MCP

## Paso 4 — Probar en lenguaje natural

Probar algunos prompts en lenguaje natural, como 

1. "Mostrame todos los actores registrados."
2. "Agregá a Paul Rudd en la película Ant-Man."
3. "¿Qué actores aparecen en más de una película?"
4. "Actualizá la película de todos los actores de Ant-Man a Ant-Man and the Wasp."

