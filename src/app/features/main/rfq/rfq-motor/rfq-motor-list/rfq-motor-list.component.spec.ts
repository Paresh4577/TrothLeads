import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqMotorListComponent } from './rfq-motor-list.component';

describe('RfqMotorListComponent', () => {
  let component: RfqMotorListComponent;
  let fixture: ComponentFixture<RfqMotorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqMotorListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqMotorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
