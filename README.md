# dnsmasq_log_filter
generate dnsmasq config file automatically using nameserver 114.114.114.114 or 8.8.8.8 depends on dnsmasq log
# prepare
need config dnsmasq. use log-queries, log-facility, conf-dir
# run
sudo node dnsmasq_log_parse.js
