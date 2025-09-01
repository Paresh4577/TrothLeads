import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { AttachmentModalComponent } from '../../transaction/attachment-modal/attachment-modal.component';
import { environment } from 'src/environments/environment';
import { RfqService } from '../rfq.service';

@Component({
  selector: 'gnx-rfq-attachment-popup',
  templateUrl: './rfq-attachment-popup.component.html',
  styleUrls: ['./rfq-attachment-popup.component.scss']
})
export class RfqAttachmentPopupComponent {

  //Variables


  //APIs
  AttachmentDownloadAPI = API_ENDPOINTS.RFQ.DownloadDocument;

  constructor(
    public dialogRef: MatDialogRef<AttachmentModalComponent>,
    private _dataService: HttpService,
    private _rfqService: RfqService,
    private _CommonFuncService: CommonFunctionsService,
    private _alertservice: AlertsService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      Documents: any,
    }
  ) { }

  ngOnInit(): void {

  }

  public downloadAttachment(data) {

    let api = this.AttachmentDownloadAPI.replace("{id}", data.Id);

    this._dataService.getAttachmentDownload(api).subscribe((res) => {
      this._CommonFuncService.DownloadPolicy(res,data.FileName)
    })

  }
 
  public downloadAttachmentQuotation(data) {

    this._rfqService.DownloadQnDocument(data.Id).subscribe((res) => {
      this._CommonFuncService.DownloadPolicy(res,data.FileName)
    })

  }

  public ViewAttachment(item){
    if (item.StorageFilePath) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + item.StorageFilePath)
    }
  }

  public close() {
    this.dialogRef.close()
  }
}

