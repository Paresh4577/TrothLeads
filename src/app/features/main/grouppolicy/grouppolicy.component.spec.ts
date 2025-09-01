import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrouppolicyComponent } from './grouppolicy.component';

describe('GrouppolicyComponent', () => {
  let component: GrouppolicyComponent;
  let fixture: ComponentFixture<GrouppolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrouppolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrouppolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
