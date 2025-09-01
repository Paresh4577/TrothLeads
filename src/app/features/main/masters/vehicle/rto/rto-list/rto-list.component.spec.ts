import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtoListComponent } from './rto-list.component';

describe('RtoListComponent', () => {
  let component: RtoListComponent;
  let fixture: ComponentFixture<RtoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RtoListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RtoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
