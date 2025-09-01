import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqAttachmentPopupComponent } from './rfq-attachment-popup.component';

describe('RfqAttachmentPopupComponent', () => {
  let component: RfqAttachmentPopupComponent;
  let fixture: ComponentFixture<RfqAttachmentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqAttachmentPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqAttachmentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
