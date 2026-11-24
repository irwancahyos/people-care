import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-form-input',
  imports: [ReactiveFormsModule, LucideEye, LucideEyeOff],
  template: `
    <div class="flex items-center gap-1.5" [class.mb-2]="!compact()" [class.mb-1]="compact()">
      <label [for]="fieldId()" class="block font-bold text-ink" [class.text-sm]="!compact()" [class.text-xs]="compact()">
        {{ label() }} @if (required()) { <span class="text-teal">*</span> }
      </label>
      <ng-content select="[label-suffix]" />
    </div>
    <div class="relative flex items-center">
      <ng-content select="[prefix]" />
      <input
        class="w-full border border-line bg-white text-ink outline-none placeholder:text-muted focus:border-teal focus:ring-2 focus:ring-teal/15 aria-invalid:border-red-600"
        [class.min-h-12]="!compact()" [class.rounded-lg]="!compact()" [class.px-4]="!compact()" [class.py-3]="!compact()" [class.text-sm]="!compact()"
        [class.h-8]="compact()" [class.rounded-[4px]]="compact()" [class.px-3]="compact()" [class.text-[12px]]="compact()" [class.placeholder:text-[11px]]="compact()"
        [class.pr-12]="type() === 'password'"
        [id]="fieldId()"
        [type]="type() === 'password' && visible() ? 'text' : type()"
        [formControl]="control()"
        (change)="closeDatePicker($event)"
        [placeholder]="placeholder()"
        [autocomplete]="autocomplete()"
        [attr.max]="max() || null"
        [attr.min]="min() || null"
        [attr.step]="step() || null"
        [attr.aria-invalid]="control().touched && control().invalid"
        [attr.aria-describedby]="control().touched && control().invalid && errorMessage() ? fieldId() + '-error' : null"
      />
      @if (type() === 'password') {
        <button type="button" class="absolute right-3 grid size-8 cursor-pointer place-items-center text-muted hover:text-teal" [attr.aria-label]="visible() ? 'Hide password' : 'Show password'" [attr.aria-pressed]="visible()" (click)="visible.set(!visible())">
          @if (visible()) { <svg lucideEyeOff class="size-4" aria-hidden="true"></svg> }
          @else { <svg lucideEye class="size-4" aria-hidden="true"></svg> }
        </button>
      }
      <ng-content select="[suffix]" />
    </div>
    @if (control().touched && control().invalid && errorMessage()) {
      <small [id]="fieldId() + '-error'" class="mt-1.5 block text-xs text-red-700">{{ errorMessage() }}</small>
    }
  `,
})
export class FormInput {
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string>>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly errorMessage = input('');
  readonly required = input(false);
  readonly compact = input(false);
  readonly max = input('');
  readonly min = input('');
  readonly step = input('');
  readonly visible = signal(false);

  closeDatePicker(event: Event): void {
    if (this.type() === 'date') (event.target as HTMLInputElement).blur();
  }
}
