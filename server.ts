import 'zone.js/dist/zone-node';
import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { ngExpressEngine } from '@nguniversal/express-engine';
import bootstrap from './src/main.server';

// Função para configurar e exportar o aplicativo Express
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../dist/cagoeta-ai/browser');
  const indexHtml = join(browserDistFolder, 'index.html');

  // Configuração do Angular Universal Engine para SSR
  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: bootstrap,
    })
  );
  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Servir arquivos estáticos
  server.use(express.static(browserDistFolder, { maxAge: '1y' }));

  // Todas as rotas usam o Angular engine
  server.get('*', (req, res, next) => {
    const { baseUrl } = req;
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    });
  });

  return server;
}

// Função para iniciar o servidor Node
function run(): void {
  try {
    const port = process.env['PORT'] || 4000;
    const server = app();

    server.listen(port, () => {
      console.log(`Node Express server escutando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
}

run();