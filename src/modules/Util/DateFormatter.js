/**
 * @class
 * @property {Date} date
 */
class DateFormatter {

  /**
   * @constructor
   * @param {String} date
   */
  constructor(date) {
    /**
     * @type {Date}
     */
    this.date = new Date(date);
  }

  /**
   *
   * @param {string} date
   * @returns {DateFormatter}
   */
  static getDefault(date) {
    if (Date.parse(date) === NaN) {
      throw Error('Invalid date time');
    }

    return new DateFormatter(date);
  }

  /**
   * @param {Number} num
   * @returns {String}
   */
  paddingZero(num) {
    return (num < 10 ? '0' : '') + num;
  }

  /**
   * @returns {String}
   */
  getYear() {
    return this.date.getFullYear() + '';
  }

  /**
   * @returns {Number}
   */
  getMonth() {
    return this.paddingZero(this.date.getMonth() + 1);
  }

  /**
   * @returns {Number}
   */
  getDay() {
    return this.paddingZero(this.date.getDate());
  }
}

export default DateFormatter;
