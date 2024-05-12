import { Socket } from 'net';
import { TelnetSocket, TelnetSocketOptions } from 'telnet-stream';

export class MudSocket extends TelnetSocket {
  state: object;
  tel: {
    opt2num: {
      IAC: string;
      DONT: string;
      DO: string;
      WONT: string;
      WILL: string;
      SB: string;
      GA: string;
      EL: string;
      EC: string;
      AYT: string;
      AO: string;
      IP: string;
      BREAK: string;
      DM: string;
      NOP: string;
      SE: string;
      EOR: string;
      ABORT: string;
      SUSP: string;
      SYNCH: string;
      TELOPT_BINARY: string;
      TELOPT_ECHO: string;
      TELOPT_RCP: string;
      TELOPT_SGA: string;
      TELOPT_NAMS: string;
      TELOPT_STATUS: string;
      TELOPT_TM: string;
      TELOPT_RCTE: string;
      TELOPT_NAOL: string;
      TELOPT_NAOP: string;
      TELOPT_NAOCRD: string;
      TELOPT_NAOHTS: string;
      TELOPT_NAOHTD: string;
      TELOPT_NAOFFD: string;
      TELOPT_NAOVTS: string;
      TELOPT_NAOVTD: string;
      TELOPT_NAOLFD: string;
      TELOPT_XASCII: string;
      TELOPT_LOGOUT: string;
      TELOPT_BM: string;
      TELOPT_DET: string;
      TELOPT_SUPDUP: string;
      TELOPT_SUPDUPOUTPUT: string;
      TELOPT_SNDLOC: string;
      TELOPT_TTYPE: string;
      TELOPT_EOR: string;
      TELOPT_TUID: string;
      TELOPT_OUTMRK: string;
      TELOPT_TTYLOC: string;
      TELOPT_NAWS: string;
      TELOPT_TSPEED: string;
      TELOPT_LFLOW: string;
      TELOPT_LINEMODE: string;
      TELOPT_XDISPLOC: string;
      TELOPT_ENVIRON: string;
      TELOPT_AUTHENTICATION: string;
      TELOPT_ENCRYPT: string;
      TELOPT_NEWENV: string;
      TELOPT_CHARSET: string;
      TELOPT_STARTTLS: string;
      TELOPT_MSSP: string;
      TELOPT_COMPRESS: string;
      TELOPT_MSP: string;
      TELOPT_MXP: string;
      TELOPT_ZMP: string;
      TELOPT_MUSHCLIENT: string;
      TELOPT_ATCP: string;
      TELOPT_GMCP: string;
      TELOPT_EXOPL: string;
    };
    opt2com: {
      IAC: string;
      DONT: string;
      DO: string;
      WONT: string;
      WILL: string;
      SB: string;
      GA: string;
      EL: string;
      EC: string;
      AYT: string;
      AO: string;
      IP: string;
      BREAK: string;
      DM: string;
      NOP: string;
      SE: string;
      EOR: string;
      ABORT: string;
      SUSP: string;
      SYNCH: string;
      TELOPT_BINARY: string;
      TELOPT_ECHO: string;
      TELOPT_RCP: string;
      TELOPT_SGA: string;
      TELOPT_NAMS: string;
      TELOPT_STATUS: string;
      TELOPT_TM: string;
      TELOPT_RCTE: string;
      TELOPT_NAOL: string;
      TELOPT_NAOP: string;
      TELOPT_NAOCRD: string;
      TELOPT_NAOHTS: string;
      TELOPT_NAOHTD: string;
      TELOPT_NAOFFD: string;
      TELOPT_NAOVTS: string;
      TELOPT_NAOVTD: string;
      TELOPT_NAOLFD: string;
      TELOPT_XASCII: string;
      TELOPT_LOGOUT: string;
      TELOPT_BM: string;
      TELOPT_DET: string;
      TELOPT_SUPDUP: string;
      TELOPT_SUPDUPOUTPUT: string;
      TELOPT_SNDLOC: string;
      TELOPT_TTYPE: string;
      TELOPT_EOR: string;
      TELOPT_TUID: string;
      TELOPT_OUTMRK: string;
      TELOPT_TTYLOC: string;
      TELOPT_NAWS: string;
      TELOPT_TSPEED: string;
      TELOPT_LFLOW: string;
      TELOPT_LINEMODE: string;
      TELOPT_XDISPLOC: string;
      TELOPT_ENVIRON: string;
      TELOPT_AUTHENTICATION: string;
      TELOPT_ENCRYPT: string;
      TELOPT_NEWENV: string;
      TELOPT_CHARSET: string;
      TELOPT_STARTTLS: string;
      TELOPT_MSSP: string;
      TELOPT_COMPRESS: string;
      TELOPT_MSP: string;
      TELOPT_MXP: string;
      TELOPT_ZMP: string;
      TELOPT_MUSHCLIENT: string;
      TELOPT_ATCP: string;
      TELOPT_GMCP: string;
      TELOPT_EXOPL: string;
    };
    num2opt: object;
  };
  _moptions: {
    gmcp_support?: unknown;
    id?: string;
    debugflag?: boolean;
  };
  debugflag: boolean;
  txtToBuffer(text: string) {
    const result = [];
    let i = 0;
    text = encodeURI(text);
    while (i < text.length) {
      const c = text.charCodeAt(i++);

      // if it is a % sign, encode the following 2 bytes as a hex value
      if (c === 37) {
        result.push(parseInt(text.substr(i, 2), 16));
        i += 2;

        // otherwise, just the actual byte
      } else {
        result.push(c);
      }
    }
    return Buffer.from(result);
  }

  val16ToBuffer(result: unknown[], val: number) {
    result.push((val & 0xff00) >> 8);
    result.push(val & 0xff);
    return result;
  }

  sizeToBuffer(w: number, h: number) {
    let result = [];
    result = this.val16ToBuffer(result, w);
    result = this.val16ToBuffer(result, h);
    return Buffer.from(result);
  }

  // topt: bufferSize, errorPolicy(discardBoth,keepData,keep_both)
  //       other options from stream: https://nodejs.org/api/stream.html
  constructor(
    _socket: Socket,
    topt: TelnetSocketOptions,
    mopt: {
      debugflag?: boolean;
      id?: string;
      gmcp_support?: boolean;
      charset?: string;
    },
    socket_io: Socket,
  ) {
    super(_socket, topt);
    console.log('MUDSOCKET: creating');
    this.state = {};
    this.tel = {
      opt2num: {
        IAC: '255',
        DONT: '254',
        DO: '253',
        WONT: '252',
        WILL: '251',
        SB: '250',
        GA: '249',
        EL: '248',
        EC: '247',
        AYT: '246',
        AO: '245',
        IP: '244',
        BREAK: '243',
        DM: '242',
        NOP: '241',
        SE: '240',
        EOR: '239',
        ABORT: '238',
        SUSP: '237',
        SYNCH: '242',
        TELOPT_BINARY: '0',
        TELOPT_ECHO: '1',
        TELOPT_RCP: '2',
        TELOPT_SGA: '3',
        TELOPT_NAMS: '4',
        TELOPT_STATUS: '5',
        TELOPT_TM: '6',
        TELOPT_RCTE: '7',
        TELOPT_NAOL: '8',
        TELOPT_NAOP: '9',
        TELOPT_NAOCRD: '10',
        TELOPT_NAOHTS: '11',
        TELOPT_NAOHTD: '12',
        TELOPT_NAOFFD: '13',
        TELOPT_NAOVTS: '14',
        TELOPT_NAOVTD: '15',
        TELOPT_NAOLFD: '16',
        TELOPT_XASCII: '17',
        TELOPT_LOGOUT: '18',
        TELOPT_BM: '19',
        TELOPT_DET: '20',
        TELOPT_SUPDUP: '21',
        TELOPT_SUPDUPOUTPUT: '22',
        TELOPT_SNDLOC: '23',
        TELOPT_TTYPE: '24',
        TELOPT_EOR: '25',
        TELOPT_TUID: '26',
        TELOPT_OUTMRK: '27',
        TELOPT_TTYLOC: '28',
        TELOPT_NAWS: '31',
        TELOPT_TSPEED: '32',
        TELOPT_LFLOW: '33',
        TELOPT_LINEMODE: '34',
        TELOPT_XDISPLOC: '35',
        TELOPT_ENVIRON: '36',
        TELOPT_AUTHENTICATION: '37',
        TELOPT_ENCRYPT: '38',
        TELOPT_NEWENV: '39',
        TELOPT_CHARSET: '42',
        TELOPT_STARTTLS: '46',
        TELOPT_MSSP: '70',
        TELOPT_COMPRESS: '85',
        TELOPT_MSP: '90',
        TELOPT_MXP: '91',
        TELOPT_ZMP: '93',
        TELOPT_MUSHCLIENT: '102',
        TELOPT_ATCP: '200',
        TELOPT_GMCP: '201',
        TELOPT_EXOPL: '255',
      },
      opt2com: {
        IAC: '/* interpret as command: */',
        DONT: '/* you are not to use option */',
        DO: '/* please, you use option */',
        WONT: '/* I won"t use option */',
        WILL: '/* I will use option */',
        SB: '/* interpret as subnegotiation */',
        GA: '/* you may reverse the line */',
        EL: '/* erase the current line */',
        EC: '/* erase the current character */',
        AYT: '/* are you there */',
        AO: '/* abort output--but let prog finish */',
        IP: '/* interrupt process--permanently */',
        BREAK: '/* break */',
        DM: '/* data mark--for connect. cleaning */',
        NOP: '/* nop */',
        SE: '/* end sub negotiation */',
        EOR: '/* end of record (transparent mode) */',
        ABORT: '/* Abort process */',
        SUSP: '/* Suspend process */',
        SYNCH: '/* for telfunc calls */',
        TELOPT_BINARY: '/* 8-bit data path */',
        TELOPT_ECHO: '/* echo */',
        TELOPT_RCP: '/* prepare to reconnect */',
        TELOPT_SGA: '/* suppress go ahead */',
        TELOPT_NAMS: '/* approximate message size */',
        TELOPT_STATUS: '/* give status */',
        TELOPT_TM: '/* timing mark */',
        TELOPT_RCTE: '/* remote controlled transmission and echo */',
        TELOPT_NAOL: '/* negotiate about output line width */',
        TELOPT_NAOP: '/* negotiate about output page size */',
        TELOPT_NAOCRD: '/* negotiate about CR disposition */',
        TELOPT_NAOHTS: '/* negotiate about horizontal tabstops */',
        TELOPT_NAOHTD: '/* negotiate about horizontal tab disposition */',
        TELOPT_NAOFFD: '/* negotiate about formfeed disposition */',
        TELOPT_NAOVTS: '/* negotiate about vertical tab stops */',
        TELOPT_NAOVTD: '/* negotiate about vertical tab disposition */',
        TELOPT_NAOLFD: '/* negotiate about output LF disposition */',
        TELOPT_XASCII: '/* extended ascic character set */',
        TELOPT_LOGOUT: '/* force logout */',
        TELOPT_BM: '/* byte macro */',
        TELOPT_DET: '/* data entry terminal */',
        TELOPT_SUPDUP: '/* supdup protocol */',
        TELOPT_SUPDUPOUTPUT: '/* supdup output */',
        TELOPT_SNDLOC: '/* send location */',
        TELOPT_TTYPE: '/* terminal type */',
        TELOPT_EOR: '/* end or record */',
        TELOPT_TUID: '/* TACACS user identification */',
        TELOPT_OUTMRK: '/* output marking */',
        TELOPT_TTYLOC: '/* terminal location number */',
        TELOPT_NAWS: '/* window size */',
        TELOPT_TSPEED: '/* terminal speed */',
        TELOPT_LFLOW: '/* remote flow control */',
        TELOPT_LINEMODE: '/* Linemode option */',
        TELOPT_XDISPLOC: '/* X Display Location */',
        TELOPT_ENVIRON: '/* Environment opt for Port ID */',
        TELOPT_AUTHENTICATION: '/* authentication */',
        TELOPT_ENCRYPT: '/* authentication */',
        TELOPT_NEWENV: '/* Environment opt for Port ID */',
        TELOPT_CHARSET: '/* charset */',
        TELOPT_STARTTLS: '/* Transport Layer Security */',
        TELOPT_MSSP: '/* Mud Server Status Protocol */',
        TELOPT_COMPRESS: '/* Mud Compression Protocol, v.1 */',
        TELOPT_MSP: '/* Mud Sound Protocol */',
        TELOPT_MXP: '/* Mud Extension Protocol */',
        TELOPT_ZMP: '/* Zenith Mud Protocol */',
        TELOPT_MUSHCLIENT: '/* Mushclient/Aardwolf Protocol */',
        TELOPT_ATCP: '/* Achaea Telnet Client Protocol */',
        TELOPT_GMCP: '/* Generic MUD Communication Protocol */',
        TELOPT_EXOPL: '/* extended-options-list */',
      },
      num2opt: {},
    };
    for (const key in this.tel.opt2num) {
      if (this.tel.opt2num.hasOwnProperty(key) && key != 'TELOPT_EXOPL') {
        this.tel.num2opt[this.tel.opt2num[key]] = key;
      }
    }
    let buf;
    this._moptions = mopt || {};
    this.debugflag =
      typeof this._moptions.debugflag !== 'undefined' &&
      this._moptions.debugflag &&
      typeof socket_io !== 'undefined';
    super.on('close', () => {
      if (this.debugflag) {
        socket_io.emit('mud.debug', {
          id: this._moptions.id,
          type: 'close',
          data: '',
        });
      }
    });
    super.on('command', (chunkData) => {
      const cmd = this.tel.num2opt[chunkData.toString()];
      if (this.debugflag) {
        socket_io.emit('mud.debug', {
          id: this._moptions.id,
          type: 'command',
          data: cmd,
        });
      }
    });
    super.on('do', (chunkData) => {
      const opt = this.tel.num2opt[chunkData.toString()];
      if (this.debugflag) {
        if (opt != 'TELOPT_TM') {
          // supress log for timemsg...
          console.log('MUDSOCKET: do:' + opt);
        }
        socket_io.emit('mud.debug', {
          id: this._moptions.id,
          type: 'do',
          data: opt,
        });
      }
      this.state[opt] = { server: 'do', client: 'wont' };
      switch (opt) {
        case 'TELOPT_TM' /* timing mark */:
          this.writeWill(chunkData);
          break;
        case 'TELOPT_NAWS' /* window size */:
          this.state[opt] = { server: 'do', client: 'will' };
          this.writeWill(chunkData);
          socket_io.emit('mud-get-naws', this._moptions.id, (sizeOb) => {
            if (sizeOb === false) {
              return;
            }
            buf = this.sizeToBuffer(sizeOb.width, sizeOb.height);
            if (this.debugflag) {
              console.log('MUDSOCKET: NAWS-buf:', buf, sizeOb);
            }
            this.writeSub(chunkData, buf);
          });
          break; // TODO calc windows size and report...
        case 'TELOPT_TTYPE' /* terminal type */:
          this.state[opt] = { server: 'do', client: 'will' };
          this.writeWill(chunkData);
          break;
        default:
          this.writeWont(chunkData);
          break;
      }
    });
    super.on('dont', (chunkData) => {
      const opt = this.tel.num2opt[chunkData.toString()];
      if (this.debugflag) {
        console.log('MUDSOCKET: dont:' + opt);
        socket_io.emit('mud.debug', {
          id: this._moptions.id,
          type: 'dont',
          data: opt,
        });
      }
      this.state[opt] = { server: 'dont', client: 'wont' };
      switch (opt) {
        default:
          this.writeWont(chunkData);
          break;
      }
    });
    super.on('will', (chunkData) => {
      const opt = this.tel.num2opt[chunkData.toString()];
      if (this.debugflag) {
        console.log('MUDSOCKET: will:' + opt);
        socket_io.emit('mud.debug', {
          id: this._moptions.id,
          type: 'will',
          data: opt,
        });
      }
      this.state[opt] = { server: 'will', client: 'dont' };
      switch (opt) {
        case 'TELOPT_ECHO' /* echo */:
          this.writeDo(chunkData);
          this.state[opt].client = 'do';
          socket_io.emit('mud-signal', {
            signal: 'NOECHO-START',
            id: this._moptions.id,
          });
          break;
        case 'TELOPT_EOR':
          this.writeDont(chunkData);
          break; /* end or record */
        case 'TELOPT_CHARSET':
          this.writeDo(chunkData);
          break; /* charset */
        case 'TELOPT_GMCP' /* Generic MUD Communication Protocol */:
          if (typeof this._moptions.gmcp_support !== 'undefined') {
            this.writeDo(chunkData);
            this.state[opt].client = 'do';
            socket_io.emit(
              'mud-gmcp-start',
              this._moptions.id,
              this._moptions.gmcp_support,
            );
          } else {
            this.writeDont(chunkData);
          }
          break;
        default:
          this.writeDont(chunkData);
          break;
      }
    });
    super.on('wont', (chunkData) => {
      const opt = this.tel.num2opt[chunkData.toString()];
      if (this.debugflag) {
        console.log('MUDSOCKET: wont:' + opt);
        socket_io.emit('mud.debug', {
          id: this._moptions.id,
          type: 'wont',
          data: opt,
        });
      }
      this.state[opt] = { server: 'wont', client: 'dont' };
      switch (opt) {
        case 'TELOPT_ECHO' /* echo */:
          this.writeDont(chunkData);
          socket_io.emit('mud-signal', {
            signal: 'NOECHO-END',
            id: this._moptions.id,
          });
          break;
        default:
          this.writeDont(chunkData);
          break;
      }
    });
    super.on('sub', (optin, chunkData) => {
      const opt = this.tel.num2opt[optin.toString()];
      const subInput = new Uint8Array(chunkData);
      if (opt != 'TELOPT_GMCP' && this.debugflag) {
        console.log('MUDSOCKET: sub:' + opt + '|' + subInput);
      }
      switch (opt) {
        case 'TELOPT_TTYPE' /* terminal type */:
          if (subInput.length == 1 && subInput[0] == 1) {
            // TELQUAL_SEND
            const nullBuf = Buffer.alloc(1);
            nullBuf[0] = 0; // TELQUAL_IS
            buf = Buffer.from('WebMud3a');
            const sendBuf = Buffer.concat([nullBuf, buf], buf.length + 1);
            if (this.debugflag) {
              console.log('MUDSOCKET: TTYPE: ', sendBuf);
            }
            this.writeSub(optin, sendBuf);
          }
          break;
        case 'TELOPT_CHARSET' /* charset */:
          if (this.debugflag) {
            console.log('MUDSOCKET: SB CHARSET:', chunkData.toString());
          }
          if (subInput.length >= 1 && subInput[0] == 1) {
            // TELQUAL_SEND
            const nullBuf = Buffer.alloc(1);
            nullBuf[0] = 2; // ACCEPTED
            buf = Buffer.from('UTF-8');
            const sendBuf = Buffer.concat([nullBuf, buf], buf.length + 1);
            if (this.debugflag) {
              console.log('MUDSOCKET: SB-Accept CHARSET: ', sendBuf);
            }
            this.writeSub(optin, sendBuf);
          }
          break;
        case 'TELOPT_GMCP' /* Generic MUD Communication Protocol */:
          const tmpstr = chunkData.toString();
          let ix = tmpstr.indexOf(' ');
          const jx = tmpstr.indexOf('.');
          let jsdata = tmpstr.substr(ix + 1);
          if (ix < 0 || jsdata == '') {
            jsdata = '{}';
            ix = tmpstr.length;
          }
          if (this.debugflag) {
            console.log('MUDSOCKET: GMCP-incoming: ', tmpstr);
          }
          socket_io.emit(
            'mud-gmcp-incoming',
            this._moptions.id,
            tmpstr.substr(0, jx),
            tmpstr.substr(jx + 1, ix - jx),
            JSON.parse(jsdata),
          );
          break;
      }
      socket_io.emit('mud.debug', {
        id: this._moptions.id,
        type: 'sub',
        option: opt,
        data: chunkData,
      });
    });
    super.on('error', (chunkData) => {
      console.log('mudSocket-error:' + chunkData);
      if (this.debugflag) {
        socket_io.emit('mud.debug', {
          id: this._moptions.id,
          type: 'error',
          data: chunkData,
        });
      }
    });
    console.log('MUDSOCKET: created');
  }
}
