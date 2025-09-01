import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { httpOptions } from '@config/httpOptions';
import { ResponseMessage } from '@models/common';
import { ISendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { IPackageDTO, IPackagePaymentLinkUWDto, IPackagePaymentProofSP, IPackagePolicyIssueDto, IPackageProposalSubmissionDto, IPackageQNbyUWDTO, IPackageQNSelectionSPDto, IPackageSuminnsuredQuestionDTO, IPackageSuminnsuredSubQuestionDTO } from '@models/dtos';
import { Observable } from 'rxjs';
import { SubCategoryCodeEnum } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root'
})
export class RfqPackageService {
  constructor(private _http: HttpClient) { }

  public sendBack(body: ISendBackRejectDTO): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQ.SendBack;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  public reject(body: ISendBackRejectDTO): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQ.Reject;
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Download QN Document
  public downloadQnDocument(id: number): Observable<Blob> {
    let apiEndpoint = API_ENDPOINTS.RFQ.DownloadQnDoc + '/false/true';
    let api = apiEndpoint.replace("{id}", id.toString());
    return this._http.get(api, { responseType: 'blob' });
  }

  public createProposal(body: IPackageDTO): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQPackage.RFQRaise + '/true';
    return this._http.post<ResponseMessage>(API, body, httpOptions);
  }

  public updateProposal(body: IPackageDTO): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQPackage.RFQRaise + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Package Quotation
  public submitQuotation(body: IPackageQNbyUWDTO): Observable<ResponseMessage>{
    let API = API_ENDPOINTS.RFQPackage.QNByUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Package Qn Selection SP
  public submitQNSelectionSP(body: IPackageQNSelectionSPDto): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQPackage.QNSelectionSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Package Payment Link
  public submitPaymentLink(body: IPackagePaymentLinkUWDto): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQPackage.PaymentLinkUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Package Payment Proof
  public submitPaymentProof(body: IPackagePaymentProofSP): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQPackage.PaymentProofSP + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Package Proposal Submission
  public submitProposalSubmission(body: IPackageProposalSubmissionDto): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQPackage.ProposalSubmissionUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }

  // Package Policy Issue
  public submitPolicyIssue(body: IPackagePolicyIssueDto): Observable<ResponseMessage> {
    let API = API_ENDPOINTS.RFQPackage.PolicyIssueUW + '/true';
    return this._http.put<ResponseMessage>(API, body, httpOptions);
  }


  // -----------------------------------------------------------------------------------------------------
  //  
  // @ SumInsured Details Quentionary
  // 
  // -----------------------------------------------------------------------------------------------------

  building: IPackageSuminnsuredQuestionDTO = {
    question: 'Building (Including Plinth & Foundation)',
    questionKey: 'Building',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'BuildingSumInsured',
  }

  // Jwellery & Valuable Contents
  jwelleryValuableContents = {
    question: 'Jwellery & Valuable Contents',
    questionKey: 'ValuableContents',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ValuableContentsSumInsured',
  }

  // Breakdown of Domestic appliances
  breakdownOfDomesticAppliances: IPackageSuminnsuredQuestionDTO = {
    question: 'Breakdown of Domestic appliances',
    questionKey: 'BreakdownDomesticAppliances',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'BreakdownDomesticSumInsured',
  }

  furniture: IPackageSuminnsuredQuestionDTO = {
    question: 'Furniture, Fixture & Fittings',
    questionKey: 'Furniture',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'FurnitureSumInsured',
  }

  // Electronic Equipments
  electronicEquipmentsInsurance: IPackageSuminnsuredQuestionDTO = {
    question: 'Electronic Equipments - EEIP',
    questionKey: 'ElectricleOrElectronic',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ElectricleOrElectronicSumInsured',
  }

  //Content
  content: IPackageSuminnsuredQuestionDTO = {
    question: 'Content',
    questionKey: 'OtherContents',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'OtherContentsSumInsured',
  }

  // Stock
  stock: IPackageSuminnsuredQuestionDTO = {
    question: 'Stock',
    questionKey: 'StockIncludingRMWIPFG',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'StockIncludingRMWIPFGSumInsured',
  }

  // Plate Glass
  plateGlass: IPackageSuminnsuredQuestionDTO = {
    question: 'Plate Glass',
    questionKey: 'PlateGlass',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'PlateGlassSumInsured',
  }

  // Public Liability 
  publicLiabilityCover: IPackageSuminnsuredQuestionDTO = {
    question: 'Public Liability',
    questionKey: 'PublicLiabilityCover',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'PublicLiabilityCoverSumInsured',
  }

  // Neon Sign
  neonSign: IPackageSuminnsuredQuestionDTO = {
    question: 'Neon Sign',
    questionKey: 'NeonSign',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'NeonSignSumInsured',
  }

  //Workmen's Compensation
  workmensCompensation: IPackageSuminnsuredQuestionDTO = {
    question: "Workmen's Compensation",
    questionKey: 'WorkmensCompensationCover',
    answerType: 'decimal',
    answersLabel: 'Total Monthly Wages',
    answerKey: 'WorkmensCompensationCoverSumInsured',
    descriptionLabel: 'Total No of Employee',
    descriptionKey: 'WCNoOfEmployees',
    descriptionType: 'number',
  }

  // Fidelity Guarantee
  fidelityGuarantee: IPackageSuminnsuredQuestionDTO = {
    question: 'Fidelity Guarantee',
    questionKey: 'FedilityGuaranteeCover',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'FedilityGuaranteeCoverSumInsured',
    descriptionLabel: 'Total No of Employee',
    descriptionKey: 'FGNoOfEmployees',
    descriptionType: 'number',
  }

  // Money in Transit
  moneyinTransit: IPackageSuminnsuredQuestionDTO = {
    question: 'Money in Transit',
    questionKey: 'MoneyInTransit',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'MoneyInTransitSumInsured',
  }

  // Money in Safe
  moneyinSafe: IPackageSuminnsuredQuestionDTO = {
    question: 'Money in Safe',
    questionKey: 'MoneyInSafe',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'MoneyInSafeSumInsured',
  }

  // Money in Counter
  moneyinCounter: IPackageSuminnsuredQuestionDTO = {
    question: 'Money in Counter',
    questionKey: 'MoneyInCounter',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'MoneyInCounterSumInsured',
  }

  machineryBreakdownCoverage: IPackageSuminnsuredQuestionDTO = {
    question: 'Machinery Breakdown',
    questionKey: 'MachineryBreakdown',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'MachineryBreakdownSumInsured',
  }

  burglary: IPackageSuminnsuredQuestionDTO = {
    question: 'Burglary (Including Theft & RSMD)',
    questionKey: 'Burglary',
    answerType: 'dropdown',
    answersLabel: '',
    answerKey: 'BurglaryIncludingTheftandRSMD',
  }

  // Portable Computers
  PortableComputers: IPackageSuminnsuredQuestionDTO = {
    question: 'Portable Computers',
    questionKey: 'PortableEquipmentCover',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'PortableEquipmentCoverSumInsured',
  }

  // Portable Equipments
  PortableEquipments: IPackageSuminnsuredQuestionDTO = {
    question: 'Portable Equipments',
    questionKey: 'PortableEquipmentCover',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'PortableEquipmentCoverSumInsured',
  }

  // Stock and Stock in trade on Premises 
  StockAndStockInTradeOnPremises: IPackageSuminnsuredQuestionDTO = {
    question: 'Stock and Stock in trade on Premises',
    questionKey: 'StockTradeInPremises',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'StockTradeInPremisesSumInsured',
  }

  // Stock and Stock in Trade kept Outside safe within Premises after business Hours
  StockAndStockInTradeKeptOutside: IPackageSuminnsuredQuestionDTO = {
    question: 'Stock and Stock in Trade kept Outside safe within Premises after business Hours',
    questionKey: 'InventorySecurity',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'InventorySecuritySumInsured',
  }

  // Cash and Currency Notes on Premises
  CashAndCurrencyNotesOnPremises: IPackageSuminnsuredQuestionDTO = {
    question: 'Cash and Currency Notes on Premises',
    questionKey: 'CurrencyNotes',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'CurrencyNotesSumInsured',
  }

  // Stock and Stock in Vaults and Bank Lockers outside Premises
  StockAandStockInVaultsAndBankLockers: IPackageSuminnsuredQuestionDTO = {
    question: 'Stock and Stock in Vaults and Bank Lockers outside Premises',
    questionKey: 'StockInVaults',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'StockInVaultsSumInsured',
  }

  //  Optional Cover: Medical Expense
  OptionalCoverMedicalExpense: IPackageSuminnsuredQuestionDTO = {
    question: 'Optional Cover: Medical Expense',
    questionKey: 'MedicalExpense',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'MedicalExpenseSumInsured',
  }

  //  Optional Cover: Boilling Casting
  OptionalCoverBoillingCasting: IPackageSuminnsuredQuestionDTO = {
    question: 'Optional Cover: Boilling Casting',
    questionKey: 'BoilingCasting',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'BoilingCastingSumInsured',
  }


  //Stock in Custody of Directors & Employees and other authorized Person
  StockInCustodyOfDirectorsEmployeesAndOther: IPackageSuminnsuredQuestionDTO = {
    question: 'Stock in Custody of Directors & Employees and other authorized Person',
    questionKey: 'CustodyOfAuthorisedPerson',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'CustodyOfAuthorisedPersonSumInsured',
  }


  //Stock in custody of cutters, brokers, & Job Workers
  StockInCustodyOfCuttersBrokersJobWorkers: IPackageSuminnsuredQuestionDTO = {
    question: 'Stock in custody of cutters, brokers, & Job Workers',
    questionKey: 'CustodyOfCutters',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'CustodyOfCuttersSumInsured',
  }

  //First Buy Cover
  firstBuyCover: IPackageSuminnsuredQuestionDTO = {
    question: 'First Buy Cover',
    questionKey: 'FirstByCover',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'FirstByCoverSumInsured',
    descriptionLabel: ' Place of First Purchase',
    descriptionKey: 'PlaceOfFirstPurchase',
    descriptionType: 'text',
  }

  //Deemed Export/Import
  deemedExportImport: IPackageSuminnsuredQuestionDTO = {
    question: 'Deemed Export/Import',
    questionKey: 'DeemedExportImport',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'DeemedExportImportSumInsured',
  }

  //By registered Post Parcel
  byRegisteredPostParcel: IPackageSuminnsuredQuestionDTO = {
    question: 'By registered Post Parcel',
    questionKey: 'ByRegisteredPostParcel',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ByRegisteredPostParcelSumInsured',
  }

  //By Air Transit
  byAirTransit: IPackageSuminnsuredQuestionDTO = {
    question: 'By Air Transit',
    questionKey: 'ByAir',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ByAirSumInsured',
  }

  //By Angadia
  byAngadia: IPackageSuminnsuredQuestionDTO = {
    question: 'By Angadia',
    questionKey: 'ByAngadia',
    answerType: 'decimal',
    answersLabel: '% Mentioned in Slip',
    answerKey: 'ByAngadiaSumInsured',
  }


  //By Couriers/logistic companies 
  byCouriersLogisticCompanies: IPackageSuminnsuredQuestionDTO = {
    question: 'By Couriers/logistic companies',
    questionKey: 'ByCouriers',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ByCouriersSumInsured',
  }

  //Estimated Aggregate
  estimatedAggrigate: IPackageSuminnsuredQuestionDTO = {
    question: 'Estimated Aggregate',
    questionKey: 'EstimatedAggrigate',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'EstimatedAggrigateSumInsured',
  }

  //Chandelier Coverage
  chandelierCoverage: IPackageSuminnsuredQuestionDTO = {
    question: 'Chandelier Coverage',
    questionKey: 'ChandelierCoverage',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ChandelierCoverageSumInsured',
  }

  //Business Interuption
  businessInteruption: IPackageSuminnsuredQuestionDTO = {
    question: 'Business Interuption',
    questionKey: 'BusinessInteruption',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'BusinessInteruptionSumInsured',
  }


  //Employee Fidelity
  employeeFidelity: IPackageSuminnsuredQuestionDTO = {
    question: 'Employee Fidelity',
    questionKey: 'EmployeeFidelity',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'EmployeeFidelitySumInsured',
    descriptionLabel: 'Total No of Employee',
    descriptionKey: 'FGNoOfEmployees',
    descriptionType: 'number',
  }

  //Third Party Fidelity
  thirdPartyFidelity: IPackageSuminnsuredQuestionDTO = {
    question: 'Third Party Fidelity',
    questionKey: 'ThirdPartyFedility',
    answerType: 'decimal',
    answersLabel: 'Sum Insured',
    answerKey: 'ThirdPartyFedilitySumInsured',
  }

  other: IPackageSuminnsuredQuestionDTO = {
    question: 'Other, Specify in Remarks',
    questionKey: 'Other',
    answerType: 'decimal',
    answersLabel: 'Sum insured',
    answerKey: 'OtherSumInsured',
    descriptionLabel: 'Remarks, Specify here..',
    descriptionKey: 'OtherDesc',
    descriptionType: 'text',
  }


  public DisplaySumInsuredDetailsForSingleColumn(subCategoryCode: string): IPackageSuminnsuredQuestionDTO[] {
    let displaySumInsuredDetailsArray = []

    let DisplaySumInsuredDetailHotelPackage = [
      this.building,
      this.furniture,
      this.electronicEquipmentsInsurance,
      this.plateGlass,
      this.publicLiabilityCover,
      this.neonSign,
      this.workmensCompensation,
      this.fidelityGuarantee,
      this.moneyinTransit,
      this.moneyinSafe,
      this.moneyinCounter,
      this.machineryBreakdownCoverage,
      this.burglary,
      this.other
    ]

    let DisplaySumInsuredDetailHouseHolder = [
      this.building,
      this.jwelleryValuableContents,
      this.breakdownOfDomesticAppliances,
      this.electronicEquipmentsInsurance,
      this.content,
      this.publicLiabilityCover,
      this.burglary,
      this.other
    ]

    let DisplaySumInsuredDetailOfficePackage = [
      this.building,
      this.furniture,
      this.content,
      this.burglary,
      this.moneyinSafe,
      this.moneyinTransit,
      this.publicLiabilityCover,
      this.electronicEquipmentsInsurance,
      this.machineryBreakdownCoverage,
      this.PortableComputers,
      this.fidelityGuarantee,
      this.other
    ]

    let DisplaySumInsuredDetailsShopkeeperPackage = [
      this.building,
      this.furniture,
      this.content,
      this.stock,
      this.burglary,
      this.moneyinSafe,
      this.moneyinCounter,
      this.moneyinTransit,
      this.plateGlass,
      this.workmensCompensation,
      this.neonSign,
      this.publicLiabilityCover,
      this.electronicEquipmentsInsurance,
      this.machineryBreakdownCoverage,
      this.fidelityGuarantee,
      this.other
    ]

    // For Sub category Hotel Package
    if (subCategoryCode == SubCategoryCodeEnum.HotelPack) {
      displaySumInsuredDetailsArray = DisplaySumInsuredDetailHotelPackage
    }
    // For Sub category Hotel Package
    else if (subCategoryCode == SubCategoryCodeEnum.HouseHolder) {
      displaySumInsuredDetailsArray = DisplaySumInsuredDetailHouseHolder
    }
    // For Sub category Office Package
    else if (subCategoryCode == SubCategoryCodeEnum.OfficePack) {
      displaySumInsuredDetailsArray = DisplaySumInsuredDetailOfficePackage
    }
    // For Sub category Shopkeeper Package
    else if (subCategoryCode == SubCategoryCodeEnum.Shopkeepers) {
      displaySumInsuredDetailsArray = DisplaySumInsuredDetailsShopkeeperPackage
    }
    else {
      displaySumInsuredDetailsArray = []
    }

    return displaySumInsuredDetailsArray
  }


  public DisplaySumInsuredDetailsJewellersBlockPolicies(): IPackageSuminnsuredSubQuestionDTO[] {

    let displaySumInsuredDetailsJewellersBlockPolicies: IPackageSuminnsuredSubQuestionDTO[] = [
      {
        question: 'Stock in Premises',
        questionKey: 'StockInPremises',
        subquestion: [
          this.StockAndStockInTradeOnPremises,
          this.StockAndStockInTradeKeptOutside,
          this.CashAndCurrencyNotesOnPremises,
          this.StockAandStockInVaultsAndBankLockers,
          this.OptionalCoverMedicalExpense,
          this.OptionalCoverBoillingCasting,
        ]
      },
      {
        question: 'Stock in Custody of the Insured and Specified Persons',
        questionKey: 'StockInCustody',
        subquestion: [
          this.StockInCustodyOfDirectorsEmployeesAndOther,
          this.StockInCustodyOfCuttersBrokersJobWorkers,
          this.firstBuyCover,
          this.deemedExportImport,
        ]
      },
      {
        question: 'Stock in Transit',
        questionKey: 'StockInTransit',
        note:'(Destination within India only)',
        subquestion: [
          this.byRegisteredPostParcel,
          this.byAirTransit,
          this.byAngadia,
          this.byCouriersLogisticCompanies,
        ]
      },
      {
        question: 'Standard Fire and Special Perils Cover',
        questionKey: 'StandardFireCover',
        subquestion: [
          this.building,
          this.furniture,
          this.content,
          this.chandelierCoverage,
          this.businessInteruption,
        ]
      },
      {
        question: 'Content : Burglary',
        questionKey: 'BurglaryCover',
        subquestion: [
          this.burglary
        ]
      },
      {
        question: 'Fidelity Guarantee',
        questionKey: 'FedilityGuaranteeCover',
        subquestion: [
          this.employeeFidelity,
          this.thirdPartyFidelity
        ]
      },
      {
        question: 'Stock in Exibition',
        questionKey: 'StockInExibition',
        subquestion: [
          this.estimatedAggrigate
        ]
      },
      {
        question: 'Other Coverage',
        questionKey: 'OtherCoverage',
        subquestion: [
          this.plateGlass,
          this.PortableEquipments,
          this.neonSign,
          this.electronicEquipmentsInsurance,
          this.workmensCompensation,
          this.publicLiabilityCover,
          this.moneyinTransit,
          this.machineryBreakdownCoverage,
          this.other
        ]
      }


    ]
    return displaySumInsuredDetailsJewellersBlockPolicies
  }

}
