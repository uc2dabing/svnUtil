var util = require('util');
var SvnUtil = require('./svnUtil');
SvnUtil = new SvnUtil();


var optionsLog = {};
optionsLog.path = '/home1/zhangbing/html/netdisk/branches/CloudTranscoding';
optionsLog.limit = 10;

// SvnUtil.log(optionsLog, function(error, result){
//     console.log(util.inspect(result, {depth : null}));
// });

var optionsDiff = {};
optionsDiff.path = '/home1/zhangbing/html/netdisk/branches/CloudTranscoding';
optionsDiff.revisionNew = '12688';
optionsDiff.revisionOld = '12000';

// SvnUtil.diff(optionsDiff, function(error, result){
//     console.log(result);
// });

var optionsInfo = {};
optionsInfo.path = '/home1/zhangbing/html/netdisk/branches/CloudTranscoding';
// SvnUtil.info(optionsInfo, function(error, result){
//     console.dir(result);
// });

var optionsUpdate = {};
optionsUpdate.path = '/home1/zhangbing/html/netdisk/branches/CloudTranscoding';
// SvnUtil.update(optionsUpdate, function(error, result){
//     console.log(result);
// });

// SvnUtil.status(optionsUpdate, function(error, result){
//     console.log(result);
// });

var optionsExport = {};
optionsExport.url = '/home1/zhangbing/html/netdisk/branches/CloudTranscoding';
optionsExport.target = '';
SvnUtil.export(optionsExport, function(error, result){
    if('done' === result){
        console.log('export done');
    }
});