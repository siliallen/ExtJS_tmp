<?php
	$clienttype = getParam('clienttype');
	$platformCmd = '/sbin/getcfg -f /etc/platform.conf -d NULL "" Platform';
	$checkHWCmd = '/sbin/getcfg -f /etc/config/qpkg.conf -d FALSE CodexPack Enable';
	$platform = "x86";
	function getParam($tag)
	{
		return isset($_GET[$tag])?$_GET[$tag]:(isset($_POST[$tag])?$_POST[$tag]:null);
	}
	
	function getDestFIle($clienttype, $root){		
		if (substr($clienttype, 0, 4) == 'CUST'){ // custom
			//echo "CUST.xml<br>";
			return $root.$clienttype.".xml";
			//echo "<br>";
		} else if(substr($clienttype, 0, 8) == 'Standard' || strlen($clienttype) == 0) {
			return $root."default".".xml";
		} else { // Auto transcode 
			//echo $clienttype;
			//echo "<br>";
			return $root.$clienttype.".xml";
		}
	}
	$fp = popen($platformCmd, 'r');
	if($fp != false) {
		$temp = trim(fgets($fp));
		pclose($fp);
		if(stristr($temp, 'ARM') !== false) {
			$platform = 'arm';
		}else { //x86
			$fp = popen($checkHWCmd, 'r');
			if($fp != false) {
				$hw = trim(fgets($fp));
				if(stristr($hw, 'TRUE')) {
					if(stristr($temp, 'evansport') !== false) {
						$platform = 'evansportHW';
					}else {
						$platform = 'x86VATranscode';
					}
				}
				pclose($fp);
			}
		}
	}
	$destfile;
	$root = "/mnt/ext/opt/QDMS/config/$platform/upnp/";
	$destfile = getDestFIle($clienttype, $root);
	
	if (!is_file($destfile))
		$destfile = $root."default".".xml";
		
	//echo $destfile;
	$xml = simplexml_load_file($destfile);
	$kkk = json_encode($xml);
	echo str_replace("@","XML_",$kkk);
	
	/*function getDestFile($filename)
	{
	}*/
/*
	function getMediaReceivers()
	{
		//echo 'function getReceiver</br>';
		$MAC = 'mac';
		$IP = 'ip';
		$NAME = 'name';
		$TYPE = 'client_type';
		$PROFILE = 'profile';
		$USER = 'user';
		$COMEFROM = 'come_from';
		$ENABLE = 'enable';
		$client_type = array();
		$receiver_list = array();
		$cmd = '/usr/local/medialibrary/bin/myupnputil';
		$p = popen($cmd, 'r');
		while(!feof($p)){
			$line = trim(fgets($p));
			//echo $line . '</br>';
			if(strcmp($line, 'client type:') == 0){
				while(!feof($p)){
					$line = fgets($p);
					if($line !== false && strstr($line, ':')){
						$line = trim($line);
						$token = strtok($line, ':');
						if($token !== false){
							$token = strtok(':');
							array_push($client_type, $token);
						}
					}else{
						break;
					}
				}
				break;
			}
		}
		pclose($p);
		//array_walk($client_type, 'myFunction');
		$p = popen($cmd . ' list', 'r');
		while(!feof($p)){
			$line = trim(fgets($p));
			//echo $line . '</br>';
			if(strstr($line, '|') !== false){
				$explode = explode('|', $line);
				//var_dump($explode);
				$receiver = array();
				for($i = 0;$i < count($explode);$i++){
					switch($i){
						case 0:
							//if(strlen($token) != 0){
								$receiver[$MAC] = $explode[$i];
							//}
							$dataCol++;
							break;
						case 1:
							//if(strlen($token) != 0){
								$receiver[$IP] = $explode[$i];
							//}
							$dataCol++;
							break;
						case 2:
							//if(strlen($token) != 0){
								$receiver[$NAME] = $explode[$i];
							//}
							$dataCol++;
							break;
						case 3:
							//if(strlen($token) != 0){
								$receiver[$TYPE] = $explode[$i];
							//}
							$dataCol++;
							break;
						case 4:
							//if(strlen($token) != 0){
								$receiver[$PROFILE] = $explode[$i];
							//}
							$dataCol++;
							break;
						case 5:
							//if(strlen($token) != 0){
								$receiver[$USER] = $explode[$i];
							//}
							$dataCol++;
							break;
						case 6:
							//if(strlen($token) != 0){
								$receiver[$COMEFROM] = $explode[$i];
							//}
							$dataCol++;
							break;
					}
				}
				$receiver[$ENABLE] = 1;
				array_push($receiver_list, $receiver);
				//array_walk($receiver, 'myFunction');
				$dataCol = 0;
			}
		}
		pclose($p);
		//array_walk($receiver_list, 'myFunction');
		echo json_encode($receiver_list);
		echo "<br>";
		echo "test<br>";
		echo $receiver_list[0][mac];
		echo "<br>";
		print_r($receiver_list);
	}
	
	*/
?>