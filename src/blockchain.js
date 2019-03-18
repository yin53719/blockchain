
const crypto = require('crypto')

const rsa = require('./rsa')

const initBlock = {
  index: 0,
  prevHash: '0',
  timestamp: 1538669227813,
  data: 'Welcome to iblockchain!',
  hash: '00000aa1fbf27775ab79612bcb8171b3a9e02efe32fa628450ba6e729cf03996',
  nonce: 979911
}
class Blockchain {
  constructor(){
      this.blockchain = [initBlock]
      this.data = []
      this.difficulty = 5;
  }
   // 挖矿 实际就是打包
  mine(address){
    // 打包之前，验证交易是否合法
    if(!this.data.every(v=>this.isValidTranser(v))){
      console.log('trans,not valid');
      return 
    }
    // 过滤不合法交易
    this.data = this.data.filter(v=>this.isValidTranser(v))
    // 挖矿结束，旷工奖励，100
    this.transfer('0',address,100)
    // 生成新区块，打包交易信息
    const newBlock = this.generatnewBlock()
   
    if(this.isValidBlock(newBlock) && this.isValidChain()){
      
      this.blockchain.push(newBlock)
      this.data = [];
      return newBlock
    }else{
      console.log('Error,Invalid Block');
    }
  }
  // 查询余额
  blance(address){
    let blance = 0;
    this.blockchain.forEach(block =>{
      if(!Array.isArray(block.data)){
        return
      }
      block.data.forEach(trans =>{
          if(address==trans.from){
              blance -=trans.amount
          }
          if(address==trans.to){
            blance +=trans.amount
        }
      })
    })
    console.log(blance)
    return blance

  }
  getLastBlock(){
    return this.blockchain[this.blockchain.length-1]
  }
  transfer(from,to,amount){
    if(from!=='0'){
      //交易非挖矿
      const blance = this.blance(from)
      if(blance<amount){
        console.log('not enough blance',from ,to,amount)
        return 
      }
    }
    // const transObj = { from ,to,amount}
    const sign = rsa.sign({from,to,amount})
    const sinTrans = {from,to,amount,sign }
    // 加入交易记录
    this.data.push(sinTrans)
    return sinTrans
  }
  
  // 生成新区块
  generatnewBlock(){
    let nonce = 0;
    const index = this.blockchain.length;
    const data = this.data
    const prevHash = this.getLastBlock().hash
    let timestamp = new Date().getTime();
    let hash = this.computeHash(index,prevHash,timestamp,data,nonce)

    while(hash.slice(0,this.difficulty) !=='0'.repeat(this.difficulty)){
      nonce += 1
      hash = this.computeHash(index,prevHash,timestamp,data,nonce)
    }
    return {
      index,prevHash,timestamp,data,hash,nonce
    }
  }
  computeForBlock({index,prevHash,timestamp,data,nonce}){
    // const {index,prevHash,timestamp,data,nonce} = newBlock
    return this.computeHash(index,prevHash,timestamp,data,nonce)
  }
  // 计算哈希
  computeHash(index,prevHash,timestamp,data,nonce){
     return crypto
                  .createHash('sha256')
                  .update(index + prevHash + timestamp + data + nonce)
                  .digest('hex')
  }
  isValidTranser(trans){
    // 是否合法转账

    return rsa.verify(trans,trans.from)
  }
  // 校验区块
  isValidBlock(newBlock,lastBlock = this.getLastBlock()){
    // const lastBlock = prevHash
    /** 
     * 新区块索引等于上一个区块索引加一 
     * 新区块preHash 等于上一个区块hash
     * 新区块哈希前几位等于约定规则
     * */ 
    if(newBlock.index !== lastBlock.index+1){
      return false;
    }else if(newBlock.timestamp <= lastBlock.timestamp){
      return false;
    }else if(newBlock.prevHash !== lastBlock.hash){
      return false;
    }else if(newBlock.hash.slice(0,this.difficulty) !== '0'.repeat(this.difficulty)){
      return false;
    }else if(newBlock.hash!==this.computeForBlock(newBlock)){
      return false
    }

    return true
  }
  isValidChain(chain = this.blockchain){

    for(let i =chain.length-1;i>=1;i--){
      if(!this.isValidBlock(chain[i],chain[i-1])){
        return false
      }
    }

    return true
    
  }

}

module.exports = Blockchain
