export interface IAnsiData {
  fontheight: number;
  fontwidth: number;
  ansi: string;
  mudEcho?: string;
  lastEscape?: string;
  ansiPos: number;
  fgcolor: string;
  bgcolor: string;
  bold: boolean;
  faint: boolean;
  blink: boolean;
  italic: boolean;
  underline: boolean;
  reverse: boolean;
  concealed: boolean;
  crossedout: boolean;
  optionInvert: boolean;
  timeString: string;
  text: string;
}
