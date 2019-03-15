const vorpal = require('vorpal')()
const Blockchain = require('./blockchain')
const Table = require('cli-table');



function formatLog(data){
    if(!Array.isArray(data)){
        data = [data]
    }
    const first = data[0]
    const head = Object.keys(first)
    // instantiate
    const table = new Table({
        head: head,
         colWidths: new Array(head.length).fill(15)
    });
    const res = data.map(v=>{
        return head.map(h=>JSON.stringify(v[h],null,2))
    })
    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    table.push(...res);
    console.log(table.toString());
}




const blockchain = new Blockchain()

vorpal.command('blance <address>','查看区块余额')
      .action(function(args,callback){
         const blance = blockchain.blance(args.address)
         if(blance){
            formatLog({blance,address:args.address})
         }
         callback()
      })

vorpal.command('detils <index>','查看区块明细')
      .action(function(args,callback){
         const block = blockchain.blockchain[args.index]
         this.log(JSON.stringify(block))
         callback()
      })
vorpal.command('trans <from> <to> <amount>','交易转账')
       .action(function(args,callback){
            let trans = blockchain.transfer(args.from,args.to,args.amount)
            if(trans){
                formatLog(trans)
            }
            callback()
       })

vorpal.command('mine <address>','挖矿')
      .action(function(args,callback){
          let newBlock = blockchain.mine(args.address)

          if(newBlock){
            formatLog(newBlock)
          }
          callback()
      })

vorpal.command('chain','查看区块链')
      .action(function(args,callback){
        formatLog(blockchain.blockchain)
          callback()
      })

// vorpal.command('hello','你好啊')
//       .action(function(args,callback){
//           this.log('你好，区块链')
//           callback()
//       })
vorpal.exec('help')
vorpal.delimiter('woniu-chain=>')
    .show()