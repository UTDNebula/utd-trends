const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
module.exports = {
  pagePerSection: true,
  title: 'UTD Trends Style Guide',
  template: {
    links: [
      {
        rel: 'stylesheet',
        href: './styles/globals.css',
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
      components: ['./components/common/**/*.tsx'],
    },
    {
      name: 'Navigation Components',
      components: ['./components/navigation/**/*.tsx'],
    },
    {
      name: 'Graph Components',
      content: './components/graph/GraphProps.md',
      components: ['./components/graph/**/*.tsx'],
    },
    {
      name: 'Icon Components',
      components: ['./components/icons/**/*.tsx'],
    },
  ],

  propsParser: require('react-docgen-typescript').parse,
  require: [
    path.resolve(__dirname, 'styleguide/setup.js'),
    path.join(__dirname, './styles/globals.css'),
  ],
  webpackConfig: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(dotenv.parsed),
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        // Other loaders that are needed for your components
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      'postcss-preset-env',
                      {
                        // Options
                      },
                    ],
                  ],
                },
              },
            },
          ],
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
      ],
    },
  },
};
