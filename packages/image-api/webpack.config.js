var ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  mode: "production",
  entry: "./src/main.ts",
  output: {
    filename: "[name].js",
    libraryTarget: "commonjs",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  target: "node",
  externals: ["aws-sdk"],
  module: {
    rules: [{ test: /\.tsx?$/, use: ["ts-loader"] }],
  },
  plugins: [
    new ZipPlugin({
      filename: `retrieve-image-lambda.zip`
    })
  ]
}
