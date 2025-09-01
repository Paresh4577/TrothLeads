import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndorsementConfirmDialogComponent } from './endorsement-confirm-dialog.component';

describe('EndorsementConfirmDialogComponent', () => {
  let component: EndorsementConfirmDialogComponent;
  let fixture: ComponentFixture<EndorsementConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndorsementConfirmDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndorsementConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
