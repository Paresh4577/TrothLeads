import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqShareDialogComponent } from './rfq-share-dialog.component';

describe('RfqShareDialogComponent', () => {
  let component: RfqShareDialogComponent;
  let fixture: ComponentFixture<RfqShareDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqShareDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqShareDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
