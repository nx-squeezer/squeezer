import { Directive, TemplateRef, ViewContainerRef, effect, inject, input, untracked } from '@angular/core';

import { SignalValidationResult } from '../models/signal-validator';

/**
 * Structural directive for a form control error.
 */
@Directive({
  selector: `ng-template[ngxError]`,
  standalone: true,
  exportAs: 'ngxError',
})
export class SignalControlErrorDirective<
  TKey extends string,
  TConfig,
  TValidationResult extends SignalValidationResult<TKey, TConfig>
> {
  private readonly templateRef = inject(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);

  /**
   * Control error.
   */
  readonly ngxError = input.required<TValidationResult | undefined>();

  private rendered = false;

  /**
   * @internal
   */
  protected readonly watchErrorChanges = effect(() => {
    const error = this.ngxError();
    const shouldRender: boolean = error != null && error.control.dirty() && error.control.touched();

    if (shouldRender && !this.rendered) {
      // TODO: provide directive context
      untracked(() => this.vcr.createEmbeddedView(this.templateRef));
      this.rendered = true;
    } else if (!shouldRender && this.rendered) {
      untracked(() => this.vcr.clear());
      this.rendered = false;
    }
  });
}
