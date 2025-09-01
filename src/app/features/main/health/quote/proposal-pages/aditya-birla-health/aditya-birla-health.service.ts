import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { AdityaBirlaIllnessDto, AdityaPersonalHabitDetailDto, IAdityaBirlaIllnessDto, IAdityaPersonalHabitDetailDto, IMemberPEDquestionList, MemberPEDquestionList } from '@models/dtos/config/AdityaBirla';
import { IAdityaBirlaDto } from '@models/dtos/config/AdityaBirla/aditya-birla-dto';
import { IAdityaBirlaKYCStatusDto } from '@models/dtos/config/Kyc/AdityaBirla';
import { IAdityaBirlaKYCDto } from '@models/dtos/config/Kyc/AdityaBirla/adityaBirla-kyc-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdityaBirlaHealthService {

  constructor(private _http: HttpClient) { }

  // Check Aditya birla policy Holder KYC 
  KYC(body: IAdityaBirlaKYCDto): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.KYC.AdityaBirla;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }

  // Check Aditya birla policy Holder KYC Status

  KYCStatus(body: IAdityaBirlaKYCStatusDto): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.KYC.AdityaBirlaKycStatus;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }


  // Create Proposal For Aditya birla policy
  CreateProposal(body: IAdityaBirlaDto){
    let url = API_ENDPOINTS.AdityaBirla.ProposalCreate;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }


  // Payment For Aditya Birla policy Purchase
  payment(formdata){
    let url = API_ENDPOINTS.AdityaBirla.Payment;
    return this._http.post<ResponseMessage>(url, formdata, httpOptions);
  }

  DocumentUpload(obj:{TransactionNo: string}){
    let url = API_ENDPOINTS.AdityaBirla.DocumentUpload;
    return this._http.post<ResponseMessage>(url, obj, httpOptions);
  }

  /**
   * 
   * @returns Person Habbit Question List 
   */

  getpersonalHabit(){

    let personalHabbit: IAdityaPersonalHabitDetailDto[] = new Array <AdityaPersonalHabitDetailDto>()
    let habbit: IAdityaPersonalHabitDetailDto

    //alcohol
    habbit = new AdityaPersonalHabitDetailDto()
    habbit.Type = "Alcohol"
    habbit.NumberOfYears = "1"
    personalHabbit.push(habbit)

    //smoking
    habbit = new AdityaPersonalHabitDetailDto()
    habbit.Type = "Smoking"
    habbit.NumberOfYears = "1"
    personalHabbit.push(habbit)

    //tobacco
    habbit = new AdityaPersonalHabitDetailDto()
    habbit.Type = "Tobacco"
    habbit.NumberOfYears = "1"
    personalHabbit.push(habbit)

    return personalHabbit

  }


/**
 * 
 * @returns Aditya birla Illenss Questionary List
 */

  getIllness() {
    let Illnesses: IAdityaBirlaIllnessDto[] = new Array<AdityaBirlaIllnessDto>()
    let Illness: IAdityaBirlaIllnessDto

    //PreExistDisease
    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hypertension"
    Illness.PedCode = "PE002"
    Illness.Remarks = "",
    Illnesses.push(Illness)
    Illness.WaitingPeriod = "0"


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Diabetes Mellitus",
    Illness.PedCode = "PE003"
    Illness.Remarks = "",
    Illness.WaitingPeriod = "0"
    Illnesses.push(Illness)


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedCode = "PE009"
    Illness.PedText = "Asthma",
    Illness.Remarks = "",
    Illness.WaitingPeriod = "0"
    Illnesses.push(Illness)


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hyperlipidemia",
    Illness.PedCode = "PE010"
    Illness.Remarks = "",
    Illness.WaitingPeriod = "0"
    Illnesses.push(Illness)


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Diabetes mellitus type 1,Diabetic foot,Diabetes Insipidus ",
    Illness.PedCode = "PE015"
    Illness.Remarks = "",
    Illness.WaitingPeriod = "0"
    Illnesses.push(Illness)


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Leukemia (ALL, AML, CLL or CML)",
      Illness.PedCode = "PE016"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Adrenal cancer",
    Illness.PedCode = "PE017"
    Illness.Remarks = "",
    Illness.WaitingPeriod = "0"
    Illnesses.push(Illness)


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Kaposi sarcoma",
    Illness.PedCode = "PE018"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Lymphoma (Hodgkin or Non-hodgkin)",
      Illness.PedCode = "PE019"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Colon cancer",
      Illness.PedCode = "PE020"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)


    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Ano-rectal cancer",
      Illness.PedCode = "PE021"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Astrocytoma",
      Illness.PedCode = "PE022"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "respiratory Failure",
      Illness.PedCode = "PE023"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Melanoma",
      Illness.PedCode = "PE024"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cholangiocarcinoma",
      Illness.PedCode = "PE025"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Bladder cancer",
      Illness.PedCode = "PE026"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Ewing's sarcoma",
      Illness.PedCode = "PE027"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Osteosarcoma",
      Illness.PedCode = "PE028"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Glioma",
      Illness.PedCode = "PE029"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Craniopharyngioma",
      Illness.PedCode = "PE030"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Breast cancer",
      Illness.PedCode = "PE031"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Carcinoid",
      Illness.PedCode = "PE032"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Germ Cell Tumor",
      Illness.PedCode = "PE033"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cervical Cancer",
      Illness.PedCode = "PE034"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Carcinoma In Situ (CIS)",
      Illness.PedCode = "PE035"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Endometrial Cancer ",
      Illness.PedCode = "PE036"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Esophageal Cancer",
      Illness.PedCode = "PE037"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Retinoblastoma",
      Illness.PedCode = "PE038"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Gastric (Stomach) Cancer",
      Illness.PedCode = "PE039"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Liver cancer",
      Illness.PedCode = "PE040"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Liver failure(Acute / Chronic )",
      Illness.PedCode = "PE041"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Oral (Oropharyngeal) cancer",
      Illness.PedCode = "PE042"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Renal cancer",
      Illness.PedCode = "PE043"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Wilm's tumor",
      Illness.PedCode = "PE044"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Lung cancer",
      Illness.PedCode = "PE045"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Metastatic cancer",
      Illness.PedCode = "PE046"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Multiple myeloma",
      Illness.PedCode = "PE047"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Neuroblastoma",
      Illness.PedCode = "PE048"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Ovarian Cancer",
      Illness.PedCode = "PE049"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pancreatic Cancer",
      Illness.PedCode = "PE050"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Parathyroid Cancer",
      Illness.PedCode = "PE051"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pheochromocytoma",
      Illness.PedCode = "PE052"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pituitary Tumor",
      Illness.PedCode = "PE053"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Prostate Cancer",
      Illness.PedCode = "PE054"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Squamous cell carcinoma",
      Illness.PedCode = "PE055"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Testicular Cancer",
      Illness.PedCode = "PE056"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Throat cancer",
      Illness.PedCode = "PE057"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Thyroid cancer",
      Illness.PedCode = "PE058"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Uterine cancer",
      Illness.PedCode = "PE059"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Vulvo-vaginal cancer",
      Illness.PedCode = "PE060"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Mitral Stenosis",
      Illness.PedCode = "PE061"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Aortic Stenosis",
      Illness.PedCode = "PE062"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Tricuspid Stenosis",
      Illness.PedCode = "PE063"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pulmonary Stenosis",
      Illness.PedCode = "PE064"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Mitral Regurgitation (Incompetence)",
      Illness.PedCode = "PE065"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Aortic Regurgitation (Incompetence)",
      Illness.PedCode = "PE066"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Tricuspid Regurgitation (Incompetence)",
      Illness.PedCode = "PE067"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pulmonary Regurgitation (Incompetence)",
      Illness.PedCode = "PE068"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Ventricular Septal Defect (VSD)",
      Illness.PedCode = "PE069"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Patent Ductus Arteriosus (PDA)",
      Illness.PedCode = "PE070"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Ebstein's  Anomaly",
      Illness.PedCode = "PE071"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Transposition of Great Vessels (TGV)",
      Illness.PedCode = "PE072"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Coarctation of Aorta",
      Illness.PedCode = "PE073"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Fallot's Tetralogy",
      Illness.PedCode = "PE074"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Aortic Aneurysm",
      Illness.PedCode = "PE075"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hypertrophic Obstructive Cardiomyopathy (HOCM)",
      Illness.PedCode = "PE076"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cardiomyopathy of any form",
      Illness.PedCode = "PE077"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Endocarditis of any form",
      Illness.PedCode = "PE078"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Vasculitis",
      Illness.PedCode = "PE079"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Emphysema",
      Illness.PedCode = "PE080"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Bronchiectasis",
      Illness.PedCode = "PE081"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Terminal lung disease ",
      Illness.PedCode = "PE082"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "COPD (chronic obstructive pulmonary disease)",
      Illness.PedCode = "PE083"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pulmonary Hypertension",
      Illness.PedCode = "PE084"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Respiratory Failure",
      Illness.PedCode = "PE085"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pneumothorax",
      Illness.PedCode = "PE086"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "HIV/AIDS",
      Illness.PedCode = "PE087"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Downs Syndrome",
      Illness.PedCode = "PE088"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Klinefelter's Syndrome",
      Illness.PedCode = "PE089"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Turner's Syndrome",
      Illness.PedCode = "PE090"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Thalassemia Major",
      Illness.PedCode = "PE091"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Aplastic Anemia",
      Illness.PedCode = "PE092"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Polycythemia Vera",
      Illness.PedCode = "PE093"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Idiopathic Thrombocytopenic Purpura (ITP)",
      Illness.PedCode = "PE094"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Heart failure",
      Illness.PedCode = "PE095"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Myocardial Infarction (Heart Attack)",
      Illness.PedCode = "PE096"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Ischaemic Heart Disease (IHD)",
      Illness.PedCode = "PE097"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Coronory Arterial Bypass Grafting (CABG or Heart Bypass)",
      Illness.PedCode = "PE098"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Percutaneous Transluminal Coronary Angioplasty (PTCA or Cornoary Angioplasty)",
      Illness.PedCode = "PE099"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hypertensive Crisis/Malignant hypertension",
      Illness.PedCode = "PE0100"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Organic PVD (Peripheral vascular disease)",
      Illness.PedCode = "PE0101"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cystic fibrosis",
      Illness.PedCode = "PE0102"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Interstitial Lung disease",
      Illness.PedCode = "PE0103"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pulmonary thromboembolism",
      Illness.PedCode = "PE0104"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pulmonary artery hypertension",
      Illness.PedCode = "PE0105"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Schizophrenia",
      Illness.PedCode = "PE0106"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Depression",
      Illness.PedCode = "PE0107"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Anxiety",
      Illness.PedCode = "PE0108"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Bipolar Disorder",
      Illness.PedCode = "PE0109"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Obsessive Compulsive Disorder (OCD)",
      Illness.PedCode = "PE0110"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Anorexia Nervosa",
      Illness.PedCode = "PE0111"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Bulimia Nervosa",
      Illness.PedCode = "PE0112"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Insomnia",
      Illness.PedCode = "PE0113"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Mania",
      Illness.PedCode = "PE0114"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Kidney (Renal) Failure",
      Illness.PedCode = "PE0115"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Nephrotic  Syndrome",
      Illness.PedCode = "PE0116"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Nephritic syndrome",
      Illness.PedCode = "PE0117"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Acute or Chronic Glomerulonephritis",
      Illness.PedCode = "PE0118"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Acute / Chronic Nephritis",
      Illness.PedCode = "PE0119"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Tubulo Interstitial Nephropathy",
      Illness.PedCode = "PE0120"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Diabetic nephropathy",
      Illness.PedCode = "PE0121"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Renal artery stenosis",
      Illness.PedCode = "PE0122"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Ulcerative Colitis",
      Illness.PedCode = "PE0123"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Crohn's Disease",
      Illness.PedCode = "PE0124"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hepatitis B",
      Illness.PedCode = "PE0125"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hepatitis C",
      Illness.PedCode = "PE0126"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cirrhosis",
      Illness.PedCode = "PE0127"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Alcoholic liver disease",
      Illness.PedCode = "PE0128"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Portal hypertension",
      Illness.PedCode = "PE0129"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Chronic Pancreatitis",
      Illness.PedCode = "PE0130"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Sjogren's Syndrome",
      Illness.PedCode = "PE0131"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "autoimmune hepatitis",
      Illness.PedCode = "PE0132"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Autoimmune pancreatitis",
      Illness.PedCode = "PE0133"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Systemic Lupus Erythematosus (SLE)",
      Illness.PedCode = "PE0134"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Rheumatoid Arthritis",
      Illness.PedCode = "PE0135"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Systemic Sclerosis",
      Illness.PedCode = "PE0136"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Scleroderma",
      Illness.PedCode = "PE0137"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Sarcoidosis",
      Illness.PedCode = "PE0138"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Amyloidosis",
      Illness.PedCode = "PE0139"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Porphyrias",
      Illness.PedCode = "PE0140"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Brain Tumour",
      Illness.PedCode = "PE0141"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hydrocephalus",
      Illness.PedCode = "PE0142"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Epilepsy (Seizures or Fits)",
      Illness.PedCode = "PE0143"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Stroke (Brain Hemorrhage or Cerebro-vascular accident)",
      Illness.PedCode = "PE0144"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Paralysis",
      Illness.PedCode = "PE0145"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Alzheimer's disease",
      Illness.PedCode = "PE0146"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Parkinson's disease",
      Illness.PedCode = "PE0147"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Motor neuron disorders",
      Illness.PedCode = "PE0148"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Multiple Sclerosis",
      Illness.PedCode = "PE0149"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Myasthenia gravis",
      Illness.PedCode = "PE0150"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Muscular dystrophies",
      Illness.PedCode = "PE0151"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Transient Ischemic Attack (TIA)",
      Illness.PedCode = "PE0152"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Bariatric Surgery",
      Illness.PedCode = "PE0153"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Achalasia cardia",
      Illness.PedCode = "PE0154"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Fatty Liver (NASH or Non Alcoholic Steato Hepatitis)",
      Illness.PedCode = "PE0155"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Arterial aneurysms",
      Illness.PedCode = "PE0156"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Peripheral vascular disease",
      Illness.PedCode = "PE0157"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Obstructive sleep apnoea",
      Illness.PedCode = "PE0158"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hemophilia",
      Illness.PedCode = "PE0159"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Multiple myeloma",
      Illness.PedCode = "PE0160"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Sickle cell disease",
      Illness.PedCode = "PE0161"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Wilson's disease",
      Illness.PedCode = "PE0162"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cerebral palsy",
      Illness.PedCode = "PE0163"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Atrial Flutter/ Fibrillation",
      Illness.PedCode = "PE0164"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Supra-Ventricular Tachycardia (SVT or PSVT)",
      Illness.PedCode = "PE0165"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Complete Heart block",
      Illness.PedCode = "PE0166"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cardiac pacemaker",
      Illness.PedCode = "PE0167"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Syphillis",
      Illness.PedCode = "PE0168"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Gonorrhea",
      Illness.PedCode = "PE0169"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cor pulmonale",
      Illness.PedCode = "PE0170"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Renal Transplantation",
      Illness.PedCode = "PE0171"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hepatic Transplantation (Liver)",
      Illness.PedCode = "PE0172"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Heart Transplantation",
      Illness.PedCode = "PE0173"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Lung Transplantation",
      Illness.PedCode = "PE0174"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pancreatic Transplantation",
      Illness.PedCode = "PE0175"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Bone Marrow Transplantation",
      Illness.PedCode = "PE0176"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pericarditis",
      Illness.PedCode = "PE0177"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Pericardial Tamponade",
      Illness.PedCode = "PE0178"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Chronic hepatitis",
      Illness.PedCode = "PE0179"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Mental retardation",
      Illness.PedCode = "PE0180"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Polycystic Kidney Disease",
      Illness.PedCode = "PE0181"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Medullary Cystic Kidney",
      Illness.PedCode = "PE0182"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Polycystic Ovarian Disease",
      Illness.PedCode = "PE0183"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Ankylosing spondylosis",
      Illness.PedCode = "PE0184"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Mitral valve prolapse (MVP)",
      Illness.PedCode = "PE0185"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Any other medical adversity of similar nature",
      Illness.PedCode = "PE0186"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cushings Syndrome",
      Illness.PedCode = "PE0187"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Addisons' Disease",
      Illness.PedCode = "PE0188"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Graves Disease",
      Illness.PedCode = "PE0189"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hyperparathyroidism",
      Illness.PedCode = "PE0190"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Severe obesity",
      Illness.PedCode = "PE0191"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "phenylketonuria",
      Illness.PedCode = "PE0192"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "muscular dystrophy ",
      Illness.PedCode = "PE0193"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Heart Valve disease",
      Illness.PedCode = "PE0194"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "coronary heart disease",
      Illness.PedCode = "PE0195"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hypertension (High Blood Pressure)",
      Illness.PedCode = "PE0196"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = " High Cholesterol or High Triglycerides",
      Illness.PedCode = "PE0197"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Tuberculosis (TB)",
      Illness.PedCode = "PE0198"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = " Asthma",
      Illness.PedCode = "PE0199"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = " Bronchitis",
      Illness.PedCode = "PE0200"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Ulcer (Stomach/Duodenal)",
      Illness.PedCode = "PE0201"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Reflux Disease (GERD)",
      Illness.PedCode = "PE0202"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Anal fissure, fistula",
      Illness.PedCode = "PE0203"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "piles",
      Illness.PedCode = "PE0204"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "stone in gall bladder",
      Illness.PedCode = "PE0205"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "stone in billiary tract",
      Illness.PedCode = "PE0206"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Stone/Calculus in the urinary system",
      Illness.PedCode = "PE0207"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "hernia of all the types",
      Illness.PedCode = "PE0208"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "hydrocele",
      Illness.PedCode = "PE0209"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "varicocele",
      Illness.PedCode = "PE0210"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Tumour - benign or malignant",
      Illness.PedCode = "PE0211"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "growth, cyst, or mass in the body",
      Illness.PedCode = "PE0212"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "any blood cancer",
      Illness.PedCode = "PE0213"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Arthritis of any type",
      Illness.PedCode = "PE0214"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Slipped Disc",
      Illness.PedCode = "PE0215"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "any disease of the muscles, bones or joints",
      Illness.PedCode = "PE0216"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Cataract",
      Illness.PedCode = "PE0217"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Deviated Nasal Septum",
      Illness.PedCode = "PE0218"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Nasal Polyps",
      Illness.PedCode = "PE0219"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "any disease of the Ear, Nose, Throat, Thyroid, Teeth, Eye",
      Illness.PedCode = "PE0220"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "immunodeficiency or any venereal disease (VD) / sexually transmitted diseases (STD)",
      Illness.PedCode = "PE0221"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Psychiatric /Mental illnesses",
      Illness.PedCode = "PE0222"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "congenital / birth defect",
      Illness.PedCode = "PE0223"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "disability or deformity whether physical / mental",
      Illness.PedCode = "PE0224"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Fibroid (Uterus)",
      Illness.PedCode = "PE0225"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Breast Lumps",
      Illness.PedCode = "PE0226"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "any other Gynaecological disease",
      Illness.PedCode = "PE0227"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Poliomyelitis",
      Illness.PedCode = "PE0228"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Genetic Disorder",
      Illness.PedCode = "PE0229"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Varicose Veins",
      Illness.PedCode = "PE0230"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Any Cancer",
      Illness.PedCode = "PE0231"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Any ulcer",
      Illness.PedCode = "PE0232"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "iron deficiency anaemia",
      Illness.PedCode = "PE0233"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "fibroadenoma of breast",
      Illness.PedCode = "PE0234"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Perforated tympanic membrane",
      Illness.PedCode = "PE0235"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hyperthyroidism ",
      Illness.PedCode = "PE0236"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hypothyroidism",
      Illness.PedCode = "PE0237"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Hyperlipidemia",
      Illness.PedCode = "PE0238"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Renal Cyst",
      Illness.PedCode = "PE0239"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Inguinal Hernia",
      Illness.PedCode = "PE0240"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    Illness = new AdityaBirlaIllnessDto()
    Illness.PedText = "Intestinal obstruction",
      Illness.PedCode = "PE242"
    Illness.Remarks = "",
Illness.WaitingPeriod = "0"
Illnesses.push(Illness)

    return Illnesses
  }


  /**
   * Aditya birla Member PED Questionary List ( " NEW  " )
   * @returns 
   */
  public getMemberPEDquestionList(){
    let PEDquestionList: IMemberPEDquestionList[] = new Array<MemberPEDquestionList>()
    let PEDquestion: IMemberPEDquestionList

    //Question -- 1
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Claim in previous policy";
    PEDquestion.QCode = "Q100";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = false;
    PEDquestionList.push(PEDquestion)

    //Question -- 2
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Have you ever been diagnosed with /advised / taken treatment or observation is suggested or undergone any investigation or consulted a doctor or undergone or advised surgery  for any one or more from the following? If YES then please mention Details in the additional information section below.";
    PEDquestion.QCode = "Q101";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = true;
    PEDquestionList.push(PEDquestion)

    //Question -- 3
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Have you ever been diagnosed with /advised / taken treatment or observation is suggested or undergone any investigation or consulted a doctor or undergone or advised surgery for Was any proposal for life, health, hospital daily cash or critical illness insurance declined, deferred, withdrawn or accepted with modified terms, if yes please provide details in additional information";
    PEDquestion.QCode = "Q102";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = true;
    PEDquestionList.push(PEDquestion)

    //Question -- 4
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Have you ever been diagnosed with /advised / taken treatment or observation is suggested or undergone any investigation or consulted a doctor or undergone or advised surgery  for Any form of Heart Disease, Peripheral Vascular Disease, procedures like Angioplasty/PTCA/By Pass Surgery , valve replacement etc";
    PEDquestion.QCode = "Q103";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = true;
    PEDquestionList.push(PEDquestion)

    //Question -- 5
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Have you ever been diagnosed with /advised / taken treatment or observation is suggested or undergone any investigation or consulted a doctor or undergone or advised surgery  for Diabetes, High blood pressure, High Cholesterol, Anaemia / Blood disorder (whether treated or not).";
    PEDquestion.QCode = "Q104";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = true;
    PEDquestionList.push(PEDquestion)

    //Question -- 6
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Have you ever been diagnosed with /advised / taken treatment or observation is suggested or undergone any investigation or consulted a doctor or undergone or advised surgery  for Tuberculosis (TB), any Respirato  / Lung disease";
    PEDquestion.QCode = "Q105";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = true;
    PEDquestionList.push(PEDquestion)

    //Question -- 7
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Have you ever been diagnosed with /advised / taken treatment or observation is suggested or undergone any investigation or consulted a doctor or undergone or advised surgery for Disease of Eye, Ear, Nose, Throat, Thyroid.";
    PEDquestion.QCode = "Q106";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = true;
    PEDquestionList.push(PEDquestion)

    //Question -- 8
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Have you ever been diagnosed with /advised / taken treatment or observation is suggested or undergone any investigation or consulted a doctor or undergone or advised surgery for Cancer, Tumour, lump, cyst, ulcer.";
    PEDquestion.QCode = "Q107";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = true;
    PEDquestionList.push(PEDquestion)

    //Question -- 9
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Have you ever been diagnosed with /advised / taken treatment or observation is suggested or undergone any investigation or consulted a doctor or undergone or advised surgery for Disease of Kidney, Digestive tract, Liver/Gall Bladder, Pancreas, Breast, Reproductive /Urina system, or any past complications of pregnancy/ child birth including high blood pressure or diabetes etc.";
    PEDquestion.QCode = "Q108";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = true;
    PEDquestionList.push(PEDquestion)

    //Question -- 10
    PEDquestion = new MemberPEDquestionList()
    PEDquestion.QText = "Have you ever been diagnosed with /advised / taken treatment is advised surgery for Disease of the Brain/Spine/Nervous System, Epilepsy, Paralysis, Polio, Joints/Arthritis, Congenital/ Birth defect, Genetic Disease/Physical deformity/disability, HIV/AIDS, other Sexually Transmitted Disease or Accidental injury or any other medical (other than common cold & viral fever) or surgical condition or Investigation parameter has been detected to be out of range/ not normal?";
    PEDquestion.QCode = "Q109";
    PEDquestion.IsCheck = false;
    PEDquestion.HasSubQuestion = true;
    PEDquestionList.push(PEDquestion)
    
    return PEDquestionList;
  }
}

