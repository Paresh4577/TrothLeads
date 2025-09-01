import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IFilterRule } from '@models/common';
import { ICategoryDto } from '@models/dtos/core/CategoryDto';
import { IProductPlanDto } from '@models/dtos/core/ProductPlanDto';
import { IPassengerPAsDto, ITPPremiumDto, PassengerPAsDto, TPPremiumDto } from '@models/dtos/core/TPPremiumDto';
import { ISubCategoryDto } from '@models/dtos/core/subCategoryDto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { SubCategoryTypeLabelEnum } from 'src/app/shared/enums/SubCategoryType.enum';

@Component({
  selector: 'gnx-tp-premium',
  templateUrl: './tp-premium.component.html',
  styleUrls: ['./tp-premium.component.scss']
})
export class TpPremiumComponent {
  // #region public variables

  // Strings
  mode: string = ''; // Page mode like as add, edit.....
  title: string = ''; // page Header Title
  TpPremiumListApi = API_ENDPOINTS.TPPremium.Base

  // error array
  PassengerPAAlerts: Alert[] = []; // Step Invalid field error message
  TPPremiumErrorAlerts: Alert[] = []

  // Sub Category
  SubCategoryList = [];

  // FormGroup
  TpPremiumForm: FormGroup; // Reactive Form
  TpPremium: TPPremiumDto // Form Value

  // boolean
  editable: boolean;
  cngEnable: boolean;
  isReadonly: boolean;

  destroy$: Subject<any>;
  Category$: Observable<ICategoryDto[]>;
  Product$: Observable<IProductPlanDto[]>;
  SubCategory$: Observable<ISubCategoryDto[]>;


  // currencyList;

  // #endregion public variables

  /**
   * #region constructor
   * @param _location : used for back or prev page navigation
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */
  constructor(
    private _fb: FormBuilder,
    private _dataService: HttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
    private _MasterListService: MasterListService,
    public dialog: MatDialog,
    public _dialogService : DialogService
  ) {
    this.destroy$ = new Subject();
  }
  // #endregion constructor


  //#region lifecycle-hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.TpPremium = new TPPremiumDto()
    let data = this._route.snapshot.data;
    this.mode = data['mode']; // set Page mode
    this.title = data['title']; // Set PAge Title
    // Resolve Data

    switch (this.mode) {
      case "Create":
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.TpPremium = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.isReadonly = true;
        this.TpPremium = data['data'];
        break;
      default:
        break;
    }
    this.TpPremiumForm = this._initForm(this.TpPremium, this.mode);

    // In view Mode All Form Field Is diable
    if (this.mode == "View") {
      this.TpPremiumForm.disable();
    }
    if (this.mode == "Edit") {
      this.TpPremiumForm.get("SubCategoryName").disable();
    }

    if (this.mode == "Create") {
      this.addPassengerPAs();
    }
    else {
      if (this.passengerPA.value.length < 1) {
        this.addPassengerPAs();
      }
      this._subCategoryList();
      if (this.TpPremiumForm.get('SubCategoryName').value == "Two Wheeler") {
        this.cngEnable = true;
        this.TpPremiumForm.get('CNG').patchValue(0)
      }
      else {
        this.cngEnable = false;
      }
    }

    this._onFormChanges()

  }

  //#endregion

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // #region getters

  get f() {
    return this.TpPremiumForm.controls
  }

  public get passengerPA() {
    return this.TpPremiumForm.controls["TPPremiumPADetails"] as FormArray;
  }

  // #endregion getters


  // submit or save action
  public submitform = () => {
    this.TPPremiumErrorAlerts = [];

    /**
     * Start Of Validation TP Premium Required Field
     */

    if (this.TpPremiumForm.get('CategoryName').value == 0 || this.TpPremiumForm.get('CategoryName').value == '') {
      this.TPPremiumErrorAlerts.push({
        Message: `Category is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TpPremiumForm.get('OwnerDriver').value === "") {
      this.TPPremiumErrorAlerts.push({
        Message: `Owner Driver is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TpPremiumForm.get('SubCategoryName').value === "") {
      this.TPPremiumErrorAlerts.push({
        Message: `Sub Category is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TpPremiumForm.get('LLDriver').value  === "") {
      this.TPPremiumErrorAlerts.push({
        Message: `LL Driver is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TpPremiumForm.get('PaidDriver').value === "") {
      this.TPPremiumErrorAlerts.push({
        Message: `Paid Driver is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TpPremiumForm.get('SubCategoryName').value != SubCategoryTypeLabelEnum.TwoWheeler) {
      if (this.TpPremiumForm.get('CNG').value === "") {
        this.TPPremiumErrorAlerts.push({
          Message: `CNG is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.TPPremiumErrorAlerts.length > 0) {
      this._alertservice.raiseErrors(this.TPPremiumErrorAlerts);
      return;
    }

    /**
     * End Of Validation TP Premium Required Field
     */

    /**
     * Start of Validate to Passenger PA Details
     **/

    this._validatePassengerPAField()

    if (this.PassengerPAAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PassengerPAAlerts)
      return;
    }

    /**
     * End of Validate to Passenger PA Details
     **/

    if (this.mode == "Edit") {
      this.TpPremiumForm.get("SubCategoryName").enable();
    }

    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.TpPremiumForm.value, this.TpPremiumListApi)
          .subscribe((res) => {
            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message, 'true')
              this.backClicked()
            } else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
        break;
      }

      case 'Edit': {
        this._dataService
          .updateData(this.TpPremiumForm.value, this.TpPremiumListApi)
          .subscribe((res) => {
            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message, 'true')
              this.backClicked()
            } else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
        break;
      }
    }
  };


  public onChange(event, type: string) {
    if (type == 'Status') {
      if (event.checked === true) {
        this.TpPremiumForm.controls['Status'].setValue(1)
        // this.Form.controls['Online'].value = 1

      } else {
        this.TpPremiumForm.controls['Status'].setValue(0)
      }
    }
  }


  public openDiolog(type: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true,
      filterData: [
        {
          Field: "Status",
          Operator: "eq",
          Value: 1
        }
      ]
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Category') {
          this.TpPremiumForm.patchValue({
            CategoryId: result.Id,
            CategoryName: result.Name,
          });
          this._subCategoryList();
        }

      }
    });
  }

  // public openDiologWithFilter(type: string, title: string) {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.disableClose = true;
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.width = '51vw';
  //   dialogConfig.minWidth = 'fit-content';
  //   dialogConfig.minHeight = 'fit-content';
  //   dialogConfig.maxHeight = '80vh';

  //   dialogConfig.data = {
  //     type: type,
  //     title: title,
  //     ispopup: true,
  //     filterData: [
  //       {
  //         Field: 'SubCategory.Category.Id',
  //         Value: this.TpPremiumForm.get('CategoryId').value,
  //         Operator: 'eq',
  //       },
  //       {
  //         Field: "Status",
  //         Operator: "eq",
  //         Value: 1
  //       }
  //     ]
  //   };

  //   const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       if (type == 'ProductPlan') {
  //         this.TpPremiumForm.patchValue({
  //           ProductCode: result.Code,
  //           ProductName: result.Name,
  //         });
  //       }

  //     }
  //   });
  // }

  // public ProductSelected(event: MatAutocompleteSelectedEvent): void {
  //   this.TpPremiumForm.patchValue({
  //     ProductCode: event.option.value.Code,
  //     ProductName: event.option.value.Name
  //   });
  // }

  public CategorySelected(event: MatAutocompleteSelectedEvent): void {
    this.TpPremiumForm.patchValue({
      CategoryId: event.option.value.Id,
      CategoryName: event.option.value.Name
    });
    this._subCategoryList();
  }

  // Reset function
  public clear(name: string, id: string): void {
    this.f[name].setValue("")
    this.f[id].setValue("")
  }

  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    } else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }

  // add new row in PassengerPA array
  public addPassengerPAs() {

    this._validatePassengerPAField()

    if (this.PassengerPAAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PassengerPAAlerts)
      return;
    }

    var row: IPassengerPAsDto = new PassengerPAsDto()
    this.passengerPA.push(this._initPassengerPAsForm(row));

  }

  // Remove row in PassengerPA array
  public RemovePassengerPAs(index: number) {
    
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.passengerPA.removeAt(index)
        }
      });
  }

  // #endregion public methods

  //#endregion

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------


  private _onFormChanges() {

    let Rule: IFilterRule[] = [
      {
        Field: "Status",
        Operator: "eq",
        Value: 1
      }
    ]


    this.TpPremiumForm.get('CategoryName').valueChanges.subscribe((val) => {
      this.Category$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Category.List, 'Name', val, Rule).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              return of(res.Data.Items);
            } else {
              return of([]);
            }
          } else {
            return of([]);
          }
        })
      );
      // this.TpPremiumForm.get('ProductName').patchValue('')
      this.TpPremiumForm.get('SubCategoryName').patchValue('')
    });

    // this.TpPremiumForm.get('ProductName').valueChanges.subscribe((val) => {

    //   let ruleForCategory: IFilterRule[] = [
    //     {
    //       Field: "Status",
    //       Operator: "eq",
    //       Value: 1
    //     },
    //     {
    //       Field: "SubCategory.Category.Id",
    //       Operator: "eq",
    //       Value: this.TpPremiumForm.get('CategoryId').value
    //     }
    //   ]

    //   this.Product$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.ProductPlan.List, 'Name', val, ruleForCategory).pipe(
    //     takeUntil(this.destroy$),
    //     switchMap((res) => {
    //       if (res.Success) {
    //         if (res.Data.Items.length) {
    //           return of(res.Data.Items);
    //         } else {
    //           return of([]);
    //         }
    //       } else {
    //         return of([]);
    //       }
    //     })
    //   );
    // });

    this.TpPremiumForm.get('SubCategoryName').valueChanges.subscribe((val) => {
      this.SubCategory$ = this._MasterListService.getAllSubCategoryList(val, 'Category.Id', this.TpPremiumForm.get('CategoryId').value, 'eq').pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.Name, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.Name) {
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

      this.SubCategoryList.forEach((element) => {
        if (element.Name == val) {
          this.TpPremiumForm.get('SubCategoryId').patchValue(element.Id)
        }
      })

      if (val == "Two Wheeler") {
        this.cngEnable = true;
        this.TpPremiumForm.get('CNG').patchValue(0)
      }
      else {
        this.cngEnable = false;
      }
    });
  }


  private _initForm(TpPremiumData: ITPPremiumDto, mode: string): FormGroup {
    this.TpPremiumForm = this._fb.group({
      Id: [0],
      CategoryId: [null, [Validators.required]],
      CategoryName: ['', [Validators.required]],
      SubCategoryId: [null, [Validators.required]],
      SubCategoryName: ['', [Validators.required]],
      // ProductCode: ['',[Validators.required]],
      // ProductName: ['',[Validators.required]],
      PaidDriver: [0, [Validators.required]],
      OwnerDriver: [0, [Validators.required]],
      LLDriver: [0, [Validators.required]],
      CNG: [0],
      // PassengerPA: [null,[Validators.required]],
      // PassengerPAAmount: [null,[Validators.required]],
      Status: [1, [Validators.required]],
      TPPremiumPADetails: this._buildPassengerPAsForm(TpPremiumData.TPPremiumPADetails)
    });


    if (TpPremiumData) {
      this.TpPremiumForm.patchValue(TpPremiumData);
    }
    if (mode == "View") {
      this.TpPremiumForm.disable();
    }

    return this.TpPremiumForm;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  private _subCategoryList() {

    // this.TpPremiumForm.get('CategoryName').valueChanges.subscribe((val) => {
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Category.Name', this.TpPremiumForm.get('CategoryName').value).subscribe((res) => {

      if (res.Success) {
        this.SubCategoryList = res.Data.Items
      }

    })
    // })
  }

  //Build Passenger PA Formarray
  private _buildPassengerPAsForm(items: IPassengerPAsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPassengerPAsForm(i));
        });
      }
    }

    return formArray;
  }

  //Init Passenger PA formgroup
  private _initPassengerPAsForm(item: IPassengerPAsDto): FormGroup {
    let dF = this._fb.group({
      Id: [0],
      TransactionId: [0],
      PassengerPA: [0, [Validators.required]],
      PassengerPAAmount: [0, [Validators.required]]
    })
    if (item != null) {
      if (!item) {
        item = new PassengerPAsDto();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  private _validatePassengerPAField() {

    this.PassengerPAAlerts = []

    this.passengerPA.controls.forEach((element, index) => {
      if (element.get('PassengerPA').value === "") {

        this.PassengerPAAlerts.push({
          Message: `Passenger PA-Sum Ins. ${index + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (element.get('PassengerPA').value === 0) {
        if(element.get('PassengerPAAmount').value > 0){
          this.PassengerPAAlerts.push({
            Message: `Passenger PA-Premium ${index + 1} must be Zero in case of Passenger PA-Sum Ins. ${index + 1} is Zero.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }


      if (element.get('PassengerPAAmount').value === "") {

        this.PassengerPAAlerts.push({
          Message: `Passenger PA-Premium ${index + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

    /**
     * check duplicate value if all mandatory fields are proper validated
     *
    */
    if (this.PassengerPAAlerts.length < 1) {
      this.PassengerPAAlerts = []
      let unique = [...new Set(this.passengerPA.value.map(item => item.PassengerPA))];

      for (let i = 0; i < unique.length; i++) {

        var duplicateData = this.passengerPA.value.filter(function (element) {
          return (element.PassengerPA == unique[i]);
        });

        if (duplicateData.length > 1) {
          this.PassengerPAAlerts.push({
            Message: 'Passenger PA-Sum Ins. already exists in list.',
            CanDismiss: false,
            AutoClose: false,
          })
          this._alertservice.raiseErrors(this.PassengerPAAlerts);
          break
        }
      };
    }

  }
  // #endregion private methods
}
