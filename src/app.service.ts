import { Injectable } from '@nestjs/common';
import * as tokenJSON from './assets/MyToken.json';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { ConfigService } from '@nestjs/config';
import { MintTokenDto } from './dtos/mintToken.dto';
import { SelfDelegateToken } from './dtos/selfDelegateToken.dto';
import { VoteDto } from './dtos/vote.dto';

@Injectable()
export class AppService {
  publicClient;
  walletClient;

  constructor(private readonly configService: ConfigService) {
    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.RPC_ENDPOINT_URL),
    });
    this.walletClient = createWalletClient({
      transport: http(process.env.RPC_ENDPOINT_URL),
      chain: sepolia,
      account: account,
    });
  }

  getHello(): string {
    return 'Hello Worlds of Wonder!';
  }

  getContractAddress(): string {
    return this.configService.get<string>('TOKEN_CONTRACT_ADDRESS');
  }

  async getTokenName(): Promise<string> {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
    });
    const name = await publicClient.readContract({
      address: `0x${this.getContractAddress().slice(2)}` as `0x${string}`,
      abi: tokenJSON.abi,
      functionName: 'name',
    });
    return name as string;
  }

  async getTotalSupply(): Promise<string> {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
    });
    const totalSupply = await publicClient.readContract({
      address: `0x${this.getContractAddress().slice(2)}` as `0x${string}`,
      abi: tokenJSON.abi,
      functionName: 'totalSupply',
    });
    return totalSupply.toString();
  }

  async getTokenBalance(address: string): Promise<string> {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
    });

    const balance = await publicClient.readContract({
      address: `${this.getContractAddress()}` as `0x${string}`,
      abi: tokenJSON.abi,
      functionName: 'balanceOf',
      args: [address],
    });
    return balance.toString();
  }

  async getTransactionReceipt(hash: string): Promise<string> {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
    });
    const transactionHash = this.configService.get<string>('TRANSACTION_HASH');
    const receipt = await publicClient.getTransactionReceipt({
      hash: transactionHash as `0x${string}`,
    });
    return JSON.stringify(receipt, null, 2);
  }

  getServerWalletAddress(): string {
    return this.walletClient.account.address;
  }

  async checkMinterRole(address: string): Promise<boolean> {
    const MINTER_ROLE = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJSON.abi,
      functionName: 'MINTER_ROLE',
    });
    const hasRole = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJSON.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address],
    });
    return hasRole;
  }

  // From Juan's Project
  async waitForTransactionSuccess(txHash: any) {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    if (!receipt || receipt.status !== 'success') {
      throw new Error(`Transaction failed. Hash: ${txHash}`);
    }

    return receipt;
  }

  
  async mintTokens(body: MintTokenDto) {
    const address = body.address;
    const amount = body.amount;
    try {
      const mintTx = await this.walletClient.writeContract({
        address: this.getContractAddress(),
        abi: tokenJSON.abi,
        functionName: 'mint',
        args: [address, parseEther(amount.toString())],
      });

      if (await this.waitForTransactionSuccess(mintTx)) {
        console.log(`Minted ${amount} tokens to ${address}`);
        return {
          result: true,
          message: `Minted  ${amount} tokens to ${address}`,
          transactionHash: mintTx,
        };
      } else {
        return {
          result: false,
          message: `Failed to mint tokens to ${address}`,
          transactionHash: mintTx,
        };
      }
    } catch (error) {
      console.error('Error in mintTokens:', error);
      return {
        result: false,
        message: `Error minting tokens: ${error.message}`,
      };
    }
  }

 async selfDelegateTokens(body: SelfDelegateToken) {
  const address = body.address;
  try {
    const delegateTx = await this.walletClient.writeContract({
      address: this.getContractAddress(),
      abi: tokenJSON.abi,
      functionName: 'delegate',
      args: [address],
    });

    if (await this.waitForTransactionSuccess(delegateTx)) {
      console.log(`Delegated tokens for ${address}`);
      return {
        result: true,
        message: `Successfully delegated tokens for ${address}`,
        transactionHash: delegateTx,
      };
    } else {
      return {
        result: false,
        message: `Failed to delegate tokens for ${address}`,
        transactionHash: delegateTx,
      };
    }
  } catch (error) {
    console.error('Error in selfDelegateTokens:', error);
    return {
      result: false,
      message: `Error delegating tokens: ${error.message}`,
    };
  }
}

async vote(body: VoteDto) {
  const { address, proposalId, amount } = body;
  try {
    const voteTx = await this.walletClient.writeContract({
      address: this.getContractAddress(),
      abi: tokenJSON.abi,
      functionName: 'vote',
      args: [BigInt(proposalId), parseEther(amount)],
      account: address,
    });

    if (await this.waitForTransactionSuccess(voteTx)) {
      console.log(`Vote cast for proposal ${proposalId} by ${address} with ${amount} votes`);
      return {
        result: true,
        message: `Successfully cast ${amount} votes for proposal ${proposalId} by ${address}`,
        transactionHash: voteTx,
      };
    } else {
      return {
        result: false,
        message: `Failed to cast vote for proposal ${proposalId} by ${address}`,
        transactionHash: voteTx,
      };
    }
  } catch (error) {
    console.error('Error in vote:', error);
    return {
      result: false,
      message: `Error casting vote: ${error.message}`,
    };
  }
}

}