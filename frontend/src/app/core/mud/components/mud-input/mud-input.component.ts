import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InputTextarea } from 'primeng/inputtextarea';

@Component({
  selector: 'app-mud-input',
  templateUrl: './mud-input.component.html',
  styleUrls: ['./mud-input.component.scss'],
})
export class MudInputComponent {
  private inpHistory: string[] = [];
  private inpPointer = -1;

  @ViewChild(InputTextarea, { static: true })
  private textarea!: InputTextarea;

  @Output()
  public readonly messageSent = new EventEmitter<string>();

  protected readonly form: FormGroup;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      inpmessage: [''],
    });
  }

  public focus() {
    (this.textarea.el.nativeElement as HTMLTextAreaElement).focus();
  }

  protected onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  protected onKeyUp(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.navigateHistory(-1);
    } else if (event.key === 'ArrowDown') {
      this.navigateHistory(1);
    }
  }

  private sendMessage() {
    const message = this.form.get('inpmessage')?.value as string;

    this.messageSent.emit(message);
    if (
      this.inpHistory.length === 0 ||
      (this.inpHistory.length > 0 && this.inpHistory[0] !== message)
    ) {
      this.inpHistory.unshift(message);
    }
    this.form.get('inpmessage')?.setValue('');
    this.inpPointer = -1;
  }

  private navigateHistory(direction: number) {
    const messageControl = this.form.get('inpmessage');

    if (!messageControl) return;

    if (direction === -1 && this.inpPointer < this.inpHistory.length - 1) {
      this.inpPointer++;
    } else if (direction === 1 && this.inpPointer > -1) {
      this.inpPointer--;
    }

    if (this.inpPointer === -1) {
      messageControl.setValue('');
    } else if (
      this.inpPointer >= 0 &&
      this.inpPointer < this.inpHistory.length
    ) {
      messageControl.setValue(this.inpHistory[this.inpPointer]);
    }
  }
}
