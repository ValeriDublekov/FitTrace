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
  app.use(express.json());

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

    let dotnetProcess: any = null;
    const ensureDotnetApi = () => {
      fetch('http://127.0.0.1:5000/health').catch(async () => {
        if (!dotnetProcess) {
          const { spawn } = await import('child_process');
          console.log('Spawning .NET 9 API on port 5000 for local AI Studio environment...');
          dotnetProcess = spawn('dotnet', ['run', '--project', 'v2/backend/src/FitTrace.Api', '--urls', 'http://127.0.0.1:5000'], {
            env: { ...process.env, USE_DEV_DB: 'true', ASPNETCORE_ENVIRONMENT: 'Development' }
          });
          dotnetProcess.on('exit', () => { dotnetProcess = null; });
        }
      });
    };
    ensureDotnetApi();

    // Proxy към v2 .NET 9 Web API
    app.all('/api/v2/*', async (req, res) => {
      ensureDotnetApi();
      const targetPath = req.url.replace('/api/v2', '');
      const targetUrl = `http://127.0.0.1:5000${targetPath || '/'}`;

      try {
        const fetchOptions: RequestInit = {
          method: req.method,
          headers: {
            'Content-Type': req.headers['content-type'] || 'application/json',
            ...(req.headers['x-user-id'] ? { 'x-user-id': req.headers['x-user-id'] as string } : {})
          }
        };

        if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
          fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        const backendRes = await fetch(targetUrl, fetchOptions);
        const data = await backendRes.text();
        res.status(backendRes.status);
        res.set('Content-Type', backendRes.headers.get('content-type') || 'application/json');
        res.send(data);
      } catch (err: any) {
        res.status(503).json({
          error: 'V2 .NET API не е достъпен на порт 5000',
          details: err?.message
        });
      }
    });

    // Стартиране на .NET тестовете директно през уеб интерфейса
    app.post('/api/v2-tests/run', async (req, res) => {
      const { exec } = await import('child_process');
      exec('dotnet test v2/backend/FitTrace.sln', (error, stdout, stderr) => {
        res.json({
          success: !error,
          output: stdout || stderr,
          error: error ? error.message : null
        });
      });
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
