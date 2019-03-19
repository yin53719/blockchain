const vorpal = require('vorpal')()
const Blockchain = require('./blockchain')
const Table = require('cli-table');
const rsa = require('./rsa')


function formatLog(data){
    if(!data || data.length===0){
        return
    }
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
vorpal.command('trans <to> <amount>','交易转账')
       .action(function(args,callback){
        //    本地公钥当做转出地址
            let trans = blockchain.transfer(rsa.keys.pub,args.to,args.amount)
            if(trans){
                formatLog(trans)
            }
            callback()
       })

vorpal.command('mine','挖矿')
      .action(function(args,callback){
          let newBlock = blockchain.mine(rsa.keys.pub)

          if(newBlock){
            formatLog(newBlock)
          }
          callback()
      })

vorpal.command('blockchain','查看区块链')
      .action(function(args,callback){
        formatLog(blockchain.blockchain)
          callback()
      })

vorpal.command('pub','查看本地公钥')
      .action(function(args,callback){
          this.log(rsa.keys.pub)
          callback()
      })
vorpal.command('peers','查看网络节点列表')
      .action(function(args,callback){
         formatLog(blockchain.peers)
          callback()
      })
vorpal.command('chat <msg>','和其他节点打招呼')
      .action(function(args,callback){
         blockchain.boardcast({
             type:'hi',
             data:args.msg
         })
          callback()
      })
vorpal.exec('help')
vorpal.delimiter('woniu-chain=>')
    .show()