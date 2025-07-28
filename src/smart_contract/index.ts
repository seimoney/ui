import { zeroAddress, type Hex } from "viem";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "../utils/wallet-config";
import { savingsAccountAbi, seiMoneyAbi } from "./abis";

const SeiMoneyContract = {
  address: "0xa73cC11da965D1Fc17f06EC4F635477022cF308a" as Hex,

  async createAccount(): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: seiMoneyAbi,
        address: this.address,
        functionName: "createAccount",
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async getAccount(owner: Hex): Promise<Hex | null> {
    try {
      return (await readContract(config, {
        abi: seiMoneyAbi,
        address: this.address,
        functionName: "getAccount",
        args: [owner],
      })) as Hex;
    } catch (error) {
      return null;
    }
  },

  async totalAccounts(): Promise<bigint> {
    try {
      return (await readContract(config, {
        abi: seiMoneyAbi,
        address: this.address,
        functionName: "totalAccounts",
      })) as bigint;
    } catch (error) {
      return BigInt(0);
    }
  },
};

const SavingsAccountContract = {
  address: zeroAddress as Hex,

  setAddress(newAddress: Hex) {
    this.address = newAddress;
  },

  async earn(token: Hex): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: savingsAccountAbi,
        address: this.address,
        functionName: "earn",
        args: [token],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async useStrategy(token: Hex, strategy: Hex): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: savingsAccountAbi,
        address: this.address,
        functionName: "useStrategy",
        args: [token, strategy],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async exitStrategy(token: Hex): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: savingsAccountAbi,
        address: this.address,
        functionName: "exitStrategy",
        args: [token],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async withdraw(token: Hex, amount: bigint): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: savingsAccountAbi,
        address: this.address,
        functionName: "withdraw",
        args: [token, amount],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async balanceOf(token: Hex): Promise<bigint> {
    try {
      return (await readContract(config, {
        abi: savingsAccountAbi,
        address: this.address,
        functionName: "balanceOf",
        args: [token],
      })) as bigint;
    } catch (error) {
      return BigInt(0);
    }
  },

  async getStrategy(token: Hex): Promise<Hex | null> {
    try {
      return (await readContract(config, {
        abi: savingsAccountAbi,
        address: this.address,
        functionName: "getStrategy",
        args: [token],
      })) as Hex;
    } catch (error) {
      return null;
    }
  },
};

export { SeiMoneyContract, SavingsAccountContract };
