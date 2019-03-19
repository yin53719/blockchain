
const crypto = require('crypto')
const rsa = require('./rsa')
const dgram = require('dgram')
const udp = dgram.createSocket('udp4')


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
      this.difficulty = 4;
      this.peers=[]
      this.seed = {
        port:8001,
        address:'localhost'
      }
      this.udp = udp
      this.init();
  }
  init(){
    this.bindP2p()
    this.bindExit()
  }
  bindP2p(){
    this.udp.on('message',(data,remote)=>{
      const { address,port} = remote
      const action = JSON.parse(data)
      if(action.type){
          this.dispatch(action,{address,port})
      }

    })

    this.udp.on('listening',()=>{
      const address = this.udp.address()
      console.log('[信息]:udp监听完毕 端口'+address.port)
    })
    const port = Number(process.argv[2]) || 0
    this.startNode(port)
  }
  bindExit(){
    process.on('exit',()=>{
      console.log('[信息]:网络一线天,相识就是缘')
    })
  }
  send(message,port,address){
    this.udp.send(JSON.stringify(message),port,address)
  }
  startNode(port){
    this.udp.bind(port)
    if(port!==8001){
      this.send({
        type:'newpeer',
      },this.seed.port,this.seed.address)

      this.peers.push(this.seed)
    }
  }
  boardcast(action){
      this.peers.forEach(v=>{
        this.send(action,v.port,v.address)
      })
  }
  dispatch(action,remote){
    switch(action.type){
      case 'newpeer':
        // 种子节点要做的事情
        // 1,你的公网ip和port
        this.send({
          type:'remoteAddress',
          data:remote
        },remote.port,remote.address)
        //2,现在全部节点列表
        this.send({
          type:'peerlist',
          data:this.peers
        },remote.port,remote.address)
        //3,告诉所有已知节点，来了个新朋友 快打招呼
        this.boardcast({
          type:'sayhi',
          data:remote
        })
        //4,告诉你现在区块链的数据
         this.send({
           type:'blockchain',
           data:JSON.stringify({
             blockchain:this.blockchain,
            //  trans:this.data
           })
         },remote.port,remote.address)
         this.peers.push(remote)
         console.log('新朋友，请你喝茶',remote)
         break
      case 'blockchain':
         //同步本地链
         let allData  = JSON.parse(action.data)
         let newChain = allData.blockchain
          this.replaceChain(newChain)
          break
      case 'remoteAddress':
         this.remote = action.data
         break
      case 'peerlist':
         const newPeers = action.data
         this.addPeers(newPeers)
         break
      case 'sayhi':
         let remotePeer = action.data
         console.log('[信息] 新朋友你好，相识就是缘，请你喝茶')
         this.peers.push(remotePeer)
         this.send({type:'hi',data:'hi'},remotePeer.port,remotePeer.address)
        break
      case 'hi':
        console.log(`${remote.address}:${remote.port} : ${action.data}`)
        break
      case 'trans':
        // 网络上收到的交易请求
        //是不是有重复交易
        if(this.data.find(v=>this.isEqualObj(v,action.data))){
          console.log('新的交易注意查收')
          this.addTrans(action.data)
          this.boardcast({
            type:'trans',
            data:action.data
          })
        }
        break
      case 'mine':
        const lastBlock = this.getLastBlock()
        if(lastBlock.hash === action.data.hash){
          // 重发消息
          return 
        }
        if(this.isValidBlock(action.data,lastBlock)){
          console.log('有朋友挖矿成功,喝彩，放烟花')
          this.blockchain.push(action.data)
          //清空本地消息
          this.data = []
          this.boardcast({
            type:'mine',
            data:action.data
          })
        }else{
          console.log('区块不合法')
        }
        break
      default:
       console.log('这个action 不认识')
       
    }
  }
  addTrans(trans){
      if(this.isValidTranser(trans)){
          this.data.push(trans)
      }
  }
  isEqualObj(obj1,obj2){
    const key1 = Object.keys(obj1)
    const key2 = Object.keys(obj2)
    if(key1.length!==key2.length){
        //key数量不同
        return false
    }
    return key1.every(key=>obj1[key]===obj2[key])
  }
  addPeers(peers){
     peers.forEach(peer =>{
       if(!this.peers.find(v=>this.isEqualObj(peer,v))){
         this.peers.push(peer)
       }
     })
  }
  replaceChain(newChain){
    //先不校验交易
    if(newChain.length===1){
        return
    }
    if(this.isValidChain(newChain) && newChain.length>this.blockchain.length){
      //拷贝一份
      this.blockchain = JSON.parse(JSON.stringify(newChain))
    }else{
      console.log('错误,不合法链')
    }
  }
   // 挖矿 实际就是打包
  mine(address){
    // 打包之前，验证交易是否合法
    if(!this.data.every(v=>this.isValidTranser(v))){
      console.log('交易不合法 ');
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
      console.log('挖矿成功')
      this.boardcast({
        type:'mine',
        data:newBlock
      })
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
     const timestamp = new Date().getTime();
    const sign = rsa.sign({from,to,amount,timestamp})
    const sinTrans = {from,to,amount,sign ,timestamp}

    this.boardcast({
      type:'trans',
      data:sinTrans
    })
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
