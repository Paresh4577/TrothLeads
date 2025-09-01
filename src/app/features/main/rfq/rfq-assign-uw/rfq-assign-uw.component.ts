import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { RfqService } from '../rfq.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { IAdditionalFilterObject, IFilterRule } from '@models/common';
import { MasterListService } from '@lib/services/master-list.service';
import { IUserDto } from '@models/dtos/core/userDto';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';

@Component({
  selector: 'gnx-rfq-assign-uw',
  templateUrl: './rfq-assign-uw.component.html',
  styleUrls: ['./rfq-assign-uw.component.scss']
})
export class RfqAssignUwComponent {
  //#region public properties
  public title: string
  public type: 'assign' | 'unassign' | 'reassign';
  public assignForm: FormGroup;
  public userList$: Observable<IUserDto[]> // Observable of user list
  //#endregion

  //#region private properties
  private _destroy$: Subject<any>;
  //#endregion

  //#region  constructor
  constructor(
    public dialogRef: MatDialogRef<RfqAssignUwComponent>,
    private _rfqService: RfqService,
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private _alertservice: AlertsService,
    private _masterListService: MasterListService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string,
      type: 'assign' | 'unassign' | 'reassign',
      rfqData: any
    }
  ) {

    this._destroy$ = new Subject();
  }

  //#endregion


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.title = this.data.title
    this.type = this.data.type
    this.assignForm = this._initForm()

    this._onFormChange()
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public close(): void {
    this.dialogRef.close()
  }

  //Assign , Un assign & re Assign method as per Selected Type
  public assignUnderWriter(): void {

    if (this.type == 'assign' || this.type == 'reassign') {
    if (!this.assignForm.get('AssignId').value){
      this._alertservice.raiseErrorAlert('Under Writer is required.')
      return;
    }
    }

    if (this.type == 'assign') {

      this._rfqService.assignUWtoRFQ(this.data.rfqData.Id, this.assignForm.value.AssignId).subscribe(res => {
        if (res.Success) {
          this.dialogRef.close(true)
          this._alertservice.raiseSuccessAlert(res.Message)
        } else {
          this._alertservice.raiseErrorAlert(res.Message)
        }
      })


    } else if (this.type == 'reassign') {

      this._rfqService.assignUWtoRFQ(this.data.rfqData.Id, this.assignForm.value.AssignId).subscribe(res => {
        if (res.Success) {
          this.dialogRef.close(true)
          this._alertservice.raiseSuccessAlert(res.Message)
        } else {
          this._alertservice.raiseErrorAlert(res.Message)
        }
      })


    } else if (this.type == 'unassign') {

      this._rfqService.unAssignUWtoRFQ(this.data.rfqData.Id).subscribe(res => {
        if (res.Success) {
          this.dialogRef.close(true)
          this._alertservice.raiseSuccessAlert(res.Message)
        } else {
          this._alertservice.raiseErrorAlert(res.Message)
        }
      })

    }

  }

  /**
   * Auto complete Option selected event
   * @param User 
   * @returns 
   */
  public displayassignpDataFn = (User) => {
    if (User) {
      this.assignForm.patchValue({
        AssignId: User.Id,
        AssignName: User.FullName,
      });
      return User.FullName;
    }
  };


  /**
 * When Blur Assign Field THen check If User Is selected Or not
 */
  public onAssignBlur(): void {
    let User = this.assignForm.value.Assign;

    if (User && User.Id) {
      this.assignForm.patchValue({
        AssignId: User.Id,
        AssignName: User.FullName,
      });

    } else {
      this.assignForm.patchValue({
        AssignId: null,
        AssignName: null,
        Assign: null
      }, { emitEvent: false });
    }
  }

  // /* Pop Up for Name of the Insurance Company
  //  * @param type:to identify api of which list is to be called
  //   * @param title: title that will be displayed on PopUp
  //   * /
  public openDiologForMasterData(type: string, title: string): void {

    let Rule: IFilterRule[] = [{
      Field: 'Status',
      Operator: 'eq',
      Value: 1
    }];

    let AdditionalFilters: IAdditionalFilterObject[] = [
      { key: 'UnderWriterOnly', filterValues: [this.data.rfqData.CategoryId?.toString()] }
    ]

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
      filterData: Rule,
      addFilterData: AdditionalFilters
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.assignForm.patchValue({
          AssignId: result.Id,
          AssignName: result.FullName,
          Assign: result,
        });

      }

    })
  }

  //Clear Assign UW User
  public clearAssign(): void{
    this.assignForm.patchValue({
      AssignId: null,
      AssignName: null,
      Assign: null
    }, { emitEvent: false });
  }
  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // form init
  private _initForm(): FormGroup {
    let fg = this._fb.group({
      Assign: [],
      AssignId: [],
      AssignName: [],
    })

    return fg;
  }

  //control value changes Function
  private _onFormChange(): void {

    this.assignForm.get('Assign').valueChanges.pipe(takeUntil(this._destroy$), debounceTime(500), distinctUntilChanged())
      .subscribe((val) => {
        if (typeof val === "string") {
          let Rule: IFilterRule[] = [{
            Field: 'Status',
            Operator: 'eq',
            Value: 1
          }];

          let AdditionalFilters: IAdditionalFilterObject[] = [
            { key: "FullName", filterValues: [val] },
            { key: 'UnderWriterOnly', filterValues: [this.data.rfqData.CategoryId?.toString()] }
          ]

          this.userList$ = this._masterListService
            .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
            .pipe(
              takeUntil(this._destroy$),
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
        }
      });

  }

}
