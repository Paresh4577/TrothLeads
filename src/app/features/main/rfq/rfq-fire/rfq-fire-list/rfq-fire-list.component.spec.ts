import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqFireListComponent } from './rfq-fire-list.component';

describe('RfqFireListComponent', () => {
  let component: RfqFireListComponent;
  let fixture: ComponentFixture<RfqFireListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqFireListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqFireListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
