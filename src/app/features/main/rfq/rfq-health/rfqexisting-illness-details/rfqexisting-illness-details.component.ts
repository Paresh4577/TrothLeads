import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomService } from '@lib/services/custom.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { RegexServices } from '@lib/services/regex-services.service';
import { ExistingIllnessDetailDto, IExistingIllnessDetailDto } from '@models/dtos/config/RFQHealth/rfqhealth-dto';
import { Subject } from 'rxjs';

@Component({
  selector: 'gnx-rfqexisting-illness-details',
  templateUrl: './rfqexisting-illness-details.component.html',
  styleUrls: ['./rfqexisting-illness-details.component.scss']
})
export class RFQExistingIllnessDetailsComponent {
  ExistingIllnessDetailForm: FormGroup; // Selected Policy Person Illness FOrmGroup
  ExistingIllnessDetail: IExistingIllnessDetailDto; // Selected Policy Person Illness FOrmGroup value

  title: string; // page header Title
  destroy$: Subject<any>;
  formDisable:boolean = true

  //#region constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _customService: CustomService,
    public dialogRef: MatDialogRef<RFQExistingIllnessDetailsComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: string;
      title: string;
      data?: any;
      ExistingIllness: IExistingIllnessDetailDto;
      disable?:boolean
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

    //Mat-Dialog Data Bind In form
    if(this.data.ExistingIllness){
      this.ExistingIllnessDetail = this.data.ExistingIllness
    }
    this.ExistingIllnessDetailForm = this._buildExistingIllnessDetailForm(
      this.ExistingIllnessDetail
    );
    if(this.data.disable==true) {
      this.ExistingIllnessDetailForm.disable()
      this.formDisable = !this.data.disable
    }
    this.title = this.data.title;
    this.destroy$ = new Subject();
  }

  get f() {
    return this.ExistingIllnessDetailForm.controls;
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
  
  // #region public methods

  // Close Dialog box
  public cancle() {
    this.dialogRef.close();
  }

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

  // Init  Selected policy Person Existing Illness Detail Form
  private _buildExistingIllnessDetailForm(data): FormGroup {
    let existingIllnessForm = this.fb.group({
      Id: [],
      PolicyPersonId: [],
      Thyroid: [],
      ThyroidSince: [''],
      ThyroidDescription: [''],
      Asthma: [],
      AsthmaSince: [''],
      AsthmaDescription: [''],
      CholesterolDisorDr: [],
      CholesterolDisorDrSince: [''],
      CholesterolDisorDrDescription: [''],
      Heartdisease: [],
      HeartdiseaseSince: [''],
      HeartdiseaseDescription: [''],
      Hypertension: [],
      HypertensionSince: [''],
      HypertensionDescription: [''],
      Diabetes: [],
      DiabetesSince: [''],
      DiabetesDescription: [''],
      Obesity: [],
      ObesitySince: [''],
      ObesityDescription: [''],
      OtherExistDisease: [],
      OtherExistDiseaseDescription: [''],
    });
if(data){
  existingIllnessForm.patchValue(data)
}
    return existingIllnessForm;
  }

  //#endregion Private methods
}
