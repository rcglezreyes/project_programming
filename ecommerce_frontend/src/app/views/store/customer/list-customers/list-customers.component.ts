import { Component, Input, OnInit } from '@angular/core';
import { DocsExampleComponent } from '@docs-components/public-api';
import {
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  TableDirective,
  TableColorDirective,
  TableActiveDirective,
  BorderDirective,
  AlignDirective,
  ButtonDirective,
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconDirective } from '@coreui/icons-angular';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CustomerService } from 'src/app/services/customer.service';
import { ICustomer } from 'src/app/interfaces/icustomer.interface';

@Component({
  selector: 'app-tables',
  templateUrl: './list-customers.component.html',
  styleUrls: ['./list-customers.component.scss'],
  standalone: true,
  imports: [
    IconDirective,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    DocsExampleComponent,
    TableDirective,
    TableColorDirective,
    TableActiveDirective,
    BorderDirective,
    AlignDirective,
    ButtonDirective,
    CommonModule,
    NgbModule
  ]
})
export class ListCustomersComponent implements OnInit {

  listCustomers: ICustomer[] = [];

  tableHeaders = [
    '#',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Actions'
  ];

  @Input() iCustomer!: ICustomer;

  constructor(private router: Router, private customerService: CustomerService) { }

  ngOnInit(): void {
    const isStaff = localStorage.getItem('isStaff');
    if (isStaff !== 'admin') {
      this.router.navigate(['/404']);
    } else {
      this.customerService.loadListCustomers();
      this.subscribeToCustomerList();
    }
  }

  subscribeToCustomerList(): void {
    this.customerService.getListCustomers().subscribe({
      next: (customers) => {
        this.listCustomers = customers;
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

  navigateToManageCustomer() {
    this.router.navigate(['/store/manage_customer']);
  }

  navigateToEditCustomer(customer: ICustomer) {
    this.router.navigate(['/store/manage_customer'], { state: { customer: customer } });
  }

  onDelete(pk: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this customer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = { id: pk };
        this.customerService.deleteCustomer(payload).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Customer has been deleted successfully!',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          },
          error: (error) => {
            console.error('Request failed:', error);
          }
        });
      }
    });
  }
}
