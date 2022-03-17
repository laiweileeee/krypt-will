import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";

function MenuItems() {
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
      <Menu.Item key="/nftBalance">
        <NavLink to="/nftBalance">Assets</NavLink>
      </Menu.Item>
      <Menu.Item key="/create">
        <NavLink to="/create">Create</NavLink>
      </Menu.Item>
      <Menu.Item key="/view">
        <NavLink to="/view">View</NavLink>
      </Menu.Item>
      <Menu.Item key="/mint">
        <NavLink to="/mint">Mint (Gov)</NavLink>
      </Menu.Item>
      <Menu.Item key="/execute">
        <NavLink to="/execute">Execute (Gov) </NavLink>
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
