import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqPaListComponent } from './rfq-pa-list.component';

describe('RfqPaListComponent', () => {
  let component: RfqPaListComponent;
  let fixture: ComponentFixture<RfqPaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqPaListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqPaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
