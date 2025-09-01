import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private apiUrl = 'https://apiwp.troth.co.in/api/AdminLead';
  private getEmployee = 'https://apiwp.troth.co.in/api/AdminAccess/GetAdmin';

  constructor(private http: HttpClient) {}

  // 1. Get Leads (with pagination)
  // getLeads(payload: any): Observable<any> {
  //   console.log('payload is ', payload.AssignedToUserId);
  //   const requestBody = {
  //     pageNo: payload.PageNo,
  //     pageSize: payload.PageSize,
  //     Status: payload.Status,
  //     Source: payload.Source,
  //     Search: payload.Search,
  //     categoryName: payload.Category,
  //     AssignedToUserId: payload.AssignedToUserId,
  //     Phone: payload.Phone, // search by phone
  //     Name: payload.Name,   // search by name
  //   };
  //   return this.http.post(`${this.apiUrl}/GetLeads`, requestBody);
  // }

   getAllLeadsLog(): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0
    };
    return this.http.post<any>(`${this.apiUrl}/GetAllLeadsLog`, requestBody);
  }

  getLeads(payload: any): Observable<any> {
    console.log('payload is ', payload.AssignedToUserId);
    
    const requestBody = {
      LeadId: payload.LeadId || null,
      Search: payload.Search || '',
      Status: payload.Status || '',
      Source: payload.Source || '',
      PageNo: payload.PageNo || 1,
      PageSize: payload.PageSize || 20,
      AssignedToUserId: payload.AssignedToUserId || null,
      CategoryName: payload.CategoryName || ''
    };
    
    console.log('Final request body:', requestBody);
    return this.http.post(`${this.apiUrl}/GetLeads`, requestBody);
}

  updateLead(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/UpdateLead`, { leadReqDto: payload });
  }

  getLeadById(leadId: number): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
      LeadId: leadId,
    };
    return this.http.post<any>(`${this.apiUrl}/GetLeads`, requestBody);
  }

  getEmp(): Observable<any> {
    const requestBody = {
      pageNo: 0,
      pageSize: 0,
    };
    return this.http.post<any>(`${this.getEmployee}`, requestBody);
  }

  syncData(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sync-zoho-leads`, {});
  }

  getCat(): Observable<any> {
    const requestBody = {
      categoryId: 0,
      categoryName: '',
    };
    return this.http.post<any>(`${this.apiUrl}/GetCategories`, requestBody);
  }

  // 2. Add or Update Lead
  saveLead(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/AddLead`, data);
  }

  // 3. Get FollowUps by LeadId (with pagination)
  getFollowUps(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/GetFollowUps`, data);
  }

  // 4. Add FollowUp
  addFollowUp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/AddFollowUp`, data);
  }

  // 5. Get Dashboard Stats
  getDashboardStats(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/GetDashboardStats`, data);
  }

  // 6. Weekly Report
  getWeeklyReport(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/GetWeeklyReport`, data);
  }

  // 7. Source-Wise Report
  getSourceWiseReport(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/GetSourceWiseReport`, data);
  }

  // 8. User-Wise Report
  getUserWiseReport(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/GetUserWiseReport`, data);
  }

  // 9. Sync Zoho Leads
  syncZohoLeads(): Observable<any> {
    return this.http.get(`${this.apiUrl}/SyncZohoLeads`);
  }

  //
  updateLeadStatus(payload: any) {
    return this.http.post(`${this.apiUrl}/UpdateStatus`, payload);
  }
  //
  assignLeadToEmployee(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ReassignLead`, {
      LeadId: payload.LeadId,
      AssignedToUserId: payload.AssignedToUserId,
      UpdatedBy: payload.UpdatedBy,
    });
  }

  assignTeamLead(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/UpdateTeamLead`, {
      UserAdminId: payload.UserAdminId,
      UpdatedBy: payload.UpdatedBy,
      isTeamLead: true,
    });
  }

  downloadLeadReport(filterType: string = 'MONTH'): Observable<Blob> {
    const payload = { FilterType: filterType };
    return this.http.post(`${this.apiUrl}/DownloadLeadReportExcel`, payload, {
      responseType: 'blob',
    });
  }

  getNotificactionForNewLead(loginid: any) {
    return this.http.post(
      `${this.apiUrl}/NewAfter24HoursReminder`,

      { EmpId: loginid }
    );
  }

  LeadPendingFollowUpReminder(loginid: any) {
    return this.http.post(`${this.apiUrl}/LeadPendingFollowUpReminder`, {
      EmpId: loginid,
    });
  }
}
