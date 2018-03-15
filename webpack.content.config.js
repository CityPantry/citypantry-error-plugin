module.exports = {
  entry: './chrome/content/index.ts',
  output: {
    filename: './chrome/dist/js/content.js',
    path: __dirname
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};