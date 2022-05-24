const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src", "index.jsx"),
  output: {
    filename: "index.js",
    path: path.join(__dirname, "dist"),
  },
  mode: "production",
  resolve: { extensions: [".js", ".jsx"] },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        use: ["babel-loader"],
        exclude: [/node_modules/],
      },
      { test: /.html$/, use: ["html-loader"] },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
    }),
    new CleanWebpackPlugin(),
  ],
};
