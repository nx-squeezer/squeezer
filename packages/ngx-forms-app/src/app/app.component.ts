import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { lazyValidator } from '@nx-squeezer/ngx-forms';

import { ValidatorDirective } from './validator.directive';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ValidatorDirective],
  selector: 'nx-squeezer-root',
  template: `
    <form [formGroup]="formGroup">
      <p>
        <label>
          Directive:
          <input type="text" formControlName="directive" nxSqueezerValidator />
        </label>
        {{ formGroup.get('directive')?.value }}
      </p>
      <p *ngIf="showDirectiveError">Invalid directive</p>

      <p>
        <label>
          Lazy:
          <input type="text" formControlName="lazy" />
        </label>
        {{ formGroup.get('lazy')?.value }}
      </p>
      <p *ngIf="showLazyError">Invalid lazy</p>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.group({
    directive: this.formBuilder.control('input'),
    lazy: this.formBuilder.control('invalid', { asyncValidators: [lazyValidator(() => import('./validator'))] }),
  });

  get showDirectiveError(): boolean {
    return this.formGroup.get('directive')?.hasError('invalid') ?? false;
  }

  get showLazyError(): boolean {
    return this.formGroup.get('lazy')?.hasError('invalid') ?? false;
  }
}
