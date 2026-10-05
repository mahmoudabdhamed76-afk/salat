const test = require('node:test');
const assert = require('node:assert/strict');
const { formatTime } = require('../public/utils');

test('12-hour Arabic display handles midnight, noon, morning, and evening', () => {
  const cases = [
    ['00:00', '١٢:٠٠ ص'], ['00:05', '١٢:٠٥ ص'], ['05:09', '٥:٠٩ ص'],
    ['11:59', '١١:٥٩ ص'], ['12:00', '١٢:٠٠ م'], ['13:05', '١:٠٥ م'],
    ['19:30', '٧:٣٠ م'], ['23:59', '١١:٥٩ م']
  ];
  for (const [input, expected] of cases) assert.equal(formatTime(input), expected);
});

test('missing and invalid timings display the loading placeholder', () => {
  for (const value of [null, undefined, '', '--:--', '24:00', '12:60', 'oops']) {
    assert.equal(formatTime(value), '--:--');
  }
});
