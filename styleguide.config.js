const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });

module.exports = {
  pagePerSection: true,
  title: 'UTD Trends Documentation',
  template: {
    links: [
      {
        rel: 'stylesheet',
        href: './src/styles/globals.css',
      },
    ],
  },
  sections: [
    {
      name: 'Introduction',
      content: 'styleguidistDocs/introduction.md',
    },
    {
      name: 'Style Guide',
      content: 'styleguidistDocs/styling.md',
    },
    {
      name: 'Common Components',
      content: 'styleguidistDocs/common.md',
      components: ['./src/components/common/**/*.tsx'],
    },
    {
      name: 'Navigation Components',
      components: ['./src/components/navigation/**/*.tsx'],
    },
    {
      name: 'Dashboard Components',
      components: ['./src/components/dashboard/**/*.tsx'],
    },
    {
      name: 'Overview Components',
      components: ['./src/components/overview/**/*.tsx'],
    },
    {
      name: 'Search Components',
      components: ['./src/components/search/**/*.tsx'],
    },
    {
      name: 'Graph Components',
      components: ['./src/components/graph/**/*.tsx'],
    },
    {
      name: 'Compare Components',
      components: ['./src/components/compare/**/*.tsx'],
    },
    {
      name: 'Icon Components',
      components: ['./src/components/icons/**/*.tsx'],
    },
  ],

  propsParser: require('react-docgen-typescript').parse,
  require: [path.join(__dirname, './src/styles/globals.css')],
  webpackConfig: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      fallback: {
        zlib: false,
        stream: false,
        fs: false,
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(dotenv.parsed),
      }),
    ],
    module: {
      rules: [
        // File Loaders that are needed for your components
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'html-loader',
            },
            {
              loader: 'markdown-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
            },
          ],
        },
        {
          test: /\.(png)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]',
          },
        },
      ],
    },
  },
};
