module.exports = {
  entry: './chrome/popup/index.tsx',
  output: {
    filename: './chrome/dist/js/popup.js',
    path: __dirname
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: require('path').join(__dirname, 'tsconfig.chrome.json'),
        }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};
