const {parentPort} = require('worker_threads');
const LineByLineReader = require('line-by-line');
const path = require('path');

lr = new LineByLineReader(path.join(__dirname,'../data/trades.json'));
lr.on('line', (line)=>{
  parentPort.postMessage({data: line, exit: false})
})

lr.on('end', (line)=> {
  parentPort.postMessage({data: "", exit: true})
})


