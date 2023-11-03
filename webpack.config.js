const path = require('path');

module.exports = {
    entry: ['./src/polyfill.js', './src/player.js'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'player.js',
        libraryTarget: 'umd',
        library: 'srrPlayer'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};