/**
 * Object.freeze() but for all nested objects contained in main object
 *
 * https://www.npmjs.com/package/deep-freeze
 * @param {object} o object to deep freeze
 */
export function deepFreeze (o) {
  Object.freeze(o);
  if (o === undefined) {
    return o;
  }

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o[prop] !== null
    && (typeof o[prop] === "object" || typeof o[prop] === "function")
    && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });

  return o;
};


/**
 * Message system
 *
 * @returns EventEmmiter
 */
export function createEventEmitter() {
  const events = {};

  return {
      on(event, listener) {
          if (!events[event]) {
              events[event] = [];
          }
          events[event].push(listener);
      },

      off(event, listenerToRemove) {
          if (!events[event]) return;

          events[event] = events[event].filter(listener => listener !== listenerToRemove);
      },

      emit(event, data) {
          if (!events[event]) return;

          events[event].forEach(listener => listener(data));
      }
  };
}