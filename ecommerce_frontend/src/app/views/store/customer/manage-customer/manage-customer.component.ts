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
import { RegisterService } from 'src/app/services/register.service';
import { CustomerService } from 'src/app/services/customer.service';
import { ICountry } from 'src/app/interfaces/icountry.interface';
import { ICustomer } from 'src/app/interfaces/icustomer.interface';
import { IApiResponse } from 'src/app/interfaces/iapiResponse.interface';

@Component({
  selector: 'app-validation',
  templateUrl: './manage-customer.component.html',
  styleUrls: ['./manage-customer.component.scss'],
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
  ],
  providers: [
    RegisterService,
  ]
})
export class ManageCustomerComponent implements OnInit {

  customStylesValidated = false;
  browserDefaultsValidated = false;
  tooltipValidated = false;

  @Input() iCountry!: ICountry;
  @Input() iCustomer!: ICustomer;

  registerForm: FormGroup;
  hasErrors = false;

  listCountries: ICountry[] = [];

  isEditMode = false;
  title = '';
  buttonText = '';

  customer: ICustomer = {} as ICustomer;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private customerService: CustomerService
  ) {
    this.registerForm = this.fb.group({});
  }

  ngOnInit(): void {
    const isStaff = localStorage.getItem('isStaff');
    if (isStaff !== 'admin') {
      this.router.navigate(['/404']);
    }
    else {
      this.customer = history.state.customer;
      this.isEditMode = this.customer ? true : false;
      this.title = this.isEditMode ? 'Edit Customer' : 'Add Customer';
      this.buttonText = this.isEditMode ? 'Update' : 'Save';
      this.loadListCountries();
      this.initializeForm(this.customer);
    }
  }

  onSubmit() {
    this.markFormGroupTouched(this.registerForm);
    const text = this.isEditMode ? 'updated' : 'saved';
    if (this.registerForm.valid) {
      const payload = this.isEditMode ?
                      { ...this.registerForm.value, id: this.customer.pk } :
                      this.registerForm.value;
      this.registerService.manageCustomer(payload, false).subscribe({
        next: (response: IApiResponse<any[]>) => {
          console.log('Response:', response);
          Swal.fire({
            title: 'Success!',
            text: `Customer has been ${text} successfully!`,
            icon: 'success',
            confirmButtonText: 'OK',
            willClose: () => {
              this.router.navigate(['/store/customers']);
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

  initializeForm(customer: ICustomer): void {
    this.registerForm = this.fb.group({
      first_name: [customer ? customer.fields.first_name : '', Validators.required],
      last_name: [customer ? customer.fields.last_name : '', Validators.required],
      email: [
        customer ? customer.fields.email : '',
        [
          Validators.required,
          Validators.email
        ],
        [
          this.validateExistingEmailInUsers.bind(this),
          this.validateExistingEmailInCustomers.bind(this)
        ]
      ],
      phone: [customer ? customer.fields.phone : '', Validators.required],
      address: [customer ? customer.fields.address : '', Validators.required],
      city: [customer ? customer.fields.city : '', Validators.required],
      postal_code: [
        customer ? customer.fields.postal_code : '',
        [Validators.required, Validators.pattern(/^[0-9]+$/)]
      ],
      country: [customer ? customer.fields.country : null, Validators.required]
    });
  }

  loadListCountries(): void {
    this.registerService.getListCountries().subscribe({
      next: (countries) => {
        this.listCountries = JSON.parse(countries.data);
      },
      error: (error) => {
        console.error('Request failed:', error);
      },
      complete: () => {
        console.log('Request completed.');
      }
    });
  }

  navigateToCustomers() {
    this.router.navigate(['/store/customers']);
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

  private async validateExistingEmailInUsers(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.registerForm) return null;
    const email = control.value;
    if (!email) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingEmailInUsers(email));
      const data = JSON.parse(response.data);
      const existingEmailInUsers = this.isEditMode ? data.length > 0 && this.customer.fields.email != data[0].fields.email : data.length > 0;
      return existingEmailInUsers ? { existingEmailInUsers: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

  private async validateExistingEmailInCustomers(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.registerForm) return null;
    const email = control.value;
    if (!email) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingEmailInCustomers(email));
      const data = JSON.parse(response.data);
      const existingEmailInCustomers = this.isEditMode ? data.length > 0 && this.customer.pk != data[0].pk : data.length > 0;
      return existingEmailInCustomers ? { existingEmailInCustomers: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

}
