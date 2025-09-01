import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SMSLogsComponent } from './smslogs.component';

describe('SMSLogsComponent', () => {
  let component: SMSLogsComponent;
  let fixture: ComponentFixture<SMSLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SMSLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SMSLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
