import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringRfqListComponent } from './engineering-rfq-list.component';

describe('EngineeringRfqListComponent', () => {
  let component: EngineeringRfqListComponent;
  let fixture: ComponentFixture<EngineeringRfqListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineeringRfqListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngineeringRfqListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
