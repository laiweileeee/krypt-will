import {
  CreditCardOutlined,
  FileSearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Input, message, notification, Spin } from "antd";
import Text from "antd/lib/typography/Text";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { truncateEthAddress } from "../../../utils/TruffleEthAddress";
import { willFactoryContractABI } from "../../../contracts/willFactoryContractABI";

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

const willFactoryAddress = "0xF04e1D951Ad1652dF7c7C930E865184E9bcD7327";

function CreateWillForm() {
  const { Moralis, account, isAuthenticated } = useMoralis();
  const [loading, setLoading] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState();
  const [willOwnerAdd, setWillOwnerAdd] = useState();
  const [txHash, setTxHash] = useState();

  // Populate connectedAddress state when user's wallet is connected
  useEffect(() => {
    console.log(account);
    setConnectedAddress(isAuthenticated && account);
  }, [account, isAuthenticated]);

  const createWillGov = async () => {
    // execute create Will function using moralisAPI
    const createWillGovTx = await Moralis.executeFunction({
      contractAddress: willFactoryAddress,
      functionName: "createWill",
      abi: willFactoryContractABI,
      params: {
        willOwner: willOwnerAdd,
        govAdd: connectedAddress,
      },
    });

    console.log(createWillGovTx.hash);
    setTxHash(createWillGovTx.hash);
    setLoading(true);

    await createWillGovTx.wait();

    const createWillGovTxMsg = await Moralis.executeFunction({
      contractAddress: willFactoryAddress,
      functionName: "willOwnerToWillAddress",
      abi: willFactoryContractABI,
      params: {
        "": willOwnerAdd,
      },
    });

    console.log(createWillGovTxMsg);

    message.success(
      `Successfully created will for will owner: ${willOwnerAdd}!!`,
    );
    setLoading(false);
    setWillOwnerAdd(undefined);
  };

  return (
    <div style={styles.card}>
      {loading ? (
        //  show spinner
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "25px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            Creating will for {truncateEthAddress(willOwnerAdd)}...
          </div>
          <div style={{ textAlign: "center", fontWeight: "normal" }}>
            View transaction{" "}
            <a
              href={`https://rinkeby.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
          </div>
          <div style={{ marginTop: "50px", marginBottom: "50px" }}>
            <Spin size="large" />
          </div>
        </div>
      ) : (
        //  show create will form
        <div>
          <div style={styles.header}>
            <h3>Create will </h3>
            <p style={{ color: "red", fontWeight: "normal" }}>
              {" "}
              ---- Only available for gov address! ----{" "}
            </p>{" "}
          </div>

          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Address:</Text>
            </div>
            <Input
              size="large"
              prefix={<FileSearchOutlined />}
              value={willOwnerAdd}
              onChange={(e) => {
                setWillOwnerAdd(`${e.target.value}`);
              }}
              placeholder="Enter will owner address"
            />
          </div>

          <Button
            type="primary"
            size="large"
            loading={loading}
            style={{ width: "100%", marginTop: "25px" }}
            onClick={createWillGov}
            disabled={!willOwnerAdd}
          >
            Create Will <SendOutlined />
          </Button>
        </div>
      )}
    </div>
  );
}

export default CreateWillForm;
