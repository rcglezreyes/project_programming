import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { IconDirective } from '@coreui/icons-angular';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { OrderService } from '../../../../../app/services/order.service';
import { IOrderItemFull } from '../../../../../app/interfaces/iorder.interface';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-tables',
  templateUrl: './list-orders.component.html',
  styleUrls: ['./list-orders.component.scss'],
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
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule
  ]
})
export class ListOrdersComponent implements OnInit {

  module: string = 'orders';

  isStaff: string = localStorage.getItem('isStaff') || '';

  title: string = this.isStaff === 'admin' ? 'Orders' : 'My Orders';

  listOrderItems: IOrderItemFull[] = [];
  filteredOrderItems: IOrderItemFull[] = [];
  searchForm: FormGroup;
  totalSelectedAmount: number = 0;
  totalSelectedAmountString: string = '0.00';
  stateSelectAll: boolean = false;

  tableHeaders = [
    '#',
    'Product',
    'Name',
    'Customer',
    'Created At',
    'Amount',
    'Delivery At',
    'Actions'
  ];

  @Input() iOrderItem!: IOrderItemFull;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private fb: FormBuilder,
  ) {
    this.searchForm = this.fb.group({
      search_term: ['']
    });
  }

  ngOnInit(): void {
    this.orderService.loadListOrders();
    this.subscribeToOrderItemList();
    // this.updateTotal();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchForm.get('search_term')?.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filteredOrderItems = this.filterOrderItems(term);
    });
  }

  filterOrderItems(term: string): IOrderItemFull[] {
    if (!term) {
      return this.listOrderItems;
    }
    const lowerTerm = term.toLowerCase();
    const values = this.listOrderItems.filter(o =>
      o.fields.product.fields.name.toLowerCase().includes(lowerTerm) ||
      o.fields.order.fields.created_at.toLowerCase().includes(lowerTerm) ||
      o.fields.quantity.toString().includes(lowerTerm) ||
      o.fields.product.fields.price.toString().includes(lowerTerm) ||
      o.fields.product.fields.category.fields.name.toLowerCase().includes(lowerTerm) ||
      o.fields.product.fields.description.toLowerCase().includes(lowerTerm) ||
      o.fields.size.toLowerCase().includes(lowerTerm) ||
      o.fields.order.fields.customer.fields.first_name.toLowerCase().includes(lowerTerm) ||
      o.fields.order.fields.customer.fields.last_name.toLowerCase().includes(lowerTerm) ||
      o.fields.order.fields.customer.fields.email.toLowerCase().includes(lowerTerm) ||
      o.fields.order.fields.customer.fields.phone.toLowerCase().includes(lowerTerm) ||
      o.fields.order.fields.customer.fields.address.toLowerCase().includes(lowerTerm) ||
      o.fields.order.fields.customer.fields.city.toLowerCase().includes(lowerTerm) ||
      o.fields.order.fields.customer.fields.postal_code.toLowerCase().includes(lowerTerm) ||
      o.fields.order.fields.customer.fields.country.fields.name.toLowerCase().includes(lowerTerm)
    );
    return values;
  }

  subscribeToOrderItemList(): void {
    this.orderService.getListOrders().subscribe({
      next: (carts: any) => {
        this.listOrderItems = carts.map((cart: any) => ({
          ...cart,
          selected: true
        }));
        this.filteredOrderItems = this.listOrderItems;
        this.updateTotal();
      },
      error: (error: any) => {
        console.error('Request failed:', error);
      }
    });
  }

  selectAllText(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.select();
  }

  getImageUrl(imagePath: string): string {
    const ROOT_URL = environment.serviceHost;
    return `${environment.serviceHost}${imagePath}`;
  }

  calculateTotalAmount(order: IOrderItemFull): string {
    let total = order?.fields?.quantity * order?.fields?.product?.fields?.price;
    return total.toFixed(2);
  }

  updateTotal(): void {
    this.totalSelectedAmount = this.filteredOrderItems.reduce(
      (acc, item) => acc + parseFloat(this.calculateTotalAmount(item)), 0);
    this.totalSelectedAmountString = this.totalSelectedAmount.toFixed(2);
  }

  onDelete(pk: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this order!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = { id: pk };
        this.orderService.deleteOrder(payload).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Order item has been deleted successfully!',
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
