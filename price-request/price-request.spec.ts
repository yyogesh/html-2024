import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceRequest } from './price-request';

describe('PriceRequest', () => {
  let component: PriceRequest;
  let fixture: ComponentFixture<PriceRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
