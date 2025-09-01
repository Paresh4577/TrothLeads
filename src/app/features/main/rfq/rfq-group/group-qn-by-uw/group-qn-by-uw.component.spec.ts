import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupQnByUwComponent } from './group-qn-by-uw.component';

describe('GroupQnByUwComponent', () => {
  let component: GroupQnByUwComponent;
  let fixture: ComponentFixture<GroupQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
