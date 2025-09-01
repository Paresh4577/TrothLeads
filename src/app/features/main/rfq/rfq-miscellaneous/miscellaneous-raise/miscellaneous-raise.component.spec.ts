import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscellaneousRaiseComponent } from './miscellaneous-raise.component';

describe('MiscellaneousRaiseComponent', () => {
  let component: MiscellaneousRaiseComponent;
  let fixture: ComponentFixture<MiscellaneousRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiscellaneousRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiscellaneousRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
