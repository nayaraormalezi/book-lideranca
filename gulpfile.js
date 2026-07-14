'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

// Serve the PDF.js worker through the solution's client-side assets rather than
// a public CDN. This keeps the reader compatible with corporate CSP policies.
build.configureWebpack.mergeConfig({
  additionalConfiguration: (configuration) => {
    configuration.module.rules.push({
      test: /pdf\.worker\.min\.js$/,
      type: 'asset/resource'
    });
    return configuration;
  }
});

build.initialize(require('gulp'));
