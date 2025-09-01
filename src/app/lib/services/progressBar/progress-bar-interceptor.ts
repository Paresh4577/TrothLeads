import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { finalize, Observable } from "rxjs";
import { ProgressBarService } from "./progress-bar.service";

@Injectable()
export class ProgressBarInterceptor implements HttpInterceptor {
  isAutoMode: boolean = true;
  /**
   * constructor
   */
  constructor(private _pbService: ProgressBarService) {
    //Subscribe to the auto mode
    this._pbService.auto$
      .subscribe(val => {
        this.isAutoMode = val;
      });
  }

  /**
  * Intercept
  *
  * @param req
  * @param next
  */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //If auto mode is off, do nothing
    if (!this.isAutoMode) {
      return next.handle(req);
    }

    //Set the loading status for the url
    this._pbService.setLoadingStatus(req.url, true);

    return next.handle(req).pipe(
      finalize(() => {
        //Set the loading status to false as the request is either completed or in error state
        this._pbService.setLoadingStatus(req.url, false);
      }));
  }
}