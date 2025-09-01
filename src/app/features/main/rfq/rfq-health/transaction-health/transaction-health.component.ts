import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { ITransactionDto, TransactionDocumentDto, TransactionDto } from '@models/dtos/config/RFQHealth/transaction-dto';
import { HealthPolicyDocumentType } from 'src/app/shared/enums/HealthPolicyDocumentType.enum';
import { HealthProductType } from 'src/app/shared/enums/HealthProductType.enum';
import { TransactionHealthService } from './transaction-health.service';
import { dropdown } from '@config/dropdown.config';
import { Alert } from '@models/common';
import { ROUTING_PATH } from '@config/routingPath.config';
import { HealthPolicyTenure } from 'src/app/shared/enums/rfq-health/HealthPolicyTenure.enum';
import { HealthCategoryType, HealthPolicyType } from 'src/app/shared/enums/rfq-health';

@Component({
  selector: 'gnx-transaction-health',
  templateUrl: './transaction-health.component.html',
  styleUrls: ['./transaction-health.component.scss'],
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
export class TransactionHealthComponent {
  pagetitle: string // Page Main header Title

  UploadFileAPI = API_ENDPOINTS.Attachment.Upload; // upload document API

  DropDown: dropdown // Dropdown Master Data
  Transaction: ITransactionDto// Transaction form group value
  TransactionForm: FormGroup// Transaction form group 
  DisplayDataForm: FormGroup // to store for display RFQ Details

  stepTwoAlerts:Alert[] = [] // Step 2 Invalid field error message
  stepThreeAlerts:Alert[] // Step 3 Invalid field error message

  step1 = new FormControl();// Step 1 Control
  step2 = new FormControl();// Step 2 Control

  maxDate // Max date validation

  //#region constructor
  constructor(private _router:Router,
    private _fb:FormBuilder,
    private _route:ActivatedRoute,
    private _dataService: HttpService,
    private _alertservice: AlertsService,
    private _transactionService: TransactionHealthService

    ){
      this.DropDown = new dropdown()
      this.maxDate = new Date(Date.now());
    }
  // #endregion constructor

   //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init
  ngOnInit ():void {

    // Route params data
    let data = this._route.snapshot.data
    this.pagetitle = data['title']

    this.DisplayDataForm = this._buildDisplayDataForm(data['data'])

    this.Transaction = new TransactionDto()
    this.TransactionForm = this._buildTransactionForm(this.Transaction)


    this.Transaction.Documents = new Array<TransactionDocumentDto>()
    if(this.TransactionForm.get('Documents').value.length==0) {
      this.addDocuments()
    }
    else {

      let name = this.info.controls[0].get('ImageUploadName').value.split('_')

      this.info.controls[0].get('Name').patchValue(name[0])
    }


 }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public get info() {
    return this.TransactionForm.get('Documents') as FormArray
  }

  // Get Health ProductType From Config file
  public get HealthProductType() {
    return HealthProductType
  }

  // Get Health Proposal From Config file
  public get HealthPolicyType() {
    return HealthPolicyType
  }

  // Get Health Policy From Config file
  public get HealthCategoryType() {
    return HealthCategoryType
  }

  // Get sum Insured Amount From Config file
  public get HealthPolicyTenure() {
    return HealthPolicyTenure
  }

  // Add Document In Transaction Health Form
  public addDocuments() {
    var row: TransactionDocumentDto = new TransactionDocumentDto()
    this.Transaction.Documents.push(row)
    this.info.push(this._initDocumentsForm(row))

  }

  // submit Transaction Health
  public submitForm() {

    let errorMessage = this._finalValidationError()
    if (errorMessage.length>0) {
      this._alertservice.raiseErrors(errorMessage)
      return
    }
    this._transactionService.TransactionHealthSubmit(this.TransactionForm.value).subscribe((res) => {

      if(res.Success) {
        this._router.navigate([ROUTING_PATH.RFQ.TransactionEntryDone])
      }
    })
  }

  // back button
  public backButton() {
    this._router.navigate([ROUTING_PATH.RFQ.HealthList])
  }

  // file data
  public selectedPolicy(event,index) {
    let file = event.target.files[0]
    let reader = new FileReader();
    reader.onload = () => { };
    reader.readAsDataURL(file);
    if (file) {
      this._dataService
        .UploadFile(this.UploadFileAPI, file)
        .subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message);
            this.info.controls[index].patchValue({
              ImageUploadName:res.Data.StorageFileName,
              ImageUploadPath:res.Data.StorageFilePath,
              DocumentType:HealthPolicyDocumentType.Mandate,
              Name:event.target.files[0].name,
              // PolicyId:this.DisplayDataForm.get('Id').value
            })

          }
          else{
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }


  }

  // step Two validation Field & Invalid Field Error message push in alert Array
  public _StepTwoSubmit() {
    this.stepTwoAlerts = []
    if (this.TransactionForm.get('InsuranceCompany').invalid) {
      this.stepTwoAlerts.push({
        Message: 'Enter Insurance Company',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('InsurancePlan').invalid) {
      this.stepTwoAlerts.push({
        Message: 'Enter Insurance Plan',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('TransactionTypeName').invalid) {
      this.stepTwoAlerts.push({
        Message: 'Select Insurance Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('PolicyNo').invalid) {
      this.stepTwoAlerts.push({
        Message: 'Enter Policy No.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('IssueDate').invalid) {
      if (this.TransactionForm.get('IssueDate').value) {
        this.stepTwoAlerts.push({
          Message: 'Enter Valid Issue Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.stepTwoAlerts.push({
          Message: 'Enter Issue Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      
    }

    if (this.TransactionForm.get('StartDate').invalid) {
      if (this.TransactionForm.get('StartDate').value) {
        this.stepTwoAlerts.push({
          Message: 'Enter Valid Start Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.stepTwoAlerts.push({
          Message: 'Enter Start Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      
    }

    if (this.TransactionForm.get('EndDate').invalid) {
      if (this.TransactionForm.get('EndDate').value) {
        this.stepTwoAlerts.push({
          Message: 'Enter Valid Expiry Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.stepTwoAlerts.push({
          Message: 'Enter Expiry Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      
    }

    if (this.TransactionForm.get('NexpPremiumPaymentDate').invalid) {
      if (this.TransactionForm.get('NexpPremiumPaymentDate').value) {
        this.stepTwoAlerts.push({
          Message: 'Enter Valid Net Premium Payment Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.stepTwoAlerts.push({
          Message: 'Enter Net Premium Payment Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      
    }

    if (this.TransactionForm.get('mandateObtained').value==null) {
      this.stepTwoAlerts.push({
        Message: 'Select Mandate Obtained',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.info.controls[0].get('Name').invalid) {
      this.stepTwoAlerts.push({
        Message: 'Attach Mandate',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('COshare').value==null) {
      this.stepTwoAlerts.push({
        Message: 'Select Co Share',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('COshareper').invalid) {
      this.stepTwoAlerts.push({
        Message: 'Enter Co Share(%)',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('COshareInsurer').invalid) {
      this.stepTwoAlerts.push({
        Message: 'Enter Co Share-Insurance Company',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.stepTwoAlerts.length > 0) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  // alert message if step two is not validated
  public _StepTwoError() {
    if(this.stepTwoAlerts.length>0) {
      this._alertservice.raiseErrors(this.stepTwoAlerts)
    }
  }

  // step Three validation Field & Invalid Field Error message push in alert Array
  public _StepThreeSubmit() {
    this.stepThreeAlerts = []
    if (this.TransactionForm.get('ExistCustomer').value==null) {
      this.stepThreeAlerts.push({
        Message: 'Select Exist Customer',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('NameProposal').invalid) {
      this.stepThreeAlerts.push({
        Message: 'Enter Name of Proposer',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('NameOfGroupHead').invalid) {
      this.stepThreeAlerts.push({
        Message: 'Enter Name Of Group Head',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.stepThreeAlerts.length > 0) {
      this.step2.setErrors({ required: true });
      return this.step2;
    } else {
      this.step2.reset();
      return this.step2;
    }
  }

  // alert message if step Three is not validated
  public _StepThreeError() {
    if(this.stepThreeAlerts.length>0) {
      this._alertservice.raiseErrors(this.stepThreeAlerts)
    }
  }

  //#endregion public-methods


   //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // last step validation Field & Invalid Field Error message push in alert Array
  private _finalValidationError() {
    let alerts:Alert[] = []

    if (this.TransactionForm.get('SumInsured').invalid) {
      alerts.push({
        Message: 'Enter Sum Insured',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('NetPremium').invalid) {
      alerts.push({
        Message: 'Enter Net Premium',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('CommissionablePremium').invalid) {
      alerts.push({
        Message: 'Enter Commissionable Premium',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('GSTPer').invalid) {
      alerts.push({
        Message: 'Enter GST on Net Premium (%)',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('GSTAmount').invalid) {
      alerts.push({
        Message: 'Enter GST on Net Premium (₹)',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionForm.get('GrossPremium').invalid) {
      alerts.push({
        Message: 'Enter Gross Premium',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    return alerts
  }

  //Build  form to display data
  private _buildDisplayDataForm(data):FormGroup {
    let ddF = this._fb.group({
      Id:[],
      QNNo:[],
      QNDate:[],
      RFQNo:[],
      RFQDate:[],
      ProposalType:[],
      PolicyTypeName:[],
      ProductType:[],
      Deductible:[],
      ProposerName:[],
      PolicyTenure : [] //Added on 03-06-2024 
    })

    if(data) {
      ddF.patchValue(data)
    }

    return ddF
  }

  // Build Main Trancsaction health Form
  private _buildTransactionForm(data):FormGroup {
    let tF = this._fb.group({
      Id: [0],
      TransactionNo:['Auto Generate'],
      HealthPolicyId: [this.DisplayDataForm.get('Id').value],
      InsuranceCompany: ['',[Validators.required,this.noWhitespaceValidator]],
      InsurancePlan: ['',[Validators.required,this.noWhitespaceValidator]],
      TransactionTypeName: ['',[Validators.required]],
      PolicyNo: ['',[Validators.required,this.noWhitespaceValidator]],
      IssueDate: ['',[Validators.required]],
      StartDate: ['',[Validators.required]],
      EndDate: ['',[Validators.required]],
      NexpPremiumPaymentDate: ['',[Validators.required]],
      mandateObtained: [],
      COshare: [],
      COshareper: [null,[Validators.required]],
      COshareInsurer: ['',[Validators.required,this.noWhitespaceValidator]],
      ExistCustomer: [],
      NameProposal: ['',[Validators.required,this.noWhitespaceValidator]],
      NameOfGroupHead: ['',[Validators.required,this.noWhitespaceValidator]],
      SumInsured: [null,[Validators.required]],
      NetPremium: [null,[Validators.required]],
      CommissionablePremium: [null,[Validators.required]],
      GSTPer: [null,[Validators.required]],
      GSTAmount: [null,[Validators.required]],
      GrossPremium: [null,[Validators.required]],
      HealthPolicy:[],
      Documents: this._buildDocumentsForm(data.Documents),
    })
    if(data) {
      tF.patchValue(data)
    }

    return tF
  }

  // Init Attach document formarray
  private _buildDocumentsForm(items:TransactionDocumentDto[] = []):FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initDocumentsForm(i));
        });
      }
    }

    return formArray;
  }

  // Init Attach document formGroup
  private _initDocumentsForm(item:TransactionDocumentDto):FormGroup {
    let DF = this._fb.group({
      Id: [0],
      TransactionId: [0],
      DocumentType: [''],
      ImageUploadName: [''],
      ImageUploadPath: [''],
      Name:['',[Validators.required]],
    })

    if (item != null) {
      if (!item) {
        item = new TransactionDocumentDto();
      }

      if (item) {
        DF.patchValue(item);
      }
    }
    return DF
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }


  // #endregion Private methods


}
