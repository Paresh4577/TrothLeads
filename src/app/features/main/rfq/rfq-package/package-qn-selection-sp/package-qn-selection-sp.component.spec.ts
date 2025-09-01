import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageQnSelectionSpComponent } from './package-qn-selection-sp.component';

describe('PackageQnSelectionSpComponent', () => {
  let component: PackageQnSelectionSpComponent;
  let fixture: ComponentFixture<PackageQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
