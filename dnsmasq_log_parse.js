var DNSMASQ_CONFIG_DIR = '/usr/local/etc/dnsmasq.d/'; //make sure the dnsmasq will load the config from this directory
var DNSMASQ_LOGFILE = '/var/log/dnsmasq.log';
var CMD_STOP_DNSMASQ = 'sudo launchctl stop homebrew.mxcl.dnsmasq';
var CMD_START_DNSMASQ = 'sudo launchctl start homebrew.mxcl.dnsmasq';
var CHINA_IPLIST_FILE = '/Users/AngusWang/Documents/Tn/dnsmasq_log_parse/conf.d/China.conf'

var inSubnet= require('insubnet');
var sleep = require('sleep');
var fs = require('fs');
var async = require('async');
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var ip_lists = fs.readFileSync(CHINA_IPLIST_FILE).toString().split("\n");
var configed_domains_114_114_114_114 = execSync("sudo cat "+DNSMASQ_CONFIG_DIR+"*.conf | grep 114.114.114.114 | awk -F / '{print $2}'").toString().split("\n");
var configed_domains_8_8_8_8 = execSync("sudo cat "+DNSMASQ_CONFIG_DIR+"*.conf | grep 8.8.8.8 | awk -F / '{print $2}'").toString().split("\n");
//console.log(configed_domains);
var new_config_filename = DNSMASQ_CONFIG_DIR+execSync("date +'%Y-%m-%d'").toString().split("\n")[0]+'.conf';
//var new_config_filename = execSync("date +'%Y-%m-%d'").toString().split("\n")[0]+'.conf';
console.log(new_config_filename);



function checkip(ipaddress){
    var array_length=ip_lists.length;
    for(var i=0;i<array_length;i++){
        if(ip_lists[i]!=''&&inSubnet.Auto(ipaddress,ip_lists[i])){
            break;
            
        }
    }
    if(i>=array_length){
        //        console.log('不在中国');
        return 0;
    }else{
        //        console.log('在中国');
        return 1;
    }
}
function checkdomain(domain){
    if(configed_domains_114_114_114_114.indexOf(domain) == -1 && configed_domains_8_8_8_8.indexOf(domain) == -1){
        exec("dig "+domain+"  | grep A |tail -n 1|awk '{print $NF}'",
             function (error, stdout, stderr) {
                 if (error !== null) {
                 console.log('exec error: ' + error);
                 }
                 var host_ip = stdout.split('\n')[0];
                 if(checkip(host_ip)){
                     var new_domains = 'server=/'+domain+'/114.114.114.114\n';
                 }else{
                     var new_domains = 'server=/'+domain+'/8.8.8.8\n';
                 }
                 console.log(new_domains);
                 fs.appendFile(new_config_filename, new_domains);

             })
    }

}
/*read log and backup log*/
//execSync("sudo cp -f "+DNSMASQ_LOGFILE+"  .");
execSync("sudo cat "+DNSMASQ_LOGFILE+"|grep forwarded|awk -F forwarded '{print $2}' | grep -v 114.114.114.114 |awk '{print $1}'|awk -F . '{print $(NF-1)\".\"$NF}'|sort|uniq | grep -v  \"^\\\.\"  > /tmp/host_ip.log");
//execSync("tar zcvf dnsmasq_`date +'%Y-%m-%d_%T'`.log.tgz dnsmasq.log; rm dnsmasq.log");

var log_domains = fs.readFileSync('/tmp/host_ip.log').toString().split("\n");
var list_length = log_domains.length-1;
log_domains.pop();//remove empty element;
var new_domains = new Array();
console.log('starting...'+list_length+' records after 3 seconds');
sleep.sleep(3);
//for(var i=0,j=0;i<list_length-1;i++){//list_length-1 to cut the last empty record
//    checkdomain(log_domains[i]);
//    console.log(i);
////    fs.appendFile(new_config_filename, 'bb');
//}
async.each(log_domains,checkdomain,checkip);
execSync(CMD_STOP_DNSMASQ);
execSync(CMD_START_DNSMASQ);
//console.log(new_domains);
