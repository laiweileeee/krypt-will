//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './CloneFactory.sol';
import './Will.sol';
import "@openzeppelin/contracts/access/Ownable.sol";


contract WillFactory is Ownable, CloneFactory {
    Will[] public wills;
    address masterWillContract;
    mapping(address => address) willOwnerToWillAddress;

    event WillCreated(Will newWill);

    constructor(address _masterWillAddress){
        masterWillContract = _masterWillAddress;
    }

    // allows owner to change master will contract to clone from
    function setMasterWillAddress(address _masterWillAddress) public onlyOwner {
        masterWillContract = _masterWillAddress;
    }

    function createWill(address willOwner, address govAdd) onlyOwner external {
        Will will = Will(createClone(masterWillContract));
        will.init(willOwner, govAdd);
        wills.push(will);

        // store will owner => will address mapping
        willOwnerToWillAddress[willOwner] = address(will);

        emit WillCreated(will);
    }

    function getWills() external view returns(Will[] memory){
        return wills;
    }
}
