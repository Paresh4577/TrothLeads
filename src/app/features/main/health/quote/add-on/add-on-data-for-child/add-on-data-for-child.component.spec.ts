import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnDataForChildComponent } from './add-on-data-for-child.component';

describe('AddOnDataForChildComponent', () => {
  let component: AddOnDataForChildComponent;
  let fixture: ComponentFixture<AddOnDataForChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnDataForChildComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnDataForChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
