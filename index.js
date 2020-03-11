const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const {Worker} = require('worker_threads');
const fs = require('fs');
const path = require('path');


let counter=0;
app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});


server.listen(3000,()=>{
  calculate();
});


function calculate() {
  const readWorker = new Worker('./workers/readWorker.js');
  let calculateWorker = new Worker('./workers/calculateWorker.js');;
  let startTrade = true;
  let tradeStartTime;
  let bars;
  let timer = 0;
  let output;

  let writeStrem = fs.createWriteStream(path.join(__dirname,'./output.txt'));
  readWorker.on('message', (line) => {
    if(startTrade) {
      startTrade = false;
      let data = JSON.parse(line.data)
      tradeStartTime = data.TS2
    }
    calculateWorker.postMessage({data: line.data, time: tradeStartTime, exit: line.exit, action: "NEW"})
  })

  io.on('connection', function(client) {  
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
        client.emit('messages', 'Hello from server');
    });
    client.on('messages', function(data) {
      fs.truncate(path.join(__dirname,'./output.txt'),()=>{
        timer = 0;
        output = setInterval(()=>{
          calculateWorker.postMessage({data: data, index: timer, action: "FETCH"})
          timer++
        },15000)
        calculateWorker.on('message',(data)=>{
          if(data === "exit") {
            stopOutput()
          } else {
            client.emit('messages', Object.keys(data).length > 0 ? formatOutput(data, timer) : {});
            writeStrem.write(`${JSON.stringify(Object.keys(data).length > 0 ? formatOutput(data, timer) : {})}\n`)
          }
        })
      })
    })
    
  })

  function formatOutput(data, num) {
    return {
      "event": "ohlc_notify",
      "symbol": data.symbol,
      "bar_num": num,
      "o": data.o,
      "h": data.h,
      "l": data.l,
      "c": data.c,
      "volume": data.volume
    }
  }

  function stopOutput() {
    clearInterval(output)
  }
}
