import {
  CreditCardOutlined,
  FileSearchOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { Button, Input, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

const styles = {
  card: {
    alignItems: "center",
    width: "100%",
  },
  header: {
    textAlign: "center",
  },
  input: {
    width: "100%",
    outline: "none",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textverflow: "ellipsis",
    appearance: "textfield",
    color: "#041836",
    fontWeight: "700",
    border: "none",
    backgroundColor: "transparent",
  },
  select: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
  },
  textWrapper: { maxWidth: "80px", width: "100%" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexDirection: "row",
  },
};

function WillContent() {
  const { Moralis } = useMoralis();

  const [beneficiaryAdd, setBeneficiaryAdd] = useState();
  const [assetContractAdd, setAssetContractAdd] = useState();
  const [tokenId, setTokenId] = useState(0);

  const createWill = async () => {
    // input checks
    console.log("BA", beneficiaryAdd);
    console.log("nftAdd", assetContractAdd);
    console.log("tokenId", tokenId);

    if (!beneficiaryAdd) {
      openNotification({
        message: "Error!",
        description: "Please Enter Beneficiary Address",
      });
      return;
    }
    if (!assetContractAdd) {
      openNotification({
        message: "Error!",
        description: "Please Enter Asset Contract Address",
      });
      return;
    }
    if (!tokenId) {
      openNotification({
        message: "Error!",
        description: "Please Enter Token ID",
      });
      return;
    }

    // execute function using moralisAPI
    const { fetch, data, error, isLoading } = await Moralis.executeFunction({
      contractAddress: "0x810458372E0ed2885FFb5C98D4Db08F214Ee2959",
      functionName: "createWill",
      abi: ABI,
      params: {
        beneficiaryAdd: "0x09E581ed378c85591E6C5EC23439B79924088747",
        assetNFTcontract: "0x292d2F19e8687af68206b28A0CD79F494b7aDA90",
        tokenId: 3,
      },
    });

    console.log(data);
  };

  return (
    <div style={styles.card}>
      <div style={styles.tranfer}>
        <div style={styles.header}>
          <h3>View Will</h3>
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Recipient:</Text>
          </div>
          <Input
            size="large"
            prefix={<FileSearchOutlined />}
            autoFocus
            onChange={(e) => {
              setBeneficiaryAdd(e.target.value);
            }}
          />
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>NFT Address:</Text>
          </div>
          <Input
            size="large"
            prefix={<FileSearchOutlined />}
            autoFocus
            onChange={(e) => {
              setAssetContractAdd(e.target.value);
            }}
          />
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>TokenId:</Text>
          </div>
          <Input
            size="large"
            prefix={<NumberOutlined />}
            onChange={(e) => {
              setTokenId(`${e.target.value}`);
            }}
          />
        </div>
        {/*<div style={styles.select}>*/}
        {/*  <div style={styles.textWrapper}>*/}
        {/*    <Text strong>Asset:</Text>*/}
        {/*  </div>*/}
        {/*  <AssetSelector setAsset={setAsset} style={{ width: "100%" }} />*/}
        {/*</div>*/}
      </div>
    </div>
  );
}

const ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "beneficiaryAdd",
        type: "address",
      },
      {
        internalType: "address",
        name: "assetNFTcontract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "createWill",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "destroyWill",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "editAssets",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "executeWill",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
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
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "assets",
    outputs: [
      {
        internalType: "address",
        name: "assetNFTcontract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "beneficiaries",
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
  {
    inputs: [],
    name: "owner",
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
  {
    inputs: [],
    name: "willOwner",
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

export default WillContent;
