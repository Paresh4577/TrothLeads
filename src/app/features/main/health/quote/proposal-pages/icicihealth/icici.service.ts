import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { KYCDto } from '@models/dtos/config';
import { IIciciHealthPaymentDto, IIllnessCodeDto, IllnessCodeDto } from '@models/dtos/config/Icici';
import { IBuyICICIHeathDto } from '@models/dtos/config/Icici/icicihealthDto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IciciService {
  constructor(private _http: HttpClient) {}

  /**
   * ICICI Proposal KYC
   * @param body 
   * @returns 
   */
  KYC(body: KYCDto): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.KYC.ICICI;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }

  /**
   * ICICI Proposal creation
   * @param body 
   * @returns 
   */
  CreateProposal(body: IBuyICICIHeathDto) {
    let API = API_ENDPOINTS.ICICI.ProposalCreate;
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  paymentLink(body:IIciciHealthPaymentDto) {
    let API =API_ENDPOINTS.ICICI.PaymentLink;
    return this._http.post<ResponseMessage>(API,body,httpOptions)
  }

  /**
   * Get Server Current Date
   * @returns 
   */
  currentDate() {
    let API = API_ENDPOINTS.Date.currentDate
    return this._http.get<ResponseMessage>(API,httpOptions)
  }

  /**
   * 
   * @returns Illness questionary List
   */
  getIIllnessCodes(): IIllnessCodeDto[] {
    let IllnessCodes: IIllnessCodeDto[] = new Array<IIllnessCodeDto>();
    let IllnessCode: IllnessCodeDto;

    // 1
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode13';
    IllnessCode.Text = 'Hypertension High Blood pressure History';
    IllnessCodes.push(IllnessCode);

    // 2
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode14';
    IllnessCode.Text = 'Diabetes Mellitus Sugar History';
    IllnessCodes.push(IllnessCode);

    // 3
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode15';
    IllnessCode.Text = 'Hyperlipidemia Cholesterol History';
    IllnessCodes.push(IllnessCode);

    // 4
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode16';
    IllnessCode.Text =
      'Does any person proposed to be insured smoke or consume Tobacco in any form or alcohol If yes please indicate the quantity consumed If not please indicate No';
    IllnessCodes.push(IllnessCode);

    // 5
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode17';
    IllnessCode.Text =
      'Heart and Circulatory Conditions Disorders chest pain angina palpitations congestive heart failure coronary artery disease heart attack bypass surgery angioplasty valve disorder replacement pacemaker insertion rheumatic fever congenital heart condition varicose veins clots in veins or arteries blood disorders anticoagulant therapy etc';
    IllnessCodes.push(IllnessCode);

    // 6
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode18';
    IllnessCode.Text =
      'Urinary Conditions or Disorders Blood in urine increase in urinary frequency painful or difficult urination Kidney and or Bladder infections stones of urinary system kidney failure dialysis or Any Other Kidney or Urinary Tract Or Prostate Disease';
    IllnessCodes.push(IllnessCode);

    // 7
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode19';
    IllnessCode.Text =
      'Musculoskeletal Conditions or Disorders Joint or back pain Arthritis Spondylosis Spondylitis SPinal disorders Surgeries Osteoporosis Osteomyelitis Joint Replacement Or Any Other Disorder of Muscle or Bone or Joint or ligaments tendons or discs gout herniated disc fractures or accidents or implants amputation or prosthesis Muscle weakness Polio etc';
    IllnessCodes.push(IllnessCode);

    // 8
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode20';
    IllnessCode.Text =
      'Respiratory Conditions or Disorders Shortness or difficulty of breath Tuberculosis Asthma Bronchitis Chronic Obstructive Pulmonary Disease COPD chronic cough coughing of blood etc or any Other Lung or Respiratory Disease';
    IllnessCodes.push(IllnessCode);

    // 9
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode21';
    IllnessCode.Text =
      'Digestive Conditions or Disorders Jaundice chronic diarrhea intestinal bleeding or problems or polyps diseases of the pancreas liver or gall bladder hepatitis A or B or C or other jaundice Ulcerative colitis Chrons disease Inflammatory or irritable bowel disease Cirrhosis unexplained weight loss or gain eating disorder or any Other Gastro Intestinal condition';
    IllnessCodes.push(IllnessCode);

    // 10
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode22';
    IllnessCode.Text =
      'Cancer or Tumor Benign Or Malignant tumor Any Growth or Cyst any Cancer diagnosed earlier and or treatment taken for cancer';
    IllnessCodes.push(IllnessCode);

    // 11
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode23';
    IllnessCode.Text =
      'Brain or Nervous System or Mental or Psychiatric Conditions or Developmental Disorders or Congenital or Birth defect Loss of consciousness fainting dizziness numbness or tingling weakness paralysis head injury stroke migraine headaches or chronic severe headaches sleep apnea multiple sclerosis seizures or epilepsy or any Other Brain or Nervous System Disease Mental or Psychiatric disorder ADHD autism disability or deformity whether physical or mental etc';
    IllnessCodes.push(IllnessCode);

    // 12
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode24';
    IllnessCode.Text =
      'Female Reproductive Conditionsor Disorders Pelvic pain abnormal menstrual bleeding abnormal PAP smear endometriosis Fibroid Cyst or Fibroadenoma Bleeding Disorder Pelvic infection Or Any Other Gynecological or Breast cysts or lumps or tumor';
    IllnessCodes.push(IllnessCode);

    // 13
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode25';
    IllnessCode.Text =
      'Eye Ear Nose and Throat Disorders Cataract glaucoma Opticneuritis retinal detachment conjunctivitis squint ptosis Blindness refractive error or spectacle number in dioptres otitis media Deviated Nasal Septum Otosclerosis Loss of speech Hearing loss nasal polyps chronic sinusitis Any other disorder of Ear Nose and Throat';
    IllnessCodes.push(IllnessCode);

    // 14
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode26';
    IllnessCode.Text =
      'Sexually Transmitted Diseases HIV or AIDS immunodeficiency or any venereal disease VD or sexually transmitted disease STD';
    IllnessCodes.push(IllnessCode);

    // 15
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode27';
    IllnessCode.Text =
      'Metabolic Endocrine Conditions or Disorders and autoimmune or genetic disorder Adrenal or pituitary disorders thyroid disorder lupus scleroderma thyroid disorders Thallasemia anemia Hemophillia Obesity and related surgeries etc';
    IllnessCodes.push(IllnessCode);

    // 16
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode28';
    IllnessCode.Text =
      'Is any female member pregnant tested positive with a home pregnancy test or ectopic pregnancy infertility treatment';
    IllnessCodes.push(IllnessCode);

    // 17
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode29';
    IllnessCode.Text =
      'Does the person proposed to be insured suffer from any chronic or long term medical condition or have any other disability abnormality or recurrent illness or injury or unable to perform normal activities';
    IllnessCodes.push(IllnessCode);

    // 18
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode30';
    IllnessCode.Text =
      'Has any member consulted with or received treatment from any doctor or other health care provider for any other condition or symptoms or undergone any hospitalization or illness or surgery or currently taking medications for any condition or medical procedures including diagnostic testing';
    IllnessCodes.push(IllnessCode);

    // 19
    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode31';
    IllnessCode.Text =
      'Does the individual have a family history of any disease like Heart disease or brain disease or cancer or organ failure or autoimmune or genetic disorder';
    IllnessCodes.push(IllnessCode);

    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode32';
    IllnessCode.Text =
      'Has any application for life, health, hospital daily cash or critical illness insurance ever been declined, postponed, loaded or been made subject to any special conditions by any insurance company';
    IllnessCodes.push(IllnessCode);

    IllnessCode = new IllnessCodeDto();
    IllnessCode.Code = 'IllnessCode33';
    IllnessCode.Text =
      'Have you or any other member proposed to be insured under this policy sought medical advice or been advised or awaiting any treatment medical or surgical due to any of the diseases / condition listed above or otherwise attend follow up for any diseases / condition / ailment / injury / addiction';
    IllnessCodes.push(IllnessCode);
    return IllnessCodes;
  }
}
