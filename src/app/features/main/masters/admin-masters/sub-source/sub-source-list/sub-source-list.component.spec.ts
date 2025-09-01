import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubSourceListComponent } from './sub-source-list.component';

describe('SubSourceListComponent', () => {
  let component: SubSourceListComponent;
  let fixture: ComponentFixture<SubSourceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubSourceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubSourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
