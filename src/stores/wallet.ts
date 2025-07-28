import { zeroAddress, type Hex } from "viem";
import { defineStore } from "pinia";
import type { Account } from "../types";

export const useWalletStore = defineStore("wallet", {
  state: () => ({
    address: null as Hex | null,
    account: null as Account | null,
    savingsAccount: null as Hex | null,
  }),
  actions: {
    setAddress(newAddress: Hex | null) {
      if (newAddress == zeroAddress) {
        this.address = null;
      } else {
        this.address = newAddress;
      }
    },
    setAccount(newAccount: Account | null) {
      this.account = newAccount;
    },
    setSavingAccount(newSavingsAccount: Hex | null) {
      if (newSavingsAccount == zeroAddress) {
        this.savingsAccount = null;
      } else {
        this.savingsAccount = newSavingsAccount;
      }
    },
  },
});
