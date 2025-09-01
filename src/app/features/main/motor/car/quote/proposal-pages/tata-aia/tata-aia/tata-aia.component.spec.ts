import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TataAiaComponent } from './tata-aia.component';

describe('TataAiaComponent', () => {
  let component: TataAiaComponent;
  let fixture: ComponentFixture<TataAiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TataAiaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TataAiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
