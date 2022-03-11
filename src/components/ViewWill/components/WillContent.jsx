import {
  CreditCardOutlined,
  FileSearchOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { Button, Input, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
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

// TODO: Remove hardcode and find a way to fetch will address associated with this user's wallet address
// TODO: Find will contract address from user
const willContractAddress = "0x145c8B5d8C158D24159Da4A0972864F287482A8d";

function WillContent() {
  const { Moralis } = useMoralis();

  const [beneficiaryAdd, setBeneficiaryAdd] = useState();
  const [assetContractAdd, setAssetContractAdd] = useState();
  const [tokenId, setTokenId] = useState(0);

  useEffect(() => fetchWill);

  const fetchWill = async () => {
    console.log("inside fetchwill ");

    //get beneficiaries[0]
    const fetchBeneficiariesTxMsg = await Moralis.executeFunction({
      contractAddress: willContractAddress,
      functionName: "beneficiaries",
      abi: willContractABI,
      params: {
        "": 0,
      },
    });

    console.log("fetched Beneficiary ", fetchBeneficiariesTxMsg);
    setBeneficiaryAdd(fetchBeneficiariesTxMsg);

    //get assets
    const fetchAssetTxMsg = await Moralis.executeFunction({
      contractAddress: willContractAddress,
      functionName: "assets",
      abi: willContractABI,
      params: {
        "": fetchBeneficiariesTxMsg,
      },
    });

    console.log("fetched Assets", fetchAssetTxMsg);
    setAssetContractAdd(fetchAssetTxMsg?.assetNFTcontract);
    setTokenId(fetchAssetTxMsg?.tokenId.toNumber());
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
          <p>{beneficiaryAdd ? truncateEthAddress(beneficiaryAdd) : "-"}</p>
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>NFT Address:</Text>
          </div>
          <p>{assetContractAdd ? truncateEthAddress(assetContractAdd) : "-"}</p>
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>TokenId:</Text>
          </div>
          <p>{tokenId}</p>
        </div>
        {/*<Button onClick={fetchWill}>Fetch</Button>*/}
      </div>
    </div>
  );
}

export default WillContent;
