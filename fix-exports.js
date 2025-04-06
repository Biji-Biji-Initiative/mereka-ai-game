// fix-exports.js - Polyfill for exports/module globals
if (typeof window !== 'undefined') {
  window.exports = window.exports || {};
  window.module = window.module || { exports: window.exports };
  console.log('✅ Exports/module polyfill applied');
}
