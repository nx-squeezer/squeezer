import { Directive, Input, WritableSignal, computed } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

/**
 * Control directive.
 */
@Directive({
  selector: `[ngxControl]`,
  standalone: true,
})
export class SignalControlDirective<T> {
  /**
   * Model.
   */
  @Input({ alias: 'ngxControl', required: true }) control!: WritableSignal<T>;

  /**
   * Errors.
   */
  readonly errors = computed<ValidationErrors | null>(() => null);

  /**
   * Valid state.
   */
  readonly valid = computed(() => this.errors() == null);
}
