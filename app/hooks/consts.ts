export const API_HOST = "https://apiprod.bigbottle.vet/bigbottle/vefuture";

export const API_ENDPOINTS = {
  UPLOAD_RECEIPT: "/api/uploads",
  UPLOAD_PRESIGNED_URL: "/api/uploads/presigned-url",
};

import type { ContractAddresses, AppConfig } from "../types";

export const Addresses: ContractAddresses = {
  VeDelegate: "0xfc32a9895C78CE00A1047d602Bd81Ea8134CC32b",
  B3TR: "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",
  VOT3: "0x76Ca782B59C74d088C7D2Cce2f211BC00836c602",
  VePassport: "0x35a267671d8EDD607B2056A9a13E7ba7CF53c8b3",
  VeBetterPassport: "0x35a267671d8EDD607B2056A9a13E7ba7CF53c8b3", // Using same as VePassport for now
  VeBetterDAO: "0x89A00Bb0947a30FF95BEeF77a66AEdE3842Fe5B7", // Using AllocationVoting for now
  XAllocationVoting: "0x89A00Bb0947a30FF95BEeF77a66AEdE3842Fe5B7",
  Treasury: "0x838A33AF756a6366f93e201423E1425f67eC0Fa7", // Using Rewarder for now
  Emissions: "0xDf94739bd169C84fe6478D8420Bb807F1f47b135",
  GovernorContract: "0xeb71148c9B3cd57e228c2152d79f6e78F5F1ef9a", // Using VeDelegateVotes for now
  TimelockController: "0xeb71148c9B3cd57e228c2152d79f6e78F5F1ef9a", // Using VeDelegateVotes for now
  VotingEscrow: "0xeb71148c9B3cd57e228c2152d79f6e78F5F1ef9a", // Using VeDelegateVotes for now
  RewardPool: "0x838A33AF756a6366f93e201423E1425f67eC0Fa7",
  XAllocationPool: "0x89A00Bb0947a30FF95BEeF77a66AEdE3842Fe5B7",
  QuadraticFunding: "0x89A00Bb0947a30FF95BEeF77a66AEdE3842Fe5B7", // Using AllocationVoting for now
};

// BigBottle application unique identifier in VeBetterDAO ecosystem
export const APP_CONFIG: AppConfig = {
  APP_ID: "0x68c854d0aef9f5517d58d4772395d0ab44d914070fa6ca5a96f2146ca1449248",
  APP_NAME: "BigBottle",
};
