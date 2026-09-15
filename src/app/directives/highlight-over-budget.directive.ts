import { Directive, ElementRef, effect, inject, input } from '@angular/core';
@Directive({
  selector: '[appHighlightOverBudget]'
})
export class HighlightOverBudgetDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly appHighlightOverBudget = input<number>(0);
  readonly threshold = input<number>(100);

  constructor() {
    effect(() => {
      const overBudget = this.appHighlightOverBudget() > this.threshold();
      this.host.nativeElement.style.backgroundColor = overBudget ? 'rgba(239, 68, 68, 0.18)' : '';
      this.host.nativeElement.style.borderColor = overBudget ? 'rgba(239, 68, 68, 0.55)' : '';
    });
  }
}