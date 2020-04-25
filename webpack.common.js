const path = require('path')

/* Generates an HTML5 file that includes all our webpack bundles 
 * in the body using script tags. */
const HtmlWebPackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    // To make code part of the library, export it from the index.js file
    entry: "./src/client/index.js",
    // Make JS code accessible through a library called Client
    output: {
        /* 
        * This option assigns the return value of the entry point (whatever 
        * the entry point exported) to the name provided by output.library
        * (in this case, Client) at whatever scope the bundle was included at. 
        * 
        * When the library is loaded, the return value of the entry point
        * will be assigned to a variable. This allows us to do this:
        * 
        * var Client = _entry_return;
        * Client.doSomething(); // in a separate script...
        */
        libraryTarget: "var",
        library: "Client"
    },
    module: {
        rules: [
            /* Use enforce: 'pre' to check source files, 
             * not modified by other loaders. */
            {
                enforce: "pre",
                test: "/\.js$/",
                exclude: /node_modules/,
                loader: "eslint-loader",
                options: {
                    cache: true,
                },
            },
            /* Get Webpack to use Babel, which transpiles ES6 syntax into vanilla
             * JS for the browser. */
            {
                test: "/\.js$/",
                exclude: /node_modules/,
                loader: "babel-loader",
            },
        ],
    },
    plugins: [
		new HtmlWebPackPlugin({
            // webpack relative or absolute path to the template
            template: "./src/client/views/index.html",
            // The file to write the HTML to
			filename: "./index.html",
        }),
        /* Remove and clean build folders. By default, it removes all files inside of
         * webpack's output.path directory plus unused webpack assets after every
         * successful build. */
        new CleanWebpackPlugin({
            // Simulate the removal of files
            dry: true,
            // Write Logs to Console
            verbose: true,
            // Automatically remove all unused webpack assets on rebuild
            cleanStaleWebpackAssets: true,
            protectWebpackAssets: false
        })
    ]
}