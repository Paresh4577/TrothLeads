import { Vehicle } from './../../models/vehicle.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { VehicleApiResponse } from '../../models/vehicle.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class authService {
  getTotalClaimsCount(safeUserId: string) {
    throw new Error('Method not implemented.');
  }
  getCitiesByState(StateId: any) {
    throw new Error('Method not implemented.');
  }
  // private apiUrl = 'https://apiwp.troth.co.in/api/AdminAccount/AdminUserLogin';
  private withoutcashhospitalsUrl = 'https://apiwp.troth.co.in/api/Hospital/GetHospitalsWithOutCashless';
  private withcashhospitalsUrl = 'https://apiwp.troth.co.in/api/Hospital/GetHospitalsWithCashless';
  private apiUrl = 'https://apiwp.troth.co.in/api/AdminAccess/LoginAdmin';
    private getAllProductsUrl = 'https://apiwp.troth.co.in/api/Product/GetAllProducts';
  private deleteUserAdmin = 'https://apiwp.troth.co.in/api/AdminAccess/DeleteAdmin';
  private addEmpFamily = 'https://apiwp.troth.co.in/api/User/AddUserFamilyMember';
  private getEmpFamilyy = 'https://apiwp.troth.co.in/api/User/GetEmpFamily';
  private uploadBannerUrl = 'https://apiwp.troth.co.in/api/AdminMaster/AddBanner';
  private AdminUserUrl = 'https://apiwp.troth.co.in/api/AdminAccess/GetAdmin';
  private CreateAdminUrl = 'https://apiwp.troth.co.in/api/AdminAccess/AddAdmin';
  private bannerUrl = 'https://apiwp.troth.co.in/api/Master/GetBanners';
  private deletebannerUrl = 'https://apiwp.troth.co.in/api/Master/DeleteBanners';
  private deleteProductHeaderUrl = 'https://apiwp.troth.co.in/api/Product/DeleteProductHeader';
  private hospitalUrl = 'https://apiwp.troth.co.in/api/AdminMaster/GetHospitals';
  private hospitalIdurl = 'https://apiwp.troth.co.in/api/AdminMaster/GetHospitals';
  private getsupport = 'https://apiwp.troth.co.in/api/Support/GetSupport';
  private hospitalAddUrl = 'https://apiwp.troth.co.in/api/AdminMaster/AddHospital';
  private companyUrl = 'https://apiwp.troth.co.in/api/Master/GetCompanies';
  private companyAddUrl = 'https://apiwp.troth.co.in/api/AdminMaster/AddCompany';
  private garageUrl = 'https://apiwp.troth.co.in/api/AdminMaster/GetGarages';
  private addGarageUrl = 'https://apiwp.troth.co.in/api/AdminMaster/AddGarage';
  private usersUrl = 'https://apiwp.troth.co.in/api/Master/GetUsers';
  private addGarageById =
    'https://apiwp.troth.co.in/api/AdminMaster/AdminGarageDataById';
  private claimsUrl = 'https://apiwp.troth.co.in/api/Claim/GetClaims';
  private addClaimUrl = 'https://apiwp.troth.co.in/api/Claim/AddClaim';
  private productUrl = 'https://apiwp.troth.co.in/api/Product/GetProducts';
  private productAddUrl = 'https://apiwp.troth.co.in/api/AdminMaster/AddProduct';
  private productHeadergetUrl = 'https://apiwp.troth.co.in/api/Product/GetProductHeaders';
  private productHeaderAddUrl = 'https://apiwp.troth.co.in/api/Product/AddProductHeader';
  private getImageUrl = 'https://apiwp.troth.co.in/api/AdminMaster/get-images';
  private getStateUrl = 'https://apiwp.troth.co.in/api/AdminMaster/GetStates';
  private getCityUrl = 'https://apiwp.troth.co.in/api/AdminMaster/GetCities';
  private policyUrl = 'https://apiwp.troth.co.in/api/Policy/GetPolicies';
  private RenewpolicyUrl = 'https://apiwp.troth.co.in/api/Policy/GetAllRenewPolicy';
  private groupPolicyUrl =
    'https://apiwp.troth.co.in/api/AdminGroupPolicy/GetHrCompany';
  private getEmployeeByCompanyId =
    'https://apiwp.troth.co.in/api/AdminGroupPolicy/GetEmployeeByCompany';
  private policyByNoUrl = 'https://apiwp.troth.co.in/api/Policy/GetPolicies';
  private PolicyRenew = 'https://apiwp.troth.co.in/api/Policy/PolicyRenew';
  private Vehicleno = 'https://apiwp.troth.co.in/api/UserVehicle/GetVehicles';
  private getRoleUrl = 'https://apiwp.troth.co.in/api/AdminAccess/GetRoles';
  private getCashlessHospitalUrl =
    'https://apiwp.troth.co.in/api/Hospital/GetCashlessHospitals';
  private getCashlessHospitalAyushByICICI =
    'https://apiwp.troth.co.in/api/HospitalGetCashlessHospitalsAyushByICICI';
  private getCashlessHospitalByGoDigit =
    'https://apiwp.troth.co.in/api/Hospital/GetCashlessHospitalsByGoDigit';
  private getHospitalsByPincode =
    'https://apiwp.troth.co.in/api/Hospital/GetHospitalsByPincode';
  private uploadFileUrl = 'https://apiwp.troth.co.in/api/AdminMaster/UploadFile';
  private addBannerUrl = 'https://apiwp.troth.co.in/api/AdminMaster';
  private vehicleUrl = 'https://apiwp.troth.co.in/api/UserVehicle/GetUserVehicles';
  private smsLogsUrl = 'https://apiwp.troth.co.in/api/User/GetSMSLogs';
  private privacyPolicyUrl =
    'https://apiwp.troth.co.in/api/PrivacyPolicy/GetPrivacyPolicy';
  private getUsersById = 'https://apiwp.troth.co.in/api/User/GetUserById';
  private totalVehicleCount =
    'https://apiwp.troth.co.in/api/UserVehicle/GetUserVehicleCount';
  private totalFamilyMemberCount =
    'https://apiwp.troth.co.in/api/User/GetTotalUserFamilyCount';
  private totalNomineeCount =
    'https://apiwp.troth.co.in/api/User/GetTotalNomineeCount';
  private SaveRole = 'https://apiwp.troth.co.in/api/AdminAccess/AddRole';
  private deleteProductUrl =
    'https://apiwp.troth.co.in/api/AdminMaster/DeleteProduct';
  private getEmployeeUrl = 'https://apiwp.troth.co.in/api/AdminMaster/GetEmployee';
  private addEmployeeUrl = 'https://apiwp.troth.co.in/api/AdminMaster/AddEmployee';
  private getAssignmentUrl =
    'https://apiwp.troth.co.in/api/Claim/GetClaimAssignment';
  private addAssignmentUrl =
    'https://apiwp.troth.co.in/api/Claim/AddClaimAssignment';
  private getForwardUrl = 'https://apiwp.troth.co.in/api/Claim/GetClaimForward';
  private addForwardUrl = 'https://apiwp.troth.co.in/api/Claim/AddClaimForward';
  private getDecisionUrl = 'https://apiwp.troth.co.in/api/Claim/GetClaimDecision';
  private addDecisionUrl = 'https://apiwp.troth.co.in/api/Claim/AddClaimDecision';
  private uploadClaimDocUrl = 'https://apiwp.troth.co.in/api/Claim/AddClaimDoc';
  private DeleteRole = 'https://apiwp.troth.co.in/api/AdminAccess/DeleteRoles';
  private getLead = 'https://apiwp.troth.co.in/api/AdminLead/GetLeads';
  private addCompanyUrl =
    'https://apiwp.troth.co.in/api/AdminGroupPolicy/AddCompany';
  private readonly getHrCompaniesUrl = 'api/Company/GetHrCompanies';
  constructor(private http: HttpClient) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getLeads(): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
    };
    return this.http.post<any>(this.getLead, requestBody).pipe(
      map((response) => {
        console.log('get lead is response is ', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching lead:', error);
        return throwError(() => new Error('Failed to fetch lead'));
      })
    );
  }

  getClaimDecisions(): Observable<any[]> {
    const requestBody = {};
    return this.http.post<any>(this.getDecisionUrl, requestBody).pipe(
      map((response) => {
        console.log('get claims is response is ', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching claim decisions:', error);
        return throwError(() => new Error('Failed to fetch claim decisions'));
      })
    );
  }

  createClaimDecision(decisionData: any): Observable<any> {
    console.log(decisionData);
    return this.http.post(this.addDecisionUrl, decisionData).pipe(
      catchError((error) => {
        console.error('Error creating claim decision:', error);
        return throwError(() => new Error('Failed to create claim decision'));
      })
    );
  }

  updateClaimDecision(decisionId: number, decisionData: any): Observable<any> {
    console.log('Inside service');
    console.log('decisionData', decisionData);
    return this.http.post(this.addDecisionUrl, decisionData).pipe(
      catchError((error) => {
        console.error('Error updating claim decision:', error);
        return throwError(() => new Error('Failed to update claim decision'));
      })
    );
  }

  deleteClaimDecision(decisionId: number): Observable<any> {
    return this.http
      .delete(`https://apiwp.troth.co.in/api/Claim/GetClaimDecision/${decisionId}`)
      .pipe(
        catchError((error) => {
          console.error('Error deleting claim decision:', error);
          return throwError(() => new Error('Failed to delete claim decision'));
        })
      );
  }

  getClaimDecisionById(decisionId: number): Observable<any> {
    const requestBody = {
      decisionId: decisionId,
      claimId: null,
      decisionStatus: '',
      decisionComments: '',
      decidedAt: null,
    };
    return this.http.post<any>(this.getDecisionUrl, requestBody).pipe(
      map((response) => {
        console.log('API decision by id Response:', response);
        if (response && response.responseData) {
          const decisions = JSON.parse(response.responseData);
          return decisions.length > 0 ? decisions[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching claim decision:', error);
        return throwError(() => new Error('Failed to fetch claim decision'));
      })
    );
  }

  getClaimForwards(): Observable<any[]> {
    const requestBody = {};
    return this.http.post<any>(this.getForwardUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching claim forwards:', error);
        return throwError(() => new Error('Failed to fetch claim forwards'));
      })
    );
  }
  addCompany(company: any): Observable<any> {
    return this.http.post(this.addCompanyUrl, company).pipe(
      catchError((error) => {
        console.error('Error creating claim forward:', error);
        return throwError(() => new Error('Failed to create claim forward'));
      })
    );
  }
  createClaimForward(forwardData: any): Observable<any> {
    return this.http.post(this.addForwardUrl, forwardData).pipe(
      catchError((error) => {
        console.error('Error creating claim forward:', error);
        return throwError(() => new Error('Failed to create claim forward'));
      })
    );
  }

  updateClaimForward(reviewId: number, forwardData: any): Observable<any> {
    return this.http.post(this.addForwardUrl, forwardData).pipe(
      catchError((error) => {
        console.error('Error updating claim forward:', error);
        return throwError(() => new Error('Failed to update claim forward'));
      })
    );
  }

  deleteClaimForward(reviewId: number): Observable<any> {
    return this.http.delete(`${this.getForwardUrl}/${reviewId}`).pipe(
      catchError((error) => {
        console.error('Error deleting claim forward:', error);
        return throwError(() => new Error('Failed to delete claim forward'));
      })
    );
  }

  getClaimForwardById(reviewId: number): Observable<any> {
    const requestBody = {
      reviewId: reviewId,
      claimId: null,
      empId: null,
      reviewStatus: '',
      reviewComments: '',
      forwardedToInsurer: null,
    };
    return this.http.post<any>(this.getForwardUrl, requestBody).pipe(
      map((response) => {
        console.log('api res', response);
        if (response && response.responseData) {
          const forwards = JSON.parse(response.responseData);
          return forwards.length > 0 ? forwards[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching claim forward:', error);
        return throwError(() => new Error('Failed to fetch claim forward'));
      })
    );
  }

  // Service methods for claim assignments

  getClaimAssignments(): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      claimAssignmentId: null,
      fullName: '',
      phoneNumber: '',
      email: '',
      selectProduct: '',
      policyNo: null,
    };
    return this.http.post<any>(this.getAssignmentUrl, requestBody).pipe(
      map((response) => {
        console.log('response is ', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching claim assignments:', error);
        return throwError(() => new Error('Failed to fetch claim assignments'));
      })
    );
  }

  createClaimAssignment(assignmentData: any): Observable<any> {
    return this.http.post(this.addAssignmentUrl, assignmentData).pipe(
      catchError((error) => {
        console.error('Error creating claim assignment:', error);
        return throwError(() => new Error('Failed to create claim assignment'));
      })
    );
  }

  saveRole(roleDto: any): Observable<any> {
    console.log('📤 Sending role to server:', roleDto);

    return this.http.post(this.SaveRole, roleDto).pipe(
      catchError((error) => {
        console.error('❌ Error creating role:', error);
        return throwError(() => new Error('Failed to create role'));
      })
    );
  }

  addFamilyMember(family: any): Observable<any> {
    return this.http.post(this.addEmpFamily, family).pipe(
      catchError((error) => {
        console.error('❌ Error creating family:', error);
        return throwError(() => new Error('Failed to create family'));
      })
    );
  }

  updateClaimAssignment(
    claimAssignmentId: number,
    assignmentData: any
  ): Observable<any> {
    console.log('Inside service');
    console.log('assignmentData', assignmentData);
    return this.http.post(this.addAssignmentUrl, assignmentData).pipe(
      catchError((error) => {
        console.error('Error updating claim assignment:', error);
        return throwError(() => new Error('Failed to update claim assignment'));
      })
    );
  }

  deleteClaimAssignment(claimAssignmentId: number): Observable<any> {
    return this.http
      .delete(
        `https://apiwp.troth.co.in/api/Claim/GetClaimAssignment/${claimAssignmentId}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error deleting claim assignment:', error);
          return throwError(
            () => new Error('Failed to delete claim assignment')
          );
        })
      );
  }

  getClaimAssignmentById(assignmentId: number): Observable<any> {
    const requestBody = {
      assignmentId: assignmentId,
      fullName: '',
      phoneNumber: '',
      email: '',
      selectProduct: '',
      policyNo: null,
    };
    return this.http.post<any>(this.getAssignmentUrl, requestBody).pipe(
      map((response) => {
        console.log('API Response:', response);
        if (response && response.responseData) {
          const assignments = JSON.parse(response.responseData);
          return assignments.length > 0 ? assignments[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching claim assignment:', error);
        return throwError(() => new Error('Failed to fetch claim assignment'));
      })
    );
  }

  getUserById(userId: number): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 1,
      userId: userId,
      userName: '',
      emailAddress: '',
      mobile: '',
    };

    return this.http.post<any>(this.getUsersById, requestBody).pipe(
      map((response) => {
        // responseData is a stringified JSON object
        if (response && response.responseData) {
          return JSON.parse(response.responseData); // return the user object
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching user by ID:', error);
        return throwError(() => new Error('Failed to fetch user'));
      })
    );
  }

  // createClaim(claimData: any): Observable<any> {
  //   const token = localStorage.getItem('token');
  //   const headers = token
  //     ? new HttpHeaders({
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       })
  //     : new HttpHeaders({ 'Content-Type': 'application/json' });

  //   return this.http.post(this.addClaimUrl, claimData, { headers }).pipe(
  //     tap((response) => console.log('Claim created successfully:', response)),
  //     catchError((error) => {
  //       console.error('Error creating claim:', error);
  //       return throwError(() => new Error('Failed to create claim'));
  //     })
  //   );
  // }

  getTotalVehicleCount(UserId: string | number): Observable<number> {
    console.log('User id is ', UserId);
    return this.http.post<any>(this.totalVehicleCount, { UserId: UserId }).pipe(
      map((response) => {
        if (response && response.responseData) {
          //   console.log('Total vehicle', response);
          return response.responseData;
        }
        return 0; // Default value if no data is found
      }),
      catchError((error) => {
        console.error('Error fetching total vehicle count:', error);
        return throwError(
          () => new Error('Failed to fetch total vehicle count')
        );
      })
    );
  }

  getTotalFamilyMemebrCount(UserId: string | number): Observable<number> {
    console.log('User id is ', UserId);
    return this.http
      .post<any>(this.totalFamilyMemberCount, { UserId: UserId })
      .pipe(
        map((response) => {
          if (response && response.responseData) {
            console.log('Total family', response);
            return response.responseData;
          }
          return 0; // Default value if no data is found
        }),
        catchError((error) => {
          console.error('Error fetching total family count:', error);
          return throwError(
            () => new Error('Failed to fetch total family count')
          );
        })
      );
  }

  getTotalNomineeCount(UserId: string | number): Observable<number> {
    console.log('User id is ', UserId);
    return this.http.post<any>(this.totalNomineeCount, { UserId: UserId }).pipe(
      map((response) => {
        if (response && response.responseData) {
          console.log('Total Nominee', response);
          return response.responseData;
        }
        return 0; // Default value if no data is found
      }),
      catchError((error) => {
        console.error('Error fetching total nominee count:', error);
        return throwError(
          () => new Error('Failed to fetch total nominee count')
        );
      })
    );
  }

  getSMSLogs(pageNo: number = 0, pageSize: number = 0): Observable<any> {
    const requestBody = {
      pageNo: pageNo,
      pageSize: pageSize,
    };

    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      : new HttpHeaders();

    return this.http.post<any>(this.smsLogsUrl, requestBody, { headers }).pipe(
      map((response) => {
        if (response && response.responseData) {
          console.log('SMS', response);
          return JSON.parse(response.responseData); // Return parsed data as-is
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching SMS logs:', error);
        return throwError(() => new Error('Failed to fetch SMS logs'));
      })
    );
  }

  getPrivacyPolicy(): Observable<string> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
    };

    return this.http.post<any>(this.privacyPolicyUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          // First parse the responseData string to JSON
          const parsed = JSON.parse(response.responseData);

          if (parsed.length > 0 && parsed[0].privacypolicy) {
            return parsed[0].privacypolicy; // This is your HTML content
          }
        }
        return '';
      }),
      catchError((error) => {
        console.error('Error fetching privacy policy:', error);
        return throwError(() => new Error('Failed to fetch privacy policy'));
      })
    );
  }

  getProductById(productId: number): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 1,
      productId: productId,
      productName: '',
    };
    return this.http.post<any>(this.productUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          const products = JSON.parse(response.responseData);
          return products.length > 0 ? products[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching product:', error);
        return throwError(() => new Error('Failed to fetch product'));
      })
    );
  }

  getEmployeeCompanyId(companyId: number): Observable<any[]> {
    const requestBody = {
      companyId: companyId,
    };
    return this.http.post<any>(this.getEmployeeByCompanyId, requestBody).pipe(
      map((response) => {
        console.log('Employee by company id:', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      })
    );
  }

  // Login function (Example)
  Originallogin(token: string) {
    localStorage.setItem('token', token);
  }

  // Logout function
  logout() {
    localStorage.removeItem('token');
  }

  login(data: any) {
    console.log('Service sending data:', data);
    return this.http.post<{ token: string }>(this.apiUrl, data);
  }

  // uploadBanner(bannerName: string, file: File, orderNumber: number): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('bannerName', bannerName);
  //   console.log("bannerName",bannerName)
  //   formData.append('file', file);
  //   formData.append('orderNumber', orderNumber.toString());
  //   formData.forEach((value, key) => console.log(key, value));// Convert number to string for FormData
  //   return this.http.post(this.uploadBannerUrl, formData); // Fixed URL to uploadBannerUrl
  // }

uploadBanner(
    bannerId: number | null,
    bannerName: string,
    file: File | null,
    orderNumber: number | null,
    isActive: boolean = true,
    bannerType: string = '',
    productId: number | null
): Observable<any> {
    const formData = new FormData();

    formData.append('BannerId', bannerId !== null ? bannerId.toString() : '');
    formData.append('BannerHeaderName', bannerName?.trim() || '');

    if (file) {
        formData.append('file', file);
    }

    formData.append('OrderNo', orderNumber !== null ? orderNumber.toString() : '');
    formData.append('IsActive', String(isActive));
    formData.append('BannerType', bannerType || '');
    formData.append('ProductId', productId !== null ? productId.toString() : '');

    if (!environment.production) {
        console.log('FormData contents:');
        formData.forEach((value, key) => console.log(`${key}: ${value}`));
    }

    return this.http
        .post(this.uploadBannerUrl, formData, {
            headers: { Accept: 'application/json' },
        })
        .pipe(
            catchError((error) => {
                console.error('Error in uploadBanner:', error);
                return throwError(() => new Error('Failed to process banner'));
            })
        );
}


  getBannerById(bannerId: number): Observable<any> {
    const requestBody = {
      bannerId: bannerId,
      bannerHeaderName: '',
      bannerFileName: '',
      bannerType:null,
      orderNo: null,
      isActive: null,
    };
    return this.http.post<any>(this.bannerUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          const banners = JSON.parse(response.responseData);
          console.log('Parsed banners:', banners);
          return banners.find((b: any) => b.BannerId === bannerId) || null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching banner:', error);
        return throwError(() => new Error('Failed to fetch banner'));
      })
    );
  }

  getBannerImage(): Observable<any[]> {
    return this.http.get<any>(this.getImageUrl);
  }

  getRole(): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
    };

    return this.http.post<any>(this.getRoleUrl, requestBody);
  }

  getVehicles(): Observable<VehicleApiResponse> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      vehicleId: 0,
      vehicleName: '',
    };
    return this.http.post<VehicleApiResponse>(this.vehicleUrl, requestBody);
  }

  getvehicleByNo(vehicleNo: string): Observable<VehicleApiResponse> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      vehicleNo: vehicleNo,
    };
    return this.http.post<VehicleApiResponse>(this.vehicleUrl, requestBody);
  }

  getStateName(
    pagesize: any,
    companyId: any
  ): Observable<{ data: any[]; totalCount: number }> {
    const requestBody = {
      pageNo: 0,
      pageSize: pagesize,
      stateId: 0,
      stateName: '',
    };
    return this.http.post<any>(this.getStateUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          const parsedData = JSON.parse(response.responseData);
          console.log('Received Data from API:', parsedData); // ✅ Check this
          return {
            data: parsedData.items || parsedData,
            totalCount:
              response.totalCount || parsedData.totalCount || parsedData.length,
          };
        }
        return { data: [], totalCount: 0 };
      }),
      catchError((error) => {
        console.error('Error fetching states:', error);
        return throwError(() => new Error('Failed to fetch states'));
      })
    );
  }

  getCityName(
    pageSize: number,
    pageNo: number
  ): Observable<{ data: any[]; totalCount: number }> {
    const requestBody = {
      pageNo: pageNo, // ✅ Current page number
      pageSize: pageSize, // ✅ Page size selected in dropdown
      cityId: 0,
      cityName: '',
    };

    return this.http.post<any>(this.getCityUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          const parsedData = JSON.parse(response.responseData);
          console.log('Received Data from API:', parsedData); // ✅ Confirm data response
          return {
            data: parsedData.items || parsedData,
            totalCount:
              response.totalCount || parsedData.totalCount || parsedData.length,
          };
        }
        return { data: [], totalCount: 0 };
      }),
      catchError((error) => {
        console.error('Error fetching cities:', error);
        return throwError(() => new Error('Failed to fetch cities'));
      })
    );
  }

  createHospital(hospitalData: any): Observable<any> {
    console.log('hospital data is ', hospitalData);
    return this.http.post(this.hospitalAddUrl, hospitalData).pipe(
      catchError((error) => {
        console.error('Error creating hospital:', error);
        return throwError(() => new Error('Failed to create hospital'));
      })
    );
  }

  getCurrentUser(): string {
    return 'admin'; // Replace with actual user logic
  }

  getHospitalById(hospitalId: number): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 1,
      hospitalId: hospitalId,
      hospitalName: '',
    };
    return this.http.post<any>(this.hospitalUrl, requestBody).pipe(
      map((response) => {
        console.log('API Response:', response);
        if (response && response.responseData) {
          const hospitals = JSON.parse(response.responseData);
          return hospitals.length > 0 ? hospitals[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching hospital:', error);
        return throwError(() => new Error('Failed to fetch hospital'));
      })
    );
  }

  getGarageById(garageId: number): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 1,
      garageId: garageId,
      garageName: '',
    };
    return this.http.post<any>(this.garageUrl, requestBody).pipe(
      map((response) => {
        console.log('API Response:', response);
        if (response && response.responseData) {
          const garages = JSON.parse(response.responseData);
          return garages.length > 0 ? garages[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching Garage:', error);
        return throwError(() => new Error('Failed to fetch Garage'));
      })
    );
  }

  getFamilyMembers(empId: number): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 10,
      EmpId: empId,
    };
    return this.http.post<any>(this.getEmpFamilyy, requestBody).pipe(
      map((response) => {
        console.log('Family members response:', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching family members:', error);
        return throwError(() => new Error('Failed to fetch family members'));
      })
    );
  }

  getEmpfamily(empId: number): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 10,
      EmpId: empId,
    };
    return this.http.post<any>(this.getEmpFamilyy, requestBody).pipe(
      map((response) => {
        console.log('Family members response:', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching family members:', error);
        return throwError(() => new Error('Failed to fetch family members'));
      })
    );
  }

  getAdminById(id: any) {
    const requestBody = {
      pageNo: 0,
      pageSize: 1,
      empId: id,
    };
    return this.http
      .post<any>(
        'https://apiwp.troth.co.in/api/AdminGroupPolicy/GetGroupPolicyEmployee',
        requestBody
      )
      .pipe(
        map((response) => {
          console.log('API Response:getadmin', response.responseData);
          if (response && response.responseData) {
            const admin = JSON.parse(response.responseData);
            return admin.length > 0 ? admin[0] : null;
          }
          return null;
        }),
        catchError((error) => {
          console.error('Error fetching Admin:', error);
          return throwError(() => new Error('Failed to fetch Admin'));
        })
      );
  }

  getRoleById(id: any) {
    const requestBody = {
      pageNo: 0,
      pageSize: 1,
      RoleMasterId: id,
    };
    return this.http.post<any>(this.getRoleUrl, requestBody).pipe(
      map((response) => {
        console.log('API Response:', response);
        if (response && response.responseData) {
          const role = JSON.parse(response.responseData);
          return role.length > 0 ? role[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching Admin:', error);
        return throwError(() => new Error('Failed to fetch Admin'));
      })
    );
  }

  // New method: getCompanyById
  getCompanyById(companyId: number): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 1,
      companyId: companyId,
      companyName: '',
    };
    return this.http.post<any>(this.companyUrl, requestBody).pipe(
      map((response) => {
        console.log('API Response:', response);
        if (response && response.responseData) {
          const companies = JSON.parse(response.responseData);
          return companies.length > 0 ? companies[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching company:', error);
        return throwError(() => new Error('Failed to fetch company'));
      })
    );
  }

  updateHospital(hospitalId: number, hospitalData: any): Observable<any> {
    console.log('hospital data is ', hospitalData);
    return this.http.post(this.hospitalAddUrl, hospitalData).pipe(
      catchError((error) => {
        console.error('Error updating hospital:', error);
        return throwError(() => new Error('Failed to update hospital'));
      })
    );
  }

  deleteHospital(hospitalId: number): Observable<any> {
    return this.http.delete(`${this.hospitalUrl}/${hospitalId}`).pipe(
      catchError((error) => {
        console.error('Error deleting hospital:', error);
        return throwError(() => new Error('Failed to delete hospital'));
      })
    );
  }

  getCompanies(): Observable<any[]> {
    const requestBody = {
      pageNo: 1,
      pageSize: 30,
    };
    return this.http.post<any>(this.companyUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          console.log('Companies response:', response);
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching companies:', error);
        console.log('Error details:', error.error);
        return throwError(() => new Error('Failed to fetch companies'));
      })
    );
  }

  createCompany(companyData: any): Observable<any> {
    return this.http.post(this.companyAddUrl, companyData).pipe(
      catchError((error) => {
        console.error('Error creating company:', error);
        return throwError(() => new Error('Failed to create company'));
      })
    );
  }

  updateCompany(companyData: any): Observable<any> {
    console.log('Updating company:', companyData);
    return this.http.post(`${this.companyAddUrl}`, companyData).pipe(
      catchError((error) => {
        console.error('Error updating company:', error);
        return throwError(() => new Error('Failed to update company'));
      })
    );
  }

  deleteCompany(companyId: number): Observable<any> {
    return this.http.delete(`${this.companyUrl}/${companyId}`).pipe(
      catchError((error) => {
        console.error('Error deleting company:', error);
        return throwError(() => new Error('Failed to delete company'));
      })
    );
  }

  getHrCompanies(): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
    };

    return this.http.post<any>(this.getHrCompaniesUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching HR companies:', error);
        return throwError(() => new Error('Failed to fetch HR companies'));
      })
    );
  }


 
getHospitals(
  pagesize: any, companyId: any, currentPage?: number): Observable<{ data: any[]; totalCount: number }> {
      // Server-side pagination
      const requestBody = {
          pageNo: 1,
          pageSize: pagesize,
          hospitalId: 0,
          hospitalName: '',
          companyId: companyId,
      };
      console.log('page size is ', pagesize);
      return this.http.post<any>(this.hospitalUrl, requestBody).pipe(
          map((response) => {
              if (response && response.responseData) {
                  const parsedData = JSON.parse(response.responseData);
                  console.log('inside service data is ', parsedData);
  
                  return {
                      data: parsedData.items || parsedData,
                      totalCount:
                          response.totalCount || parsedData.totalCount || parsedData.length,
                  };
              }
              return { data: [], totalCount: 0 };
          }),
          catchError((error) => {
              console.error('Error fetching hospitals:', error);
              console.log('Error details:', error.error);
              return throwError(() => new Error('Failed to fetch hospitals'));
          })
      );
  }
  
  
  
  getHospitalsWithCashless(
    pageSize: any,
    companyId: any,
    currentPage?: number
  ): Observable<{ data: any[]; totalCount: number }> {
    // Server-side pagination
    const requestBody = {
      pageNo: currentPage || 1,
      pageSize: pageSize,
      hospitalId: 0,
      hospitalName: '',
      companyId: companyId,
    };
  
    return this.http.post<any>(this.withcashhospitalsUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          const parsedData = JSON.parse(response.responseData);
          console.log('inside service data is for the getHospitalsWithCashless ', parsedData);
  
          const totalCount =
            response.totalCount || parsedData.totalCount || parsedData.length;
          console.log('Total hospital data count:', totalCount); // Added console log for total count
  
          return {
            data: parsedData.items || parsedData,
            totalCount: totalCount,
          };
        }
        console.log('Total hospital data count: 0 (no response data)'); // Log for empty response
        return { data: [], totalCount: 0 };
      }),
      catchError((error) => {
        console.error('Error fetching hospitals with cashless:', error);
        console.log('Error details:', error.error);
        return throwError(() => new Error('Failed to fetch hospitals with cashless'));
      })
    );
  }
  
  
  getHospitalsWithoutCashless(
    pageSize: any,
    companyId: any,
    currentPage?: number
  ): Observable<{ data: any[]; totalCount: number }> {
    // Server-side pagination
    const requestBody = {
      pageNo: currentPage || 1,
      pageSize: pageSize,
      hospitalId: 0,
      hospitalName: '',
      companyId: companyId,
    };
  
    return this.http.post<any>(this.withoutcashhospitalsUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          const parsedData = JSON.parse(response.responseData);
          console.log('inside service data is for the getHospitalsWithoutCashless ', parsedData);
  
          const totalCount =
            response.totalCount || parsedData.totalCount || parsedData.length;
          console.log('Total hospital data count:', totalCount); // Log for total count
  
          return {
            data: parsedData.items || parsedData,
            totalCount: totalCount,
          };
        }
        console.log('Total hospital data count: 0 (no response data)'); // Log for empty response
        return { data: [], totalCount: 0 };
      }),
      catchError((error) => {
        console.error('Error fetching hospitals without cashless:', error);
        console.log('Error details:', error.error);
        return throwError(() => new Error('Failed to fetch hospitals without cashless'));
      })
    );
  }

  getSupport(pageNo: number = 0, pageSize: number = 0): Observable<any> {
    const requestBody = {
      pageNo: pageNo,
      pageSize: pageSize,
    };

    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      : new HttpHeaders();

    return this.http.post<any>(this.getsupport, requestBody, { headers }).pipe(
      map((response) => {
        if (response && response.responseData) {
          console.log('getsupport', response);
          return JSON.parse(response.responseData); // Return parsed data as-is
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching Contacts logs:', error);
        return throwError(() => new Error('Failed to fetch contact '));
      })
    );
  }

getGarages(
  pageSize: number,
  companyId: number | null,
  pageNo: number
): Observable<{ data: any[]; totalCount: number }> {
  const requestBody = {
    pageno: pageNo || 1, // ✅ use dynamic page number
    pagesize: pageSize,
    companyid: companyId || null,
    WorkshopName: '',
    WorkshopAddress: '',
    Pincode: '',
    WorkshopType: '',
    BodyshopInchargeName: '',
    Zone: '',
    LocationPreference: '',
    wheeltype: '',
  };

  return this.http.post<any>(this.garageUrl, requestBody).pipe(
    map((response) => {
      if (response && response.responseData) {
        const parsedData = JSON.parse(response.responseData);
        return {
          data: parsedData.items || parsedData,
          totalCount:
            response.totalCount || parsedData.totalCount || parsedData.length,
        };
      }
      return { data: [], totalCount: 0 };
    }),
    catchError((error) => {
      console.error('Error fetching garages:', error);
      return throwError(() => new Error('Failed to fetch garages'));
    })
  );
}


  createGarage(garageData: any): Observable<any> {
    console.log('Creating garage with data:', garageData);
    return this.http.post(this.addGarageUrl, garageData).pipe(
      tap((response) => console.log('Garage created successfully:', response)),
      catchError((error) => {
        console.error('Error creating garage:', error);
        return throwError(() => new Error('Failed to create garage'));
      })
    );
  }

  updateGarage(garageId: number, garageData: any): Observable<any> {
    return this.http.post(`${this.addGarageUrl}`, garageData).pipe(
      catchError((error) => {
        console.error('Error updating garage:', error);
        return throwError(() => new Error('Failed to update garage'));
      })
    );
  }

  updateAdmin(userId: number, formData: FormData): Observable<any> {
    return this.http
      .post(`${this.CreateAdminUrl}`, formData, {
        headers: {
          Accept: 'application/json',
        },
      })
      .pipe(
        map((response) => {
          console.log('Update Admin Response:', response);
          return response;
        }),
        catchError((error) => {
          console.error('Error updating admin:', error);
          return throwError(() => new Error('Failed to update admin'));
        })
      );
  }

  UpdateRole(id: any, roledata: any): Observable<any> {
    return this.http.post(`${this.SaveRole}`, roledata).pipe(
      catchError((error) => {
        console.error('Error updating role:', error);
        return throwError(() => new Error('Failed to update role'));
      })
    );
  }

  deleteGarage(garageId: number): Observable<any> {
    return this.http.delete(`${this.garageUrl}/${garageId}`).pipe(
      catchError((error) => {
        console.error('Error deleting garage:', error);
        return throwError(() => new Error('Failed to delete garage'));
      })
    );
  }

  getTotalUsers(): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      userName: '',
    };
    return this.http.post<any>(this.usersUrl, requestBody).pipe(
      map((response) => {
        console.log('', response);
        return {
          totalCount: response.totalCount,
          users: JSON.parse(response.responseData),
        };
      }),
      catchError((error) => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to fetch users'));
      })
    );
  }

  getTotalClaims(): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      // Removed claimId to test if it's causing the 400 error
      // Add userId if required, e.g., userId: localStorage.getItem('UserId') || ''
    };
    console.log('Sending request to GetClaims with body:', requestBody);
    console.log('Request URL:', this.claimsUrl);

    return this.http
      .post<any>(this.claimsUrl, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        map((response) => {
          console.log('Raw Claims API response:', response);
          if (response && response.responseData) {
            console.log(
              'Parsed responseData:',
              JSON.parse(response.responseData)
            );
            return {
              totalCount: response.totalCount,
              claims: JSON.parse(response.responseData),
            };
          }
          console.log('No responseData, returning default');
          return { totalCount: 0, claims: [] };
        }),
        catchError((error) => {
          console.error('Error fetching claims:', error);
          console.error(
            'Error details:',
            error.status,
            error.statusText,
            error.error
          );
          return throwError(() => new Error('Failed to fetch claims'));
        })
      );
  }

  getUsers(): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      userName: '',
    };
    return this.http.post<any>(this.usersUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          console.log('Users', response);
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to fetch users'));
      })
    );
  }

  getAdminUsers(pageNo: number = 1, pageSize: number = 10): Observable<any[]> {
    const requestBody = {
      PageNo: 1,
      PageSize: 10,
    };
    console.log('req body is ', requestBody);
    return this.http.post<any>(this.AdminUserUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          console.log('Users', response);
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to fetch users'));
      })
    );
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(this.usersUrl, userData).pipe(
      catchError((error) => {
        console.error('Error creating user:', error);
        return throwError(() => new Error('Failed to create user'));
      })
    );
  }

  createAdmin(formData: FormData): Observable<any> {
    return this.http.post(this.CreateAdminUrl, formData);
  }

  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.usersUrl}/${userId}`, userData).pipe(
      catchError((error) => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('Failed to update user'));
      })
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.usersUrl}/${userId}`).pipe(
      catchError((error) => {
        console.error('Error deleting user:', error);
        return throwError(() => new Error('Failed to delete user'));
      })
    );
  }

  getBanners(): Observable<any[]> {
    const requestBody = {
      bannerId: null,
      bannerHeaderName: '',
      bannerFileName: '',
      bnannerType: '',
      orderNo: null,
      isActive: null,
    };
    return this.http.post<any>(this.bannerUrl, requestBody).pipe(
      map((response) => {
        console.log('response is ', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching banners:', error);
        return throwError(() => new Error('Failed to fetch banners'));
      })
    );
  }

  getClaimStatus(pageNo: number = 0, pageSize: number = 0): Observable<any[]> {
    const requestBody = {
      pageNo: pageNo,
      pageSize: pageSize,
    };

    const claimStatusUrl = 'https://apiwp.troth.co.in/api/Claim/GetClaimStatus';

    return this.http.post<any>(claimStatusUrl, requestBody).pipe(
      map((response) => {
        console.log('Claim Status Response:', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching claim status:', error);
        return throwError(() => new Error('Failed to fetch claim status'));
      })
    );
  }

  getGroupPolicy(): Observable<any[]> {
    const requestBody = {
      pageno: 0,
      pageSize: 0,
    };
    return this.http.post<any>(this.groupPolicyUrl, requestBody).pipe(
      map((response) => {
        console.log('Group Policy Response:', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      })
    );
  }

  getEmployees(): Observable<any[]> {
    const requestBody = {
      pageno: 0,
      pageSize: 0,
    };

    return this.http
      .post<any>('https://apiwp.troth.co.in/api/AdminMaster/GetEmployee', requestBody)
      .pipe(
        map((response) => {
          console.log('Employee response is', response);
          if (response && response.responseData) {
            return JSON.parse(response.responseData);
          }
          return [];
        }),
        catchError((error) => {
          console.error('Error fetching employees:', error);
          return throwError(() => new Error('Failed to fetch employees'));
        })
      );
  }

  createBanner(bannerData: any): Observable<any> {
    return this.http.post(this.bannerUrl, bannerData).pipe(
      catchError((error) => {
        console.error('Error creating banner:', error);
        return throwError(() => new Error('Failed to create banner'));
      })
    );
  }

  updateBanner(bannerId: number, bannerData: any): Observable<any> {
    return this.http.post(`${this.bannerUrl}/${bannerId}`, bannerData).pipe(
      catchError((error) => {
        console.error('Error updating banner:', error);
        return throwError(() => new Error('Failed to update banner'));
      })
    );
  }

  deleteBanner(bannerId: any): Observable<any> {
    return this.http
      .post(`${this.deletebannerUrl}`, { BannerId: bannerId })
      .pipe(
        catchError((error) => {
          console.error('Error deleting banner:', error);
          return throwError(() => new Error('Failed to delete banner'));
        })
      );
  }

  deleteProductHeader(ProductHeaderId: any): Observable<any> {
    return this.http
      .post(`${this.deleteProductHeaderUrl}`, { ProductHeaderId: ProductHeaderId })
      .pipe(
        catchError((error) => {
          console.error('Error deleting banner:', error);
          return throwError(() => new Error('Failed to delete banner'));
        })
      );
  }





  deleteAdmin(userAdminId: number): Observable<any> {
    return this.http
      .post(`${this.deleteUserAdmin}`, { UserAdminId: userAdminId })
      .pipe(
        catchError((error) => {
          console.error('Error deleting admin:', error);
          return throwError(() => new Error('Failed to delete admin'));
        })
      );
  }

  deleteRole(id: any): Observable<any> {
    return this.http.post(`${this.DeleteRole}`, { roleMasterId: id }).pipe(
      catchError((error) => {
        console.error('Error deleting role:', error);
        return throwError(() => new Error('Failed to delete role'));
      })
    );
  }

  getClaims(): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      claimId: null,
      fullName: '',
      phoneNumber: '',
      email: '',
      selectProduct: '',
      policyNo: null,
    };
    return this.http.post<any>(this.claimsUrl, requestBody).pipe(
      map((response) => {
        console.log('response is ', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching claims:', error);
        return throwError(() => new Error('Failed to fetch claims'));
      })
    );
  }

  createClaim(claimData: any): Observable<any> {
    console.log('Claim Dara', claimData);
    return this.http.post(this.addClaimUrl, claimData).pipe(
      catchError((error) => {
        console.error('Error creating claim:', error);
        return throwError(() => new Error('Failed to create claim'));
      })
    );
  }

  updateClaim(claimId: number, claimData: any): Observable<any> {
    console.log('Inside service');
    console.log('claimdata', claimData);
    return this.http.post(this.addClaimUrl, claimData).pipe(
      catchError((error) => {
        console.error('Error updating claim:', error);
        return throwError(() => new Error('Failed to update claim'));
      })
    );
  }

  deleteClaim(claimId: number): Observable<any> {
    return this.http.delete(`${this.claimsUrl}/${claimId}`).pipe(
      catchError((error) => {
        console.error('Error deleting claim:', error);
        return throwError(() => new Error('Failed to delete claim'));
      })
    );
  }

  uploadClaimDocument(formData: FormData): Observable<any> {
    return this.http.post(this.uploadClaimDocUrl, formData).pipe(
      catchError((error) => {
        console.error('Error uploading document:', error);
        return throwError(() => new Error('Failed to upload document'));
      })
    );
  }

  // Add this method to authService (near getClaims, createClaim, etc.)
  getClaimById(claimId: number): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 1,
      claimId: claimId,
      fullName: '',
      phoneNumber: '',
      email: '',
      selectProduct: '',
      policyNo: null,
    };
    return this.http.post<any>(this.claimsUrl, requestBody).pipe(
      map((response) => {
        console.log('API claim is  Response:', response);
        if (response && response.responseData) {
          const claims = JSON.parse(response.responseData);
          return claims.length > 0 ? claims[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching claim:', error);
        return throwError(() => new Error('Failed to fetch claim'));
      })
    );
  }

  getProducts(): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      productId: 0,
      productName: '',
    };
    return this.http.post<any>(this.productUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching products:', error);
        return throwError(() => new Error('Failed to fetch products'));
      })
    );
  }

   getAllProducts(): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      productId: 0,
      productName: '',
    };
    return this.http.post<any>(this.getAllProductsUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching products:', error);
        return throwError(() => new Error('Failed to fetch products'));
      })
    );
  }

  createProduct(productData: any, imageFile?: File): Observable<any> {
    // If there's an image file, use FormData
    if (imageFile) {
      const formData = new FormData();

      // Add all product data to FormData
      Object.keys(productData).forEach((key) => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key].toString());
        }
      });

      // Add image file
      formData.append('file', imageFile);

      console.log('FormData contents for product:');
      formData.forEach((value, key) => console.log(`${key}: ${value}`));

      return this.http.post(this.productAddUrl, formData).pipe(
        tap((response) => console.log('Product API Response:', response)),
        catchError((error) => {
          console.error('Detailed error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
          });
          return throwError(
            () => new Error(`Failed to process product: ${error.message}`)
          );
        })
      );
    } else {
      // If no image file, just send the product data
      return this.http.post(this.productAddUrl, productData).pipe(
        tap((response) => console.log('Product API Response:', response)),
        catchError((error) => {
          console.error('Detailed error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
          });
          return throwError(
            () => new Error(`Failed to process product: ${error.message}`)
          );
        })
      );
    }
  }

  updateProduct(
    productId: number,
    productData: any,
    imageFile?: File
  ): Observable<any> {
    console.log('Product data for update is:', productData);

    // Ensure ProductId is included
    productData.ProductId = productId;

    // Create FormData to send to backend
    const formData = new FormData();

    // Append all product fields to FormData
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key].toString());
      }
    });

    // If image is selected, append it
    if (imageFile) {
      console.log('✅ New image file selected:', imageFile);
      formData.append('file', imageFile);
    } else {
      console.log(
        '️ No new image file selected — sending old image path only.'
      );
      formData.append('file', new Blob());
    }

    // Debug FormData output
    console.log('📦 FormData contents for update:');
    formData.forEach((value, key) => console.log(`${key}: ${value}`));

    // Send FormData using POST
    return this.http.post(this.productAddUrl, formData).pipe(
      tap((response) =>
        console.log('✅ Product update API Response:', response)
      ),
      catchError((error) => {
        console.error('❌ Detailed error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
        });
        return throwError(
          () => new Error(`Failed to update product: ${error.message}`)
        );
      })
    );
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http
      .post(`${this.deleteProductUrl}`, { ProductId: productId })
      .pipe(
        catchError((error) => {
          console.error('Error deleting product:', error);
          return throwError(() => new Error('Failed to delete product'));
        })
      );
  }

  getProductHeaders(): Observable<any[]> {
    return this.http.post<any>(this.productHeadergetUrl, {
      pageNo:0,
      pageSize:0,
      Search: ''
    }).pipe(
      map((response) => {
        if (response?.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching product headers:', error);
        return throwError(() => new Error('Failed to fetch product headers'));
      })
    );
  }
  
  createOrUpdateProductHeader(data: any): Observable<any> {
    return this.http.post(this.productHeaderAddUrl, data).pipe(
      tap((response) => console.log('ProductHeader API Response:', response)),
      catchError((error) => {
        console.error('Failed to save product header:', error);
        return throwError(() => new Error('Product header save failed.'));
      })
    );
  }
  
  updateProductHeader(productHeaderId: number, headerData: any): Observable<any> {
    console.log('🔄 Product Header data for update:', headerData);
  
    // Ensure ProductHeaderId is set correctly
    headerData.ProductHeaderId = productHeaderId;
  
    return this.http.post(this.productHeaderAddUrl, headerData).pipe(
      tap((response) => console.log('✅ Product Header update API Response:', response)),
      catchError((error) => {
        console.error('❌ Error updating Product Header:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
        });
        return throwError(() => new Error(`Failed to update product header: ${error.message}`));
      })
    );
  }
  

  // Add these methods below getStateName() in authService
  createState(stateData: any): Observable<any> {
    return this.http.post(this.getStateUrl, stateData).pipe(
      catchError((error) => {
        console.error('Error creating state:', error);
        return throwError(() => new Error('Failed to create state'));
      })
    );
  }

  updateState(stateId: number, stateData: any): Observable<any> {
    return this.http.put(`${this.getStateUrl}/${stateId}`, stateData).pipe(
      catchError((error) => {
        console.error('Error updating state:', error);
        return throwError(() => new Error('Failed to update state'));
      })
    );
  }

  deleteState(stateId: number): Observable<any> {
    return this.http.delete(`${this.getStateUrl}/${stateId}`).pipe(
      catchError((error) => {
        console.error('Error deleting state:', error);
        return throwError(() => new Error('Failed to delete state'));
      })
    );
  }

  // Add these methods below getCityName() in authService
  createCity(cityData: any): Observable<any> {
    return this.http.post(this.getCityUrl, cityData).pipe(
      catchError((error) => {
        console.error('Error creating city:', error);
        return throwError(() => new Error('Failed to create city'));
      })
    );
  }

  updateCity(cityId: number, cityData: any): Observable<any> {
    return this.http.put(`${this.getCityUrl}/${cityId}`, cityData).pipe(
      catchError((error) => {
        console.error('Error updating city:', error);
        return throwError(() => new Error('Failed to update city'));
      })
    );
  }

  deleteCity(cityId: number): Observable<any> {
    return this.http.delete(`${this.getCityUrl}/${cityId}`).pipe(
      catchError((error) => {
        console.error('Error deleting city:', error);
        return throwError(() => new Error('Failed to delete city'));
      })
    );
  }

  getPolicies(): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      policyId: 0,
      policyName: '',
    };
    return this.http.post<any>(this.policyUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching policies:', error);
        return throwError(() => new Error('Failed to fetch policies'));
      })
    );
  }

  setPolicyRenew(policyNo: string) {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      policyId: 0,
      policyNo: policyNo, // 👈 assign policyNo here
    };

    return this.http.post<any>(this.PolicyRenew, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching policies:', error);
        return throwError(() => new Error('Failed to fetch policies'));
      })
    );
  }

  RenewgetPolicies(): Observable<any[]> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      policyId: 0,
      policyName: '',
    };
    return this.http.post<any>(this.RenewpolicyUrl, requestBody).pipe(
      map((response) => {
        console.log('API Renew Policy is  Response:', response);
        if (response && response.responseData) {
          return JSON.parse(response.responseData);
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching policies:', error);
        return throwError(() => new Error('Failed to fetch policies'));
      })
    );
  }

  createPolicy(policyData: any): Observable<any> {
    return this.http.post(this.policyUrl, policyData).pipe(
      catchError((error) => {
        console.error('Error creating policy:', error);
        return throwError(() => new Error('Failed to create policy'));
      })
    );
  }

  updatePolicy(policyId: number, policyData: any): Observable<any> {
    return this.http.put(`${this.policyUrl}/${policyId}`, policyData).pipe(
      catchError((error) => {
        console.error('Error updating policy:', error);
        return throwError(() => new Error('Failed to update policy'));
      })
    );
  }

  getPolicyById(policyId: number): Observable<any> {
    console.log('policy id is ', policyId);

    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      policyId: policyId,
      categoryCode: '',
      subCategoryCode: '',
      policyNo: '',
      customerNo: '',
      vehicleNumber: '',
      isActive: null,
    };

    return this.http.post<any>(this.policyUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          const policies = JSON.parse(response.responseData);
          console.log('Parsed policies:', policies);
          return policies.find((p: any) => p.PolicyId === policyId) || null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching policy:', error);
        return throwError(() => new Error('Failed to fetch policy'));
      })
    );
  }
  getPoliciesByUserId(userId: number): Observable<any[]> {
    console.log('user id is ', userId);

    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      policyId: 0, // Set to 0 as we're fetching all policies for the user
      categoryCode: '',
      subCategoryCode: '',
      policyNo: '',
      customerNo: '',
      vehicleNumber: '',
      isActive: null,
      userId: userId, // Add userId to the request body
    };

    return this.http.post<any>(this.policyUrl, requestBody).pipe(
      map((response) => {
        if (response && response.responseData) {
          const policies = JSON.parse(response.responseData);
          console.log('Parsed policies:', policies);
          return policies; // Return the array of policies
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching policies:', error);
        return throwError(() => new Error('Failed to fetch policies'));
      })
    );
  }

  getPolicyByNumber(policyNo: number): Observable<any> {
    console.log('policy id is ', policyNo);

    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      policyNo: policyNo,
      categoryCode: '',
      subCategoryCode: '',
      customerNo: '',
      vehicleNumber: '',
      isActive: null,
    };

    return this.http.post<any>(this.policyByNoUrl, requestBody).pipe(
      map((response) => {
        console.log('policy no res is ', response);
        if (response && response.responseData) {
          const policies = JSON.parse(response.responseData);
          console.log('Parsed policies by PolicyNo:', policies);
          return policies.find((p: any) => p.PolicyNo === policyNo) || null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching policy:', error);
        return throwError(() => new Error('Failed to fetch policy'));
      })
    );
  }

  deletePolicy(policyId: number): Observable<any> {
    return this.http.delete(`${this.policyUrl}/${policyId}`).pipe(
      catchError((error) => {
        console.error('Error deleting policy:', error);
        return throwError(() => new Error('Failed to delete policy'));
      })
    );
  }

  GetCashlessHospitalsAyushByICICI(): Observable<any[]> {
    return this.http.get<any>(this.getCashlessHospitalAyushByICICI).pipe(
      map((response) => {
        return response;
      })
    );
  }

  GetCashlessHospitalsByGoDigit(): Observable<any[]> {
    return this.http.get<any>(this.getCashlessHospitalByGoDigit).pipe(
      map((response) => {
        return response;
      })
    );
  }

  GetHospitalsByPincode(pincode: string): Observable<any[]> {
    return this.http.get<any>(`${this.getHospitalsByPincode}/${pincode}`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post(this.uploadFileUrl, formData);
  }

  // Create Employee
  createEmployee(employeeData: any): Observable<any> {
    return this.http.post(this.addEmployeeUrl, employeeData).pipe(
      tap((response) =>
        console.log('Employee created successfully:', response)
      ),
      catchError((error) => {
        console.error('Error creating employee:', error);
        return throwError(() => new Error('Failed to create employee'));
      })
    );
  }

  // Update Employee
  updateEmployee(empId: number, employeeData: any): Observable<any> {
    // Using same endpoint as create for update (based on your pattern)
    employeeData.empId = empId; // Ensure empId is included in the data
    return this.http.post(this.addEmployeeUrl, employeeData).pipe(
      tap((response) =>
        console.log('Employee updated successfully:', response)
      ),
      catchError((error) => {
        console.error('Error updating employee:', error);
        return throwError(() => new Error('Failed to update employee'));
      })
    );
  }

  // Delete Employee
  deleteEmployee(empId: number): Observable<any> {
    return this.http.delete(`${this.getEmployeeUrl}/${empId}`).pipe(
      catchError((error) => {
        console.error('Error deleting employee:', error);
        return throwError(() => new Error('Failed to delete employee'));
      })
    );
  }

  // Get Employee by ID (Optional, for completeness)
  getEmployeeById(empId: number): Observable<any> {
    const requestBody = {
      UserAdminId: empId,
      firstName: '',
      lastName: '',
      email: '',
      productId: null,
      role: '',
      lastAssignedAt: null,
      isActive: null,
      dateCreated: null,
      createdBy: '',
      dateUpdated: null,
      updatedBy: '',
    };
    return this.http.post<any>(this.getEmployeeUrl, requestBody).pipe(
      map((response) => {
        console.log('API Response:', response);
        if (response && response.responseData) {
          const employees = JSON.parse(response.responseData);
          return employees.length > 0 ? employees[0] : null;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching employee:', error);
        return throwError(() => new Error('Failed to fetch employee'));
      })
    );
  }
}
