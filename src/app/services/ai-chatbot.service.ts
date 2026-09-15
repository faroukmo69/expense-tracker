import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';
import { environment } from '../../environments/environment';

export interface ChatbotRequest {
  message: string;
  sessionId: string;
  expenses: Expense[];
}

export interface ChatbotResponse {
  output: string;
}

@Injectable({ providedIn: 'root' })
export class AiChatbotService {
  private readonly http = inject(HttpClient);
  private readonly sessionId = this.createSessionId();

  sendMessage(message: string, expenses: Expense[]): Observable<ChatbotResponse> {
    const body: ChatbotRequest = { message, sessionId: this.sessionId, expenses };
    return this.http.post<ChatbotResponse>(environment.aiAgentWebhookUrl, body);
  }

  private createSessionId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}