import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy, ChangeDetectorRef, Input, AfterViewChecked } from '@angular/core';
import { SocketService } from '../../shared/socket.service';
import { MudMessage } from '../mud-message';
import { DebugData } from '../debug-data';
import { AnsiService } from '../ansi.service';
import { AnsiData } from '../ansi-data';
import { WebmudConfig } from '../webmud-config';
import { ServerConfigService } from '../../shared/server-config.service';
import { WindowsService } from 'src/app/nonmodal/windows.service';
import { WindowConfig } from 'src/app/nonmodal/window-config';
import { FilesService } from '../files.service';
import { FileInfo } from '../file-info';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'app-mudclient',
  templateUrl: './mudclient.component.html',
  styleUrls: ['./mudclient.component.css']
})
export class MudclientComponent implements AfterViewChecked,OnInit,OnDestroy {

  @Input() cfg : WebmudConfig;
  @ViewChild('mudBlock', {static: false}) mudBlock : ElementRef;
  @ViewChild('mudInput', {static: false}) mudInput: ElementRef;
  @ViewChild('mudTest', {static: false}) mudTest: ElementRef;
  @ViewChild('mudMenu', {static: false}) mudMenu : ElementRef;
  @ViewChild('scroller', {static: false}) scroller: ElementRef; 

  public mudc_id : string;
  private mudName : string = 'disconnect';
  public connected : boolean;
  public sizeCalculated : boolean = false;
  public sizeCalculated2 : boolean = false;
  public inpType : string = 'text';
  private mudc_width : number = 80;
  private mudc_height : number;
  public ref_width : number;
  public ref_height: number;
  private ref_height_ratio:number;
  private obs_connect;
  private obs_connected;
  private obs_data;
  private obs_debug;
  private obs_signals;
  private ansiCurrent: AnsiData;
  private filesWindow: WindowConfig;
  public mudlines : AnsiData[] = [];
  public messages : MudMessage[] = [];
  public logfile : string = "";
  public inpmessage : string;
  private inpHistory : string[] = [];
  private inpPointer : number = -1;
  public lastdbg : DebugData;
  private startCnt : number = 0;
  public togglePing : boolean = false;
  public colourInvert : boolean = false;
  public stdfg : string ='white';
  public stdbg : string ='black';
  public localEchoActive : boolean = true;
  public localEchoColor: string = '#a8ff00';
  public localEchoBackground: string = "#000000";
  public blackOnWhite: boolean = false;
  public colorOff : boolean=false;

  scroll() {
    this.mudBlock.nativeElement.scrollTo(this.scroller.nativeElement.scrollLeft,0);
  }
  
  constructor(
    private socketService: SocketService,
    private ansiService:AnsiService,
    private cdRef:ChangeDetectorRef,
    private wincfg:WindowsService,
    private filesrv: FilesService,
    private logger:NGXLogger,
    private srvcfgService:ServerConfigService) { 

    }

    menuAction(act : string) {
      this.logger.trace('mudclient-menuAction',this.mudc_id,this.mudName,act);
      var self = this;
      switch(act) {
        case 'connect':
            if (typeof this.cfg !== 'undefined' && typeof this.cfg.mudname !== 'undefined'
                  && this.cfg.mudname !== '') {
              this.mudName = this.cfg.mudname;
              this.connect();
            } 
            return;
        case 'disconnect':
            this.wincfg.closeAllWindows();
            this.mudName = 'disconnect';
            this.connect();
            return;
        case 'loginPortal': return; // TODO  redirect to /login.
        case 'colorOff=true':  this.colorOff = true; break;
        case 'colorOff=false': this.colorOff = false; break;
        case 'invert=true':  this.colourInvert = true; break;
        case 'invert=false': this.colourInvert = false; break;
        case 'blackOnWhite=true':  this.blackOnWhite=true; break;
        case 'blackOnWhite=false': this.blackOnWhite=false; break;
        case 'ping':
            this.socketService.sendPing(this.mudc_id);
            return;
        case 'displayLog':
            var cfg = new WindowConfig();
            var mylogfile = new FileInfo();
            cfg.wtitle = "logfile";
            this.wincfg.newWindow(cfg);//displayLog
            return;
        case 'displayViewConfig=true': // TODO einmal-Screen.
            var cfg = new WindowConfig();
            cfg.wtitle = "Konfiguration der Anzeige";
            cfg.component = 'ConfigviewerComponent';
            cfg.outGoingEvents.subscribe(x => {
              switch(x) {
                case 'colorOff=true':  self.colorOff = true; break;
                case 'colorOff=false': self.colorOff = false; break;
                case 'invert=true':  self.colourInvert = true; break;
                case 'invert=false': self.colourInvert = false; break;
                case 'blackOnWhite=true':  self.blackOnWhite=true; break;
                case 'blackOnWhite=false': self.blackOnWhite=false; break;
                case 'localEcho=true':  self.localEchoActive = true; break;
                case 'localEcho=false': self.localEchoActive = false; break;
                default:
                    var xsplit = x.split("=");
                    switch (xsplit[0]) {
                      case "LocalEchoColor":
                        self.localEchoColor = xsplit[1];
                        return;
                      case "LocalEchoBackground":
                        self.localEchoBackground = xsplit[1];
                        return;
                      default:
                        self.logger.error('mudclient-menuAction-Unknown ConfigviewerMessage',x);
                        return;
                    }
              }
              if (self.blackOnWhite || self.colourInvert) {
                self.stdbg = 'white';self.stdfg = 'black';
              } else {
                self.stdbg = 'black';self.stdfg = 'white'; 
              }
            }, error => {
              self.logger.error('mudclient-menuAction-outGoingEvents.subscribe-error',this.mudc_id,this.mudName,error);
            }, ()=>{

            })
            this.wincfg.newWindow(cfg);//DisplayConfig
            return;
        default: 
          self.logger.error('mudclient-menuAction-unknown act',this.mudc_id,this.mudName,act);
          return;
      }
      if (this.blackOnWhite || this.colourInvert) {
        this.stdbg = 'white';this.stdfg = 'black';
      } else {
        this.stdbg = 'black';this.stdfg = 'white'; 
      }
    }

    private connect() {
    if (this.mudName.toLowerCase() == 'disconnect') {
      if (this.mudc_id) {
        this.logger.info('mudclient-connect',this.mudc_id);
        if (this.obs_debug) this.obs_debug.unsubscribe();
        if (this.obs_data) this.obs_data.unsubscribe();
        if (this.obs_signals) this.obs_signals.unsubscribe();
        if (this.obs_connect) this.obs_connect.unsubscribe();// including disconnect
        this.connected = false;
        this.mudc_id = undefined;
        return;
      }
    }
    const other = this;
    const mudOb = {mudname:this.mudName,height:this.mudc_height,width:this.mudc_width}; // TODO options???
    this.wincfg.setTitle(this.srvcfgService.getWebmudName()+" "+this.mudName);// TODO portal!!!
    if (this.cfg.autoUser != '') {
      mudOb['user'] = this.cfg.autoUser;
      mudOb['token'] = this.cfg.autoToken;
      mudOb['password'] = this.cfg.autoPw || '';
    }
    this.obs_connect = this.socketService.mudConnect(mudOb).subscribe(_id => {
      if (_id == null) {
        other.connected = false;
        other.mudc_id = undefined;
        other.logger.error('mudclient-socketService.mudConnect-failed',_id);
        return;
      }
      other.mudc_id = _id;
      other.obs_connected = other.socketService.mudConnectStatus(_id).subscribe(
          flag => {other.connected = flag;
        });
      other.obs_signals = other.socketService.mudReceiveSignals(_id).subscribe( 
          musi => {
            other.logger.debug('mudclient-socketService.mudReceiveSignals',_id,musi.signal);
            other.logger.trace('mudclient-socketService.mudReceiveSignals',_id,musi);
            switch (musi.signal) {
              case 'NOECHO-START': other.inpType = 'password'; break;
              case 'NOECHO-END':   other.inpType = 'text'; break;
              case 'name@mud':
                if (typeof musi.wizard !== 'undefined') {
                  this.filesrv.startFilesModule();
                }
                break;
              case 'Sound.Play.Once':
                let audio = new Audio();
                audio.src = musi.playSoundFile;
                audio.load();
                audio.play();
                break;
              case 'Files.URL':
                let newfile = this.filesrv.processFileInfo(musi.fileinfo);
                if (newfile.alreadyLoaded) {
                  other.logger.trace('Files.URL-alreadyLoaded',_id,newfile);
                } else {
                  newfile.save04_closing = function(windowsid) {
                    other.logger.debug('Files.URL-save04_closing',_id,windowsid);
                    other.wincfg.SavedAndClose(windowsid);
                  }
                  newfile.save05_error = function(windowsid,error) {
                    other.logger.error('Files.URL-save05_error',_id,windowsid,error);
                    other.wincfg.WinError(windowsid,error);
                  }
                  newfile.save06_success = function(windowsid) {
                    other.logger.debug('Files.URL-save06_success',_id,windowsid);
                    other.wincfg.SaveComplete(windowsid);
                  }
                  other.logger.trace('Files.URL-firstLoad',_id,newfile);
                  let filewincfg : WindowConfig = new WindowConfig();
                  filewincfg.component = 'EditorComponent';
                  filewincfg.data = newfile;
                  if (typeof newfile.title !== 'undefined' && newfile.title != '') {
                    filewincfg.wtitle = newfile.title;
                  } else {
                    filewincfg.wtitle = newfile.filename;
                    filewincfg.tooltip = newfile.file;
                  }
                  if (!newfile.newfile){
                    newfile.load(function(err,data) {
                      if (typeof err !== 'undefined') {
                      } else {
                        newfile.content = data;
                        newfile.oldContent = data;
                        filewincfg.data = newfile;
                        filewincfg.save = true;
                        const windowsid = other.wincfg.newWindow(filewincfg);
                        newfile.relateWindow(windowsid);
                      }
                    })
                  } else {
                    newfile.content = '';
                    newfile.oldContent = '';
                    filewincfg.data = newfile;
                    filewincfg.save = true;
                    const windowsid = other.wincfg.newWindow(filewincfg);
                    newfile.relateWindow(windowsid);
                  }
                }
                return;
              case 'Files.Dir':
                  let nooldcfg = (typeof this.filesWindow === 'undefined');
                  let newcfg = other.wincfg.findFilesWindow(this.filesWindow,musi);
                  this.filesWindow = newcfg;
                  if (nooldcfg) {
                    this.filesWindow.outGoingEvents.subscribe((x:string) => {
                      other.logger.debug('Files.Dir-outGoingEvents',_id,x);
                      let xsplit = x.split(':');
                      switch(xsplit[0]) {
                        case 'FileOpen':
                          // Files.OpenFile { "file": "/w/myonara/ed.tmp" }
                          this.socketService.sendGMCP(_id,"Files","OpenFile",{"file":xsplit[1]+xsplit[2]});
                          break;
                        case 'ChangeDir':
                          if (xsplit[2]=="../") {
                            this.socketService.sendGMCP(_id,"Files","ChDir",{"dir":xsplit[2]});
                          } else {
                            this.socketService.sendGMCP(_id,"Files","ChDir",{"dir":xsplit[1]+xsplit[2]});
                          }
                          break;
                      }
                    }, err => {;
                      other.logger.error('Files.Dir-outGoingEvents-Error',_id,err);
                    }, () => {
                      other.logger.debug('Files.Dir-outGoingEvents-complete',_id);
                    });
                  }
                return;
              case 'Core.Ping':
                this.togglePing = !this.togglePing;
                return;
              case 'Core.GoodBye': 
              default: 
                other.logger.info('mudclient-socketService.mudReceiveSignals UNKNOWN',_id,musi.signal);
                return;
            }
          });
      other.obs_data = other.socketService.mudReceiveData(_id).subscribe(outline => {
          var outp = outline[0];
          var iecho = outline[1];
          other.logger.trace('mudclient-mudReceiveData',_id,outline);
          if (typeof outp !== 'undefined') {
            const idx = outp.indexOf(other.ansiService.ESC_CLRSCR);
            if (idx >=0) {
              other.messages = [];
              other.mudlines = [];
            }
            other.ansiCurrent.ansi = outp;
            other.ansiCurrent.mudEcho = undefined;
            other.messages.push({text:outp});
          } else  {
            other.ansiCurrent.ansi = '';
            other.ansiCurrent.mudEcho = iecho;
            other.messages.push({text:iecho});
          }
          var ts = new Date();
          other.ansiCurrent.timeString = ((ts.getDate() < 10)?"0":"") + ts.getDate() +"."
                                       + (((ts.getMonth()+1) < 10)?"0":"") + (ts.getMonth()+1) +"."
                                       + ts.getFullYear() + ' '
                                       +((ts.getHours() < 10)?"0":"") + ts.getHours() +":"
                                       + ((ts.getMinutes() < 10)?"0":"") + ts.getMinutes() +":"
                                       + ((ts.getSeconds() < 10)?"0":"") + ts.getSeconds();
          other.logger.trace('mudclient-mudReceiveData-ansiCurrent-before',_id,other.ansiCurrent);
          const a2harr = other.ansiService.processAnsi(other.ansiCurrent);
          other.logger.trace('mudclient-mudReceiveData-s2harr after',_id,a2harr);
          for (var ix=0;ix<a2harr.length;ix++) {
            if (a2harr[ix].text!=''||typeof a2harr[ix].mudEcho !=='undefined') {
              other.mudlines = other.mudlines.concat(a2harr[ix]);
            }
          }
          other.ansiCurrent = a2harr[a2harr.length-1];
        });
    });
  }

  ngOnInit() { 
    this.ansiCurrent = new AnsiData();
    this.logger.trace('mudclient-ngOnInit',this.cfg);
    if (typeof this.cfg !== 'undefined' && typeof this.cfg.mudname !== 'undefined'
        && this.cfg.mudname !== '') {
      this.mudName = this.cfg.mudname;
    } 
  }

  calculateSizing() {
    // var oh = this.mudBlock.nativeElement.offsetHeight;
    var ow = this.mudBlock.nativeElement.offsetWidth;
    var tmpheight = this.wincfg.getViewPortHeight();
    tmpheight -= 2*this.mudMenu.nativeElement.offsetHeight;
    tmpheight -= 2*this.mudInput.nativeElement.offsetHeight;
    tmpheight = Math.floor(Math.floor(tmpheight/(this.ref_height_ratio))*this.ref_height_ratio+0.5);
    var other = this;
    setTimeout(function(){
      other.ref_height = tmpheight;
      // other.sizeCalculated2 = true;
      other.cdRef.detectChanges();
    });
    if (this.mudc_height != Math.floor(tmpheight/this.ref_height_ratio)) {
      this.mudc_height = Math.floor(tmpheight/(this.ref_height_ratio+1));
      this.logger.debug('MudSize ',''+this.mudc_width+'x'+this.mudc_height+' <= '+ow+'x'+tmpheight);
      this.startCnt++;
      if (this.startCnt == 1 && typeof this.mudc_id === 'undefined' && this.cfg.autoConnect) {
        this.connect();
      }
      if (typeof this.mudc_id !== undefined) {
        this.socketService.setMudOutputSize(this.mudc_id,this.mudc_height,this.mudc_width);
      }
    }
  }

  ngAfterViewChecked() {
    var other = this;
    var tmpwidth;
    if (!this.sizeCalculated) {
      tmpwidth = this.mudTest.nativeElement.offsetWidth * 1.0125;
      this.ref_height_ratio = this.mudTest.nativeElement.offsetHeight/25.0;
      setTimeout(function(){
        other.ref_width = tmpwidth;
        other.sizeCalculated = true;
        other.cdRef.detectChanges();
      });
    } else if (this.startCnt <= 0) {
      this.calculateSizing();
    }
  }

  ngOnDestroy() {
    this.obs_debug.unsubscribe();
    this.obs_data.unsubscribe();
    this.obs_connect.unsubscribe();// including disconnect
    this.obs_connected.unsubscribe(); 
  }

  sendMessage() {
    var other = this;
    this.socketService.mudSendData(this.mudc_id,this.inpmessage);
    if (this.inpType == 'text' && this.inpmessage != '') {
      other.ansiCurrent.ansi = '';
      other.ansiCurrent.mudEcho = this.inpmessage+'\r\n';
      other.messages.push({text:this.inpmessage+'\r\n'});
      var ts = new Date();
      other.ansiCurrent.timeString = ((ts.getDate() < 10)?"0":"") + ts.getDate() +"."
                                   + (((ts.getMonth()+1) < 10)?"0":"") + (ts.getMonth()+1) +"."
                                   + ts.getFullYear() + ' '
                                   +((ts.getHours() < 10)?"0":"") + ts.getHours() +":"
                                   + ((ts.getMinutes() < 10)?"0":"") + ts.getMinutes() +":"
                                   + ((ts.getSeconds() < 10)?"0":"") + ts.getSeconds();
      other.logger.trace('mudclient-sendMessage-ansiCurrent-before',this.mudc_id,other.ansiCurrent);
      const a2harr = other.ansiService.processAnsi(other.ansiCurrent);
      other.logger.trace('mudclient-sendMessage-s2harr after',this.mudc_id,a2harr);
      for (var ix=0;ix<a2harr.length;ix++) {
        if (a2harr[ix].text!=''||typeof a2harr[ix].mudEcho !=='undefined') {
          other.mudlines = other.mudlines.concat(a2harr[ix]);
        }
      }
      other.ansiCurrent = a2harr[a2harr.length-1];
      if ((this.inpHistory.length==0 || (this.inpHistory.length >0 && this.inpHistory[0] != this.inpmessage))) {
        this.inpHistory.unshift(this.inpmessage);
      }
    }
    this.inpmessage = '';
  }

  onSelectMud(mudselection : string) {
    if (mudselection.toLowerCase() == 'disconnect') {
      this.messages = [];
      this.mudlines = [];
    }
    this.mudName = mudselection;
    this.ansiCurrent = new AnsiData();
    this.connect();
  }
  onKeyUp(event:KeyboardEvent) {
    var a2h : AnsiData;
    if (this.inpType !='text') return;
    switch (event.key) {
      case "ArrowUp":
        if (this.inpHistory.length < this.inpPointer) {
          return; // at the end.....
        }
        if (this.inpPointer < 0) {
          if (this.inpmessage == '') {
            if (this.inpHistory.length > 0) {
              this.inpPointer = 0;
              this.inpmessage = this.inpHistory[0];
              return;
            } else {
              return;
            }
          } else {
            if (this.inpHistory.length>0 && this.inpmessage == this.inpHistory[0]) {
              return;
            }
            this.inpHistory.unshift(this.inpmessage);
            if (this.inpHistory.length > 1) {
              this.inpPointer = 1;
              this.inpmessage = this.inpHistory[1];
              return;
            } else {
              this.inpPointer = 0;
              return;
            }
          }
        } else {
          this.inpPointer++;
          if (this.inpHistory.length < this.inpPointer) {
            return; // at the end...
          }
          this.inpmessage = this.inpHistory[this.inpPointer];
        }
        return;
       case "ArrowDown":
        if (this.inpPointer < 0) {
          return; // at the beginning
        }
        this.inpPointer--;
        if (this.inpPointer < 0) {
          this.inpmessage = '';
          return; // at the beginning
        }
        this.inpmessage = this.inpHistory[this.inpPointer];
        return;
      case "ArrowLeft":
        return;
      case "ArrowRight":
      case "Shift":
      case "Ctrl":
      case "Alt":
      case "AltGraph":
      case "Meta":
        return; // no change to the pointer...
      case "Enter":
        this.inpPointer = -1;
        a2h = Object.assign({},this.mudlines[this.mudlines.length-1]);
        a2h.text = "\r\n";
        this.mudlines.push(a2h);
        return;
      default:
        this.inpPointer = -1;
        return;
    }
  }

  @HostListener('window:resize', ['$event'])
onResize(event) {
  this.calculateSizing();
}

}
