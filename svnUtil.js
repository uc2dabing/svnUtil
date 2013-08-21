
// Module dependencies
var exec = require('child_process').exec;
var parseString = require('xml2js').parseString;
var util = require('util');

function SvnUtil(options){

    // global config
    var options = options || {};

}

// get log list
SvnUtil.prototype.log = function(options, callback){

    var options = options || {};

    callback = (typeof callback === 'function') ? callback : function(){};

    // default current working directory
    options.path = (options.path !== undefined) ? options.path : '';

    // default print newest ten logs
    options.limit = (options.limit !== undefined) ? options.limit : '10';

    var log = null;
    var cmd = 'svn log -l ' + options.limit + ' --xml -v ' + options.path;
    var cp = exec(cmd, {}, function(error, stdout, stderr){

        // error[Error] typeof object
        if(null !== error){
            console.dir(error);
        }

        // stderr[buffer] and stdout[buffer] typeof string 
        if('' !== stderr){
            console.log(stderr);
        }

        parseString(stdout, function(error, result){

            if(null !== error){
                console.dir(error);
            }

           log = parseLog(JSON.parse(JSON.stringify(result)));

        });

    });

    cp.on('close', function(){
        callback(null, log);
    });

    cp.on('error', function(error){
        callback(error, null);
    });
};

// parse log[json] to logArray[array]
function parseLog(jsonLog){

    var result = [];
    var logs = jsonLog.log.logentry;

    // console.log(util.inspect(logs, {depth : null}));

    for(var i = 0, length = logs.length; i < length; i++){

        var tempObj = {};
        tempObj.revision = logs[i].$.revision;
        tempObj.author = logs[i].author[0];
        tempObj.date = logs[i].date[0];
        tempObj.msg = logs[i].msg[0];
        
        tempObj.paths = parsePath(logs[i].paths[0].path);

        result.push(tempObj);

    }

    // parese file or dir modify log path
    function parsePath(paths){
        var pathResult = [];
        for(var i = 0, length = paths.length; i < length; i++){
            var tempObj = {};
            tempObj.kind = paths[i].$.kind;
            tempObj.action = paths[i].$.action;
            tempObj.path = paths[i]._;
            pathResult.push(tempObj);
        }
        return pathResult;
    }

    return result;
}

SvnUtil.prototype.diff = function(options, callback){

    var options = options || {};
    options.revisionNew = (undefined !== options.revisionNew) ? options.revisionNew : '';
    options.revisionOld = (undefined !== options.revisionOld) ? options.revisionOld : '';
    options.path = (undefined !== options.path) ? options.path : '';
    callback = ('function' === typeof callback) ? callback : function(){};

    var cmd = 'svn diff -r ' + options.revisionOld + ':' + options.revisionNew + ' ' + options.path;
    var cp = exec(cmd, {}, function(error, stdout, stderr){

        if(null !== error){
            console.dir(error);
        }

        callback(null, stdout);        

    });
};

SvnUtil.prototype.info = function(options, callback){

    var options = options || {};
    options.path = (undefined !== options.path) ? options.path : '';

    var cmd = 'svn info --xml ' + options.path;
    var info = {};
    var cp = exec(cmd, {}, function(error, stdout, stderr){

        if(null !== error){
            console.dir(error);
        }

        parseString(stdout, function(error, result){

            var jsonObj = JSON.parse(JSON.stringify(result));
            jsonObj= jsonObj.info.entry[0];

            info.url = jsonObj.url;
            info.lastCommit = {
                revision : jsonObj.commit[0].$.revision,
                author : jsonObj.commit[0].author,
                date : jsonObj.commit[0].date
            };
            info.rootRepository = jsonObj.repository[0].root;

        });

    });

    cp.on('close', function(){
        callback(null, info);
    });
};

SvnUtil.prototype.update = function(options, callback){

    var options = options || {};
    options.path = (undefined !== options.path) ? options.path : '';

    var cmd = 'svn up ' + options.path;
    var msg = '';
    var cp = exec(cmd, {}, function(error, stdout, stderr){

        if(null !== error){
            console.dir(error);
        }
        msg = stdout;
    });

    cp.on('close', function(){
        callback(null, msg);
    });
};

SvnUtil.prototype.status = function(options, callback){

    var options = options || {};
    options.path = (undefined !== options.path) ? options.path : '';

    var cmd = 'svn status --xml ' + options.path;
    var statusMsg = [];
    var cp = exec(cmd, {}, function(error, stdout, stderr){

        if(null !== error){
            console.dir(error);
        }
        parseString(stdout, function(error, result){
            result = JSON.parse(JSON.stringify(result));
            // console.log(util.inspect(result, {depth : null}));
            statusMsg = parseStatusMsg(result.status.target[0].entry);
        });

    });

    cp.on('close', function(){
        callback(null, statusMsg);
    });

};

function parseStatusMsg(statusMsg){

    var result = [];
    for(var i = 0, length = statusMsg.length; i < length; i++){

        var obj = {};
        var lastCommitStatus = statusMsg[i]['wc-status'][0].commit[0];
        obj.path = statusMsg[i].$.path;
        obj.lastCommit = {
            revision : lastCommitStatus.$.revision,
            author : lastCommitStatus.author[0],
            date : lastCommitStatus.date[0]
        };
        obj.currentStatus = {
            item : statusMsg[i]['wc-status'][0].$.item,
            revision : statusMsg[i]['wc-status'][0].$.item
        };
        result.push(obj);
    }

    return result;
}

SvnUtil.prototype.export = function(options, callback){

    var options = options || {};
    options.revision = (undefined !== options.revision) ? options.revision : '';
    options.url = (undefined !== options.url) ? options.url : '';
    options.target = (undefined !== options.target) ? options.target : '';

    var cmd = '';
    if('' !== options.revision){
        cmd = 'svn export -r ' + options.revision + ' ';
    }else{
        cmd = 'svn export ';
    }
    cmd += options.url + ' ' + options.target;

    console.log(cmd);
    var cp = exec(cmd, {maxBuffer : 1024*1024}, function(error, stdout, stderr){
        if(null !== error){
            console.dir(error);
        }
    });

    cp.on('close', function(){
        callback(null, 'done');
    });
};

SvnUtil.prototype.list = function(options, callback){

    var options = options || {};
    options.url = (undefined !== options.url) ? options.url : '';

    var cmd = 'svn list --xml --incremental ' + options.url;
    var listInfo = [];
    var cp = exec(cmd, null, function(error, stdout, stderr){
        
        if(null !== error){
            // console.dir(error);
            callback(error, null);
        }else{
            // var result = parseList(stdout);
            parseString(stdout, function(error, result){
                listInfo = parseList(result);
            });
        }

    });

    cp.on('close', function(){
        callback(null, listInfo);
    })

    function parseList(listXmlInfo){

        var jsonObj = JSON.parse(JSON.stringify(listXmlInfo));
        // console.dir(util.inspect(jsonObj, {depth : null}));
        // console.dir(jsonObj.list.entry);
        var entry = jsonObj.list.entry;
        var length = entry.length;
        var result = [];

        for(var i = 0; i < length; i++){
            var tempObj = {};
            tempObj.name = entry[i].name[0];
            tempObj.commit = entry[i].commit[0];
            result.push(tempObj);
        }   

        return result;
    }

};

module.exports = SvnUtil;