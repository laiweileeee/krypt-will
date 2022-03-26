import {
  CheckCircleTwoTone,
  DeleteTwoTone,
  FileSearchOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Spin,
  Space,
  Card,
  Image,
  message,
  Empty,
  Alert,
  Modal,
} from "antd";
import Text from "antd/lib/typography/Text";
import React, { useEffect, useMemo, useState } from "react";
import { useMoralis, useNFTBalances } from "react-moralis";
import { willContractABI } from "../../../contracts/willContractABI";
import { truncateEthAddress } from "../../../utils/TruffleEthAddress";
import { willFactoryContractABI } from "../../../contracts/willFactoryContractABI";
import { v4 as uuidv4 } from "uuid";
import Address from "../../Address/Address";
import { assetNftContractABI } from "../../../contracts/assetNftContracABI";
import { blue, geekblue, red } from "@ant-design/colors";
import _ from "lodash";
import { NavLink } from "react-router-dom";

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

const LoadingState = {
  INITIAL: "initial",
  FETCH_LOADING: "",
  SUBMIT_LOADING: "loading",
  FETCH_COMPLETE: "fetch_complete",
  SUBMIT_COMPLETE: "complete",
};

// TODO: Find will contract address from user
const willFactoryContract = "0x0D17895c11EF2bf60E7E9c70931E63F295d80BCD";

function ViewAssetsForm() {
  const { Moralis, isAuthenticated, account } = useMoralis();

  const { data: NFTBalances } = useNFTBalances();
  const [willContractAddress, setWillContractAddress] = useState();
  const [isExecuted, setIsExecuted] = useState();
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [deletedAssets, setDeletedAssets] = useState([]);
  const [addedAssets, setAddedAssets] = useState([]);
  const [addedAssetsApprovals, setAddedAssetsApprovals] = useState([]);
  const [connectedAddress, setConnectedAddress] = useState();

  const [loading, setLoading] = useState(LoadingState.INITIAL);
  const [isApprovalPending, setIsApprovalPending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [txHash, setTxHash] = useState(false);

  const [originalAssetsLength, setOriginalAssetsLength] = useState(0);
  const [assets, setAssets] = useState([]);

  /*  Modal States */
  const [isModalVisible, setIsModalVisible] = useState(false);

  /* Modal functions */
  const showModal = () => {
    setIsModalVisible(true);
  };

  // check form completion
  useEffect(() => {
    checkFormComplete();
  });

  // run upon existence of web3 instance
  useEffect(() => {
    const fetchData = async () => {
      setLoading(LoadingState.FETCH_LOADING);
      const willContract = await fetchWillContractAddress();
      if (willContract === "0x0000000000000000000000000000000000000000") {
        setLoading(LoadingState.FETCH_COMPLETE);
      } else {
        await fetchWill(willContract);
        setLoading(LoadingState.FETCH_COMPLETE);
      }
    };

    // only fetch when there is a web3 instance
    if (account) fetchData();
    // eslint-disable-next-line
  }, [isAuthenticated, account]);

  // populate connectedAddress state when user's wallet is connected
  useEffect(() => {
    setConnectedAddress(isAuthenticated && account);
  }, [account, isAuthenticated]);

  // update approvals[]
  useEffect(() => {
    const fetchApprovals = async () => {
      let newApprovals = [];
      try {
        const approvalPromises = addedAssets.map(async (asset) => {
          const result = await checkNftApproval(asset.assetNftContract);
          // console.log("result ", result);
          return result;
        });

        newApprovals = await Promise.all(approvalPromises);
        // console.log(newApprovals);
      } catch (error) {
        message.error(new Error(error).toString());
        console.error("Fetch error ", error);
      }
      // console.log("assets", assets);
      // console.log("newApprovals ", newApprovals);
      setAddedAssetsApprovals(newApprovals);
    };

    // only fetch when there is a web3 instance
    if (account) fetchApprovals();
    // eslint-disable-next-line
  }, [addedAssets, account]);

  const isZeroAddress = useMemo(
    () => willContractAddress === "0x0000000000000000000000000000000000000000",
    [willContractAddress],
  );

  const fetchWillContractAddress = async () => {
    const fetchWillContractTxMsg = await Moralis.executeFunction({
      contractAddress: willFactoryContract,
      functionName: "willOwnerToWillAddress",
      abi: willFactoryContractABI,
      params: {
        "": account,
      },
    });

    console.log("fetched will contract add ", fetchWillContractTxMsg);

    setWillContractAddress(fetchWillContractTxMsg);
    return fetchWillContractTxMsg;
  };

  const fetchWill = async (willContract) => {
    console.log("fetching assets....");

    // check if will is still active
    const fetchWillStateTxMsg = await Moralis.executeFunction({
      contractAddress: willContractAddress || willContract,
      functionName: "isActive",
      abi: willContractABI,
    });

    if (!fetchWillStateTxMsg) {
      setIsExecuted(true);
      return;
    }
    console.log("fetched isActive:  ", fetchWillStateTxMsg);

    const fetchAssetsTxMsg = await Moralis.executeFunction({
      contractAddress: willContractAddress || willContract,
      functionName: "getAssets",
      abi: willContractABI,
    });

    console.log("fetched assets ", fetchAssetsTxMsg);
    const fetchedAssets = fetchAssetsTxMsg.map((asset) => {
      return {
        assetId: asset.assetId,
        assetNftContract: asset.assetNftContract,
        tokenId: asset.tokenId.toNumber(),
        beneficiary: asset.beneficiary,
      };
    });

    console.log("parsed assets: ", fetchedAssets);

    setAssets(fetchedAssets);
    setOriginalAssetsLength(fetchedAssets.length);
    // setAssets(fetchedAssets);
  };

  const handleAddNewAssets = () => {
    const newAsset = {
      assetId: uuidv4(),
      assetNftContract: "",
      tokenId: undefined,
      beneficiary: "",
    };

    addedAssets.push(newAsset);
  };

  const handleDeleteNewAssets = (index) => {
    console.log(index);
    // delete selectedNFT
    let newSelectedAssets = [...selectedNFTs];
    let assetsClone = [...addedAssets];
    console.log("selected ", newSelectedAssets);
    console.log("to Delete ", addedAssets[index]);
    _.remove(
      newSelectedAssets,
      (asset) =>
        asset.token_address === assetsClone[index].assetNftContract &&
        asset.token_id === assetsClone[index].tokenId,
    );

    console.log("new ", newSelectedAssets);
    setSelectedNFTs(newSelectedAssets);

    let newAssets = [...addedAssets];
    newAssets.splice(index, 1);
    setAddedAssets(newAssets);

    setIsEditing(false);
  };

  const handleDelete = (index) => {
    console.log(index);
    // delete asset from assets array
    let newDeletedAssets = [...deletedAssets];
    let assetsClone = [...assets];
    console.log("deleted ", newDeletedAssets);
    console.log("to Delete ", assets[index]);
    newDeletedAssets.push(
      _.find(
        assetsClone,
        (asset) =>
          asset.token_address === assetsClone[index].assetNftContract &&
          asset.token_id === assetsClone[index].tokenId,
      ),
    );

    console.log("new [] ", newDeletedAssets);
    setDeletedAssets(newDeletedAssets);

    let newAssets = [...assets];
    newAssets.splice(index, 1);
    setAssets(newAssets);

    setIsEditing(false);
  };

  const handleSave = async () => {
    let assetClone = [...assets];
    const assetsPostDeletion = _.difference(assetClone, deletedAssets);
    const assetsPostAddition = _.concat(assetsPostDeletion, addedAssets);

    console.log("assetsDiff ", assetsPostAddition);
    // map assets into a tuple format
    // const assetsToSubmit = [];
    const assetsToSubmit = assetsPostAddition.map((asset) =>
      Object.values(asset),
    );
    console.log("tuple array: ", assetsToSubmit);

    try {
      // execute function using moralisAPI
      const editAssetsTx = await Moralis.executeFunction({
        contractAddress: willContractAddress,
        functionName: "editAssets",
        abi: willContractABI,
        params: {
          newWillAssets: assetsToSubmit,
        },
      });

      setLoading(LoadingState.SUBMIT_LOADING);
      setTxHash(editAssetsTx.hash);
      console.log("tx hash ", editAssetsTx.hash);
      await editAssetsTx.wait();

      // TODO: check for WillEdited event instead
      const editAssetsTxMsg = await Moralis.executeFunction({
        contractAddress: willContractAddress,
        functionName: "getAssets",
        abi: willContractABI,
      });

      console.log(editAssetsTxMsg);

      message.success(
        `Successfully edited assets to will: ${truncateEthAddress(
          willContractAddress,
        )}!`,
      );

      setLoading(LoadingState.SUBMIT_COMPLETE);
    } catch (error) {
      console.log("Error editing will: ", error);
      const errorMsg = new Error(error).toString();
      message.error(errorMsg);
      setLoading(LoadingState.FETCH_COMPLETE);
    }
  };

  const handleDestroy = async (willContract) => {
    try {
      // execute function using moralisAPI
      const destroyWillTx = await Moralis.executeFunction({
        contractAddress: willContractAddress,
        functionName: "destroyWill",
        abi: willContractABI,
      });

      setLoading(LoadingState.SUBMIT_LOADING);
      setTxHash(destroyWillTx.hash);
      console.log("tx hash ", destroyWillTx.hash);
      await destroyWillTx.wait();

      // TODO: check for WillEdited event instead
      const destroyWillTxMsg = await Moralis.executeFunction({
        contractAddress: willContractAddress || willContract,
        functionName: "isActive",
        abi: willContractABI,
      });

      console.log(destroyWillTxMsg);

      if (!destroyWillTxMsg) {
        message.success(
          `Successfully edited assets to will: ${truncateEthAddress(
            willContractAddress,
          )}!`,
        );
      }

      setLoading(LoadingState.SUBMIT_COMPLETE);
    } catch (error) {
      console.log("Error destroying will: ", error);
      const errorMsg = new Error(error).toString();
      message.error(errorMsg);
      setLoading(LoadingState.FETCH_COMPLETE);
    }
  };

  const checkFormComplete = () => {
    let checkAssets = [...addedAssets];
    for (let i = 0; i < checkAssets.length; i++) {
      const asset = checkAssets[i];
      if (!asset.assetNftContract || !asset.tokenId || !asset.beneficiary) {
        setIsFormComplete(false);
        return;
      }
    }
    setIsFormComplete(true);
  };

  const checkNftApproval = async (nftContractAddress) => {
    try {
      // Read from contract - check if intended state is updated
      const setApprovalForAllTxMsg = await Moralis.executeFunction({
        contractAddress: nftContractAddress,
        functionName: "isApprovedForAll",
        abi: assetNftContractABI,
        params: { owner: connectedAddress, operator: willContractAddress },
      });

      return setApprovalForAllTxMsg;

      console.log("setApprovalForAllTxMsg ", setApprovalForAllTxMsg);
    } catch (error) {
      console.log("Error checking NFT approval: ", error);
    }
  };

  const approveAllNfts = async (assetNftContract) => {
    try {
      const setApprovalForAllTx = await Moralis.executeFunction({
        contractAddress: assetNftContract,
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
      await checkNftApproval(assetNftContract);
      message.success(`Approval Success!!`); // TODO: sometimes doesn't work
      setIsApprovalPending(false);
    } catch (error) {
      console.log("Error approving NFTs: ", error);
      setIsApprovalPending(false);
    }
  };

  return (
    <div style={styles.card}>
      {isExecuted ? (
        <div>
          <Alert
            message="Will Executed."
            description="Will Owner has passed away... 😔"
            type="info"
            closable
          />
        </div>
      ) : (
        <div>
          {!isZeroAddress && (
            <div>
              {loading === LoadingState.SUBMIT_LOADING ||
              loading === LoadingState.SUBMIT_COMPLETE ? (
                // show form submit loader or complete
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "25px",
                  }}
                >
                  {loading === LoadingState.SUBMIT_LOADING ? (
                    <div>
                      <div style={{ textAlign: "center" }}>
                        Editing Assets...
                      </div>
                      <div
                        style={{ textAlign: "center", fontWeight: "normal" }}
                      >
                        View transaction on{" "}
                        <a
                          href={`https://rinkeby.etherscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          etherscan
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ textAlign: "center" }}>Assets Edited!</div>
                      <div
                        style={{ textAlign: "center", fontWeight: "normal" }}
                      >
                        View assets{" "}
                        <NavLink
                          to={"/view"}
                          onClick={() => {
                            window.location.reload(true);
                            fetchWill();
                          }}
                        >
                          here
                        </NavLink>{" "}
                        or on{" "}
                        <a
                          href={`https://rinkeby.etherscan.io/address/${willContractAddress}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          etherscan
                        </a>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: "50px", marginBottom: "50px" }}>
                    {loading === LoadingState.SUBMIT_LOADING ? (
                      <Spin size="large" />
                    ) : (
                      <CheckCircleTwoTone
                        style={{ fontSize: "2.5rem" }}
                        twoToneColor={blue[2]}
                      />
                    )}
                  </div>
                </div>
              ) : loading === LoadingState.FETCH_LOADING ? (
                // show fetch loader
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Spin size="large" />
                </div>
              ) : (
                //  show Assets
                <div>
                  <div style={styles.header}>
                    <h3>View Assets</h3>
                    <Space direction="vertical">
                      {willContractAddress && (
                        <Space>
                          {" "}
                          Will contract:
                          <Address
                            size="6"
                            copyable
                            address={willContractAddress}
                          />
                        </Space>
                      )}
                    </Space>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      marginTop: "2rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flex: "1",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        flexBasis: "auto",
                        // backgroundColor: "red",
                      }}
                    >
                      {assets.length !== 0 ? (
                        assets.map((asset, index) => (
                          <Card
                            hoverable
                            style={{
                              width: "11rem",
                              maxHeight: "340px",
                              border: "2px solid #e7eaf3",
                              marginRight: "10px",
                              marginLeft: "12px",
                              marginBottom: "20px",
                              // backgroundColor: "blue",
                            }}
                            key={index}
                          >
                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Space direction="vertical">
                                  <Text strong>Asset</Text>
                                  <Address
                                    size={4}
                                    copyable
                                    address={asset.assetNftContract}
                                  />
                                </Space>
                                <DeleteTwoTone
                                  twoToneColor={red[3]}
                                  style={{ fontSize: "large" }}
                                  onClick={() => {
                                    handleDelete(index);
                                  }}
                                />
                              </div>
                              <Text strong>Token ID</Text>
                              <Text type="secondary">{asset.tokenId}</Text>
                              <Text strong>Beneficiary</Text>
                              <Address
                                size={3}
                                copyable
                                address={asset.beneficiary}
                              />
                            </Space>
                          </Card>
                        ))
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "auto",
                          }}
                        >
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span>No Assets to display</span>}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add assets section */}
                  {addedAssets.map((asset, index) => (
                    <Card style={{ marginTop: "1rem" }} key={index}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text strong>Asset #{index + 1}</Text>
                        <DeleteTwoTone
                          twoToneColor={red[3]}
                          style={{ fontSize: "large" }}
                          onClick={() => {
                            handleDeleteNewAssets(index);
                          }}
                        />
                      </div>

                      <div style={styles.select}>
                        <div style={styles.textWrapper}>
                          <Text strong>Recipient:</Text>
                        </div>
                        <Input
                          size="large"
                          prefix={<FileSearchOutlined />}
                          autoFocus
                          value={asset.beneficiary}
                          onChange={(e) => {
                            let newAssets = [...addedAssets];
                            newAssets[index].beneficiary = e.target.value;
                            setAddedAssets(newAssets);
                          }}
                          placeholder="Enter beneficiary address"
                          allowClear={true}
                        />
                      </div>

                      {console.log("addedAssets []", addedAssets)}

                      {/* display asset token info, if exists */}
                      {addedAssets[index].assetNftContract ? (
                        <div>
                          <div style={styles.select}>
                            <div style={styles.textWrapper}>
                              <Text strong>Asset: </Text>
                            </div>

                            <Input
                              size="large"
                              prefix={<FileSearchOutlined />}
                              autoFocus
                              value={truncateEthAddress(
                                addedAssets[index].assetNftContract,
                              )}
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
                              value={addedAssets[index].tokenId}
                              disabled
                            />
                          </div>

                          {/* Approve all NFTs if they aren't approved yet   */}
                          {/*TODO: this approval check is sus, need a better way to check it*/}
                          {!addedAssetsApprovals[index] && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "20px",
                                border: "0.5px",
                                borderStyle: "solid",
                                borderColor: "lightgray",
                                borderRadius: "3px",
                                marginTop: "20px",
                              }}
                            >
                              <Text
                                type="secondary"
                                style={{
                                  fontWeight: "normal",
                                  textAlign: "left",
                                }}
                              >
                                NFTs need to be approved
                              </Text>
                              <Button
                                type="primary"
                                size="medium"
                                loading={isApprovalPending}
                                style={{
                                  marginLeft: "1rem",
                                  textAlign: "center",
                                }}
                                onClick={async () => {
                                  await approveAllNfts(
                                    assets[index].assetNftContract,
                                  );
                                  let newApprovals = [...addedAssetsApprovals];
                                  newApprovals[index] = true;
                                  setAddedAssetsApprovals(newApprovals);
                                }}
                              >
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Button
                            type="secondary"
                            size="large"
                            style={{
                              width: "auto",
                              marginTop: "25px",
                              color: geekblue[3],
                              borderColor: geekblue[4],
                              borderRadius: "0.3rem",
                            }}
                            onClick={showModal} // disabled={}
                          >
                            Select Asset NFT
                          </Button>
                        </div>
                      )}

                      {isModalVisible && (
                        <AssetModal
                          setIsModalVisible={setIsModalVisible}
                          NFTBalances={NFTBalances}
                          assetCardIndex={index}
                          assets={addedAssets}
                          setAssets={setAddedAssets}
                          selectedNFTs={selectedNFTs}
                          setSelectedNFTs={setSelectedNFTs}
                          checkNftApproval={checkNftApproval}
                          setIsEditing={setIsEditing}
                        />
                      )}
                    </Card>
                  ))}

                  <Button
                    type="text"
                    size="large"
                    style={{
                      width: "100%",
                      marginTop: "25px",
                      color:
                        assets.length === 0 ||
                        isEditing ||
                        addedAssets.length >= 10 ||
                        selectedNFTs.length === NFTBalances?.result.length
                          ? ""
                          : blue.primary,
                    }}
                    disabled={
                      assets.length === 0 ||
                      isEditing ||
                      addedAssets.length >= 10 ||
                      selectedNFTs.length === NFTBalances?.result.length
                    }
                    onClick={() => {
                      handleAddNewAssets();
                      setIsEditing(true);
                      console.log(addedAssets);
                      // console.log("approvals", approvals);
                      console.log("NFT balance array ", NFTBalances?.result);
                    }}
                  >
                    + More Assets
                  </Button>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "25px",
                    }}
                  >
                    <Button
                      type="secondary"
                      size="large"
                      style={{
                        width: "auto",
                        color: red[3],
                        borderColor: red[3],
                        borderRadius: "0.3rem",
                      }}
                      onClick={handleDestroy}
                    >
                      Destroy
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      style={{
                        width: "auto",
                        marginLeft: "15px",
                        color:
                          assets.length === originalAssetsLength &&
                          !isFormComplete
                            ? ""
                            : "white",
                        borderRadius: "0.3rem",
                      }}
                      onClick={handleSave}
                      disabled={
                        assets.length === originalAssetsLength && // no deletions
                        !isFormComplete // no additions
                      }
                    >
                      Save Assets
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isZeroAddress && (
            <div>
              <div style={styles.header}>
                <h3>View Will</h3>
                <Space direction="vertical">
                  {willContractAddress && (
                    <Space>
                      {" "}
                      Will contract:
                      <Address
                        size="6"
                        copyable
                        address={willContractAddress}
                      />
                    </Space>
                  )}
                </Space>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "25px",
                }}
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      Will not created for this account <br /> Use Gov address
                      to create one
                    </span>
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const AssetModal = ({
  setIsModalVisible,
  NFTBalances,
  assetCardIndex,
  assets,
  setAssets,
  selectedNFTs,
  setSelectedNFTs,
  checkNftApproval,
  setIsEditing,
}) => {
  // copy the actual NFT balance
  const [NFTs, setNFTs] = useState(
    _.difference([...NFTBalances?.result], selectedNFTs),
  );

  return (
    <Modal
      title="Pick an NFT"
      visible={true}
      onOk={() => setIsModalVisible(false)}
      onCancel={() => setIsModalVisible(false)}
      centered
      width="800px"
      style={{
        width: "400px",
        maxWidth: "800px",
      }}
    >
      {!NFTs?.length ? (
        // show assets
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                You don't own any NFTs. Mint
                <NavLink to="/mint"> Here </NavLink>
              </span>
            }
          />
        </div>
      ) : (
        <div
          loading={!NFTs}
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            flexBasis: "auto",

            overflow: "auto", // responsible for making the div scrollable
            height: "500px", // responsible for making the div scrollable
          }}
        >
          {NFTs &&
            NFTs.map((nft, index) => {
              //Verify Metadata
              // nft = verifyMetadata(nft);
              return (
                <Card
                  hoverable
                  style={{
                    width: "200px",
                    maxHeight: "340px",
                    border: "2px solid #e7eaf3",
                    marginRight: "25px",
                    marginLeft: "25px",
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
                    // update parent asset state
                    let newAssets = [...assets];
                    newAssets[assetCardIndex].assetNftContract =
                      nft.token_address;
                    newAssets[assetCardIndex].tokenId = nft.token_id;
                    await checkNftApproval(nft.token_address);
                    setAssets(newAssets);

                    // update parent selectedNfts state
                    let newSelectedNFTs = [...selectedNFTs];
                    newSelectedNFTs.push(NFTs[index]);
                    setSelectedNFTs(newSelectedNFTs);
                    // update modal nftData state
                    let newNFTs = [...NFTs];
                    newNFTs.splice(index, 1);
                    setNFTs(newNFTs);
                    setIsEditing(false);
                    // close modal
                    setIsModalVisible(false);
                  }}
                >
                  <Space direction="vertical">
                    <Text strong>{nft.name}</Text>
                    <Text>{truncateEthAddress(nft.token_address)}</Text>
                    <Text>Token ID: {nft.token_id}</Text>
                  </Space>
                </Card>
              );
            })}
        </div>
      )}
    </Modal>
  );
};

export default ViewAssetsForm;
