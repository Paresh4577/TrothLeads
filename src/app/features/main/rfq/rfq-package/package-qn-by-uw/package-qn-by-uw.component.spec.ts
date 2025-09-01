import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageQnByUwComponent } from './package-qn-by-uw.component';

describe('PackageQnByUwComponent', () => {
  let component: PackageQnByUwComponent;
  let fixture: ComponentFixture<PackageQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
