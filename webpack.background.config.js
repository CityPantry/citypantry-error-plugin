module.exports = {
  entry: './chrome/background/background.ts',
  output: {
    filename: './chrome/dist/js/background.js',
    path: __dirname
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: require('path').join(__dirname, 'tsconfig.chrome.json'),
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};
