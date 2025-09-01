import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollementComponent } from './enrollement.component';

describe('EnrollementComponent', () => {
  let component: EnrollementComponent;
  let fixture: ComponentFixture<EnrollementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnrollementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
