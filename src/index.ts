import { SHA256 } from "crypto-js";
import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");

const key = ec.genKeyPair();
const publicKey = key.getPublic("hex");
const privateKey = key.getPrivate("hex");

class Transaction {
  from: string;
  to: string;
  value: number;
  signature: string;

  constructor(from: string, to: string, value: number) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.signature = "";
  }

  calculateHash(): string {
    return SHA256(`${this.from}${this.to}${this.value}`).toString();
  }

  signTransaction(signingKey: any) {
    if (signingKey.getPublic("hex") !== this.from) {
      throw new Error("You cannot sign transactions for other wallet");
    }
    const transactionHash = this.calculateHash();
    const sign = signingKey.sign(transactionHash, "base64");
    this.signature = sign.toDER("hex");
  }

  isValid() {
    if (this.from === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }

    const publicKey = ec.keyFromPublic(this.from, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  createdDate: Date;
  previousHash: string;
  hash: string;
  transactions: Array<Transaction>;
  nonce: number;

  constructor(transactions: Array<Transaction>, previousHash: string) {
    this.createdDate = new Date(2022, 2, 2);
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.getHash();
  }

  getHash = (): string =>
    SHA256(
      `${this.previousHash}${JSON.stringify(this.transactions)}${this.nonce}`
    ).toString();

  mineBlock(difficulty: number) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.getHash();
    }
  }

  isValidTransactions() {
    this.transactions.forEach((transaction) => {
      if (!transaction.isValid()) {
        return false;
      }
    });

    return true;
  }
}

class Blockchain {
  private chain: Array<Block>;
  private difficulty: number;
  pendingTransactions: Array<Transaction>;
  miningReward: number;

  constructor() {
    this.chain = [];
    this.difficulty = 1;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.generateGenesisBlock();
  }

  private generateGenesisBlock() {
    const genesisBlock = new Block([], "");
    genesisBlock.mineBlock(this.difficulty);
    this.chain.push(genesisBlock);
  }

  getLatestBlock = (): Block => this.chain[this.chain.length - 1];
  getLatestBlockHash = (): string => this.getLatestBlock().hash;

  miningPendingTransactions(miningRewardAddress: string) {
    const block = new Block(
      this.pendingTransactions,
      this.getLatestBlockHash()
    );

    block.mineBlock(this.difficulty);
    this.chain.push(block);

    const transaction = new Transaction(
      "System",
      miningRewardAddress,
      this.miningReward
    );
    transaction.signTransaction(key);

    this.pendingTransactions = [transaction];
  }

  createTransaction(transaction: Transaction) {
    if (!transaction.from || !transaction.to) {
      throw new Error("Transaction must include from and to address");
    }
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction");
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.from === address) {
          balance -= trans.value;
        }
        if (trans.to === address) {
          balance += trans.value;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.isValidTransactions()) {
        return false;
      }
      if (currentBlock.hash !== currentBlock.getHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

const lasanhaChain = new Blockchain();

const myPrivateKey = ec.keyFromPrivate(
  "f06bc9234790139ecb194b10a55d200b7e89a939d167390c72fdb5fc585dda36"
);

const myWalletAddress = myPrivateKey.getPublic("hex");

const transaction = new Transaction(myWalletAddress, "any public key", 10);
transaction.signTransaction(myPrivateKey);
lasanhaChain.createTransaction(transaction);
lasanhaChain.miningPendingTransactions(myWalletAddress);

console.log(lasanhaChain);
console.log(`My balance: ${lasanhaChain.getBalanceOfAddress(myWalletAddress)}`);

lasanhaChain.miningPendingTransactions(myWalletAddress);

console.log(
  `My balance after minning: ${lasanhaChain.getBalanceOfAddress(
    myWalletAddress
  )}`
);
console.log(`Valid chain: ${lasanhaChain.isChainValid()}`);
