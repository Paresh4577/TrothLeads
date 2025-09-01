import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IBuyCareDto } from '@models/dtos/config/Care/BuyCareDto';
import {
  CareHeathQuestionDto,
  ICareHeathQuestionDto,
} from '@models/dtos/config/Care/CareHealthInsurance';
import { CareKYCDto } from '@models/dtos/config/Kyc/Care/care-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CareService {
  constructor(private _http: HttpClient) { }

  /**
   * Check Proposal KYC Details
   * @param body 
   * @returns 
   */
  KYC(body: CareKYCDto): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.KYC.Care;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }

/**
 * Create Care Proposal
 * @param body 
 * @returns 
 */

  CreateProposal(body: IBuyCareDto) {
    let API = API_ENDPOINTS.Care.ProposalCreate;
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  /*
  *Check Care Policy Status
  */
  StatusCheck(data: any) {
    let api = API_ENDPOINTS.Care.PolicyStatus;
    return this._http.post<any>(api, data, httpOptions);

  }

  /*
    input : Plan type
    return : this function return list of Question base on request (Plan)
   */

  getQuestions(Plan: string): ICareHeathQuestionDto[] {
    /*
      list of Questions to display in page
      question and sub questions in this array

      Plan : Questions in which plan
      SetCode : Code from insurance company for Question
      Code : is from Insurance company
      Description : Display in page for User to read and select
      Type  : it's to identify it's base question or sub-questions
      Response : it's type of user input (yes/no boolean, date - date)
      BaseQuestionCode: its code of parent question or child question
    */

    let CareHeathQuestions: ICareHeathQuestionDto[] =
      new Array<ICareHeathQuestionDto>();
    let Question: CareHeathQuestionDto;

    // Care Heart
    if (Plan == "Care Heart") {

      // 1
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP1';
      Question.Code = '114';
      Question.Description = 'Cancer,Tumor,Polyp or Cyst';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 2
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP1';
      Question.Code = 'ES52';
      Question.Description = 'Existing Since- MM/YYYY';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='114';
      CareHeathQuestions.push(Question);

      // 3
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP10';
      Question.Code = '105';
      Question.Description = 'HIV/SLE/ Arthiritis/ Scleroderma / Psoriasis/ bleeding or clotting disorders or any other diseases of Blood, Bone marrow/ Immunity or Skin';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 4
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP10';
      Question.Code = 'ES52';
      Question.Description = 'Existing Since-MM/YYYY';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='105';
      CareHeathQuestions.push(Question);

      // 5
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP13';
      Question.Code = '214';
      Question.Description = 'Asthma / Tuberculosis / COPD/ Pleural effusion / Bronchitis / Emphysema or any other disease of Lungs, Pleura and airway or Respiratory disease';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 6
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP13';
      Question.Code = 'ES52';
      Question.Description = 'Existing Since- MM/YYYY';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='214';
      CareHeathQuestions.push(Question);

      // 7
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP4';
      Question.Code = '222';
      Question.Description = 'Thyroid disease/ Cushings disease/ Parathyroid Disease/ Addisons disease / Pituitary tumor/ disease or any other disorder of Endocrine system';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 8
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP4';
      Question.Code = 'ES52';
      Question.Description = 'Existing Since- MM/YYYY';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='222';
      CareHeathQuestions.push(Question);

      // 9
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP8';
      Question.Code = '232';
      Question.Description = 'Cirrhosis/Hepatitis/Wilson disease/Pancreatitis/Liver, Crohn disease/Ulcerative Colitis/Piles/Gall bladder,Stomach/Intestine/Digestive system disease';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 10
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP8';
      Question.Code = 'ES52';
      Question.Description = 'Existing Since- MM/YYYY';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='232';
      CareHeathQuestions.push(Question);

      // 11
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP16';
      Question.Code = '210';
      Question.Description = 'Any other disease / health adversity / injury/ condition / treatment not mentioned above';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 12
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP16';
      Question.Code = 'ES52';
      Question.Description = 'Existing Since- MM/YYYY';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='210';
      CareHeathQuestions.push(Question);

      // 13
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP16';
      Question.Code = '714';
      Question.Description = 'Other Dieases Description';
      Question.Type = 'subquestion';
      Question.Response = 'Text';
      Question.BaseQuestionCode='210';
      CareHeathQuestions.push(Question);

      // 14
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCAR27';
      Question.Code = 'H047';
      Question.Description = 'Smoke,consume alcohol,chew tobacco,ghutka or paan or use any recreational drugs? If Yes then please provide the frequency & amount consumed ';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 15
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCAR27';
      Question.Code = 'H048';
      Question.Description = 'Hard Liquor- No.of Pegs in 30 ml per week';
      Question.Type = 'subquestion';
      Question.Response = 'integer';
      Question.BaseQuestionCode='H047';
      CareHeathQuestions.push(Question);

      // 16
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCAR27';
      Question.Code = 'H049';
      Question.Description = 'Beer-Bottles/ml per week';
      Question.Type = 'subquestion';
      Question.Response = 'integer';
      Question.BaseQuestionCode='H047';
      CareHeathQuestions.push(Question);

      // 17
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCAR27';
      Question.Code = 'H050';
      Question.Description = 'Wine-Glasses/ml per week';
      Question.Type = 'subquestion';
      Question.Response = 'integer';
      Question.BaseQuestionCode='H047';
      CareHeathQuestions.push(Question);

      // 18
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCAR27';
      Question.Code = 'H051';
      Question.Description = 'Smoking- No.of sticks per day';
      Question.Type = 'subquestion';
      Question.Response = 'integer';
      Question.BaseQuestionCode='H047';
      CareHeathQuestions.push(Question);

      // 19
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCAR27';
      Question.Code = 'H052';
      Question.Description = 'Gutka/Pan Masala/Chewing Tobacco etc- Grams per day';
      Question.Type = 'subquestion';
      Question.Response = 'integer';
      Question.BaseQuestionCode='H047';
      CareHeathQuestions.push(Question);

      // 20
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH010';
      Question.Code = 'A010';
      Question.Description = 'Have you been advised for any other/repeat procedure or admission? If yes please share details';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 21
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH007';
      Question.Code = 'A007';
      Question.Description = 'Have you undergone any procedure or surgery for any cardiac ailment?';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 22
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDCH109';
      Question.Code = '109';
      Question.Description = 'Are you or anyone of your family member 1st blood relationship suffering from any of the following conditions: Downs Syndrome/Turners Syndrome/Sickle Cell Anaemia/ Thalassemia Major/G6PD deficiency';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 23
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDCH109';
      Question.Code = 'SW001';
      Question.Description = 'Since When';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='109';
      CareHeathQuestions.push(Question);

      // 24
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH013';
      Question.Code = 'A013';
      Question.Description = 'Diabetes Mellitus / High Blood Sugar / Diabetes on Insulin or medication';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 25
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH015';
      Question.Code = 'A015';
      Question.Description = 'Has any of the Proposed to be Insured been hospitalized/recommended to take investigation/medication or has been under any prolonged treatment/undergone surgery for any illness/injury other than for childbirth/minor injuries';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 26
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP51';
      Question.Code = '152';
      Question.Description = 'Kidney stone/Renal Failure/ Dialysis/ Chronic Kidney Disease/ Prostate Disease or any other disease of Kidney, Urinary Tract or reproductive organs';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 27
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP51';
      Question.Code = 'ES52';
      Question.Description = 'Existing Since- MM/YYYY';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='152';
      CareHeathQuestions.push(Question);

      // 28
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDCH234';
      Question.Code = '234';
      Question.Description = 'Motor Neuron Disease/ Muscular dystrophies/ Myasthenia Gravis or any other disease of Neuromuscular system muscles and/or nervous system';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 29
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDCH234';
      Question.Code = 'SW001';
      Question.Description = 'Since When';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='234';
      CareHeathQuestions.push(Question);

      // 30
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH009';
      Question.Code = 'A009';
      Question.Description = 'Have you experienced any below mentioned symptoms post undergoing above mentioned surgery/procedure';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 31
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH009';
      Question.Code = 'A014';
      Question.Description = 'Chest heaviness or Pain';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A009';
      CareHeathQuestions.push(Question);

      // 32
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH009';
      Question.Code = 'A016';
      Question.Description = 'Difficulty in breathing';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A009';
      CareHeathQuestions.push(Question);

      // 33
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH009';
      Question.Code = 'A017';
      Question.Description = 'Palpitations';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A009';
      CareHeathQuestions.push(Question);

      // 34
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH009';
      Question.Code = 'A018';
      Question.Description = 'Loss of consciousness';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A009';
      CareHeathQuestions.push(Question);

      // 35
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH009';
      Question.Code = 'A019';
      Question.Description = 'Weakness or dizziness';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A009';
      CareHeathQuestions.push(Question);

      // 36
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP23';
      Question.Code = '164';
      Question.Description = 'Stroke /Paralysis /TransientIschemicAttack /MultipleSclerosis /Epilepsy /Mental-Psychiatricillness /Parkinson /Alzeihmer/Depression /Dementia /NervousSystem';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 37
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDSUP23';
      Question.Code = 'ES52';
      Question.Description = 'Existing Since- MM/YYYY';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='164';
      CareHeathQuestions.push(Question);

      // 38
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDCH224';
      Question.Code = '224';
      Question.Description = 'Disease or disorder of eye, ear, nose or throat except any sight related problems corrected by prescription lenses';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 39
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'PEDCH224';
      Question.Code = 'SW001';
      Question.Description = 'Since When';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode='224';
      CareHeathQuestions.push(Question);

      // 40
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH006';
      Question.Code = 'A006';
      Question.Description = 'Have you ever been diagnosed for any cardiac ailment /disorder?';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 41
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH012';
      Question.Code = 'A012';
      Question.Description = 'Hypertension / High Blood Pressure / High Cholesterol';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 42
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH008';
      Question.Code = 'A008';
      Question.Description = 'Please specify the type of cardiac ailment you have been operated for';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode=null;
      CareHeathQuestions.push(Question);

      // 43
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH008';
      Question.Code = 'H023';
      Question.Description = 'Have you undergone PTCA';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A008';
      CareHeathQuestions.push(Question);

      // 44
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH008';
      Question.Code = 'H024';
      Question.Description = 'CABG';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A008';
      CareHeathQuestions.push(Question);

      // 45
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH008';
      Question.Code = 'H025';
      Question.Description = 'Septal defect surgery-ASD/VSD';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A008';
      CareHeathQuestions.push(Question);

      // 46
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH008';
      Question.Code = 'H026';
      Question.Description = 'Radiofrequency ablation-RFA';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A008';
      CareHeathQuestions.push(Question);

      // 47
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Heart';
      Question.SetCode = 'HEDCH008';
      Question.Code = 'H027';
      Question.Description = 'Others cardiac surgery';
      Question.Type = 'subquestion';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode='A008';
      CareHeathQuestions.push(Question);

    }

    // Care Senior / Care Advantage
    if (Plan == "Care Senior" || Plan == "Care Advantage" || Plan == "Care Supreme" || Plan == "Care Plus Complete" || Plan == "Care Plus Youth") {

      // 1
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDdiabetesDetails';
      Question.Code = '205';
      Question.Description = 'Diabetes Mellitus type 1 or Diabetes on insulin or Diabetes associated with blindness or chronic foot ulcer';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 2
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDdiabetesDetails';
      Question.Code = 'diabetesExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '205';
      CareHeathQuestions.push(Question);

      // 3
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDhyperTensionDetails';
      Question.Code = '207';
      Question.Description = 'Hypertension / High Blood Pressure';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 4
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDhyperTensionDetails';
      Question.Code = 'hyperTensionExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '207';
      CareHeathQuestions.push(Question);

      // 5
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDliverDetails';
      Question.Code = '232';
      Question.Description = 'Pancreatitis or Liver disease (including but not limited to Cirrhosis / Hepatitis B or C / Willson’s disease) or any other digestive track disorder (disorders of esophagus or stomach or intestine or any other)';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 6
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDliverDetails';
      Question.Code = 'liverExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '232';
      CareHeathQuestions.push(Question);

      // 7
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDcancerDetails';
      Question.Code = '114';
      Question.Description = 'Cancer';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 8
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDcancerDetails';
      Question.Code = 'cancerExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '114';
      CareHeathQuestions.push(Question);

      // 9
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDcardiacDetails';
      Question.Code = '143';
      Question.Description = 'Any cardiovascular/Heart Disease (including but not limited to Coronary artery disease / Rheumatic heart disease / Heart Attack or Myocardial infarction / Heart failure / Bypass Grafting or CABG / Angioplasty or PTCA / Heart valve diseases / Pacemaker implantation)';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 10
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDcardiacDetails';
      Question.Code = 'cardiacExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.BaseQuestionCode = '143';
      Question.Response = 'date';

      // 11
      CareHeathQuestions.push(Question);
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDjointpainDetails';
      Question.Code = '105';
      Question.Description = 'Any disorders of Blood and / or Immunity (including but not limited to bleeding or clotting disorders, Systemic Lupus Erythematosus, Rheumatoid Arthritis, Crohn’s disease, Ulcerative Colitis).';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 12
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDjointpainDetails';
      Question.Code = 'jointpainExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '105';
      CareHeathQuestions.push(Question);

      // 13
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDkidneyDetails';
      Question.Code = '129';
      Question.Description = 'Any Kidney / urinary track / reproductive organ Disease';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 14
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDkidneyDetails';
      Question.Code = 'kidneyExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '129';
      CareHeathQuestions.push(Question);

      // 15
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDparalysisDetails';
      Question.Code = '164';
      Question.Description = 'Any Neuromuscular (muscles or nervous system) disorder or  Psychiatric disorders (including but not limited to Motor Neuron Disease, Muscular dystrophies, Epilepsy, Paralysis, Parkinsonism, multiple sclerosis, stroke, mental illness)';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 16
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDparalysisDetails';
      Question.Code = 'paralysisExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '164';
      CareHeathQuestions.push(Question);

      // 17
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDcongenitalDetails';
      Question.Code = '122';
      Question.Description = 'Congenital Disorder?';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 18
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDcongenitalDetails';
      Question.Code = 'congenitalExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '122';
      CareHeathQuestions.push(Question);

      // 19
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDHivaidsDetails';
      Question.Code = '147';
      Question.Description = 'HIV/ AIDS/ STD? * ';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 20
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDHivaidsDetails';
      Question.Code = 'hivaidsExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '147';
      CareHeathQuestions.push(Question);

      // 21
      // Question = new CareHeathQuestionDto();
      // Question.Plan = 'Care Senior';
      // Question.SetCode = 'yesNoExist';
      // Question.Code = 'pedYesNo';
      // Question.Description = 'Has any Proposed to be Insured been diagnosed with or suffered from / is suffering from or is currently under medication for the following. If Your response is yes to any of the following questions, please specify details of the same in the additional information section :';
      // Question.Type = 'Question';
      // Question.Response = 'yes/no';
      // Question.BaseQuestionCode = null;
      // CareHeathQuestions.push(Question);

      // 22
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'HEDHealthHospitalized';
      Question.Code = 'H001';
      Question.Description = 'Have any of the above mentioned person(s) to be insured been diagnosed / hospitalized for any illness / injury during the last 48 months?';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 23
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'HEDHealthClaim';
      Question.Code = 'H002';
      Question.Description = 'Have any of the person(s) to be insured ever filed a claim with their current / previous insurer? ';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 24
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'HEDHealthDeclined';
      Question.Code = 'H003';
      Question.Description = 'Has any proposal for Health insurance been declined, cancelled or charged a higher premium? ';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 25
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'HEDHealthCovered';
      Question.Code = 'H004';
      Question.Description = 'Is any of the person(s) to be insured, already covered under any other health insurance policy of Religare Health Insurance?';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 26
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDotherDetails';
      Question.Code = '210';
      Question.Description = 'Any other diseases or ailments not mentioned above ?';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 27
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDotherDetails';
      Question.Code = 'otherExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '210';
      CareHeathQuestions.push(Question);

      // 28
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDotherDetails';
      Question.Code = 'otherDiseasesDescription';
      Question.Description = 'Any other diseases or ailments not mentioned above ?';
      Question.Type = 'subquestion';
      Question.Response = 'Text';
      Question.BaseQuestionCode = '210';
      CareHeathQuestions.push(Question);

      // 29
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDRespiratoryDetails';
      Question.Code = '250';
      Question.Description = 'Any Respiratory disease / Disease of Lungs, Pleura and airway (including but not limited to Asthma / Tuberculosis / Pleural effusion / Bronchitis / Emphysema)';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 30
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDRespiratoryDetails';
      Question.Code = 'respiratoryExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '250';
      CareHeathQuestions.push(Question);

      // 31
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDEndoDetails';
      Question.Code = '222';
      Question.Description = 'Any disorders of the endocrine system (including but not limited to Pituitary / Parathyroid / adrenal gland disorders)';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 32
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDEndoDetails';
      Question.Code = 'EndocriExistingSince';
      Question.Description = 'Existing since? (MM/YYYY)';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '222';
      CareHeathQuestions.push(Question);

      // 33
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDillnessDetails';
      Question.Code = '502';
      Question.Description = 'Has any of the Proposed to be Insured consulted/taken treatment or recommended to take investigations/medication/surgery other than for childbirth/minor injuries? *';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 34
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDillnessDetails';
      Question.Code = 'illnessExistingSince';
      Question.Description = 'If Yes, Existing since? (MM/YYYY) *';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '502';
      CareHeathQuestions.push(Question);

      // 35
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDSurgeryDetails';
      Question.Code = '503';
      Question.Description = 'Has any of the Proposed to be Insured been hospitalized or has been under any prolonged treatment for any illness/injury or has undergone surgery other than for childbirth/minor injuries? *';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 36
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDSurgeryDetails';
      Question.Code = 'SurgeryExistingSince';
      Question.Description = 'If Yes, Existing since? (MM/YYYY) *';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '503';
      CareHeathQuestions.push(Question);

      // 37
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDSmokeDetails';
      Question.Code = '504';
      Question.Description = 'Do You smoke, consume alcohol, or chew tobacco, ghutka or paan or use any recreational drugs? If ‘Yes’ then please provide the frequency & amount consumed. *';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 38
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDSmokeDetails';
      Question.Code = 'OtherSmokeDetails';
      Question.Description = 'Please give Description .';
      Question.Type = 'subquestion';
      Question.Response = 'Text';
      Question.BaseQuestionCode = '504';
      CareHeathQuestions.push(Question);

      // 39
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Senior';
      Question.SetCode = 'PEDSmokeDetails';
      Question.Code = 'SmokeExistingSince';
      Question.Description = 'If Yes, Existing since? (MM/YYYY) *';
      Question.Type = 'subquestion';
      Question.Response = 'date';
      Question.BaseQuestionCode = '504';
      CareHeathQuestions.push(Question);

    }


    // Care Freedom
    if (Plan == "Care Freedom") {

      // 1
      // Question = new CareHeathQuestionDto();
      // Question.Plan = 'Care Freedom';
      // Question.SetCode = 'yesNoExist';
      // Question.Code = 'pedYesNo';
      // Question.Description = 'Does any person(s) to be insured has any Pre-existing diseases?';
      // Question.Type = 'Question';
      // Question.Response = 'yes/no';
      // Question.BaseQuestionCode = null;
      // CareHeathQuestions.push(Question);

      // 2
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFONE';
      Question.Code = 'H102';
      Question.Description = 'Cancer';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 3
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFTWO';
      Question.Code = 'H103';
      Question.Description = 'Any cardiovascular /Heart Disease,incl. but not limited to Coronary artery disease/Rheumatic heart disease/ Heart failure/Bypass Grafting/Angioplasty';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      CareHeathQuestions.push(Question);

      // 4
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFTHREE';
      Question.Code = 'H104';
      Question.Description = 'Hypertension / High Blood Pressure';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 5
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFFOUR';
      Question.Code = 'H105';
      Question.Description = 'Any Respiratory disease /Disease of Lungs, Pleura and airway including but not limited to Asthma/Tuberculosis/Pleural effusion/Bronchitis/ Emphysema';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 6
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFFIVE';
      Question.Code = 'H106';
      Question.Description = 'Any disorders of the endocrine system including but not limited to Pituitary / Parathyroid / adrenal gland disorders';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 7
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFSIX';
      Question.Code = 'H107';
      Question.Description = 'Diabetes Mellitus type 1 or Diabetes on insulin or Diabetes associated with blindness or chronic foot ulcer';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 8
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFSEVEN';
      Question.Code = 'H108';
      Question.Description = 'Any Neuromuscular, muscles or nervous system, disorder or Psychiatric disorders incl. but not limited to Motor Neuron Disease, Muscular dystrophies';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 9
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFEIGHT';
      Question.Code = 'H109';
      Question.Description = 'Chronic Pancreatitis or Chronic Liver disease including but not limited to Cirrhosis / Hepatitis B or C / Willson’s disease';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      //10
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFNINE';
      Question.Code = 'H110';
      Question.Description = 'Any chronic Kidney Disease';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      //11
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFTEN';
      Question.Code = 'H111';
      Question.Description = 'Any disorders of Blood /Immunity incl. but not limited to bleeding or clotting disorders, Systemic Lupus Erythematosus, Rheumatoid Arthritis';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      //12
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFELEVEN';
      Question.Code = 'H112';
      Question.Description = 'Have You smoked, consumed alcohol, or chewed tobacco, ghutka, paan or used any recreational drugs?If Yes, provide the frequency & amount consumed';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      //13
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFTWELVE';
      Question.Code = 'H113';
      Question.Description = 'Any other disease / health adversity / condition / treatment not mentioned above?';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      //14
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFTHIRTEEN';
      Question.Code = 'H114';
      Question.Description = 'Has any of the Insured been hosp. or has been under any prolonged treatment for illness or undergone surgery other than for childbirth/minor injuries?';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      //15
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'HEDCFLEAFFOURTEEN';
      Question.Code = 'H115';
      Question.Description = 'Has any of the Insured consulted /taken treatment or recommended to take investigations /medication /surgery other than for childbirth /minor injuries?';
      Question.Type = 'Question';
      Question.Response = 'yes/no';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);

      // 16
      Question = new CareHeathQuestionDto();
      Question.Plan = 'Care Freedom';
      Question.SetCode = 'CFLEAFFIFTEEN';
      Question.Code = 'AddInfo';
      Question.Description = 'If Your response is yes to any of the above mentioned questions, please specify details of the same in the text box.';
      Question.Type = 'Question';
      Question.Response = 'Text';
      Question.BaseQuestionCode = null;
      CareHeathQuestions.push(Question);


    }


    return CareHeathQuestions;
  }
}
