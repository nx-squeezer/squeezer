import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { ValidatorDirective } from './validator.directive';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ValidatorDirective],
  selector: 'nx-squeezer-root',
  template: `
    <label [formGroup]="formGroup">
      Control:
      <input type="text" formControlName="control" nxSqueezerValidator />
    </label>
    <p *ngIf="formGroup.get('control')?.hasError('invalid')">Invalid</p>
  `,
})
export class AppComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.group({
    control: this.formBuilder.control('input'),
  });
}
