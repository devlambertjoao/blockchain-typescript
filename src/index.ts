import { SHA256 } from "crypto-js";

class Transaction {
  from: string;
  to: string;
  value: number;

  constructor(from: string, to: string, value: number) {
    this.from = from;
    this.to = to;
    this.value = value;
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

  getHash = (): string => SHA256(JSON.stringify(this)).toString();

  mineBlock(difficulty: number) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.getHash();
    }
  }
}

class Blockchain {
  private chain: Array<Block>;
  private difficulty: number;
  pendingTransactions: Array<Transaction>;
  miningReward: number;

  constructor() {
    this.chain = [];
    this.difficulty = 2;
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
    this.pendingTransactions = [
      new Transaction("System", miningRewardAddress, this.miningReward),
    ];
  }

  createTransaction(transaction: Transaction) {
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

const lasanhaCoin = new Blockchain();

console.log(lasanhaCoin);
