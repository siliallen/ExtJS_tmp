Ext.onReady(function () {
	var XMLtoJSON_array = [];
	var arrayindex_one = 0;
	XMLtoJSON_array[arrayindex_one] = new Array;
	var arrayindex_two = 0;
	var videoOrmusic = 0;//0 is DEVICE NAME, 1 is video, 2 is music
	var codectype = 0;//0 is NOTHING, 1 is video, 2 is audio, 3 is format
	var recursive = 0;//let parse xml function decide to recursive parse xml action
	var vcodecindex = 0;
	var acodecindex = 0;
	var formatindex = 0;
	var pretype = 0;
	var alength, flength;
	var acounted = 0, fcount;
	var nowvcodec, nowacodec, whitelistindex = 0;
	var VProfile, MAXHEIGHT, MAXWIDTH, AProfile, MAXFREQUENCY, MAXCHANNELS, PN, MIME;
	
	Ext.Ajax.request({
		url: 'xmlparseTojson.php',
		method: 'GET',
		success: function(response, opts) {
			var obj = Ext.util.JSON.decode(response.responseText);
			console.log('START');
			parseJSONattributes(obj);
			console.log('STOP');
			console.info(XMLtoJSON_array);
			console.info(whitelist);
			console.info(whitelist_option);
			customFormatStore.loadData(whitelist);//VARTRANCECODE, VideoBitrate, VideoPorfile, maxWidth, maxHegiht, AudioBitrate, AudioPorfile, Channels, Samplerate, PN, MIME
			//console.info(whitelist);
			//console.info(whitelist_option);
			//console.info(channelsStore);
		},
		failure: function(response, opts) {
			console.log('server-side failure with status code ' + response.status);
		},
		params: { /*cmd: 'interface'*/ }
	});
	
	var whitelist = [
		//['Mpegts', 'H264', 'AAC'],//test
	];
	var whitelist_option = [];//vatranscode, videobitrate, videoprofile, maxwidth, maxhight, audiobitrate, audioprofile, channels, samlerate, pn, mime
	var vcodec_array = [];
	var acodec_array = [];
	
	var pn_array = [['AAC_ISO'],['MPEG4_P2_TS_ASP_AAC_ISO']];
	var mime_array = [['video/vnd.dlna.mpeg-tts'],['audio/x-wav']];
	var vbitrate_array = [
		//NULL DEFAULT
		[1.25],[5],[15],[29.4],[40]
	];
	var abitrate_array = [
		//NULL DEFAULT
		[32], [96], [128], [192],[320]
	];
	var vprofile_array = [];
	var aprofile_array = [];
	var maxwidth_array = [[1280], [1920]];
	var maxheight_array = [[720], [1080]];
	var samplerate_array = [[44100], [48000], [96000], [192000]];
	var channels_array = [[2], [5.1], [7.1]];
	var pnStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'pn_name'},       
		],
		data: pn_array,
    });
	var mimeStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'mime_name'},
        ],
		data: mime_array,
    });
	var vprofileStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'vprofile_name'},
        ],
		data: vprofile_array,
    });
	var aprofileStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'aprofile_name'},
        ],
		data: aprofile_array,
    });
	var vbitrateStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'vbitrate_name', type: 'float'},
        ],
		data: vbitrate_array,
    });
	var abitrateStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'abitrate_name', type: 'float'},
        ],
		data: abitrate_array,
    });
	var samplerateStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'samplerate_name', type: 'float'},
        ],
		data: samplerate_array,
    });
	var channelsStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'channels_name', type: 'float'},
        ],
		data: channels_array,
    });
	var maxwidthStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'maxwidth_name', type: 'float'},
        ],
		data: maxwidth_array,
    });
	var maxheightStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'maxheight_name', type: 'float'},
        ],
		data: maxheight_array,
    });
	var customFormatStore = new Ext.data.SimpleStore({
        fields: [
            {name: 'Format_name'},
            {name: 'VCodec_name'},
            {name: 'ACodec_name'},
			{name: 'array_index'},
        ],
		data: whitelist,
    });
	var customFormatSM = new Ext.grid.CheckboxSelectionModel({
        //header: 'Enable',
        singleSelect: false,
        //width: 125,
        checkOnly: true
    });
	var customFormatCM = new Ext.grid.ColumnModel({
        defaults: {
            menuDisabled: true
        },
        columns: [customFormatSM,{
            id: 'Format',
            header: 'Format',
            dataIndex: 'Format_name', 
            sortable : true,           
            width: 200
		},{
			id: 'Video_Codec',
			header: 'Video Codec',
			dataIndex: 'VCodec_name',       
			sortable : false,     
			width: 200
		},{
			id: 'Audio_Codec',
			header: 'Audio Codec',
			dataIndex: 'ACodec_name',   
			sortable : false,         
			width: 200,
			//hidden: true
		},{
			id: 'array_index',
			header: 'array index',
			dataindex: 'array_index',
			sortable: false,
			width: 200,
			hidden: true,
		},{
			header: 'Setting',
			width: 200,
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				var display;
				display='<input type="button" id="' + rowIndex + ' value="Advance Setting"/>';
				return display;
            }
		},{
            xtype: 'actioncolumn',
            width: 200,
            items: [{
                icon: '331414.png',
                // Use a URL in the icon config
                tooltip: 'Edit',
                handler: function (grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    //alert("Edit " + rec.get('firstname'));
					genAdvancedWindow(rec);
                }
            }]
		}
		]
    });
	
	var customUPnPSettingPage = new Ext.FormPanel({
		id: 'customUPnP_setting_page',
        //labelWidth: 150, // label settings here cascade unless overridden
        //url:'save-form.php',
        bodyStyle:'padding:10px 10px 10px',
        defaults: {
			width: 1920
		},

		items:[
			{
				xtype: 'label',
				text: 'Set the streaming file format for the renderer.',
			},{
				xtype: 'radiogroup',
				//vertical: true,
				columns: 1,
				hideLabel: true,
				items: [
					{
						boxLabel: 'Auto detection',
						name: 'Transcoding_Type',
						inputValue: '0',
						checked: true,
						listeners: 
						{
							focus: function() 
							{               
							}
						}
					},{
						boxLabel: 'Original file format',
						name: 'Transcoding_Type',
						inputValue: '1',
						listeners: 
						{
							focus: function() 
							{          
							}
						}
					},{
						boxLabel: 'User define',
						name: 'Transcoding_Type',
						inputValue: '2',
						
						listeners: 
						{
							focus: function() 
							{
							}
						}
					}
				]
			},{
				xtype: 'label',
				text: 'Please add the format which supported by the renderer.  The system will streaming the original file format to the renderer without transcode.  For the item not on the list below, the system will try the posibility format automatically.',
				width:500,
			},{
				xtype: 'label',
				text: 'Video',
			},new Ext.Container({
				//layout: 'anchor',						
				layout: {
					type: 'hbox',
				},
				defaults: {
                    // implicitly create Container by specifying xtype
                    xtype: 'container',
                    //autoEl: 'div', // This is the default.
                    //layout: 'hbox',
                    style: {
                        padding: '3px'
                    }
                },
				items:[
					{
						xtype: 'button',
						text: 'Add',
						handler: function(b, e){
							addcombination();
						}
					},{
						xtype: 'button',
						text: 'Remove',
						handler: function(b, e){
							Ext.MessageBox.show({
								title: 'Address',
								msg: 'Are you sure you want to remove the selected items?',
								//width: 300 ,
								buttons: Ext.MessageBox.OKCANCEL,
								//multiline:  true ,
								fn: showResult              
							});
						}
					}
				]
			}),new Ext.grid.EditorGridPanel({
				id: 'gridpanel',
				store: customFormatStore,
				sm: customFormatSM,
				cm: customFormatCM,
				clicksToEdit: 1,
				//autoExpandColumn: 'device',
				//height:350,
				stripeRows: true,
				//width:500,
				autoHeight: true
			})
		]
    });
			
	function genAdvancedWindow(n){        
        var checkboxWidth = 170;// for width of display items
		
		var customWindow = new Ext.Window({
            //title: 'custom window',
            width: 600,
			heigh: 700,
            layout:'form',
            closable: false,
			
			items:[
				{
					xtype: 'label',
					text: 'Format: ' + n.get('Format_name'),
				},{
					xtype: 'combo',
					id: 'pn_combo',
					store: pnStore,
					fieldLabel: 'PN',
					hideLabel: false,
					displayField: 'pn_name',
					valueField: 'pn_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					xtype: 'combo',
					id: 'mime_combo',
					store: mimeStore,
					fieldLabel: 'MIME',
					hideLabel: false,
					displayField: 'mime_name',
					valueField: 'mime_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					xtype: 'label',
					text: 'Video Codec: ' + n.get('VCodec_name'),
				},{
					xtype: 'combo',
					id: 'vbitrate_combo',
					store: vbitrateStore,
					fieldLabel: 'Bitrate',
					hideLabel: false,
					displayField: 'vbitrate_name',
					valueField: 'vbitrate_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					xtype: 'combo',
					id: 'vprofile_combo',
					store: vprofileStore,
					fieldLabel: 'Profile',
					hideLabel: false,
					displayField: 'vprofile_name',
					valueField: 'vprofile_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					xtype: 'combo',
					id: 'maxwidth_combo',
					store: maxwidthStore,
					fieldLabel: 'MaxWidth',
					hideLabel: false,
					displayField: 'maxwidth_name',
					valueField: 'maxwidth_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					xtype: 'combo',
					id: 'maxheight_combo',
					store: maxheightStore,
					fieldLabel: 'MaxHeigh',
					hideLabel: false,
					displayField: 'maxheight_name',
					valueField: 'maxheight_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					xtype: 'label',
					text: 'Audio Codec: ' + n.get('ACodec_name'),
				},{
					xtype: 'combo',
					id: 'abitrate_combo',
					store: abitrateStore,
					fieldLabel: 'Bitrate',
					hideLabel: false,
					displayField: 'abitrate_name',
					valueField: 'abitrate_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					xtype: 'combo',
					id: 'aprofile_combo',
					store: aprofileStore,
					fieldLabel: 'Profile',
					hideLabel: false,
					displayField: 'aprofile_name',
					valueField: 'aprofile_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					xtype: 'combo',
					id: 'samplerate_combo',
					store: samplerateStore,
					fieldLabel: 'Samplerate',
					hideLabel: false,
					displayField: 'samplerate_name',
					valueField: 'samplerate_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					xtype: 'combo',
					id: 'channels_combo',
					store: channelsStore,
					fieldLabel: 'Channels',
					hideLabel: false,
					displayField: 'channels_name',
					valueField: 'channels_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
					//value: videoTitleStyleStore.getAt(0).get('id')
				},{
					fbar: [{
						text: 'Apply',				
						handler: function(b, e){
							getNewsetting(n.get('array_index'));
							customWindow.close();
						}
					},{
						text: 'Cancel',				
						handler: function(b, e){
							customWindow.close();
						}
					}]
				}
			]
		});
		//customWindow.setTitle(n.get('VCodec_name') + '+' + n.get('ACodec_name') + '+' + n.get('Format_name'));// for debug
		keydefault(n.get('array_index'));
		customWindow.setTitle('Advance setting');
		customWindow.show();
    }
	
	function addcombination(){
		var addwindow = new Ext.Window({
			width: 600,
			heigh: 700,
            layout:'form',
            closable: false,
			
			items:[
				{
					xtype: 'combo',
					id: 'format_combo',
					store: pnStore,
					fieldLabel: 'Format:',
					hideLabel: false,
					displayField: 'pn_name',
					valueField: 'pn_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
				},{
					xtype: 'combo',
					id: 'vcodec_combo',
					store: pnStore,
					fieldLabel: 'Video Codec:',
					hideLabel: false,
					displayField: 'pn_name',
					valueField: 'pn_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
				},{
					xtype: 'combo',
					id: 'acodec_combo',
					store: pnStore,
					fieldLabel: 'Audio Codec:',
					hideLabel: false,
					displayField: 'pn_name',
					valueField: 'pn_name',
					typeAhead: true,
					mode: 'local',
					//forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true,
					allowBlank:false,
				},{
					fbar: [{
						text: 'Ok',				
						handler: function(b, e){
							if (checkRepeat(Ext.getCmp('format_combo').getValue(), Ext.getCmp('vcodec_combo').getValue(),Ext.getCmp('acodec_combo').getValue())) {
							//if (0){
								console.info('win');
								addnewcombination(Ext.getCmp('format_combo').getValue(), Ext.getCmp('vcodec_combo').getValue(),Ext.getCmp('acodec_combo').getValue());
								addwindow.close();
							} else {
								Ext.MessageBox.alert('Error', 'You have same combination.');
							}
						}
					},{
						text: 'Cancel',				
						handler: function(b, e){
							addwindow.close();
						}
					}]
				}
			]
		});
		addwindow.setTitle('Add new format');
		addwindow.show();
	}
	
	function checkRepeat(f, v, a){
		for (key in whitelist){
			if (whitelist[key][0] == f){
				if (whitelist[key][1] == v){
					if (whitelist[key][2] == a){
						return 0;
					}
				}
			}
		}
		return 1;
	};
	
	function addnewcombination(f, v, a){
		var length = whitelist.length;
		whitelist[length] = new Array;
		whitelist[length][0] = f;
		whitelist[length][1] = v;
		whitelist[length][2] = a;
		console.info(whitelist);
		dataStore.loadData(whitelist);
	};
	
	
	function parseJSONattributes(jsonObj){
		//global var: XMLtoJSON_array, arrayindex_one, arrayindex_two
		for (var key in jsonObj){
			if (key == 'XML_attributes'){
				for (var value in jsonObj[key]){
					if (codectype == 1){
						if (videoOrmusic == 1){
							if (jsonObj[key][value].match('CODEC_ID') == 'CODEC_ID')
								nowvcodec = jsonObj[key][value];
								
							if (value == 'PROFILE')
								VProfile = jsonObj[key][value];
							else if (value == 'MAXHEIGHT')
								MAXHEIGHT = jsonObj[key][value];
							else if (value == 'MAXWIDTH')
								MAXWIDTH = jsonObj[key][value];
						}
					} else if (codectype == 2){
						if (jsonObj[key][value].match('CODEC_ID') == 'CODEC_ID')
							nowacodec = jsonObj[key][value];
						
						if (value == 'PROFILE')
							AProfile = jsonObj[key][value];
						else if (value == 'MAXCHANNELS')
							MAXCHANNELS = jsonObj[key][value];
						else if (value == 'MAXFREQUENCY')
							MAXFREQUENCY = jsonObj[key][value];
								
						if (acounted == (alength - 1)){
							pretyep = codectype;
							arrayindex_two = vcodecindex;
							codectype = 1;
							
							if (videoOrmusic == 1){
								if (jsonObj[key][value].match('CODEC_ID') == 'CODEC_ID')
									nowvcodec = jsonObj[key][value];
								if (value == 'PROFILE')
									VProfile = jsonObj[key][value];
								else if (value == 'MAXHEIGHT')
									MAXHEIGHT = jsonObj[key][value];
								else if (value == 'MAXWIDTH')
									MAXWIDTH = jsonObj[key][value];
							}
						}
					} else if (codectype == 3){
						if (jsonObj[key][value].match('CODEC_ID') == 'CODEC_ID'){
							if (pretype == 2){
								pretype = codectype;
								arrayindex_two = acodecindex;
								codectype = 2;
								if (videoOrmusic == 1){
									if (jsonObj[key][value].match('CODEC_ID') == 'CODEC_ID')
										nowacodec = jsonObj[key][value];
									
									if (value == 'PROFILE')
										AProfile = jsonObj[key][value];
									else if (value == 'MAXCHANNELS')
										MAXCHANNELS = jsonObj[key][value];
									else if (value == 'MAXFREQUENCY')
										MAXFREQUENCY = jsonObj[key][value];
								}
							} 
							
							if (acounted == (alength - 1)){
								pretype = 2;
								arrayindex_two = vcodecindex;
								codectype = 1;
								if (videoOrmusic == 1){
									if (jsonObj[key][value].match('CODEC_ID') == 'CODEC_ID')
										nowvcodec = jsonObj[key][value];
										
									if (value == 'PROFILE')
										VProfile = jsonObj[key][value];
									else if (value == 'MAXHEIGHT')
										MAXHEIGHT = jsonObj[key][value];
									else if (value == 'MAXWIDTH')
										MAXWIDTH = jsonObj[key][value];
								}
							}
						} else if (jsonObj[key][value].match('FORMAT_') == 'FORMAT_'){										
							if (videoOrmusic == 1){
								whitelist[whitelistindex] = new Array;
								whitelist[whitelistindex][0] = jsonObj[key][value].substr(7);
								whitelist[whitelistindex][1] = nowvcodec.substr(9);
								whitelist[whitelistindex][2] = nowacodec.substr(9);
								whitelist[whitelistindex][3] = whitelistindex;
								
								whitelist_option[whitelistindex] = new Array;
								whitelist_option[whitelistindex][0] = 0;
								whitelist_option[whitelistindex][2] = VProfile;
								whitelist_option[whitelistindex][3] = MAXWIDTH;
								whitelist_option[whitelistindex][4] = MAXHEIGHT;
								whitelist_option[whitelistindex][6] = AProfile;
								whitelist_option[whitelistindex][7] = MAXCHANNELS;
								whitelist_option[whitelistindex][8] = MAXFREQUENCY;
								whitelist_option[whitelistindex][9] = PN;
								whitelist_option[whitelistindex][10] = MIME;
								whitelistindex++;
							}
						} else {
							if (videoOrmusic == 1){
								if (value == 'PN')
									PN = jsonObj[key][value];
								else if (value == 'MIME')
									MIME = jsonObj[key][value];
							
								whitelist_option[(whitelistindex-1)][9] = PN;
								whitelist_option[(whitelistindex-1)][10] = MIME;
							}
						}
					}
					
					XMLtoJSON_array[arrayindex_one][arrayindex_two] = jsonObj[key][value];
					arrayindex_two++;
					
					if (value == 'OPTION'){
						recursive = 0;
						
						if (codectype == 0){
							arrayindex_two = 0;
						} else if (codectype == 1){
							arrayindex_two = vcodecindex;
						} else if (codectype == 2){
							arrayindex_two = acodecindex;
							acounted++;
							
							if (acounted == (alength - 1)){
								preindex = codectype;
								codectype = 1;
								arrayindex_two = acodecindex;
							}
						} else if (codectype == 3){
							arrayindex_two = formatindex;
							fcounted++;
							
							if (fcounted == (flength - 1)){
								preindex = codectype;
								codectype = 2;
								arrayindex_two = acodecindex;
							}
						}
					}
				}
				
				arrayindex_one++;
				XMLtoJSON_array[arrayindex_one] = new Array;
			} else if (key == 'VIDEO'){
				videoOrmusic = 1;
				XMLtoJSON_array[arrayindex_one] = ['VIDEO'];
				arrayindex_two = 1;
				recursive = 1;
			} else if (key == 'MUSIC'){
				videoOrmusic = 2;
				XMLtoJSON_array[arrayindex_one] = ['MUSIC'];
				arrayindex_two = 1;
				acodecindex = 1;
				pretype = 0;
				recursive = 1;
			} else if (key == 'VCODEC'){
				pretype = 0;
				XMLtoJSON_array[arrayindex_one][arrayindex_two] = 'VCODEC';
				vcodecindex = arrayindex_two;
				arrayindex_one++;
				XMLtoJSON_array[arrayindex_one] = new Array;
				recursive = 1;
				codectype = 1;
			} else if (key == 'ACODEC'){
				if (videoOrmusic == 1){
					arrayindex_two = vcodecindex + 1;
				} else if (videoOrmusic == 2){
				}
				
				pretype = 1;
				alength = countJSONObject(jsonObj[key]);
				acounted = 0;
				XMLtoJSON_array[arrayindex_one][arrayindex_two] = 'ACODEC';
				acodecindex = arrayindex_two;
				arrayindex_one++;
				XMLtoJSON_array[arrayindex_one] = new Array;
				recursive = 1;
				codectype = 2;
			} else if (key == 'FORMAT'){
				pretype = 2;
				flength = countJSONObject(jsonObj[key]);
				fcounted = 0;
				arrayindex_two = acodecindex + 1;
				XMLtoJSON_array[arrayindex_one][arrayindex_two] = 'FORMAT';
				formatindex = arrayindex_two;
				arrayindex_one++;
				XMLtoJSON_array[arrayindex_one] = new Array;
				recursive = 1;
				codectype = 3;
			} else if (key == 'remove'){
			} else if (key == 'comment'){
			} else {
				if (typeof(jsonObj[key]) == 'object')
					parseJSONattributes(jsonObj[key]);
				else 
					recursive = 0;
			}
			
			if (recursive == 1)
				parseJSONattributes(jsonObj[key]);
			
		}
		return 0;
	};
	
	function countJSONObject(jsonObj){
		var count = 0;
		for (key in jsonObj){
			count++;
		}
		return count;
	};
	
	function keydefault(index)
	{
		//console.info(whitelist_option[index][8]);
		if (whitelist_option[index][1] != '')
			Ext.getCmp('vbitrate_combo').setValue(whitelist_option[index][1]);
		if (whitelist_option[index][2] != '')
			Ext.getCmp('vprofile_combo').setValue(whitelist_option[index][2]);
		if (whitelist_option[index][3] != '')
			Ext.getCmp('maxwidth_combo').setValue(whitelist_option[index][3]);
		if (whitelist_option[index][4] != '')
			Ext.getCmp('maxheight_combo').setValue(whitelist_option[index][4]);
		if (whitelist_option[index][5] != '')
			Ext.getCmp('abitrate_combo').setValue(whitelist_option[index][5]);
		if (whitelist_option[index][6] != '')
			Ext.getCmp('aprofile_combo').setValue(whitelist_option[index][6]);
		if (whitelist_option[index][7] != '')
			Ext.getCmp('channels_combo').setValue(whitelist_option[index][7]);
		if (whitelist_option[index][8] != '')
			Ext.getCmp('samplerate_combo').setValue(whitelist_option[index][8]);
		if (whitelist_option[index][9] != '')
			Ext.getCmp('pn_combo').setValue(whitelist_option[index][9]);
		if (whitelist_option[index][10] != '')
			Ext.getCmp('mime_combo').setValue(whitelist_option[index][10]);
	}
	
	function getNewsetting(index)
	{
		whitelist_option[index][1] = Ext.getCmp('vbitrate_combo').getValue();
		whitelist_option[index][2] = Ext.getCmp('vprofile_combo').getValue();
		whitelist_option[index][3] = Ext.getCmp('maxwidth_combo').getValue();
		whitelist_option[index][4] = Ext.getCmp('maxheight_combo').getValue();
		whitelist_option[index][5] = Ext.getCmp('abitrate_combo').getValue();
		whitelist_option[index][6] = Ext.getCmp('aprofile_combo').getValue();
		whitelist_option[index][7] = Ext.getCmp('channels_combo').getValue();
		whitelist_option[index][8] = Ext.getCmp('samplerate_combo').getValue();
		whitelist_option[index][9] = Ext.getCmp('pn_combo').getValue();
		whitelist_option[index][10] = Ext.getCmp('mime_combo').getValue();
	}
	
	customUPnPSettingPage.render(document.body);
});
