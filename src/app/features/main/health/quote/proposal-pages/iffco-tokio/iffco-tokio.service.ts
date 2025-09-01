import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IIffcoTokioQuestionDto, IffcoTokioQuestionDto } from '@models/dtos/config/IffcoTokio';
import { IIffcoTokioDto } from '@models/dtos/config/IffcoTokio/iffco-tokio-dto';
import { IIffkoTokioKYCDto } from '@models/dtos/config/Kyc/IffcoTokio/iffko-tokio-kycdto';

@Injectable({
  providedIn: 'root'
})
export class IffcoTokioService {

  constructor(private _http: HttpClient) { }

  /*
  *Create Proposal  IFFCO_TOKIO
  */
  CreateProposal (body:IIffcoTokioDto) {
    let API = API_ENDPOINTS.IFFCO_TOKIO.ProposalCreate
    return this._http.post<ResponseMessage>(API,body,httpOptions)
  }

  /**
   *For  Proposal KYC 
   */
  KYC (body: IIffkoTokioKYCDto) {
    let API = API_ENDPOINTS.KYC.IffcoTokio
    return this._http.post<ResponseMessage>(API,body,httpOptions)
  }

  /**
   * 
   * @returns Illness Question List
   */
  getIllness(){
    let Illnesses : IIffcoTokioQuestionDto[] = new Array<IffcoTokioQuestionDto>();
    let Illness : IIffcoTokioQuestionDto;

    // 1
    Illness = new IffcoTokioQuestionDto()
    Illness.Id = 'Q1',
    Illness.Description = 'High or low blood pressure ?',
    Illnesses.push(Illness)

    // 2
    Illness = new IffcoTokioQuestionDto()
    Illness.Id = 'Q2',
    Illness.Description = 'Diabetes ?',
    Illnesses.push(Illness)

    // 3
    Illness = new IffcoTokioQuestionDto()
    Illness.Id = 'Q11',
    Illness.Description = 'Thyroid disorder or any other endocrine disorder ?',
    Illnesses.push(Illness)

    // 4
    Illness = new IffcoTokioQuestionDto()
    Illness.Id = 'Q98',
    Illness.Description = 'Do you depend on insulin ?',
    Illnesses.push(Illness)

    // 5
    Illness = new IffcoTokioQuestionDto()
    Illness.Id = 'Q99',
    Illness.Description = 'Any other existing disease or additional facts which effect the proposed insurance & should be closed to insurer ?',
    Illnesses.push(Illness)

    return Illnesses
  }
}
