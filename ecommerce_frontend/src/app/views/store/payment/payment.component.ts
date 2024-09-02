import { Component, OnInit } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent
} from '@coreui/angular';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent
    
  ]
})

export class PaymentComponent implements OnInit {
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: any;
  loading: boolean = false;
  cardComplete: boolean = false;
  errorMessage: any = '';
  quantity: number = localStorage.getItem('totalAmount') ? parseFloat(localStorage.getItem('totalAmount')!) : 0;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const isStaff = localStorage.getItem('isStaff');
    if (isStaff !== 'admin') {
      if (this.quantity === 0) {
        this.router.navigate(['/store/cart']);
      }
      else {
        this.initializeStripe();
      }
    }
  }

  async initializeStripe() {
    this.stripe = await loadStripe('pk_live_51PtffUCt8VOWEN4eQpjNwTO95xvO81IF73af6Yo05TMt2HEUKINhCkpCWkdbNcI5fk3NkPLsJmsoQzb4629pWZnd00DGYe8QeY');
    if (this.stripe) {
      this.elements = this.stripe.elements();
      const elementsOptions = { style: {} };
      this.card = this.elements.create('card', elementsOptions);
      this.card.mount('#card-element');
      this.card.on('change', (event: any) => {
        this.cardComplete = event.complete;  
        console.log('event:', event);
        console.log(this.cardComplete);
        if (event.error) {
          this.errorMessage = event.error.message;
        } else {
          this.errorMessage = null;
        }
      });
    }
  }

  async handlePayment() {

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to make a transaction of $${this.quantity.toFixed(2)}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, do it!',
      cancelButtonText: 'No, keep it'
    }).then(async (result) => {

      if (result.isConfirmed) {

        const paymentCard = await this.stripe?.createPaymentMethod({
          type: 'card',
          card: this.card,
          billing_details: {
            name: 'Jenny Rosen',
          },
        });

        const payload = history.state.payload;

        console.log('payload:', payload);

        try {
          this.orderService.manageOrder(payload).subscribe({
            next: () => {
              Swal.fire({
                title: 'Success!',
                text: 'Cart(s) has been checked out successfully!',
                icon: 'success',
                confirmButtonText: 'OK',
                willClose: () => {
                  this.router.navigate(['/store/carts']);
                }
              });

            },
            error: (error) => {
              console.error('Request failed:', error);
            }
          });
        } catch (error) {
          console.error('Request failed:', error);
        }

        // if (result?.error) {
        //   console.error(result.error.message);
        //   this.errorMessage = result.error.message;
        // } else {
        //   console.log('Payment method created:', result?.paymentMethod);
        //   this.errorMessage = '';
        //   this.loading = false;
        // }
      }
    })
  }
}
