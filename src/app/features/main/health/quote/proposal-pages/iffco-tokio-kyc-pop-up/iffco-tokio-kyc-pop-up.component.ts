import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IffcoTokioKycPopUpService } from './iffco-tokio-kyc-pop-up.service';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { MasterListService } from '@lib/services/master-list.service';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Alert } from '@models/common';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { dropdown } from '@config/dropdown.config';
import { IIffcoTokioKycDto, IffcoTokioKycDto, KYCDocumentsDto } from '@models/dtos/config/IffcoTokio';
import { ValidationRegex } from '@config/validationRegex.config';

@Component({
  selector: 'gnx-iffco-tokio-kyc-pop-up',
  templateUrl: './iffco-tokio-kyc-pop-up.component.html',
  styleUrls: ['./iffco-tokio-kyc-pop-up.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class IffcoTokioKycPopUpComponent {
  
  // Valiable Declaration
  KYCForm: FormGroup;
  KYC: IIffcoTokioKycDto;
  DropdownMaster: dropdown;
  List = [
    { title: 'PAN', data: 'PAN' },
    { title: 'Aadhar (UID)', data: 'UID' },
    { title: 'PHOTOGRAPH', data: 'PHOTOGRAPH', value: '9098' },
  ];
  file1
  file2
  file3
  pincodes$: Observable<ICityPincodeDto[]>;
  destroy$: Subject<any>;

  flag:boolean

  GenderList:any[]
  RelationList:any[]
  alert: Alert[] = [];
  documentArray;
  formData

  PanPattern: RegExp = ValidationRegex.PANNumValidationReg;
  AadharPattern: RegExp = ValidationRegex.UIDNumValidationReg;

  //#region constructor
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {info:any} ,
    private fb: FormBuilder,
    private _iffcoTokioPopService: IffcoTokioKycPopUpService,
    private _MasterListService: MasterListService,
    private _alertservice: AlertsService,
    private _datePipe: DatePipe, // number of people insured
  ) {
    this.formData = data.info
    
    this.flag = false
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
  }
  // #endregion constructor

   //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.KYC = new IffcoTokioKycDto();
    this.KYCForm = this._buildBuyNowForm(this.KYC);
    this._fillMasterList()
    this.documentArray = this.KYCForm.get('KYCDocuments') as FormArray;
    this._onFormChanges();
    this._fillForm(0)
    
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // close popUp
  public cancle() {
    this.dialogRef.close();
  }

  // submit form
  public submitForm() {
    this._checkPan();
    if (this.alert.length > 0) {
      this._alertservice.raiseErrors(this.alert);
      return;
    }
    let tepmData = this.KYCForm.value
    this._fillForm (1)
   

    this.KYCForm.patchValue({
      DOB: this._datePipe.transform(this.KYCForm.get('DOB').value, "yyyy-MM-dd"),
    })
    if (this.flag) {
      this.KYCForm.removeControl('KYCDocuments[0].IdType')
      this.KYCForm.removeControl('KYCDocuments[1].IdType')
      this.KYCForm.removeControl('KYCDocuments[2].IdType')
      this.KYCForm.removeControl('KYCDocuments[0].IdNumber')
      this.KYCForm.removeControl('KYCDocuments[1].IdNumber')
      this.KYCForm.removeControl('KYCDocuments[2].IdNumber')
    }
    tepmData.KYCDocuments.forEach((ele,index) => {
    
      let IdType = 'KYCDocuments['+index+'].IdType'
      let IdNumber = 'KYCDocuments['+index+'].IdNumber'
      
      this.KYCForm.addControl(IdType,new FormControl(ele.IdType))
      this.KYCForm.addControl(IdNumber,new FormControl(ele.IdNumber))
      
      if (index==0) {
        this.file1 = ele.IdAttachment
      }
      else if (index==1) {
        this.file2 = ele.IdAttachment
      }
      else if (index==2) {
        this.file3 = ele.IdAttachment
      }
      this.flag = true
    })

    this._iffcoTokioPopService.submit(this.KYCForm.value,this.file1,this.file2,this.file3).subscribe((res) => {
      
      let response
      for (let i in res) {
        if (i=='body'){
          response = res
        }
      } 
      if (response) {
          
        if(response.body.Success) {
          
          this.cancle()
        } else  {
          this._fillForm(0)
          this._alertservice.raiseErrorAlert(response.body.Message);
        }

      }
    });
  }

  // added selected file
  public selectFiles(event, i) {
    
    this.documentArray.controls[i].patchValue({
      IdAttachment : event.target.files[0],
      name:event.target.files[0].name
    });
    
  }

  public displayFnPinCode = (val: any) => {
    if (val.PinCode) {
      return val.PinCode;
    } else {
      return val;
    }
  };

  // pincode autoComplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.KYCForm.patchValue({
      City: event.option.value.CityName,
      PinCode: event.option.value.PinCode,
      State: event.option.value.StateName,
      Country: event.option.value.CountryName,
    });
  }

  //#endregion public-methods

   //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Dropdown list
  private _fillMasterList() {
    this.GenderList = [];
    this.GenderList.push({ Name: "Male" });
    this.GenderList.push({ Name: "Female" });

    this.RelationList = [];
    this.RelationList.push({ Name: "Father" });
    this.RelationList.push({ Name: "Mother" });
    this.RelationList.push({ Name: "Spouse" });

  }

  // bind city , state & country based on Pincode
  private _bindPin(selectedPinCode: string) {

    this._MasterListService.getFilteredPincodeListWithDetails(selectedPinCode).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (res.Success) {
        if (res.Data.Items.length) {
          this.KYCForm.patchValue({
            City: res.Data.Items[0].CityName,
            State: res.Data.Items[0].StateName,
            Country: res.Data.Items[0].CountryName,
          })
        }
      }
    });
  }

  // form details from IffcoTokio form
  private _fillForm (num) {
    this.KYCForm.enable()
    let Relation = 0

    if(num==1) {
      this.KYCForm.patchValue({
        Prefix:this.KYCForm.get('Prefix').value,
        FirstName:this.KYCForm.get('FirstName').value,
        MiddleName:this.KYCForm.get('MiddleName').value,
        LastName:this.KYCForm.get('LastName').value,
        Gender:this.KYCForm.get('Gender').value,
        DOB:this.KYCForm.get('DOB').value,
        MobileNo:this.KYCForm.get('MobileNo').value,
        Email:this.KYCForm.get('Email').value,
        Address:this.KYCForm.get('Address').value,
        PinCode:this.KYCForm.get('PinCode').value,
        RelatedPersonPrefix:this.KYCForm.get('RelatedPersonPrefix').value,
        Relation:this.KYCForm.get('Relation').value,
        RelatedPersonFirstName:this.KYCForm.get('RelatedPersonFirstName').value,
        RelatedPersonMiddleName:this.KYCForm.get('RelatedPersonMiddleName').value,
        RelatedPersonLastName:this.KYCForm.get('RelatedPersonLastName').value,
      })

      this._bindPin(this.KYCForm.get('PinCode').value)
    }

    if (num==0) {
      this.KYCForm.patchValue({
        Prefix:(this.formData.Gender=='Male'? 'Mr':(this.formData.NomineeRelation == 'Spouse'? 'Mrs':'Miss')),
        FirstName:this.formData.FirstName,
        MiddleName:this.formData.MiddleName,
        LastName:this.formData.LastName,
        Gender:this.formData.Gender,
        DOB:this.formData.DOB,
        MobileNo:this.formData.Mobile,
        Email:this.formData.Email,
        Address:this.formData.Address1,
        PinCode:this.formData.PinCode,
      })
      this.documentArray.controls[0].patchValue({
        IdNumber:this.formData.KYCDocumentNo
      }),
      this._bindPin(this.KYCForm.get('PinCode').value)
      
  
      if (this.formData.NomineeRelation == 'Father' || this.formData.NomineeRelation == 'Spouse' || this.formData.NomineeRelation == 'Mother') {
        this.KYCForm.patchValue({
          RelatedPersonPrefix:(this.formData.NomineeRelation == 'Spouse'?(this.formData.Gender=='Male'? 'Mrs':'Mr'):(this.formData.NomineeRelation == 'Father'? 'Mr':'Mrs')),
          Relation:this.formData.NomineeRelation,
          RelatedPersonFirstName:this.formData.NomineeFirstName,
          RelatedPersonMiddleName:this.formData.NomineeMiddleName,
          RelatedPersonLastName:this.formData.NomineeLastName,
        })
        Relation=1
      }
    }
    
    if (num==0) {
      this._disableForm(Relation)
    }
    

    
  }

  // diable form fields
  private _disableForm(Relation,item?) {
    this.KYCForm.disable()
    let FieldsToEnable = ['Prefix','RelatedPersonPrefix','District']
    if (item) {
      FieldsToEnable.push(item)
    }
    if (Relation==0) {
      FieldsToEnable.push('Relation')
      FieldsToEnable.push('RelatedPersonFirstName')
      FieldsToEnable.push('RelatedPersonMiddleName')
      FieldsToEnable.push('RelatedPersonLastName')

      FieldsToEnable.forEach((ele) => {
        this.KYCForm.get(ele).enable()
      })
    } else {
      FieldsToEnable.forEach((ele) => {
        this.KYCForm.get(ele).enable()
      })
    }

    this.documentArray.controls.forEach((element) =>{
      element.get('IdType').enable()
      element.get('IdNumber').enable()
      element.get('IdAttachment').enable()
    })
  }

  // form validation
  private _checkPan() {
    this.alert = [];
    let items;
    let Relation=1
    this.KYCForm.enable()
    if (this.KYCForm.get('Prefix').invalid) {
      this.alert.push({
        Message: 'Select Prefix',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('FirstName').invalid) {
      this.alert.push({
        Message: 'Enter First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('MiddleName').invalid) {
      this.alert.push({
        Message: 'Enter Middle Name',
        CanDismiss: false,
        AutoClose: false,
      });
      items='MiddleName'
    }

    if (this.KYCForm.get('LastName').invalid) {
      this.alert.push({
        Message: 'Enter Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('Gender').invalid) {
      this.alert.push({
        Message: 'Select Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('DOB').invalid) {
      this.alert.push({
        Message: 'Enter DOB',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('MobileNo').invalid) {
      this.alert.push({
        Message: 'Enter Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('Email').invalid) {
      this.alert.push({
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('Address').invalid) {
      this.alert.push({
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('PinCode').invalid) {
      this.alert.push({
        Message: 'Enter Pin Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('City').invalid) {
      this.alert.push({
        Message: 'Enter City',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('District').invalid) {
      this.alert.push({
        Message: 'Enter District',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('State').invalid) {
      this.alert.push({
        Message: 'Enter State',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('Country').invalid) {
      this.alert.push({
        Message: 'Enter Country',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('Relation').invalid) {
      this.alert.push({
        Message: 'Select Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.KYCForm.get('RelatedPersonPrefix').invalid) {
      this.alert.push({
        Message: 'Select Related Person Prefix',
        CanDismiss: false,
        AutoClose: false,
      });
      Relation=0
    }

    if (this.KYCForm.get('RelatedPersonFirstName').invalid) {
      this.alert.push({
        Message: 'Enter Related Person First Name',
        CanDismiss: false,
        AutoClose: false,
      });
      Relation=0
    }

    if (this.KYCForm.get('RelatedPersonMiddleName').invalid) {
      this.alert.push({
        Message: 'Enter Related Person Middle Name',
        CanDismiss: false,
        AutoClose: false,
      });
      Relation=0
    }

    if (this.KYCForm.get('RelatedPersonLastName').invalid) {
      this.alert.push({
        Message: 'Enter Related Person Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
      Relation=0

    }

    this.documentArray.controls.forEach((element, index) => {
      if (element.get('IdType').value == 'PAN') {
        if (!this.PanPattern.test(element.get('IdNumber').value)) {
          this.alert.push({
            Message: 'Enter Valid Pan',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
      if (element.get('IdType').value == 'UID') {
        if (!this.AadharPattern.test(element.get('IdNumber').value)) {
          this.alert.push({
            Message: 'Enter Valid Aadhar',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      if (element.get('IdAttachment').value=='') {
        this.alert.push({
          Message: `Add Id Attchment for ${element.get('IdType').value}`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
    });

    this._disableForm(Relation,items)
  
  }

  // change in pincode
  private _onFormChanges() {
    this.KYCForm.get('PinCode').valueChanges.subscribe((val) => {
      this.pincodes$ = this._MasterListService.getFilteredPincodeList(val).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.PinCode, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.PinCode) {
                  return el;
                }
              });
              return of(result);
            } else {
              return of([]);
            }
          } else {
            return of([]);
          }
        })
      );
    });
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { whitespace: true };
  }

  // main form
  private _buildBuyNowForm(data: IffcoTokioKycDto) {
    let Form = this.fb.group({
      Prefix: ['', [Validators.required, this.noWhitespaceValidator]],
      FirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      MiddleName: ['', [Validators.required, this.noWhitespaceValidator]],
      LastName: ['', [Validators.required, this.noWhitespaceValidator]],
      Relation: ['', [Validators.required, this.noWhitespaceValidator]],
      RelatedPersonPrefix: ['',[Validators.required, this.noWhitespaceValidator],],
      RelatedPersonFirstName: ['',[Validators.required, this.noWhitespaceValidator],],
      RelatedPersonMiddleName: ['',[Validators.required, this.noWhitespaceValidator],],
      RelatedPersonLastName: ['',[Validators.required, this.noWhitespaceValidator],],
      Gender: ['', [Validators.required, this.noWhitespaceValidator]],
      DOB: ['', [Validators.required]],
      MobileNo: ['', [Validators.required, this.noWhitespaceValidator]],
      Email: ['', [Validators.required, this.noWhitespaceValidator]],
      Address: ['', [Validators.required, this.noWhitespaceValidator]],
      PinCode: ['',[Validators.required, Validators.maxLength(6), Validators.minLength(6)],],
      City: ['', [Validators.required, this.noWhitespaceValidator]],
      State: ['', [Validators.required, this.noWhitespaceValidator]],
      Country: ['', [Validators.required, this.noWhitespaceValidator]],
      District: ['', [Validators.required, this.noWhitespaceValidator]],
      KYCDocuments: this._buildKYCDocumentsForm(),
    });
    return Form;
  }

  // KYC Document array
  private _buildKYCDocumentsForm(): FormArray {
    let formArray: FormArray = new FormArray([]);
    this.List.forEach((list) => {
      let item: KYCDocumentsDto = new KYCDocumentsDto();
      (item.IdType = list.data), (item.IdNumber = list.value);
      formArray.push(this._initKYCDocumentsForm(item));
    });
    
    return formArray;
  }

  // KYC Document Form
  private _initKYCDocumentsForm(item: KYCDocumentsDto) {
    let kycform = this.fb.group({
      IdType: [item.IdType, [Validators.required]],
      IdNumber: [item.IdNumber, [Validators.required]],
      IdAttachment: ['', [Validators.required]],
      name:[]
    });
    return kycform;
  }

  //#endregion Private methods
}
