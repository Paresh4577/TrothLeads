import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetsupportComponent } from './getsupport.component';

describe('GetsupportComponent', () => {
  let component: GetsupportComponent;
  let fixture: ComponentFixture<GetsupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GetsupportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetsupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
