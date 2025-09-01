import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqMarineListComponent } from './rfq-marine-list.component';

describe('RfqMarineListComponent', () => {
  let component: RfqMarineListComponent;
  let fixture: ComponentFixture<RfqMarineListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqMarineListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqMarineListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
