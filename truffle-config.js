require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: "unveil sample kangaroo brush uphold comic electric stand autumn castle work congress" // Replace with your actual MetaMask seed phrase
        },
        providerOrUrl: `https://sepolia.infura.io/v3/f1f75995e5704955aceead5f9dc7dbea` // Your Infura Project ID
      }),
      network_id: 11155111, // Sepolia network ID
      gas: 550000000, // Gas limit
      confirmations: 3, // Number of confirmations to wait between deployments.
      timeoutBlocks: 2000, // Number of blocks before a deployment times out.
      skipDryRun: true // Skip dry run before migrations? (default: false for public nets )
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 6721975 // Adjust the gas limit here
    },
  },
  compilers: {
    solc: {
      version: "0.8.17", // Solidity compiler version
    }
  },
};