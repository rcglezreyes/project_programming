import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  FormFeedbackComponent,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective
} from '@coreui/angular';
import { AuthService } from '../../../auth.service';
import { Router, RouterModule } from '@angular/router';
import { AlertModule } from '@coreui/angular';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    FormFeedbackComponent,
    ButtonDirective,
    NgStyle,
    FormsModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AlertModule
  ]
})
export class LoginComponent {

  loginForm: FormGroup;
  username: string = '';
  password: string = '';
  error: string = '';
  success: string = '';
  loading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async handleSubmit() {
    if (this.loginForm.valid) {
  
      this.loading = true;
      this.error = '';
      this.success = '';
  
      // Obtén los valores del formulario
      const { username, password } = this.loginForm.value;
  
      try {
        const jwtResponse: any = await this.authService.login(username, password).toPromise();
  
        if (!jwtResponse) {
          this.error = 'Invalid Credentials: No active account found with the given credentials';
          throw new Error(this.error);
        }
  
        localStorage.setItem('accessToken', jwtResponse.access);
        localStorage.setItem('refreshToken', jwtResponse.refresh);
  
        const loginResponse: any = await lastValueFrom(this.authService.authenticate(username, password));

        console.log(loginResponse);
  
        if (loginResponse) {
          this.success = 'Login successful';
          localStorage.setItem('isStaff', loginResponse.is_staff);
          localStorage.setItem('username', loginResponse.username);
          localStorage.setItem('firstName', loginResponse.first_name);
          localStorage.setItem('lastName', loginResponse.last_name);
          await this.router.navigate(['/dashboard']);
          location.reload();
        } else {
          this.error = 'Login failed: Invalid response';
          throw new Error(this.error);
        }
  
      } catch (error) {
        this.error = `${error}`;
      } finally {
        this.loading = false;
      }
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }
  

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched({ onlySelf: true });
    });
  }

}
