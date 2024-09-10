import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private apiUrl = environment.apiOpenAi;
  private apiKey = environment.apiOpenAiKey;

  constructor() {}

  findProducts(message: string, products: any[]): any[] {
    const keyWords = message.toLowerCase().split(' ');
    return products.filter(product => {
      const name = product.fields.name.toLowerCase();
      const description = product.fields.description.toLowerCase();
      const category = product.fields.category.fields.name.toLowerCase();
      return keyWords.some(word =>
        name.includes(word) ||
        description.includes(word) ||
        category.includes(word)
      );
    });
  }

  async sendMessage(message: string): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const language = this.detectLanguage(message); 

    const data = {
      model: 'gpt-4o-mini',  // Puedes usar 'gpt-3.5-turbo' si prefieres
      messages: [{ role: 'user', content: message }]
    };

    try {
      const response = await axios.post(this.apiUrl, data, { headers });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error);
      return language === 'es' ? 'No se pudo procesar tu solicitud' : 'Could not process your request';
    }
  }

  detectLanguage(message: string): string {
    const lowerCaseMessage = message.toLowerCase();
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'los', 'las', 'en', 'un', 'una'];
    const englishWords = ['the', 'and', 'of', 'in', 'to', 'is', 'it', 'you', 'that'];
    const isSpanish = spanishWords.some(word => lowerCaseMessage.includes(word));
    const isEnglish = englishWords.some(word => lowerCaseMessage.includes(word));
    if (isSpanish) {
      return 'es';
    } else if (isEnglish) {
      return 'en';
    } else {
      return 'en';
    }
  }
  

  async detectLanguageWithLibreTranslate(text: string): Promise<string> {
    const url = 'https://libretranslate.com/detect';
    
    try {
      const response = await axios.post(url, { q: text });
      const language = response.data[0].language;
      return language; 
    } catch (error) {
      console.error('Error al detectar el idioma:', error);
      return 'en'; 
    }
  }

}
