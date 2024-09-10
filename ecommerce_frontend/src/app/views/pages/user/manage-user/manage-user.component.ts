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
import { RegisterService } from '../../../../services/register.service';
import { UserService } from '../../../../services/user.service';
import { IUser, IUserFull } from '../../../../interfaces/iuser.interface';
import { IApiResponse } from '../../../../interfaces/iapiResponse.interface';

@Component({
  selector: 'app-validation',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss'],
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
export class ManageUserComponent implements OnInit {

  customStylesValidated = false;
  browserDefaultsValidated = false;
  tooltipValidated = false;
  
  @Input() iUser!: IUser;
  @Input() iUserFull!: IUserFull;

  userForm: FormGroup;
  hasErrors = false;
  check_change = false;

  isEditMode = false;
  title = '';
  buttonText = '';

  user: IUserFull = {} as IUserFull;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({});
  }

  ngOnInit(): void {
    const isStaff = localStorage.getItem('isStaff');
    if (isStaff !== 'admin') {
      this.router.navigate(['/404']);
    }
    else {
      this.user = history.state.user;
      this.isEditMode = this.user ? true : false;
      this.title = this.isEditMode ? 'Edit User' : 'Add User';
      this.buttonText = this.isEditMode ? 'Update' : 'Save';
      this.initializeForm(this.user);
    }
  }

  onSubmit() {
    this.markFormGroupTouched(this.userForm);
    const text = this.isEditMode ? 'updated' : 'saved';
    if (this.userForm.valid) {
      let payload = this.userForm.value;
      if (!this.check_change) {
        delete payload.password;
        delete payload.new_password;
        delete payload.confirm_password;
      }
      console.log('Payload:', payload);
      this.userService.manageUser(payload).subscribe({
        next: (response: IApiResponse<any[]>) => {
          console.log('Response:', response);
          Swal.fire({
            title: 'Success!',
            text: `User has been ${text} successfully!`,
            icon: 'success',
            confirmButtonText: 'OK',
            willClose: () => {
              this.router.navigate(['/pages/user/users']);
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
      console.log('Form is invalid:', this.userForm.errors);
    }
  }

  initializeForm(user: IUserFull): void {
    this.userForm = this.fb.group({
      username: [
        user ? user.fields.username : '',
        [
          Validators.required
        ],
        [
          this.validateExistingUsername.bind(this)
        ]
      ],
      first_name: [user ? user.fields.first_name : '', Validators.required],
      last_name: [user ? user.fields.last_name : '', Validators.required],
      email: [
        user ? user.fields.email : '',
        [
          Validators.required,
          Validators.email
        ],
        [
          this.validateExistingEmailInCustomers.bind(this),
          this.validateExistingEmailInUsers.bind(this)
        ]
      ],
      is_staff: [user ? user.fields.is_staff : false],
      check_change_password: [false],
      new_password: [''],
      confirm_password: ['']
    });
    this.userForm.get('new_password')?.disable();
    this.userForm.get('confirm_password')?.disable();
  }

  setChangePassword(event: any): void {
    this.check_change = (event.target as HTMLInputElement).checked;
    if (this.check_change) {
      this.userForm.get('new_password')?.enable();
      this.userForm.get('confirm_password')?.enable();
      this.userForm.get('new_password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('confirm_password')?.setValidators([Validators.required, this.passwordMatchValidator.bind(this)]);
    } else {
      this.userForm.get('new_password')?.clearValidators();
      this.userForm.get('confirm_password')?.clearValidators();
      this.userForm.get('new_password')?.setValue('');
      this.userForm.get('confirm_password')?.setValue('');
      this.userForm.get('new_password')?.disable();
      this.userForm.get('confirm_password')?.disable();
    }
    this.userForm.get('new_password')?.updateValueAndValidity();
    this.userForm.get('confirm_password')?.updateValueAndValidity();
  }

  navigateToUsers() {
    this.router.navigate(['/pages/user/users']);
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
    if (!this.userForm) return null;
    const password = this.userForm.get('new_password')?.value;
    const confirmPassword = control.value;
    return password !== confirmPassword ? { mismatch: true } : null;
  }

  private async validateExistingEmailInCustomers(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.userForm) return null;
    const email = control.value;
    if (!email) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingEmailInCustomers(email));
      const data = JSON.parse(response.data);
      const existingEmailInCustomers = this.isEditMode ? data.length > 0 && this.user.fields.email != data[0].fields.email : data.length > 0;
      return existingEmailInCustomers ? { existingEmailInCustomers: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

  private async validateExistingEmailInUsers(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.userForm) return null;
    const email = control.value;
    if (!email) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingEmailInUsers(email));
      const data = JSON.parse(response.data);
      const existingEmailInUsers = this.isEditMode ? data.length > 0 && this.user.pk != data[0].pk : data.length > 0;
      return existingEmailInUsers ? { existingEmailInUsers: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

  private async validateExistingUsername(control: AbstractControl): Promise<{ [key: string]: boolean } | null> {
    if (!this.userForm) return null;
    const username = control.value;
    if (!username) return null;
    try {
      const response = await lastValueFrom(this.registerService.checkExistingUsername(username));
      const data = JSON.parse(response.data);
      const existingUsername = this.isEditMode ? data.length > 0 && this.user.fields.username != data[0].fields.username : data.length > 0;
      return existingUsername ? { existingUsername: true } : null;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }

}
