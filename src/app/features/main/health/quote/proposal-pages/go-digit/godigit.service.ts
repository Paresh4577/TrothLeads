import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { GoDigitMedicalQuestion, GoDigitQuestion, IBuyGoDigitDto, IGoDigitMedicalQuestion, ISubQuestionsDto, SubQuestionsDto } from '@models/dtos/config/GoDigit';


@Injectable({
  providedIn: 'root',
})
export class GodigitService {

  constructor(private _http: HttpClient) { }

  Domain() {
    let API = API_ENDPOINTS.DropDown.Domain;
    return this._http.get<ResponseMessage>(API, httpOptions);
  }

  CreateProposal(body: IBuyGoDigitDto) {
    let API = API_ENDPOINTS.Godigit.ProposalCreate;
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  StatusCheck(data: any) {
    let api = API_ENDPOINTS.Godigit.Status;
    return this._http.post<any>(api, data, httpOptions);

  }

  getMedicalQuestion(): IGoDigitMedicalQuestion[] {
    let Questions: IGoDigitMedicalQuestion[] =
      new Array<GoDigitMedicalQuestion>();
    let Que: IGoDigitMedicalQuestion;

    // 1
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RMPRE", "Do you have any existing condition or disease for which they are being treated and/or and evaluated currently or in the past or have been diagnosed with? Other than common cold or viral fever?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSPR1", "What are Your current and past medical conditions or disease?", "DOMAIN"));;
    Questions.push(Que);

    // 2
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPTHR", "Do you have Thyroid?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSTH1", "Type of Thyroid dysfunction?", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSTH2", "Current Medication", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSTH3", "When was it diagnosed?", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSTH4", "Any associated complications", "BOOLEAN"));
    Questions.push(Que);


    // 3
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPDBE", "Do you have Diabetes?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB1", "Type of Diabetes", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB2", "Current Medication", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB3", "When was it diagnosed?", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB4", "When was your last Blood sugar tests done", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB5", "Were you hospitalized due to Diabetes?", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB6", "Do you have records of hospitalization, if any?", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB7", "Any complications for Diabetes", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB8", "Do you have records of complications, if any?", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB9", "What was HbA1c value??", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSDB10", "What was FBS value?", "DOMAIN"));
    Questions.push(Que);


    // 4
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPAST", "Do you have Asthma?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSAS1", "When was it diagnosed?", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSAS2", "Current Medication", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSAS3", "How many times a year have you suffered with Asthma", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSAS4", "Were you hospitalized due to Asthma?", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSAS5", "Do you have records of hospitalization, if any?", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSAS6", "Any complications due to Asthma?", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSAS7", "Do you have records of complications, if any?", "BOOLEAN"));
    Questions.push(Que);


    // 5

    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPHPT", "Do you have Hypertension?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSHP1", "When was it diagnosed?", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSHP2", "No. of tablets", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSHP3", "Systolic Reading", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSHP4", "Diastolic Reading", "DOMAIN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSHP6", "Any complications related to Hypertension (related to nerves, eyes, heart or kidney)", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSHP7", "Do you have records of complications, if any?", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSHP8", "Were you hospitalized due to Hypertension?", "BOOLEAN"));
    Questions.push(Que);

    // 6

    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPHLD", "Do you have Hyperlipidemia?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSLD1", "On medication for High lipids", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSLD2", "Any complications with high lipids", "BOOLEAN"));
    Que.ChildQuestion.push(this.AddChildQuestion("RSLD3", "When was it diagnosed", "DOMAIN"));
    Questions.push(Que);

    // 7
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPOGM", "Is any member going through any medications currently", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSGM1", "Name of the medicines taken?", "TEXT_DESCRIPTION"));
    Questions.push(Que);


    // 8
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPDIG", "Do you face any symptoms like chest pain, fatigue, weight loss, dizziness, joint pain, change in bowel habit, difficulty in breathing, pain in abdomen, bleeding/pain while passing stools etc?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSDG1", "Details of undiagnosed symptoms?", "TEXT_DESCRIPTION"));
    Questions.push(Que);

    // 9
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPGYN", "Do you have any Gynaecological problem ?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSGN1", "what is the name of your condition?", "TEXT_DESCRIPTION"));
    Questions.push(Que);

    // 10
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPTBC", "Do you consume tobacco?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSTB1", "In which form do you consumes tobacco?", "DOMAIN"));
    Questions.push(Que);


    // 11
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RPALC", "Do you consume alcohol?", "BOOLEAN");
    Que.ChildQuestion.push(this.AddChildQuestion("RSAL1", "How often do you consume alcohol?", "DOMAIN"));
    Questions.push(Que);

    // 12
    Que = new GoDigitMedicalQuestion();
    Que = this.AddQuestion("RICOV", "Have you been infected with Covid-19 in the last 15 days?", "BOOLEAN");
    Questions.push(Que);

    return Questions;
  }

  private AddQuestion(Code: string, Questions: string, AnswerType: string): GoDigitMedicalQuestion {
    let Que: IGoDigitMedicalQuestion = new GoDigitMedicalQuestion();
    Que.Questions = new GoDigitQuestion();
    Que.Questions.QuestionCode = Code;
    Que.Questions.Text = Questions;
    Que.Questions.AnswerType = AnswerType;
    Que.ChildQuestion = new Array<SubQuestionsDto>();
    return Que;
  }
  private AddChildQuestion(Code: string, Questions: string, AnswerType: string): SubQuestionsDto {
    let ChildQue: ISubQuestionsDto = new SubQuestionsDto();
    ChildQue.QuestionCode = Code;
    ChildQue.Text = Questions;
    ChildQue.AnswerType = AnswerType;
    return ChildQue;
  }
}
