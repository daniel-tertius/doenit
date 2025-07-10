// Test script for encryption and compression functionality
const CryptoJS = require('crypto-js');
const pako = require('pako');

// Test encryption key
const ENCRYPTION_KEY = '9b0d015eb2c32c95db1864f9314fa1a3f14dd96e4d97f23e5d5e3a972f42d4161ec9b4ee19854e34a3e65fb73a1be1969aa1df5f39ba81020c8a6e4bd50ae16e5003500efae29bd0dd7e096b0cd476d0e5d0685cb9e0790c6cb7212abb6ccca89f1c8a9ff9b99318fd48ebc588befb0b780540ab6b7020405b341f378948261d!';

function compressAndEncrypt(data) {
  try {
    // Convert data to JSON string
    const jsonString = JSON.stringify(data);
    console.log('Original JSON size:', jsonString.length, 'bytes');
    
    // Compress the data
    const compressed = pako.gzip(jsonString);
    console.log('Compressed size:', compressed.length, 'bytes');
    console.log('Compression ratio:', (jsonString.length / compressed.length).toFixed(2) + ':1');
    
    // Convert compressed data to base64
    const compressedBase64 = Buffer.from(compressed).toString('base64');
    
    // Encrypt the compressed data
    const encrypted = CryptoJS.AES.encrypt(compressedBase64, ENCRYPTION_KEY).toString();
    console.log('Encrypted size:', encrypted.length, 'bytes');
    
    return encrypted;
  } catch (error) {
    console.error("Error compressing and encrypting data:", error);
    throw new Error("Failed to compress and encrypt data");
  }
}

function decryptAndDecompress(encryptedData) {
  try {
    // Decrypt the data
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const compressedBase64 = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    // Convert base64 back to buffer
    const compressed = Buffer.from(compressedBase64, 'base64');
    
    // Decompress the data
    const decompressed = pako.ungzip(compressed, { to: 'string' });
    
    // Parse JSON
    return JSON.parse(decompressed);
  } catch (error) {
    console.error("Error decrypting and decompressing data:", error);
    throw new Error("Failed to decrypt and decompress data");
  }
}

// Test data
const testData = {
  tasks: [
    { id: 1, title: "Test task 1", completed: false, priority: "high" },
    { id: 2, title: "Test task 2", completed: true, priority: "medium" },
    { id: 3, title: "Test task 3", completed: false, priority: "low" }
  ],
  categories: [
    { id: 1, name: "Work", color: "#ff0000" },
    { id: 2, name: "Personal", color: "#00ff00" },
    { id: 3, name: "Shopping", color: "#0000ff" }
  ]
};

console.log('Testing encryption and compression...\n');

try {
  // Encrypt and compress
  const encrypted = compressAndEncrypt(testData);
  console.log('\nEncryption successful!');
  
  // Decrypt and decompress
  const decrypted = decryptAndDecompress(encrypted);
  console.log('\nDecryption successful!');
  
  // Verify data integrity
  const originalJson = JSON.stringify(testData);
  const decryptedJson = JSON.stringify(decrypted);
  
  if (originalJson === decryptedJson) {
    console.log('✅ Data integrity verified - original and decrypted data match!');
  } else {
    console.log('❌ Data integrity failed - data does not match!');
    console.log('Original:', originalJson);
    console.log('Decrypted:', decryptedJson);
  }
} catch (error) {
  console.error('Test failed:', error.message);
}
