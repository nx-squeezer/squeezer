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

@Directive({
  selector: 'ng-template[ngxResolveAsyncProviders]',
  standalone: true,
})
export class ResolveAsyncProvidersDirective<TProviders extends { [key: string]: InjectionToken<any> }>
  implements OnInit, OnDestroy
{
  private readonly asyncInjector = inject(AsyncInjector);
  private readonly _asyncInjectorInitializer = inject(ASYNC_INJECTOR_INITIALIZER);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input('ngxResolveAsyncProviders') providers: TProviders | null = null;

  private destroyed = false;

  static ngTemplateContextGuard<T extends { [key: string]: InjectionToken<any> }>(
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

export type ResolveAsyncProvidersContext<TProviders extends { [key: string]: InjectionToken<any> }> = {
  $implicit: InjectionTokenTypeMap<TProviders>;
} & InjectionTokenTypeMap<TProviders>;
