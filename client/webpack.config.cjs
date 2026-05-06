const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = (_env, argv) => {
  const isProduction = argv.mode === "production";
  const apiUrl = process.env.VITE_API_URL || (isProduction ? "" : "http://localhost:5000");

  return {
    mode: isProduction ? "production" : "development",
    entry: path.resolve(__dirname, "src/main.jsx"),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "assets/[name].[contenthash].js",
      clean: true,
      publicPath: "/"
    },
    devtool: isProduction ? "source-map" : "eval-source-map",
    resolve: {
      extensions: [".js", ".jsx"]
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: "defaults" }],
                ["@babel/preset-react", { runtime: "automatic" }]
              ]
            }
          }
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "index.html")
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "public"),
            to: path.resolve(__dirname, "dist"),
            noErrorOnMissing: true
          }
        ]
      }),
      new webpack.DefinePlugin({
        "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl)
      })
    ],
    devServer: {
      historyApiFallback: true,
      hot: true,
      client: {
        overlay: true
      }
    }
  };
};
