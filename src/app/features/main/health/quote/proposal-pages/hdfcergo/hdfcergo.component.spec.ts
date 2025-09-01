import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HdfcergoComponent } from './hdfcergo.component';

describe('HdfcergoComponent', () => {
  let component: HdfcergoComponent;
  let fixture: ComponentFixture<HdfcergoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HdfcergoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HdfcergoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
