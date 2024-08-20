import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { DocsExampleComponent } from '@docs-components/public-api';
import {
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  FormFeedbackComponent,
  InputGroupComponent,
  InputGroupTextDirective,
  FormSelectDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  ButtonDirective,
  ListGroupDirective,
  ListGroupItemDirective
} from '@coreui/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { ProductService } from 'src/app/services/product.service';
import { ICategory } from 'src/app/interfaces/icategory.interface';
import { IProduct } from 'src/app/interfaces/iproduct.interface';
import { IApiResponse } from 'src/app/interfaces/iapiResponse.interface';

@Component({
  selector: 'app-validation',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    RowComponent,
    ColComponent,
    TextColorDirective,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    DocsExampleComponent,
    ReactiveFormsModule,
    FormsModule,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    FormFeedbackComponent,
    InputGroupComponent,
    InputGroupTextDirective,
    FormSelectDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    ButtonDirective,
    ListGroupDirective,
    ListGroupItemDirective,
    NgSelectModule,
    CommonModule
  ]
})
export class ManageProductComponent implements OnInit {

  customStylesValidated = false;
  browserDefaultsValidated = false;
  tooltipValidated = false;

  @Input() iCategory!: ICategory;
  @Input() iProduct!: IProduct;

  registerForm: FormGroup;
  hasErrors = false;

  listCategories: ICategory[] = [];

  isEditMode = false;
  title = '';
  buttonText = '';

  product: IProduct = {} as IProduct;

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductService
  ) {
    this.registerForm = this.fb.group({});
  }

  ngOnInit(): void {
    const isStaff = localStorage.getItem('isStaff');
    if (isStaff !== 'admin') {
      this.router.navigate(['/404']);
    }
    else {
      this.product = history.state.product;
      this.isEditMode = this.product ? true : false;
      this.title = this.isEditMode ? 'Edit Product' : 'Add Product';
      this.buttonText = this.isEditMode ? 'Update' : 'Save';
      this.loadListCategories();
      this.initializeForm(this.product);
    }
  }

  onSubmit() {
    this.markFormGroupTouched(this.registerForm);
    const text = this.isEditMode ? 'updated' : 'saved';
    if (this.registerForm.valid) {
      const formData = new FormData();
      formData.append('file', this.selectedFile as Blob);

      this.http.post<{ imageUrl: string }>('/api/upload', formData).subscribe({
        next: (response) => {
          // Guardar la URL de la imagen en el formulario
          this.form.get('imageUrl')?.setValue(response.imageUrl);
          
          // Aquí puedes enviar el formulario completo con la URL guardada
          console.log('Form data:', this.form.value);
        },
        error: (error) => {
          console.error('Error uploading file:', error);
        }
      });


      const payload = this.isEditMode ?
                      { ...this.registerForm.value, id: this.product.pk } :
                      this.registerForm.value;
      this.productService.manageProduct(payload).subscribe({
        next: (response: IApiResponse<any[]>) => {
          console.log('Response:', response);
          Swal.fire({
            title: 'Success!',
            text: `Product has been ${text} successfully!`,
            icon: 'success',
            confirmButtonText: 'OK',
            willClose: () => {
              this.router.navigate(['/store/products']);
            }
          });
        },
        error: (error) => {
          console.error('Request failed:', error);
        },
        complete: () => {
          console.log('Request completed.');
        }
      });
    } else {
      this.hasErrors = true;
      console.log('Form is invalid:', this.registerForm.errors);
    }
  }

  initializeForm(product: IProduct): void {
    this.registerForm = this.fb.group({
      name: [product ? product.fields.name : '', Validators.required],
      price: [product ? product.fields.price : '', Validators.required],
      stock: [
        product ? product.fields.stock : '',
        [Validators.required, Validators.pattern(/^[0-9]+$/)]
      ],
      category: [product ? product.fields.category : null, Validators.required],
      description: [product ? product.fields.description : ''],
      image: [product ? product.fields.image : '']
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result ?? null; 
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  loadListCategories(): void {
    this.productService.loadListCategories().subscribe({
      next: (categories) => {
        this.listCategories = JSON.parse(categories.data);
      },
      error: (error) => {
        console.error('Request failed:', error);
      },
      complete: () => {
        console.log('Request completed.');
      }
    });
  }

  navigateToProducts() {
    this.router.navigate(['/store/products']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched({ onlySelf: true });
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!this.registerForm) return null;
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = control.value;
    return password !== confirmPassword ? { mismatch: true } : null;
  }

}
