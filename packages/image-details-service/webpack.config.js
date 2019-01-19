const ZipPlugin = require("zip-webpack-plugin");

const commonConfig = {
  mode: "production",
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
};

const saveImageDetails = filename =>
  Object.assign({}, commonConfig, {
    entry: "./src/saveImageDetailsEntry.ts",
    plugins: [new ZipPlugin({ filename })],
  });

const saveImageSource = filename =>
  Object.assign({}, commonConfig, {
    entry: "./src/saveImageSourceEntry.ts",
    plugins: [new ZipPlugin({ filename })],
  });

module.exports = env => [
  saveImageDetails(env.save_image_details_filename),
  saveImageSource(env.save_image_source_filename),
];
