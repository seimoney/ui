import type { Hex } from "viem";
import type { Network } from "@seimoney/sei-x402/types";

type Token = {
  name: string;
  icon: string;
  address: Hex;
  symbol: string;
  decimals: number;
  assetVersion: string;
  priceUSD: number;
};

type ERC20Amount = {
  amount: string;
  token: Token;
};

type Account = {
  owner: Hex;
  name?: string;
  avatarURL?: string;
  emailAddress: string;
  createdAt: Date;
  updatedAt?: Date;
};

type CreateAccount = {
  owner: Hex;
  name?: string;
  avatarURL?: string;
  emailAddress: string;
};

type Link = {
  paymentId: string;
  description: string;
  imageURL: string;
  attributes: Record<string, string>;
  owner: Hex;
  recipientAddress: Hex;
  amount: ERC20Amount;
  oneTime: boolean;
  nonce: number;
  status: "pending" | "paid" | "expired" | "active";
  createdAt: Date;
  updatedAt?: Date;
  network: Network;
};

type CreatePaymentLink = {
  description: string;
  amount: ERC20Amount;
  attributes: Record<string, string>;
  recipientAddress?: Hex;
  oneTime: boolean;
  network: Network;
};

type DeletePaymentLink = {
  paymentId: string;
  signature: Hex;
  expiresAt: number;
};

type FulFillPaymentLink = {
  paymentId: string;
};

type GatedFile = {
  fileId: string;
  name: string;
  description: string;
  previewURL: string;
  metadata: Record<string, string>;
  owner: Hex;
  amount: ERC20Amount;
  downloads: number;
  createdAt: Date;
  updatedAt?: Date;
  network: Network;
};

type UploadFile = {
  name: string;
  description: string;
  previewURL: string | null;
  metadata: Record<string, string>;
  amount: ERC20Amount;
  network: Network;
};

type DownloadFile = {
  fileId: string;
  signature: Hex;
  expiresAt: number;
};

type DeleteFile = {
  fileId: string;
  signature: Hex;
  expiresAt: number;
};

type FulFillFile = {
  fileId: string;
};

type Authorization = {
  owner: Hex;
  signature: Hex;
  expiresAt: number;
};

type SignContract = {
  contractId: string;
  signature: Hex;
  expiresAt: number;
};

type Contract = {
  contractId: string;
  address: Hex;
  name: string;
  role: {
    title: string;
    description: string;
  };
  owner: Hex;
  recipientAddress: Hex;
  payroll: {
    frequency: "hourly" | "12-hours" | "daily" | "weekly" | "monthly";
    amount: ERC20Amount;
  };
  metadata: Record<string, string>;
  signed: {
    status: boolean;
    timestamp?: number;
  };
  company: string;
  network: Network;
  documentURL?: string;
  createdAt: Date;
  updatedAt?: Date;
};

type CreateContract = {
  name: string;
  role: {
    title: string;
    description: string;
  };
  recipientAddress?: Hex;
  payroll: {
    frequency: "hourly" | "12-hours" | "daily" | "weekly" | "monthly";
    amount: ERC20Amount;
  };
  metadata: Record<string, string>;
  company: string;
  documentURL?: string;
  network: Network;
};

type CreateContractExtract = {
  name?: string;
  role: { title?: string; description?: string };
  recipientAddress?: Hex;
  payroll: {
    frequency?: "daily" | "weekly" | "monthly";
    amount: {
      amount?: string;
    };
  };
  metadata?: Record<string, string>;
  company?: string;
};

type Strategy = {
  address: Hex;
  name: string;
  description: string;
  apy: string;
  riskLevel: "low" | "medium" | "high";
  protocols: string[];
  fees: string;
  creator: string;
};

type SavingsAccount = {
  address: Hex;
  balance: {
    amount: string;
    token: {
      name: string;
      icon: string;
      address: string;
      symbol: string;
      decimals: number;
    };
  };
  activeStrategy: Strategy | undefined;
  autoCompoundEnabled: boolean;
};

type Activity = {
  owner: Hex;
  id: string;
  description: string;
  amount: ERC20Amount;
  type: "link" | "file" | "contract";
  status: "failed" | "success";
  transaction?: string;
  createdAt?: Date;
  updateAt?: Date;
};

type Analytics = {
  totalRevenueUSD: number;
  totalPaymentLinks: {
    active: number;
    inActive: number;
  };
  totalFiles: {
    active: number;
    inActive: number;
  };
  totalContracts: {
    active: number;
    inActive: number;
  };
  recentsActivities: Activity[];
  recentRevenues: Record<string, number>;
  activeContracts: Record<string, number>;
};

type Product = {
  productId: string;
  name: string;
  description: string;
  availableInStock: number;
  maxQuantity?: number;
  isFeatured: boolean;
  isOnSale: boolean;
  images: Image[];
  amount: ERC20Amount;
  owner: Hex;
  checkoutId: string;
  createdAt: Date;
  updatedAt?: Date;
  network: Network;
};

type Schedule = {
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[];
};

type Location = {
  address: string;
  city?: string;
  zipCode?: string;
  country?: string;
};

type Checkout = {
  checkoutId: string;
  owner: Hex;
  name: string;
  tagline: string;
  about: string;
  category: string;
  logoURL: string;
  location: Location;
  schedule: Schedule;
};

type CreateProduct = {
  name: string;
  description: string;
  availableInStock: number;
  maxQuantity?: number;
  isFeatured: boolean;
  isOnSale: boolean;
  amount: ERC20Amount;
  network: Network;
};

type ImageFile = {
  file: File;
  caption?: string;
};

type Image = {
  url: string;
  caption?: string;
};

export type {
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
  CreateContractExtract,
  Token,
  ERC20Amount,
  DownloadFile,
  CreateContract,
  SignContract,
  Strategy,
  SavingsAccount,
  Activity,
  Analytics,
  Product,
  Image,
  ImageFile,
  Checkout,
  CreateProduct,
};
