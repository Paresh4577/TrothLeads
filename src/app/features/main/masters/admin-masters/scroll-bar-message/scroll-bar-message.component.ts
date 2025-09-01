import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { HttpService } from '@lib/services/http/http.service';
import { IScrollBarMessageDto, ScrollBarMessageDto } from '@models/dtos/core/scroll-bar-message-dto';

@Component({
  selector: 'gnx-scroll-bar-message',
  templateUrl: './scroll-bar-message.component.html',
  styleUrls: ['./scroll-bar-message.component.scss']
})
export class ScrollBarMessageComponent {

  // #region public variables

  // Strings
  mode: string = '';
  title: string = '';
  scrollBarMessageApi = API_ENDPOINTS.ScrollBarMessage.Base;

  // FormGroup
  scrollBarMSGForm: FormGroup;

  // Errors
  errors: unknown;
  // #endregion public variables

  /**
   * #region constructor
   * @param _location : used for back or prev page navigation
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */
  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _alertservice: AlertsService,
    public _helperservice: HelperService
  ) {

  }
  // #endregion constructor


  //#region lifecycle hooks
  // -----------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------
  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.mode = data['mode'];
    this.title = data['title'];
    this.scrollBarMSGForm = this._init(data['data']);
  }
  //#endregion lifecycle hooks


  // #region getters

  get f() {
    return this.scrollBarMSGForm.controls
  }

  // #endregion getters

  /**
   * #region public methods
   */

  // submit or save action
  submitForm = () => {
    this._dataService
      .createData(this.scrollBarMSGForm.value, this.scrollBarMessageApi)
      .subscribe((res) => {
        if (res.Success) {
          // handle success message here
          this._alertservice.raiseSuccessAlert(res.Message, 'true')
          this.backClicked()
        } else {
          this._alertservice.raiseErrors(res.Alerts);
          // handle page/form level alerts here
          if (res.Alerts[0]) {
            this.errors = res.Alerts[0].Message
          }
        }
      });
  };

  // previous page navigation button
  public backClicked() {
    this._router.navigate([ROUTING_PATH.Basic.setting]);
  }

  // #endregion public methods

  /**
   * #region private methods
   */



  private _init(data: ScrollBarMessageDto): FormGroup {

    let fg = this._fb.group({
      Id: [0],
      Event1: [''],
      Event2: [''],
      Event3: [''],
      Event4: [''],
    });

    if (data) {
      fg.patchValue(data);
    }
    return fg;
  }
  // #endregion private methods
}
