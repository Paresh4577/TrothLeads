import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HradminportalComponent } from './hradminportal.component';

describe('HradminportalComponent', () => {
  let component: HradminportalComponent;
  let fixture: ComponentFixture<HradminportalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HradminportalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HradminportalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
