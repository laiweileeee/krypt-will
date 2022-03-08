# `KryptWill`

Immutable & Trusted Digital Will Platform

This project is built using [react-moralis](https://github.com/MoralisWeb3/react-moralis) and [Moralis](https://moralis.io?utm_source=github&utm_medium=readme&utm_campaign=ethereum-boilerplate). 

Please check the [official documentation of Moralis](https://docs.moralis.io/#user) for all the functionalities of Moralis.

### Contracts (Stored in './Truffle/contracts'
- Will.sol - handles will contract functionalities
- WillFactory.sol - handles creating clones of Will contracts
- CloneFactory.sol - base code used for WillFactory.sol
- AssetNFT.sol - handles asset NFT functionality


### Front-End Pages
- [ ] Create Will Page - For will owners to create will
- [ ] View Will Page - For will owners to view their will
- [x] Mint Page - For Gov to mint NFTs to will owners
- [ ] Simulate Death Path - For Gov to simulate will owners' death and execute will

# How to start

Clone `KryptWill`:

```sh
git clone https://github.com/laiweileeee/kryptwill.git
```

Install all dependencies:

```sh
cd kryptwill
yarn install
```

Rename `.env.example` to `.env` in the main folder and provide your `appId` and `serverUrl` from Moralis ([How to start Moralis Server](https://docs.moralis.io/moralis-server/getting-started/create-a-moralis-server))
Example:

```jsx
REACT_APP_MORALIS_APPLICATION_ID = xxxxxxxxxxxx
REACT_APP_MORALIS_SERVER_URL = https://xxxxxx.grandmoralis.com:2053/server
```

Run your App:

```sh
yarn start
```

