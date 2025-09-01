import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamReferenceListComponent } from './team-reference-list.component';

describe('TeamReferenceListComponent', () => {
  let component: TeamReferenceListComponent;
  let fixture: ComponentFixture<TeamReferenceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamReferenceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamReferenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
