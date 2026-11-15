// Everything a prank run starts (timers, listeners, pending waits) goes through here,
// so that stop() ends all of it at once. Between stop() and the next begin() every
// wait rejects, which is how a stopped sequence finds out it should give up.

const stopped = () => {
  const done = new AbortController();
  done.abort(new DOMException('run stopped', 'AbortError'));
  return done;
};

let controller = stopped();

export function begin() {
  controller.abort(new DOMException('run stopped', 'AbortError'));
  controller = new AbortController();
}

export function stop() {
  controller.abort(new DOMException('run stopped', 'AbortError'));
}

export function wait(ms) {
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const abort = () => {
      clearTimeout(id);
      reject(signal.reason);
    };
    const id = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}

// For promises this file didn't make, like speech: settles with the promise unless
// the run stops first. Without it, a cancelled line resolves after the next run has
// begun and the old sequence carries on inside the new one.
export function guard(promise) {
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    promise.finally(() => signal.removeEventListener('abort', abort)).then(resolve, reject);
  });
}

export function every(ms, fn) {
  if (controller.signal.aborted) return;
  const id = setInterval(fn, ms);
  controller.signal.addEventListener('abort', () => clearInterval(id), { once: true });
}

export function listen(target, type, fn, options = {}) {
  target.addEventListener(type, fn, { ...options, signal: controller.signal });
}

export const wasStopped = (error) => error?.name === 'AbortError';
