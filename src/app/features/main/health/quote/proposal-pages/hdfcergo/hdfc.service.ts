import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage, gResponseMessage } from '@models/common';
import { HDFCQuestionDto, IDataDto, IHDFCPaymentMappingDto, IHDFCQuestionDto } from '@models/dtos/config/Hdfc';
import { IBuyHdfcDto } from '@models/dtos/config/Hdfc/BuyHdfcDto';
import { IHDFCKYCDto } from '@models/dtos/config/Kyc/HDFC/hdfc-kyc-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HdfcService {
  // text - name of form filed (for formControlName)
  // label - to display label name
  // type - type of data 
  type1=[{text:'ExactDiagnosis',type:'text',label:'Exact Diagnosis'},{text:'DiagnosisDate',type:'date',label:'Diagnosis Date'},
         {text:'LastConsultationDate',type:'date',label:'Last Consultation Date'},
         {text:'CurrentStatus',type:'dropdown',label:'Current Status'},{text:'LineOfManagement',type:'dropdown',label:'Line Of Management'},
         {text:'IsMedicalQuestionOpted',type:'boolean',label:'Is Medical Question Opted'},
         {text:'DetailsOfTreatment',type:'text',label:'Details Of Treatment'},{text:'ExpectedDeliveryDate',type:'date',label:'Expected Delivery Date'},
         {text:'ProposedSurgery',type:'text',label:'Proposed Surgery'},{text:'Remarks',type:'text',label:'Remarks'},
         {text:'SurgeryDate',type:'date',label:'Surgery Date'},{text:'TestDate',type:'date',label:'Test Date'},
         {text:'TestType',type:'text',label:'Test Type'},{text:'TestFindings',type:'text',label:'Test Findings'}
        ]

  constructor(private _http: HttpClient) {}

  KYC(body: IHDFCKYCDto): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.KYC.HDFC;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }

  CreateProposal(body: IBuyHdfcDto) : Observable<gResponseMessage<IDataDto>> {
    let API = API_ENDPOINTS.HDFC.ProposalCreate
    return this._http.post<gResponseMessage<IDataDto>>(API, body, httpOptions)
  }

  paymentMapping(body: IHDFCPaymentMappingDto): Observable<ResponseMessage> {
    let api = API_ENDPOINTS.HDFC.PaymentMapping
    return this._http.post<ResponseMessage>(api,body,httpOptions)
  }

  // this function returns the list of the Illnesses for HDFC 
  getIllness(){
    let Illnesses : IHDFCQuestionDto[] = new Array<HDFCQuestionDto>();
    let Illness : IHDFCQuestionDto;

    // 1
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1001','Hypertension/ High blood pressure?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 2
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1002','Diabetes/ High blood sugar/Sugar in urine?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[6],this.type1[5]])
    Illnesses.push(Illness);

    // 3
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1003','Cancer, Tumour, Growth or Cyst of any kind',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[6],this.type1[5]])
    Illnesses.push(Illness);

    // 4
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1004','Chest Pain/ Heart Attack or any other Heart Disease/ Problem?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[6],this.type1[5]])
    Illnesses.push(Illness);

    // 5
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1005','Liver or Gall Bladder ailment/Jaundice/Hepatitis B or C?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[6],this.type1[5]])
    Illnesses.push(Illness);

    // 6
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1006','Kidney ailment or Diseases of Reproductive organs?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[6],this.type1[5]])
    Illnesses.push(Illness);

    // 7
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1007','Tuberculosis/ Asthma or any other Lung disorder?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[6],this.type1[5]])
    Illnesses.push(Illness);

    // 8
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1008','Ulcer (Stomach/ Duodenal), or any ailment of Digestive System?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[6],this.type1[5]])
    Illnesses.push(Illness);

    // 9
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1009','Any Blood disorder (example Anaemia, Haemophilia, Thalassaemia) or any genetic disorder?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[6],this.type1[5]])
    Illnesses.push(Illness);

    // 10
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1010','HIV Infection/AIDS or Positive test for HIV?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 11
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1011','Nervous, Psychiatric or Mental or Sleep disorder?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 12
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1012','Stroke/ Paralysis/ Epilepsy (Fits) or any other Nervous disorder (Brain / Spinal Cord etc.)?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 13
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1013','Abnormal Thyroid Function/ Goiter or any Endocrine organ disorders?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 14
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1014','Eye or vision disorders/ Ear/ Nose or Throat diseases?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 15
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1015',' Arthritis, Spondylitis, Fracture or any other disorder of Muscle Bone/ Joint/ Ligament/ Cartilage?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 16
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('1016','Any other disease/condition not mentioned above?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 17
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('2','Has planned a surgery?',[this.type1[0],this.type1[10],this.type1[2],this.type1[3],this.type1[4],this.type1[8],this.type1[5]])
    Illnesses.push(Illness);

    // 18
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('3','Takes medicines regularly?',[this.type1[0],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 19
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('4','Has been advised investigation or further tests?',[this.type1[11],this.type1[12],this.type1[13],this.type1[5]])
    Illnesses.push(Illness);

    // 20
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('5','Was hospitalized in the past?',[this.type1[0],this.type1[1],this.type1[2],this.type1[3],this.type1[4],this.type1[5]])
    Illnesses.push(Illness);

    // 21
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('6','Is Pregnant?',[this.type1[7],this.type1[5]])
    Illnesses.push(Illness);

    // 22
    Illness = new HDFCQuestionDto();
    Illness = this.AddQuestion('7','None of the above',[this.type1[9],this.type1[5]])
    Illnesses.push(Illness);
   
    
    return Illnesses
  }

  // Code - is for QuestionnaireId
  // Text - is for QuestionnaireDescription
  // data - is for QuestionArray
  private AddQuestion(Code:string,Text:string,data?): HDFCQuestionDto {
    let Que:IHDFCQuestionDto = new HDFCQuestionDto();
    let tempArray =[]
    Que.QuestionnaireId = Code;
    Que.QuestionnaireDescription = Text
    if (data){
      for (var i in data) {
        tempArray.push(data[i])
      }
      Que.QuestionArray = tempArray
    }
    return Que
  }

}
