import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomService } from '@lib/services/custom.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { RegexServices } from '@lib/services/regex-services.service';
import {
  ExistingIllnessDetailDto,
  IExistingIllnessDetailDto,
} from '@models/dtos/config/ExistingIllnessDetailDto';
import { Subject } from 'rxjs';

@Component({
  selector: 'gnx-existing-illness-detail',
  templateUrl: './existing-illness-detail.component.html',
  styleUrls: ['./existing-illness-detail.component.scss'],
})
export class ExistingIllnessDetailComponent implements OnInit {
  ExistingIllnessDetailForm: FormGroup;
  ExistingIllnessDetail: IExistingIllnessDetailDto;
  title: string;

  destroy$: Subject<any>;

  //#region constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _customService: CustomService,
    public dialogRef: MatDialogRef<ExistingIllnessDetailComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: string;
      title: string;
      data?: any;
      ExistingIllness: IExistingIllnessDetailDto;
    }
  ) {}

  
  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init
  
  ngOnInit(): void {
    this.ExistingIllnessDetail = new ExistingIllnessDetailDto();
    if(this.data.ExistingIllness){
      this.ExistingIllnessDetail = this.data.ExistingIllness
    }
    this.ExistingIllnessDetailForm = this._buildExistingIllnessDetailForm(
      this.ExistingIllnessDetail
    );
    this.title = this.data.title;
    this.destroy$ = new Subject();
  }


  ngOnDestroy(): void {
    // Resets the filters.
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get f() {
    return this.ExistingIllnessDetailForm.controls;
  }

  public cancle() {
    this.dialogRef.close();
  }

  // save data
  public save() {
    //Validate entire form
    let result = this._customService.ValidateForm(
      this.ExistingIllnessDetailForm
    );
    if (!result.isValid) {
      this._alertservice.raiseErrorAlert(
        `Form field ${RegexServices.converToProperCase(
          result.controlName
        )} is blank or contain errors`
      );
      return;
    }

    this.dialogRef.close(this.ExistingIllnessDetailForm.value);
  }

  //#endregion public-methods

  
   //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // form
  private _buildExistingIllnessDetailForm(data): FormGroup {
    let existingIllnessForm = this.fb.group({
      PreExistDisease: [false],
      PreExistDiseaseDescription: [''],
      Thyroid: [false],
      ThyroidRemark: [''],
      Asthma: [false],
      AsthmaRemark: [''],
      CholesterolDisorDr: [false],
      CholesterolDisorDrRemark: [''],
      Heartdisease: [false],
      HeartdiseaseRemark: [''],
      Hypertension: [false],
      HypertensionRemark: [''],
      Diabetes: [false],
      DiabetesRemark: [''],
      Obesity: [false],
      ObesityRemark: [''],
    });
    if(data){
      existingIllnessForm.patchValue(data)
    }
    return existingIllnessForm;
  }

  // #endregion Private methods
}
