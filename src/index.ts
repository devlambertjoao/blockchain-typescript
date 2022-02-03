import { SHA256 } from "crypto-js";

interface Transaction {
  from: string;
  to: string;
  value: number;
}

class Block {
  createdDate: Date;
  previousHash: string;
  hash: string;
  data: Transaction;

  constructor(data: Transaction, previousHash: string) {
    this.createdDate = new Date(2022, 2, 2);
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.getHash();
  }

  private getHash = (): string => SHA256(JSON.stringify(this)).toString();
}

class Blockchain {
  private chain: Array<Block>;

  constructor() {
    this.chain = [];
    this.generateGenesisBlock();
  }

  private generateGenesisBlock() {
    const genesisBlock = new Block({ from: "", to: "", value: 0 }, "");
    this.addBlock(genesisBlock);
  }

  getLatestBlock = (): Block => this.chain[this.chain.length - 1];
  getLatestBlockHash = (): string => this.getLatestBlock().hash;

  addBlock(block: Block) {
    this.chain.push(block);
  }
}

const lasanhaCoin = new Blockchain();
lasanhaCoin.addBlock(
  new Block(
    {
      from: "nemo",
      to: "crazyBoy",
      value: 200,
    },
    lasanhaCoin.getLatestBlockHash()
  )
);
lasanhaCoin.addBlock(
  new Block(
    {
      from: "nemo",
      to: "TULIO",
      value: 10,
    },
    lasanhaCoin.getLatestBlockHash()
  )
);
console.log(lasanhaCoin);
