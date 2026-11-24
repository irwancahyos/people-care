import { Component, input } from '@angular/core';

@Component({
  selector: 'app-action-button',
  template: `
    <button
      [type]="type()"
      class="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-teal px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ink"
      [class.w-full]="fullWidth()"
    >
      <ng-content />
      <ng-content select="[suffix]" />
    </button>
  `,
})
export class ActionButton {
  readonly type = input<'button' | 'submit'>('submit');
  readonly fullWidth = input(false);
}
