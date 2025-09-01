import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { BajajIllnessDto, IBajajIllnessDto,  KYCDto } from '@models/dtos/config';
import { IPreExistDiseaseDto, PreExistDiseaseDto } from '@models/dtos/config/Bajaj';
import { IBajajBuyNowDto } from '@models/dtos/config/Bajaj/buynow-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BajajService {
  constructor(private _http: HttpClient) {}

  KYC(body: KYCDto): Observable<ResponseMessage> {
    let url = API_ENDPOINTS.KYC.BajajAllianz;
    return this._http.post<ResponseMessage>(url, body, httpOptions);
  }

  CreateProposal(body: IBajajBuyNowDto){
    let API = API_ENDPOINTS.BajajAllianzHealth.ProposalCreate
    return this._http.post<ResponseMessage>(API, body, httpOptions)
  }

  PremiumCalculation(body: IBajajBuyNowDto){
    let API = API_ENDPOINTS.BajajAllianzHealth.ProposalCreate
    return this._http.post<ResponseMessage>(API, body, httpOptions)
  }
  getIllness(){
    let Illnesses : IBajajIllnessDto[] = new Array<BajajIllnessDto>()
    let Illness : IBajajIllnessDto

    //PreExistDisease
    Illness = new BajajIllnessDto()
    Illness.code = "PreExistDisease"
    Illness.text = "Has any of the persons to be insured suffer from/or investigated for any of the following? Disorder of the heart, or circulatory system, chest pain, high blood pressure, stroke, asthma any respiratory conditions, cancer tumor lump of any kind, diabetes, hepatitis, disorder of urinary tract or kidneys, blood disorder, any mental or psychiatric conditions, any disease of brain or nervous system, fits(epilepsy) slipped disc, backache, any congenital / birth defects / urinary diseases, AIDS or positive HIV, If yes, indicate in the table given below.If yes please provide details"
    Illness.description = "PreExistDisease_OthersDescription"
    Illness.preExistDisease = this.getPreExistDisease()
    Illnesses.push(Illness)

    //Asthma
    Illness = new BajajIllnessDto()
    Illness.code = "Asthma"
    Illness.text = "Do you or any of the family members to be covered have/had any health complaints/met with any accident in the past 4 years and prior to 4 years and have been taking treatment, regular medication (self/ prescribed)or planned for any treatment / surgery / hospitalization?"
    Illness.description = "AsthmaDescription"
    Illnesses.push(Illness)

    //SmokerTibco
    Illness = new BajajIllnessDto()
    Illness.code = "SmokerTibco"
    Illness.text = "Do you smoke cigarettes or consume tobacco (chewing paste) / alcohol, nicotine or marijuana in any form? Please give duration and daily consumption"
    Illness.description = "SmokerTibcoDescription"
    Illnesses.push(Illness)

    //CholesterolDisorDr
    Illness = new BajajIllnessDto()
    Illness.code = "CholesterolDisorDr"
    Illness.text = "Have you or any of your immediate family members (father, mother, brother or sister) have/ had diabetes, hypertension,cancer, heart attack, or stroke and at What age? If yes, was it before age 60 years or after 60 years"
    Illness.description = "CholesterolDisorDrDescription"
    Illnesses.push(Illness)

    //HeartDisease
    Illness = new BajajIllnessDto()
    Illness.code = "HeartDisease"
    Illness.text = "Has any proposal for life, critical illness or health related insurance on your life or lives ever been postponed, declined or accepted on special terms? If yes, give details"
    Illness.description = "HeartDiseaseDescription"
    Illnesses.push(Illness)

    //Hypertension
    Illness = new BajajIllnessDto()
    Illness.code = "Hypertension"
    Illness.text = "Have you or any of the persons proposed to be insured were/are detected as Covid positive?"
    Illnesses.push(Illness)

    //Obesity
    Illness = new BajajIllnessDto()
    Illness.code = "Obesity"
    Illness.text = "Have you vaccinated against Covid 19?"
    Illnesses.push(Illness)

    return Illnesses

  }

  getPreExistDisease(){
    let PreExistDisease: IPreExistDiseaseDto[] = new Array<PreExistDiseaseDto>()
    let PreExist: IPreExistDiseaseDto

    //Diabetes
    PreExist = new PreExistDiseaseDto()
    PreExist.id = "PreExistDisease_Diabetes"
    PreExist.text ="Diabetes"
    PreExist.description = "PreExistDisease_DiabetesDescription"
    PreExistDisease.push(PreExist)

    //Hypertension
    PreExist = new PreExistDiseaseDto()
    PreExist.id = "PreExistDisease_Hypertension"
    PreExist.text = "Hypertension"
    PreExist.description = "PreExistDisease_HypertensionDescription"
    PreExistDisease.push(PreExist)

    //CholesterolDisorder
    PreExist = new PreExistDiseaseDto()
    PreExist.id = "PreExistDisease_CholesterolDisorder"
    PreExist.text = "Cholesterol Disorders"
    PreExist.description = "PreExistDisease_CholesterolDisorderDescription"
    PreExistDisease.push(PreExist)

    //Obesity
    PreExist = new PreExistDiseaseDto()
    PreExist.id = "PreExistDisease_Obesity"
    PreExist.text = "Obesity"
    PreExist.description = "PreExistDisease_ObesityDescription"
    PreExistDisease.push(PreExist)

    //CardiovascularDiseases
    PreExist = new PreExistDiseaseDto()
    PreExist.id = "PreExistDisease_CardiovascularDiseases"
    PreExist.text = "Cardiovascular diseases"
    PreExist.description = "PreExistDisease_CardiovascularDiseasesDescription"
    PreExistDisease.push(PreExist)

    //Others
    PreExist = new PreExistDiseaseDto()
    PreExist.id = "PreExistDisease_Others"
    PreExist.text = "Other"
    PreExist.description = "PreExistDisease_Others"
    PreExistDisease.push(PreExist)

    return PreExistDisease
  }

}
