export const willContractABI = [
  {
    inputs: [],
    name: "destroyWill",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "executeWill",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "willOwnerAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "govAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "dataStorageContractAddess",
        type: "address",
      },
    ],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
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
        internalType: "struct Will.AssetData[]",
        name: "assetDataList",
        type: "tuple[]",
      },
    ],
    name: "setAssetAllocation",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "willOwner",
        type: "address",
      },
    ],
    name: "WillCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "willOwner",
        type: "address",
      },
    ],
    name: "WillDestroyed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "govAdd",
        type: "address",
      },
    ],
    name: "WillExecuted",
    type: "event",
  },
  {
    inputs: [],
    name: "government",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
