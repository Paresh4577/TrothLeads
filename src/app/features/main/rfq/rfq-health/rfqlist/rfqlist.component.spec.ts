import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RFQListComponent } from './rfqlist.component';

describe('RFQListComponent', () => {
  let component: RFQListComponent;
  let fixture: ComponentFixture<RFQListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RFQListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RFQListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
