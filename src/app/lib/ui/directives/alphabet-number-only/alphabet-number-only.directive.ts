import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[AlphabetNumberOnly]'
})
export class AlphabetNumberOnlyDirective {

  @Input() validationFieldsType: string;

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event']) onKeyDown(event) {

    let e = <KeyboardEvent>event;
    /*
      8 -  for backspace
      9 -  for tab
      13 - for enter
      27 - for escape
      46 - for delete
    */
    if ([8, 9, 13, 27, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      // Allow: Ctrl+C
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
      // Allow: Ctrl+V
      (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      // Allow: Ctrl+X
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }
  }

  @HostListener('keyup', ['$event']) onKeyup(event: KeyboardEvent) {
    this.validateFields(event);
  }

  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    this.validateFields(event);
  }

  validateFields(event) {
    setTimeout(() => {
      this.el.nativeElement.value = this.el.nativeElement.value.replace(/[^A-Za-z0-9 ]/g, '')
      event.preventDefault();
    }, 100)
  }

}
