/* 
 *  list of plugin to think
 */

// think nothing currently
var plugins = {
    getBoard: {
        func: function getHiestBid(data, candyConfig){
            console.log(data.bitflyer.v1.getboard.ETH_BTC);
        }
    }
}

module.exports = [
    plugins.getBoard
];

