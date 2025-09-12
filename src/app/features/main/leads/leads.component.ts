import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { LeadService } from './lead.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-leads',
  standalone: false,
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss',
})
export class LeadsComponent {
  leads: any[] = [];
  allLeadsLog: any[] = [];
  allLeads: any[] = [];
  filteredLeads: any[] = [];
  leadCategories: any[] = [];
  private searchDebounceHandle: any;
  showNotificationPanel = false;
  notificationCount = 0;
  notifications: any[] = [];
  newLeadNotifications: any[] = [];
  followUpNotifications: any[] = [];
  isAdmin: boolean = false;
  isTeamLead = false;
  pageNo: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  filters = {
    search: '',
    status: '',
    source: '',
    category: '',
    assignedToUserId: '',
    pageNo: 1,
    pageSize: 20,
    phone: '', // <-- legacy, not used anymore
  };
  statusOptions = [
    'New',
    'Qualified',
    'Unqualified',
    'In Progress',
    'Attempted To Contact',
    'Contact In Future',
    'Contacted',
    'Not Contacted',
    'In Progress',
    'Junk Lead',
    'Lost Lead',
    'Converted',
    'Dropped',
  ];
  sourceOptions = [
    'Manual',
    'Call',
    'Mobile',
    'GetQuotes',
    'Advertisement',
    'Cold Call',
    'Online Store',
    'External Referral',
    'Partner',
    'Seminar Partner',
    'Web Download',
    'Chat',
  ];
  CategoryOption = [
    'Fire',
    'Business Insurance',
    'Top-Up Claim',
    'Critical Illness',
    'Saving Plan',
    'Term Life',
    'Property',
    'Travel',
  ];
  users: any[] = []; // fetched from API
  loginId: any;
  constructor(private leadService: LeadService, private router: Router) { }
  ngOnInit(): void {
    this.loginId = localStorage.getItem('UserId');
    console.log('Login Id in ngOnInit: ', this.loginId);
    this.fetchLeads();
    this.fetchUsers();
    this.leadService.syncData();
    this.fetchAllLeadsLog();
    this.loadLeadCategories();
    this.Notification();
   

    console.log('Login Id is ', this.loginId);
  }
  editLead(id: number) {
    this.router.navigate(['/editlead', id]);
  }

  loadLeadCategories(): void {
    this.leadService.getAllLeadcategories().subscribe({
      next: (res) => {
        if (res) {
          this.leadCategories = res.responseData ? JSON.parse(res.responseData) : [];
          console.log('Lead Categories:', this.leadCategories);
        } else {
          console.error('Failed to fetch lead categories:', res.message);
        }
      },
      error: (err) => {
        console.error('API error while fetching lead categories:', err);
      }
    });
  }

  // Add this method to your LeadsComponent class
  markAllAsRead() {
    this.notifications = [];
    this.notificationCount = 0;
    this.newLeadNotifications = [];
    this.followUpNotifications = [];
  }

  fetchUsers(): void {
    this.leadService.getEmp().subscribe((res: any) => {
      this.users = JSON.parse(res.responseData || '[]').filter(
        (u: any) => u.IsEmployee
      );
    });
  }
  fetchLeads(): void {
    console.log('filter is ', this.filters.search);

    const id = localStorage.getItem('UserId');
    const companyid = localStorage.getItem('companyid');
    const isteamlead = localStorage.getItem('isteamlead') === 'true';
    this.isTeamLead = isteamlead;

    console.log('teamlead ', this.isTeamLead);
    console.log('company id is ', companyid);
    console.log('id is ', id);
    console.log('isteamlead is ', isteamlead);

    if (companyid === '0') {
      this.isAdmin = true;
    }

    const isSearching = !!(this.filters.search && this.filters.search.trim());
    const effectivePageNo = isSearching ? 1 : this.pageNo;
    // Use a large page size during search to get all matches from server
    const effectivePageSize = isSearching ? 10000 : this.pageSize;

    const payload: any = {
      PageNo: effectivePageNo,
      PageSize: effectivePageSize,
      Status: this.filters.status,
      Source: this.filters.source,
      CategoryName: this.filters.category,
      Search: this.filters.search || '',
    };

    console.log('payload is ', payload);

    if (companyid !== '0' && !this.isTeamLead) {
      console.log('inside if');
      payload.AssignedToUserId = id;
    }

    console.log('payload from fetchLeads ', payload);

    this.leadService.getLeads(payload).subscribe((res: any) => {
     

      if (res?.responseData) {
        this.leads = JSON.parse(res.responseData);
        this.allLeads = this.leads;
        this.totalCount = isSearching ? this.leads.length : (res?.totalCount || 0);
      } else {
        this.leads = [];
        this.allLeads = [];
        this.totalCount = 0;
      }
      this.applySearchFilter();
    }, (error) => {
      console.error('Error fetching leads:', error);
      this.leads = [];
      this.allLeads = [];
      this.totalCount = 0;
    });
  }
  viewLead(id: any) {
    this.router.navigate(['/leadview', id]);
    console.log('leadid is ', id);
  }

  addLead() {
    this.router.navigate(['/addview']);
  }
  settingead() {
    this.router.navigate(['setting']);
  }
  dashBoard() {
    this.router.navigate(['dashboard']);
  }

  assignLead(lead: any): void {
    if (!lead.AssignedToUserId) {
      alert('Please select an employee to assign.');
      return;
    }

    const payload = {
      LeadId: lead.LeadId,
      AssignedToUserId: lead.AssignedToUserId,
      UpdatedBy: localStorage.getItem('UserId') || 999, // adjust accordingly
    };

    this.leadService.assignLeadToEmployee(payload).subscribe((res: any) => {
      if (res?.status === 'success' || res?.Status === '200') {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Lead Assigned Successfully',
          confirmButtonColor: '#3085d6'
        });
        this.fetchLeads(); // reload list
      } else {
        alert('Assignment failed: ' + res.message);
      }
    });
  }
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  changePage(direction: number): void {
    const isSearching = !!(this.filters.search && this.filters.search.trim());
    if (isSearching) {
      // Ignore pagination while searching
      return;
    }
    const newPage = this.pageNo + direction;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNo = newPage;
      this.fetchLeads();
    }
  }

  // Unified search handler (name or phone)
  onSearchChange() {
    this.pageNo = 1;
    this.applySearchFilter();
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }
    this.searchDebounceHandle = setTimeout(() => {
      this.fetchLeads();
    }, 300);
  }

  // Backward compatibility for old template bindings
  onPhoneSearch() {
    this.filters.search = this.filters.phone || '';
    this.onSearchChange();
  }

  private applySearchFilter() {
    const term = (this.filters.search || '').toString().toLowerCase().trim();
    if (!term) {
      this.filteredLeads = [...this.allLeads];
      return;
    }
    const digits = term.replace(/\D/g, '');
    this.filteredLeads = this.allLeads.filter((lead: any) => {
      const name = (lead?.Name || '').toString().toLowerCase();
      const phone = (lead?.Phone || '').toString();
      return (
        (name && name.includes(term)) ||
        (digits && phone && phone.includes(digits))
      );
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';

    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  DownloadLeadReport(filterType: any) {
    this.leadService.downloadLeadReport(filterType).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:-]/g, '');
        link.download = `LeadReport_${filterType}_${timestamp}.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Download failed:', error);
        alert('Failed to download report. Please try again.');
      },
    });
  }

  Notification() {
    console.log('🔔 Notification called for:', this.loginId);
    // Reset notifications
    this.notifications = [];
    this.newLeadNotifications = [];
    this.followUpNotifications = [];
    this.notificationCount = 0;

    // Get pending follow-up reminders
    this.leadService
      .LeadPendingFollowUpReminder(this.loginId)
      .subscribe((res: any) => {
        console.log('LeadPendingFollowUpReminder', res);
        if (res.status === 'success' && res.totalCount > 0) {
          this.followUpNotifications = JSON.parse(res.responseData);
          this.notifications.push({
            type: 'followUp',
            title: 'Pending Follow-ups',
            count: res.totalCount,
            message: res.message,
            data: this.followUpNotifications,
            icon: 'fa-clock',
            color: 'text-orange-600',
          });
        }
        this.updateNotificationCount();
      });

    // Get new lead notifications
    this.leadService
      .getNotificactionForNewLead(this.loginId)
      .subscribe((res: any) => {
        console.log('getNotificactionForNewLead', res);
        if (res.status === 'success' && res.totalCount > 0) {
          this.newLeadNotifications = JSON.parse(res.responseData);
          this.notifications.push({
            type: 'newLead',
            title: 'New Leads (>24 hours)',
            count: res.totalCount,
            message: res.message,
            data: this.newLeadNotifications,
            icon: 'fa-exclamation-triangle',
            color: 'text-red-600',
          });
        }
        this.updateNotificationCount();
      });

    // Show notification panel after fetching data
    setTimeout(() => {
      this.showNotificationPanel = true;
    }, 500);
  }

  updateNotificationCount() {
    this.notificationCount = this.notifications.reduce(
      (total, notification) => {
        return total + notification.count;
      },
      0
    );
  }

  closeNotificationPanel() {
    this.showNotificationPanel = false;
  }

  viewLeadFromNotification(leadId: number) {
    this.viewLead(leadId);
    this.closeNotificationPanel();
  }

  markNotificationAsRead(notificationType: string) {
    this.notifications = this.notifications.filter(
      (n) => n.type !== notificationType
    );
    this.updateNotificationCount();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNo = page;
      this.fetchLeads();
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.pageNo;
    const maxButtons = 5;
    const pages: number[] = [];

    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  fetchAllLeadsLog(): void {
    this.leadService.getAllLeadsLog().subscribe({
      next: (res) => {
        this.allLeadsLog = res?.responseData ? JSON.parse(res.responseData) : [];
        console.log("alleadslog", this.allLeadsLog)
      },
      error: (err) => {
        console.error('Error fetching leads log:', err);
        this.allLeadsLog = [];
      }
    });
  }

}

// https://apiwp.troth.co.in
// policy.WithOrigins('https://mobileadmin.troth.co.in')
