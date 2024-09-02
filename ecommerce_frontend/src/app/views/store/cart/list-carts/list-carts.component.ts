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
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { ICart, ICartFull } from 'src/app/interfaces/icart.interface';
import { IOrderItem } from 'src/app/interfaces/iorder.interface';
import { environment } from 'src/environments/environment.development';
import { size } from 'lodash-es';

@Component({
  selector: 'app-tables',
  templateUrl: './list-carts.component.html',
  styleUrls: ['./list-carts.component.scss'],
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
export class ListCartsComponent implements OnInit {

  module: string = 'carts';

  listCarts: ICartFull[] = [];
  filteredCarts: ICartFull[] = [];
  searchForm: FormGroup;
  totalSelectedAmount: number = 0;
  totalSelectedAmountString: string = '0.00';
  stateSelectAll: boolean = false;

  tableHeaders = [
    this.stateSelectAll ? 'Select All' : 'Unselect',
    '#',
    'Product',
    'Name',
    'Created At',
    'Quantity',
    'Price',
    'Amount',
    'Actions'
  ];

  @Input() iCart!: ICart;
  @Input() iCartFull!: ICartFull;

  constructor(
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      search_term: ['']
    });
  }

  ngOnInit(): void {
    const isStaff = localStorage.getItem('isStaff');
    if (isStaff !== 'user') {
      this.router.navigate(['/404']);
    } else {
      this.cartService.loadListCarts();
      this.subscribeToCartList();
      this.setupSearch();
    }
  }

  setupSearch(): void {
    this.searchForm.get('search_term')?.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filteredCarts = this.filterCarts(term);
      this.updateTotal();
    });
  }

  filterCarts(term: string): ICartFull[] {
    if (!term) {
      return this.listCarts;
    }

    const lowerTerm = term.toLowerCase();
    const values = this.listCarts.filter(cart =>
      cart.fields.product.fields.name.toLowerCase().includes(lowerTerm) ||
      cart.fields.created_at.toLowerCase().includes(lowerTerm) ||
      cart.fields.quantity.toString().includes(lowerTerm) ||
      cart.fields.product.fields.price.toString().includes(lowerTerm)
    );
    return values;
  }

  subscribeToCartList(): void {
    this.cartService.getListCarts().subscribe({
      next: (carts: any) => {
        this.listCarts = carts.map((cart: any) => ({
          ...cart,
          selected: true
        }));
        this.filteredCarts = this.listCarts;
        this.updateTotal();
      },
      error: (error: any) => {
        console.error('Request failed:', error);
      }
    });
  }

  navigateToEditCart(cart: ICartFull) {
    this.router.navigate(['/store/manage_cart'], { state: { cart: cart } });
  }

  selectAllText(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.select();
  }

  getImageUrl(imagePath: string): string {
    const ROOT_URL = environment.serviceHost;
    return `${environment.serviceHost}${imagePath}`;
  }

  calculateTotalAmount(cart: ICartFull): string {
    let total = cart?.fields?.quantity * cart?.fields?.product?.fields?.price;
    return total.toFixed(2);
  }

  updateTotal(): void {
    this.totalSelectedAmount = this.filteredCarts.filter(item => item.selected)
      .reduce((acc, item) => acc + parseFloat(this.calculateTotalAmount(item)), 0);
    this.totalSelectedAmountString = this.totalSelectedAmount.toFixed(2);
  }

  manageCart(cart: ICartFull): void {
    if (!cart || !cart.fields || !cart.fields.product) {
      console.error('Cart, fields or product is undefined', cart);
      return;
    }
    const payload = {
      id: cart.fields.id,
      product: cart.fields.product.fields.id,
      customer: localStorage.getItem('customerId'),
      quantity: cart.fields.quantity
    };
    try {
      this.cartService.manageCart(payload).subscribe();
      this.subscribeToCartList();
    } catch (error) {
      console.error('Request failed:', error);
    }
  }

  onDelete(pk: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this cart!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = { id: pk };
        this.cartService.deleteCart(payload).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Cart has been deleted successfully!',
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

  checkoutSelected(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to checkout selected cart(s) for $${this.totalSelectedAmount.toFixed(2)}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, checkout!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem('totalAmount', this.totalSelectedAmount.toFixed(2));
        const selectedItems = this.filteredCarts.filter(item => item.selected);
        const payload: {
          customer: string | null;
          email: string | null;
          full_name: string | null;
          total: number
        } &
        { listOrderItem: any[] } = {
          customer: localStorage.getItem('customerId'),
          email: localStorage.getItem('email'),
          full_name: `${localStorage.getItem('firstName')} ${localStorage.getItem('lastName')}`,
          total: this.totalSelectedAmount,
          listOrderItem: selectedItems.map(item => ({
            product: item.fields.product.fields.id,
            customer: localStorage.getItem('customerId'),
            quantity: item.fields.quantity,
            size: item.fields.size,
            idCart: item.fields.id
          }))
        };
        this.router.navigate(['/store/payment'], { state: { payload: payload } });
      }
    });
  }

  selectAll(): void {
    this.tableHeaders[0] = this.tableHeaders[0].includes('Select All') ? 'Unselect' : 'Select All';
    this.stateSelectAll = this.tableHeaders[0].includes('Select All') ? false : true
    this.filteredCarts.forEach(item => item.selected = this.stateSelectAll);
    this.updateTotal();
  }

  countSelected(): number {
    return this.filteredCarts.filter(item => item.selected).length;
  }

}
