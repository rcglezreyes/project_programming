import {
  Component,
  computed,
  DestroyRef,
  ChangeDetectorRef,
  inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AlertModule } from '@coreui/angular';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  delay,
  filter,
  map,
  tap,
} from 'rxjs/operators';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../app/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { environment } from 'src/environments/environment.development';
import { ICartFull } from 'src/app/interfaces/icart.interface';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.scss'],
  standalone: true,
  // changeDetection: ChangeDetectionStrategy.OnPush,
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
    CommonModule,
    NgbModule
  ]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit, OnDestroy {

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

  carts: ICartFull[] = [];

  private cartsSubscription: Subscription = new Subscription();

  isDrawerOpen = false;

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
    if (!this.user.isAdmin) {
      this.cartService.loadListCarts();
      this.cartsSubscription = this.cartService.getListCarts().subscribe((carts) => {
        this.numberCartItems = carts.length;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.cartsSubscription) {
      this.cartsSubscription.unsubscribe();
    }
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

  seeDrawer(): void {
    this.handleLoadCartItems();
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  calculateTotal(cart: ICartFull): string {
    const quantity = cart?.fields?.quantity;
    const price = cart?.fields?.product?.fields?.price;
    const total = quantity * price;
    return total.toFixed(2);
  }

  getImageUrl(cart: ICartFull): string {
    const ROOT_URL = environment.serviceHost;
    const imagePath = cart?.fields?.product?.fields?.image;
    return `${environment.serviceHost}${imagePath}`;
  }

  getProductName(cart: ICartFull): string {
    return cart?.fields?.product?.fields?.name;
  }

  getQuantity(cart: ICartFull): number {
    return cart?.fields?.quantity;
  }

  calculateTotalAmount(): string {
    let total = 0;
    this.carts.forEach((cart: ICartFull) => {
      if (cart) {
        total += cart?.fields?.quantity * cart?.fields?.product?.fields?.price;
      }
    });
    return total.toFixed(2);
  }

  handleLoadCartItems(): void {
    this.cartService.loadListCarts();
    this.cartsSubscription = this.cartService.getListCarts().subscribe((carts) => {
      this.numberCartItems = carts.length;
      this.carts = carts;
    });
  }

  navigateToCarts(): void {
    this.isDrawerOpen = false;
    this.router.navigate(['/store/carts']);
  }
  
}