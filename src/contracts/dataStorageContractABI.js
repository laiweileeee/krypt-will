export const dataStorageContractABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getTokenIdData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "assetNftContractAddress",
            type: "address",
          },
          {
            internalType: "bool",
            name: "includedInWill",
            type: "bool",
          },
          {
            internalType: "address",
            name: "beneficiary",
            type: "address",
          },
        ],
        internalType: "struct DataStorage.AssetStatus",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getTokenIdStatus",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "assetNftContractAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
    ],
    name: "setTokenIdData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "toggleTokenIdStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
