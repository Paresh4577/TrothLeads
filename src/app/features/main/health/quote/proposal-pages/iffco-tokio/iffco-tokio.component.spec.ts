import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IFFCOTOKIOComponent } from './iffco-tokio.component';

describe('IFFCOTOKIOComponent', () => {
  let component: IFFCOTOKIOComponent;
  let fixture: ComponentFixture<IFFCOTOKIOComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IFFCOTOKIOComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IFFCOTOKIOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
