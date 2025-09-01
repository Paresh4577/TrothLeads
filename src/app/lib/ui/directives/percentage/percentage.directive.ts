import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[Percentage]',
})
export class PercentageDirective {
  //////////////////////////////////
  // New DIRECTIVE
  // LIMIT 0 TO 100
  // Decimal '.' Add manually
  ////////////////////////////////

  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^\d{0,2}\.?\d{0,2}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = [
    'Backspace',
    'Tab',
    'End',
    'Home',
    //"-",
    'ArrowLeft',
    'ArrowRight',
    'Del',
    'Delete'
  ];

  IsFocus:boolean = false;

  constructor(private el: ElementRef) { }

  @HostListener('focus', ['$event'])
  onFocus(event: any) {
    this.IsFocus = true;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      this.IsFocus = false
      return;
    }

    if(this.IsFocus){
      if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
        // 0-9 only
      this.el.nativeElement.value = this.el.nativeElement.value
      this.IsFocus = false
      return
    }
  }

    let current: string = this.el.nativeElement.value;

    // this.ngControl.valueAccessor.writeValue(newVal + ' %');

    // let current: string = this.control.control?.value;
    const position = this.el.nativeElement.selectionStart;
    let next: string = [
      current.slice(0, position),
      event.key == 'Decimal' ? '.' : event.key,
      current.slice(position)
    ].join('');
    // current = current + '523';

    const beforeDecimal: any = next.split('.')[0];
    const AfterDecimal: any = next.split('.')[2];
    const checkDotFirstPosition: string = next.substring(0, 1);
    current = current + ' %';
    if (
      next === '00' ||
      next === '01' ||
      next === '02' ||
      next === '03' ||
      next === '04' ||
      next === '05' ||
      next === '06' ||
      next === '07' ||
      next === '08' ||
      next === '09'
    ) {
      event.preventDefault();
    }

    if (checkDotFirstPosition === '.') {
      event.preventDefault();
    }
    if (beforeDecimal) {
      if (beforeDecimal <= 100) {
        if (beforeDecimal.toString().length >= 4) {
          event.preventDefault();
        }
      } else {
        if (beforeDecimal.toString().length >= 3) {
          event.preventDefault();
        }
      }
    }
    if (AfterDecimal) {
      if (AfterDecimal.toString().length >= 2) {
        event.preventDefault();
      }
    }
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }


//////////////////////////////////
// OLD DIRECTIVE
// LIMIT 0 TO 99.99
// Decimal '.' Add Automatic
////////////////////////////////

  // private regex: RegExp = new RegExp(/^\d+(\.\d+)?$/);
  // private specialKeys: Array<string> = [
  //   'Backspace',
  //   'Tab',
  //   'End',
  //   'Home',
  //   'ArrowLeft',
  //   'ArrowRight',
  //   'Del',
  //   'Delete',
  //   'Copy',
  //   'Paste',
  //   'Clear',
  // ];
  // inputElement: HTMLElement;
  // constructor(private el: ElementRef) { }
  // @HostListener('keydown', ['$event'])
  // onKeyDown(event: KeyboardEvent) {

  //   if (event.key == '.') {
  //     if (!(this.el.nativeElement.value.indexOf('.') !== -1))
  //       return;
  //   }

  //   if (this.specialKeys.indexOf(event.key) !== -1) {
  //     return;
  //   }

  //   let current: string = this.el.nativeElement.value;
  //   let position = this.el.nativeElement.selectionStart;
  //   const next: string = [
  //     current.slice(0, position),
  //     event.key == 'Percentage' ? '.' : event.key,
  //     current.slice(position),
  //   ].join('');

  //   if (this.el.nativeElement.value.length == 2) {
  //     if (event.key != '.') {
  //       if (!(this.el.nativeElement.value.indexOf('.') !== -1)) {
  //         this.el.nativeElement.value = this.el.nativeElement.value + '.';
  //       }
  //     }
  //   }

  //   if (next && !String(next).match(this.regex)) {
  //     event.preventDefault();
  //   }
  // }

  // @HostListener('paste', ['$event'])
  // onPaste(event: ClipboardEvent) {
  //   event.preventDefault();
  //   const pastedInput: string = event.clipboardData
  //     .getData('text/plain')
  //     .replace(/\D/g, ''); // get a digit-only string
  //   document.execCommand('insertText', false, pastedInput);
  // }

  // @HostListener('drop', ['$event'])
  // onDrop(event: DragEvent) {
  //   event.preventDefault();
  //   const textData = event.dataTransfer.getData('text').replace(/\D/g, '');
  //   this.inputElement.focus();
  //   document.execCommand('insertText', false, textData);
  // }
}
