import { ChangeDetectorRef, Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';

@Directive({
  selector: 'ng-template[ngxResolveAsyncProviders]',
  standalone: true,
})
export class ResolveAsyncProvidersDirective implements OnInit {
  constructor(
    private readonly asyncInjector: AsyncInjector,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<unknown>,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.asyncInjector.resolveAll().then(() => {
      // TODO: not render if destroyed
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      this.cdr.markForCheck();
    });
  }
}
