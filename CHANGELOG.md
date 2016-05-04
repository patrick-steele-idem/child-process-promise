Changelog
=========

# 2.x

## 2.0.x

### 2.0.1

- Minor cleanup

### 2.0.0

#### Major changes

- Switched from [q](https://github.com/kriskowal/q) to [native ES2015 promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
- This module now uses various ES2015 functionality only available in Node.js 4.0+
- Despite the major version being incremented, `v2.x` maintains backwards compatibility with `v1.x`

#### Breaking changes

- This library now requires Node.js 4.0+
    - If you are using Node.js <4 you should use `child-process-promise@^1.0.0`

# 1.x

- Initial release
