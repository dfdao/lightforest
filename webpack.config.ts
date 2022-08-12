const path = require("path");
const dotenv = require("dotenv");
const webpack = require("webpack");
const yup = require("yup");

dotenv.config();

const resolvePackage = require("resolve-package-path");
const { EnvironmentPlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const toml = require("@iarna/toml");
const cosmiconfig = require("cosmiconfig");

// This code is used to lookup where the `@dfdao` packages exist in the tree
// whether they are in a monorepo or installed as packages
function findScopeDirectory() {
  // Just chose the most likely package to be here, it could really be anything
  const pkg = "@dfdao/contracts";
  const contractsPackageJson = resolvePackage(pkg, __dirname);
  if (!contractsPackageJson) {
    throw new Error(`Unable to find the @dfdao scope. Exiting...`);
  }
  const contractsDirectory = path.dirname(contractsPackageJson);
  const scopeDirectory = path.dirname(contractsDirectory);

  return scopeDirectory;
}

const ConfigValidators = yup
  .object({
    round: yup.object({
      START_TIME: yup.date().required(),
      // make sure end time is after start time
      END_TIME: yup
        .date()
        .when("START_TIME", (startTime: string, schema: any) => {
          return schema.min(startTime);
        }),
      DESCRIPTION: yup.string().required(),
      TITLE: yup.string().required(),
      ORG_NAME: yup.string(),
      MOVE_WEIGHT: yup.number().required(),
      TIME_WEIGHT: yup.number().required(),
      BRONZE_RANK: yup.number().required(),
      CONFIG_HASH: yup.string().required(),
      GOLD_RANK: yup.number().required(),
      SILVER_RANK: yup.number().required(),
    }),
  })
  .defined();

function parse(schema: any, data: unknown) {
  try {
    return schema.validateSync(data, { abortEarly: false });
  } catch (err) {
    const errors = err.errors
      .map((msg: string, i: number) => `${i + 1}. ${msg}`)
      .join("\n");
    console.error(
      `Invalid config -- ${err.errors.length} error${
        err.errors.length > 1 ? "s" : ""
      }:\n`
    );
    console.error(errors);
    console.error("\n");
    process.exit(1);
  }
}

const explorer = () =>
  cosmiconfig.cosmiconfigSync("lightforest", {
    cache: true,
    searchPlaces: [`lightforest.toml`],
    loaders: {
      ".toml": (filename: string, content: unknown) => {
        try {
          return toml.parse(content);
        } catch (err) {
          console.error(`Couldn't parse ${filename}`);
          process.exit(1);
        }
      },
    },
  });

function load() {
  console.log("Loading config from lightforest.toml...");
  const result = explorer().search();
  if (!result) {
    console.error(`Couldn't find a config file`);
    process.exit(1);
  }
  return result.config;
}

const tomlConfig = load();

if (tomlConfig) {
  console.log("Successfully loaded config from lightforest.toml:\n");
  console.log(tomlConfig);
} else {
  console.error("Unable to load config");
}

parse(ConfigValidators, tomlConfig);

module.exports = {
  mode: "production",
  entry: ["./src/Frontend/EntryPoints/index.tsx"],
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "bundle-[contenthash].min.js",
    publicPath: "/",
    clean: true,
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",
  devServer: {
    port: 8081,
    historyApiFallback: true,
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", "..."],
    // Adding an alias for the `@dfdao` packages, whether in a monorepo or packages
    alias: {
      "@dfdao": findScopeDirectory(),
    },
  },

  module: {
    rules: [
      // Still depends on raw-loader here, with the javascript/auto content type,
      // because otherwise the module can't be imported in PluginManager
      {
        test: /\.[jt]sx?$/,
        include: [path.join(__dirname, "./embedded_plugins/")],
        type: "javascript/auto",
        use: ["raw-loader", "babel-loader"],
      },
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "esbuild-loader",
            options: {
              loader: "tsx", // Or 'ts' if you don't need tsx
              target: "chrome90",
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)$/,
        include: [path.join(__dirname, "./src/")],
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
      // Any wasm, zkye, or json files from other packages should be loaded as a plain file
      {
        test: /\.(wasm|zkey|json)$/,
        type: "asset/resource",
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
        options: {
          filterSourceMappingUrl(_url: string, resourcePath: string) {
            // The sourcemaps in react-sortable are screwed up
            if (resourcePath.includes("react-sortablejs")) {
              return false;
            }

            return true;
          },
        },
      },
    ],
  },
  plugins: [
    // We use ForkTsChecker plugin to run typechecking on `src/`
    // in the background and report errors into the frontent UI
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: "readonly",
      },
    }),
    // The string values are fallbacks if the env variable is not set
    new EnvironmentPlugin({
      NODE_ENV: "development",
      DEFAULT_RPC: "https://rpc-df.xdaichain.com/",
      // This must be null to indicate to webpack that this environment variable is optional
      DF_WEBSERVER_URL: null,
      DF_TWITTER_URL: null,
      FAUCET_URL: null,
      DFDAO_WEBSERVER_URL: null,
    }),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new CopyPlugin({
      patterns: [{ from: "public", to: "public" }],
    }),
    new webpack.DefinePlugin({
      LIGHTFOREST_CONFIG: JSON.stringify(tomlConfig),
    }),
  ],
};
