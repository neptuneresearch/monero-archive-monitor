var moment = require('moment');

var MockOutput = {
    create: function(n_alt_chains)
    {
        // Create mock output
        var NRT = moment().valueOf();
        var MRT = Math.ceil(NRT/1000) - 7;

        var is_alt_block = 0;

        var block =	{"major_version": 1, "minor_version": 0, "timestamp": MRT, "prev_id": "dc13872f56acdc742a73508ff5ca9bb53250be7ed67fc3f25d8ad00c291099e7", "nonce": 1073742811, "miner_tx": {"version": 1, "unlock_time": 83696, "vin": [ {"gen": {"height": 83636}}], "vout": [ {"amount": 4001075093, "target": {"key": "04e0e92193a84b4ea5ffd49fa6b4696263e013aa28c42ef5d5f0a21329ec065d"}}, {"amount": 80000000000, "target": {"key": "19df558f9df5e2bd3c6921c9f5bb470c230a11467fedd74192e5bcaa37ea5cc3"}}, {"amount": 200000000000, "target": {"key": "1bc686513c1f86cd67ce48c25d3b83767da6949de354d3f84b6e6c6cbac71976"}}, {"amount": 6000000000000, "target": {"key": "3067b47349622701d410711ca8a87a473995c322df0b80c2b249bd6598c7b64d"}}, {"amount": 10000000000000, "target": {"key": "6a803d29300975504e7eee2fdb2a0e92995de925e207659dac0ccd90802b25a8"}}], "extra": [ 1, 225, 235, 208, 96, 218, 92, 35, 141, 25, 226, 55, 205, 31, 185, 117, 86, 153, 56, 17, 188, 73, 168, 16, 102, 95, 180, 84, 138, 233, 137, 141, 130, 2, 8, 0, 0, 0, 2, 126, 21, 54, 222], "signatures": [ ]}, "tx_hashes": [ "5af850ea6bdc70a16710ed1396e28991a2fdacb084d7e3fdb63262b793e990e6"]};

        if(n_alt_chains === null) n_alt_chains = Math.floor(Math.random()*9);

        var alt_chains_info = [];

        //  Add chains
        for(var i = 0; i < n_alt_chains; i++)
        {
            alt_chains_info.push(
                {
                    "length": Math.floor(Math.random()*1000),
                    "height": Math.floor(Math.random()*1000),
                    "deep": Math.floor(Math.random()*1000),
                    "diff": Math.floor(Math.random()*1000),
                    "hash": i.toString().repeat(64)
                }
            )
        }

        // Archive line, tab delimited
        var mock_output_string = NRT + "\t" 
            + is_alt_block + "\t" 
            + JSON.stringify(block) + "\t" 
            + n_alt_chains + "\t" 
            + JSON.stringify(alt_chains_info) 
            + "\n";

        return mock_output_string;
    }
}

module.exports = MockOutput;