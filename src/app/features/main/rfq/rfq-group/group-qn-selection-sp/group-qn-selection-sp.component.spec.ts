import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupQnSelectionSpComponent } from './group-qn-selection-sp.component';

describe('GroupQnSelectionSpComponent', () => {
  let component: GroupQnSelectionSpComponent;
  let fixture: ComponentFixture<GroupQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
