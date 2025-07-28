import { useWalletStore } from "../stores/wallet";
import ApiService from "../api/api-service";
import SignatureMsg from "../types/signature";
import type { Hex } from "viem";
import { getWalletClient, signMessage } from "@wagmi/core";
import { config } from "../utils/wallet-config";
import { SavingsAccountContract, SeiMoneyContract } from "../smart_contract";

export function useAuth() {
  const walletStore = useWalletStore();

  const login = async (owner: Hex): Promise<boolean> => {
    if (walletStore.account) return true;

    const expiresAt = Date.now() + SignatureMsg.SIGNATURE_TTL;
    const message = `${SignatureMsg.AUTHORIZATION}:${expiresAt}`;

    const signature = await signMessage(config, { message });

    const tokenAccount = await ApiService.authorize({
      owner,
      signature,
      expiresAt,
    });

    if (!tokenAccount) return false;

    walletStore.setAccount(tokenAccount);
    ApiService.setToken(tokenAccount.token);
    localStorage.setItem("token", tokenAccount.token);

    const savingsAccount = await SeiMoneyContract.getAccount(owner);
    walletStore.setSavingAccount(savingsAccount);
    if (savingsAccount) SavingsAccountContract.setAddress(savingsAccount);

    return true;
  };

  const register = async (
    owner: Hex,
    emailAddress: string,
    avatarURL?: string,
    name?: string
  ) => {
    const account = await ApiService.createAccount({
      owner,
      emailAddress,
      avatarURL,
      name: name?.trim(),
    });

    if (!account) return;

    return await login(owner);
  };

  const logout = async () => {
    walletStore.setAccount(null);
    walletStore.setAddress(null);
    localStorage.removeItem("token");
  };

  const initAuth = () => {
    if (walletStore.address) {
      login(walletStore.address);
    }
  };

  return {
    login,
    register,
    logout,
    initAuth,
  };
}
