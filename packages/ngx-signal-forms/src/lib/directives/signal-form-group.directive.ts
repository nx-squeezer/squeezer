import {
  DestroyRef,
  Directive,
  Injector,
  Input,
  WritableSignal,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';

/**
 * @internal
 */
type SignalFormGroupControls<T extends object> = {
  [K in keyof T]?: WritableSignal<T[K]>;
};

/**
 * Control directive.
 */
@Directive({
  selector: `[ngxFormGroup]`,
  standalone: true,
  exportAs: 'ngxFormGroup',
})
export class SignalFormGroupDirective<T extends object> extends SignalControlDirective<T> {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formGroupControlsMap: SignalFormGroupControls<T> = {};

  /**
   * Model.
   */
  @Input({ alias: 'ngxFormGroup', required: true }) override control!: WritableSignal<T>;

  /**
   * Returns a signal with the value of the form group at a given key.
   */
  get<K extends keyof T>(key: K): WritableSignal<T[K]> {
    return this.formGroupControlsMap[key] ?? this.createControlSignal(key);
  }

  private createControlSignal<K extends keyof T>(key: K): WritableSignal<T[K]> {
    const value = untracked(() => this.control());
    const control = signal(value[key]);

    const scheduleEffect = setTimeout(() => {
      effect(() => this.updateFormGroupField(key, control()), { allowSignalWrites: true, injector: this.injector });
    }, 0);
    this.destroyRef.onDestroy(() => clearTimeout(scheduleEffect));

    this.formGroupControlsMap[key] = control;
    return control;
  }

  private updateFormGroupField<K extends keyof T>(key: K, value: T[K]) {
    const groupValue = untracked(() => this.control());

    if (!Object.is(groupValue[key], value)) {
      this.control.set({ ...groupValue, [key]: value });
    }
  }

  /**
   * @internal
   */
  protected readonly updateValue = effect(() => applyFormGroupState(this.control(), this.formGroupControlsMap), {
    allowSignalWrites: true,
  });
}

/**
 * @internal
 */
function applyFormGroupState<T extends object>(value: T, controlsMap: SignalFormGroupControls<T>) {
  const keys = new Set([...Object.keys(value), ...Object.keys(controlsMap)]) as Set<keyof T>;
  keys.forEach((key) => controlsMap[key]?.set(value[key]));
}
