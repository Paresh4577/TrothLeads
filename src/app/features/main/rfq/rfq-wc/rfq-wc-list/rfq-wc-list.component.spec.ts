import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqWcListComponent } from './rfq-wc-list.component';

describe('RfqWcListComponent', () => {
  let component: RfqWcListComponent;
  let fixture: ComponentFixture<RfqWcListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqWcListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqWcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
