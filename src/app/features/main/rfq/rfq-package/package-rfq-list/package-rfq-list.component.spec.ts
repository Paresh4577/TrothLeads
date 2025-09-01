import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageRfqListComponent } from './package-rfq-list.component';

describe('PackageRfqListComponent', () => {
  let component: PackageRfqListComponent;
  let fixture: ComponentFixture<PackageRfqListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageRfqListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageRfqListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
