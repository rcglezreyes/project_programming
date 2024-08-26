import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
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
import { SessionService } from 'src/app/services/session.service';
import { ICountry } from 'src/app/interfaces/icountry.interface';
import { ICustomer } from 'src/app/interfaces/icustomer.interface';
import { IApiResponse } from 'src/app/interfaces/iapiResponse.interface';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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
export class ProfileComponent implements OnInit {

  customStylesValidated = false;
  browserDefaultsValidated = false;
  tooltipValidated = false;

  @Input() iCountry!: ICountry;
  @Input() iCustomer!: ICustomer;

  profileForm: FormGroup;
  dataLoaded: boolean = false;
  hasErrors: boolean = false;

  listCountries: ICountry[] = [];

  customer: any = {};
  username: any = '';
  check_change = false;
  isAdmin: boolean = localStorage.getItem('isStaff') === 'admin';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private sessionService: SessionService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadDataForm();
  }

  loadDataForm() {
    this.sessionService.getSessionData().subscribe({
      next: (response) => {
        this.customer = response.customer
        console.log('Customer:', this.customer);
        this.username = response.username;
        this.customer = {
          ...this.customer,
          username: this.username
        };
        this.loadListCountries();
        this.initializeForm(this.customer);
        this.dataLoaded = true;
      },
      error: (error) => {
        console.error('Request failed:', error);
      },
      complete: () => {
        
      }
    });
  }

  onSubmit() {
    this.markFormGroupTouched(this.profileForm);
    if (this.profileForm.valid) {
      let payload = this.profileForm.value;
      payload = {
        ...payload,
        id: this.customer.id
      };
      if (!this.check_change) {
        delete payload.password;
        delete payload.new_password;
        delete payload.confirm_password;
      }
      if (this.isAdmin) {
        delete payload.phone;
        delete payload.address;
        delete payload.city;
        delete payload.postal_code;
        delete payload.country;
      }
      this.registerService.manageCustomer(payload, false, true).subscribe({
        next: (response: IApiResponse<any[]>) => {
          console.log('Response:', response);
          Swal.fire({
            title: 'Success!',
            text: `Profile has been updated successfully!`,
            icon: 'success',
            confirmButtonText: 'OK',
            willClose: () => {
              if (this.check_change) {
                localStorage.setItem('passwordChange', 'true');
                this.authService.logout();
              }
              this.router.navigate(['/dashboard']);
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
      console.log('Form is invalid:', this.profileForm.errors);
    }
  }

  initializeForm(customer: any): void {
    this.profileForm = this.fb.group({
      first_name: [customer ? customer.first_name : '', Validators.required],
      last_name: [customer ? customer.last_name : '', Validators.required],
      email: [
        customer ? customer.email : '',
        [
          Validators.required,
          Validators.email
        ],
        [
          this.validateExistingEmailInUsers.bind(this),
          this.validateExistingEmailInCustomers.bind(this)
        ]
      ],
      phone: [
        customer ? customer.phone : '', 
        this.isAdmin ? [] : [Validators.required]
      ],
      address: [
        customer ? customer.address : '', 
        this.isAdmin ? [] : [Validators.required]
      ],
      city: [
        customer ? customer.city : '', 
        this.isAdmin ? [] : [Validators.required]
      ],
      postal_code: [
        customer ? customer.postal_code : '',          
        this.isAdmin ? [] : [Validators.required, Validators.pattern(/^[0-9]+$/)]
      ],
      country: [
        customer ? customer.country : '', 
        this.isAdmin ? [] : [Validators.required]
      ],
      username: [
        customer ? customer.username : '', 
        [
          Validators.required, 
          Validators.minLength(6),
        ],
        [
          this.validateExistingUsername.bind(this)
        ]
      ],
      check_change_password: [false],
      new_password: [''],
      confirm_password: ['']
    });
    this.profileForm.get('new_password')?.disable();
    this.profileForm.get('confirm_password')?.disable();
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

  setChangePassword(event: any): void {
    this.check_change = (event.target as HTMLInputElement).checked;
    if (this.check_change) {
      this.profileForm.get('new_password')?.enable();
      this.profileForm.get('confirm_password')?.enable();
      this.profileForm.get('new_password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.profileForm.get('confirm_password')?.setValidators([Validators.required, this.passwordMatchValidator.bind(this)]);
    } else {
      this.profileForm.get('new_password')?.clearValidators();
      this.profileForm.get('confirm_password')?.clearValidators();
      this.profileForm.get('new_password')?.setValue('');
      this.profileForm.get('confirm_password')?.setValue('');
      this.profileForm.get('new_password')?.disable();
      this.profileForm.get('confirm_password')?.disable();
    }
    this.profileForm.get('new_password')?.updateValueAndValidity();
    this.profileForm.get('confirm_password')?.updateValueAndValidity();
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
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
    if (!this.profileForm) return null;
    const password = this.profileForm.get('new_password')?.value;
    const confirmPassword = control.value;
    return password !== confirmPassword ? { mismatch: true } : null;
  }

  private async validateExistingUsername(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.profileForm) return null;
    const username = control.value;
    if (!username) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingUsername(username));
      const data = JSON.parse(response.data);
      const existingUsername = data.length > 0 && this.customer.email != data[0].fields.email;
      return existingUsername ? { existingUsername: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

  private async validateExistingEmailInUsers(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.profileForm) return null;
    const email = control.value;
    if (!email) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingEmailInUsers(email));
      const data = JSON.parse(response.data);
      const existingEmailInUsers = data.length > 0 && this.customer.email != data[0].fields.email;
      return existingEmailInUsers ? { existingEmailInUsers: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

  private async validateExistingEmailInCustomers(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.profileForm) return null;
    const email = control.value;
    if (!email) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingEmailInCustomers(email));
      const data = JSON.parse(response.data);
      const existingEmailInCustomers = data.length > 0 && this.customer.id != data[0].pk;
      return existingEmailInCustomers ? { existingEmailInCustomers: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

}
