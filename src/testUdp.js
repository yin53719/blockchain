const dgram = require('dgram')
const udp = dgram.createSocket('udp4')

// upd收信息
udp.on('message',(data,remote)=>{

    console.log('accept message'+ data.toString())
    console.log(remote)

})

udp.on('listening',()=>{
  const address = udp.address()
  console.log('upd server is listening '+ address.address+':' + address.port)
})
udp.bind(8002)

function send(message,port,host){
    console.log(message,port,host)
    udp.send(Buffer.from(message),port,host)
}

const port = Number(process.argv[2])
const host = process.argv[3]
console.log(process.argv)
if(port && host){
    console.log('1111')
    send('李玉志',port,host);
}

















