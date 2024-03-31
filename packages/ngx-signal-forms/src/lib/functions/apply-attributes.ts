import { Renderer2, Signal, effect, inject } from '@angular/core';

/**
 * Applies attributes to an HTML element reacting to changes.
 */
export function applyAttributes(
  elementSignal: Signal<HTMLElement | null>,
  attributesSignal: Signal<Record<string, string | null>>
): void {
  const renderer = inject(Renderer2);
  let previousAttributes: Record<string, string | null> = {};

  effect(() => {
    const element = elementSignal();

    if (element == null) {
      return;
    }

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
      if (attributeValue == null) {
        renderer.removeAttribute(element, newAttributeKey);
      } else {
        renderer.setAttribute(element, newAttributeKey, attributeValue);
      }
    }

    previousAttributes = attributes;
  });
}
