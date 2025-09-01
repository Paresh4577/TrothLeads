import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubSourceComponent } from './sub-source.component';

describe('SubSourceComponent', () => {
  let component: SubSourceComponent;
  let fixture: ComponentFixture<SubSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubSourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
