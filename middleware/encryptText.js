// AES RFC - https://tools.ietf.org/html/rfc3602
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
// generate key with crypto.randomBytes(256/8).toString('hex')
const key = '6d858102402dbbeb0f9bb711e3d13a1229684792db4940db0d0e71c08ca602e1';
const IV_LENGTH = 16;

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (text) => {  
    const [iv, encryptedText] = text.split(':').map(part => Buffer.from(part, 'hex'));
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

exports.encrypt = encrypt;
exports.decrypt = decrypt;