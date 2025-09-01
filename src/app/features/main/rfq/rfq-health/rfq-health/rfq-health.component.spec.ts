import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqHealthComponent } from './rfq-health.component';

describe('RfqHealthComponent', () => {
  let component: RfqHealthComponent;
  let fixture: ComponentFixture<RfqHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqHealthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
