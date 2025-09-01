import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewcompanyemployeeComponent } from './viewcompanyemployee.component';

describe('ViewcompanyemployeeComponent', () => {
  let component: ViewcompanyemployeeComponent;
  let fixture: ComponentFixture<ViewcompanyemployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewcompanyemployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewcompanyemployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
