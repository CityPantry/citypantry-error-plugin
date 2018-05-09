import { XhrEvent } from '../shared/xhr-event.interface';

export function interceptXhrEvents(): XhrEvent[] {
  const log: XhrEvent[] = [];

  // store the native send()
  const oldSend = XMLHttpRequest.prototype.send;
  // override the native send()
  XMLHttpRequest.prototype.send = function() {
    const oldOnReadyStateChange = this.onreadystatechange ? this.onreadystatechange.bind(this) : () => {};
    let logged = false;
    const started = new Date();
    this.onreadystatechange = () => {
      oldOnReadyStateChange();

      if (this.readyState === 4 && this.status > 0 && !logged) {
        logged = true;
        log.push({
          url: this.responseURL,
          statusCode: this.status,
          startTime: started.toISOString(),
          endTime: new Date().toISOString()
        });
        if (log.length > 40) {
          log.splice(0, log.length - 40);
        }
      }
    };
    // call the native send()
    oldSend.apply(this, arguments);
  };

  return log;
};