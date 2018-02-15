var
AccessManager = artifacts.require("AccessManager"),
DepositContractsManager = artifacts.require("DepositContractsManager"),
CYChain = artifacts.require("CYChain");

module.exports = function(deployer) {
var P, AM;

deployer.then(function() {
    return AccessManager.deployed().then(function(instance) {
        AM = instance;
        return deployer.deploy(DepositContractsManager, AM.address);
    }).then(function() {
        return CYChain.deployed();
    }).then(function(instance) {
        P = instance;
        return DepositContractsManager.deployed();
    }).then(function(DCM) {
        return AM.changeDCM(DCM.address);
        //return P.setDCM(DCM.address);
    }).then(function() {
        console.log('Finished deploying DCM');
    });
});
};