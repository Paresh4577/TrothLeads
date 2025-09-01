import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqMiscellaneousListComponent } from './rfq-miscellaneous-list.component';

describe('RfqMiscellaneousListComponent', () => {
  let component: RfqMiscellaneousListComponent;
  let fixture: ComponentFixture<RfqMiscellaneousListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqMiscellaneousListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqMiscellaneousListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
