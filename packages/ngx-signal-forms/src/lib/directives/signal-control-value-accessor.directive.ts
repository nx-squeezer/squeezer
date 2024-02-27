import { ElementRef, InputSignal, Signal, WritableSignal, computed, effect, inject, untracked } from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';

/**
 * Signal control value accessor.
 */
export abstract class SignalControlValueAccessor<TValue = unknown, TElement extends HTMLElement = HTMLElement> {
  /**
   * Reference to the control directive.
   */
  protected readonly controlDirective = inject<SignalControlDirective<TValue>>(SignalControlDirective, { self: true });

  /**
   * Reference to the host element.
   */
  protected readonly elementRef: ElementRef<TElement> = inject(ElementRef);

  /**
   * Native element where the directive is applied.
   */
  protected readonly nativeElement: TElement = this.elementRef.nativeElement;

  /**
   * Model control.
   */
  abstract readonly control: InputSignal<WritableSignal<TValue>>;

  /**
   * Model value.
   */
  readonly value: Signal<TValue> = computed(() => this.control()());

  /**
   * Event callback when the value changes that can be used to reflect the state to the DOM.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onValueUpdated(value: TValue): void {
    return; // Default noop implementation
  }

  /**
   * Updates the underlying value of the control and marks it as dirty.
   */
  updateValue(value: TValue): void {
    this.control().set(value);
    this.controlDirective.markAsDirty();
  }

  /**
   * @internal
   */
  protected readonly watchValueChanges = effect(() => {
    const control = this.control();
    const value = control();
    untracked(() => this.onValueUpdated(value));
  });
}
