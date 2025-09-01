import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrouppolicydashboardComponent } from './grouppolicydashboard.component';

describe('GrouppolicydashboardComponent', () => {
  let component: GrouppolicydashboardComponent;
  let fixture: ComponentFixture<GrouppolicydashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrouppolicydashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrouppolicydashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
