import {
  ChangeDetectorRef,
  Directive,
  inject,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  InjectionToken,
} from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { InjectionTokenTypeMap } from '../interfaces/injection-token-type';
import { ASYNC_INJECTOR_INITIALIZER } from '../tokens/async-injector-initializer.token';

/**
 * This directive can be used to render a template after certain async providers have resolved. It can be useful to delay loading them as much as possible.
 * The template can safely inject those resolved async providers.
 *
 * @example
 *
 * When no parameters are passed, it will load _all_ async injectors in the injector hierarchy:
 *
 * ```ts
 * @Component({
 *   template: `<child-component *ngxResolveAsyncProviders></child-component>`,
 *   providers: [provideAsync({ provide: STRING_INJECTOR_TOKEN, useAsyncValue: stringAsyncFactory })],
 *   imports: [ResolveAsyncProvidersDirective, ChildComponent],
 *   standalone: true,
 *   changeDetection: ChangeDetectionStrategy.OnPush,
 * })
 * class ParentComponent {}
 *
 * @Component({
 *   selector: 'child-component',
 *   template: `Async injector value: {{ injectedText }}`,
 *   standalone: true,
 *   changeDetection: ChangeDetectionStrategy.OnPush,
 * })
 * class ChildComponent {
 *   readonly injectedText = inject(STRING_INJECTOR_TOKEN);
 * }
 * ```
 *
 * @example
 *
 * Additionally, it also supports a map of async provider tokens. Only those will be resolved instead of _all_. The resolved async providers
 * are available as the context for the structural directive. Example:
 *
 * ```ts
 * @Component({
 *   template: `
 *     <!-- Use $implicit context from the structural directive, it is type safe -->
 *     <child-component
 *       *ngxResolveAsyncProviders="{ stringValue: stringInjectionToken }; let providers"
 *       [inputText]="providers.stringValue"
 *     ></child-component>
 *
 *     <!-- Use the key from the context, it is type safe as well -->
 *     <child-component
 *       *ngxResolveAsyncProviders="{ stringValue: stringInjectionToken }; stringValue as stringValue"
 *       [inputText]="stringValue"
 *     ></child-component>
 *   `,
 *   providers: [provideAsync({ provide: STRING_INJECTOR_TOKEN, useAsyncValue: stringAsyncFactory })],
 *   imports: [ResolveAsyncProvidersDirective, ChildComponent],
 *   standalone: true,
 *   changeDetection: ChangeDetectionStrategy.OnPush,
 * })
 * class ParentComponent {
 *   readonly stringInjectionToken = STRING_INJECTOR_TOKEN;
 * }
 *
 * @Component({
 *   selector: 'child-component',
 *   template: `Async injector value: {{ inputText }}`,
 *   standalone: true,
 *   changeDetection: ChangeDetectionStrategy.OnPush,
 * })
 * class ChildComponent {
 *   @Input() inputText!: string;
 * }
 * ```
 */
@Directive({
  selector: 'ng-template[ngxResolveAsyncProviders]',
  standalone: true,
})
export class ResolveAsyncProvidersDirective<TProviders extends { [key: string]: InjectionToken<unknown> }>
  implements OnInit, OnDestroy
{
  private readonly asyncInjector = inject(AsyncInjector);
  private readonly _asyncInjectorInitializer = inject(ASYNC_INJECTOR_INITIALIZER);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef);
  private readonly cdr = inject(ChangeDetectorRef);

  /**
   * List of providers to be resolved. If not defined, it will resolve all async providers in the DI tree.
   */
  @Input('ngxResolveAsyncProviders') providers: TProviders | null = null;

  private destroyed = false;

  /**
   * Type guard that exposes resolved async validators.
   */
  static ngTemplateContextGuard<T extends { [key: string]: InjectionToken<unknown> }>(
    _: ResolveAsyncProvidersDirective<T>,
    context: unknown
  ): context is ResolveAsyncProvidersContext<T> {
    return true;
  }

  ngOnInit() {
    if (this.providers === null) {
      this.asyncInjector.resolveAll().then(() => this.renderTemplate());
    } else {
      this.asyncInjector
        .resolveMany(this.providers)
        .then((providersValueMap: InjectionTokenTypeMap<TProviders>) => this.renderTemplate(providersValueMap));
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  private renderTemplate(providersValueMap?: InjectionTokenTypeMap<TProviders>) {
    if (this.destroyed) {
      return;
    }

    if (providersValueMap == null) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      const context: ResolveAsyncProvidersContext<TProviders> = {
        $implicit: providersValueMap,
        ...providersValueMap,
      };
      this.viewContainerRef.createEmbeddedView(this.templateRef, context);
    }

    this.cdr.markForCheck();
  }
}

/**
 * Type of the structural directive context that exposes resolved async validators.
 */
export type ResolveAsyncProvidersContext<TProviders extends { [key: string]: InjectionToken<unknown> }> = {
  $implicit: InjectionTokenTypeMap<TProviders>;
} & InjectionTokenTypeMap<TProviders>;
