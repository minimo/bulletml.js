const { merge } = require('webpack-merge');
const common = require('./webpack.common.js') // 汎用設定をインポート

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: `${__dirname}/build`,
    filename: 'bulletml.js',
  },
});
