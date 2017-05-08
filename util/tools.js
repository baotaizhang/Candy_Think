var tools = function() {

};

/**
 * Rounds a value up to an amount of decimals and returns it.
 * @param value
 * @param decimals
 * @returns {number}
 */
tools.prototype.round = function round(value, decimals) {
  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + decimals) : decimals)));
  // Shift back
  value = value.toString().split('e');
  return Number((value[0] + 'e' + (value[1] ? (+value[1] - decimals) : -decimals)));
};

var utiltools = new tools();

module.exports = utiltools;
