import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ExpenseCategory, Expense } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';
import { CategoryIconPipe } from '../../pipes/category-icon.pipe';
import { HighlightOverBudgetDirective } from '../../directives/highlight-over-budget.directive';

@Component({
  selector: 'app-expense-list',
  imports: [CurrencyPipe, CategoryIconPipe, HighlightOverBudgetDirective],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.css'
})
export class ExpenseList implements OnInit {
  readonly expenseService = inject(ExpenseService);

  readonly categories: ('All' | ExpenseCategory)[] = [
    'All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'
  ];

  readonly category = signal<'All' | ExpenseCategory>('All');
  readonly search = signal('');
  readonly sortBy = signal<'date' | 'amount'>('date');
  readonly sortDir = signal<'asc' | 'desc'>('desc');

  readonly threshold = signal(100);
  readonly pageSize = 10;
  readonly visibleCount = signal(this.pageSize);

  readonly filteredExpenses = computed(() => {
    let list = this.expenseService.expenses();

    if (this.category() !== 'All') {
      list = list.filter(expense => expense.category === this.category());
    }

    const query = this.search().trim().toLowerCase();
    if (query) {
      list = list.filter(expense => (expense.note ?? '').toLowerCase().includes(query));
    }

    const direction = this.sortDir() === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (this.sortBy() === 'amount') {
        return (a.amount - b.amount) * direction;
      }
      return a.date.localeCompare(b.date) * direction;
    });

    return list;
  });

  readonly total = computed(() =>
    this.filteredExpenses().reduce((sum, expense) => sum + expense.amount, 0)
  );

  readonly subtotals = computed<{ category: ExpenseCategory; sum: number }[]>(() => {
    const sums = new Map<ExpenseCategory, number>();
    for (const expense of this.expenseService.expenses()) {
      sums.set(expense.category, (sums.get(expense.category) ?? 0) + expense.amount);
    }
    return [...sums.entries()].map(([category, sum]) => ({ category, sum }));
  });

  readonly pagedExpenses = computed(() =>
    this.filteredExpenses().slice(0, this.visibleCount())
  );

  readonly hasMore = computed(() =>
    this.visibleCount() < this.filteredExpenses().length
  );

  constructor() {
    effect(() => {
      this.category();
      this.search();
      this.visibleCount.set(this.pageSize);
    });
  }

  ngOnInit(): void {
    this.expenseService.loadExpenses();
  }

  editExpense(expense: Expense): void {
    this.expenseService.startEdit(expense);
  }

  deleteExpense(expense: Expense): void {
    if (confirm(`Delete this ${expense.category} expense of ${expense.amount}?`)) {
      this.expenseService.deleteExpense(expense.id)
        .subscribe(() => this.expenseService.loadExpenses());
    }
  }

  loadMore(): void {
    this.visibleCount.update(count => count + this.pageSize);
  }

  onThresholdInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.threshold.set(value ? Number(value) : 100);
  }
}