// frontend/webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        clean: true,
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
        }),
        new Dotenv({
            path: './.env',
            safe: false,
            systemvars: true,
        }),
    ],
    devServer: {
        static: path.join(__dirname, 'dist'),
        port: 3000,
        historyApiFallback: true,
        proxy: {
            '/api': 'http://localhost:8000',
            '/media': 'http://localhost:8000',
        },
        hot: true,
    },
};