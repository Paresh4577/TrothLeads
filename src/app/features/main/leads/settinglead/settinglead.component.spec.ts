import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingleadComponent } from './settinglead.component';

describe('SettingleadComponent', () => {
  let component: SettingleadComponent;
  let fixture: ComponentFixture<SettingleadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingleadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingleadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
