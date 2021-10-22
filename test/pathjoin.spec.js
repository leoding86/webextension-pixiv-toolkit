const pathjoin = require('../src/modules/Util/pathjoin').default;

test('pathjoin join a, b, c should be a/b/c', () => {
  expect(pathjoin('a', 'b', 'c')).toBe('a/b/c');
});

test('pathjoin join empty should be empty', () => {
  expect(pathjoin('')).toBe('');
});

test('pathjoin join a, b, .., c should be a/c', () => {
  expect(pathjoin('a', 'b', '..', 'c')).toBe('a/c');
});

test('pathjoin join /, a, b, c should be a/b/c', () => {
  expect(pathjoin('/', 'a', 'b', 'c')).toBe('a/b/c');
});

test('pathjoin join a, b, .., .. should be empty', () => {
  expect(pathjoin('a', 'b', '..', '..')).toBe('');
});

test('pathjoin join a, /, /, b, c should be a/b/c', () => {
  expect(pathjoin('a', '/', '/', 'b', 'c')).toBe('a/b/c');
});

test('pathjoin join a/b, c/d should be a/b/c/d', () => {
  expect(pathjoin('a/b', 'c/d')).toBe('a/b/c/d');
});
