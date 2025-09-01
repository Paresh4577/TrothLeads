import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FyGrowthReportComponent } from './fy-growth-report.component';

describe('FyGrowthReportComponent', () => {
  let component: FyGrowthReportComponent;
  let fixture: ComponentFixture<FyGrowthReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FyGrowthReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FyGrowthReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
