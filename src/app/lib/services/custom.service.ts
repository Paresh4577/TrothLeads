import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { IFormValidationResult } from '@models/common/IFormValidationResult';
import { RegexServices } from './regex-services.service';

@Injectable({
  providedIn: 'root',
})
export class CustomService {
  constructor() {}

  public ValidateForm(form: FormGroup | FormArray): IFormValidationResult {
    let result: IFormValidationResult = {
      isValid: true,
      error: '',
      controlName: '',
    };

    if (!form) return result;

    Object.keys(form.controls).every((key, i) => {
      if (form.controls[key].invalid) {
        //check if control is formgroup/array
        const abstractControl = form.controls[key];

        if (
          abstractControl instanceof FormGroup ||
          abstractControl instanceof FormArray
        ) {
          result = this.ValidateForm(abstractControl);
          if (result.isValid) {
            return true;
          } else {
            result.error = `Error with ${RegexServices.converToProperCase(
              key
            )} at row# ${i}`;
            return false;
          }
        } else {
          //Form control is not formgroup or array

          if (form.controls[key].invalid) {
            result.isValid = false;
            result.controlName = key;
            result.index = i;
            return false;
          } else {
            return true;
          }
        }
      } else {
        return true;
      }
    });

    if (!result.isValid) {
      return result;
    }

    return result;
  }

  public DateDiff(date1: string, date2: string, DiffIn: string = 'Days') {
    var dateParts = date1.split('/');
    var dateObject = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

    let ddate1 = new Date(dateObject);
    let ddate2 = new Date(date2);
    let diff = Math.abs(ddate1.getTime() - ddate2.getTime());
    if (DiffIn == 'Days') return Math.ceil(diff / (1000 * 3600 * 24));
    return 0;
  }
}
