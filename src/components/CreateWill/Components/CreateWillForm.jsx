import {
  CreditCardOutlined,
  FileSearchOutlined,
  NumberOutlined,
  SendOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Image,
  Input,
  Modal,
  Skeleton,
  Tooltip,
  message,
} from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import { useMoralis, useNFTBalances } from "react-moralis";
import { useVerifyMetadata } from "../../../hooks/useVerifyMetadata";
import Meta from "antd/es/card/Meta";
import { truncateEthAddress } from "../../../utils/TruffleEthAddress";
import _ from "lodash";
import { willContractABI } from "../../../contracts/willContractABI";
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

// TODO: Remove hardcode and find a way to fetch will address associated with this user's wallet address
const willContractAddress = "0x145c8B5d8C158D24159Da4A0972864F287482A8d";

function CreateWillForm() {
  const { Moralis, account, isAuthenticated } = useMoralis();
  const { data: NFTBalances } = useNFTBalances();
  const [connectedAddress, setConnectedAddress] = useState();
  const [isPending, setIsPending] = useState(false);
  const [isApprovalPending, setIsApprovalPending] = useState(false);

  const [beneficiaryAdd, setBeneficiaryAdd] = useState();
  const [assetContractAdd, setAssetContractAdd] = useState();
  const [tokenId, setTokenId] = useState();
  const [isNftApproved, setIsNftApproved] = useState(false);

  const { verifyMetadata } = useVerifyMetadata();

  /*  Modal States */
  const [isModalVisible, setIsModalVisible] = useState(false);

  /* fetch will contract address associated with this user  */

  /* Modal functions */
  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Populate connectedAddress state when user's wallet is connected
  useEffect(() => {
    setConnectedAddress(isAuthenticated && account);
  }, [account, isAuthenticated]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     await checkNftApproval();
  //   };
  //
  //   try {
  //     fetchData();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

  const checkNftApproval = async (nftContractAddress) => {
    try {
      // Read from contract - check if intended state is updated
      const setApprovalForAllTxMsg = await Moralis.executeFunction({
        contractAddress: nftContractAddress,
        functionName: "isApprovedForAll",
        abi: assetNftContractABI,
        params: { owner: connectedAddress, operator: willContractAddress },
      });

      console.log("setApprovalForAllTxMsg ", setApprovalForAllTxMsg);
      setIsNftApproved(setApprovalForAllTxMsg);
    } catch (error) {
      console.log("Error checking NFT approval: ", error);
    }
  };

  const approveAllNfts = async () => {
    if (isNftApproved) return;

    try {
      const setApprovalForAllTx = await Moralis.executeFunction({
        contractAddress: assetContractAdd,
        functionName: "setApprovalForAll",
        abi: assetNftContractABI,
        params: {
          operator: willContractAddress,
          approved: true,
        },
      });

      console.log(setApprovalForAllTx.hash);
      setIsApprovalPending(true);
      await setApprovalForAllTx.wait();

      // Read from contract to check if intended state is updated
      await checkNftApproval(assetContractAdd);
      message.success(`Approval Success!!`); // TODO: sometimes doesn't work
      setIsApprovalPending(false);
    } catch (error) {
      console.log("Error approving NFTs: ", error);
      setIsApprovalPending(false);
    }
  };

  const createWill = async () => {
    // input checks
    console.log("BA", beneficiaryAdd);
    console.log("nftAdd", assetContractAdd);
    console.log("tokenId", tokenId);

    try {
      // execute function using moralisAPI
      const createWillTx = await Moralis.executeFunction({
        contractAddress: willContractAddress,
        functionName: "createWill",
        abi: willContractABI,
        params: {
          beneficiaryAdd: beneficiaryAdd,
          assetNFTcontract: assetContractAdd,
          tokenId: tokenId,
        },
      });

      setIsPending(true);
      console.log("tx hash ", createWillTx.hash);
      await createWillTx.wait();

      // check if beneficiary has been added to the contract
      const createWillTxMsg = await Moralis.executeFunction({
        contractAddress: willContractAddress,
        functionName: "assets",
        abi: willContractABI,
        params: { "": beneficiaryAdd },
      });

      console.log(createWillTxMsg);

      message.success(
        `Successfully created will for beneficiary: ${truncateEthAddress(
          beneficiaryAdd,
        )}!`,
      );

      setBeneficiaryAdd(undefined);
      setAssetContractAdd(undefined);
      setIsPending(false);
    } catch (error) {
      console.log("Error creating will: ", error);
      setIsPending(false);
    }
  };

  useEffect(() => {
    console.log(" useEffect assetContract", assetContractAdd);
  }, [assetContractAdd]);

  return (
    <div style={styles.card}>
      <div>
        <div style={styles.header}>
          <h3>Create Will</h3>
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Recipient:</Text>
          </div>
          <Input
            size="large"
            prefix={<FileSearchOutlined />}
            autoFocus
            value={beneficiaryAdd}
            onChange={(e) => {
              setBeneficiaryAdd(e.target.value);
            }}
            placeholder="Enter beneficiary address"
            allowClear={true}
          />
        </div>

        {assetContractAdd ? (
          <div>
            <div style={styles.select}>
              <div style={styles.textWrapper}>
                <Text strong>Asset: </Text>
              </div>

              <Input
                size="large"
                prefix={<FileSearchOutlined />}
                autoFocus
                value={truncateEthAddress(assetContractAdd)}
                disabled
              />
            </div>
            <div style={styles.select}>
              <div style={styles.textWrapper}>
                <Text strong>Token ID:</Text>
              </div>
              <Input
                size="large"
                prefix={<NumberOutlined />}
                autoFocus
                value={tokenId}
                disabled
              />
            </div>

            {/* Approve all NFTs if they aren't approved yet   */}
            {!isNftApproved && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "20px",
                  border: "0.5px",
                  borderStyle: "solid",
                  borderColor: "lightgray",
                  borderRadius: "3px",
                  marginTop: "20px",
                }}
              >
                <p style={{ fontWeight: "normal" }}>
                  You have not approved your NFTs for usage
                </p>
                <Button
                  type="primary"
                  size="large"
                  loading={isApprovalPending}
                  style={{
                    width: "auto",
                    marginTop: "10px",
                    textAlign: "center",
                  }}
                  onClick={approveAllNfts}
                >
                  Approve ALL NFTs
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="primary"
              size="large"
              loading={isPending}
              style={{
                width: "auto",
                marginTop: "25px",
              }}
              onClick={showModal} // disabled={}
            >
              Choose NFT
            </Button>
          </div>
        )}

        <Button
          type="primary"
          size="large"
          loading={isPending}
          style={{ width: "100%", marginTop: "25px" }}
          onClick={createWill}
          disabled={
            !beneficiaryAdd || !assetContractAdd || !tokenId || !isNftApproved
          }
        >
          Create Will <SendOutlined />
        </Button>
      </div>

      {/* Modal */}
      <Modal
        title="Pick an NFT"
        visible={isModalVisible}
        centered
        onOk={handleOk}
        onCancel={handleCancel}
        width="800px"
        style={{
          width: "400px",
          maxWidth: "800px",
        }}
      >
        <div
          loading={!NFTBalances?.result}
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            flex: 1,
            justifyContent: "space-evenly",
            overflow: "auto", // responsible for making the div scrollable
            height: "500px", // responsible for making the div scrollable
          }}
        >
          {NFTBalances?.result &&
            NFTBalances.result.map((nft, index) => {
              //Verify Metadata
              nft = verifyMetadata(nft);
              return (
                <Card
                  hoverable
                  style={{
                    width: 150,
                    border: "2px solid #e7eaf3",
                    flexBasis: "150px",
                    marginRight: "5px",
                    marginLeft: "5px",
                    marginBottom: "20px",
                  }}
                  cover={
                    <Image
                      preview={false}
                      src={nft?.image || "error"}
                      fallback="data:image/png;base64,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"
                      alt=""
                      style={{
                        // minWidth: "150px",
                        maxWidth: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  }
                  key={index}
                  onClick={async () => {
                    setAssetContractAdd(nft.token_address);
                    setTokenId(nft.token_id);
                    await checkNftApproval(nft.token_address);
                    handleCancel();
                  }}
                >
                  <Meta title={nft.name} description={nft.token_address} />
                </Card>
              );
            })}
        </div>
      </Modal>
    </div>
  );
}

export default CreateWillForm;
