var DNSMASQ_CONFIG_DIR = '/usr/local/etc/dnsmasq.d/';
var DNSMASQ_LOGFILE = '/var/log/dnsmasq.log';
var CMD_STOP_DNSMASQ = 'sudo launchctl stop homebrew.mxcl.dnsmasq';
var CMD_START_DNSMASQ = 'sudo launchctl start homebrew.mxcl.dnsmasq';
var CHINA_IPLIST_FILE = '/Users/AngusWang/Documents/Tn/vpn/conf.d/China.conf'

var inSubnet= require('insubnet');
var sleep = require('sleep');
var fs = require('fs');
var execSync = require('child_process').execSync;
var ip_lists = fs.readFileSync(CHINA_IPLIST_FILE).toString().split("\n");
var configed_domains = execSync("sudo cat "+DNSMASQ_CONFIG_DIR+"*.conf | awk -F / '{print $2}'").toString().split("\n");
//console.log(configed_domains);
//var new_config_filename = DNSMASQ_CONFIG_DIR+execSync("date +'%Y-%m-%d'").toString().split("\n")[0]+'.conf';
var new_config_filename = execSync("date +'%Y-%m-%d'").toString().split("\n")[0]+'.conf';
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
/*read log and backup log*/
execSync("sudo cp -f "+DNSMASQ_LOGFILE+"  .");
execSync("cat dnsmasq.log  |grep reply|awk  -F 'reply' '{print $2}'|awk '{print $1\" \"$3}' > /tmp/host_ip.log");
//execSync("tar zcvf dnsmasq_`date +'%Y-%m-%d_%T'`.log.tgz dnsmasq.log; rm dnsmasq.log");

var log_result = fs.readFileSync('/tmp/host_ip.log').toString().split("\n");
var list_length=log_result.length;
var domain_tmp = ''
    last_domain = ''
    last_ip = ''
    domains = new Array();
console.log('starting...'+list_length+' records');
sleep.sleep(3);
for(var i=0,j=0;i<list_length-1;i++){//list_length-1 to cut the last empty record
    var host_ip = log_result[i].split(" ");
//    if(host_ip[0]=='ecpm.tanx.com'){
    console.log('this host:'+host_ip[0] );
        console.log('last_domain:'+last_domain);
        console.log('configed_domains.indexOf:'+configed_domains.indexOf(host_ip[0]));
        console.log('domains.indexOf:'+domains.indexOf(host_ip[0]));
        console.log('domain_tmp:'+domain_tmp);
        console.log(domains);
//    }
    if(domain_tmp != '' || last_domain != host_ip[0] && domains.indexOf(host_ip[0]) == -1 && configed_domains.indexOf(host_ip[0]) == -1){// if domain is not configed or last one is CNAME
        if(host_ip[1]=='<CNAME>'){
            if(last_ip != '<CNAME>'){
                domain_tmp = host_ip[0];
            }
//            continue;
        }else if(inSubnet.isIPv4(host_ip[1]) && last_ip != '<CNAME>'){//ip belongs to china & last recored is not CNAME
            if(checkip(host_ip[1])){
                domains[j++]=domain_tmp||host_ip[0];
            }
            domain_tmp='';
        }else{
            
        }
    }else{
        domain_tmp='';
        console.log('hehe'+configed_domains.indexOf(host_ip[0]))
    }
    
    last_domain = host_ip[0];
    last_ip = host_ip[1];
    console.log(i);
    
}
for(var i=0;i<domains.length;i++){
    fs.appendFile(new_config_filename, 'server=/'+domains[i]+'/114.114.114.114\n')
}
execSync(CMD_STOP_DNSMASQ);
execSync(CMD_START_DNSMASQ);
console.log(domains);