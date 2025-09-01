import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'gnx-product-plan-popup',
  templateUrl: './product-plan-popup.component.html',
  styleUrls: ['./product-plan-popup.component.scss']
})
export class ProductPlanPopupComponent {
  title: string
  ispopup: boolean = false;
  mode: string
  CategoryName: string
  CategoryId: number
  SubCategoryName: string
  SubCategoryId: number
  InsurerCode: string
  InsurerName: string

  constructor(
    public dialogRef: MatDialogRef<ProductPlanPopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string,
      mode: string,
      CategoryName: string,
      CategoryId: number,
      SubCategoryName: string,
      SubCategoryId: number,
      InsurerCode: string,
      InsurerName: string,
    }
  ) {
    this.title = this.data.title
    this.mode = this.data.mode

    this.CategoryName = this.data.CategoryName
    this.CategoryId = this.data.CategoryId
    this.SubCategoryName = this.data.SubCategoryName
    this.SubCategoryId = this.data.SubCategoryId
    this.InsurerCode = this.data.InsurerCode
    this.InsurerName = this.data.InsurerName
  }

  public createdProductPlanData(result) {
    if (result) {
      this.dialogRef.close(result);
    }
    else {
      this.dialogRef.close();
    }
  }

}


