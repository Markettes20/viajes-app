# Asistente de Anillo Travel (cerebro)

Servidor pequeño (Cloudflare Worker) que responde preguntas de clientes con los datos de su viaje + la guía de Cristina (`guia.md`), usando Claude.
Hoy solo tiene el cerebro. Falta conectarle la entrada (pestaña en la app y/o WhatsApp).

## Cómo se publica (una sola vez)
1. Cuenta gratis en Cloudflare.
2. En esta carpeta: `npx wrangler login`, luego `npx wrangler secret put ANTHROPIC_API_KEY` (pegar la clave; NUNCA en el repo) y `npx wrangler deploy`.
3. Probar:
   `curl -X POST https://anillo-asistente.<tu-cuenta>.workers.dev -H "Origin: https://markettes20.github.io" -H "Content-Type: application/json" -d '{"code":"ANI-7K4P9","message":"a q ora tengo q estar en el aeropuerto"}'`

## Qué hace
- Busca `data/trips/<código>.json` en la app publicada. Si el viaje ha caducado, no responde.
- Responde corto y en español; si es urgente o no lo sabe, devuelve `handoff:true` y un enlace de WhatsApp a Cristina con nombre, código y pregunta.
- Tope de 30 preguntas al día por viaje (con KV opcional) y 500 caracteres por pregunta.
- Solo acepta peticiones desde el origen de la app.

## Limitaciones actuales
- Los viajes FLY (solo vuelos) no tienen los vuelos en los archivos públicos (están cifrados en el panel), así que el asistente aún no los conoce; hay que decidir cómo darle esos datos sin hacerlos públicos.
- `guia.md` es un borrador con puntos [CONFIRMAR]; sin revisión de Cristina no debe usarse con clientes reales.
- El repo es público: la guía no debe llevar nada privado.
