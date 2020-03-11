const {parentPort} = require('worker_threads');
const {Decimal} = require('decimal.js')

let bars = [];
let currentStatus = {};
let currentBarNum;

parentPort.on('message', (message)=>{
  if(message.action === "FETCH") {
    if(bars.length === message.index) {
      parentPort.postMessage("exit")
    } else {
      parentPort.postMessage(bars[message.index][message.data]?bars[message.index][message.data] : {})
    }
  } else {
    if(message.data === "") {
      closePreviousBar(currentBarNum);
    }
    else {
      data = JSON.parse(message.data)
      timeGap = calculateTimeDiff(message.time, data.TS2)
      barNum = (Decimal.ceil(timeGap/15) == 0 ? 1 : Decimal.ceil(timeGap/15)) - 1
      if(bars[barNum] === undefined) {
        while(bars.length < barNum + 1) {
          bars.push({})
        } 
      }
      if(bars.length === 1 ) {
        currentBarNum = 0;
      }
      if(currentBarNum!=barNum){
        closePreviousBar(currentBarNum);
        currentBarNum = barNum;
      }
      if (currentStatus[data.sym]===undefined) {
        currentStatus[data.sym] = {
          symbol: data.sym,
          o: data.P,
          h: data.P,
          l: data.P,
          c: 0.0,
          volume: data.Q,
          last_price: data.P
        }
      }else {
        if(bars[barNum][data.sym]===undefined) {
          currentStatus[data.sym].o = data.P;
          currentStatus[data.sym].h = data.P;
          currentStatus[data.sym].l = data.P;
        } else {
          if(currentStatus[data.sym].h < data.P) {
            currentStatus[data.sym].h = data.P
          }else if(currentStatus[data.sym].l > data.P) {
            currentStatus[data.sym].l = data.P
          }
        }
        currentStatus[data.sym].volume = Decimal.add(currentStatus[data.sym].volume, data.Q);
        currentStatus[data.sym].last_price = data.P;
      }
      bars[barNum][data.sym] = JSON.parse(JSON.stringify(currentStatus[data.sym]))
    }
  }
})

function calculateTimeDiff(startTime, currentTime) {
  start = new Date(Math.round(startTime/10**6))
  current = new Date(Math.round(currentTime/10**6))
  return Decimal.round(Decimal.abs((current - start) / (1000)));
}

function closePreviousBar(index) {
  Object.keys(bars[index]).forEach((key)=>{
    bars[index][key].c = currentStatus[key].last_price;
    currentStatus[key].c = currentStatus[key].last_price;
    currentStatus[key].o = 0.0;
    currentStatus[key].h = 0.0;
    currentStatus[key].l = 0.0;
    currentStatus[key].last_price = 0.0;
  })
}