#!/bin/bash
BASEDIR=$(dirname $0)
gateway=`netstat -nr | grep en0|grep -m1 default  |awk '{print $2}'`
ip_lists=`cat $BASEDIR/conf.d/*.conf`

for ip_net in $ip_lists 
do
 route add -net $ip_net $gateway >  /dev/null & 
done &
