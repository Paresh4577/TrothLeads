import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { drpListDto } from '@models/common/drpList.interface';
import { RoleFeatureDto } from '@models/dtos/auth/role-feature-dto';
import { AuthService } from '@services/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../role.service';
import { DropdownService } from '@services/auth/dropdown-service.service';
import { PageMode } from '@models/common/page-mode.type';
import { RoleFeatureActivityDto } from '@models/dtos/auth/role-feature-activity-dto';
import { OrderBySpecs } from '@models/common';
import { RoleDto } from '@models/dtos/auth/role-dto';
import { ROUTING_PATH } from '@config/routingPath.config';


const returnPath: string = ROUTING_PATH.Master.Admin.Role;

const DefaultSortOrder: OrderBySpecs[] = [
  {
    field: "Name",
    direction: "asc",
  },
];

@Component({
  selector: 'gnx-role-permission',
  templateUrl: './role-permission.component.html',
  styleUrls: ['./role-permission.component.scss']
})
export class RolePermissionComponent implements OnInit {

  title: string;
  mode: PageMode;

  role: RoleDto;

  destroy$: Subject<any>;

  roleFeatureList: RoleFeatureDto[];
  activityList: drpListDto[]; // will use it for storing activitykey - activityname pair
  displayedColumns: string[];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();


  constructor(
    private activedRoute: ActivatedRoute,
    private rolepermissionService: RoleService,
    private alertService: AlertsService,
    private router: Router,
    private dropdownService: DropdownService,
    private _authservice: AuthService
  ) {
    this.destroy$ = new Subject();
    this._getActivityList();

  }



  ngOnInit(): void {
    //get data from route
    let data = this.activedRoute.snapshot.data;
    this.dataSource.data = data['rolefeatureactivity'].Features
    //determine mode
    this.title = data['title'];
    this.mode = data['mode'];
    this.role = data['rolefeatureactivity'];
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  // As per suggested by backend team - we are saving role features instead of role
  public saveFeatureActivity() {


    // Validate For Select One Activity 
    let ActivityValidate = []
    this.role.Features.forEach(feture => {
      feture.Activities.forEach(activity => {
        if (activity.Permission) {
          ActivityValidate.push(activity.Permission)
        }
      })
    })

    if (!ActivityValidate.length) {
      this.alertService.raiseErrorAlert(`Please select at least one activity to save`);
      return;
    }

    this.roleFeatureList = this.role.Features

    // For a take only True Permission activity
    this.roleFeatureList.forEach(feture => {
      let Activities = []
      feture.Activities.forEach(activity => {
        if (activity.Permission) {
          Activities.push(activity)
        }
      })
      feture.Activities = Activities
    })

    // as we have cleanup everything - we are sending data to server for update
    this.rolepermissionService.updateRoleActivity(this.roleFeatureList).subscribe(
      (res) => {
        if (res.Success) {
          this.alertService.raiseSuccessAlert(`Role features updated for role ${this.role.Name}`);
          this.router.navigate([returnPath]);
          this._authservice.userProfile$
        } else {
          this.alertService.raiseErrorAlert(`Error`);
        }
      },
      (err) => {
        this.alertService.raiseErrorAlert(err);
      }
    );
  }

  public checkall(featureKey: string) {
    let checked = false;
    this.role.Features.forEach((feature) => {
      if (feature.FeatureKey == featureKey) {
        let onefalse = feature.Activities.some((activity) => {
          return activity.Permission == false;
        });
        if (onefalse) {
          checked = false;
        }
        else {
          checked = true;
        }
      }
    });
    return checked;
  }


  public updatePermission(activity: RoleFeatureActivityDto, event: MatCheckboxChange) {
    let featurekey = activity.FeatureKey; // feature key we want to modify permission of
    let featureIndex = this.role.Features.findIndex((arr) => arr.FeatureKey === featurekey); // find feature array index from role
    let activityIndex = this.role.Features[featureIndex].Activities.findIndex(
      (arr) => arr.ActivityKey === activity.ActivityKey
    ); // find activity array index from feature

    this.role.Features[featureIndex].Activities[activityIndex].Permission = event.checked; // update permission from event
    //we will delete "permission" = false at the time of api call
  }


  public updateAllPermission(featureKey: string, event: MatCheckboxChange) {
    // if user has requested to mark all activies
    if (event.checked) {
      this.role.Features.forEach((feature) => {
        if (feature.FeatureKey == featureKey) {
          feature.Activities.forEach((activity) => {
            activity.Permission = true;
          });
        }
      });
    }

    // if user has requested to unmark all activities
    if (!event.checked) {
      this.role.Features.forEach((feature) => {
        if (feature.FeatureKey == featureKey) {
          feature.Activities.forEach((activity) => {
            activity.Permission = false;
          });
        }
      });
    }
  }

  public cancel() {
    this.router.navigate([returnPath]);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Get Activity List
  private _getActivityList() {
    this.dropdownService
      .getActivityDrpList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.Success) {

          // we just need array of name for displaying column headers
          this.displayedColumns = res.Data.map((x) => {
            return x.Name;
          });
          
          this.displayedColumns.unshift("Feature", "All");

          // activity list
          this.activityList = res.Data;

          // add additional two objects to accomodate Feature and All columns
          this.activityList.push({ Id: "Feature", Name: "Feature" }, { Id: "All", Name: "All" });
        }
      });

  }


}
