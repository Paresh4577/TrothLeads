import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@lib/ui/components/dialog/dialog.component';
import { ConfirmDialogData } from '@models/common/confirm-dialog-data';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  confirmDialog(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog.open(DialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }
}
