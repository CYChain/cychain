var CYChainToken = artifacts.require("CYChainToken");

module.exports = function(deployer) {
    deployer.then(function() {
        return deployer.deploy(CYChainToken).then(function() {
            console.log('Finished deploying CYChainToken');
        });
    });
};