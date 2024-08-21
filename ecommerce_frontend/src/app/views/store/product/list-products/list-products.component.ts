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
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconDirective } from '@coreui/icons-angular';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductService } from 'src/app/services/product.service';
import { IProduct } from 'src/app/interfaces/iproduct.interface';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-tables',
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.scss'],
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
    RouterModule,
    ReactiveFormsModule,
    FormModule
  ]
})
export class ListProductsComponent implements OnInit {

  module: string = 'products';

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
      this.productService.loadListProducts();
      this.subscribeToProductList();
      this.setupSearch();
    }
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
}
