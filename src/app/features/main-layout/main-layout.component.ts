import { Component } from '@angular/core';
import { authService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { ElementRef, ViewChild } from '@angular/core';
import { LeadService } from '../main/leads/lead.service';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  isSettingsOpen: boolean=false;
  isIntimationOpen: boolean=false;
    followUpNotifications: any[] = [];
  notifications: any[]=[];
  newLeadNotifications: any[]=[];
  notificationCount: any;
    loginId: any;
  showNotificationPanel: boolean=false;
  constructor(private authService: authService, private router: Router,private leadservice : LeadService) {}
  userName: string | null = '';
  employees: any[] = [];
   showCards: boolean = false; 
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  canDelete: any;
  canWrite: any;
  canRead: any;
  isSidebarOpen = false;
  isMasterOpen = false;
  isReportsOpen = false;
  isClaimsOpen = false;
  isUseAcessOpen = false;
  isDropdownOpen = false;
  activeLink: string = '';
  showMaster: boolean = false;
  showMasterModule = false;
  productModule = false;
  policiesModule = false;
  claimsModule = false;
  reportsModule = false;
  useraccesspermission = false;


  ngOnInit(): void {
    this.userName = localStorage.getItem('token');
    const permissions = JSON.parse(localStorage.getItem('modulePermissions') || '[]');
    console.log("permission from mainlayout is ", permissions)
    this.loginId = localStorage.getItem('UserId');
    const masterPermission = permissions.find((p: any) => p.ModuleName === 'master');
    const productPermission = permissions.find((p: any) => p.ModuleName === 'product');
    const policiesPermission = permissions.find((p: any) => p.ModuleName === 'policies');
    const claimsPermission = permissions.find((p: any) => p.ModuleName === 'claims');
    const reportPermission = permissions.find((p: any) => p.ModuleName === 'reports');
    const grouppolicyPermission = permissions.find((p: any) => p.ModuleName === 'grouppolicy');
    

      if (masterPermission && (masterPermission.CanRead || masterPermission.CanWrite || masterPermission.CanDelete)) {
      this.showMasterModule = true;
    }
       if (productPermission && (productPermission.CanRead || productPermission.CanWrite || productPermission.CanDelete)) {
      this.productModule = true;
    }

     if (policiesPermission && (policiesPermission.CanRead || policiesPermission.CanWrite || policiesPermission.CanDelete)) {
      this.policiesModule = true;
    }

    console.log("claim permission is ",claimsPermission)
    if (claimsPermission && (claimsPermission.CanRead || claimsPermission.CanWrite || claimsPermission.CanDelete)) {
        console.log("inside claims if")
      this.claimsModule = true;
      console.log("claim false or true ",this.claimsModule)
    }

    if (reportPermission && (reportPermission.CanRead || reportPermission.CanWrite || reportPermission.CanDelete)) {
      this.reportsModule = true;
    }


    if (masterPermission && (masterPermission.CanRead && masterPermission.CanWrite && masterPermission.CanDelete)) {
      this.useraccesspermission = true;
    }

this.Notification();
  this.showNotificationPanel = true;
    console.log('name is ', this.userName);
    this.setActiveLink(this.activeLink);
    this.checkPermissions();
    this.loadEmployees();
  }

  onMouseEnter() {
    this.isSettingsOpen = true;
  }
   onMouseLeave() {
    this.isSettingsOpen = false;
  }
  showIntimationView(view: 'list' | 'new') {
  this.router.navigate(['/ClaimIntimation', view]);
  this.isIntimationOpen = false;
}
onIntimationMouseEnter() {
  this.isIntimationOpen = true;
}
onIntimationMouseLeave() {
  this.isIntimationOpen=false;
}

onIntimationDropdownClick(event: Event) {
  event.stopPropagation();
}

toggleIntimationDropdown() {
  this.isIntimationOpen = !this.isIntimationOpen;
  if (this.isIntimationOpen) {
    this.isSettingsOpen = false;
  }
}


 navigateToRoute(route: string): void {
  switch(route) {
    case 'AddInsuranceCompany':
      this.router.navigate(['/ClaimmasterDatamanagement/insurance-companies']);
      break;
    case 'AddDocumentType':
      this.router.navigate(['/ClaimmasterDatamanagement/document-types']);
      break;
    case 'AddClaimType':
      this.router.navigate(['/ClaimmasterDatamanagement/claim-types']);
      break;
    case 'AddClaimStatus':
      this.router.navigate(['/ClaimmasterDatamanagement/claim-statuses']);
      break;
    case 'InsurerContact':
      this.router.navigate(['/ClaimInsurerContact']);
      break;
    case 'UserManagement':
      this.router.navigate(['/user-management']); // Update with your actual route
      break;
    case 'SystemSettings':
      this.router.navigate(['/system-settings']); // Update with your actual route
      break;
    case 'IntimationRule':
      this.router.navigate(['/ClaimmasterDatamanagement/intimation-rule']);
      break;
    default:
      console.warn('Unknown route:', route);
  }
  
  // Close dropdown after navigation
  this.isSettingsOpen = false;
}
toggleSettingsDropdown() {
  this.isSettingsOpen = !this.isSettingsOpen;
  // Close intimation dropdown when settings is opened
  if (this.isSettingsOpen) {
    this.isIntimationOpen = false;
  }
}

  onDropdownClick(event: Event) {
    event.stopPropagation();
  }

  Notification() {
    // Reset notifications
    this.notifications = [];
    this.newLeadNotifications = [];
    this.followUpNotifications = [];
    this.notificationCount = 0;

    // Get pending follow-up reminders
    this.leadservice
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
    this.leadservice
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
    // setTimeout(() => {
    //   this.showNotificationPanel = true;
    // }, 500);
  }
 
  toggleNotificationPanel() {
  this.showNotificationPanel = !this.showNotificationPanel;
}
markAllAsRead() {
  this.notifications = [];
  this.notificationCount = 0;
  this.newLeadNotifications = [];
  this.followUpNotifications = [];
}

closeNotificationPanel() {
  this.showNotificationPanel = false;
}
getAllNotificationItems(): any[] {
  return this.notifications?.flatMap(notification => notification.data || []) || [];
}

 viewLeadFromNotification(leadId: number) {
    this.viewLead(leadId);
    this.closeNotificationPanel();
  }
   viewLead(id: any) {
    this.router.navigate(['/leadview', id]);
    console.log('leadid is ', id);
  }

 updateNotificationCount() {
  this.notificationCount = this.notifications.reduce(
    (total, notification) => {
      return total + notification.count;
    },
    0
  );
  
  // Automatically show panel when notifications are loaded and count > 0
  if (this.notificationCount > 0) {
    this.showNotificationPanel = true;
  }
}

   DownloadLeadReport(filterType: any) {
    this.leadservice.downloadLeadReport(filterType).subscribe({
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
  

  setActiveLink(link: string) {
    this.activeLink = link;
    sessionStorage.setItem('activeLink', link);
    console.log('activeLink is ', this.activeLink);
  }
  checkPermissions() {
   this.canRead = localStorage.getItem('canread') === 'true';
   this.canWrite = localStorage.getItem('canwrite') === 'true';
   this.canDelete = localStorage.getItem('candelete') === 'true';

    this.showMaster = this.canRead && this.canWrite && this.canDelete;
    
}
  handleClickOutside(event: MouseEvent): void {
    const clickedInside = this.dropdownMenu?.nativeElement.contains(
      event.target
    );
    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown() {
    this.userName = localStorage.getItem('token');
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirect to login page
  }
  toggleSidebar() {
   this.isSidebarOpen = !this.isSidebarOpen;
   //this.isSidebarOpen = false;
  }

  loadEmployees(): void {
  this.authService.getEmployees().subscribe({
    next: (res: any[]) => {
      console.log('API response:', res);

      // Filter only employees with rolemasterid 119
      this.employees = res.filter(emp => emp.rolemasterid === 119);
      if(this.employees){
        this.showCards=true;
         console.log("inside if",this.showCards)
      }
      else{
        this.showCards=false;
        console.log("inside else",this.showCards)
      }
      console.log("Filtered employees:", this.employees);
    },
    error: (err) => {
      console.error('Error fetching employees:', err);
    }
  });
}
}
