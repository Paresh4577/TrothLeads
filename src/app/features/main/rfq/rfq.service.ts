import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { ResponseMessage } from '@models/common';
import { ISendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { HealthPolicyStatusCode } from 'src/app/shared/enums/rfq-health';
import { RfqAttachmentPopupComponent } from './rfq-attachment-popup/rfq-attachment-popup.component';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { RfqAssignUwComponent } from './rfq-assign-uw/rfq-assign-uw.component';
import { RfqShareDialogComponent } from './rfq-share-dialog/rfq-share-dialog.component';
import { IRFQLiabilityQNDocumentsDto } from '@models/dtos';

@Injectable({
  providedIn: 'root'
})
export class RfqService {

  public assignUnassignRes: BehaviorSubject<any> = new BehaviorSubject(null); 

  constructor(
    private _http: HttpClient,
    private _commonFunService: CommonFunctionsService,
    private _alertservice: AlertsService,
    public dialog: MatDialog
  ) { }


  public SendBack(body: ISendBackRejectDTO) {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public Reject(body: ISendBackRejectDTO) {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  /**
   * Download Attached Quotation
   * @param id 
   * @returns 
   */
  public DownloadQnDocument(id: number): Observable<Blob> {
    let API = API_ENDPOINTS.RFQ.DownloadQnDoc + '/false/true';
    API = API.replace("{id}", id.toString());
    return this._http.get(API, { responseType: 'blob' });
  }

  public getRFQDocuments(RfqId: number) {
    let api = API_ENDPOINTS.RFQ.Docuents
    api = api.replace("{id}", RfqId.toString());
    this._http.get<ResponseMessage>(api).subscribe(res => {
      if (res.Success) {

        // if (res.Data.length == 0) {
        //   this._alertservice.raiseErrorAlert('No Attachment found.')
        //   return;
        // }

        let dialogConfig = new MatDialogConfig();

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.minWidth = "40vw";
        dialogConfig.minHeight = "55vh";
        dialogConfig.maxHeight = "75vh";

        dialogConfig.data = {
          Documents: res.Data,
        };

        const dialogRef = this.dialog.open(RfqAttachmentPopupComponent, dialogConfig);
        // dialogRef.afterClosed().subscribe((result) => {
        // })
      }
      else {
        this._alertservice.raiseErrorAlert(res.Message);
      }
    })
  }

  
  /**
   * RFQ assign , unassign OR re assign UW to RFQ Dialogbox
   * @param element 
   * @param type 
   */
  public rfqUWassign(element, type: 'assign' | 'unassign' | 'reassign') {
    this.assignUnassignRes = new BehaviorSubject(null); 

    //Set Title As per Selected Type
    let title:string = ''
    if(type == 'assign'){
      title = `Assign UW to RFQ No. ${element?.RFQNo}`
      }else if(type == 'reassign'){
      title = `Re Assign UW to RFQ No. ${element?.RFQNo}`
      }else if(type == 'unassign'){
      title = `Un Assign UW to RFQ No. ${element?.RFQNo}`
    }

        let dialogConfig = new MatDialogConfig();

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.minWidth = "250px";
        dialogConfig.maxWidth = "480px";
        dialogConfig.panelClass = "rfq-assign-uw-dialog";
        dialogConfig.data = {
          title: title,
          type: type,
          rfqData: element
        };

        const dialogRef = this.dialog.open(RfqAssignUwComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result) => {
          if(result){
            this.assignUnassignRes.next(result)
          }
        })
  }

  /**
   * RFQ Quotation share Dialog
   * @param quotation 
   */
  public rfqShareDialog(quotation: any) {

    //Set Title As per Selected Type
    let title: string = 'Share'


    let dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = '35vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.height = "fit-content";
    dialogConfig.panelClass = "rfq-assign-uw-dialog";
    dialogConfig.data = {
      title: title,
      quotation: quotation
    };

    const dialogRef = this.dialog.open(RfqShareDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {

    })
  }

  /**
  * Download Total RFQ Files
  * @param id 
  * @returns 
  */
  public downloadTotalRaiseRFQ(id: number): Observable<Blob> {
    let API = API_ENDPOINTS.RFQ.Download;
    API = API.replace("{id}", id.toString());
    return this._http.get(API, { responseType: 'blob' });
  }

  /**
   * Assign OR re assign User to RFQ
   * @param RFQId 
   * @param UserId 
   * @returns 
   */
  public assignUWtoRFQ(RFQId: number, UserId: number): Observable<ResponseMessage>{
    let API = API_ENDPOINTS.RFQ.assignUWtoRFQ + "?RFQId=" + RFQId + '&UserId=' + UserId;
    return this._http.post<ResponseMessage>(API,httpOptions);
  }
  
  /**
   * Un assign User From RFQ
   * @param RFQId 
   * @returns 
   */
  public unAssignUWtoRFQ(RFQId: number): Observable<ResponseMessage>{
    let API = API_ENDPOINTS.RFQ.unAssignUWtoRFQ + "?RFQId=" + RFQId;
    return this._http.post<ResponseMessage>(API,httpOptions);
  }

  /**
   * Share Quotation via email or whatsapp
   * @param selectedQnId 
   * @param shareType 
   * @param shareValue 
   * @returns 
   */
  public shareQuotation(selectedQnId: number, shareType: string, shareValue: string): Observable<ResponseMessage>{
    let API = API_ENDPOINTS.RFQ.shareQuotation + `/${selectedQnId}/Share/${shareType}/${shareValue}`;
    return this._http.get<ResponseMessage>(API, httpOptions);
  }
}
