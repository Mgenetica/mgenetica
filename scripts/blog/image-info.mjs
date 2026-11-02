export function imageInfo(bytes) {
 if(bytes.length>=24&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}
 if(bytes[0]===255&&bytes[1]===216){
  let offset=2
  while(offset+8<bytes.length){if(bytes[offset]!==255)throw new Error('JPEG inválido');const marker=bytes[offset+1];const length=bytes.readUInt16BE(offset+2);if(length<2)break;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return {width:bytes.readUInt16BE(offset+7),height:bytes.readUInt16BE(offset+5)};offset+=length+2}
 }
 if(bytes.length>=30&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){
  const type=bytes.toString('ascii',12,16)
  if(type==='VP8X')return {width:1+bytes.readUIntLE(24,3),height:1+bytes.readUIntLE(27,3)}
  if(type==='VP8 '&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42)return {width:bytes.readUInt16LE(26)&16383,height:bytes.readUInt16LE(28)&16383}
  if(type==='VP8L'&&bytes[20]===47){const packed=bytes.readUInt32LE(21);return {width:(packed&16383)+1,height:((packed>>>14)&16383)+1}}
 }
 throw new Error('Imagem PNG/JPEG/WebP inválida ou sem dimensões reconhecidas')
}
