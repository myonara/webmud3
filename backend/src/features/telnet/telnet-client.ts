import { Socket } from 'net';
import { TelnetSocket, TelnetSocketOptions } from 'telnet-stream';
import { sizeToBuffer } from '../../shared/utils/size-to-buffer.js';
import { logger } from '../logger/winston-logger.js';
import { TelnetCommands } from './models/telnet-commands.js';
import { TelnetOptions } from './models/telnet-options.js';
import { MudOptions } from './types/mud-options.js';
import { TelnetState } from './types/telnet-state.js';

/**
 * Represents a client for handling telnet communication tailored for MUD games.
 */
export class TelnetClient extends TelnetSocket {
  private state: TelnetState = {};

  private readonly telnetConfig = {
    ...TelnetOptions,
    opt2com: TelnetCommands,
  };

  private debugflag: boolean;

  private readonly mudOptions: MudOptions;

  /**
   * Constructs a TelnetClient instance.
   * @param telnetConnection - The socket connection to the MUD server.
   * @param telnetSocketOptions - Options for the Telnet socket.
   * @param clientConnection - The client socket connection.
   * @param mudOptions - Optional settings for the MUD client.
   */
  constructor(
    telnetConnection: Socket,
    telnetSocketOptions: TelnetSocketOptions,
    // Todo[myst]: Remove this dependency
    clientConnection: Socket,
    // Todo[myst]: Remove this dependency
    mudOptions: MudOptions,
  ) {
    super(telnetConnection, telnetSocketOptions);

    // Todo[myst]: Remove this dependency
    this.mudOptions = mudOptions;

    this.debugflag = this.mudOptions?.debugflag || false;

    this.setupEventHandlers(clientConnection);

    logger.info(`[Telnet-Client] Created`, {
      ...telnetSocketOptions,
      ...mudOptions,
    });
  }

  /**
   * Handles the telnet option based on the action type.
   * @param chunkData - The data chunk received from the telnet stream.
   * @param clientConnection - The socket connection to the client.
   * @param action - The telnet action to be handled.
   * @param additionalLogic - Additional logic to be executed for certain telnet options.
   */
  private handleTelnetOption(
    chunkData: number,
    clientConnection: Socket,
    action: 'will' | 'do' | 'wont' | 'dont' | 'sub',
    additionalLogic?: (opt: string, socket_io: Socket) => void,
  ): void {
    const opt = this.telnetConfig.num2opt[chunkData.toString()];

    // Logik zur Debug-Ausgabe
    if (this.debugflag) {
      const logType = action; // 'do', 'will', etc.

      logger.info(`[Telnet-Client] [Client] Emit 'mud.debug'`, {
        id: this.mudOptions?.id,
        type: logType,
        data: opt,
      });

      clientConnection.emit('mud.debug', {
        id: this.mudOptions?.id,
        type: logType,
        data: opt,
      });
    }

    // Standardaktionen für den Zustand setzen
    const stateAction = action === 'do' || action === 'will' ? 'do' : 'dont';

    this.state[opt] = { server: stateAction, client: 'wont' };

    // Ausführen zusätzlicher Logik, falls vorhanden
    if (additionalLogic) {
      additionalLogic(opt, clientConnection);
    }
  }

  /**
   * Sets up event handlers for the socket.
   * @param clientConnection - The socket connection to the client.
   */
  private setupEventHandlers(clientConnection: Socket): void {
    this.on('close', () => this.handleClose(clientConnection));

    this.on('command', (chunkData) =>
      this.handleCommand(chunkData, clientConnection),
    );

    this.on('do', (chunkData) => this.handleDo(chunkData, clientConnection));

    this.on('dont', (chunkData) =>
      this.handleDont(chunkData, clientConnection),
    );

    this.on('will', (chunkData) =>
      this.handleWill(chunkData, clientConnection),
    );

    this.on('wont', (chunkData) =>
      this.handleWont(chunkData, clientConnection),
    );

    this.on('sub', (optin, chunkData) =>
      this.handleSub(optin, chunkData, clientConnection),
    );

    this.on('error', (chunkData) =>
      this.handleError(chunkData, clientConnection),
    );
  }

  private handleClose(socket_io: Socket): void {
    logger.info(`[Telnet-Client] [Telnet] Received message 'close'`);

    if (this.debugflag) {
      socket_io.emit('mud.debug', {
        id: this.mudOptions?.id,
        type: 'close',
        data: '',
      });
    }
  }

  private handleCommand(chunkData: number, socket_io: Socket): void {
    logger.info(`[Telnet-Client] [Telnet] Received message 'command'`);

    const cmd = this.telnetConfig.num2opt[chunkData.toString()];

    if (this.debugflag) {
      socket_io.emit('mud.debug', {
        id: this.mudOptions?.id,
        type: 'command',
        data: cmd,
      });
    }
  }

  private handleDo(chunkData: number, socket_io: Socket): void {
    logger.info(`[Telnet-Client] [Telnet] Received message 'do'`);

    this.handleTelnetOption(chunkData, socket_io, 'do', (opt, socket_io) => {
      if (opt === 'TELOPT_TM') {
        // Timing Mark
        this.writeWill(chunkData);
      } else if (opt === 'TELOPT_NAWS') {
        // Window size
        this.state[opt] = { server: 'do', client: 'will' };

        this.writeWill(chunkData);

        // Spezielle Logik für NAWS
        socket_io.emit(
          'mud-get-naws',
          this.mudOptions?.id,
          (sizeOb: { width: number; height: number }) => {
            const buf = sizeToBuffer(sizeOb.width, sizeOb.height);

            this.writeSub(chunkData, buf);
          },
        );
      } else {
        this.writeWont(chunkData);
      }
    });
  }

  private handleDont(chunkData: number, socket_io: Socket): void {
    logger.info(`[Telnet-Client] [Telnet] Received message 'dont'`);

    this.handleTelnetOption(chunkData, socket_io, 'dont');
  }

  private handleWill(chunkData: number, socket_io: Socket): void {
    logger.info(`[Telnet-Client] [Telnet] Received message 'will'`);

    this.handleTelnetOption(chunkData, socket_io, 'will', (opt, socket_io) => {
      if (opt === 'TELOPT_ECHO') {
        this.writeDo(chunkData);

        this.state[opt].client = 'do';

        socket_io.emit('mud-signal', {
          signal: 'NOECHO-START',
          id: this.mudOptions?.id,
        });
      } else if (
        opt === 'TELOPT_GMCP' &&
        typeof this.mudOptions?.gmcp_support !== 'undefined'
      ) {
        this.writeDo(chunkData);

        this.state[opt].client = 'do';

        socket_io.emit(
          'mud-gmcp-start',
          this.mudOptions.id,
          this.mudOptions.gmcp_support,
        );
      } else {
        this.writeDont(chunkData);
      }
    });
  }

  private handleWont(chunkData: number, socket_io: Socket): void {
    logger.info(`[Telnet-Client] [Telnet] Received message 'wont'`);

    this.handleTelnetOption(chunkData, socket_io, 'wont', (opt, socket_io) => {
      if (opt === 'TELOPT_ECHO') {
        this.writeDont(chunkData);

        socket_io.emit('mud-signal', {
          signal: 'NOECHO-END',
          id: this.mudOptions?.id,
        });
      } else {
        this.writeDont(chunkData);
      }
    });
  }

  private handleSub(optin: number, chunkData: Buffer, socket_io: Socket): void {
    logger.info(`[Telnet-Client] [Telnet] Received message 'sub'`);

    const opt = this.telnetConfig.num2opt[optin.toString()];

    if (this.debugflag) {
      console.log('MUDSOCKET: sub:' + opt + '|' + new Uint8Array(chunkData));
    }

    // Keine weitere Standardlogik; direkt die spezifische Logik implementieren
    if (opt === 'TELOPT_TTYPE' && new Uint8Array(chunkData)[0] === 1) {
      const nullBuf = Buffer.alloc(1, 0); // TELQUAL_IS

      const buf = Buffer.from('WebMud3a');

      const sendBuf = Buffer.concat([nullBuf, buf], buf.length + 1);

      this.writeSub(optin, sendBuf);
    } else if (opt === 'TELOPT_CHARSET' && new Uint8Array(chunkData)[0] === 1) {
      const nullBuf = Buffer.alloc(1, 2); // ACCEPTED

      const buf = Buffer.from('UTF-8');

      const sendBuf = Buffer.concat([nullBuf, buf], buf.length + 1);

      this.writeSub(optin, sendBuf);
    } else if (opt === 'TELOPT_GMCP') {
      const tmpstr = chunkData.toString();

      const ix = tmpstr.indexOf(' ');

      const jx = tmpstr.indexOf('.');

      let jsdata = tmpstr.substr(ix + 1);
      if (ix < 0 || jsdata === '') jsdata = '{}';

      socket_io.emit(
        'mud-gmcp-incoming',
        this.mudOptions?.id,
        tmpstr.substr(0, jx),
        tmpstr.substr(jx + 1, ix - jx),
        JSON.parse(jsdata),
      );
    }
  }

  private handleError(chunkData: Error, socket_io: Socket): void {
    logger.info(`[Telnet-Client] [Telnet] Received message 'error'`);

    console.log('mudSocket-error:' + chunkData);

    if (this.debugflag) {
      socket_io.emit('mud.debug', {
        id: this.mudOptions?.id,
        type: 'error',
        data: chunkData,
      });
    }
  }
}
