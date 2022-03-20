import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";

function MenuItems({ isGovAccount }) {
  const { pathname } = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      style={{
        display: "flex",
        fontSize: "17px",
        fontWeight: "500",
        width: "100%",
        justifyContent: "center",
      }}
      selectedKeys={pathname}
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item key="/create" disabled={isGovAccount}>
        <NavLink to="/create">Create</NavLink>
      </Menu.Item>
      <Menu.Item key="/view" disabled={isGovAccount}>
        <NavLink to="/view">View</NavLink>
      </Menu.Item>
      <Menu.Item key="/mint" disabled={!isGovAccount}>
        <NavLink to="/mint">Mint</NavLink>
      </Menu.Item>
      <Menu.Item key="/execute" disabled={!isGovAccount}>
        <NavLink to="/execute">Execute</NavLink>
      </Menu.Item>
      <Menu.Item key="/nftBalance">
        <NavLink to="/nftBalance">Assets</NavLink>
      </Menu.Item>

      {/*  Unused nav links */}
      {/*<Menu.Item key="/quickstart">*/}
      {/*  <NavLink to="/quickstart">🚀 Quick Start</NavLink>*/}
      {/*</Menu.Item>*/}
      {/*<Menu.Item key="/wallet">*/}
      {/*  <NavLink to="/wallet"> Wallet</NavLink>*/}
      {/*</Menu.Item>*/}
      {/*<Menu.Item key="/1inch">*/}
      {/*  <NavLink to="/1inch">🏦 Dex</NavLink>*/}
      {/*</Menu.Item>*/}
      {/*<Menu.Item key="onramp">*/}
      {/*  <NavLink to="/onramp">💵 Fiat</NavLink>*/}
      {/*</Menu.Item>*/}
      {/*<Menu.Item key="/erc20balance">*/}
      {/*  <NavLink to="/erc20balance">💰 Balances</NavLink>*/}
      {/*</Menu.Item>*/}
      {/*<Menu.Item key="/erc20transfers">*/}
      {/*  <NavLink to="/erc20transfers">💸 Transfers</NavLink>*/}
      {/*</Menu.Item>*/}

      {/*<Menu.Item key="/contract">*/}
      {/*  <NavLink to="/contract">📄 Contract</NavLink>*/}
      {/*</Menu.Item>*/}
    </Menu>
  );
}

export default MenuItems;
