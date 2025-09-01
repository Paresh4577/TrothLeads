import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdityaBirlaHealthComponent } from './aditya-birla-health.component';

describe('AdityaBirlaHealthComponent', () => {
  let component: AdityaBirlaHealthComponent;
  let fixture: ComponentFixture<AdityaBirlaHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdityaBirlaHealthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdityaBirlaHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
