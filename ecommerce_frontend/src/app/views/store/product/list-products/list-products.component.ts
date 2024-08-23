import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
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
  FormModule,
} from '@coreui/angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconDirective } from '@coreui/icons-angular';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductService } from 'src/app/services/product.service';
import { IProduct } from 'src/app/interfaces/iproduct.interface';
import { environment } from 'src/environments/environment.development';
import { CartService } from 'src/app/services/cart.service';
import { ICart } from 'src/app/interfaces/icart.interface';

@Component({
  selector: 'app-tables',
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
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
    RouterModule,
    ReactiveFormsModule,
    FormModule,
    NgSelectModule,
    FormsModule
  ]
})
export class ListProductsComponent implements OnInit {

  module: string = 'products';

  isStaff: boolean = localStorage.getItem('isStaff') === 'admin';

  listProducts: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  searchForm: FormGroup;

  tableHeaders = [
    '#',
    'Image',
    'Name',
    'Price',
    'Stock',
    'Available',
    'Category',
    'Actions'
  ];

  @Input() iProduct!: IProduct;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search_term: ['']
    });
  }

  ngOnInit(): void {
    const isStaff = localStorage.getItem('isStaff');
    this.productService.loadListProducts();
    this.subscribeToProductList();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchForm.get('search_term')?.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(term => {
      console.log('Search term:', term);
      this.filteredProducts = this.filterProducts(term);

    });
  }
  filterProducts(term: string): IProduct[] {
    if (!term) {
      return this.listProducts;
    }

    const lowerTerm = term.toLowerCase();
    return this.listProducts.filter(product =>
      product.fields.name.toLowerCase().includes(lowerTerm) ||
      product.fields.price === parseFloat(lowerTerm) ||
      product.fields.stock === parseInt(lowerTerm) ||
      product.fields.description.toLowerCase().includes(lowerTerm) ||
      product.fields.category.fields.name.toLowerCase().includes(lowerTerm)
    );
  }

  subscribeToProductList(): void {
    this.productService.getListProducts().subscribe({
      next: (products) => {
        this.listProducts = products;
        this.listProducts.forEach(product => {
          product.quantity = 1;
        });
        this.filteredProducts = products;
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

  navigateToManageProduct() {
    this.router.navigate(['/store/manage_product']);
  }

  navigateToEditProduct(product: IProduct) {
    this.router.navigate(['/store/manage_product'], { state: { product: product } });
  }

  onDelete(pk: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this product!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = { id: pk };
        this.productService.deleteProduct(payload).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Product has been deleted successfully!',
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

  getImageUrl(imagePath: string): string {
    const ROOT_URL = environment.serviceHost;
    return `${environment.serviceHost}${imagePath}`;
  }

  increaseQuantity(product: IProduct): void {
    product.quantity += 1;
  }

  decreaseQuantity(product: IProduct): void {
    if (product.quantity > 1) {
      product.quantity -= 1;
    }
  }

  addToCart(product: IProduct): void {
    const payload = {
      product: product.pk,
      customer: localStorage.getItem('customerId'),
      quantity: product.quantity,
      size: product.size ?
        product.size : (product.fields.category.fields.sizes[0] ?
          product.fields.category.fields.sizes[0] : '')
    };

    this.cartService.manageCart(payload).subscribe({
      next: () => {
        Swal.fire({
          title: 'Success!',
          text: 'Product has been added to cart successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          // willClose: () => {
          //   window.location.reload();
          // }
        });
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

}
