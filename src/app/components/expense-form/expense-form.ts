import { Component, effect, inject, signal } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { ExpenseCategory, Expense } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';

export function notFutureDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const selected = new Date(control.value as string);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return selected.getTime() > today.getTime() ? { futureDate: true } : null;
  };
}

@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.css'
})
export class ExpenseForm {
  private readonly fb = inject(FormBuilder);
  private readonly expenseService = inject(ExpenseService);

  readonly categories: ExpenseCategory[] = [
    'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'
  ];

  readonly editingExpense = this.expenseService.editingExpense;
  readonly saving = signal(false);
  readonly feedback = signal('');

  readonly form = this.fb.group({
    amount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01)
    ]),
    category: this.fb.control<ExpenseCategory | null>(null, [Validators.required]),
    date: this.fb.control<string | null>(null, [Validators.required, notFutureDate()]),
    note: this.fb.control<string>('', [Validators.maxLength(200)])
  });

  constructor() {
    effect(() => {
      const expense = this.editingExpense();
      if (expense) {
        this.form.patchValue({
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          note: expense.note ?? ''
        });
      }
    });
  }

  isEditMode(): boolean {
    return this.editingExpense() !== null;
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;

    const value = this.form.getRawValue();
    const payload = {
      amount: value.amount as number,
      category: value.category as ExpenseCategory,
      date: value.date as string,
      note: value.note ? value.note : undefined
    };

    this.saving.set(true);
    this.feedback.set('');

    const editing = this.editingExpense();
    if (editing) {
      this.expenseService.updateExpense({ ...payload, id: editing.id })
        .subscribe({
          next: () => {
            this.expenseService.stopEdit();
            this.form.reset();
            this.expenseService.loadExpenses();
            this.saving.set(false);
            this.feedback.set('Expense updated successfully.');
          },
          error: () => {
            this.saving.set(false);
            this.feedback.set('Failed to update — please try again.');
          }
        });
    } else {
      this.expenseService.addExpense(payload)
        .subscribe({
          next: () => {
            this.form.reset();
            this.expenseService.loadExpenses();
            this.saving.set(false);
            this.feedback.set('Expense added successfully.');
          },
          error: () => {
            this.saving.set(false);
            this.feedback.set('Failed to add — please try again.');
          }
        });
    }
  }

  cancelEdit(): void {
    this.expenseService.stopEdit();
    this.form.reset();
    this.feedback.set('');
  }
}