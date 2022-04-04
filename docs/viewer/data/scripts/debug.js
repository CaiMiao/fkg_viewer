var checkPaths = new Set();
var cps = 0;
var runningFileCheck = false;

function checkExists(path){
	if(path == null || path.includes("black.png") || path.includes("chr_0127_1f_r18.png")){
		checkPaths.delete(path);
		cps--;
		finishFileCheck();
		return;
	}
	let file = "";
	if(path.includes("images")){
		file = new Image();
		file.onload = function(){
			checkPaths.delete(path);
			cps--;
			finishFileCheck();
		}
	} else {
		file = new Audio();
		file.oncanplay = function(){
			checkPaths.delete(path);
			cps--;
			finishFileCheck();
		}
	}
	file.onerror = function(){
		cps--;
		finishFileCheck();
		console.log("Missing: " + path);
	}
	file.src = path;
}

function fileCheck(ids=Object.keys(sceneData)){
	runningFileCheck = true;
	console.log("Running File Check:");
	for(id of ids){
		let sscript = sceneData[id].SCRIPTS.PART1.SCRIPT;
		for(command of sscript){
			let src;
			let data = command.includes(">") ? command.split(">")[1] : command;
			switch(command.substr(1, command.lastIndexOf(">") -1)){
				case "EV":
					src = constructImagePath(command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)), id);
				break;
				case "ACTOR":
					src = constructImagePath(command.substr(command.indexOf(",") + 1, command.substr(command.indexOf(",") + 1).indexOf(",")), id);
				break;
				case "BG":
					src = constructImagePath(data.split(",")[0].trim(), id);
				break;
				case "BGM_PLAY":
					src = constructBGMAudioPath(command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)));
				break;
				case "SE_PLAY":
					src = constructSEAudioPath(command.substr(command.lastIndexOf(">") +1));
				break;
				case "VOICE_PLAY":
					src = constructVoiceAudioPath(command.substr(command.lastIndexOf(">") +1), id);
				break;
				default:
				break;
			}
			checkPaths.add(src);
		}
	}
	cps = checkPaths.size;
	for(let path of checkPaths){
		checkExists(path);
	}
}

function finishFileCheck(){
	if(cps == 0){
		runningFileCheck = false;
		console.log("Finished File Check!");
		console.log(checkPaths.size + " file(s) missing.");
	}
}

function getTagList(){
	dbgDataTags = new Set();
	for(let id of Object.keys(sceneData)){
		for(let tag of sceneData[id].script){
			dbgDataTags.add(tag.substr(0, tag.lastIndexOf(">") + 1))
		}
	}
}

function getTag(tag, log=false){
	var dbgFullCmd = new Set();
	for(let id of Object.keys(sceneData)){
		for(let cmd of sceneData[id].script){
			if(cmd.substr(0, cmd.lastIndexOf(">") + 1) == tag){
				dbgFullCmd.add(cmd);
				if(log){
					console.log(id + ": " + cmd)
				}
			}
		}
	}
}

function setTestPrefs(){
	prefs.viewer.pauseOnFocusLoss = false;
	prefs.scene.eng = false;
	prefs.scene.skipAnim = false;
	prefs.scene.textBoxUnder = false;
	prefs.scene.cutVoice = false;
	prefs.scene.copyText = false;
	prefs.scene.tlName = false;
	prefs.scene.playNext = true;
	prefs.scene.straightToAction = false;
	prefs.scene.auto.cps = 1000000;
	prefs.scene.auto.waitVoice = false;
	prefs.scene.auto.start = true;
	prefs.scene.autoDelay = 0;
}

function getTagCommand(tag, idx, log=false){
	 let dbgCmd = new Set();
	for(let id of Object.keys(sceneData)){
		if(!sceneData[id].rpgx){
			continue;
		}
		for(let cmd of sceneData[id].SCRIPTS.PART1.SCRIPT){
			if(cmd.substr(0, cmd.lastIndexOf(">") + 1) == tag){
				let basecmd = cmd.split(">")[1].split(",")[idx];
				dbgCmd.add(basecmd);
				if(log){
					console.log(id + ": " + basecmd);
				}
			}
		}
	}
	return dbgCmd;
}

function getNewNames(){
	let names = Array.from(getTagCommand("<NAME_PLATE>", 0));
	let untl=[];
	for(let name of names){
		let tl = translateName(name)
		if(tl == name){
			untl.push(name);
		}
	}
	return untl;
}

function getStoryTags(){
	let dbgStoryTags = new Set();
	for(let key in storyData){
		let sections = storyData[key].SECTIONS;
		for(let section in sections){
			let parts = sections[section];
			for(let part in parts){
				let script = parts[part].script;
				for(let tag of script){
					dbgStoryTags.add(tag.substr(0, tag.lastIndexOf(">") + 1))
				}
			}
		}
	}
	console.log(dbgStoryTags);
}

function getStoryTagCommand(tag, idx, log=false){
	dbgStoryTags = new Set();
	for(let key in storyData){
		let sections = storyData[key].SECTIONS;
		for(let section in sections){
			let parts = sections[section];
			for(let part in parts){
				let script = parts[part].SCRIPT;
				for(let cmd of script){
					if(cmd.substr(0, cmd.lastIndexOf(">") + 1) == tag){
						let basecmd = cmd.split(">")[1].split(",")[idx];
						dbgStoryTags.add(basecmd);
						if(log){
							console.log(key + "- " + section + " - " + part + ":"  + basecmd);
						}
					}
				}
			}
		}
	}
	return dbgStoryTags;
}


function getStorySpecificTagCommand(tag, idx, value=null, log=false){
	dbgStoryTags = new Set();
	for(let key in storyData){
		let sections = storyData[key].SECTIONS;
		for(let section in sections){
			let parts = sections[section];
			for(let part in parts){
				let script = parts[part].SCRIPT;
				for(let cmd of script){
					if(cmd.substr(0, cmd.lastIndexOf(">") + 1) == tag){
						let basecmd = cmd.split(">")[1].split(",")[idx];
						if(value != null && basecmd == value){
							console.log(key + "- " + section + " - " + part + ":"  + basecmd);
						}
						dbgStoryTags.add(basecmd);
						if(log){
							console.log(key + "- " + section + " - " + part + ":"  + basecmd);
						}
					}
				}
			}
		}
	}
}

var f = [];
function searchScripts(word, exclude=[]){
	let found = [];
	for(let key in storyData){
		let sections = storyData[key].SECTIONS;
		for(let section in sections){
			let parts = sections[section];
			for(let part in parts){
				let script = parts[part].SCRIPT;
				for(let cmd of script){
					if(cmd.startsWith("　") && cmd.includes(word)){
						found.push(`${key} - ${section} - ${part} - ${script.indexOf(cmd)}: ${cmd}`);
					}
				}
			}
		}
	}
	for(let id of Object.keys(sceneData)){
		if(!sceneData[id].rpgx){
			continue;
		}
		let script = sceneData[id].SCRIPTS.PART1.SCRIPT;
		for(let command of script){
			let tag = command.substr(command.indexOf("<") + 1, command.indexOf(">") - (command.indexOf("<") + 1));
			let data = command.includes(">") ? command.split(">")[1] : command;
			if(tag == "" && data.includes(word)){
				found.push(`${id} - ${script.indexOf(data)}: ${data}`);
			}
		}
	}

	return found.filter(excludeValues);

	function excludeValues(value){
		for(let exclusion of exclude){
			if(value.indexOf(exclusion) > -1){
				return false;
			}
		}
		return true;
	}
	
}


function findText(word, exclude=[]){
	let found = [];
	for(let key in storyData){
		let sections = storyData[key].SECTIONS;
		for(let section in sections){
			let parts = sections[section];
			for(let part in parts){
				let script = parts[part].SCRIPT;
				let txt = findAllText(script);
				for(let screen of txt){
					if(screen.includes(word)){
						found.push(`${key} - ${section} - ${part}: ${screen}`);
					}
				}
			}
		}
	}

	for(let id in sceneData){
		if(!sceneData[id].rpgx){
			continue;
		}
		let script = sceneData[id].SCRIPTS.PART1.SCRIPT;
		let txt = findAllText(script);

		for(let screen of txt){
			if(screen.includes(word)){
				found.push(`${id}: ${screen}`);
			}
		}
	}

	return found.filter(excludeValues);

	function excludeValues(value){
		for(let exclusion of exclude){
			if(value.indexOf(exclusion) > -1){
				return false;
			}
		}
		return true;
	}
}



function findFurigana(){
	let txt = findText("（");
	let furiganaLines = [];
	for(let line of txt){
		let start = line.indexOf("（");
		let kanjiStart;
		if(start > 0){
			if(line.substr(0, start).charCodeAt(start-1) >= 19968){
				furiganaLines.push(line);
			}
		}
	}
	return furiganaLines;
}

function findAllText(script){
	let pauses = 0;
	let text = [];
	for(let cmd of script){
		if (cmd.indexOf("<") == -1){
			if(text[pauses] == undefined){
				text[pauses] = cmd;
			} else {
				text[pauses] += cmd;
			}
			
		} else if (cmd.startsWith("<PAUSE>")){
			pauses++;
		}
	}
	text = text.filter(function(x){
		return x !== undefined;
	});
	return text;
}


// function preSceneSetup(){
// 	let pauses = 0;
// 	for(let cmd of scene.script){
// 		if(cmd.startsWith("<TRANSITION>")){
// 			let data = cmd.split(">")[1];
// 			let mask = data.split(",")[0].trim() + "_" + data.split(",")[1].trim();
// 			if(!maskData[mask]){
// 				main.elements.loadingFile.innerText = "Decompressing transition mask " + mask;
// 				decompressMask(mask);
// 			}
// 		} else if (cmd.startsWith("<LABEL>")){
// 			let data = cmd.split(">")[1];
// 			scene.labels[data] = scene.script.indexOf(cmd);
// 		} else if (cmd.indexOf("<") == -1){
// 			if(scene.textBuffer[pauses] == undefined){
// 				scene.textBuffer[pauses] = cmd+"<br />";
// 			} else {
// 				scene.textBuffer[pauses] += cmd+"<br />";
// 			}
			
// 		} else if (cmd.startsWith("<PAUSE>")){
// 			pauses++;
// 		}
// 	}
// }

function storyCheck(){
	let filePaths = new Set();
	let iter;
	let failed = [];
	for(let key in storyData){
		console.log(key)
		scene.type = STORY_RPGX
		let sections = storyData[key].SECTIONS;
		for(let section in sections){
			for(let part in sections[section]){
				for(let command of sections[section][part].script){
					let src;
					switch(command.substr(1, command.lastIndexOf(">") -1)){
						case "EV":
						case "BG":
							src = createImagePath(command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)).trim());
						break;
						case "ACTOR":
							src = createImagePath(command.substr(command.indexOf(",") + 1, command.substr(command.indexOf(",") + 1).indexOf(",")).trim());
						break;
						case "BGM_PLAY":
							src = constructBGMAudioPath(command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)).trim());
						break;
						case "SE_PLAY":
							src = constructSEAudioPath(command.substr(command.lastIndexOf(">") +1).trim());
						break;
						case "VOICE_PLAY":
							src = constructVoiceAudioPath(command.substr(command.lastIndexOf(">") +1).trim(), scene.id);
						break;
						default:
						break;
					}
					filePaths.add(src);

				}
			}
		}
	}
	iter = filePaths.values();
	filePaths.delete(undefined);
	let filesLoaded = 0;
	testFiles();

	function testFiles(){
		let path = iter.next().value;
		if(path == null){
			console.log("Loaded " + filesLoaded + "/" + filePaths.size + " files.");
			console.log(failed);
			return
		}
		let ext = path.substr(path.lastIndexOf(".")  + 1);
		if(ext == "png"){
			let img = new Image();
			img.onload = function(){
				filesLoaded++;
				testFiles();
			}
			img.onerror = function(){
				failed.push(path);
				testFiles();
			}
			img.src = path;

		} else if(ext == "ogg"){
			let audio = new Audio();
			audio.oncanplay = function(){
				filesLoaded++;
				testFiles();
			}
			audio.onerror = function(){
				failed.push(path);
				testFiles();
			}
			audio.src = path;
		}
	}
}


function calcMas(ms, mas, imas, maxmas, secs){
	return (((ms * (mas / maxmas)) + (imas * ((maxmas / 99) / 10))) * secs) * 0.5;
}
https://zu9j1t6ekm.user-space.cdn.idcfcloud.net/asset_bundle_2019_2/webgl/webgl?v=700000000000000000
637568073864960000
700000000000000000