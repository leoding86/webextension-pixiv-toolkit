if (typeof global === 'undefined') {
  self.global = typeof window === 'undefined' ? self : window;
}
