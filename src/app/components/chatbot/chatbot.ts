import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AiChatbotService } from '../../services/ai-chatbot.service';
import { ExpenseService } from '../../services/expense.service';

interface ChatMessage {
  from: 'user' | 'agent';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class Chatbot {
  private readonly chatbotService = inject(AiChatbotService);
  private readonly expenseService = inject(ExpenseService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly messages = signal<ChatMessage[]>([]);
  readonly draft = signal('');
  readonly loading = signal(false);

  formatAgentMessage(text: string): SafeHtml {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const html = escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  send(): void {
    const text = this.draft().trim();
    if (!text || this.loading()) return;

    const expensesToSend = this.expenseService.expenses();
    console.log('CHATBOT DEBUG — عدد المصاريف المتبعتة:', expensesToSend.length, expensesToSend);

    this.messages.update(list => [...list, { from: 'user', text }]);
    this.draft.set('');
    this.loading.set(true);

    this.chatbotService.sendMessage(text, expensesToSend)
      .subscribe({
        next: response => {
          this.messages.update(list => [...list, { from: 'agent', text: response.output }]);
        },
        error: () => {
          this.messages.update(list => [
            ...list,
            { from: 'agent', text: 'The assistant is unavailable right now. Please try again later.' }
          ]);
        },
        complete: () => this.loading.set(false)
      });
  }
}