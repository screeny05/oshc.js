import EventEmitter from 'eventemitter3';

const isEventEmitter = (emitter: any): emitter is EventEmitter => {
  return typeof emitter.addListener === 'function';
};

export class EventLifecycleManager {
  private listener: [HTMLElement | EventEmitter, string, any][] = [];

  add<K extends keyof HTMLElementEventMap>(
    $el: HTMLElement,
    type: K,
    fn: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  add($el: HTMLElement, type: string, fn: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  add<T extends EventEmitter>(emitter: T, type: string, fn: (...args: any[]) => void, context?: any): void;
  add($el: HTMLElement | EventEmitter, type: string, fn: EventListenerOrEventListenerObject | ((...args: any[]) => void), options: any) {
    if (isEventEmitter($el)) {
      $el.addListener(type, fn as any, options);
    } else {
      $el.addEventListener(type, fn, options);
    }
    this.listener.push([$el, type, fn]);
  }

  removeAll(): void {
    this.listener.forEach(([$el, type, fn]) => {
      if (isEventEmitter($el)) {
        $el.removeListener(type, fn);
      } else {
        $el.removeEventListener(type, fn);
      }
    });
  }
}
