import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActionButton } from './action-button';

@Component({
  imports: [ActionButton],
  template: '<app-action-button>Save employee <span suffix aria-hidden="true">→</span></app-action-button>',
})
class TestHost {}

it('renders a submit action with projected label and suffix', () => {
  const fixture = TestBed.createComponent(TestHost);
  fixture.detectChanges();
  const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  expect(button.type).toBe('submit');
  expect(button.textContent).toContain('Save employee');
  expect(button.querySelector('[suffix]')?.textContent).toBe('→');
  expect(button.className).toContain('bg-teal');
});
