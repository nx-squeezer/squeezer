import { ElementRef, InputSignal, WritableSignal, effect, inject, untracked } from '@angular/core';

/**
 * Signal control value accessor.
 */
export abstract class SignalControlValueAccessor<T = unknown, E extends HTMLElement = HTMLElement> {
  /**
   * Reference to the host element.
   */
  protected readonly elementRef: ElementRef<E> = inject(ElementRef);

  /**
   * Native element where the directive is applied.
   */
  protected readonly nativeElement: E = this.elementRef.nativeElement;

  /**
   * Model control.
   */
  abstract readonly control: InputSignal<WritableSignal<T>>;

  /**
   * This method is called after the value is updated and can be used to reflect it in the DOM.
   */
  abstract afterValueUpdate(value: T): void;

  /**
   * @internal
   */
  protected readonly updateValue = effect(() => {
    const control = this.control();
    const value = control();
    untracked(() => this.afterValueUpdate(value));
  });
}
