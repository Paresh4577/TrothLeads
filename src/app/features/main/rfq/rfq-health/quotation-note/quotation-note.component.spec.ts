import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationNoteComponent } from './quotation-note.component';

describe('QuotationNoteComponent', () => {
  let component: QuotationNoteComponent;
  let fixture: ComponentFixture<QuotationNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotationNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
