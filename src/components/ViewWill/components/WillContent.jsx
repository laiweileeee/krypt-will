import {
  CreditCardOutlined,
  FileSearchOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { Button, Input, notification, Spin, Space } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { willContractABI } from "../../../contracts/willContractABI";
import { willFactoryABI } from "../../../contracts/willFactoryABI";
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
// const willContractAddress = "0x145c8B5d8C158D24159Da4A0972864F287482A8d";
const willFactoryAddress = "0xF04e1D951Ad1652dF7c7C930E865184E9bcD7327";

function WillContent() {
  const { Moralis, isAuthenticated, account } = useMoralis();

  const [beneficiaryAdd, setBeneficiaryAdd] = useState();
  const [assetContractAdd, setAssetContractAdd] = useState();
  const [tokenId, setTokenId] = useState(0);
  const [loading, setLoading] = useState(false);

  // run upon existences of web3 instance
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchWill();
      setLoading(false);
    };

    // only fetch when there is a web3 instance
    if (account) fetchData();
    // eslint-disable-next-line
  }, [isAuthenticated, account]);

  const fetchWill = async () => {
    const fetchWillContract = await Moralis.executeFunction({
      contractAddress: willFactoryAddress,
      functionName: "willOwnerToWillAddress",
      abi: willFactoryABI,
      params: {
        "": account,
      },
    });

    console.log("will contract:", fetchWillContract);
    const willContractAddress = fetchWillContract;

    if (fetchWillContract !== "0x0000000000000000000000000000000000000000") {
      try {
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
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.tranfer}>
        <div style={styles.header}>
          <h3>View Will</h3>
          <p style={{ color: "red", fontWeight: "normal" }}>
            {" "}
            ---- Fetching from a hardcoded will contract ----{" "}
          </p>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "25px",
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <section>
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
              <p>
                {assetContractAdd ? truncateEthAddress(assetContractAdd) : "-"}
              </p>
            </div>
            <div style={styles.select}>
              <div style={styles.textWrapper}>
                <Text strong>TokenId:</Text>
              </div>
              <p>{tokenId}</p>
            </div>
            {/*<Button onClick={fetchWill}>Fetch</Button>*/}
          </section>
        )}
      </div>
    </div>
  );
}

export default WillContent;
