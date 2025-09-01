import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageRaiseComponent } from './package-raise.component';

describe('PackageRaiseComponent', () => {
  let component: PackageRaiseComponent;
  let fixture: ComponentFixture<PackageRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
