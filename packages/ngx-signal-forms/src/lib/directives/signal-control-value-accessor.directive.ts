import { ElementRef, ModelSignal, Signal, computed, effect, inject, untracked } from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';

/**
 * Signal control value accessor.
 */
export abstract class SignalControlValueAccessor<TValue = unknown, TElement extends HTMLElement = HTMLElement> {
  /**
   * Reference to the control directive.
   */
  private readonly controlDirective = inject<SignalControlDirective<Readonly<TValue>>>(SignalControlDirective, {
    self: true,
  });

  readonly #elementRef: ElementRef<TElement> = inject(ElementRef);

  readonly #nativeElement: TElement = this.#elementRef.nativeElement;

  /**
   * Native element where the directive is applied.
   */
  readonly nativeElement: Signal<TElement> = computed(() => this.#nativeElement);

  /**
   * Model value.
   */
  abstract readonly value: ModelSignal<Readonly<TValue>>;

  /**
   * Event callback when the value changes that can be used to reflect the state to the DOM.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onValueUpdated(value: Readonly<TValue>): void {
    return; // Default noop implementation
  }

  /**
   * Updates the underlying value of the control and marks it as dirty.
   */
  updateValue(value: Readonly<TValue>): void {
    this.value.update(() => value);
    this.controlDirective.dirty.set(true);
  }

  /**
   * Marks the control as touched. A control is touched by focus and blur events that do not change the value.
   */
  markAsTouched(): void {
    this.controlDirective.touched.set(true);
  }

  /**
   * @internal
   */
  protected readonly watchValueChanges = effect(() => {
    const value = this.value();
    untracked(() => this.onValueUpdated(value));
  });
}
