const crypto = require('crypto')

class Blockchain {
  constructor(){
      this.blockchain = []
      this.data = []
      this.difficulty = 4;
      // const hash = this.computeHash(0,'0',new Date().getTime(),'hello-woniuchain',1)
      // console.log(hash)
  }
   // 挖矿
  mine(){
    let nonce = 0;
    const index = 0;
    const data = 'hello woniu-chain'
    const prevHash = '0'
    let tiemstamp = 111111111
    let hash = this.computeHash(nonce,prevHash,tiemstamp,data,nonce)

    while(hash.slice(0,4)!=='0000'){
      nonce += 1
      hash = this.computeHash(nonce,prevHash,tiemstamp,data,nonce)
      console.log(nonce,hash)
    }
  }

  // 生成新区块
  generatnewBlock(){

  }
  // 计算哈希
  computeHash(index,prevHash,tiemstamp,data,nonce){
     return crypto
                  .createHash('sha256')
                  .update(index + prevHash + tiemstamp + data + nonce)
                  .digest('hex')
  }
  isValidBlock(){

  }
  isValidChain(){

  }

}

let bc = new Blockchain();

bc.mine()
