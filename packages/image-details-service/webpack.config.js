const ZipPlugin = require("zip-webpack-plugin");

// https://stackoverflow.com/questions/35903246/how-to-create-multiple-output-paths-in-webpack-config

const commonConfig = {};

const saveImageDetails = filename =>
  Object.assign({}, commonConfig, {
    mode: "production",
    entry: "./src/saveImageDetails/main.ts",
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
    plugins: [new ZipPlugin({ filename })],
  });

const saveImageStore = filename =>
  Object.assign({}, commonConfig, {
    mode: "production",
    entry: "./src/saveImageStore/main.ts",
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
    plugins: [new ZipPlugin({ filename })],
  });

module.exports = env => {
  return [saveImageDetails(env.save_image_details_filename), saveImageStore(env.save_image_store_filename)];
};
