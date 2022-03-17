import { CreditCardOutlined, FileSearchOutlined } from "@ant-design/icons";
import { Button, Input, message, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { willContractABI } from "../../../contracts/willContractABI";

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
  const [isPending, setIsPending] = useState(false);
  const [willContractAdd, setWillContractAdd] = useState();

  const executeWill = async () => {
    // execute create Will function using moralisAPI
    const executeWillTx = await Moralis.executeFunction({
      contractAddress: willContractAdd,
      functionName: "executeWill",
      abi: willContractABI,
    });

    console.log(executeWillTx.hash);
    setIsPending(true);

    // Wait until the transaction is confirmed
    await executeWillTx.wait();

    // Check if will is still active
    const executeWillTxMsg1 = await Moralis.executeFunction({
      contractAddress: willContractAdd,
      functionName: "isActive",
      abi: willContractABI,
    });

    // Check that isActive value is now false
    console.log(executeWillTxMsg1);
    if (executeWillTxMsg1) {
      message.error("Failed to change isActive to false state in contract");
    }

    // Read new value
    const executeWillTxMsg2 = await Moralis.executeFunction({
      contractAddress: willContractAdd,
      functionName: "willOwner",
      abi: willContractABI,
    });

    message.success(
      `Successfully executed will at address ${executeWillTxMsg2}!!`,
    );
    setWillContractAdd(undefined);
    setIsPending(false);
  };

  return (
    <div style={styles.card}>
      <div style={styles.tranfer}>
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
          loading={isPending}
          style={{ width: "100%", marginTop: "25px" }}
          onClick={executeWill}
          disabled={!willContractAdd}
        >
          Simulate Death 💀
        </Button>
      </div>
    </div>
  );
}

export default ExecuteWillForm;
