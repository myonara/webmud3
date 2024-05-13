import { MudConfig } from '../../shared/types/mud_config.js';

export const DefaultMudConfig: MudConfig = {
  scope: 'server-default',
  href: '/',
  mudfamilies: {
    basistelnet: {
      charset: 'ascii',
      MXP: false,
      GMCP: false,
      GMCP_Support: {},
    },
    unitopia: {
      charset: 'utf8',
      MXP: true,
      GMCP: true,
      GMCP_Support: {
        Sound: {
          version: '1',
          standard: true,
          optional: false,
        },
        Char: {
          version: '1',
          standard: true,
          optional: false,
        },
        'Char.Items': {
          version: '1',
          standard: true,
          optional: false,
        },
        Comm: {
          version: '1',
          standard: true,
          optional: false,
        },
        Playermap: {
          version: '1',
          standard: false,
          optional: true,
        },
        Files: {
          version: '1',
          standard: true,
          optional: false,
        },
      },
    },
  },
  muds: {
    unitopia: {
      name: 'UNItopia',
      host: 'unitopia.de',
      port: 992,
      ssl: true,
      rejectUnauthorized: true,
      description: 'UNItopia via SSL',
      playerlevel: 'all',
      mudfamily: 'unitopia',
    },
    seifenblase: {
      name: 'Seifenblase',
      host: 'seifenblase.de',
      port: 3333,
      ssl: false,
      rejectUnauthorized: false,
      description: 'Seifenblase',
      playerlevel: 'all',
      mudfamily: 'basistelnet',
    },
  },
  routes: {
    '/': 'unitopia',
    seifenblase: 'seifenblase',
  },
};
