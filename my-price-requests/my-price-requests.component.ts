import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

interface OpenRequest {
  id: string;
  status: 'pending_customer' | 'pending_other_railroad' | 'new' | 'in_work';
  origin: string;
  destination: string;
  commodity: string;
  shipFrom: string;
  shipTo: string;
  dateRequested: string;
  expirationDate: string;
  expirationWarning?: boolean;
  price?: string;
  priceNote?: string;
}

interface CompletedRequest {
  id: string;
  status: 'rejected' | 'completed' | 'expired';
  origin: string;
  destination: string;
  commodity: string;
  shipFrom: string;
  shipTo: string;
  dateRequested: string;
  responseDate: string;
  publishDoc?: string;
}

type FilterTab = 'all' | 'pending_customer' | 'pending_up' | 'pending_other_railroad';

@Component({
  selector: 'app-my-price-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    FormsModule
  ],
  templateUrl: './my-price-requests.component.html',
  styleUrl: './my-price-requests.component.scss'
})
export class MyPriceRequestsComponent implements OnInit {
  activeFilter: FilterTab = 'all';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  openDisplayedColumns: string[] = [
    'id',
    'status',
    'originDestination',
    'commodity',
    'shipFrom',
    'shipTo',
    'dateRequested',
    'expirationDate',
    'price',
    'action'
  ];

  completedDisplayedColumns: string[] = [
    'id',
    'status',
    'originDestination',
    'commodity',
    'shipFrom',
    'shipTo',
    'dateRequested',
    'responseDate',
    'publishDoc',
    'action'
  ];

  openRequests: OpenRequest[] = [
    {
      id: '875543',
      status: 'pending_customer',
      origin: 'Chicago, IL',
      destination: 'Miami, FL',
      commodity: '3332115',
      shipFrom: 'Union Pacific',
      shipTo: 'Union Pacific',
      dateRequested: '4/03/2026',
      expirationDate: '4/15/2026',
      price: '4,932 - 6,535',
      priceNote: 'per car'
    },
    {
      id: '654321',
      status: 'pending_customer',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      commodity: '3499430',
      shipFrom: 'Union Pacific',
      shipTo: 'Union Pacific',
      dateRequested: '4/04/2026',
      expirationDate: '4/10/2026',
      expirationWarning: true,
      price: '6,750 - 7,989',
      priceNote: 'per net ton'
    },
    {
      id: '432109',
      status: 'pending_other_railroad',
      origin: 'Houston, TX',
      destination: 'Seattle, WA',
      commodity: '3499430',
      shipFrom: 'Union Pacific',
      shipTo: 'Union Pacific',
      dateRequested: '4/05/2026',
      expirationDate: ''
    },
    {
      id: '765432',
      status: 'new',
      origin: 'Houston, TX',
      destination: 'Seattle, WA',
      commodity: '3499430',
      shipFrom: 'Union Pacific',
      shipTo: 'Union Pacific',
      dateRequested: '4/09/2026',
      expirationDate: ''
    },
    {
      id: '543210',
      status: 'new',
      origin: 'Austin, TX',
      destination: 'Portland, OR',
      commodity: '3332115',
      shipFrom: 'Union Pacific',
      shipTo: 'Union Pacific',
      dateRequested: '4/09/2026',
      expirationDate: ''
    },
    {
      id: '321098',
      status: 'in_work',
      origin: 'Dallas, TX',
      destination: 'San Francisco, CA',
      commodity: '3499430',
      shipFrom: 'Union Pacific',
      shipTo: 'Union Pacific',
      dateRequested: '4/09/2026',
      expirationDate: ''
    }
  ];

  completedRequests: CompletedRequest[] = [
    {
      id: '765432',
      status: 'rejected',
      origin: 'Austin, TX',
      destination: 'Portland, OR',
      commodity: '3332115',
      shipFrom: 'Union Pacific',
      shipTo: 'Union Pacific',
      dateRequested: '4/01/2024',
      responseDate: '4/04/2024'
    },
    {
      id: '432109',
      status: 'completed',
      origin: 'San Francisco, CA',
      destination: 'Denver, CO',
      commodity: '3332115',
      shipFrom: 'Union Pacific',
      shipTo: 'Union Pacific',
      dateRequested: '1/10/2026',
      responseDate: '1/15/2026',
      publishDoc: 'UP 123456'
    },
    {
      id: '109876',
      status: 'expired',
      origin: 'Miami, FL',
      destination: 'Minneapolis, MN',
      commodity: '3499430',
      shipFrom: 'Union Pacific',
      shipTo: 'Union Pacific',
      dateRequested: '1/10/2026',
      responseDate: '1/10/2026'
    }
  ];

  filteredOpenRequests: OpenRequest[] = [];

  ngOnInit(): void {
    this.filterRequests();
  }

  setFilter(filter: FilterTab): void {
    this.activeFilter = filter;
    this.filterRequests();
  }

  filterRequests(): void {
    if (this.activeFilter === 'all') {
      this.filteredOpenRequests = [...this.openRequests];
    } else if (this.activeFilter === 'pending_customer') {
      this.filteredOpenRequests = this.openRequests.filter(r => r.status === 'pending_customer');
    } else if (this.activeFilter === 'pending_up') {
      this.filteredOpenRequests = this.openRequests.filter(r => r.status === 'new' || r.status === 'in_work');
    } else if (this.activeFilter === 'pending_other_railroad') {
      this.filteredOpenRequests = this.openRequests.filter(r => r.status === 'pending_other_railroad');
    }
  }

  applyDateFilter(): void {
    // Implement date filtering logic here
    console.log('Filtering from:', this.fromDate, 'to:', this.toDate);
  }

  goBack(): void {
    // Implement navigation back
    console.log('Navigate back');
  }

  newPriceRequest(): void {
    // Implement new price request action
    console.log('New price request');
  }

  viewRequest(id: string): void {
    // Implement view request action
    console.log('View request:', id);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending_customer': 'Pending Customer Response',
      'pending_other_railroad': 'Pending Other Railroad',
      'new': 'New',
      'in_work': 'In Work',
      'rejected': 'Rejected',
      'completed': 'Completed',
      'expired': 'Expired'
    };
    return labels[status] || status;
  }
}
