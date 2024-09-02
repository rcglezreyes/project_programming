import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthService } from '../../../auth.service';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from '../../../services/register.service';
import { WebRequestService } from 'src/app/web-services/web-request.service';
import { ICountry } from 'src/app/interfaces/icountry.interface';
import { ICustomer } from 'src/app/interfaces/icustomer.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  providers: [
    RegisterService,
    WebRequestService
  ]
})
export class RegisterComponent implements OnInit {

  @Input() iCountry!: ICountry;
  @Input() iCustomer!: ICustomer;

  registerForm: FormGroup;
  hasErrors = false;

  listCountries: ICountry[] = [];
  selectedCountryId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private registerService: RegisterService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({});
    this.initializeForm();
  }

  ngOnInit(): void {
    this.registerForm.statusChanges.subscribe(status => {
      console.log('Form status changed:', status);
      this.onFormStatusChange(status);
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.loadListCountries();
    }
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['',
        [
          Validators.required,
          Validators.minLength(6),
        ],
        [
          this.validateExistingUsername.bind(this)
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ],
        [
          this.validateExistingEmailInUsers.bind(this),
          this.validateExistingEmailInCustomers.bind(this)
        ]
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required, this.passwordMatchValidator.bind(this)]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postal_code: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      country: [null, Validators.required]
    });
  }

  onFormStatusChange(status: string): void {
    if (status === 'VALID') {
      console.log('Form is valid, ready for submission.');
    } else if (status === 'INVALID') {
      console.log('Form is invalid, please correct the errors.');
    }
  }

  onSubmit() {
    this.markFormGroupTouched(this.registerForm);
    // this.registerForm.get('username')?.updateValueAndValidity();
    // this.registerForm.get('email')?.updateValueAndValidity();

    if (this.registerForm.valid) {
      console.log('Form is valid, processing submission...');
      this.registerService.manageCustomer(this.registerForm.value, true, false).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Success!',
            text: `Registration successful!`,
            icon: 'success',
            confirmButtonText: 'OK',
            willClose: () => {
              this.router.navigate(['/login']);
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

  private async validateExistingUsername(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.registerForm) return null;
    const username = control.value;
    if (!username) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingUsername(username));
      const existingUsername = JSON.parse(response.data).length > 0;
      return existingUsername ? { existingUsername: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

  private async validateExistingEmailInUsers(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.registerForm) return null;
    const email = control.value;
    if (!email) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingEmailInUsers(email));
      const existingEmailInUsers = JSON.parse(response.data).length > 0;
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
      const existingEmailInCustomers = JSON.parse(response.data).length > 0;
      return existingEmailInCustomers ? { existingEmailInCustomers: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
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
}
