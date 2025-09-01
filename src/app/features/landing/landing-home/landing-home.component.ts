import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-landing-home',
  templateUrl: './landing-home.component.html',
  standalone:false,
  styleUrls: ['./landing-home.component.scss'],
})
export class LandingHomeComponent {
 
userRole: string = ''; // or string[] if you expect multiple roles
isAdmin: boolean = false;

  totalVehicleCount: number | null = null;
  animatedVehicleCount: number = 0;

  totalFamilyMemberCount: number | null = null;
  animatedFamilyMemberCount: number = 0;

  totalNomineeCount: number | null = null;
  animatedNomineeCount: number = 0;

  totalOnHoldClaimCount: number | null = null; 
  animatedOnHoldClaimCount: number = 0; 

  totalInProgressClaimCount: number | null = null; 
  animatedInProgressClaimCount: number = 0; 

  totalTodaysPendingClaimCount: number | null = null; 
  animatedTodaysPendingClaimCount: number = 0; 

  totalTodaysInProgressClaimCount: number | null = null; 
  animatedTodaysInProgressClaimCount: number = 0; 

  totalTodaysOnHoldClaimCount: number | null = null; 
  animatedTodaysOnHoldClaimCount: number = 0; 

  totalCompletedClaimCount: number | null = null; 
  animatedCompletedClaimCount: number = 0; 

  totalTodaysCompletedClaimCount: number | null = null; 
  animatedTodaysCompletedClaimCount: number = 0; 

  
  totalTodaysRejectedClaimCount: number | null = null; 
  animatedTodaysRejectedClaimCount: number = 0; 

  totalRejectedClaimCount: number | null = null; 
  animatedRejectedClaimCount: number = 0; 

  totalPendingClaimCount: number | null = null; 
  animatedPendingClaimCount: number = 0; 

  errorMessage: string | null = null;

  totalUser: number | null = null;
  animatedtotalUser: number = 0;

  totalSubmittedClaimCount: number | null = null; 
  animatedSubmittedClaimCount: number = 0; 

  totalTodaysSubmittedClaimCount: number | null = null; 
  animatedTodaysSubmittedClaimCount: number = 0; 

  totalClaimCount: number | null = null; 
  animatedClaimCount: number = 0; 

  claimList: any[] = []; 

  animatedTodayClaimCount: number = 0; 
  animatedTodayUserCount: number = 0; 
 showCards: boolean = false; 
  userList: any[] = []; 
  isLoading = false;
  userId: string | null = localStorage.getItem('UserId');
employees: any[] = [];
  constructor(
    private authService: authService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
      this.loadEmployees();
    this.fetchTotalVehicleCount();
    this.fetchTotalFamilyMemebrCount();
    this.fetchTotalNomineeCount();
    this.fetchTotalClaimCount();
    this.fetchTotalCompletedClaimCount();
    this.fetchTotalRejectedClaimCount();
    this.fetchTotalPendingClaimCount();
    this.fetchTotalOnHoldClaimCount();
    this.fetchTotalInProgressClaimCount();
    this.fetchTotalTodaysCompletedClaimCount();
    this.fetchTotalTodaysRejectedClaimCount();
    this.fetchTotalTodaysPendingClaimCount();
    this.fetchTotalTodaysOnHoldClaimCount();
    this.fetchTotalTodaysInProgressClaimCount();
    this.fetchTotalSubmittedClaimCount();
    this.fetchTotalTodaysSubmittedClaimCount();
    this.loadUsers();
    this.logAllClaimCounts();
  
  }

  get shouldShowCards(): boolean {
  return this.employees.some(emp => emp.rolemasterid == 119);
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






  goToUsers(): void {
    console.log("inside go user");
    this.router.navigate(['/users']);
  }

  goToClaims(): void {
    console.log("inside go Claim");
    this.router.navigate(['/Claims']);
  }

  animateCount(target: number, property: 'animatedVehicleCount' | 'animatedFamilyMemberCount' | 'animatedNomineeCount' | 'animatedtotalUser' | 'animatedTodayUserCount' | 'animatedClaimCount' | 'animatedTodayClaimCount' | 'animatedCompletedClaimCount' 
    | 'animatedRejectedClaimCount' | 'animatedPendingClaimCount' | 'animatedOnHoldClaimCount'| 
    'animatedInProgressClaimCount' | 'animatedTodaysCompletedClaimCount' | 'animatedTodaysRejectedClaimCount'
    | 'animatedTodaysPendingClaimCount' | 'animatedTodaysOnHoldClaimCount'  
    | 'animatedTodaysInProgressClaimCount' | 'animatedSubmittedClaimCount' | 'animatedTodaysSubmittedClaimCount') {
    if (!target || isNaN(target)) {
      (this as any)[property] = 0;
      return;
    }

    let current = 0;
    const duration = 1000; // total duration in ms
    const steps = 30;
    const increment = target / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        (this as any)[property] = target;
        clearInterval(timer);
      } else {
        (this as any)[property] = Math.floor(current);
      }
      this.cdr.detectChanges(); // Ensure UI updates during animation
    }, interval);
  }

  fetchTotalVehicleCount(): void {
    const safeUserId = this.userId || '';
    this.authService.getTotalVehicleCount(safeUserId).subscribe({
      next: (count: any) => {
        const parsed = JSON.parse(count);
        const vehicleCount = Number(parsed[0].TotalVehicles) || 0;
        this.totalVehicleCount = vehicleCount;
        this.animateCount(vehicleCount, 'animatedVehicleCount');
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch vehicle count. Please try again later.';
        this.totalVehicleCount = null;
        console.error(error);
      }
    });
  }

  fetchTotalFamilyMemebrCount(): void {
    const safeUserId = this.userId || '';
    this.authService.getTotalFamilyMemebrCount(safeUserId).subscribe({
      next: (count: any) => {
        const parsed = JSON.parse(count);
        const familyCount = Number(parsed[0].TotalFamilyMembers) || 0;
        this.totalFamilyMemberCount = familyCount;
        this.animateCount(familyCount, 'animatedFamilyMemberCount');
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch family member count. Please try again later.';
        this.totalFamilyMemberCount = null;
        console.error(error);
      }
    });
  }

  fetchTotalNomineeCount(): void {
    const safeUserId = this.userId || '';
    this.authService.getTotalNomineeCount(safeUserId).subscribe({
      next: (count: any) => {
        const parsed = JSON.parse(count);
        const nomineeCount = Number(parsed[0].TotalNominees) || 0;
        this.totalNomineeCount = nomineeCount;
        this.animateCount(nomineeCount, 'animatedNomineeCount');
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch nominee count. Please try again later.';
        this.totalNomineeCount = null;
        console.error(error);
      }
    });
  }

  fetchTotalClaimCount(): void {
   
    this.authService.getTotalClaims().subscribe({
      next: (res: any) => {
       
        const claimCount = Number(res.totalCount) || 0;
        this.claimList = res.claims || []; // Store all claims
      

        // Filter claims created within the last 24 hours
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const todayClaims = this.claimList.filter((claim: any) => {
          const createdDate = new Date(claim.DateCreated);
          return createdDate >= oneDayAgo && createdDate <= now;
        });
        const todayClaimCount = todayClaims.length;
  

        this.totalClaimCount = claimCount;
        this.animateCount(claimCount, 'animatedClaimCount');
        this.animateCount(todayClaimCount, 'animatedTodayClaimCount'); // Animate today’s claims
       
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch claim count. Please try again later.';
        this.totalClaimCount = null;
        this.claimList = [];
        this.animatedTodayClaimCount = 0; // Reset today’s claim count on error
      
        this.cdr.detectChanges();
      },
      complete: () => {
     
      }
    });
  }

  fetchTotalCompletedClaimCount(): void {
    console.log('Fetching total completed claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const completedStatusId = 5; 
        const completedClaims = (claims.claims || []).filter(
          (claim: any) => claim.ClaimStatusId === completedStatusId
        );
        const completedClaimCount = completedClaims.length;
  
        console.log('Completed claims:', completedClaims);
        console.log('Total completed claim count:', completedClaimCount);
  
        this.totalCompletedClaimCount = completedClaimCount;
        this.animateCount(completedClaimCount, 'animatedCompletedClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch completed claim count. Please try again later.';
        this.totalCompletedClaimCount = null;
        this.animatedCompletedClaimCount = 0;
        console.error('Error fetching completed claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalCompletedClaimCount completed');
      }
    });
  }

  fetchTotalTodaysCompletedClaimCount(): void {
    console.log('Fetching total today’s completed claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const completedStatusId = 5;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const todaysCompletedClaims = (claims.claims || []).filter(
          (claim: any) => {
            const createdDate = new Date(claim.DateCreated);
            return claim.ClaimStatusId === completedStatusId && createdDate >= oneDayAgo && createdDate <= now;
          }
        );
        const todaysCompletedClaimCount = todaysCompletedClaims.length;

        console.log('Today’s completed claims:', todaysCompletedClaims);
        console.log('Total today’s completed claim count:', todaysCompletedClaimCount);

        this.totalTodaysCompletedClaimCount = todaysCompletedClaimCount;
        this.animateCount(todaysCompletedClaimCount, 'animatedTodaysCompletedClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch today’s completed claim count. Please try again later.';
        this.totalTodaysCompletedClaimCount = null;
        this.animatedTodaysCompletedClaimCount = 0;
        console.error('Error fetching today’s completed claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalTodaysCompletedClaimCount completed');
      }
    });
  }

  fetchTotalInProgressClaimCount(): void {
    console.log('Fetching total in-progress claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const inProgressStatusId = 3; // Replace with actual ClaimStatusId for "In-Progress"
        const inProgressClaims = (claims.claims || []).filter(
          (claim: any) => claim.ClaimStatusId === inProgressStatusId
        );
        const inProgressClaimCount = inProgressClaims.length;

        console.log('In-Progress claims:', inProgressClaims);
        console.log('Total in-progress claim count:', inProgressClaimCount);

        this.totalInProgressClaimCount = inProgressClaimCount;
        this.animateCount(inProgressClaimCount, 'animatedInProgressClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch in-progress claim count. Please try again later.';
        this.totalInProgressClaimCount = null;
        this.animatedInProgressClaimCount = 0;
        console.error('Error fetching in-progress claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalInProgressClaimCount completed');
      }
    });
  }

  fetchTotalRejectedClaimCount(): void {
    console.log('Fetching total rejected claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const rejectedStatusId = 9; 
        const rejectedClaims = (claims.claims || []).filter(
          (claim: any) => claim.ClaimStatusId === rejectedStatusId
        );
        const rejectedClaimCount = rejectedClaims.length;

        console.log('Rejected claims:', rejectedClaims);
        console.log('Total rejected claim count:', rejectedClaimCount);

        this.totalRejectedClaimCount = rejectedClaimCount;
        this.animateCount(rejectedClaimCount, 'animatedRejectedClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch rejected claim count. Please try again later.';
        this.totalRejectedClaimCount = null;
        this.animatedRejectedClaimCount = 0;
        console.error('Error fetching rejected claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalRejectedClaimCount completed');
      }
    });
  }

  
  fetchTotalOnHoldClaimCount(): void {
    console.log('Fetching total on-hold claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const onHoldStatusId = 10; // Replace with actual ClaimStatusId for "On-Hold"
        const onHoldClaims = (claims.claims || []).filter(
          (claim: any) => claim.ClaimStatusId === onHoldStatusId
        );
        const onHoldClaimCount = onHoldClaims.length;

        console.log('On-Hold claims:', onHoldClaims);
        console.log('Total on-hold claim count:', onHoldClaimCount);

        this.totalOnHoldClaimCount = onHoldClaimCount;
        this.animateCount(onHoldClaimCount, 'animatedOnHoldClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch on-hold claim count. Please try again later.';
        this.totalOnHoldClaimCount = null;
        this.animatedOnHoldClaimCount = 0;
        console.error('Error fetching on-hold claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalOnHoldClaimCount completed');
      }
    });
  }

  fetchTotalPendingClaimCount(): void {
    console.log('Fetching total pending claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const pendingStatusId = 1; // Replace with actual ClaimStatusId for "Pending"
        const pendingClaims = (claims.claims || []).filter(
          (claim: any) => claim.ClaimStatusId === pendingStatusId
        );
        const pendingClaimCount = pendingClaims.length;

        console.log('Pending claims:', pendingClaims);
        console.log('Total pending claim count:', pendingClaimCount);

        this.totalPendingClaimCount = pendingClaimCount;
        this.animateCount(pendingClaimCount, 'animatedPendingClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch pending claim count. Please try again later.';
        this.totalPendingClaimCount = null;
        this.animatedPendingClaimCount = 0;
        console.error('Error fetching pending claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalPendingClaimCount completed');
      }
    });
  }

  fetchTotalTodaysRejectedClaimCount(): void {
    console.log('Fetching total today’s rejected claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const rejectedStatusId = 9;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const todaysRejectedClaims = (claims.claims || []).filter(
          (claim: any) => {
            const createdDate = new Date(claim.DateCreated);
            return claim.ClaimStatusId === rejectedStatusId && createdDate >= oneDayAgo && createdDate <= now;
          }
        );
        const todaysRejectedClaimCount = todaysRejectedClaims.length;

        console.log('Today’s rejected claims:', todaysRejectedClaims);
        console.log('Total today’s rejected claim count:', todaysRejectedClaimCount);

        this.totalTodaysRejectedClaimCount = todaysRejectedClaimCount;
        this.animateCount(todaysRejectedClaimCount, 'animatedTodaysRejectedClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch today’s rejected claim count. Please try again later.';
        this.totalTodaysRejectedClaimCount = null;
        this.animatedTodaysRejectedClaimCount = 0;
        console.error('Error fetching today’s rejected claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalTodaysRejectedClaimCount completed');
      }
    });
  }

  fetchTotalTodaysPendingClaimCount(): void {
    console.log('Fetching total today’s pending claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const pendingStatusId = 1;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const todaysPendingClaims = (claims.claims || []).filter(
          (claim: any) => {
            const createdDate = new Date(claim.DateCreated);
            return claim.ClaimStatusId === pendingStatusId && createdDate >= oneDayAgo && createdDate <= now;
          }
        );
        const todaysPendingClaimCount = todaysPendingClaims.length;

        console.log('Today’s pending claims:', todaysPendingClaims);
        console.log('Total today’s pending claim count:', todaysPendingClaimCount);

        this.totalTodaysPendingClaimCount = todaysPendingClaimCount;
        this.animateCount(todaysPendingClaimCount, 'animatedTodaysPendingClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch today’s pending claim count. Please try again later.';
        this.totalTodaysPendingClaimCount = null;
        this.animatedTodaysPendingClaimCount = 0;
        console.error('Error fetching today’s pending claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalTodaysPendingClaimCount completed');
      }
    });
  }

  fetchTotalTodaysInProgressClaimCount(): void {
    console.log('Fetching total today’s in-progress claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const inProgressStatusId = 3; 
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const todaysInProgressClaims = (claims.claims || []).filter(
          (claim: any) => {
            const createdDate = new Date(claim.DateCreated);
            return claim.ClaimStatusId === inProgressStatusId && createdDate >= oneDayAgo && createdDate <= now;
          }
        );
        const todaysInProgressClaimCount = todaysInProgressClaims.length;

        console.log('Today’s in-progress claims:', todaysInProgressClaims);
        console.log('Total today’s in-progress claim count:', todaysInProgressClaimCount);

        this.totalTodaysInProgressClaimCount = todaysInProgressClaimCount;
        this.animateCount(todaysInProgressClaimCount, 'animatedTodaysInProgressClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch today’s in-progress claim count. Please try again later.';
        this.totalTodaysInProgressClaimCount = null;
        this.animatedTodaysInProgressClaimCount = 0;
        console.error('Error fetching today’s in-progress claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalTodaysInProgressClaimCount completed');
      }
    });
  }

  fetchTotalTodaysOnHoldClaimCount(): void {
    console.log('Fetching total today’s on-hold claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const onHoldStatusId = 10;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const todaysOnHoldClaims = (claims.claims || []).filter(
          (claim: any) => {
            const createdDate = new Date(claim.DateCreated);
            return claim.ClaimStatusId === onHoldStatusId && createdDate >= oneDayAgo && createdDate <= now;
          }
        );
        const todaysOnHoldClaimCount = todaysOnHoldClaims.length;

        console.log('Today’s on-hold claims:', todaysOnHoldClaims);
        console.log('Total today’s on-hold claim count:', todaysOnHoldClaimCount);
        this.totalTodaysOnHoldClaimCount = todaysOnHoldClaimCount;
        this.animateCount(todaysOnHoldClaimCount, 'animatedTodaysOnHoldClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch today’s on-hold claim count. Please try again later.';
        this.totalTodaysOnHoldClaimCount = null;
        this.animatedTodaysOnHoldClaimCount = 0;
        console.error('Error fetching today’s on-hold claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalTodaysOnHoldClaimCount completed');
      }
    });
  }

   fetchTotalSubmittedClaimCount(): void {
    console.log('Fetching total submitted claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const submittedStatusId = 11;
        const submittedClaims = (claims.claims || []).filter(
          (claim: any) => claim.ClaimStatusId === submittedStatusId
        );
        const submittedClaimCount = submittedClaims.length;

        console.log('Submitted claims:', submittedClaims);
        console.log('Total submitted claim count:', submittedClaimCount);

        this.totalSubmittedClaimCount = submittedClaimCount;
        this.animateCount(submittedClaimCount, 'animatedSubmittedClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch submitted claim count. Please try again later.';
        this.totalSubmittedClaimCount = null;
        this.animatedSubmittedClaimCount = 0;
        console.error('Error fetching submitted claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalSubmittedClaimCount completed');
      }
    });
  }

  fetchTotalTodaysSubmittedClaimCount(): void {
    console.log('Fetching total today’s submitted claim count...');
    this.authService.getTotalClaims().subscribe({
      next: (claims) => {
        console.log('Claims response:', claims);
        const submittedStatusId = 11;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const todaysSubmittedClaims = (claims.claims || []).filter(
          (claim: any) => {
            const createdDate = new Date(claim.DateCreated);
            return claim.ClaimStatusId === submittedStatusId && createdDate >= oneDayAgo && createdDate <= now;
          }
        );
        const todaysSubmittedClaimCount = todaysSubmittedClaims.length;

        console.log('Today’s submitted claims:', todaysSubmittedClaims);
        console.log('Total today’s submitted claim count:', todaysSubmittedClaimCount);

        this.totalTodaysSubmittedClaimCount = todaysSubmittedClaimCount;
        this.animateCount(todaysSubmittedClaimCount, 'animatedTodaysSubmittedClaimCount');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Unable to fetch today’s submitted claim count. Please try again later.';
        this.totalTodaysSubmittedClaimCount = null;
        this.animatedTodaysSubmittedClaimCount = 0;
        console.error('Error fetching today’s submitted claim count:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('fetchTotalTodaysSubmittedClaimCount completed');
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getTotalUsers().subscribe({
      next: (res: any) => {
        console.log("Complete user data:", res); // Log the entire response object
        console.log("users is", res.users); // Log the users array specifically
        console.log("total count is", res.totalCount);

        const userCount = Number(res.totalCount) || 0; // Total user count
        this.totalUser = userCount;
        this.userList = res.users || []; // Store all users
        console.log("users",this.userList)
        // Filter users created within the last 24 hours
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const todayUsers = this.userList.filter((user: any) => {
          const createdDate = new Date(user.DateCreated);
          return createdDate >= oneDayAgo && createdDate <= now;
        });
        const todayUserCount = todayUsers.length;
        console.log("Today’s users:", todayUsers); // Log filtered users
        console.log("Today’s user count:", todayUserCount); // Log count of today’s users

        this.animateCount(userCount, 'animatedtotalUser'); // Animate total users
        this.animateCount(todayUserCount, 'animatedTodayUserCount'); // Animate today’s users
        this.isLoading = false;
        this.cdr.detectChanges(); // Ensure UI updates after data load
      },
      error: (err) => {
        this.errorMessage = 'Failed to load users. Please try again later.';
        this.totalUser = null;
        this.animatedtotalUser = 0;
        this.animatedTodayUserCount = 0; // Reset today’s count on error
        this.isLoading = false;
        console.error('Error loading users:', err);
        this.cdr.detectChanges();
      }
    });
  }

  logAllClaimCounts(): void {
    console.log('Completed Claims:', this.animatedCompletedClaimCount);
    console.log('Rejected Claims:', this.animatedRejectedClaimCount);
    console.log('Pending Claims:', this.animatedPendingClaimCount);
    console.log('On Hold Claims:', this.animatedOnHoldClaimCount);
    console.log('In Progress Claims:', this.animatedInProgressClaimCount);
  }
  
}