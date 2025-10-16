const { roundToSix } = require('../api/getFee')


////////////////////////////////////////
/////////////////////////////////////
function roundTo8(num) {
    num = num.toString()
    const arr = num.split(".")
    if (arr.length === 1) {
        console.log(Number(num))
    } else if (arr[1].length <= 8) {
        console.log(Number(num))

    } else {
        let floatPart = arr[1].slice(0, 8)
        console.log("fffffffff", floatPart)
        for (let i = 8; i >= 0; i--) {
            if (floatPart[i] === 0) {
                floatPart = floatPart.slice(0, i)
            } else {
                break
            }
        }
        console.log(Number(11.))
        console.log(Number(arr[0] + "." + floatPart))
    }

}
roundTo8("0.1000000A")