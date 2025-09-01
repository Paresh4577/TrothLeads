import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HdfcErgoComponent } from './hdfc-ergo.component';

describe('HdfcErgoComponent', () => {
  let component: HdfcErgoComponent;
  let fixture: ComponentFixture<HdfcErgoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HdfcErgoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HdfcErgoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
