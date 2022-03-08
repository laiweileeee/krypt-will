import { useERC20Balance } from "hooks/useERC20Balance";
import { useMoralis, useNativeBalance } from "react-moralis";
import { Image, Select } from "antd";
import { truncateEthAddress } from "../../../utils/TruffleEthAddress";

export default function AssetNFTSelector({ value, options, setAsset, style }) {
  const optionsList = Object.keys(options);

  const { assets } = useERC20Balance();
  const { data: nativeBalance, nativeToken } = useNativeBalance();
  const { Moralis } = useMoralis();

  // const fullBalance = useMemo(() => {
  //   if (!assets || !nativeBalance) return null;
  //   return [
  //     ...assets,
  //     {
  //       balance: nativeBalance.balance,
  //       decimals: nativeToken.decimals,
  //       name: nativeToken.name,
  //       symbol: nativeToken.symbol,
  //       token_address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  //     },
  //   ];
  // }, [assets, nativeBalance, nativeToken]);

  function handleChange(value) {
    const assetName = optionsList.find((assetName) => assetName === value);
    setAsset(assetName);
  }

  return (
    <Select value={value} onChange={handleChange} size="large" style={style}>
      {optionsList &&
        optionsList.map((optionName) => {
          // console.log(optionName);
          return (
            <Select.Option value={optionName} key={optionName}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  gap: "8px",
                }}
              >
                {/*<Image*/}
                {/*  src={*/}
                {/*    item.logo ||*/}
                {/*    "https://etherscan.io/images/main/empty-token.png"*/}
                {/*  }*/}
                {/*  alt="nologo"*/}
                {/*  width="24px"*/}
                {/*  height="24px"*/}
                {/*  preview={false}*/}
                {/*  style={{ borderRadius: "15px" }}*/}
                {/*/>*/}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "90%",
                  }}
                >
                  <p>{optionName}</p>
                  <p style={{ alignSelf: "right" }}>
                    {truncateEthAddress(options[optionName])}
                  </p>
                </div>
              </div>
            </Select.Option>
          );
        })}
    </Select>
  );
}
