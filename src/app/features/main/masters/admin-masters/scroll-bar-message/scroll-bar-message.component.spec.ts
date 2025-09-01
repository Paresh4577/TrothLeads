import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollBarMessageComponent } from './scroll-bar-message.component';

describe('ScrollBarMessageComponent', () => {
  let component: ScrollBarMessageComponent;
  let fixture: ComponentFixture<ScrollBarMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrollBarMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollBarMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
