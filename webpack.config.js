// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = "style-loader";

const config = {
  entry: {},
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
    fallback: {
      "fs": false
    },
  },
};

module.exports = async () => {
  let fileList = await fs.promises.readdir(path.resolve(__dirname, "src/ts"));

  fileList.forEach((file) => {
    const dryName = file.replace('.ts', '');
    config.plugins.push(new HtmlWebpackPlugin({
      chunks: [`${dryName}`],
      template: `./src/pages/${dryName}.html`,
      filename: `${dryName}.html`
    }))

    config.entry[dryName] = `./src/ts/${file}`
  })

  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }

  console.log(config.plugins);

  return config;

};
