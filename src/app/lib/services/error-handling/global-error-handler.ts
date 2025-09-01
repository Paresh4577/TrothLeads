import { ErrorHandler, inject } from "@angular/core";
import { AlertsService } from "./alerts.service";

export class GlobalErrorHandler implements ErrorHandler {
  private _alertsService: AlertsService = inject(AlertsService);

   //Global Error Handling
   public handleError(err: any) {
    const chunkFailedMessage = /Loading chunk/;
    if (err && err.message && chunkFailedMessage.test(err.message)) {
        if (confirm("Server not available")) {
            window.location.reload();
        }
    }
    else if (err && err.message){
      this._alertsService.raiseErrorAlert(err.message);
    }
    else {
      this._alertsService.raiseErrorAlert("Cannot process request. Contact system administrator");
    }
}
}