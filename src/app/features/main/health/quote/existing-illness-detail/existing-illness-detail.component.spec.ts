import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingIllnessDetailComponent } from './existing-illness-detail.component';

describe('ExistingIllnessDetailComponent', () => {
  let component: ExistingIllnessDetailComponent;
  let fixture: ComponentFixture<ExistingIllnessDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExistingIllnessDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExistingIllnessDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
