import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'gnx-group-head-popup',
  templateUrl: './group-head-popup.component.html',
  styleUrls: ['./group-head-popup.component.scss']
})
export class GroupHeadPopupComponent {
  title: string
  ispopup: boolean = false;
  mode: string

  constructor(
    public dialogRef: MatDialogRef<GroupHeadPopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string,
      mode: string,
      BranchId: number,
      BranchName: string
    }
  ) {
    this.title = this.data.title
    this.mode = this.data.mode
  }

  public createdGroupHeadData(result) {
    if (result) {
      this.dialogRef.close(result);
    }
    else {
      this.dialogRef.close();
    }
  }

}
