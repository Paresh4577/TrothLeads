import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BajajComponent } from './bajaj.component';

describe('BajajComponent', () => {
  let component: BajajComponent;
  let fixture: ComponentFixture<BajajComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BajajComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BajajComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
