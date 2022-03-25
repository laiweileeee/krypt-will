import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Account from "components/Account/Account";
import Chains from "components/Chains";
import NFTBalance from "components/NFTBalance";
import { Layout, Tabs, Switch as AntdSwitch } from "antd";
import "antd/dist/antd.css";
import NativeBalance from "components/NativeBalance";
import "./style.css";
import Text from "antd/lib/typography/Text";
import MenuItems from "./components/MenuItems";
import CreateAssets from "./components/CreateAssets";
import ViewWill from "./components/ViewWill";
import Mint from "./components/Mint";
import ExecuteWill from "./components/ExecuteWill";
import CreateWill from "components/CreateWill";
const { Header, Footer } = Layout;

const styles = {
  content: {
    display: "flex",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#041836",
    marginTop: "130px",
    padding: "10px",
  },
  header: {
    position: "fixed",
    zIndex: 1,
    width: "100%",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
};
const App = ({ isServerInfo }) => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } =
    useMoralis();

  const [isGovAccount, setIsGovAccount] = useState(false);
  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading)
      enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Layout style={{ height: "100vh", overflow: "auto" }}>
      <Router>
        <Header style={styles.header}>
          <AntdSwitch
            style={{ marginLeft: "4rem" }}
            defaultChecked={false}
            onClick={() => {
              setIsGovAccount(!isGovAccount);
            }}
          />
          <MenuItems isGovAccount={isGovAccount} />
          <div style={styles.headerRight}>
            <Chains />
            <NativeBalance />
            <Account />
          </div>
        </Header>

        <div style={styles.content}>
          <Switch>
            {/*Used paths */}
            <Route path="/create">
              <CreateAssets />
            </Route>
            <Route path="/view">
              <ViewWill />
            </Route>
            <Route path="/mint">
              <Mint />
            </Route>
            <Route path="/execute">
              <ExecuteWill />
            </Route>
            <Route path="/create">
              <CreateWill />
            </Route>
            <Route path="/nftBalance">
              <NFTBalance />
            </Route>

            {/* Fallback paths */}
            <Route path="/">
              <Redirect to="/create" />
            </Route>
            <Route path="/ethereum-boilerplate">
              <Redirect to="/create" />
            </Route>
            <Route path="/nonauthenticated">
              <>Please login using the "Authenticate" button</>
            </Route>
          </Switch>
        </div>
      </Router>
      <Footer style={{ textAlign: "center" }}>
        <Text style={{ display: "block" }}>
          📖 Built with{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://moralis.io?utm_source=boilerplatehosted&utm_medium=todo&utm_campaign=ethereum-boilerplat"
          >
            Moralis
          </a>
        </Text>
      </Footer>
    </Layout>
  );
};

export default App;
