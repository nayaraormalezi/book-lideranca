'use strict';

const build = require('@microsoft/sp-build-web');
const path = require('path');

build.addSuppression(
  `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);

/**
 * pdfjs-dist (>= 3.x) ships syntax (optional chaining / nullish coalescing) that
 * webpack 4 (used by the SPFx gulp toolchain up to 1.21.x) cannot parse out of the box.
 * We transpile only that dependency with babel-loader so the rest of the build keeps
 * using the standard SPFx pipeline untouched.
 */
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    generatedConfiguration.module.rules.push({
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'node_modules', 'pdfjs-dist')
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { targets: { esmodules: false } }]],
          plugins: ['@babel/plugin-proposal-optional-chaining'],
          cacheDirectory: true,
          // Evita que o gerador de código do Babel imprima um aviso em stderr ("deoptimised
          // the styling...") para o build minificado do pdfjs-dist, o que o toolchain do
          // SPFx (`gulp bundle --ship`) trata como falha de build.
          compact: true
        }
      }
    });

    // pdfjs-dist references Node-only globals when tree-shaken by webpack; they are
    // never executed in the browser bundle but must resolve at build time.
    generatedConfiguration.resolve = generatedConfiguration.resolve || {};
    generatedConfiguration.resolve.fallback = {
      ...(generatedConfiguration.resolve.fallback || {}),
      fs: false,
      path: false,
      canvas: false
    };

    return generatedConfiguration;
  }
});

build.initialize(require('gulp'));
