import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, Output, EventEmitter, ContentChild } from '@angular/core';
import { gnxAnimations } from '@lib/ui/animations';

@Component({
  selector: 'gnx-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  animations: [gnxAnimations]
})
export class AccordionComponent  {
  // gets title of accordion from the parent
  @Input() title: string;
  @Input() type: 'List' | 'Content' = 'List';

  // gets list data from the parent
  @Input() ListData = [];

  // gets index of accordion in ngFor loop
  @Input() AccordionIndex: number;
  // gets currently active accordion index from parent
  @Input() ActiveAccordionIndex: number;
  // send current accordion index in parent
  @Output() onActive = new EventEmitter<number>()

  // #region public variables
  dropdownPopoverShow : boolean;

  // #region public variables

  constructor(){
    this.dropdownPopoverShow = true;
  }

  @ViewChild("btnDropdownRef", { static: false }) btnDropdownRef: ElementRef;
  @ContentChild("contentRef", { static: false }) contentRef: ElementRef;

  // ngOnChanges(changes: SimpleChanges): void {
  //   if(this.AccordionIndex != this.ActiveAccordionIndex){
  //     this.dropdownPopoverShow = false
  //   }
  // }

  toggleDropdown(event) {
    event.preventDefault();
    if(this.dropdownPopoverShow){
      this.dropdownPopoverShow = false;

      // hide projecting element
      if(this.contentRef){
        this.contentRef.nativeElement.classList.add('py-0', 'h-0', 'opacity-0', 'ease-out', 'pointer-events-none');
        this.contentRef.nativeElement.classList.add('ease-out', 'transition-all');
        this.contentRef.nativeElement.classList.remove('ease-in');
      }
    }else{
      if(this.ListData.length){
        // sets accordion index in parent whenever accordion gets active
        this.onActive.emit(this.AccordionIndex)
        this.dropdownPopoverShow = true
               
      }else{
        this.dropdownPopoverShow = false
      }

      // show projecting element
      if(this.contentRef){
        this.dropdownPopoverShow = true
        this.contentRef.nativeElement.classList.remove('py-0', 'h-0', 'opacity-0', 'ease-out', 'pointer-events-none');
        this.contentRef.nativeElement.classList.remove('ease-out');
        this.contentRef.nativeElement.classList.add('ease-in', 'transition-all');
      } 
    }
  }
  // #endregion public methods
}
