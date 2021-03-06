
let EC = require('elliptic').ec
let ec = new EC('secp256k1')

const fs =require('fs')


// 1,获取公私钥对 持久化
let keypair = ec.genKeyPair();

function getPub(prv){
    return ec.keyFromPrivate(prv).getPublic('hex').toString()
}

function generateKeys(){
    const fileName = './wallet.json';

    try {
        let res = JSON.parse(fs.readFileSync(fileName))
        if(res.prv && res.pub && getPub(res.prv) == res.pub){
            keypair = ec.keyFromPrivate(res.prv)
            return res
        }else{
            throw 'not valid wallet.json'
        }
    } catch (error) {
        // 文件不不存在
        const res = {
            prv:keypair.getPrivate('hex').toString(),
            pub:keypair.getPublic('hex').toString()
        }

        fs.writeFileSync(fileName,JSON.stringify(res))
        return res
    }
}
const keys =  generateKeys()

// 2,签名

function sign({from,to,amount,timestamp}){
    const bufferMsg = Buffer.from(`${timestamp}-${amount}-${from}-${to}`)
    let signature = Buffer.from(keypair.sign(bufferMsg).toDER()).toString('hex')

    return signature
}

// 2,校验证签名

function verify({from,to,amount,signature,timestamp},pub){
    const keypairTemp = ec.keyFromPublic(pub,'hex')
    const bufferMsg = Buffer.from(`${timestamp}-${amount}-${from}-${to}`)
    return keypairTemp.verify(bufferMsg,signature)
}


module.exports = { keys,sign,verify}








