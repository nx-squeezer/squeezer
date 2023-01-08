import { ChangeDetectionStrategy, Component, ElementRef, inject, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideAsync } from '../providers/provide-async.function';
import { ResolveAsyncProvidersDirective } from './resolve-async-providers.directive';

const STRING_INJECTOR_TOKEN = new InjectionToken<string>('string');
const stringAsyncFactory = () => Promise.resolve('text');

@Component({
  selector: 'ngx-child-component',
  template: `Async injector value: {{ text }}`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ChildTestComponent {
  readonly text = inject(STRING_INJECTOR_TOKEN);
}

@Component({
  template: ` <ngx-child-component *ngxResolveAsyncProviders></ngx-child-component> `,
  imports: [ResolveAsyncProvidersDirective, ChildTestComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get textContent(): string {
    return this.elementRef.nativeElement.textContent?.trim() ?? '';
  }
}

describe('ResolveAsyncProvidersDirective', () => {
  it('should compile', () => {
    TestBed.configureTestingModule({
      providers: [provideAsync({ provide: STRING_INJECTOR_TOKEN, useAsyncFactory: stringAsyncFactory })],
    });
    const fixture = TestBed.createComponent(TestComponent);
    fixture.autoDetectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the template once async providers are resolved', async () => {
    TestBed.configureTestingModule({
      providers: [provideAsync({ provide: STRING_INJECTOR_TOKEN, useAsyncFactory: stringAsyncFactory })],
    });
    const fixture = TestBed.createComponent(TestComponent);
    fixture.autoDetectChanges();

    expect(fixture.componentInstance.textContent).toBe('');

    await fixture.whenStable(); // Resolve injectors

    expect(fixture.componentInstance.textContent).toBe('Async injector value: text');
  });
});
