import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZunoComponent } from './zuno.component';

describe('ZunoComponent', () => {
  let component: ZunoComponent;
  let fixture: ComponentFixture<ZunoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZunoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZunoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
