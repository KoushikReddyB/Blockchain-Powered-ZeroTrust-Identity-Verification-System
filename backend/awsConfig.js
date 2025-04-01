const AWS = require("aws-sdk");

// Configure AWS SDK
AWS.config.update({
  region: "eu-north-1", 
});

// Create DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports = dynamoDB;
