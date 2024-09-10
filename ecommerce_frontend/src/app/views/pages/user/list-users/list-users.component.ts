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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconDirective } from '@coreui/icons-angular';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { UserService } from '../../../../services/user.service';
import { IUser, IUserFull } from '../../../../interfaces/iuser.interface';

@Component({
  selector: 'app-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss'],
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
    ReactiveFormsModule
  ]
})
export class ListUsersComponent implements OnInit {

  module: string = 'users';

  listUsers: IUserFull[] = [];
  filteredUsers: IUserFull[] = [];
  searchForm: FormGroup;
  usernameLogged: string = '';

  tableHeaders = [
    '#',
    'Username',
    'First Name',
    'Last Name',
    'Role',
    'Email',
    'Last Login',
    'Actions'
  ];

  @Input() iUser!: IUser;

  constructor(
    private router: Router,
    private userService: UserService,
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
      this.userService.loadListUsers();
      this.subscribeToUserList();
      this.setupSearch();
      this.usernameLogged = localStorage.getItem('username') || '';
    }
  }

  setupSearch(): void {
    this.searchForm.get('search_term')?.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filteredUsers = this.filterUsers(term);
    });
  }

  filterUsers(term: string): IUserFull[] {
    if (!term) {
      return this.listUsers;
    }

    const lowerTerm = term.toLowerCase();
    return this.listUsers.filter(user =>
      user.fields.first_name.toLowerCase().includes(lowerTerm) ||
      user.fields.last_name.toLowerCase().includes(lowerTerm) ||
      user.fields.email.toLowerCase().includes(lowerTerm) ||
      user.fields.username.toLowerCase().includes(lowerTerm)
    );
  }

  subscribeToUserList(): void {
    this.userService.getListUsers().subscribe({
      next: (users) => {
        this.listUsers = users;
        this.filteredUsers = users;
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

  navigateToManageUser() {
    this.router.navigate(['/pages/user/manage_user']);
  }

  navigateToEditUser(user: IUserFull) {
    this.router.navigate(['/pages/user/manage_user'], { state: { user: user } });
  }

  onDelete(pk: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = { id: pk };
        this.userService.deleteUser(payload).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'User has been deleted successfully!',
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
}
