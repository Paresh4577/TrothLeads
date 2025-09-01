import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupRfqListComponent } from './group-rfq-list.component';

describe('GroupRfqListComponent', () => {
  let component: GroupRfqListComponent;
  let fixture: ComponentFixture<GroupRfqListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupRfqListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupRfqListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
