const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './example/index.js',
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader"
      }
    }, {
      test: /\.scss$/,
      use: [
        'style-loader', 
        'css-loader', 
        'sass-loader'
      ]
    }]
  },
  devServer: {
    contentBase: './example/dist',
    compress: true,
    port: 9000
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./example/index.html"
    })
  ]
};