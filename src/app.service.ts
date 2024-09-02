import { Injectable } from '@nestjs/common';
import * as tokenJSON from './assets/MyToken.json';
import * as ballotJSON from './assets/TokenizedBallot.json';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { ConfigService } from '@nestjs/config';
import { MintTokenDto } from './dtos/mintToken.dto';
import { SelfDelegateToken } from './dtos/selfDelegateToken.dto';
import { CastVoteDto } from './dtos/castVote.dto';

@Injectable()
export class AppService {
  publicClient;
  walletClient;
  // constructor(private configService: ConfigService) {}
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
    return 'Connected';
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

  //MINTING FUNC
  // async getServerWalletAddress(): Promise<string> {
  //   const walletAddress = this.configService.get<string>('WALLET_ADDRESS');
  //   if (!walletAddress) {
  //     throw new Error('Server wallet address not configured');
  //   }
  //   return walletAddress;
  // }
  // async checkMinterRole(address: string): Promise<boolean> {
  //   const publicClient = createPublicClient({
  //     chain: sepolia,
  //     transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
  //   });
  //   const MINTER_ROLE = await publicClient.readContract({
  //     address: `0x${this.getContractAddress().slice(2)}` as `0x${string}`,
  //     abi: tokenJSON.abi,
  //     functionName: 'MINTER_ROLE',
  //   });
  //   const hasMinterRole = await publicClient.readContract({
  //     address: `0x${this.getContractAddress().slice(2)}` as `0x${string}`,
  //     abi: tokenJSON.abi,
  //     functionName: 'hasRole',
  //     args: [MINTER_ROLE, address],
  //   });
  //   return Boolean(hasMinterRole);
  // }
  getServerWalletAddress(): string {
    return this.walletClient.account.address;
  }

  async checkMinterRole(address: string): Promise<boolean> {
    // const MINTER_ROLE = '0xb702E6E38E3831f3d0BD7F9e41566f8326526593';
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

  // async mintTokens(address: string): Promise<string> {
  //   const privateKey = this.configService.get<string>('PRIVATE_KEY');
  //   if (
  //     !privateKey ||
  //     !privateKey.startsWith('0x') ||
  //     privateKey.length !== 66
  //   ) {
  //     throw new Error('Invalid private key format');
  //   }
  //   const account = privateKeyToAccount(privateKey as `0x${string}`);

  //   const publicClient = createPublicClient({
  //     chain: sepolia,
  //     transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
  //   });

  //   const walletClient = createWalletClient({
  //     account,
  //     chain: sepolia,
  //     transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
  //   });

  //   const contractAddress = this.getContractAddress();
  //   const mintAmount = parseEther('1'); // Minting 1 token

  //   const { request } = await publicClient.simulateContract({
  //     account,
  //     address: contractAddress as `0x${string}`,
  //     abi: tokenJSON.abi,
  //     functionName: 'mint',
  //     args: [address, mintAmount],
  //   });

  //   const hash = await walletClient.writeContract(request);

  //   return hash;
  // }

  //

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

  async selfDelegateTokens(body: SelfDelegateToken){
    const address = body.address;

    const delegateTx = await this.walletClient.writeContract({
      address: this.getContractAddress(),
      abi: tokenJSON.abi,
      functionName: 'delegate',
      args: [address],

    });
    return delegateTx;
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

  async castVote(body: CastVoteDto) {
    const proposalId = body.proposalId;
    const amount = body.amount;
    
    try {
      const castVoteTx = await this.walletClient.writeContract({
        address: this.getContractAddress(),
        abi: ballotJSON.abi,
        functionName: 'vote',
        args: [proposalId, parseEther(amount.toString())],
      });

      if (await this.waitForTransactionSuccess(castVoteTx)) {
        console.log(`Vote cast successfully for proposal ${proposalId}`);
        return {
          result: true,
          message: `Vote cast successfully for proposal ${proposalId}`,
          transactionHash: castVoteTx,
        };
      } else {
        return {
          result: false,
          message: `Failed to cast vote for proposal ${proposalId}`,
          transactionHash: castVoteTx,
        };
      }
    } catch (error) {
      console.error('Error in castVote:', error);
      return {
        result: false,
        message: `Error casting vote: ${error.message}`,
      };
    }
  }
}