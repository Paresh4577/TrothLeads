import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'gnx-fleet-popup',
  templateUrl: './fleet-popup.component.html',
  styleUrls: ['./fleet-popup.component.scss']
})
export class FleetPopupComponent {
  title: string
  ispopup: boolean = false;
  mode: string

  constructor(
    public dialogRef: MatDialogRef<FleetPopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string,
      mode: string
    }
  ) {
    this.title = this.data.title
    this.mode = this.data.mode
  }

  public createdFleetData(result) {
    if (result) {
      this.dialogRef.close(result);
    }
    else {
      this.dialogRef.close();
    }
  }
}
