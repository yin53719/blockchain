const crypto = require('crypto')
const initBlock = {
  index: 0,
  previousHash: '0',
  timestamp: 1538669227813,
  data: 'Welcome to iblockchain!',
  hash: '00sssaa1fbf27775ab79612bcb8171b3a9e02efe32fa628450ba6e729cf03996',
  nonce: 979911
}
class Blockchain {
  constructor(){
      this.blockchain = [initBlock]
      this.data = 'hardy'
      this.difficulty = 5;
      // const hash = this.computeHash(0,'0',new Date().getTime(),'hello-woniuchain',1)
      // console.log(hash)
  }
   // 挖矿
  mine(){
    const newBlock = this.generatnewBlock()

    if(this.isValidBlock(newBlock)){
      this.blockchain.push(newBlock)
    }else{
      console.log('Error,Invalid Block');
    }
  }
  getLastBlock(){
    return this.blockchain[this.blockchain.length-1]
  }
  // 生成新区块
  generatnewBlock(){
    let nonce = 0;
    const index = this.blockchain.length;
    const data = this.data
    const prevHash = this.getLastBlock().hash
    let tiemstamp = new Date().getTime();
    let hash = this.computeHash(nonce,prevHash,tiemstamp,data,nonce)

    while(hash.slice(0,this.difficulty)!=='0'.repeat(this.difficulty)){
      nonce += 1
      tiemstamp = new Date().getTime();
      hash = this.computeHash(nonce,prevHash,tiemstamp,data,nonce)
    }
    
    return {
      index,nonce,prevHash,tiemstamp,data,nonce,hash
    }
  }
  // 计算哈希
  computeHash(index,prevHash,tiemstamp,data,nonce){
     return crypto
                  .createHash('sha256')
                  .update(index + prevHash + tiemstamp + data + nonce)
                  .digest('hex')
  }
  // 校验区块
  isValidBlock(newBlock){
    const lastBlock = this.getLastBlock(newBlock)
    if(newBlock.index !== lastBlock.index+1){
      console.log(1)
      return false;
    }else if(newBlock.tiemstamp <= lastBlock.tiemstamp){
      console.log(2)
      return false;
    }else if(newBlock.prevHash !== lastBlock.hash){
      console.log(4)
      return false;
    }else if(newBlock.hash.slice(0,this.difficulty) !== '0'.repeat(this.difficulty)){
      console.log(5)
      return false;
    }

    return true
  }
  isValidChain(){

  }

}

let bc = new Blockchain();

bc.mine()
bc.mine()
bc.mine()
console.log(bc.blockchain)
