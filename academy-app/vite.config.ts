import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { collectResourceFiles } from './src/content/resources'

const BASE = '/academy/claude/'

/**
 * Publie les fichiers d'exemple (CSV, JSON, CLAUDE.md, SKILL.md…) issus du contenu
 * sous `/academy/claude/resources/nova/<fichier>` (build + serveur de dev).
 */
function novaResources(): Plugin {
  const files = collectResourceFiles()
  return {
    name: 'dpg-nova-resources',
    configureServer(server) {
      server.middlewares.use(`${BASE}resources/nova/`, (req, res, next) => {
        const name = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, ''))
        const file = files.find((f) => f.filename === name)
        if (!file) return next()
        res.setHeader('Content-Type', `${file.mimeType}; charset=utf-8`)
        res.end(file.content)
      })
    },
    generateBundle() {
      for (const f of files) {
        this.emitFile({ type: 'asset', fileName: `resources/nova/${f.filename}`, source: f.content })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [react(), novaResources()],
  build: {
    outDir: '../academy/claude',
    emptyOutDir: true,
    // Le contenu pédagogique (8 modules) est embarqué dans le bundle.
    chunkSizeWarningLimit: 1200,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
