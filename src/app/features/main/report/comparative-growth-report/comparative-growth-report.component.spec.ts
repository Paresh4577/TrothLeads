import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparativeGrowthReportComponent } from './comparative-growth-report.component';

describe('ComparativeGrowthReportComponent', () => {
  let component: ComparativeGrowthReportComponent;
  let fixture: ComponentFixture<ComparativeGrowthReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComparativeGrowthReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparativeGrowthReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
