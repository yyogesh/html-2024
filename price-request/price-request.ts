import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

export interface PriceDetail {
  name: string;
  subtype: string;
  route: string;
  ownership: string;
  minWeight?: string;
  currentFuelSurcharge: string;
  fuelSurchargeMiles: string;
  price: string;
  unit: string;
  includesNote: string;
  additionalCondition?: string;
}

@Component({
  selector: 'app-price-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './price-request.html',
  styleUrls: ['./price-request.scss'],
})
export class PriceRequestComponent implements OnInit {
  offerForm!: FormGroup;

  requestId = '64321';
  status = 'Pending Customer Response';

  origin = { city: 'New York, NY, CA', code: 'UP' };
  destination = { city: 'Los Angeles, CA', code: 'UP' };

  requestInfo = {
    dateRequested: '4/04/2025',
    expirationDate: '4/15/2025',
    potentialVolume: '40 cars per year',
    shipFrom: 'Formosa Plastics Corporation of NY',
    shipTo: 'Muskogee City County Port Authority',
    commoditySTCC: '654321',
    pickUpParty: 'Corporation for pickup',
    inCareOfParty: 'Corporation for In Care',
  };

  globalCondition =
    'All prices subject to: Switching charges at origin and destination are absorbed in an amount not to exceed 300.00 dollars.';

  priceDetails: PriceDetail[] = [
    {
      name: 'Plain Boxcar',
      subtype: 'Plain BoxCar subtype',
      route: 'UP',
      ownership: 'Private',
      minWeight: '203,000lbs',
      currentFuelSurcharge: '$374',
      fuelSurchargeMiles: '1113 miles',
      price: '$100.00',
      unit: 'per car',
      includesNote: 'excludes surcharges',
      additionalCondition:
        'Additional price conditions: Switching charges at origin and destination are absorbed in an amount not to exceed 700.00 dollars.',
    },
    {
      name: 'Large Plain Boxcar',
      subtype: 'Large Plain BoxCar subtype',
      route: 'UP',
      ownership: 'Rail',
      currentFuelSurcharge: '$286',
      fuelSurchargeMiles: '853 miles',
      price: '$200.00',
      unit: 'per net ton',
      includesNote: 'excludes surcharges',
    },
    {
      name: 'PVT - Tank Car',
      subtype: 'Rail',
      route: 'UP',
      ownership: 'Private',
      minWeight: '203,000lbs',
      currentFuelSurcharge: '$415',
      fuelSurchargeMiles: '1293 miles',
      price: '$300.00',
      unit: 'per net ton',
      includesNote: 'excludes surcharges',
      additionalCondition:
        'Additional price conditions: Switching charges at origin and destination are absorbed in an amount not to exceed 500.00 dollars.',
    },
    {
      name: 'Small Covered Hopper',
      subtype: 'Small Covered Hopper subtype',
      route: 'UP',
      ownership: 'Rail',
      currentFuelSurcharge: '$332',
      fuelSurchargeMiles: '973 miles',
      price: '$2400.00',
      unit: 'per car',
      includesNote: 'excludes surcharges',
    },
  ];

  responseOptions = [
    { value: 'accept', label: 'Accept' },
    { value: 'reject', label: 'Reject' },
    { value: 'counter', label: 'Counter Offer' },
    { value: 'request_info', label: 'Request More Info' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.offerForm = this.fb.group({
      response: [null, Validators.required],
      comments: ['', [Validators.maxLength(70)]],
    });
  }

  get commentsLength(): number {
    return this.offerForm.get('comments')?.value?.length ?? 0;
  }

  onSubmit(): void {
    if (this.offerForm.valid) {
      console.log('Form submitted:', this.offerForm.value);
    }
  }

  goBack(): void {
    history.back();
  }
}