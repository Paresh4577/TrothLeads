import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupPolicyService {
  private apiUrl = 'http://localhost:2293/api/AdminGroupPolicy';
   private insurerUrl = 'http://localhost:2293/api/Master/GetCompanies';
  constructor(private http: HttpClient) {}
  
  //CompanyList
   getAllCompanies(): Observable<any> {
    
      const requestBody = {
        pageNo: 0,
        pageSize: 0,
        
      };
      return this.http.post(`${this.apiUrl}/GetGroupPolicyCompany`, requestBody);
    }
    //get one employee
    getOneEmployee(id: any) {
      const requestBody = {
        pageNo: 0,
        pageSize: 1,
        empId: id,
      };
      return this.http
        .post<any>(
          'http//localhost:2293/api/AdminGroupPolicy/GetGroupPolicyEmployee',
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
  
    getAssignedPolicyEmpCount(policyid:number):Observable<any>{
      const requestBody = {
        
        policyId:policyid
        
      };
      return this.http.post(`${this.apiUrl}/GetPolicyCount`, requestBody);
    }

    UploadExcel(formData:FormData):Observable<any>{
      return this.http.post(`${this.apiUrl}/UploadGroupPolicyEmployeesFromExcel`, formData);
    }
    getAssignedPolicies(policyId: number = 0, companyId?: number): Observable<any> {
  const body: any = {
    pageNo: 0,
    pageSize: 0,
    policyId: policyId,
    companyId: companyId ?? 0  // Send 0 if no companyId is specified
  };

  return this.http.post(
    `${this.apiUrl}/GetAsignGroupPolicy`,
    body
  );
}


    assignGroupPolicy(data: any): Observable<any> {
      console.log("policy data",data);
  return this.http.post(`${this.apiUrl}/AddAsignGroupPolicy`, data);
}

getGroupPolicyByHr(hrId: number = 0): Observable<any> {
  const body = {
    pageNo: 0,
    pageSize: 0,
    HrId: hrId
  };

  return this.http.post(`${this.apiUrl}/GetGroupPolicyHr`, body);
}


    //employee list
    getAllEmployees():Observable<any>{
      const requestBody = {
        pageNo: 0,
        pageSize: 0,
        
      };
      return this.http.post(`${this.apiUrl}/GetGroupPolicyEmployee`, requestBody);
    }
    getAllEmployeescount(CompanyId:number):Observable<any>{
      const requestBody = {
        pageNo: 0,
        pageSize: 0,
        CompanyId:CompanyId
      };
      return this.http.post(`${this.apiUrl}/GetGroupPolicyEmployee`, requestBody);
    }
    

     getEmp(id:any):Observable<any>{
      const requestBody = {
        pageNo: 0,
        pageSize: 0,
        EmpId:id
        
      };
      return this.http.post(`${this.apiUrl}/GetGroupPolicyEmployee`, requestBody);
    }

      //policylist
    getAllPolicies(): Observable<any>{
       const requestBody = {
        pageNo: 0,
        pageSize: 0,
        
      };
        return this.http.post(`${this.apiUrl}/GetGroupPolicy`, requestBody);

    }

    saveOrUpdateHr(hrData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/AddGroupPolicyHr`, hrData).pipe(
    catchError((error) => {
      console.error(hrData.hrId && hrData.hrId > 0 ? 'Error updating HR:' : 'Error creating HR:', error);
      return throwError(() =>
        new Error(hrData.hrId && hrData.hrId > 0 ? 'Failed to update HR' : 'Failed to create HR')
      );
    })
  );
}

saveOrUpdateCompany(companyData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/AddGroupPolicyCompany`, companyData).pipe(
      catchError((error) => {
        console.error('Company save/update error:', error);
        return throwError(() => new Error('Failed to save or update company'));
      })
    );
  }


    getInsurer(): Observable<any[]> {
      const requestBody = {
        pageNo: 1,
        pageSize: 30,
      };
      return this.http.post<any>(this.insurerUrl, requestBody).pipe(
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

      getEnrollment(id:any): Observable<any>{
       const requestBody = {
        pageNo: 0,
        pageSize: 0,
        EmpId:id
        
      };
        return this.http.post(`${this.apiUrl}/GetGroupPolicyEnrollment`, requestBody);

    }

    //AddGroupPolicyEmployee
    SaveEmployee(formdata:any)
    {
      return this.http.post(`${this.apiUrl}/AddGroupPolicyEmployee`, formdata).pipe(
      catchError((error) => {
        console.error('AddGroupPolicyEmployee save/update error:', error);
        return throwError(() => new Error('Failed to save or update AddGroupPolicyEmployee'));
      })
    );
    }
  
SaveEnrollment(data:any)
{
  
  return this.http.post(`${this.apiUrl}/AddGroupPolicyEnrollment`, data).pipe(
      catchError((error) => {
        console.error('AddGroupPolicyEnrollment save/update error:', error);
        return throwError(() => new Error('Failed to save or update AddGroupPolicyEnrollment'));
      })
    );
    }

    getCompany(id:any):Observable<any>{
      
      const requestBody = {
        pageNo: 0,
        pageSize: 0,
        CompanyId:id
      };
      return this.http.post(`${this.apiUrl}/GetCompanyDetails`, requestBody);
    }
//GetGroupPolicyDetail    
getGroupPolicyDetail(id:any):Observable<any>{
  const requestBody = {
    pageNo: 0,
    pageSize: 0,
    GrPolicyId:id
  };
  return this.http.post(`${this.apiUrl}/GetGroupPolicyDetail`, requestBody);
}
}



