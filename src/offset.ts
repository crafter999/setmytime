export function offset(msg:Uint8Array):number {
    const offsetTime = 40
    let firstPart = 0
    let fractionPart = 0
    for (var i = 0; i <= 3; i++) {
      firstPart = 256 * firstPart + msg[offsetTime + i]
    }
    for (i = 4; i <= 7; i++) {
      fractionPart = 256 * fractionPart + msg[offsetTime + i]
    }
    var milliseconds = (firstPart * 1000 + (fractionPart * 1000) / 0x100000000)
    milliseconds += -2208988800000
    return milliseconds
  }