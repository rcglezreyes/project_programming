import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenaiService } from '../../../services/chatbot.service';
import { ProductService } from '../../../services/product.service';

@Component({
    selector: 'app-chatbot',
    standalone: true,
    templateUrl: './chatbot.component.html',
    styleUrls: ['./chatbot.component.scss'],
    imports: [
        FormsModule,
        CommonModule,
        MatTooltipModule
    ]
})
export class ChatbotComponent implements OnInit {
    messages: { from: string, text: string, timestamp: Date }[] = [];
    messageUser: string = '';
    listProducts: any[] = [];
    chatOpen = false;

    constructor(
        private openaiService: OpenaiService,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.subscribeToProductList();
    }

    toggleChat() {
        this.chatOpen = !this.chatOpen;
    }

    subscribeToProductList(): void {
        this.productService.getListProducts().subscribe({
            next: (products) => {
                this.listProducts = products;
                this.listProducts.forEach(product => {
                    product.quantity = 1;
                });
            },
            error: (error) => {
                console.error('Request failed:', error);
            }
        });
    }

    async sendMessage() {
        if (this.messageUser.trim()) {
            this.messages.push({ from: 'user', text: this.messageUser, timestamp: new Date() });
            const productsFound = this.openaiService.findProducts(this.messageUser, this.listProducts);
            if (productsFound.length > 0) {
                const language = this.openaiService.detectLanguage(this.messageUser);
                console.log('language:', language);
                const previousMessage = language === 'es' ?
                    'Encontramos un producto que coincide con tu búsqueda' :
                    'We found a product that matches your search';
                const responseProducts = productsFound.map(p =>
                    `${language === 'es' ? 'Producto' : 'Product'}: ${p.fields.name}, 
                    ${language === 'es' ? 'Precio' : 'Price'}: $${p.fields.price}, 
                    ${language === 'es' ? 'Stock' : 'In Stock'}: ${p.fields.stock}`).join('\n');
                this.messages.push({
                    from: 'bot',
                    text: `${previousMessage}: ${responseProducts}`,
                    timestamp: new Date()
                });
            } else {
                const response = await this.openaiService.sendMessage(this.messageUser);
                this.messages.push({ from: 'bot', text: response, timestamp: new Date() });
            }
            this.messageUser = '';
        }
    }
}
