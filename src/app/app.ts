import { Component } from '@angular/core';
import { ExpenseForm } from './components/expense-form/expense-form';
import { ExpenseList } from './components/expense-list/expense-list';
import { Chatbot } from './components/chatbot/chatbot';

@Component({
  selector: 'app-root',
  imports: [ExpenseForm, ExpenseList, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}