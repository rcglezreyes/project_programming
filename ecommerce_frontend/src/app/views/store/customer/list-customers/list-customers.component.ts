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
  FormModule
} from '@coreui/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconDirective } from '@coreui/icons-angular';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
    NgbModule,
    FormModule,
    ReactiveFormsModule
  ]
})
export class ListCustomersComponent implements OnInit {

  module: string = 'customers';

  listCustomers: ICustomer[] = [];
  filteredCustomers: ICustomer[] = [];
  searchForm: FormGroup;

  tableHeaders = [
    '#',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Actions'
  ];

  @Input() iCustomer!: ICustomer;

  constructor(
    private router: Router,
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search_term: ['']
    });
  }

  ngOnInit(): void {
    const isStaff = localStorage.getItem('isStaff');
    if (isStaff !== 'admin') {
      this.router.navigate(['/404']);
    } else {
      this.customerService.loadListCustomers();
      this.subscribeToCustomerList();
      this.setupSearch();
    }
  }

  setupSearch(): void {
    this.searchForm.get('search_term')?.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(term => {
      console.log('Search term:', term);
      this.filteredCustomers = this.filterCustomers(term);
    });
  }

  filterCustomers(term: string): ICustomer[] {
    if (!term) {
      return this.listCustomers;
    }

    const lowerTerm = term.toLowerCase();
    return this.listCustomers.filter(customer =>
      customer.fields.first_name.toLowerCase().includes(lowerTerm) ||
      customer.fields.last_name.toLowerCase().includes(lowerTerm) ||
      customer.fields.email.toLowerCase().includes(lowerTerm) ||
      customer.fields.phone.toLowerCase().includes(lowerTerm)
    );
  }

  subscribeToCustomerList(): void {
    this.customerService.getListCustomers().subscribe({
      next: (customers) => {
        this.listCustomers = customers;
        this.filteredCustomers = customers;
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

  selectAllText(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.select(); 
  }
}
