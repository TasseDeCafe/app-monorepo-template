import express from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = join(__dirname, 'dist')

// Serve AASA with correct content-type (all bundle IDs for all environments)
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.json({
    applinks: {
      apps: [],
      details: [
        { appID: 'NPWJ2C5977.com.template-app.ios', paths: ['*'] },
        { appID: 'NPWJ2C5977.com.template-app.ios.preview', paths: ['*'] },
        { appID: 'NPWJ2C5977.com.template-app.ios.dev', paths: ['*'] },
      ],
    },
  })
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
