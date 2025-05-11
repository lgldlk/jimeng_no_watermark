const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// eslint-disable-next-line no-undef
module.exports = {
  entry: {
    content: './src/content.js',
    background: './src/background.js',
  },
  output: {
    // eslint-disable-next-line no-undef
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    environment: {
      // 禁用动态导入
      dynamicImport: false,
    },
  },
  // 禁用所有 source maps
  devtool: false,
  mode: 'production',
  optimization: {
    minimize: true,
    moduleIds: 'deterministic',
    // 确保不使用 eval
    nodeEnv: 'production',
    minimizer: ['...'],
    // 禁用不安全的压缩选项
    concatenateModules: false,
    splitChunks: false,
  },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    chrome: '88',
                  },
                  modules: false,
                },
              ],
            ],
            compact: true,
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popup.html', to: 'popup.html' },
        { from: 'src/styles.css', to: 'styles.css' },
      ],
    }),
  ],
};
