import json
truffleFile = json.load(open('D:\\KLU\\Projects\\Rustling\\Blockchain pow ZT Identity\\blockchain-zero-trust\\contracts\\IdentityVerification.sol'))

abi = truffleFile['abi']
bytecode = truffleFile['bytecode']