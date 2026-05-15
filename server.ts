import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

    const soundsPath = path.resolve(process.cwd(), 'public/sounds');
    
    // API routes
    app.get('/api/sounds', async (req, res) => {
      try {
        console.log(`Searching for sounds in: ${soundsPath}`);
        // Ensure directory exists
        await fs.mkdir(soundsPath, { recursive: true });
        
        const files = await fs.readdir(soundsPath);
        const soundFiles = files
          .filter(file => {
            const lower = file.toLowerCase();
            return (lower.endsWith('.mp3') || lower.endsWith('.wav')) && !file.startsWith('.');
          });
        
        console.log(`Found ${soundFiles.length} sound files`);

        // Also update/create sounds.json for static fallback
        try {
          await fs.writeFile(
            path.resolve(process.cwd(), 'public/sounds.json'),
            JSON.stringify(soundFiles, null, 2)
          );
        } catch (we) {
          console.warn('Could not write sounds.json manifest', we);
        }

        res.json(soundFiles);
      } catch (error) {
        console.error('Error reading sounds directory:', error);
        res.status(500).json([]);
      }
    });

  // Use Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false // Explicitly disable HMR to prevent WebSocket errors in this environment
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    // Fallback to index.html for SPA in development
    app.use('*', async (req: any, res: any, next: any) => {
      const url = req.originalUrl;
      try {
        let template = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
    console.log('Vite middleware and fallback enabled');
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // SPA fallback for production
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
