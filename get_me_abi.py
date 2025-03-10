import json
truffleFile = json.load(open('D:\\KLU\\Projects\\Rustling\\Blockchain pow ZT Identity\\blockchain-zero-trust\\build\\contracts\\IdentityVerification.json'))

abi = truffleFile['abi']
bytecode = truffleFile['bytecode']