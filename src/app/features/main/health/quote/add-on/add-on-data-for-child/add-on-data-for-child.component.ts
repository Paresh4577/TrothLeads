import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert } from '@models/common';

@Component({
  selector: 'gnx-add-on-data-for-child',
  templateUrl: './add-on-data-for-child.component.html',
  styleUrls: ['./add-on-data-for-child.component.scss']
})
export class AddOnDataForChildComponent {

  title:string
  numberOfChildren
  childOccupationForm:FormGroup

  Amount = [{name:'2 Lakh',value:200000},{name:'4 Lakh',value:400000},{name:'5 Lakh',value:500000}]
  OccupationList=[]

  constructor(
    private _alertservice: AlertsService,
    private _MasterListService: MasterListService,
    private _fb: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      data?: any;
    }
  ) {
    this.title = data.title;
    this.numberOfChildren = data.data;
  }

  // #endregion constructor

  ngOnInit(): void {
    this.childOccupationForm = this._buildChildOccupationForm()
    this._occupationList()
  }

  // #region public methods

  // close PopUp
  public cancle() {
    this.dialogRef.close();
  }

  // save button
  /**
   * firstly check if the form data is valid . If not raise alert message . If Valid than colse the popUp.
   */
  public save() {
    let errorMessage:Alert[] = this._finalValidation()
    if(errorMessage.length>0) {
      this._alertservice.raiseErrors(errorMessage)
      return
    }
    
    this.dialogRef.close(this.childOccupationForm.value)
  }

  // #endregion public methods

  // #region private methods

  /**
   * check if the form fields are filled with valid data or not
   */
  private _finalValidation() {
    let alerts:Alert[] =[]
    if (this.childOccupationForm.get('Income').invalid) {
      alerts.push({
        Message: 'Enter Monthly Income',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    this.numberOfChildren.forEach((element,index) => {
      if (this.childOccupationForm.get(element.label).invalid) {
        alerts.push({
          Message: `Select ${element.name}'s Occupation`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
    })
    return alerts
  }

  // list of occupation
  private _occupationList() {
    //Occupation
    this.OccupationList = [];
    this._MasterListService
      .getCompanyWiseList('ICICI', 'icicioccupation')
      .subscribe((res) => {
        if (res.Success) {
          this.OccupationList = res.Data.Items;
        }
        else{
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
  }

  // form data
  private _buildChildOccupationForm(data?):FormGroup {
    let cOF = this._fb.group({
      SumInsured:[],
      Income:[0,[Validators.required,Validators.min(1)]],
      Child1:['',[Validators.required]],
      Child2:['',[Validators.required]],
      Child3:['',[Validators.required]],
      Child4:['',[Validators.required]],
      Child5:['',[Validators.required]],
      Child6:['',[Validators.required]],
    })
    if (data) {
      cOF.patchValue(data)
    }
    
    return cOF
  }

  // #endregion private methods
}
