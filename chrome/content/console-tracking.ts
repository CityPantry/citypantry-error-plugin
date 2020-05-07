import { ConsoleEvent } from '../shared/console-event.interface';

export function replaceConsole(initialMessage): ConsoleEvent[] {
  const log: ConsoleEvent[] = [];
  Object.assign(window, {
    console: new Proxy(window.console, {
      get: function (target, name) {
        const originalMethod = target[name];
        if (['log', 'warn', 'error', 'info', 'debug'].indexOf(String(name)) >= 0) {
          return (...args) => {
            if (args[0] !== initialMessage) {
              log.push({
                name: String(name),
                args,
                time: new Date().toISOString()
              });
              if (log.length > 40) {
                log.splice(0, log.length - 40);
              }
            }
            return originalMethod.apply(this, args);
          }
        } else {
          return originalMethod;
        }
      }
    })
  });
  return log;
}
