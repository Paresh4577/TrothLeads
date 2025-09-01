import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SBIGENERALComponent } from './sbi-general.component';

describe('SBIGENERALComponent', () => {
  let component: SBIGENERALComponent;
  let fixture: ComponentFixture<SBIGENERALComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SBIGENERALComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SBIGENERALComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
