import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddempfamilyComponent } from './addempfamily.component';

describe('AddempfamilyComponent', () => {
  let component: AddempfamilyComponent;
  let fixture: ComponentFixture<AddempfamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddempfamilyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddempfamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
