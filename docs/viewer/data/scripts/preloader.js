var toPreload = new Set();
var preloadIter;
var preload = {
	paths: new Set(),
	files: new Set(),
	temp:{

	},
	perm:{

	},
	canvas:{

	},
	currentSpine: null,
	spines: {},
	failed: false,
	failedPaths: [],
	loaded: 0,
	audio:{
		voice: new Audio(),
		bgm: new Audio(),
		se: new Audio(),
	}
}

//make scene uninteractable until load

function initPreload(){
	preload.permElem = document.getElementById("preload-perm-elem");
	preload.tempElem = document.getElementById("preload-temp-elem");
}

function preloadSceneResources(script){

	for(let command of script){
		let fn;
		let src;
		switch(command.substr(1, command.lastIndexOf(">") -1)){
			case "EV":
			case "BG":
				fn = command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)).trim();
				if(fn == "black" || fn == "white"){
					continue;
				}
				src = createImagePath(fn);
			break;
			case "ACTOR":
				fn = command.substr(command.indexOf(",") + 1, command.substr(command.indexOf(",") + 1).indexOf(",")).trim();
				src = createImagePath(fn);
			break;
			case "VOICE_PLAY":
				// src = constructVoiceAudioPath(command.substr(command.lastIndexOf(">") +1).trim(), scene.id);
			break;
			case "BGM_PLAY":
				// src = constructBGMAudioPath(command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)).trim());
			break;
			case "SE_PLAY":
				// src = constructSEAudioPath(command.substr(command.lastIndexOf(">") +1).trim());
			break;
			case "VIDEO_PLAY":
				fn = command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)).trim();
				src = createVideoPath(fn);
			break;
			//Create spine player container element
			case "SPINE":
				//imagefile1 = command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)).trim();
			break;

			default:
			break;
		}
		preload.paths.add(src);
	}

	//When done preloading all spine players, continue preloading of other resources
	preloadSpinePlayers(script, function callback(){

		preload.paths.delete(undefined);
		preload.iter = preload.paths.values();
		fileLoader(loadSceneResources);
	});

	//preload.paths.delete(undefined);
	//preload.iter = preload.paths.values();
	//fileLoader(loadSceneResources);
}

//Preload spine players used in the current scene
//Calls: callback() when done preloading
function preloadSpinePlayers(script, callback)
{
	//If the scene is not animated or the user has animations turned off, don't preload any spine players and just move on
	if(scene.animated==="0")
	{
		callback();
		return;
	}

	//Get all spine commands in the scene
	var spineData = getCommandData(script, "<SPINE>", null);

	//If there are no spine players, call the callback immediately
	if(spineData.length===0) {
		callback();
		return;
	}

	var preloadedSpineViewers=0;
	var spineDataSet = new Set();

	var spineDataInfo={};

  var viewports={
		"5":{
			//The transition time for transitioning between different viewport sizes, set it to 0 to do it instantly
			transitionTime: 0,
			x: 0,
			y: 0,
			width: 2106,
			height: 1404,
			padLeft: "90%",
			padRight: "-15%",
			padTop: "-100%",
			padBottom: "0%"
		},
		"0":{
			transitionTime: 0,
			x: 0,
			y: 0,
			width: 1552,
			height: 1232,
			padLeft: "85%",
			padRight: "-15%",
			padTop: "-100%",
			padBottom: "0%"
		},
		"-4":{
			transitionTime: 0,
			x: 0,
			y: 0,
			width: 1872,
			height: 1248,
			padLeft: "75%",
			padRight: "-25%",
			padTop: "-110%",
			padBottom: "0%"
		}
	};

	for(let i=0; i<spineData.length; i++)
	{
		var arguments1=spineData[i].split(",");

		let imagefile1=arguments1[0];
		let nrOfSpriteFiles1=arguments1[1];
		let arg2=arguments1[2];
		let spineAnimType1=arguments1[3]; //"0", "5" or "-4"

		spineDataInfo[imagefile1]={
			"spineAnimType":spineAnimType1
		};

		spineDataSet.add(imagefile1);
	}

	//Loop through all unique spine commands and create a spine player for each
	for(let imagefile of spineDataSet)
	{
		let spineAnimType=spineDataInfo[imagefile]['spineAnimType'];

		//console.log("Animation type: "+spineAnimType);

		preload.spines[imagefile] = document.createElement("div");
		preload.spines[imagefile].classList="spine-player-item";
		preload.spines[imagefile].id="spine-player_"+imagefile;

		//Add the spine viewer element the preload wrapper element
		main.elements.spineViewersHoldElem.appendChild(preload.spines[imagefile]);

		let spinesPath="scenes/"+scene.id+"/spines/";
		let skeletonJsonPath=spinesPath+"spine"+imagefile+".json";
		let atlasPath=spinesPath+"atlas"+imagefile+".atlas";

		//Documentation
		//https://github.com/EsotericSoftware/spine-runtimes/tree/3.8/spine-ts
		//https://esotericsoftware.com/spine-player
		//https://esotericsoftware.com/spine-api-reference

		//Creates a new spine player. The debugRender option enables rendering of viewports and padding for debugging purposes.
		preload.spines[imagefile].spinePlayer = new spine.SpinePlayer("spine-player_"+imagefile, {
			jsonUrl: skeletonJsonPath,
			atlasUrl: atlasPath,
			//animation: "Wait",
			premultipliedAlpha: false,
			//backgroundColor: "#00000000",
			backgroundColor: "#000000",
			alpha: false,
			//defaultMix: when switching between two animations, the player will mix the animations for X seconds, displaying a smooth transition
			//switches are done instantaniously in FKG
			//defaultMix: 1,
			defaultMix: 0,
			viewport: viewports[spineAnimType],
			/*
			debug: {
				bones: true, 
				regions: true,
				meshes: true,
				bounds: true,
				paths: true,
				clipping: true,
				points: true,
				hulls: true
			},
			*/
			showControls: false,
			//We must wait until the skeleton and atlas files have been loaded successfully before doing any setAnimation() calls
			//So we wait until loaded before we continue
			success: (player) => {

				//Set blendmode for all slots to 0, which is normal blending
				//Some scenes' slots have blendmode set to 2, which is 'Multiply', which causes incorrect rendering, so set it to 0 to fix it.
				//Maybe the rendering still isn't perfect in some cases, but it will have to do.
				//Blending controls how the slot attachment's pixels are combined with the pixels below
				//Probably only needed for scenes of type 1, but oh well
				for(var i in player.skeleton.slots)
				{
					player.skeleton.slots[i].data.blendMode=0;
				}

				//On scenes of type 0, hide the mosaic since it looks bad
				if((spineAnimType==="0") || (spineAnimType==="-4"))
				{
					for(var j in player.skeleton.slots)
					{
						if(player.skeleton.slots[j].data.name==="MaskMosaic1")
						{
							player.skeleton.slots[j].color.a=0;
							player.skeleton.slots[j].data.color.a=0;

							break;
						}
					}
				}

				//Pause the animation initially
				//Must be unpaused before when calling setAnimation() later
				player.paused=true;

				//scene.spinePlayer.setAnimation("Wait", true);
				preloadedSpineViewers++;
				if(preloadedSpineViewers >= spineDataSet.size)
				{
					callback();
				}
			}			
		});
	}
}

function preloadTABAResources(){
	for(let part in sceneData[scene.id].SCRIPTS){
		let curPart = sceneData[scene.id].SCRIPTS[part];
		let folder = curPart.FOLDER;
		let script;
		if(scene.translated){
			for(let tl of curPart.TRANSLATIONS){
				if(tl.LANGUAGE == scene.language && tl.TRANSLATOR == scene.translator){
					script = tl.SCRIPT;
					break;
				}
			}
		} else {
			script = curPart.SCRIPT
		}
		let path = "./TABAScenes/" + folder;
		for(let cmd of script){
			let src = cmd.src;
            let type = cmd.type;
            let id = cmd.id;
            let fullPath;

            switch(type){
            	case "BG":
            	case "EV":
            	case "OV":
            		if(src){
            			fullPath = path + "/images/" + src.split("/")[src.split("/").length -1];
            		}
            	break;
            	case "TXT":
	            	if(src){
            			// fullPath = path + "/sounds/" + src.split("/")[src.split("/").length -1];
            		}
            	break;
            	default:
            	break;
            }
            if(fullPath != undefined && !fullPath.includes("non_resource")){
            	preload.files.add(fullPath.split("/")[fullPath.split("/").length-1]);
            	preload.paths.add(fullPath);
            }
		}
		preload.paths.delete(undefined);
		preload.iter = preload.paths.values();
		fileLoader(loadSceneResources);
	}
}

function preloadNecroResources(script){
	let path = `./NecroScenes/${scene.id}`;
	for(let command of script){
		let src;
		let cmd = command.split(",");
		switch(cmd[0]){
			case "bg":
				src = `${path}/images/${cmd[1]}.png`;
			break;
			case "bgmplay":
				// src = `./data/audio/bgm/${cmd[1]}.m4a`;
			break;
			case "msgvoicesync":
				// src = `${path}/voices/${cmd[5]}.m4a`;
			break;
			case "playmovie":
				src = `${path}/videos/${cmd[1]}.webm`;
			break;
			case "seplay":
				// src = `./data/audio/se/${cmd[1]}.m4a`;
			break;
			case "voice":
				// if(!cmd[1].includes("_i_men")){
				// 	src = `${path}/voices/${cmd[1]}.m4a`;
				// }
			break;
			default:
			break;
		}
		preload.paths.add(src);
	}
	preload.paths.delete(undefined);
	preload.iter = preload.paths.values();
	fileLoader(loadSceneResources);
}

function preloadOtogiResources(script){
	let path = `./OtogiScenes/${scene.id.split("_")[1]}`;
	for(let cmd of script){
		if(cmd.Voice != ""){
			// preload.paths.add(`${path}/voices/${cmd.Voice}.m4a`);
		}
		if(cmd.BGM != null){
			// preload.paths.add(`./data/audio/bgm/${cmd.BGM}.m4a`);
		}
		if(cmd.SE != ""){
			// preload.paths.add(`./data/audio/se/${cmd.BGM}.m4a`);
		}
	}
	for(let img of sceneData[scene.id].SCRIPTS.PART1.images){
		preload.paths.add(img);
	}
	preload.paths.delete(undefined);
	preload.iter = preload.paths.values();
	fileLoader(loadSceneResources);
}

function loadSceneResources(){
	let path = preload.iter.next().value;
	if(path == null || path == undefined){
		if(preload.failed){
			fileErrorPopup();
			return;
		}
		if(scene.type == H_TABA){
			// Multi-part scenes may use the same files so using paths
			// doesn't always work.
			if(preload.files.size == Object.keys(preload.temp).length){
				cleanupPreload();
				startScene();
				return;
			}
		} else {
			// I don't know why filenames doesn't work and paths does
			// for RPGX but I also don't care enough to find out.
			if(preload.paths.size == Object.keys(preload.temp).length ){
				cleanupPreload();
				startScene();
				return;
			}
		}
		//console.log("Error code: Some shit's not fucking loading");
		//console.log(loadSceneResources.caller);
		return;
	}
	main.elements.loadingFile.innerText = path;
	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	if(preload.temp[fn]){
		loadSceneResources();
		return;
	}
	let ext = path.substr(path.lastIndexOf(".")  + 1);
	if(ext == "png" || ext == "jpg"){
		loadImage(path, "tempPreloadImage", false, loadSceneResources);
	} else if(ext == "ogg" || ext == "mp3"){
		//loadAudio(path, false, loadSceneResources);
	} else if(ext == "webm" || ext == "mp4"){
		loadVideo(path, "tempPreloadVideo", false, loadSceneResources);
	}
}

function cleanupPreload(){
	preload.paths = new Set();
	preload.files = new Set();
	preload.failed = false;
	preload.failedPaths = [];
	preload.loaded = 0;
	main.elements.loadingWrap.style.visibility = "hidden";
}

function createCanvases(script, pairList=null){
	let evData = getCommandData(script, "<EV>", 0);
	let spineImageData = getCommandData(script, "<SPINE_IMAGE>", 0);
	//console.log(evData);
	//console.log(spineImageData);
	//evData = [...new Set(evData)];
	//evData = new Set(evData);

	let eventImgData=evData.concat(spineImageData);
	eventImgData = new Set(eventImgData);

	//console.log(eventImgData);
	for(let ev of eventImgData){
		createCGCanvases(ev, pairList);
	}
	// for(let img of sceneData[id].hierarchy.pairList){
	// 	if(!preload.canvas.hasOwnProperty(img.parent)){
	// 		createCanvas([img.parent]);
	// 	}
	// 	if(!preload.canvas.hasOwnProperty(img.child)){
	// 		createCanvas([img.parent, img.child]);
	// 	}
	// }
}

function createCGCanvases(ev, pairList=null){
	//console.log(ev + ", " + pairList)
	let prevParent;
	if(!preload.canvas.hasOwnProperty(ev) && pairList != null){
		let foundMatch = false;
		for(let pair of pairList){
			prevParent = pair.parent;
			if(ev == pair.parent){
				foundMatch = true;
				createCanvas([pair.parent]);
				break;
			} else if(ev == pair.child){
				foundMatch = true;
				createCanvas([pair.parent, pair.child]);
				break;	
			}
		}
		if(!foundMatch){
			// Sometimes EVs aren't listed in the pair list.
			if(prevParent == null){
				createCanvas([ev])
			} else {
				createCanvas([prevParent, ev]);
			}
		}
	} else {
		createCanvas([ev]);
	}
}

function createCanvas(files){
	let name = files[files.length - 1];
	let canvas = document.createElement("canvas");
	canvas.id = name
	//canvas.height = 720;
	//canvas.width = 1280;
	canvas.height = 640;
	canvas.width = 960;
	//canvas.width = 1136;
	main.elements.canvasHoldElem.append(canvas);
	// let ctx = canvas.getContext("2d");

	// for(file of files){
	// 	let image = new Image();
	// 	image.onload = function(){
	// 		ctx.drawImage(image, 160, 0, 960, 720, 0, 0, 960, 720);
	// 	}
	// 	image.src = createImagePath(file);
	// }
	if(files.length == 2){
		drawImage(canvas, files[0], function(){
			drawImage(canvas, files[1])
		});
	} else {
		drawImage(canvas, files[0]);
	}
	canvas.classList.add("tempPreloadImage");
	preload.canvas[name] = canvas;
}

function drawImage(canvas, file, callback=null){
	let ctx = canvas.getContext("2d");

	if(file==="black")
	{
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, 1136, 640);

		if(callback != null){
			callback();
		}
	}
	else if(file==="white")
	{
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, 1136, 640);

		if(callback != null){
			callback();
		}
	}
	else
	{
		let image = new Image();
		image.onload = function(){
			//Center the image horizontally, if necessary
			var xPos=(1136-image.width)/2;
			//console.log(image.width);
			//console.log(image.height);
			//ctx.drawImage(image, 0, 0, 1136, 640, xPos, 0, 1136, 640);
			ctx.drawImage(image, 0, 0, 960, 640, 0, 0, 960, 640);
			if(callback != null){
				callback();
			}
		}
		image.src = createImagePath(file);
	}
}

function createImagePath(file){
	if(scene.type == H_RPGX || scene.type == CG_RPGX){
		let id;
		if(file.startsWith("chr_0") && !file.startsWith("chr_0295_3") && !file.startsWith("chr_0299_3") && !file.startsWith("chr_0334") && !file.startsWith("chr_0364_3") && !file.startsWith("chr_0382_3")){
			id = file.replace("chr_", "").replace("_r18", "").replace(/[a-z]/g, "").substr(0,6);
		} else if(file.startsWith("exev")){
			id = (file.split("_")[0] + file.split("_")[1].replace(/[a-z]/, "")).replace("ev", "");
		// } else if(file.startsWith("ex")){
		// 	id = file.split("_")[0] + file.split("_")[1].replace(/[a-z]/, "");
		// 	console.log("ex match: " + file + ", " + id + ", " + scene.id)
		} else {
			id = scene.type == H_RPGX ? scene.id : cgViewer.scene;
		}
		//return "./scenes/" + id + "/images/" + file + ".png";
		return "./scenes/" + id + "/images/" + file + ".jpg";
	} else if(scene.type == STORY_RPGX){
		if(/[a-z]+_[a-z][0-9][0-9][0-9][a-z]/.test(file) || file.startsWith("chr_") || file.startsWith("ex_")){
			return "./Story/char/" + file + ".png";
		} else if(file.startsWith("ef") || file.startsWith("nc") || file.startsWith("chrnc")){
			return "./Story/bg/" + file + ".png";
		} else if(file.startsWith("stv")){
			return "./Story/ev/" + file + ".png";
		}
	} else if(scene.type == H_TABA){

	}
}

function createVideoPath(file){

		let	id = scene.type == H_RPGX ? scene.id : cgViewer.scene;
		return "./scenes/" + id + "/videos/" + file + ".mp4";
}

function getCommandData(script, tag, idx=null){
	let data = []
	for(let cmd of script){
		if(cmd.startsWith(tag)){
			if(idx != null){
				data.push(cmd.substr(cmd.lastIndexOf(">") + 1).split(",")[idx]);
			} else {
				data.push(cmd.substr(cmd.lastIndexOf(">") + 1));
			}
		}
	}
	return data
}

// var trans = new Set();
// for(let key in sceneData){
// 	console.log(getCommandData(sceneData[key].script, "<TRANSITION>", 0));
// }

function constructImagePath(src, id){
	//return "./scenes/" + id + "/images/" + src + ".png";
	return "./scenes/" + id + "/images/" + src + ".jpg";
}
function constructVoiceAudioPath(src, id){
	//return "./scenes/" + id + "/voices/" + src + ".ogg";
	return "./scenes/" + id + "/voices/" + src + ".mp3";
}

function constructBGMAudioPath(src){
	//return "./data/audio/bgm/" + src + ".ogg";
	return "./data/audio/bgm/" + src + ".mp3";
}

function constructSEAudioPath(src){
	//return "./data/audio/se/" + src + ".ogg";
	return "./data/audio/se/" + src + ".mp3";
}

function emptyTempPreload(){
	// Kill children causes some weird shit in CG mode for the canvas holder
	// for(let key in preload.canvas){
	// 	let child = preload.canvas[key];
	// 	child.parentElement.removeChild(child)
	// }
	preload.canvas = {};
	preload.temp = {};
	preload.paths = new Set();
	preload.files = new Set();
	killChildren(document.getElementById("preload-temp-elem"));
	killChildren(main.elements.canvasHoldElem);
}

function emptySpinePreload()
{
	preload.currentSpine=null;
	//preload.spinesPaths=new Set();
	preload.spines={};

	killChildren(main.elements.spineViewersHoldElem);
}

// var names = new Set();
// for(let key in sceneData){
// 	let curScene = sceneData[key];
// 	for(let cmd of curScene.script){
// 		if(cmd.startsWith("<NAME_PLATE>")){
// 			let name = cmd.substr(cmd.lastIndexOf(">") + 1);
// 			if(/[ａ-ｚＡ-Ｚ０-９？]/.test(name)){
// 				names.add(name.substr(0, /[ａ-ｚＡ-Ｚ０-９？]/.exec(name).index).trim());
// 			} else {
// 				names.add(name.trim());
// 			}
// 		}
// 	}
// }

function permPreload(paths){
	preload.paths = new Set(paths);
	preload.paths.delete(undefined);
	preload.iter = preload.paths.values();
	displayLoadScreen();
	loadPermFiles();
}

function loadPermFiles(){
	let path = preload.iter.next().value;
	if(path == null || path == undefined){
		if(preload.failed){
			fileErrorPopup();
			return;
		} else {
			cleanupPreload();
			return;
		}
	}
	main.elements.loadingFile.innerText = path;
	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	if(preload.temp[fn]){
		loadPermFiles();
		return;
	}
	loadImage(path, "permPreloadImage", true, loadPermFiles);
}

function errorLoading(path){
	preload.failed = true;
	preload.failedPaths.push(path);
}

function fileErrorPopup(){
	main.elements.loadingError.style.visibility = "initial";
	main.elements.loadingErrorMsg.value = "The following files could not be loaded:\n"
	for(let error of preload.failedPaths){
		main.elements.loadingErrorMsg.value += "    " + error + "\n";
	}
}

function closeError(){
	main.elements.loadingError.style.visibility = "hidden";
	main.elements.loadingErrorMsg.value = "";
	cleanupPreload();
	endScene();
}

function fileLoader(loadFunction){
	for(let i = 0; i < prefs.viewer.fileLoaders; i++){
		loadFunction();
	}
}

function updateProgress(){
	main.elements.loadingProgress.style.width = ((preload.loaded / preload.paths.size) * 100) + "%";
}

function loadImage(path, className, perm, callback){
	let img = new Image();
	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	img.className = className;
	img.addEventListener("load", function(){
		if(perm){
			preload.perm[fn] = img;
			preload.permElem.append(img);
		} else {
			preload.temp[fn] = img;
			preload.tempElem.append(img);
		}
		preload.loaded++;
		updateProgress();
		callback();
	}, {once:true});
	img.addEventListener("error", function(){
		errorLoading(path);
		callback();
	}, {once:true})
	img.src = path;
}

function loadVideo(path, className, perm, callback){
	let vid = document.createElement("video");
	vid.width = 1280;
	vid.height = 720;
	vid.controls=false;
	vid.loop=true;
	vid.preload="auto";

	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	vid.className = className;
	vid.setAttribute("video_filename", fn);	
	
	vid.addEventListener("canplay", function(){
		if(perm){
			preload.perm[fn] = vid;
			preload.permElem.append(vid);
		} else {
			//console.log("Done");
			preload.temp[fn] = vid;
			preload.tempElem.append(vid);
		}
		preload.loaded++;
		updateProgress();
		callback();
	}, {once:true});
	vid.addEventListener("error", function(){
		errorLoading(path);
		callback();
	}, {once:true})
	vid.src = path;
}

function loadAudio(path, perm, callback){
	let audio = new Audio();
	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	audio.addEventListener("canplay", function(){
		if(perm){
			preload.perm[fn] = audio;
		} else {
			preload.temp[fn] = audio;
		}
		preload.loaded++;
		updateProgress();
		callback();
	}, {once:true});
	audio.addEventListener("error", function(){
		errorLoading(path);
		callback();
	}, {once:true});
	audio.src = path;
}

async function loadAudioNow(path, type){
	let o = preload.audio[type.toLowerCase()];
	o.src = "";
	try{
		await promiseFile(path, o);
	} catch(e){
		console.log("Audio Load Error");
	}

	function promiseFile(path, obj){
		return new Promise((resolve, reject) => {
			let audio = obj;
			audio.oncanplaythrough = () => resolve();
			audio.onerror = (e) => {
				//deleteElement(elem);
				errorLoading(path)
				reject()
			};
			audio.src = path;
		});
	}
}

async function loadBacklogVoice(path){
	scene.current.backlogVoice.src = "";
	try{
		await promiseFile(path);
	} catch(e){
		console.log("Backlog Audio Load Error");
	}

	function promiseFile(path){
		return new Promise((resolve, reject) => {
			let audio = scene.current.backlogVoice;
			audio.oncanplaythrough = () => resolve();
			audio.onerror = () => {
				//deleteElement(elem);
				reject()
			};
			audio.src = path;
		});
	}
}