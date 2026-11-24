import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { FormInput } from './form-input';

it('keeps a reactive control, label and error connected to the native input', () => {
  const fixture = TestBed.createComponent(FormInput);
  fixture.componentRef.setInput('fieldId', 'email');
  fixture.componentRef.setInput('label', 'Email address');
  fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
  fixture.componentRef.setInput('errorMessage', 'Enter a valid email address.');
  fixture.detectChanges();
  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const control = fixture.componentInstance.control();
  expect(input.id).toBe('email');
  expect(fixture.nativeElement.querySelector('label')?.htmlFor).toBe('email');
  input.value = 'alex@example.com';
  input.dispatchEvent(new Event('input'));
  expect(control.value).toBe('alex@example.com');
  control.setErrors({ email: true });
  control.markAsTouched();
  fixture.detectChanges();
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.getAttribute('aria-describedby')).toBe('email-error');
  expect(fixture.nativeElement.querySelector('#email-error')?.textContent).toContain('Enter a valid email address.');
});

it('supports compact sizing for employee fields without changing default input sizing', () => {
  const fixture = TestBed.createComponent(FormInput);
  fixture.componentRef.setInput('fieldId', 'firstName');
  fixture.componentRef.setInput('label', 'First name');
  fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
  fixture.detectChanges();
  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  expect(input.classList.contains('min-h-12')).toBe(true);
  fixture.componentRef.setInput('compact', true);
  fixture.detectChanges();
  expect(input.classList.contains('h-8')).toBe(true);
  expect(input.classList.contains('min-h-12')).toBe(false);
  expect((fixture.nativeElement.querySelector('label') as HTMLElement).classList.contains('text-xs')).toBe(true);
});

it('toggles the password visibility without changing the control value', () => {
  const fixture = TestBed.createComponent(FormInput);
  fixture.componentRef.setInput('fieldId', 'password');
  fixture.componentRef.setInput('label', 'Password');
  fixture.componentRef.setInput('type', 'password');
  fixture.componentRef.setInput('control', new FormControl('secret', { nonNullable: true }));
  fixture.detectChanges();
  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const toggle = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  expect(input.type).toBe('password');
  expect(toggle.type).toBe('button');
  expect(toggle.getAttribute('aria-label')).toBe('Show password');
  toggle.click();
  fixture.detectChanges();
  expect(input.type).toBe('text');
  expect(toggle.getAttribute('aria-label')).toBe('Hide password');
  expect(fixture.componentInstance.control().value).toBe('secret');
});
