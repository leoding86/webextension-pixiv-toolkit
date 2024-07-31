import { RuntimeError } from '@/errors';
import * as ResourceClasses from './index';
import AbstractResource from './AbstractResource';

/**
 * @class
 */
class Factory {
  /**
   * @type {Factory}
   */
  static instance;

  /**
   * @type {Map.<string,AbstractResource>}
   */
  classMaps = new Map();

  /**
   * @constructor
   */
  constructor() {
    Object.entries(ResourceClasses).forEach(([name, ResouceClass]) => {
      this.classMaps.set(ResouceClass.__PACK_NAME__, ResouceClass);
    });
  }

  /**
   *
   * @returns {Factory}
   */
  static default() {
    if (!Factory.instance) {
      Factory.instance = new Factory();
    }

    return Factory.instance;
  }

  /**
   *
   * @param {string} name
   * @returns {AbstractResource}
   */
  getResourceClass(name) {
    let ResourceClass = this.classMaps.get(name);

    if (ResourceClass) {
      return ResourceClass;
    } else {
      throw new RuntimeError(`Cannot find class with given name [${name}].`);
    }
  }

  /**
   *
   * @param {Object} unpackedData
   * @returns {AbstractResource}
   */
  static createPageResource(unpackedData) {
    let factory = Factory.default();
    let ResourceClass = factory.getResourceClass(unpackedData.__PACK_NAME__);

    delete unpackedData.__PACK_NAME__;
    return ResourceClass.create(unpackedData);
  }
}

export default Factory;
