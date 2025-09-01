import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupRaiseComponent } from './group-raise.component';

describe('GroupRaiseComponent', () => {
  let component: GroupRaiseComponent;
  let fixture: ComponentFixture<GroupRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
