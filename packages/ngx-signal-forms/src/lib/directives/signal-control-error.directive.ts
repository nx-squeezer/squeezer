import { Directive, TemplateRef, ViewContainerRef, effect, inject, input, untracked } from '@angular/core';

import { SignalValidationResult } from '../models/signal-validator';
import { SIGNAL_CONTROL_ERROR_STRATEGY } from '../tokens/signal-control-error-strategy.token';

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
  private readonly templateRef = inject(TemplateRef<{ $implicit: TConfig }>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly errorStrategy = inject(SIGNAL_CONTROL_ERROR_STRATEGY);

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
    const shouldRender: boolean = error != null && this.errorStrategy(error.control);

    if (error != null && shouldRender && !this.rendered) {
      // TODO: remove untracked once angular does not track when creating a view
      untracked(() => this.vcr.createEmbeddedView(this.templateRef, { $implicit: error.config }));
      this.rendered = true;
    } else if (!shouldRender && this.rendered) {
      untracked(() => this.vcr.clear());
      this.rendered = false;
    }
  });

  /**
   * Type guard to return correct type for structural directive.
   */
  static ngTemplateGuard_ngxError<
    TKey extends string,
    TConfig,
    TValidationResult extends SignalValidationResult<TKey, TConfig>
  >(
    dir: SignalControlErrorDirective<TKey, TConfig, TValidationResult>,
    state: TValidationResult | undefined
  ): state is TValidationResult {
    return state != null;
  }

  /**
   * Directive context guard.
   */
  static ngTemplateContextGuard<
    TKey extends string,
    TConfig,
    TValidationResult extends SignalValidationResult<TKey, TConfig>
  >(
    directive: SignalControlErrorDirective<TKey, TConfig, TValidationResult>,
    context: unknown
  ): context is { $implicit: TConfig } {
    return true;
  }
}
