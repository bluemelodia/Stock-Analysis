const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    /* Inline source maps are valuable during dev due to better performnace. */
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.(s*)css$/,
                use: [ 'style-loader', 
                        'css-loader', 
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                config: {
                                    path: 'postcss.config.js'
                                }
                            }
                        },
                        'sass-loader' 
                    ]
            }
        ]
    },
    plugins: [
        /* Creates an interactive tree-map visualization of the contents of all
         * our bundles. */
        new BundleAnalyzerPlugin({
            /* Analyze an existing bundle. */
            generateStatsFile: true
        })
	]
})