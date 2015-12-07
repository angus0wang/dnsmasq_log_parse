#!/bin/bash
domain="$1"
dnsip="$2"
if [ -e $domain ];then
echo -e "need a specific domain name;\n $0 domain [dnsip]"
exit 1
fi
if [ -e $dnsip ];then
dnsip="114.114.114.114"
fi
echo "server=/$domain/$dnsip" >> /usr/local/etc/dnsmasq.d/added.conf
sudo launchctl stop homebrew.mxcl.dnsmasq
sudo launchctl start homebrew.mxcl.dnsmasq
