import { ChangeDetectorRef, Component, ElementRef, forwardRef, Input, Renderer2 } from '@angular/core';

import { ToastComponent, ToasterService, ToastHeaderComponent, ToastBodyComponent, ToastCloseDirective, ProgressBarDirective, ProgressComponent } from '@coreui/angular';

import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-toast-simple',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    providers: [{ provide: ToastComponent, useExisting: forwardRef(() => AppToastComponent) }],
    standalone: true,
    imports: [
      ToastHeaderComponent, 
      ToastBodyComponent, 
      ToastCloseDirective, 
      ProgressBarDirective, 
      ProgressComponent,
      RouterLink
    ]
})
export class AppToastComponent extends ToastComponent {

  @Input() closeButton = true;
  @Input() title = '';
  @Input() message = '';
  @Input() href = '';

  constructor(
    public override hostElement: ElementRef,
    public override renderer: Renderer2,
    public override toasterService: ToasterService,
    public override changeDetectorRef: ChangeDetectorRef,
    public router: Router
  ) {
    super(hostElement, renderer, toasterService, changeDetectorRef);
  }

  navigateTo(event: MouseEvent) {
    event.stopPropagation();
    if (this.href) {
      window.location.href = this.href; 
    }
  }
}
