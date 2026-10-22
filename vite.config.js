import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import aiHandler from './api/ai.js'

// Serves /api/ai in `npm run dev`; the same file is a Vercel/Netlify function in production.
function aiDevPlugin() {
  return {
    name: 'ai-dev-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        req.body = Buffer.concat(chunks).toString('utf8')
        try {
          await aiHandler(req, res)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make .env values available to the dev version of /api/ai (server side only).
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }
  return {
    plugins: [react(), aiDevPlugin()],
    server: { host: '0.0.0.0', allowedHosts: true },
    preview: { host: '0.0.0.0', allowedHosts: true },
  }
})
