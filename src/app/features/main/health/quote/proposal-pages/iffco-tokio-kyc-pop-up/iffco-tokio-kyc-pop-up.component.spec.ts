import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IffcoTokioKycPopUpComponent } from './iffco-tokio-kyc-pop-up.component';

describe('IffcoTokioKycPopUpComponent', () => {
  let component: IffcoTokioKycPopUpComponent;
  let fixture: ComponentFixture<IffcoTokioKycPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IffcoTokioKycPopUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IffcoTokioKycPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
