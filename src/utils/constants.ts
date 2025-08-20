import type { Hex } from "viem";
import type { Strategy, Token } from "../types";

const tokens: Token[] = [
  {
    name: "USDC",
    icon: "/images/usdc.png",
    address: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    decimals: 6,
    symbol: "USDC",
    assetVersion: "2",
  },
];

const availableStrategies: Strategy[] = [
  {
    address: "0xa2236475db73775aD69aE4b4099Ac4B8FF374085",
    name: "USDC Gift Strategy",
    description:
      "Earn passive yield through gifting-based USDC strategy in the Sei Community.",
    apy: "12.43",
    riskLevel: "low",
    protocols: ["Sei Community"],
    fees: "0",
    creator: "0x3E646e062F05e01e1860eA53a6DC81e7E9162DE6",
  },
  {
    address: "0x9DeB5E5E901F84fda356869A58DcB4885FDB7080",
    name: "Hackathon Testers Strategy",
    description:
      "High-yield test strategy designed for hackathon participants and team members.",
    apy: "23.12",
    riskLevel: "low",
    protocols: ["Public", "Sei Money Team"],
    fees: "0",
    creator: "0x3E646e062F05e01e1860eA53a6DC81e7E9162DE6",
  },
];

const findTokenByAddress = (address: Hex) => {
  return tokens.find(
    (token) => token.address.trim().toLowerCase() === address.toLowerCase()
  );
};

const findStrategyByAddress = (address: Hex) => {
  return availableStrategies.find(
    (strategy) =>
      strategy.address.trim().toLowerCase() === address.toLowerCase()
  );
};

const categories = [
  "Digital Products",
  "Software & Apps",
  "Education & Courses",
  "Design & Creative",
  "Business & Marketing",
  "Health & Fitness",
  "Entertainment",
  "Other",
];

const timezones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

const days: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export {
  tokens,
  findTokenByAddress,
  availableStrategies,
  findStrategyByAddress,
  categories,
  timezones,
  days,
};
