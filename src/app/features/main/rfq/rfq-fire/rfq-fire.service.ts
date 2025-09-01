import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { IFireRaiseDTO } from '@models/dtos';
import { ILifeQNbyUWDTO, ILifeQNSelectionSPDto, ILifePaymentLinkUWDto, ILifePaymentProofSP, ILifeProposalSubmissionDto, ILifePolicyIssueDto } from '@models/dtos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqFireService {


  constructor(private _http: HttpClient) { }

  public CreateProposal(body: IFireRaiseDTO) {
    let API = API_ENDPOINTS.RFQFire.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public UpdateProposal(body: IFireRaiseDTO) {
    let API = API_ENDPOINTS.RFQFire.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Download QN Document
  public DownloadQnDocument(id: number): Observable<Blob> {
    let apiEndpoint = API_ENDPOINTS.RFQ.DownloadQnDoc + '/false/true';
    let api = apiEndpoint.replace("{id}", id.toString());
    return this._http.get(api, { responseType: 'blob' });
  }

  // Life Quotation
  public SubmitQuotation(body: ILifeQNbyUWDTO) {
    let API = API_ENDPOINTS.RFQFire.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Qn Selection SP
  public SubmitQNSelectionSP(body: ILifeQNSelectionSPDto) {
    let API = API_ENDPOINTS.RFQFire.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Payment Link
  public SubmitPaymentLink(body: ILifePaymentLinkUWDto) {
    let API = API_ENDPOINTS.RFQFire.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Payment Proof
  public SubmitPaymentProof(body: ILifePaymentProofSP) {
    let API = API_ENDPOINTS.RFQFire.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Proposal Submission
  public SubmitProposalSubmission(body: ILifeProposalSubmissionDto) {
    let API = API_ENDPOINTS.RFQFire.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Life Policy Issue
  public SubmitPolicyIssue(body: ILifePolicyIssueDto) {
    let API = API_ENDPOINTS.RFQFire.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  /**
   * 
   * SumInsured Details Quentionary 
   * 
   */

  Building = {
    question: 'Building (Including Plinth & Foundation)',
    questionKey: 'Building',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'BuildingSumInsured',
    type: 'number',
    DisplayFor: ['Home', 'Fire']
  }

  Furniture = {
    question: 'Furniture, Fixture & Fittings',
    questionKey: 'Furniture',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'FurnitureSumInsured',
    type: 'number',
    DisplayFor: ['Home', 'Fire']
  }
  PlantMachinery = {
    question: 'Plant & Machinery',
    questionKey: 'PlantAndMachinery',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'PlantAndMachinerySumInsured',
    type: 'number',
    DisplayFor: ['Fire']
  }
  MachineryBreakdownCoverage = {
    question: 'Machinery Breakdown',
    questionKey: 'MachineryBreakdown',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'MachineryBreakdownSumInsured',
    type: 'number',
    DisplayFor: ['Fire', 'Fire Package']
  }

  MachineryLossofProfit = {
    question: 'Machinery Loss of Profit',
    questionKey: 'MachineryLossOfProfit',
    answerType: 'decimal',
    answersLabel: 'Gross Profit',
    answerKey: 'MachineryLossOfProfitGrossProfit',
    type: 'number',
    DisplayFor: ['Fire']
  }

  MoneyinTransit = {
    question: 'Money in Transit',
    questionKey: 'MoneyInTransit',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'MoneyInTransitSumInsured',
    type: 'number',
    DisplayFor: ['Fire Package']
  }

  MoneyinSafe = {
    question: 'Money in Safe',
    questionKey: 'MoneyInSafe',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'MoneyInSafeSumInsured',
    type: 'number',
    DisplayFor: ['Fire Package']
  }

  // Money in Counter
  MoneyinCounter = {
    question: 'Money in Counter',
    questionKey: 'MoneyInCounter',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'MoneyInCounterSumInsured',
    type: 'number',
    DisplayFor: ['Fire Package']
  }

  // Money in Counter
  PlateGlass = {
    question: 'Plate Glass',
    questionKey: 'PlateGlass',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'PlateGlassSumInsured',
    type: 'number',
    DisplayFor: ['Fire Package']
  }

  // Neon Sign
  NeonSign = {
    question: 'Neon Sign',
    questionKey: 'NeonSign',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'NeonSignSumInsured',
    type: 'number',
    DisplayFor: ['Fire Package']
  }

  // Electronic Equipments
  ElectronicEquipmentsInsurance = {
    question: 'Electronic Equipments',
    questionKey: 'ElectricleOrElectronic',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ElectricleOrElectronicSumInsured',
    type: 'number',
    DisplayFor: ['Fire Package']
  }

  // Fidelity Guarantee
  FidelityGuarantee = {
    question: 'Fidelity Guarantee',
    questionKey: 'FedilityGuaranteeCover',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'FedilityGuaranteeCoverSumInsured',
    descriptionLabel: 'Total No of Employee',
    descriptionKey: 'FGNoOfEmployees',
    descriptionType: 'decimal',
    type: 'number',
    DisplayFor: ['Fire Package']
  }

  // Public Liability 
  PublicLiabilityCover = {
    question: 'Public Liability',
    questionKey: 'PublicLiabilityCover',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'PublicLiabilityCoverSumInsured',
    type: 'number',
    DisplayFor: ['Fire Package']
  }

  //Workmen's Compensation
  WorkmensCompensation = {
    question: "Workmen's Compensation",
    questionKey: 'WorkmensCompensationCover',
    answerType: 'decimal',
    answersLabel: 'Total Monthly Wages',
    answerKey: 'WorkmensCompensationCoverSumInsured',
    descriptionLabel: 'Total No of Employee',
    descriptionKey: 'WCNoOfEmployees',
    descriptionType: 'decimal',
    type: 'number',
    DisplayFor: ['Fire Package']
  }

  //Portable Equipments
  PortableEquipmentsCover = {
    question: "Portable Equipments",
    questionKey: 'PortableEquipmentCover',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'PortableEquipmentCoverSumInsured',
    type: 'number',
    DisplayFor: ['Fire Package']
  }


  Stock = {
    question: 'Stock (Including RM,WIP, FG)',
    questionKey: 'StockIncludingRMWIPFG',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'StockIncludingRMWIPFGSumInsured',
    type: 'number',
    DisplayFor: ['Fire']
  }
  ElectricInstallation = {
    question: 'Electric Installation',
    questionKey: 'ElectricInstallation',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ElectricInstallationSumInsured',
    type: 'number',
    DisplayFor: ['Fire']
  }
  OtherContents = {
    question: 'Other Contents',
    questionKey: 'OtherContents',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'OtherContentsSumInsured',
    type: 'number',
    DisplayFor: ['Fire']
  }
  FireLossofProfit = {
    question: 'Fire Loss of Profit',
    questionKey: 'FireLossOfProfit',
    answerType: 'decimal',
    answersLabel: 'Gross Profit',
    answerKey: 'FireLossOfProfitGrossProfit',
    type: 'number',
    DisplayFor: ['Fire']
  }

  ElectricElectronicItem = {
    question: 'Electric/ Electronic Item',
    questionKey: 'ElectricleOrElectronic',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ElectricleOrElectronicSumInsured',
    type: 'number',
    DisplayFor: ['Home']
  }
  GeneralContents = {
    question: 'General Contents',
    questionKey: 'GeneralContent',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'GeneralContentSumInsured',
    type: 'number',
    DisplayFor: ['Home']
  }
  Solar = {
    question: 'Solar',
    questionKey: 'Solar',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'SolarSumInsured',
    type: 'number',
    DisplayFor: ['Home']
  }
  ValuableContents = {
    question: 'Valuable Contents (Jewellery)',
    questionKey: 'ValuableContents',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ValuableContentsSumInsured',
    type: 'number',
    DisplayFor: ['Home']
  }
  Burglary = {
    question: 'Burglary (Including Theft & RSMD)',
    questionKey: 'Burglary',
    answerType: 'yesno',
    answersLabel: '',
    answerKey: 'BurglaryIncludingTheftandRSMD',
    type: 'dropdown',
    DisplayFor: ['Home', 'Fire']
  }
  Other = {
    question: 'Other, if any',
    questionKey: 'Other',
    answerType: 'decimal',
    answersLabel: 'Sum insured',
    answerKey: 'OtherSumInsured',
    type: 'number',
    descriptionLabel: 'Specify Here..',
    descriptionKey: 'OtherDesc',
    descriptionType: 'text',
    DisplayFor: ['Home']
  }


  public DisplaySumInsuredDetailsHomeAndFire() {
    let DisplaySumInsuredDetailsArray = [
      this.Building,
      this.Furniture,
      this.PlantMachinery,
      this.MachineryBreakdownCoverage,
      this.MachineryLossofProfit,
      this.Stock,
      this.ElectricInstallation,
      this.OtherContents,
      this.FireLossofProfit,
      this.ElectricElectronicItem,
      this.GeneralContents,
      this.Solar,
      this.ValuableContents,
      this.Burglary,
      this.Other,
    ]
    return DisplaySumInsuredDetailsArray
  }


  public DisplaySumInsuredDetailsFirePackage() {

    let DisplaySumInsuredDetailsFirePackage = [
      {
        question: 'Standard Fire and Special Perils Cover',
        questionKey: 'StandardFireCover',
        subquestion: [
          this.Building,
          this.Furniture,
          this.PlantMachinery,
          this.Stock,
          this.OtherContents,
        ]
      },
      {
        question: 'Burglary Cover',
        questionKey: 'BurglaryCover',
        subquestion: [
          this.Burglary
        ]
      },
      {
        question: 'Money Insurance Cover',
        questionKey: 'MoneyInsuranceCover',
        subquestion: [
          this.MoneyinTransit,
          this.MoneyinSafe,
          this.MoneyinCounter
        ]
      },
      {
        question: 'Other Coverage',
        questionKey: 'OtherCoverage',
        subquestion: [
          this.PlateGlass,
          this.MachineryBreakdownCoverage,
          this.NeonSign,
          this.ElectronicEquipmentsInsurance,
          this.FidelityGuarantee,
          this.PublicLiabilityCover,
          this.WorkmensCompensation,
          this.PortableEquipmentsCover,
          this.Other
        ]
      }


    ]
    return DisplaySumInsuredDetailsFirePackage
  }



  public AdditionalDetailFireAndFirePackage() {

    let AdditionalDetailFireAndFirePackage = [
      {
        question: '1. Is the basement of a building used for any operation?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'BasementUsedForAnyOperation',
        descriptionLabel: 'Detail of Operation',
        descriptionKey: 'BasementUsedForAnyOperationDesc',
        descriptionType: 'text',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '2. Is the basement of a building used for any Storage?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'BasementUsedForAnyStorage',
        descriptionLabel: 'Type of Storage',
        descriptionKey: 'BasementUsedForAnyStorageDesc',
        descriptionType: 'text',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '3. Any plant and Machinery installed under the basement of building?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'AnyMachineInstalledInBasement',
        descriptionLabel: 'Type of Plant/Machinery',
        descriptionKey: 'AnyMachineInstalledInBasementDesc',
        descriptionType: 'text',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '4. Is a dewatering machine available in the basement?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'DeWateringMachineAvailableInBasement',
        descriptionLabel: 'Details',
        descriptionKey: 'DeWateringMachineAvailableInBasementDesc',
        descriptionType: 'text',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '5. Any Security Measures available inside the building?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'SecurityMeasuresInBuilding',
        descriptionLabel: 'Detail of Security Measure',
        descriptionKey: 'SecurityMeasuresInBuildingDesc',
        descriptionType: 'text',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '6. Is there a CCTV camera available inside the building?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'CCTVAvailableInBuilding',
        descriptionLabel: 'No of CCTV',
        descriptionKey: 'NoOfCCTV',
        descriptionType: 'number',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '7. Is there a Fire extinguisher available inside the building?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'FireExtingusherInBuilding',
        descriptionLabel: 'No of Fire Extinguisher',
        descriptionKey: 'NoOfFireExtingusher',
        descriptionType: 'number',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '8. Is the Premises located nearest water body?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'LocatedNearWaterBody',
        descriptionLabel: 'Waterbody Name & Distance(KM)',
        descriptionKey: 'WaterBodyDistanceName',
        descriptionType: 'text',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '9. Is there a fire brigade located near the insured premises?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'NearToFireBrigade',
        descriptionLabel: 'Fire brigade Distance(KM)',
        descriptionKey: 'FireBrigadeDistance',
        descriptionType: 'decimal',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '10. Is there any Provision for Hydrant/ Sprinkers and Smoke Detectors?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'AnyDetectorPresent',
        descriptionLabel: 'No of Quantity of each',
        descriptionKey: 'NoOfDetectors',
        descriptionType: 'text',
        DisplayDescSelctedas: true,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '11. Is the plinth level of the building at least 1.5 feet above ground level?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'LeastPlinthLevelPresent',
        descriptionLabel: 'If No, Feet Details',
        descriptionKey: 'LeastPlinthLevelPresentDesc',
        descriptionType: 'text',
        DisplayDescSelctedas: false,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '12. Well maintain standard equipment and installation?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'EquipmentAndInstallationwellMaintained',
        descriptionLabel: '',
        descriptionKey: '',
        descriptionType: '',
        DisplayDescSelctedas: false,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '13. Is there any provision for underwater drainage system?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'ProvisionForUnderWaterDrainegeSystem',
        descriptionLabel: '',
        descriptionKey: '',
        descriptionType: '',
        DisplayDescSelctedas: false,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '14. Require Terrorism Coverage?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'TerrorismCoverage',
        descriptionLabel: '',
        descriptionKey: '',
        descriptionType: '',
        DisplayDescSelctedas: false,
        DisplayFor: ['Fire', 'Fire Package']
      },
      {
        question: '15. Require Floater Coverage?',
        answerType: 'dropdown',
        answersLabel: '',
        answerKey: 'FloterCoverage',
        descriptionLabel: '',
        descriptionKey: '',
        descriptionType: '',
        DisplayDescSelctedas:false,
        DisplayFor: ['Fire']
      },

    ]


    return AdditionalDetailFireAndFirePackage;
  }

}
