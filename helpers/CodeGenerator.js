function CodeGenerator(){
    let num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 9]
    let code = ''

    for(let i = 0; i < 6; i++){
        let random = Math.floor(Math.random() * 10)
        let result = num[random]

        code += result
    }

    return code
}

module.exports = CodeGenerator