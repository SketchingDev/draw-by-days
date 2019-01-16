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
    entry: "./src/saveImageDetails/main.ts",
    plugins: [new ZipPlugin({ filename })],
  });

const saveImageStore = filename =>
  Object.assign({}, commonConfig, {
    entry: "./src/saveImageStore/main.ts",
    plugins: [new ZipPlugin({ filename })],
  });

module.exports = env => [
  saveImageDetails(env.save_image_details_filename),
  saveImageStore(env.save_image_store_filename),
];
