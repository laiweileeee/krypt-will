import { CreditCardOutlined, FileSearchOutlined } from "@ant-design/icons";
import { Alert, Button, Input, message, notification, Spin } from "antd";
import Text from "antd/lib/typography/Text";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { willContractABI } from "../../../contracts/willContractABI";
import { truncateEthAddress } from "../../../utils/TruffleEthAddress";

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

function ExecuteWillForm() {
  const { Moralis } = useMoralis();
  const [loading, setLoading] = useState(false);
  const [willContractAdd, setWillContractAdd] = useState();
  const [txHash, setTxHash] = useState();

  const executeWill = async () => {
    try {
      // execute create Will function using moralisAPI
      const executeWillTx = await Moralis.executeFunction({
        contractAddress: willContractAdd,
        functionName: "executeWill",
        abi: willContractABI,
      });

      console.log(executeWillTx.hash);
      setTxHash(executeWillTx.hash);
      setLoading(true);

      // Wait until the transaction is confirmed
      const txReceipt = await executeWillTx.wait();

      console.log("transaction receipt: ", txReceipt);
      console.log("event emitted: ", txReceipt.events[0]);

      // show success message if event exists
      if (txReceipt.events[0]) {
        message.success(
          `Successfully executed will at address ${willContractAdd}!!`,
        );
        setWillContractAdd(undefined);
        setLoading(false);
      }
    } catch (error) {
      const errorMsg = new Error(error).toString();
      message.error(errorMsg);
    }
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
            Executing will at{" "}
            {willContractAdd ? truncateEthAddress(willContractAdd) : ""}...
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
        //  show execute will form
        <div>
          <Alert
            description="Only available for gov address, ONCE per will address."
            type="warning"
            closable
            style={{ marginBottom: "1.5rem" }}
          />
          <div style={styles.header}>
            <h3>Execute will </h3>
          </div>

          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Address:</Text>
            </div>
            <Input
              size="large"
              prefix={<FileSearchOutlined />}
              value={willContractAdd}
              onChange={(e) => {
                setWillContractAdd(`${e.target.value}`);
              }}
              placeholder="Enter will contract address"
            />
          </div>

          <Button
            type="primary"
            size="large"
            loading={loading}
            style={{ width: "100%", marginTop: "25px", borderRadius: "0.3rem" }}
            onClick={executeWill}
            disabled={!willContractAdd}
          >
            Simulate Death 💀
          </Button>
        </div>
      )}
    </div>
  );
}

export default ExecuteWillForm;
