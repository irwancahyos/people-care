import { Component, inject } from '@angular/core';
import { LucideCircleAlert, LucideCircleCheck, LucideTriangleAlert, LucideX } from '@lucide/angular';
import { ToastPosition, ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [LucideCircleAlert, LucideCircleCheck, LucideTriangleAlert, LucideX],
  template: `
    @for (position of positions; track position) {
      <div
        [attr.data-position]="position"
        class="pointer-events-none fixed z-50 flex max-h-[calc(100dvh-2rem)] w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 overflow-y-auto max-[639px]:left-4! max-[639px]:right-4! max-[639px]:w-auto max-[639px]:translate-x-0!"
        [class.top-4]="position.startsWith('top')"
        [class.bottom-4]="position.startsWith('bottom')"
        [class.left-4]="position.endsWith('left')"
        [class.right-4]="position.endsWith('right')"
        [class.left-1/2]="position.endsWith('center')"
        [class.-translate-x-1/2]="position.endsWith('center')"
      >
        @for (item of toast.items(); track item.id) {
          @if (item.position === position) {
            <div
              class="pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm text-ink"
              [class.border-line]="item.tone !== 'error'"
              [class.border-red-300]="item.tone === 'error'"
              [attr.role]="item.tone === 'error' ? 'alert' : 'status'"
            >
              <span
                class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg"
                [class.bg-emerald-50]="item.tone === 'success'"
                [class.text-teal]="item.tone === 'success'"
                [class.bg-amber-50]="item.tone === 'warning'"
                [class.text-amber-700]="item.tone === 'warning'"
                [class.bg-red-50]="item.tone === 'error'"
                [class.text-red-700]="item.tone === 'error'"
              >
                @switch (item.tone) {
                  @case ('success') { <svg lucideCircleCheck class="size-5" aria-hidden="true"></svg> }
                  @case ('warning') { <svg lucideTriangleAlert class="size-5" aria-hidden="true"></svg> }
                  @case ('error') { <svg lucideCircleAlert class="size-5" aria-hidden="true"></svg> }
                }
              </span>
              <p class="min-w-0 flex-1 pt-1 font-medium leading-5 break-words">{{ item.message }}</p>
              <button type="button" class="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface hover:text-ink" aria-label="Dismiss notification" (click)="toast.dismiss(item.id)">
                <svg lucideX class="size-4" aria-hidden="true"></svg>
              </button>
            </div>
          }
        }
      </div>
    }
  `,
})
export class ToastHost {
  readonly toast = inject(ToastService);
  readonly positions: ToastPosition[] = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right',
  ];
}
