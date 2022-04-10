export const willContractABI = [
  {
    anonymous: false,
    inputs: [],
    name: "AssetAllocationSet",
    type: "event",
  },
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
    name: "getAssetNFTContract",
    outputs: [
      {
        internalType: "contract AssetNFT",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDataStorageContract",
    outputs: [
      {
        internalType: "contract DataStorage",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenIdList",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
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
