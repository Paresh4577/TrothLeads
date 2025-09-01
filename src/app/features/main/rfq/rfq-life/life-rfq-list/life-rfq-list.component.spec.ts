import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeRfqListComponent } from './life-rfq-list.component';

describe('LifeRfqListComponent', () => {
  let component: LifeRfqListComponent;
  let fixture: ComponentFixture<LifeRfqListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeRfqListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeRfqListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
