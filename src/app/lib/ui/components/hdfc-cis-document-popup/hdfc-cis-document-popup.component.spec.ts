import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HDFCCISDocumentPopupComponent } from './hdfc-cis-document-popup.component';

describe('HDFCCISDocumentPopupComponent', () => {
  let component: HDFCCISDocumentPopupComponent;
  let fixture: ComponentFixture<HDFCCISDocumentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HDFCCISDocumentPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HDFCCISDocumentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
