// Netlify wrapper around the same handler used by Vercel and the Vite dev server.
import handler from '../../api/ai.js'

export default async (request) => {
  const body = await request.text()
  let statusCode = 200
  const headers = { 'content-type': 'application/json' }
  let payload = ''
  const res = {
    get statusCode() { return statusCode },
    set statusCode(v) { statusCode = v },
    setHeader(k, v) { headers[k] = v },
    end(v) { payload = v },
  }
  await handler({ method: request.method, body }, res)
  return new Response(payload, { status: statusCode, headers })
}
