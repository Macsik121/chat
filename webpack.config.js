const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const browserConfig = {
    mode: 'development',
    entry: { app: './src/App.tsx' },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, './public')
    },
    resolve: {
        extensions: [ '.js', '.ts', '.tsx' ]
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)?$/,
                use: [ 'ts-loader' ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    // optimization: {
    //     minimize: true,
    //     minimizer: [new CssMinimizerWebpackPlugin(), new TerserWebpackPlugin()]
    // },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].styles.css'
        })
    ]
};

// const serverConfig = {
//     mode: 'development',
//     entry: { server: './server/server.js' },
//     output: {
//         filename: '[name].js',
//         path: path.resolve(__dirname, './dist')
//     },
//     target: 'node',
//     externals: [nodeExternals()],
//     resolve: {
//         extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.(ts|tsx)?$/,
//                 use: [
//                     // {
//                     //     loader: 'babel-loader',
//                     //     options: {
//                     //         presets: [
//                     //             '@babel/preset-react',
//                     //             '@babel/preset-typescript',
//                     //             [
//                     //                 '@babel/preset-env',
//                     //                 {
//                     //                     targets: {
//                     //                         browsers: ['last 2 versions']
//                     //                     }
//                     //                 }
//                     //             ]
//                     //         ]
//                     //     }
//                     // }
//                     'ts-loader'
//                 ]
//             },
//             {
//                 test: /\.(js|jsx)?$/,
//                 exclude: /node_modules/,
//                 use: {
//                     loader: 'babel-loader',
//                     options: {
//                         "presets": [
//                             [
//                                 "@babel/preset-env",
//                                 {
//                                 "useBuiltIns": "usage",
//                                 "corejs": 2
//                                 }
//                             ],
//                             "@babel/preset-react",
//                             "minify"
//                         ],
//                         // "plugins": [
//                         //   "@babel/plugin-transform-runtime"
//                         // ]
//                     }
//                 }
//             }
//         ]
//     }
// };

module.exports = [
    browserConfig, 
    // serverConfig
];
