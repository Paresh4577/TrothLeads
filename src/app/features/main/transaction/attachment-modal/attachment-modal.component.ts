import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';

@Component({
  selector: 'gnx-attachment-modal',
  templateUrl: './attachment-modal.component.html',
  styleUrls: ['./attachment-modal.component.scss']
})

export class AttachmentModalComponent implements OnInit {

  //Variables
  

  //APIs
  AttachmentDownloadAPI = API_ENDPOINTS.Attachment.Download;
  
  constructor(
    public dialogRef: MatDialogRef<AttachmentModalComponent>,
    private _dataService: HttpService,
    private _CommonFuncService: CommonFunctionsService,
    private _alertservice: AlertsService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      Documents: any,
      TransactionNo : any
    }
  ) { }

  ngOnInit(): void {
  }

  public downloadAttachment(data){

    let api = this.AttachmentDownloadAPI.replace("{id}", data.Id);
    
    this._dataService.getAttachmentDownload(api).subscribe((res) => {
      this._CommonFuncService.DownloadPolicy(res, this.data.TransactionNo+'_'+data.FileName)
    })

  }

  public close() {
    this.dialogRef.close()
  }
}
