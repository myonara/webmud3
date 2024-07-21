import { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// import authRoutes from '../../features/auth/auth-routes.js';
import { logger } from '../../shared/utils/logger.js';
import { Environment } from '../environment/environment.js';

export const useRoutes = (app: Express) => {
  // app.use('/api/auth', authRoutes);

  app.get('/manifest.webmanifest', function (req: Request, res: Response) {
    logger.info(`[Routes] requested manifest.webmanifest`);

    fs.readFile(
      path.join(__dirname, 'dist', 'manifest.webmanifest'),
      function (err, data) {
        if (err) {
          res.sendStatus(404);
        } else {
          res.send(data);
        }
      },
    );
  });

  app.get('/ace/*', (req: Request, res: Response) => {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.socket ? req.socket.remoteAddress : null);

    const mypath = req.path.substr(5);

    logger.debug('ACE Path:', { real_ip: ip, path: mypath });

    res.sendFile(
      path.join(
        __dirname,
        'node_modules/ace-builds/src-min-noconflict/' + mypath,
      ),
    );
  });

  app.get('*', (req: Request, res: Response) => {
    const allip =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.socket ? req.socket.remoteAddress : null);    const reqpath = req.path.substr(5);
    logger.debug('ACE Path:', { real_ip: allip, path: reqpath });
    logger.info(`[Routes] requested * - delivering index.html`);

    res.sendFile(
      path.join(Environment.getInstance().projectRoot, 'wwwroot/index.html'),
    );
  });
};
