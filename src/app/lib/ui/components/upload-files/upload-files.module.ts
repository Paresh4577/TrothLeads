import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadFilesComponent } from './upload-files.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    UploadFilesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    UploadFilesComponent
  ]
})
export class UploadFilesModule { }
