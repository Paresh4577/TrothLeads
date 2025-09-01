import { Component, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { drpListDto } from '@models/common/drpList.interface';
import { createPopper } from "@popperjs/core";

@Component({
  selector: 'gnx-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements AfterViewInit, OnChanges {
  @Input() IsSearch: boolean = false
  @Input() IsDisabled: boolean = false
  @Input() InputValue: string
  // gets list data from the parent
  @Input() ListData: drpListDto[] = [];
  // sends selected list value to the parent 
  @Output() onSelectDrpItem = new EventEmitter<any>();

  // #region public variables
  dropdownPopoverShow : boolean;
  listPopoverShow : boolean;

  selectedValue : string;
  // #region public variables

  constructor(){
    this.dropdownPopoverShow = false;
    this.listPopoverShow = false;
    this.selectedValue = ''
  }

  //
  @ViewChild("btnDropdownRef", { static: false }) btnDropdownRef: ElementRef;
  @ViewChild("popoverDropdownRef", { static: false }) popoverDropdownRef: ElementRef

  // #region lifecycle hooks
  ngOnChanges(SimpleChanges){
    if(this.InputValue){
      this.selectedValue = this.InputValue
    }else{
      this.selectedValue = ''
    }
  }
  
  ngAfterViewInit() {
    createPopper(
      this.btnDropdownRef.nativeElement,
      this.popoverDropdownRef.nativeElement,
      {
        placement: "bottom-start",
      }
    );
  }
  // #endregion lifecycle hooks

  // #region public methods
  selectListItem(id, value) {
    this.selectedValue = value
    // closes drplist after selection 
    this.dropdownPopoverShow = false;
    // sends selected value to the parent component
    this.onSelectDrpItem.emit({ id: id, name: value })
  }

  // opens or hides drpdown search list
  onClickInput(){
    if(this.dropdownPopoverShow){
      this.dropdownPopoverShow = false;
    }else{
      this.dropdownPopoverShow = true
    }
  }

  toggleDropdown(event) {
    event.preventDefault();
    if(this.dropdownPopoverShow){
      this.dropdownPopoverShow = false;
    }else{
      if(this.ListData.length){
        this.dropdownPopoverShow = true
      }else{
        this.dropdownPopoverShow = false
      }
    }
  }
  // #endregion public methods
}

