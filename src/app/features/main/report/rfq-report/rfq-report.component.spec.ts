import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqReportComponent } from './rfq-report.component';

describe('RfqReportComponent', () => {
  let component: RfqReportComponent;
  let fixture: ComponentFixture<RfqReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
