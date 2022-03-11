import {
  CreditCardOutlined,
  FileSearchOutlined,
  NumberOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Button, Input, notification, Upload, message, Select } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import {
  useMoralis,
  useMoralisWeb3Api,
  useMoralisWeb3ApiCall,
} from "react-moralis";
import { create as ipfsHttpClient } from "ipfs-http-client";
import AssetNFTSelector from "./AssetNFTSelector";
import _ from "lodash";
import { assetNftContractABI } from "../../../contracts/assetNftContracABI";

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

function MintForm() {
  const { Moralis } = useMoralis();
  const [isPending, setIsPending] = useState(false);

  const [asset, setAsset] = useState();
  const [assetContractAdd, setAssetContractAdd] = useState();
  const [recipientAdd, setRecipientAdd] = useState();
  const [tokenId, setTokenId] = useState(0);
  const [fileUrl, setFileUrl] = useState(null);

  // List of deployed asset contracts and their names
  const assets = {
    House: "0xC664eaE6BC7b797Df98DC29a0575C3ECC1234a6A", // AssetNFT contract already deployed on Rinkeby Testnet.
    Car: "won't work",
    ExampleDeed: "won't work",
  };

  // useEffect(() => {
  //   asset && amount && receiver ? setTx({ amount, receiver, asset }) : setTx();
  // }, [asset, amount, receiver]);

  const openNotification = ({ message, description }) => {
    notification.open({
      placement: "bottomRight",
      message,
      description,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };

  // takes in array of asset contracts, gets all this info
  const getTotalSupply = async (assetAddress) => {
    const message = await Moralis.executeFunction({
      contractAddress: assetAddress,
      functionName: "totalSupply",
      abi: assetNftContractABI,
    });

    console.log("totalSupplyData ", message.toNumber());

    return message.toNumber();
  };

  const mintNFT = async () => {
    // input checks
    console.log("BA", recipientAdd);
    console.log("assetContractAdd", assets[asset]);

    // create JSON metadata and upload to IPFS
    const metaData = JSON.stringify({
      name: "",
      description: "",
      symbol: "",
      image: fileUrl,
    });

    try {
      const added = await client.add(metaData);
      const tokenURI = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log("tokenURI ", tokenURI);

      const tokenId = (await getTotalSupply(assets[asset])) + 1;

      /* after file is uploaded to IPFS, pass the URL to mint NFT on the blockchain */

      // execute create Will function using moralisAPI
      const mintTransaction = await Moralis.executeFunction({
        contractAddress: assets[asset],
        functionName: "mint",
        abi: assetNftContractABI,
        params: {
          _to: recipientAdd,
          _tokenId: tokenId,
          tokenURI_: tokenURI,
        },
      });

      console.log(mintTransaction.hash);
      setIsPending(true);
      // Wait until the transaction is confirmed
      await mintTransaction.wait();

      // Read new value
      const mintTxMsg = await Moralis.executeFunction({
        contractAddress: assets[asset],
        functionName: "ownerOf",
        abi: assetNftContractABI,
        params: { tokenId: tokenId },
      });

      message.success(`Asset NFT successfully minted to: ${mintTxMsg}!`);

      // Clear inputs
      setRecipientAdd("");
      setAsset(undefined);
      setFileUrl(undefined);
      setIsPending(false);
    } catch (error) {
      console.log("Error uploading file: ", error);
      setIsPending(false);
    }
  };

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  //IPFS upload
  const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

  const uploadToIPFS = async (file) => {
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.tranfer}>
        <div style={styles.header}>
          <h3>Mint Asset NFT</h3>
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Asset:</Text>
          </div>

          {/* Remove later */}
          <AssetNFTSelector
            // TODO: Remove hard coded options
            value={asset}
            options={assets}
            setAsset={setAsset}
            style={{ width: "100%" }}
          />
          {/*<AssetSelector setAsset={setAsset} style={{ width: "100%" }} />*/}
        </div>

        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Recipient:</Text>
          </div>
          <Input
            size="large"
            prefix={<FileSearchOutlined />}
            autoFocus
            value={recipientAdd}
            onChange={(e) => {
              setRecipientAdd(e.target.value);
            }}
          />
        </div>

        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Upload Image:</Text>
          </div>
          <div style={{ width: "100%" }}>
            {fileUrl ? (
              <div>
                <img src={fileUrl} />
              </div>
            ) : (
              <Upload.Dragger
                name="file"
                multiple={false}
                action={(file) => uploadToIPFS(file)}
                onChange={(info) => {
                  console.log("info", info);
                  const { status } = info.file;
                  if (status !== "uploading") {
                    console.log(info.file, info.fileList);
                  }
                  if (fileUrl) {
                    message.success(
                      `${info.file.name} file uploaded successfully.`,
                    );
                  } else if (status === "error") {
                    message.error(`${info.file.name} file upload failed.`);
                  }
                }}
                onDrop={(e) => {
                  console.log("Dropped files", e.dataTransfer.files);
                }}
              >
                <Upload customRequest={dummyRequest} />
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload.
                </p>
              </Upload.Dragger>
            )}
          </div>
        </div>
        <Button
          type="primary"
          size="large"
          loading={isPending}
          style={{ width: "100%", marginTop: "25px" }}
          onClick={mintNFT}
          disabled={!recipientAdd || !fileUrl || !asset}
        >
          Mint NFT
        </Button>
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

export default MintForm;
