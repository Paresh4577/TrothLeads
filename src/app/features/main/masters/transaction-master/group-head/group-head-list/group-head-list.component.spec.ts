import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupHeadListComponent } from './group-head-list.component';

describe('GroupHeadListComponent', () => {
  let component: GroupHeadListComponent;
  let fixture: ComponentFixture<GroupHeadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupHeadListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupHeadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
