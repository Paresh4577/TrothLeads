import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';

@Component({
  selector: 'gnx-vehicle-type-import',
  templateUrl: './vehicle-type-import.component.html',
  styleUrls: ['./vehicle-type-import.component.scss']
})
export class VehicleTypeImportComponent {

  // Strings
  title: string = ''; // page Header Title

  //File

  SelectedFile:File


  /**
  * #region constructor
  */
  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
  ) {

  }
  // #endregion constructor

  //#region lifecycle-hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.title = data['title']; // Set PAge Title
  }

  //#endregion


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // #region getters

  public OnChangeFile(files) {
    if (files[0]) {
      let file = files[0];
      this.SelectedFile = file
    }
  }

  public CancelUplod(){
    this.SelectedFile = null
  }

  // previous page navigation button
  public backClicked() {
      this._router.navigate(['../'], { relativeTo: this._route })
  }

  // #endregion public methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
}

