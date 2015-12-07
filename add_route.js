var exec = require('child_process').exec;
var spawn = require('child_process').spawn;


exec("netstat -nr | grep default|grep en0  |awk '{print $2}'",function callback(error, stdout, stderr) {
	var fs = require('fs');
	var exec = require('child_process').exec;
	var array = fs.readFileSync('./conf.d/China.conf').toString().split("\n");
	// for(i in array) {
	//     console.log(array[i]);
	// }




	//var gateway = cmd_gateway.stdout.on('data', function (data) {
	//console.log('标准输出：' + data);
	//				return data;
	//});route add -net $ip_net $gateway  &
	function run(ip_lists,gateway){
		var array_length=ip_lists.length;
	if(array_length>1){
	var chunk=parseInt(array_length/2);
	run(ip_lists.slice(0,chunk),gateway);
	run(ip_lists.slice(chunk,array_length),gateway);
	}else{
		// console.log('route add -net '+ip_lists[0]+' '+gateway+' &');
		exec('route add -net '+ip_lists[0]+' '+gateway+' &');

		// spawn('route',['add', '-net' ,ip_lists[0],gateway,'&']);
		// console.log(ip_lists[0]) ;
	}

	}
	run(array,stdout.split("\n"));
	console.log(stdout);
	return stdout;	
});
