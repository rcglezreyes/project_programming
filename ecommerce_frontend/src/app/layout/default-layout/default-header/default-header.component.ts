import { Component, computed, DestroyRef, inject, Input, OnInit } from '@angular/core';
import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  ProgressBarDirective,
  ProgressComponent,
  SidebarToggleDirective,
  TextColorDirective,
  ThemeDirective
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { AlertModule } from '@coreui/angular';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay, filter, last, map, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../app/auth.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  standalone: true,
  imports: [
    ContainerComponent, 
    HeaderTogglerDirective, 
    SidebarToggleDirective, 
    IconDirective, 
    HeaderNavComponent, 
    NavItemComponent, 
    NavLinkDirective, 
    RouterLink, 
    RouterLinkActive, 
    NgTemplateOutlet, 
    BreadcrumbRouterComponent, 
    ThemeDirective, 
    DropdownComponent, 
    DropdownToggleDirective, 
    TextColorDirective, 
    AvatarComponent, 
    DropdownMenuDirective, 
    DropdownHeaderDirective, 
    DropdownItemDirective, 
    BadgeComponent, 
    DropdownDividerDirective, 
    ProgressBarDirective, 
    ProgressComponent, 
    NgStyle,
    AlertModule,
    CommonModule
  ]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit{

  readonly #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly apiUrl = 'http://localhost:8000';

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  user: any = {};

  numberCartItems: number = 0;

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode=> mode.name === currentMode)?.icon ?? 'cilSun';
  });

  constructor(
    private router: Router, 
    private http: HttpClient, 
    private authService: AuthService,
    private cartService: CartService
  ) {
    super();
    this.#colorModeService.localStorageItemName.set('ecommerce_frontend-theme-default');
    this.#colorModeService.eventName.set('ColorSchemeChange');

    this.#activatedRoute.queryParams
      .pipe(
        delay(1),
        map(params => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
        filter(theme => ['dark', 'light', 'auto'].includes(theme)),
        tap(theme => {
          this.colorMode.set(theme);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  @Input() sidebarId: string = 'sidebar1';

  ngOnInit(): void {
    this.user = {
      firstName: localStorage.getItem('firstName'),
      lastName: localStorage.getItem('lastName'),
      isStaff: localStorage.getItem('isStaff'),
      isAdmin: localStorage.getItem('isStaff') === 'admin',
      username: localStorage.getItem('username')
    };
    this.cartService.loadListCarts();
    this.cartService.getListCarts().subscribe((carts) => {
      this.numberCartItems = carts.length;
    });
  }

  handleLogout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Yes, logout!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
      }
    });
  }

}