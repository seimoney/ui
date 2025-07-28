import { withPaymentInterceptor } from "../../../sei-x402/typescript/packages/x402-axios/src";
import axios from "axios";
import type { Hex } from "viem";
import type {
  Account,
  CreateAccount,
  Link,
  CreatePaymentLink,
  DeletePaymentLink,
  FulFillPaymentLink,
  GatedFile,
  UploadFile,
  DeleteFile,
  FulFillFile,
  Authorization,
  Contract,
  CreateContract,
  DownloadFile,
  CreateContractExtract,
  Activity,
  Analytics,
  SignContract,
  Product,
  CreateProduct,
  ImageFile,
  Checkout,
} from "../types";
import type { AxiosInstance } from "axios";
import type { WalletClient } from "viem";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("Missing required environment variables");
}

const baseApiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

let apiClient: AxiosInstance = baseApiClient;

const ApiService = {
  token: undefined as string | undefined,

  updateApiClient(walletClient: WalletClient | null) {
    if (walletClient && walletClient.account) {
      apiClient = withPaymentInterceptor(baseApiClient, walletClient as any);
    } else {
      apiClient = baseApiClient;
    }
  },

  setToken(token: string | undefined) {
    this.token = token;
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    baseApiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  async authorize(params: Authorization): Promise<Account & { token: string }> {
    return (await apiClient.post("/authorize", params)).data;
  },

  async getAccount(owner: Hex): Promise<Account> {
    return (await apiClient.get(`/accounts/${owner}`)).data;
  },

  async createAccount(params: CreateAccount): Promise<Account> {
    return (await apiClient.post(`/create/account`, params)).data;
  },

  async getPaymentLinks(): Promise<Link[]> {
    return (await apiClient.get(`/payment-links`)).data;
  },

  async getPaymentLink(paymentId: string): Promise<Link> {
    return (await apiClient.get(`/payment-links/${paymentId}`)).data;
  },

  async createPaymentLink(params: CreatePaymentLink): Promise<Link> {
    return (await apiClient.post(`/payment-links/create`, params)).data;
  },

  async deletePaymentLink(params: DeletePaymentLink): Promise<boolean> {
    return (await apiClient.post(`/payment-links/delete`, params)).data;
  },

  async fulfillPaymentLink(params: FulFillPaymentLink): Promise<string> {
    return (await apiClient.get(`/payment-links/fulfill/${params.paymentId}`))
      .data;
  },

  async getFiles(): Promise<GatedFile[]> {
    return (await apiClient.get("/files")).data;
  },

  async getFile(fileId: string): Promise<GatedFile> {
    return (await apiClient.get(`/files/${fileId}`)).data;
  },

  async uploadFile(params: UploadFile, file: File): Promise<GatedFile> {
    const formData = new FormData();

    Object.entries(params).forEach(([key, value]) => {
      formData.set(key, JSON.stringify(value));
    });

    formData.set("file", file);

    return (
      await apiClient.post(`/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  },

  async downloadFile(params: DownloadFile): Promise<{ url: string }> {
    return (await apiClient.post(`/files/download`, params)).data;
  },

  async deleteFile(params: DeleteFile): Promise<boolean> {
    return apiClient.post(`/files/delete`, params);
  },

  async fulfillFile(
    params: FulFillFile
  ): Promise<{ url: string; transaction: string }> {
    return (await apiClient.get(`/files/fulfill/${params.fileId}`)).data;
  },

  async getContracts(): Promise<Contract[]> {
    return (await apiClient.get(`/contracts`)).data;
  },

  async getContract(contractId: string): Promise<Contract> {
    return (await apiClient.get(`/contracts/${contractId}`)).data;
  },

  async signContract(params: SignContract): Promise<Contract> {
    return (await apiClient.post(`/contracts/sign`, params)).data;
  },

  async createContract(
    params: CreateContract,
    file: File | null
  ): Promise<Contract> {
    const formData = new FormData();

    Object.entries(params).forEach(([key, value]) => {
      formData.set(key, JSON.stringify(value));
    });

    if (file) formData.set("file", file);

    return (
      await apiClient.post(`/contracts/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  },

  async fulfillContractTransaction(transaction: string) {
    return (await apiClient.get(`/contracts/retry/${transaction}`)).data;
  },

  async extractContract(file: File): Promise<CreateContractExtract> {
    const formData = new FormData();
    formData.set("file", file);

    return (
      await apiClient.post(`/contracts/extract`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  },

  async getActivities(): Promise<Activity[]> {
    return (await apiClient.get(`/activities`)).data;
  },

  async getAnalytics(): Promise<Analytics> {
    return (await apiClient.get(`/analytics`)).data;
  },

  async getActivitiesFor(id: string): Promise<Activity[]> {
    return (await apiClient.get(`/activities/${id}`)).data;
  },

  async getCheckout(): Promise<Checkout | null> {
    return (await apiClient.get(`/checkout`)).data;
  },

  async getProducts(): Promise<Product[]> {
    return (await apiClient.get(`/checkout/products`)).data;
  },

  async getProduct(productId: string): Promise<Product> {
    return (await apiClient.get(`/checkout/products/${productId}`)).data;
  },

  async createProduct(
    params: CreateProduct,
    files: ImageFile[]
  ): Promise<Product | null> {
    const formData = new FormData();

    Object.entries(params).forEach(([key, value]) => {
      formData.set(key, JSON.stringify(value));
    });

    files.forEach((file, index) => {
      formData.append(`files`, file.file);
      if (file.caption) {
        formData.set(`caption-${index + 1}`, file.caption);
      }
    });

    return (
      await apiClient.post(`/products/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  },
};

export default ApiService;
