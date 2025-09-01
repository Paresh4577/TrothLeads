import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamReferenceComponent } from './team-reference.component';

describe('TeamReferenceComponent', () => {
  let component: TeamReferenceComponent;
  let fixture: ComponentFixture<TeamReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamReferenceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
