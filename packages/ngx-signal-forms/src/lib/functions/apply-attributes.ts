import { Renderer2, Signal, effect, inject } from '@angular/core';

/**
 * Applies attributes to an HTML element reacting to changes.
 */
export function applyAttributes(
  elementSignal: Signal<HTMLElement>,
  attributesSignal: Signal<Record<string, string>>
): void {
  const renderer = inject(Renderer2);
  let previousAttributes: Record<string, string> = {};

  effect(() => {
    const element = elementSignal();
    const attributes = attributesSignal();

    // Remove attributes no longer set
    for (const previousAttributeKey in previousAttributes) {
      if (!(previousAttributeKey in attributes)) {
        renderer.removeAttribute(element, previousAttributeKey);
      }
    }

    // Add new attributes
    for (const newAttributeKey in attributes) {
      const attributeValue = attributes[newAttributeKey];
      renderer.setAttribute(element, newAttributeKey, attributeValue);
    }

    previousAttributes = attributes;
  });
}
