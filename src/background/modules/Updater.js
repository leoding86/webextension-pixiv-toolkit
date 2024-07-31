import versionCompare from "@/modules/Util/versionCompare";

class Updater {
  /**
   * @type {string}
   */
  currentVersion;

  /**
   * @type {string}
   */
  previousVersion;

  /**
   * @type {Map<string,Function>}
   */
  updates;

  /**
   *
   * @param {string} currentVersion
   * @param {string} previousVersion
   * @param {Map<string,Function>} updates
   */
  constructor(currentVersion, previousVersion, updates) {
    this.currentVersion = currentVersion;
    this.previousVersion = previousVersion;
    this.updates = updates;
  }

  /**
   * Execute update
   */
  async update() {
    Array.from(this.updates).forEach(async item => {
      if (versionCompare(this.previousVersion, item[0]) < 0) {
        await item[1]();
      }
    });
  }
}

export default Updater;
