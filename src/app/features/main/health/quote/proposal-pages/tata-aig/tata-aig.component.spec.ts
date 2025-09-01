import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TATAAIGComponent } from './tata-aig.component';

describe('TATAAIGComponent', () => {
  let component: TATAAIGComponent;
  let fixture: ComponentFixture<TATAAIGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TATAAIGComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TATAAIGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
