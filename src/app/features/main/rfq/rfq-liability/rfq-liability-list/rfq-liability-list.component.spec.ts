import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqLiabilityListComponent } from './rfq-liability-list.component';

describe('RfqLiabilityListComponent', () => {
  let component: RfqLiabilityListComponent;
  let fixture: ComponentFixture<RfqLiabilityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqLiabilityListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqLiabilityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
