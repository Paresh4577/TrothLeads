import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewfamilyComponent } from './viewfamily.component';

describe('ViewfamilyComponent', () => {
  let component: ViewfamilyComponent;
  let fixture: ComponentFixture<ViewfamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewfamilyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewfamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
