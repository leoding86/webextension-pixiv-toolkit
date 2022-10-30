import { Runtime } from "@/modules/Browser";
import AbstractService from "./AbstractService";

/**
 * @class
 */
class AbstractPortService extends AbstractService {
  /**
   * @type {Map<Object,Object>}
   */
  ports = new Map();

  /**
   * Append to port to collection and start listen events
   * @param {Object} port
   */
  appendPort(port) {
    if (!this.ports.has(port)) {
      this.ports.set(port, port);
    }

    /**
     * Listen port `onMessage` event and pass the arguments to service's
     * `onMessage` method if there is one.
     */
    port.onMessage.addListener((message, port) => {
      if (!messsage) {
        message = {};
      }

      if (typeof message !== 'object') {
        throw new Runtime('The message type must be object');
      }

      if (typeof this[onMessage] === 'function') {
        this[onMessage].call(this, Object.assign(message, { port }));
      }
    });

    /**
     * Delete the port from port collection when it disconnect.
     */
    port.onDisconnect.addListener(port => {
      this.ports.delete(port);
    });
  }

  /**
   * Boradcast message to every ports
   * @param {any} message
   */
  boradcast(message) {
    this.ports.forEach(port => {
      port.postMessage(message);
    });
  }
}

export default AbstractPortService;
