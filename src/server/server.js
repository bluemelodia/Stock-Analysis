/* Express to run server and routes. */
const express = require('express');

/* Create an instance of express. */
const app = express();
const port = 3000;

/* Dependencies. */

/* Node does not implement the fetch API. */
const fetch = require("node-fetch");
const bodyParser = require('body-parser');

/* Provides utilities for working with file and directory paths. */
const path = require('path');

/* Express v4+ requires a extra middle-ware layer to handle POST requests. 
 * Below is the configuration for express to use body-parser as middleware. */

/* For parsing application/json.
 * bodyParser.json() returns a function. When passed into app.use
 * as its sole argument, it acts just like middleware. */
app.use(bodyParser.json());

/* Provides Express middleware that can be used to enable CORS with
 * various options. Allows the browser/server to communicate without 
 * security interruptions. */
const cors = require('cors');
app.use(cors());

/* Initialize the main project folder. The express.static built-in
 * middleware function enables the serving of static files, such as
 * images, CSS files, and JS files. In this case, it allows server-side
 * code to connect to client-side code, which is in the 'website' folder.
 * 
 * Provide the root directory from which to serve the static assets.
 * This enables consumers to load files that are in this directory:
 * ex. http://localhost:3000/js/app.js
 * 
 * As Express looks up the files relative to the static directory, 
 * the name of the static directory is not part of the URL. Note that
 * the path provided to the express.static function is relative to the 
 * direction from where the node process is launched.
 * 
 * path.join uses path.normalize, which resolves . and .., handles multiple
 * or trailing slashes, and uses the appropraite file separator for the platform.
 * 
 * __dirname gives the absolute path of the directory containing the currently 
 * executing file. The value will depend on which file you invoke it in. */
app.use(express.static(path.join(__dirname, '../client/views')));
console.log(path.join(__dirname, '../client/views'))

/* Spins up a simple local server that will allow the app to run 
 * locally in the browser. Tell the server which port to run on.
 *
 * To run the server: node server.js */
const server = app.listen(port, () => {
    console.log(`running on localhost: ${port}`);
}) 

app.get('*', function(req, res) {
    console.log("No other routes matched...");
});