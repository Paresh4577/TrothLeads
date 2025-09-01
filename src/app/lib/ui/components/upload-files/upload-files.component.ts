import { Observable } from 'rxjs';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UploadFilesService } from '@lib/services/uploadFiles.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'gnx-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss'],
})
export class UploadFilesComponent implements OnChanges {

  @Input() mode;
  @Input() attachments;
  @Output() SetAttachments = new EventEmitter();
  @Output() PushAttachmentForm = new EventEmitter();
  @Output() PatchAttachments = new EventEmitter();

  apiDomain: string = environment.apiDomain;

  selectedFiles: FileList;
  progressInfos = [];
  message = '';

  Form: FormGroup;
  AttachmentDetails!: FormArray;
  ArrayOfSelectedFile = new Array<any>()

  fileInfos: Observable<any>;

  constructor(private uploadService: UploadFilesService, private _fb: FormBuilder) {
    this.Form = _fb.group({
      AttachmentDetails: _fb.array([])
    })

    this.Form.controls['AttachmentDetails'].valueChanges.subscribe(value => {
      this.PatchAttachments.emit(this.Form.controls['AttachmentDetails'].value)
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.attachments.length) {
      this.AttachmentDetails = this.Form.get('AttachmentDetails') as FormArray;

      if (this.attachments.length > this.Form.controls['AttachmentDetails']['controls'].length) {

        let dif = this.attachments.length - this.Form.controls['AttachmentDetails']['controls'].length;
        for (let index = 0; index < dif; index++) {
          this.AttachmentDetails.push(this._fb.group({
            Id: [0],
            AttachmentId: [0],
            FileName: [null],
            StorageFileName: [null],
            StorageFilePath: [null],
            Description: [''],
            IsDefault: [false],
            Deleted: [false]
          }));
        }

        this.AttachmentDetails.setValue(this.attachments)
      }

    }
  }

  public deleteAttachmentDetail(index) {
    if (!this.Form.controls['AttachmentDetails']['controls'][index]['controls']['Id'].value) {
      (this.Form.controls['AttachmentDetails'] as FormArray).removeAt(index)
    } else {

      this.Form.controls['AttachmentDetails']['controls'][index]['controls']['Deleted'].setValue(true)
      this.PatchAttachments.emit(this.Form.controls['AttachmentDetails'].value)
    }
  }

  changeIsDefault(index) {
    this.Form.controls['AttachmentDetails']['controls'].forEach(attachment => {
      attachment.controls['IsDefault'].setValue(false)
    });
    if (this.Form.controls['AttachmentDetails']['controls'][index]['controls']['IsDefault'].value) {
      this.Form.controls['AttachmentDetails']['controls'][index]['controls']['IsDefault'].setValue(false)
    } else {
      this.Form.controls['AttachmentDetails']['controls'][index]['controls']['IsDefault'].setValue(true)
    }

    this.SetAttachments.emit(this.Form.controls['AttachmentDetails'].value)
  }

  selectFiles(event) {
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    for (const file of event.target.files) {
      this.ArrayOfSelectedFile.push(file)
    }

    this.uploadFiles()
  }

  uploadFiles() {
    this.message = '';

    for (let i = 0; i < this.selectedFiles.length; i++) {
      this.upload(i, this.selectedFiles[i]);
    }
  }

  upload(idx, file) {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    this.uploadService.upload(file).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          let resBody = event.body

          if (resBody.success) {
            let fileData = resBody.data

            this.PushAttachmentForm.emit(
              this._fb.group({
                Id: [0],
                AttachmentId: [0],
                FileName: [fileData.fileName],
                StorageFileName: [fileData.storageFileName],
                StorageFilePath: [fileData.storageFilePath, [Validators.required]],
                Description: [''],
                IsDefault: [false],
                Deleted: [false]
              }))
          }
        }


      },
      err => {
        this.progressInfos[idx].value = 0;
        this.message = 'Could not upload the file:' + file.name;
      });
  }

}
