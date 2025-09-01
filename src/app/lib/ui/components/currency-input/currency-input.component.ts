import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gnx-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true,
    },
  ]
})
export class CurrencyInputComponent implements ControlValueAccessor {

  @Input() Class: string = '';
  @Input() Placeholder: string = '';
  @Input() MaxLength: string = '20';
  @Input() isReadOnly: boolean = false;
  @Input() id: string;

  inputValue : string = '';

  formControl: FormControl = new FormControl<string>('');
  form: FormGroup = new FormGroup([this.formControl]);

  constructor() { }

  onChange: any = () => { };
  onTouch: any = () => { };

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  /**
   * Called when input field gets value
   * Converts the value into Indian Currency format and displays it
   * Stores value in Float format for the formControl
  */
  writeValue(value: string): void {
    if(value == null && value == undefined){
      this.formControl.patchValue(parseFloat('0').toFixed(2));
      return
    }

    let numValue : number = Number(value)
    this.inputValue = numValue.toLocaleString('en-IN', {
      // style: 'currency',  
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) 

    let integerValue = value?.toString();
    this.formControl.patchValue(parseFloat(integerValue).toFixed(2));
  }

  /**
   * Function call on Input
   * Stores value in String format at CurrencyInput Component
   * Shares value in Float format to other FormControl
  */
  public onInputChange(){
    this.onChange(this.inputValue.replace(/₹/g,'').replace(/,/g, ''));

    let integerValue = this.inputValue.toString();
    this.formControl.patchValue(parseFloat(integerValue).toFixed(2));
  }

  /**
   * Function call on Blur
   * Changes the Input value to Indian Currency Format
  */
  public onBlurUpdate(){
     
    let input : number = Number(this.inputValue.replace(/₹/g,'').replace(/,/g, ''));

    this.inputValue = input.toLocaleString('en-IN', {
      // style: 'currency',  
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) 

  }
}
