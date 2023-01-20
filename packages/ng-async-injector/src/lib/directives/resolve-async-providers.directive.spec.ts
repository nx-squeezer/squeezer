import { ChangeDetectionStrategy, Component, ElementRef, inject, InjectionToken, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ResolveAsyncProvidersDirective } from './resolve-async-providers.directive';
import { provideAsync } from '../providers/provide-async.function';

const STRING_INJECTOR_TOKEN = new InjectionToken<string>('string');
let resolved = false;
const stringAsyncFactory = () =>
  Promise.resolve().then(() => {
    resolved = true;
    return 'text';
  });

@Component({
  selector: 'ngx-child-component',
  template: `Async injector value: {{ inputText ?? injectedText }}`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ChildTestComponent {
  readonly injectedText = inject(STRING_INJECTOR_TOKEN);

  @Input() inputText: string | null = null;
}

@Component({
  template: `<ngx-child-component *ngxResolveAsyncProviders></ngx-child-component>`,
  imports: [ResolveAsyncProvidersDirective, ChildTestComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestResolveAllProvidersComponent {
  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get textContent(): string {
    return this.elementRef.nativeElement.textContent?.trim() ?? '';
  }
}

@Component({
  template: `
    <ngx-child-component
      *ngxResolveAsyncProviders="{ stringValue: stringInjectionToken }; let providers; stringValue as stringValue"
      [inputText]="providers.stringValue + ' ' + stringValue"
    >
    </ngx-child-component>
  `,
  imports: [ResolveAsyncProvidersDirective, ChildTestComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestResolveManyProvidersComponent {
  readonly stringInjectionToken = STRING_INJECTOR_TOKEN;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get textContent(): string {
    return this.elementRef.nativeElement.textContent?.trim() ?? '';
  }
}

describe('ResolveAsyncProvidersDirective', () => {
  beforeEach(() => {
    resolved = false;
  });

  it('should compile', () => {
    TestBed.configureTestingModule({
      providers: [provideAsync({ provide: STRING_INJECTOR_TOKEN, useAsyncValue: stringAsyncFactory })],
    });
    const fixture = TestBed.createComponent(TestResolveAllProvidersComponent);
    fixture.autoDetectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the template once all async providers are resolved', async () => {
    TestBed.configureTestingModule({
      providers: [provideAsync({ provide: STRING_INJECTOR_TOKEN, useAsyncValue: stringAsyncFactory })],
    });
    const fixture = TestBed.createComponent(TestResolveAllProvidersComponent);
    fixture.autoDetectChanges();

    expect(fixture.componentInstance.textContent).toBe('');

    await fixture.whenStable(); // Resolve injectors

    expect(fixture.componentInstance.textContent).toBe('Async injector value: text');
  });

  it('should not render the template if destroyed before completing', () => {
    TestBed.configureTestingModule({
      providers: [provideAsync({ provide: STRING_INJECTOR_TOKEN, useAsyncValue: stringAsyncFactory })],
    });
    const fixture = TestBed.createComponent(TestResolveAllProvidersComponent);
    fixture.autoDetectChanges();
    fixture.destroy();

    expect(resolved).toBeFalsy();
  });

  it('should render the template once selected async providers are resolved', async () => {
    TestBed.configureTestingModule({
      providers: [provideAsync({ provide: STRING_INJECTOR_TOKEN, useAsyncValue: stringAsyncFactory })],
    });
    const fixture = TestBed.createComponent(TestResolveManyProvidersComponent);
    fixture.autoDetectChanges();

    expect(fixture.componentInstance.textContent).toBe('');

    await fixture.whenStable(); // Resolve injectors

    expect(fixture.componentInstance.textContent).toBe('Async injector value: text text');
  });

  it('should provide a context guard', () => {
    expect(ResolveAsyncProvidersDirective.ngTemplateContextGuard(null as any, null as any)).toBeTruthy();
  });
});
