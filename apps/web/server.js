import express from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = join(__dirname, 'dist')

// Serve AASA with correct content-type
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.sendFile(join(dist, '.well-known/apple-app-site-association'))
})

// Serve static assets with long cache (Vite adds hashes to filenames)
app.use(
  '/assets',
  express.static(join(dist, 'assets'), {
    maxAge: '1y',
    immutable: true,
  })
)

// Serve other static files with short cache
app.use(
  express.static(dist, {
    maxAge: '1h',
    index: false,
    dotfiles: 'allow',
  })
)

// SPA fallback - no cache for index.html (Express 5 syntax)
app.get('/{*path}', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache')
  res.sendFile(join(dist, 'index.html'))
})

app.listen(process.env.PORT || 3000)
