import {
  ElementRef,
  InputSignal,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';

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
   * Model value.
   */
  readonly value: Signal<T> = computed(() => this.control()());

  /**
   * Event callback when the value changes that can be used to reflect the state to the DOM.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onValueUpdated(value: T): void {
    return; // Default noop implementation
  }

  /**
   * Updates the underlying value of the control and marks it as dirty.
   */
  updateValue(value: T): void {
    this.control().set(value);
    this.#pristine.set(false);
  }

  /**
   * @internal
   */
  protected readonly watchValueChanges = effect(() => {
    const control = this.control();
    const value = control();
    untracked(() => this.onValueUpdated(value));
  });

  readonly #pristine: WritableSignal<boolean> = signal(true);

  /**
   * A control is pristine if the user has not yet changed the value in the UI.
   */
  readonly pristine: Signal<boolean> = this.#pristine.asReadonly();

  /**
   * A control is dirty if the user has changed the value in the UI.
   */
  readonly dirty: Signal<boolean> = computed(() => !this.pristine());
}
