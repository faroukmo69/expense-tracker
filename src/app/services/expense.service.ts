import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/expenses';

  private readonly _expenses = signal<Expense[]>([]);
  readonly expenses = this._expenses.asReadonly();

  private readonly _editingExpense = signal<Expense | null>(null);
  readonly editingExpense = this._editingExpense.asReadonly();

  readonly loading = signal(false);
  readonly error = signal('');

  loadExpenses(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<Expense[]>(this.apiUrl).subscribe({
      next: list => {
        this._expenses.set(list.filter(expense => expense.id !== undefined && expense.id !== null));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load expenses. Is json-server running?');
        this.loading.set(false);
      }
    });
  }

  addExpense(expense: Omit<Expense, 'id'>): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  updateExpense(expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${expense.id}`, expense);
  }

  deleteExpense(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  startEdit(expense: Expense): void {
    this._editingExpense.set(expense);
  }

  stopEdit(): void {
    this._editingExpense.set(null);
  }
}