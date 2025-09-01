import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { Observable } from 'rxjs';
import { CategoryCodeEnum } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root'
})
export class CommissionMatrixService {

  //#region  constructor
  constructor(private _http: HttpClient) { }
  //#endregion constructor

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  public CreateCommissionCalMatrix(CategoryCode:string, formdata:FormData) {
    let api: string;

    if (CategoryCode == CategoryCodeEnum.Motor) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixMotor
    }
    else if (CategoryCode == CategoryCodeEnum.Health) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixHealth
    }
    else if (CategoryCode == CategoryCodeEnum.Fire) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixFire
    }
    else if (CategoryCode == CategoryCodeEnum.Engineering) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixEngineering
    }
    else if (CategoryCode == CategoryCodeEnum.PA) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixPersonalAccident
    }
    else if (CategoryCode == CategoryCodeEnum.Travel) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixTravel
    }
    else if (CategoryCode == CategoryCodeEnum.Miscellaneous) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixMiscellaneous
    }
    else if (CategoryCode == CategoryCodeEnum.Liability) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixLiability
    }
    else if (CategoryCode == CategoryCodeEnum.Package) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixPackage
    }
    else if (CategoryCode == CategoryCodeEnum.Life) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixLifeInsurance
    }
    else if (CategoryCode == CategoryCodeEnum.WorkmenComp) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixWorkmenCompensation
    }
    else if (CategoryCode == CategoryCodeEnum.Marine) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixMarine
    }
    else if (CategoryCode == CategoryCodeEnum.Group) {
      api = API_ENDPOINTS.CommissionCalMatrix.UploadCommissionMatrixGroup
    }

    let header = new HttpHeaders();
    header.append("Content-Type", "multipart/form-data");
    return this._http.post<ResponseMessage>(api, formdata, {
      headers: header,
    });

  }
 
  public VerifyCommissionCalMatrix(CategoryCode: string, formdata: FormData) {
    let api: string;

    if (CategoryCode == CategoryCodeEnum.Motor) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixMotor
    }
    else if (CategoryCode == CategoryCodeEnum.Health) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixHealth
    }
    else if (CategoryCode == CategoryCodeEnum.Fire) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixFire
    }
    else if (CategoryCode == CategoryCodeEnum.Engineering) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixEngineering
    }
    else if (CategoryCode == CategoryCodeEnum.PA) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixPersonalAccident
    }
    else if (CategoryCode == CategoryCodeEnum.Travel) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixTravel
    }
    else if (CategoryCode == CategoryCodeEnum.Miscellaneous) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixMiscellaneous
    }
    else if (CategoryCode == CategoryCodeEnum.Liability) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixLiability
    }
    else if (CategoryCode == CategoryCodeEnum.Package) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixPackage
    }
    else if (CategoryCode == CategoryCodeEnum.Life) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixLifeInsurance
    }
    else if (CategoryCode == CategoryCodeEnum.WorkmenComp) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixWorkmenCompensation
    }
    else if (CategoryCode == CategoryCodeEnum.Marine) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixMarine
    }
    else if (CategoryCode == CategoryCodeEnum.Group) {
      api = API_ENDPOINTS.CommissionCalMatrix.VerifyCommissionMatrixGroup
    }

    let header = new HttpHeaders();
    header.append("Content-Type", "multipart/form-data");
    return this._http.post<ResponseMessage>(api, formdata, {
      headers: header,
    });

  }


  public downloadCommissionMatrixSampleFile(categoryId: number): Observable<Blob>{
    let api = API_ENDPOINTS.CommissionCalMatrix.downloadSample + categoryId
    return this._http.post(api, '', { responseType: "blob" });
  }
  
  public downloadUploadedCommissionMatrixFile(Id: number): Observable<Blob>{
    let api = API_ENDPOINTS.CommissionCalMatrix.downloadUploadSheet.replace("{id}",Id.toString())
    return this._http.get(api, { responseType: "blob" });
  }


  public recalculateCommission(Form):Observable<any>{
    let api = API_ENDPOINTS.CommissionCalMatrix.recalculateCommission
    return this._http.post<ResponseMessage>(api, Form, httpOptions);
  }


  /**
   * Slab Commission-Cal-Matrix
   */
  public CreateSlabCommissionCalMatrix(CategoryCode: string, formdata: FormData) {
    let api: string;

    if (CategoryCode == CategoryCodeEnum.Motor) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixMotor
    }
    else if (CategoryCode == CategoryCodeEnum.Health) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixHealth
    }
    else if (CategoryCode == CategoryCodeEnum.Fire) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixFire
    }
    else if (CategoryCode == CategoryCodeEnum.Engineering) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixEngineering
    }
    else if (CategoryCode == CategoryCodeEnum.PA) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixPersonalAccident
    }
    else if (CategoryCode == CategoryCodeEnum.Travel) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixTravel
    }
    else if (CategoryCode == CategoryCodeEnum.Miscellaneous) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixMiscellaneous
    }
    else if (CategoryCode == CategoryCodeEnum.Liability) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixLiability
    }
    else if (CategoryCode == CategoryCodeEnum.Package) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixPackage
    }
    else if (CategoryCode == CategoryCodeEnum.Life) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixLifeInsurance
    }
    else if (CategoryCode == CategoryCodeEnum.WorkmenComp) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixWorkmenCompensation
    }
    else if (CategoryCode == CategoryCodeEnum.Marine) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixMarine
    }
    else if (CategoryCode == CategoryCodeEnum.Group) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.UploadSlabCommissionCalMatrixGroup
    }

    let header = new HttpHeaders();
    header.append("Content-Type", "multipart/form-data");
    return this._http.post<ResponseMessage>(api, formdata, {
      headers: header,
    });

  }

  public VerifySlabCommissionCalMatrix(CategoryCode: string, formdata: FormData) {
    let api: string;

    if (CategoryCode == CategoryCodeEnum.Motor) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixMotor
    }
    else if (CategoryCode == CategoryCodeEnum.Health) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixHealth
    }
    else if (CategoryCode == CategoryCodeEnum.Fire) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixFire
    }
    else if (CategoryCode == CategoryCodeEnum.Engineering) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixEngineering
    }
    else if (CategoryCode == CategoryCodeEnum.PA) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixPersonalAccident
    }
    else if (CategoryCode == CategoryCodeEnum.Travel) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixTravel
    }
    else if (CategoryCode == CategoryCodeEnum.Miscellaneous) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixMiscellaneous
    }
    else if (CategoryCode == CategoryCodeEnum.Liability) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixLiability
    }
    else if (CategoryCode == CategoryCodeEnum.Package) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixPackage
    }
    else if (CategoryCode == CategoryCodeEnum.Life) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixLifeInsurance
    }
    else if (CategoryCode == CategoryCodeEnum.WorkmenComp) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixWorkmenCompensation
    }
    else if (CategoryCode == CategoryCodeEnum.Marine) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixMarine
    }
    else if (CategoryCode == CategoryCodeEnum.Group) {
      api = API_ENDPOINTS.SlabCommissionCalMatrix.VerifySlabCommissionCalMatrixGroup
    }

    let header = new HttpHeaders();
    header.append("Content-Type", "multipart/form-data");
    return this._http.post<ResponseMessage>(api, formdata, {
      headers: header,
    });

  }

  public downloadSlabCommissionMatrixSampleFile(categoryId: number): Observable<Blob> {
    let api = API_ENDPOINTS.SlabCommissionCalMatrix.downloadSample + categoryId
    return this._http.post(api, '', { responseType: "blob" });
  }

  public downloadUploadedSlabCommissionMatrixFile(Id: number): Observable<Blob> {
    let api = API_ENDPOINTS.SlabCommissionCalMatrix.downloadUploadSheet.replace("{id}", Id.toString())
    return this._http.get(api, { responseType: "blob" });
  }

  //#endregion public-methods

}
