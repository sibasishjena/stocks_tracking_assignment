# Stocks Tracker
Stocks Tracker is a node JS based application which reads the stocks data from a JSON file and provides the output in a text file as well as on the console of the web browser. The data is provided in OHLC (opening value, Highest value, lowest value and closing value) format every 15 seconds for a particular stock.

### Installation
This application requires Node.js v11+ to run. Note: If you are using old nodeJs versions you may have to use --experimental-worker flag.

Install the dependencies and devDependencies and start the server.
```
$ cd stocks_tracking_assignment
$ npm install 
$ node index.js
```
Verify the deployment by navigating to your server address in your preferred browser.
```
http://localhost:3000/
```
To check the output enter the STOCK name in the provided input field and open the console of the web browser. The logs can be found in output.txt file.
