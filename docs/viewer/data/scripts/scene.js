// Select a scene
// calls loadSceneViewer()
// calls prepareScene()
// calls preloadSceneResources()
// calls loadSceneResources()
// once all resources have loaded calls startScene()
// if a resource failed to load errors.

var scene = {
	id:0,
	//If the scene has animations in it or not, can be "1" or "0"
	//This is also set based on user preference, if the user has animations turned off, this will be "0", even for an animated scene
	animated:"0",
	script: [],
	commands:[],
	translated:false,
	language:"Japanese",
	translator:"None",
	processingGroup:false,
	mode: 0,
	index:0,
	actors:[],
	skippableAnimation:true,
	animatingElement:false,
	animatedElements:[],
	movingActor:false,
	waitIndex:0,
	voiceDur:0,
	voicedLine:false,
	waiting:false,
	bgmFade:0,
	nextAuto:0,
	nextSkip:0,
	type:"",
	choice:false,
	newBacklogItem:true,
	backlogOpen:false,
	textBoxHidden:false,
	labels:{},
	textBuffer:[],
	pauseIdx:0,
	outActors:[],
	jumpIndexes:[],
	otogiFlashed:false,
	otogiFlashDur:0,
	alt:{
		flash:false,
		bg:false
	},
	empty:{
		bgs:false,
		textBox:false
	},
	fill:{
		textBox:false
	},
	elements:{

	},
	ctx:{

	},
	current:{
		bgm: new Audio(),
		voice: new Audio(),
		se: new Audio(),
		backlogVoice: new Audio()
	},
	prev:{
		bgm: new Audio(),
		voice: new Audio(),
		se: new Audio(),
	},
	transition:{
		startTime:0,
		nextDraw:0,
	},
	story:{
		id:0,
		section:"S01",
		part:"A",
		type:"chapter"
	}
}

function prepareScene(){
	//If the scene has animations in it or not, can be "1" or "0"
	scene.animated = sceneData[scene.id].SCRIPTS.PART1.ANIMATED;
	//If the user has animations turned off, then we should not play animations, even if the scene has them
	//This check is only done once here at the start of the scene, a user cannot change between animated on/off while the scene is currently playing
	if(!prefs.spineAnimation.on)
	{
		scene.animated="0";
	}

	scene.jumpIndexes = [];
	scene.textBuffer = [];
	scene.pauseIdx = 0;
	if(scene.type == H_RPGX || scene.type == STORY_RPGX){
		preSceneSetup();
		preloadSceneResources(scene.script);
		if(scene.type == H_RPGX){
			createCanvases(scene.script, sceneData[scene.id].SCRIPTS.PART1.HIERARCHY.pairList);
		} else {
			createCanvases(scene.script);
		}
	} else if(scene.type == H_TABA){
		TABAPreSceneSetup();
		preloadTABAResources();
	} else if(scene.type == H_NECRO){
		NecroPreSceneSetup();
		preloadNecroResources(scene.script);
	} else if(scene.type == H_OTOGI){
		OtogiPreSceneSetup();
		preloadOtogiResources(scene.script);
	}
	scene.index = 0;
}

function preSceneSetup(){
	let pauses = 0;
	let lastPause = 0;
	let lastcmd = "";
	for(let[i, cmd] of scene.script.entries())
	{
		let match = cmd.match(/<(.*?)>(.*)/);

		/*
		if(cmd.startsWith("<TRANSITION>"))
		{
			let data = cmd.split(">")[1];
			let mask = data.split(",")[0].trim() + "_" + data.split(",")[1].trim();
			if(!maskData[mask]){
				main.elements.loadingFile.innerText = "Decompressing transition mask " + mask;
				decompressMask(mask);
			}
		}
		*/
		//else if (cmd.startsWith("<LABEL>"))
		if (cmd.startsWith("<LABEL>"))
		{
		  	let data = cmd.split(">")[1];
		  	scene.labels[data] = i;
	  }
		//} else if (cmd.indexOf("<") == -1){
		//Text events has no command, but the text may include a <param=PlayerName> tag to replace with the user's name
		else if (match===null || match.index!==0){
			if(scene.textBuffer[pauses] == undefined){
				scene.textBuffer[pauses] = cmd+"<br />";
			} else {
				scene.textBuffer[pauses] += cmd+"<br />";
			}
			
		} else if ((cmd.includes("<EV>") || cmd.includes("<SELECT>")) && scene.jumpIndexes.slice(-1)[0] != lastPause){
			scene.jumpIndexes.push(lastPause);
		} else if (cmd.includes("<PAUSE>")){
			// continues to the next index as long as there's something in
			// that index
			// stays with the same index if there isn't due to a double <PAUSE>
			if(typeof(scene.textBuffer[pauses]) != "undefined"){
				pauses++;
			}
			lastPause = i;
		}
	}
}

function TABAPreSceneSetup(){
	getTABAJumps();
}

function getTABAJumps(){
	let lastPause = 0;
	scene.jumpIndexes = [];
	for(let[i, cmd] of scene.script.entries()){
		if(cmd.type == "TXT"){
			lastPause = i;
		}else if((cmd.type == "EV" || cmd.type == "SELECT") && scene.jumpIndexes.slice(-1)[0] != lastPause){
			scene.jumpIndexes.push(lastPause);
		}
	}
}

function NecroPreSceneSetup(){
	let lastPause = 0;
	for(let[i, cmd] of scene.script.entries()){
		let data = cmd.split(",");
		if(data[0] == "message" || data[0] == "msgvoicesync"){
			lastPause = i;
		} else if((data[0] == "playmovie" || (data[0] == "bg" && data[1].includes("ev"))) && scene.jumpIndexes.slice(-1)[0] != lastPause){
			scene.jumpIndexes.push(lastPause);
		}
	}
}

function OtogiPreSceneSetup(){
	let lastPause = 0;
	let curAnimation = 0;
	for(let[i, cmd] of scene.script.entries()){
		if(cmd.CharaAnimation != curAnimation){
			curAnimation = cmd.CharaAnimation;
			lastPause = i
			scene.jumpIndexes.push(lastPause);
		}
	}
}

function startScene(){
	buildSceneViewer();
	main.view.current = SCENE_VIEWER;
	//console.log(scene.type);
	//console.log(H_TABA);
	if(scene.type == H_TABA || scene.type == H_NECRO || scene.type == H_OTOGI){
		// RPGX runs differently so starting at 0 works for RPGX
		// starting the others at 0 makes them skip the first command.
		scene.index = -1;
	}
	if(scene.type == H_OTOGI){
		scene.elements.video.setAttribute("currentAnim", "0");
		scene.elements.video.style.opacity = "0";
		scene.elements.video.style.width = "1402px";
		scene.elements.video.style.height = "898px";
		scene.elements.video.style.left = "-140px";
		scene.elements.video.style.top = "-118px";
		scene.otogiFlashDur = preload.temp[3].duration * 1000;
	}
	switchView();
	if(tlTools.active){
		loadTlTools([...scene.script]);
	}
	if(prefs.scene.straightToAction && (scene.type == H_RPGX || scene.type == H_TABA || scene.type == H_NECRO)){
		jumpToAction(false);
	} else {
		if(prefs.scene.auto.start){
			toggleSceneAutoMode();
		}
		processSceneCommand();	
	}
}

function endScene(){
	scene.current.bgm.pause();
	scene.current.se.pause();
	scene.current.voice.pause();
	main.view.current = SCENE_SELECT;
	switchView();
	scene.mode = 0;
	clearTimeout(input.touch.heldScene);
	clearTimeout(scene.nextAuto);
	clearTimeout(scene.nextSkip);
	scene.actors = [];
	scene.alt.flash = false;
	scene.alt.bg = false;
	scene.skippableAnimation = true;
	scene.animatingElement = false;
	scene.index = 0;
	scene.paused = false;
	scene.processingGroup = false;
	scene.translated = false;
	scene.choice = false;
	scene.newBacklogItem = true;
	scene.backlogOpen = false;
	scene.textBoxHidden = false;
	scene.textBuffer = [];
	scene.pauseIdx = 0;
	scene.commands = [];
	scene.story.id = 0;
	scene.story.part = "A";
	scene.story.section = "S01";
	scene.story.type = "chapter";
	scene.jumpIndexes = [];
	scene.outActors = [];

	//Clean up any eventual spine viewers
	//Remove spine players from the "preloading" container element
	emptySpinePreload();

	//scene.fill.textBox = false;
	sceneEventCleanup();
	killChildren(main.elements.viewer);
	emptyTempPreload();
	//emptyCanvasHold();
	loadSceneSelect();
	if(tlTools.active){
		tlTools.elements.wrap.style.display = "none";
	}
	if(preload.failed){
		fileErrorPopup();
		preload.failed = false;
		preload.failedPaths = [];
	}
}

function sceneEventCleanup(){
	// Remove animations and empty the animated elements array
	for(let element of scene.animatedElements){
		// End the animation and call any aniamtionend event listeners
		removeAnimation(element);
	}
	scene.animatedElements = [];

	// if(scene.empty.textBox){
	// 	scene.elements.textBoxText.innerHTML = "";
	// 	if(scene.type == H_TABA){
	// 		scene.elements.namePlate.innerHTML = "";
	// 	}
	// }
	
	if(scene.type == H_TABA && scene.empty.textBox){
		scene.elements.textBoxText.innerHTML = "";
		scene.elements.namePlate.innerHTML = "";
	}

	if(scene.empty.bgs){
		for (let child of scene.elements.backImages.children){
			killChildren(child)
		}
		scene.empty.bgs = false;
	}

	if(scene.transition.nextDraw > 0){
		cancelTransition(scene.transition.vis);
	}

	if(scene.movingActor){
		for(let actor of scene.actors){
			if(actor != null){
				cancelActorMovement(actor);
			}
		}
		scene.movingActor = false;
	}

	for(let idx of scene.outActors){
		delete scene.actors[idx];
	}
	scene.outActors = [];

	if(scene.newBacklogItem){
		scene.elements.backlogItem = document.createElement("div");
		scene.elements.backLogItemText = document.createElement("div");
		scene.elements.backLogItemName = document.createElement("div");
		scene.elements.backLogItemVoice = document.createElement("div");

		scene.elements.backlogItem.classList = "scene-backlog-item text-stroke";
		scene.elements.backLogItemText.classList = "scene-backlog-item-text";
		scene.elements.backLogItemName.classList = "scene-backlog-item-name";
		scene.elements.backLogItemVoice.classList = "scene-backlog-item-voice";

		scene.newBacklogItem = false;
	}
}

function processSceneCommand(){
	if(main.view.current != SCENE_VIEWER){
		return;
	}
	if(tlTools.jumping){
		if(tlTools.jumpTo <= scene.index){
			tlTools.jumping = false;
			scene.skippableAnimation = true;

			if(tlTools.active){
				let block = document.activeElement.closest(".text-block")
				scene.elements.namePlate.innerText = block.getElementsByClassName("text-block-name")[0].value;
				scene.elements.textBoxText.innerText = block.getElementsByClassName("text-block-text")[0].value;
				return
			}
		}
	}
	if(scene.type == H_TABA){
		sceneEventCleanup();
		scene.index++;
		runTABACommand();
	} else if(scene.type == H_NECRO){
		sceneEventCleanup();
		scene.index++;
		runNecroCommand();
	} else if(scene.type == H_OTOGI){
		sceneEventCleanup();
		scene.index++;
		runOtogiCommand();
	} else {
		sceneEventCleanup();
		let cmd;
		if(scene.index == scene.script.length){
			// Some scripts are missing the SCENARIO_END tag
			cmd = "<SCENARIO_END>";
		} else {
			cmd = scene.script[scene.index];
		}
		let tag = cmd.substr(1, cmd.lastIndexOf(">") -1);
		if(tag == "GROUP"){
			scene.processingGroup = true;
			scene.index++;
			processSceneCommand();
		} else if(tag == "/GROUP"){
			scene.processingGroup = false;
			scene.index++;
			runSceneCommands();
		} else if(scene.processingGroup){
			scene.commands.push(cmd);
			scene.index++;
			processSceneCommand();
		} else {
			scene.commands.push(cmd);
			scene.index++;
			runSceneCommands();
		}
	}

}

function progressScene(){
	if(main.view.current != SCENE_VIEWER){
		return;
	}
	clearTimeout(scene.nextSkip);
	clearTimeout(scene.nextAuto);
	if(scene.voicedLine && prefs.scene.cutVoice && !scene.current.voice.paused){
		scene.current.voice.pause();
	}
	scene.paused = false;
	scene.animatingElement = false;
	scene.waiting = false;
	scene.skippableAnimation = true;
	scene.voicedLine = false;
	scene.voiceDur = 0;
	scene.elements.textBoxIcon.style.display = "none";
	scene.commands = [];
	processSceneCommand();
}

function buildSceneViewer(){
	// Event Listeners can get left behind and that can become a problem
	// so we just kill the viewer and rebuild it every time we need it.
	scene.elements.backImages = document.createElement("div");
	scene.elements.transition = document.createElement("canvas");
	scene.elements.mask = document.createElement("canvas");
	scene.elements.masked = document.createElement("canvas");
	scene.elements.background = document.createElement("div");
	scene.elements.backgroundAlt = document.createElement("div");
	scene.elements.videoWrapper = document.createElement("div");
	scene.elements.spineWrapper = document.createElement("div");
	scene.elements.spineImage = document.createElement("div");
	scene.elements.spine = document.createElement("div");
	scene.elements.flash = document.createElement("div");
	scene.elements.flashAlt = document.createElement("div");
	scene.elements.actors = document.createElement("div");
	scene.elements.textBox = document.createElement("div");
	scene.elements.namePlate = document.createElement("div");
	scene.elements.textBoxText = document.createElement("div");
	scene.elements.textBoxIcon = document.createElement("div");
	scene.elements.autoInd = document.createElement("div");
	scene.elements.autoIndImg = document.createElement("div");
	scene.elements.autoIndDot = document.createElement("div");
	scene.elements.choiceBoxWrapper = document.createElement("div");
	scene.elements.choiceBox = document.createElement("div");
	scene.elements.backlog = document.createElement("div");
	scene.elements.backlogClose = document.createElement("div");
	scene.elements.whiteOverlay = document.createElement("div");
	scene.elements.blackOverlay = document.createElement("div");

	scene.elements.backImages.classList = "viewer-main-class";
	scene.elements.transition.classList = "viewer-main-class";
	scene.elements.mask.classList = "viewer-main-class hidden";
	scene.elements.masked.classList = "viewer-main-class hidden";
	scene.elements.background.classList = "viewer-main-class viewer-large-image";
	scene.elements.backgroundAlt.classList = "viewer-main-class viewer-large-image";
	scene.elements.videoWrapper.classList = "viewer-main-class viewer-video";
	scene.elements.spineWrapper.classList = "viewer-main-class viewer-spine-wrapper";
	scene.elements.spineImage.classList = "viewer-main-class viewer-spine-image";
	scene.elements.spine.classList = "viewer-main-class viewer-spine";
	scene.elements.flash.classList = "viewer-main-class";
	scene.elements.flashAlt.classList = "viewer-main-class";
	scene.elements.actors.classList = "viewer-main-class";
	//scene.elements.textBox.classList = "text-box scene-text text-stroke no-select";
	scene.elements.textBox.classList = "text-box scene-text no-select";
	scene.elements.namePlate.classList = "name-plate";
	scene.elements.textBoxText.classList = "text-box-text";
	scene.elements.textBoxIcon.classList = "text-box-icon";
	scene.elements.autoInd.classList = "text-box-auto-ind";
	scene.elements.autoIndImg.classList = "text-box-auto-ind-img";
	scene.elements.autoIndDot.classList = "text-box-auto-ind-dot";

	scene.elements.choiceBoxWrapper.id = "scene-choice-box-wrapper";
	scene.elements.choiceBox.id = "scene-choice-box";
	scene.elements.backlog.id = "scene-backlog";
	scene.elements.backlogClose.id = "scene-backlog-close";
	scene.elements.whiteOverlay.id = "white-overlay";
	scene.elements.blackOverlay.id = "black-overlay";
	//scene.elements.spine.id="spine-player";

	scene.elements.whiteOverlay.style.opacity = 0;
	scene.elements.blackOverlay.style.opacity = 0;

	scene.elements.transition.style.zIndex = "7"
	scene.elements.mask.style.zIndex = "-10";
	scene.elements.masked.style.zIndex =  "-10";
	scene.elements.background.style.zIndex = "2";
	scene.elements.backgroundAlt.style.zIndex = "1";
	scene.elements.flash.style.zIndex = "5"
	scene.elements.flashAlt.style.zIndex = "6"
	scene.elements.actors.style.zIndex = "4";
	scene.elements.textBox.style.zIndex = "9"
	scene.elements.backlog.style.zIndex = "8";
	scene.elements.videoWrapper.style.zIndex = "3";
	scene.elements.spineWrapper.style.zIndex = "3";
	
	scene.elements.spine.style.zIndex = "2";
	scene.elements.spineImage.style.zIndex = "1";

	//scene.elements.spine.style.width="960px";
	//scene.elements.spine.style.height="640px";

	scene.elements.transition.width = 960;
	scene.elements.transition.height = 720;
	scene.elements.mask.width = 960;
	scene.elements.mask.height = 720;
	scene.elements.masked.width = 960;
	scene.elements.masked.height = 720;

	//scene.elements.autoInd.innerHTML = "Auto";

	if(scene.translated || tlTools.active){
		scene.elements.textBoxText.style.fontSize = "24px";
		scene.elements.textBoxText.style.fontFamily = "var(--eng-font)";
		scene.elements.textBoxText.style.lineHeight = "28px";
	}

	if(scene.type == H_NECRO){
		// textbox always starts hidden
		if(!prefs.scene.textBoxUnder){
			scene.elements.textBox.style.opacity = "0";
		}
		// longer lines in Necro
		scene.elements.textBoxText.style.left = "22px";
		scene.elements.textBoxText.style.width = "815px"
	}

	if(scene.type == H_OTOGI){
		scene.elements.textBoxText.style.left = "22px";
		scene.elements.textBoxText.style.width = "815px"
	}

	if(scene.type == H_TABA){
		if(prefs.scene.stretchTABA){
			scene.elements.background.classList.add("taba-stretched-cg");
			scene.elements.backgroundAlt.classList.add("taba-stretched-cg");
		} else {
			scene.elements.background.classList.add("taba-normal-cg");
			scene.elements.backgroundAlt.classList.add("taba-normal-cg");
		}
	}

	let dot1 = scene.elements.autoIndDot;
	let dot2 = scene.elements.autoIndDot.cloneNode(true);
	let dot3 = scene.elements.autoIndDot.cloneNode(true);
	dot1.classList.add("auto-dot-1");
	dot2.classList.add("auto-dot-2");
	dot3.classList.add("auto-dot-3");



	main.elements.viewer.appendChild(scene.elements.backImages);
	scene.elements.backImages.appendChild(scene.elements.transition);
	scene.elements.backImages.appendChild(scene.elements.backgroundAlt);
	scene.elements.backImages.appendChild(scene.elements.background);
	scene.elements.backImages.appendChild(scene.elements.videoWrapper);
	scene.elements.backImages.appendChild(scene.elements.spineWrapper);
	scene.elements.spineWrapper.appendChild(scene.elements.spine);
	scene.elements.spineWrapper.appendChild(scene.elements.spineImage);
	scene.elements.backImages.appendChild(scene.elements.mask);
	scene.elements.backImages.appendChild(scene.elements.masked);
	main.elements.viewer.appendChild(scene.elements.flashAlt);
	main.elements.viewer.appendChild(scene.elements.flash);
	main.elements.viewer.appendChild(scene.elements.actors);
	main.elements.viewer.appendChild(scene.elements.textBox);
	scene.elements.textBox.appendChild(scene.elements.namePlate);
	scene.elements.textBox.appendChild(scene.elements.textBoxText);
	scene.elements.textBox.appendChild(scene.elements.textBoxIcon);
	scene.elements.textBox.appendChild(scene.elements.autoInd);
	scene.elements.autoInd.appendChild(scene.elements.autoIndImg);
	scene.elements.autoInd.appendChild(dot1);
	scene.elements.autoInd.appendChild(dot2);
	scene.elements.autoInd.appendChild(dot3);
	main.elements.viewer.appendChild(scene.elements.choiceBoxWrapper);
	scene.elements.choiceBoxWrapper.appendChild(scene.elements.choiceBox);
	//main.elements.viewer.appendChild(scene.elements.choiceBox);
	main.elements.viewer.appendChild(scene.elements.backlog);
	scene.elements.backlog.appendChild(scene.elements.backlogClose)

	main.elements.viewer.appendChild(scene.elements.whiteOverlay);
	main.elements.viewer.appendChild(scene.elements.blackOverlay);

	scene.ctx.transition = scene.elements.transition.getContext("2d");
	scene.ctx.mask = scene.elements.mask.getContext("2d");
	scene.ctx.masked = scene.elements.masked.getContext("2d");

	scene.elements.backlogClose.addEventListener("click", function(e){
		e.stopPropagation();
		toggleOffBacklog();
	},false)
}

async function runSceneCommands(){
	if(main.view.current != SCENE_VIEWER){
		return;
	}
	for(let command of scene.commands){
		//let tag = command.substr(1, command.lastIndexOf(">") -1);
		//let tag = command.substr(command.indexOf("<") + 1, command.indexOf(">") - (command.indexOf("<") + 1));
		let tag="";
		let data="";
		//<param=PlayerName> can be the first thing in a text, so don't match any commands at the beginning that includes "="
		let match = command.match(/<([^=]*?)>(.*)/);
		//if(match!==null && match[1]==='param=PlayerName')
		//{
		//	debugger;
		//}
		//console.log(match);
		//A command must start at the beginning, so if no command is found or a command is found in the middle of the string, set the command to be empty
		if(match!==null && match.index===0){
			tag = match[1];
			data = match[2];
		}
		else{
			data = command;
		}

		//See if a scene has animations be checking: "scene.animated", which can be: "1" or "0"

		//console.log(tag);
		//let data = command.includes(">") ? command.split(">")[1] : command;
		//console.log(data);


		switch(tag){
			
			//Load spine
			//If a spine_image has been displayed previously, display this spine infront of it
			case "SPINE":
				//If the scene has animations in it, but the user has animations turned off, ignore this command
				if(scene.animated==="0")
				{
					break;
				}

				//Ex: spine,hscene_r18_spine/r18_spine_100011_000,3,0,5,0.26
				let imagefile1 = data.split(",")[0].trim();
				let nrOfSpriteFiles = Number(data.split(",")[1]);
				//arg2 may be 0 or 1
				let arg2 = Number(data.split(",")[2]);
				let arg3 = Number(data.split(",")[3]);
				let arg4 = Number(data.split(",")[4]);

				//Spine player div container element
				//console.log(scene.elements.spine);
				//Save the active current spine, since other spine commands after, like: "SPINE_PLAY", will act on that
				preload.currentSpine=imagefile1;
				//Get already preloaded spine player element and add it to the scene spine container element
				scene.elements.spine.appendChild(preload.spines[imagefile1]);

				//Bring spine animation player element to front and spine image element to back, if any
				scene.elements.spine.style.zIndex = "2";
				scene.elements.spineImage.style.zIndex = "1";
							
				break;
			//Play specific spine animation, and if it should be played once or loop continously
			//Non-blocking, weither it's looping or not
			case "SPINE_PLAY":
				//If the scene has animations in it, but the user has animations turned off, ignore this command
				if(scene.animated==="0")
				{
					break;
				}

				//Ex: spine_play,Wait,true,
				let animationName = data.split(",")[0].trim();
				let playState = data.split(",")[1].trim();
				playState = (playState==="true") ? true: false;

				//"false" to set the animation to play once, "true" to set it to loop forever
				//Since we pause the animation that runs initially when preloading the spine, we must unpause it here first before calling setAnimation()
				preload.spines[preload.currentSpine].spinePlayer.paused=false;
				preload.spines[preload.currentSpine].spinePlayer.setAnimation(animationName, playState); 

				break;
			/*
			case "SPINE_EFFECT":
				//Ex: spine_effect,7,
				let effectNr = Number(data.split(",")[0]);

				break;
			*/
			/*
			case "SPINE_WAIT":
				//If the scene has animations in it, but the user has animations turned off, ignore this command
				if(scene.animated==="0")
				{
					break;
				}

				//Ex: spine_wait,0.5,
				let duration11 = Number(data.split(",")[0]);

				break;
			*/
			//Adds and display a regular image in front of the spine animation
			case "SPINE_IMAGE":
				//If the scene has animations in it, but the user has animations turned off, ignore this command
				if(scene.animated==="0")
				{
					break;
				}

				//Ex: spine_image,hscene_r18/r18_123501_001,,
				let imagefile11 = data.split(",")[0].trim();

				//Clear any previous canvases, if any
				killChildren(scene.elements.spineImage);
				//Add a new one
				let clone1 = cloneCanvas(preload.canvas[imagefile11]);
				scene.elements.spineImage.appendChild(clone1);

				//Bring spine image element to front and spine animation player element to back
				scene.elements.spineImage.style.zIndex = "2";
				scene.elements.spine.style.zIndex = "1";

				break;

			case "ACTOR":
				let actorIdx = Number(data.split(",")[0]);
				let actor = data.split(",")[1].trim();
				let actorPos = data.split(",")[2].trim();
				let actorPos2 = data.split(",")[3].trim();
				let actorMoving = data.split(",")[4].trim();
				let actorTiming = data.split(",")[5].trim();
				let actorDur = Number(data.split(",")[6]);
				//actorIdx = confirmActorId(actor, actorIdx);
				if(!scene.actors[actorIdx]){
					scene.actors[actorIdx] = createActor(actor, actorPos2);
					scene.elements.actors.appendChild(scene.actors[actorIdx]);
				}
				if(actorMoving == "IN"){
					scene.actors[actorIdx].style.backgroundImage = "url('" + createImagePath(actor) + "')";
					setActorPosition(scene.actors[actorIdx], actorPos2);
					animateElement(scene.actors[actorIdx], actorDur, "fade-in", true, actorTiming);
					scene.skippableAnimation = false;
				} else if(actorMoving == "OUT"){
					if(scene.actors[actorIdx].style.opacity == "1"){
						animateElement(scene.actors[actorIdx], actorDur, "fade-out", true, actorTiming);
						scene.skippableAnimation = false;
					}
				}
				else if(actorMoving == "NONE" && actorDur > 0)
				{
					let matchIdx = scene.index;
					scene.actors[actorIdx].style.opacity = "1";
					scene.actors[actorIdx].style.backgroundImage = "url('" + createImagePath(actor) + "')";
					scene.actors[actorIdx].style.transition = actorTiming + " " + actorDur + "ms";
					//console.log(scene.actors[actorIdx].style.transition);

					setActorPosition(scene.actors[actorIdx], actorPos2);
					scene.skippableAnimation = false;
					scene.movingActor = true;
					let timeout = setTimeout(function() {
						if(matchIdx == scene.index){
							scene.skippableAnimation = true;
							scene.animatingElement = false;
							progressScene();
						}
					}, actorDur);
				}
				else if(actorMoving == "NONE")
				{
					scene.actors[actorIdx].style.backgroundImage = "url('" + createImagePath(actor) + "')";
				}
				else
				{
					console.log("Unknown actor movement: " + actorMoving);
				}
			break;
			case "ACTOR_FRONT":
				for(let actor of scene.actors){
					if(actor != null){
						actor.style.zIndex = "1";
					}
				}
				scene.actors[data].style.zIndex = "2";
			break
			case "ACTOR_OUT":
				let actorOutIdx = Number(data.split(",")[0]);
				let actorOutPos = data.split(",")[1].trim();
				let actorOutTiming = data.split(",")[2].trim();
				let actorOutDur = Number(data.split(",")[3]);
				animateElement(scene.actors[actorOutIdx], actorOutDur, "fade-out", true, actorOutTiming);
				scene.skippableAnimation = false;
				scene.outActors.push(actorOutIdx);
			break;
			case "ACTOR_PRIORITY":
				let actorArrIdx = data.split(",")[0];
				let actorPriority = data.split(",")[1].trim();
				scene.actors[actorArrIdx].style.zIndex = String(actorPriority);	
			break;
			case "VIDEO_PLAY":
				let filename1 = data.split(",")[0].trim();
				let playbackSpeed = Number(data.split(",")[1]);

				//let video = document.createElement("video");
				//video.classList = "viewer-main-class viewer-video";
				let video = preload.temp[filename1];
				//Set a new class, this also removes the "tempPreloadVideo" preloading class that would otherwise hide this video from displaying
				video.classList="viewer-video";
				video.playbackRate=playbackSpeed; //Default is 1.0
				// This moves the preloaded video from the parent "preload-temp-elem" div, but that's fine
				scene.elements.videoWrapper.appendChild(video);

				video.play();
			break;
			case "VIDEO_STOP":
				let currentVideo=scene.elements.videoWrapper.querySelector("video");
				if(currentVideo)
				{
					currentVideo.pause();
					currentVideo.currentTime=0;

					// Put the video back in the preload wrapper again and give it back it's preload class, because why not
					currentVideo.classList="tempPreloadVideo";
					preload.tempElem.appendChild(currentVideo);
				}
			break;
			case "BG":
				let bgImg = data.split(",")[0].trim();
				let bgMoving = data.split(",")[1].trim();
				let bgDur = Number(data.split(",")[2]);
				let bgElem = scene.alt.bg ? scene.elements.backgroundAlt : scene.elements.background;
				// Seems to be the default value for when it's not specified.
				if(isNaN(bgDur)) bgDur = 1000;
				// Kill any canvas EVs
				killChildren(bgElem);

				if(bgImg.toLowerCase() == "black"){
					scene.elements.background.style.backgroundImage = "";
					scene.elements.backgroundAlt.style.backgroundImage = "";
					// There's nothing to actually animate so instead of
					// wasting peoples time just break;
					break;
				} else {
					bgElem.style.zIndex = "2";
					if(scene.alt.bg){
						scene.elements.background.style.zIndex = "1";
					} else {
						scene.elements.backgroundAlt.style.zIndex = "1";
					}
					scene.alt.bg = !scene.alt.bg
					bgElem.style.backgroundImage = "url('" + createImagePath(bgImg) + "')";
				}
				if(bgMoving != "NONE" && !scene.script[scene.index].includes("<TRANSITION>")){
					animateElement(bgElem, bgDur, "fade-in", true);
					scene.skippableAnimation = false;
				} else {
					bgElem.style.opacity = "1";
				}
			break
			case "BG_OUT":
				if(scene.alt.bg){
					scene.elements.backgroundAlt.style.background = "";
					killChildren(scene.elements.backgroundAlt);

					//If duration is 0, complete it immediately //Addition
					if(data==="0")
					{
						scene.elements.background.style.opacity=0;
					}
					else
					{
						//If the background has already been hidden, do nothing, otherwise the "fade-out" will cause the background to be shown again during the fade out
						if(scene.elements.background.style.opacity!=="0")
						{
							animateElement(scene.elements.background, data, "fade-out", true);
							scene.skippableAnimation = false;
						}
					}

				}
				else
				{
					scene.elements.background.style.background = "";
					killChildren(scene.elements.background);

					//If duration is 0, complete it immediately //Addition
					if(data==="0")
					{
						scene.elements.backgroundAlt.style.opacity=0;
					}
					else
					{
						//If the background has already been hidden, do nothing, otherwise the "fade-out" will cause the background to be shown again during the fade out
						if(scene.elements.backgroundAlt.style.opacity!=="0")
						{
						  animateElement(scene.elements.backgroundAlt, data, "fade-out", true);
							scene.skippableAnimation = false;
						}
					}
				}
				scene.empty.bgs = true;
				
			break;
			case "BGM_PLAY":
				let bgmFade = Number(data.split(",")[1].trim());
				clearInterval(scene.bgmFade);
				scene.current.bgm.pause();
				await loadAudioNow(constructBGMAudioPath(data.split(",")[0].trim()), "bgm");
				switchAudio("bgm", scene.current.bgm, scene.prev.bgm, preload.audio.bgm);
				// scene.current.bgm = preload.temp[data.split(",")[0].trim()];
				scene.current.bgm.volume = prefs.audio.bgmVolume / 100;
				scene.current.bgm.play();
				if(prefs.audio.bgmVolume > 0){
					scene.current.bgm.volume = 0;
					scene.current.bgm.loop = true;
					scene.bgmFade = setInterval(function(){
						if(scene.current.bgm.volume >= prefs.audio.bgmVolume / 100){
							scene.current.bgm.volume = prefs.audio.bgmVolume / 100;
							clearInterval(scene.bgmFade);
						} else {
							let bgmInc = Math.round(((prefs.audio.bgmVolume / 100) / (bgmFade / 100)) * 1000) / 1000;
							// Make sure volume doesn't go over 100%
							scene.current.bgm.volume + bgmInc > prefs.audio.bgmVolume / 100 ? scene.current.bgm.volume = prefs.audio.bgmVolume / 100 : scene.current.bgm.volume += bgmInc;
						}
					}, 100);
				}
			break;
			case "BGM_STOP":
				clearInterval(scene.bgmFade);
				if(scene.current.bgm.volume > 0 && !scene.current.bgm.paused){
					scene.bgmFade = setInterval(function(){
						if(scene.current.bgm.volume > 0){
							let bgmDec = Math.round(((prefs.audio.bgmVolume / 100) / (data / 100)) * 1000) / 1000;
							scene.current.bgm.volume - bgmDec < 0 ? scene.current.bgm.volume = 0 : scene.current.bgm.volume -= bgmDec;
						} else {
							scene.current.bgm.volume = 0;
							scene.current.bgm.pause()
							clearInterval(scene.bgmFade);
						}
					}, 100);
				} else {
					scene.current.bgm.volume = 0;
					scene.current.bgm.pause();
				}
			break;
			case "DEBUG_STOP":
				// 2019/09/12 Appears in Scene 0053_2, just here to stop it
				// logging to console, probably just something that wasn't
				// removed when they were trying to get the scene to work
				// properly
			break;
			case "EFFECT_FLASH":
				if(tlTools.jumping){
					break;
				}
				let flashColor = data.split(",")[0].trim();
				let flashDur = data.split(",")[1].trim();
				let flashElem = scene.alt.flash ? scene.elements.flashAlt : scene.elements.flash;

				// CSS animations need a bit of time to reset so when
				// consecuitive flashes occur the second one won't play.
				// To fix this we just alternate the flash element and
				// by the time it's needed again it will have reset.
				flashElem.style.zIndex = "6";
				if(scene.alt.flash){
					scene.elements.flash.style.zIndex = "5";
				} else {
					scene.elements.flashAlt.style.zIndex = "5";
				}
				scene.alt.flash = !scene.alt.flash;

				flashElem.style.backgroundColor = flashColor;
				animateElement(flashElem, flashDur, "fade-out", true);
			break;
			case "EFFECT_QUAKE":
				if(tlTools.jumping){
					break;
				}
				let quakeAxis = data.split(",")[0].trim();
				let quakeStrength = data.split(",")[1].trim();
				let quakeDur = data.split(",")[2].trim();
				document.documentElement.style.setProperty("--quakeStrength", quakeStrength);
				if(quakeAxis == "HORIZONTAL"){
					animateElement(scene.elements.actors, quakeDur, "quake-horizontal-actor", true, "steps(1)");
					animateElement(scene.elements.backImages, quakeDur, "quake-horizontal-scene", true, "steps(1)");
					scene.skippableAnimation = false;
				} else if(quakeAxis == "VERTICAL"){
					animateElement(scene.elements.actors, quakeDur, "quake-vertical-actor", true, "steps(1)");
					animateElement(scene.elements.backImages, quakeDur, "quake-vertical-scene", true, "steps(1)");
					scene.skippableAnimation = false;
				} else if(quakeAxis == "OVERALL"){
					animateElement(scene.elements.backImages, quakeDur, "quake-overall-scene", true, "steps(1)");
					scene.skippableAnimation = false;
				} else {
					console.log("Unknown quake axis: " + quakeAxis + " needs to be added.")
				}
			break;
			case "EV":

				//If the scene has animations in it, don't run regular EV commands, so ignore this command
				if(scene.animated==="1")
				{
					//console.log("Scene has animations");
					break;
				}

				let ev = data.split(",")[0].trim();
				let evMoving = data.split(",")[1].trim();
				let evDur = data.split(",").length >= 2 ? Number(data.split(",")[2]) : 0;
				let parentElem = scene.alt.bg ? scene.elements.backgroundAlt : scene.elements.background;
				
				// Clear any previous canvases
				killChildren(parentElem);
				let clone = cloneCanvas(preload.canvas[ev]);
				parentElem.appendChild(clone);

				// Bring current canvas to the top
				parentElem.style.zIndex = "2";
				if(scene.alt.bg){
					scene.elements.background.style.zIndex = "1";
				} else {
					scene.elements.backgroundAlt.style.zIndex = "1";
				}
				scene.alt.bg = !scene.alt.bg

				// Animate canvas
				if(evMoving == "IN")
				{
					animateElement(parentElem, evDur, "fade-in", true);
					scene.skippableAnimation = false;
				}
				else if(evMoving == "OUT")
				{
					animateElement(parentElem, evDur, "fade-out", true);
					scene.skippableAnimation = false;
				}
				else
				{
					parentElem.style.opacity = "1";
				}

			  break;
			//Fade in white or black overlay, but do nothing else /Addition
			case "FADE_IN":

				//If the scene has animations in it, don't run regular FADE_IN commands, so ignore this command
				if(scene.animated==="1")
				{
					break;
				}

				let evColor1 = data.split(",")[0].trim();
				let evDur1 = Number(data.split(",")[1]);

				//White overlay
				if(evColor1==="white"){
					animateElement(scene.elements.whiteOverlay, evDur1, "fade-out", true);
				}
				//Black overlay
				else{
					animateElement(scene.elements.blackOverlay, evDur1, "fade-out", true);
				}
				scene.skippableAnimation = false;

				break;
			//Fade in white or black overlay, but do nothing else
			//Used by scenes with animations
			case "FADE_IN2":

				//If the scene doesn't have animations in it, ignore this
				if(scene.animated==="0")
				{
					break;
				}

				let evColor11 = data.split(",")[0].trim();
				let evDur11 = Number(data.split(",")[1]);

				//White overlay
				if(evColor11==="white"){
					animateElement(scene.elements.whiteOverlay, evDur11, "fade-out", true);
				}
				//Black overlay
				else{
					animateElement(scene.elements.blackOverlay, evDur11, "fade-out", true);
				}
				scene.skippableAnimation = false;

				break;
			//Fade out white or black overlay, but do nothing else //Addition
			case "FADE_OUT":

				//If the scene has animations in it, don't run regular FADE_OUT commands, so ignore this command
				if(scene.animated==="1")
				{
					break;
				}

				let evColor2 = data.split(",")[0].trim();
				let evDur2 = Number(data.split(",")[1]);

				//White overlay
				if(evColor2==="white"){
					animateElement(scene.elements.whiteOverlay, evDur2, "fade-in", true);
				}
				//Black overlay
				else{
					animateElement(scene.elements.blackOverlay, evDur2, "fade-in", true);
				}
				scene.skippableAnimation = false;

				break;
			//Fade out white or black overlay, but do nothing else
			//Used by scenes with animations
			case "FADE_OUT2":

				//If the scene doesn't have animations in it, ignore this
				if(scene.animated==="0")
				{
					break;
				}

				let evColor22 = data.split(",")[0].trim();
				let evDur22 = Number(data.split(",")[1]);

				//White overlay
				if(evColor22==="white"){
					animateElement(scene.elements.whiteOverlay, evDur22, "fade-in", true);
				}
				//Black overlay
				else{
					animateElement(scene.elements.blackOverlay, evDur22, "fade-in", true);
				}
				scene.skippableAnimation = false;

				break;
			case "EV_OUT":
				if(scene.alt.bg)
				{
					killChildren(scene.elements.backgroundAlt);
					//If duration is 0, complete it immediately //Addition
					if(data==="0")
					{
						scene.elements.background.style.opacity=0;
					}
					else
					{
						//If the background has already been hidden, do nothing, otherwise the "fade-out" will cause the background to be shown again during the fade out
						if(scene.elements.background.style.opacity!=="0")
						{
							animateElement(scene.elements.background, data, "fade-out", true);
							scene.skippableAnimation = false;
						}
					}
				}
				else
				{
					killChildren(scene.elements.background);
					//If duration is 0, complete it immediately //Addition
					if(data==="0")
					{
						scene.elements.backgroundAlt.style.opacity=0;
					}
					else
					{
						//If the background has already been hidden, do nothing, otherwise the "fade-out" will cause the background to be shown again during the fade out
						if(scene.elements.backgroundAlt.style.opacity!=="0")
						{
							animateElement(scene.elements.backgroundAlt, data, "fade-out", true);
							scene.skippableAnimation = false;
						}
					}
				}
				scene.empty.bgs = true;
			break;
			case "FADE":
				// <FADE>IN, BLACK, 500
				// 2019/09/12 Only used in Scene 0058_2, fades in from a colour
				// It's right at the start of the scene the EV is called
				// before it and has a 3s fade in time, so what happens in the
				// game is you get a 3s fade in and then it flicks back to
				// black just to fade back in 0.5s later, seems like a mistake.
			break;
			case "JUMP":
				scene.index = scene.labels[data];
			break;
			case "LABEL":
				// handled on load
			break;
			case "NAME_PLATE":
				let npText = prefs.scene.tlName ? translateName(data) : data;
				if(scene.empty.textBox){
					scene.elements.textBoxText.innerHTML = "";
					scene.empty.textBox = false;
				}
				/*
				//if npText is just 'name', then it's the players name. Replace it with the users name.
				if(npText==='name'){
					//npText="Hero";
					npText=prefs.viewer.playerName;
				}
				*/
				scene.elements.namePlate.innerHTML = npText;
			break;
			case "PAUSE":
				//debugger;
				if(!scene.script[scene.index].startsWith("<PAUSE>"))
				{
					scene.paused = true;
					scene.empty.textBox = true;

					// Only add text when text has been passed in the script
					// Causes desync in Chapter 027 S02B otherwise
					/*
					if(scene.fill.textBox){
						addRPGXText();
						// Browser reflow is baaaaaaaaaaaaaad
						if(!tlTools.active){
							addToBackLog();
						}
					}
					*/

					if(scene.mode === 1){
						//Auto Mode
						sceneAutoMode();
					} else if (scene.mode === 2){
						//Skip Mode
						scene.nextSkip = setTimeout(function() {
							progressScene();
						}, prefs.scene.skipDelay);
					}
				}
			break;
			case "SCENARIO_END":
				if(tlTools.active){
					// reset instead of stick because although
					// scene.index -= 5 would put us back to the last PAUSE
					// before the scenario end stuff there's always the
					// possibility that someday a script will have an extra
					// command and - 5 won't cut it then boom infinite loop
					// and if the browsers shit it'll crash instead of error
					restartViewer();
				} else if(prefs.scene.playNext){
					if(scene.type == H_RPGX && sceneData[scene.id].nextScene != null){
						clearViewer();
						scene.id = sceneData[scene.id].nextScene
						let part = sceneData[scene.id].SCRIPTS.PART1;
						findTl(part);
						prepareScene();
					} else if(scene.type == STORY_RPGX){
						clearViewer();
						//id, section, part, type
						if(scene.story.part == "A" && scene.story.type != "mini2"){
							scene.story.part = "B";
						} else if((scene.story.section == "S05" && (scene.story.type == "chapter" || scene.story.type == "story")) || (scene.story.section == "S01" && (scene.story.type != "chapter" && scene.story.type != "story"))){
							scene.story.id++;
							if(scene.story.id < chapterOrder.length){
								scene.story.part = "A";
								scene.story.section = "S01";
								scene.story.type = storyData[chapterOrder[scene.story.id]].type;
							} else {
								endScene();
								return;
							}
						} else {
							scene.story.part = "A";
							scene.story.section = "S0" + (Number(scene.story.section.substr(2)) + 1);
						}
						let part = storyData[chapterOrder[scene.story.id]].SECTIONS[scene.story.section][scene.story.part];
						findTl(part);
						prepareScene();
					} else if(prefs.scene.nextRandom){
						clearViewer();
						chooseScene(main.sceneList[Math.floor(Math.random() * main.sceneList.length)]);
					} else {
						endScene();
					}
				} else {
					endScene();
				}
			break;
			case "SE_PLAY":
				if(tlTools.jumping){
					break;
				}
				scene.current.se.pause();
				await loadAudioNow(constructSEAudioPath(data.trim()), "se");
				switchAudio("se", scene.current.se, scene.prev.se, preload.audio.se);
				// scene.current.se = preload.temp[data.trim()];
				scene.current.se.volume = prefs.audio.seVolume / 100;
				scene.current.se.play();
			break;
			//Addition
			case "SE_STOP":
				if(tlTools.jumping){
					break;
				}
				scene.current.se.pause();
			break;
			//Select commands have been modified, so that the command begins with <SELECT> then the text and label comes after, seperated by comma.
			//This assumes there are no commas in the label, which there probably isn't
			//Ex: SELECT>そのまま射精,LABEL1
			case "SELECT":
				//let txt = command.split("<SELECT>")[0];
				//let label = command.split("<SELECT>")[1];
				let txt = data.split(",")[0];
				let label = data.split(",")[1];
				scene.mode = 0;
				toggleOffSceneAutoMode()
				scene.choice = true;
				displayChoice();
				let optBtn = document.createElement("div");
				optBtn.classList = "scene-choice-btn text-stroke";
				//optBtn.innerText = txt;
				optBtn.innerHTML='<div class="scene-choice-btn-mid">'+txt+'</div>';
				optBtn.setAttribute("label", label);
				optBtn.addEventListener("click", function(event){

					//Addition
					event.stopPropagation();

					hideChoice();
					scene.index = scene.labels[this.getAttribute("label")];
					scene.choice = false;
					//debugger;
					if(prefs.scene.straightToAction){
						jumpToAction(false);
					} else {
						progressScene();
					}
				}, false);
				scene.elements.choiceBox.appendChild(optBtn);
				if(scene.script[scene.index].includes("<SELECT>")){
					progressScene();
				}
			break;
			case "TRANSITION":
				let transMask = data.split(",")[0].trim();
				let transDir = data.split(",")[1].trim();
				let transLength = data.split(",")[2].trim();
				let filename = transMask + "_" + transDir;

				scene.transition.vis = transDir == "OUT" ? "hidden" : "initial";

				canvasFromViewer();
				scene.transition.mask = maskData[filename];
				scene.skippableAnimation = false;
				scene.animatingElement = true;
				scene.transition.startTime = Date.now();
				scene.transition.nextDraw = 0;
				clearInterval(scene.transition.interval);
				scene.transition.interval = setInterval(function(){
					let elapsed = Date.now() - scene.transition.startTime;
					if(elapsed < transLength){
						animateTransition(transDir, transLength);
					} else {
						cancelTransition(scene.transition.vis)
						progressScene();
					}
				}, 1000 / 60);
			break;
			case "TXT_CLEAR":
				// Used in Chapter 11-5-B, it's done by default anyway.
			break;
			case "UI_DISP":
				if(!prefs.scene.textBoxUnder){
					let uiDispMode = data.split(",")[0].trim();
					let uiDispDur = data.split(",")[1].trim();
					if(uiDispMode == "ON")
					{
						if(uiDispDur==="0"){
							scene.elements.textBox.style.opacity = "1";
						}	else {
							animateElement(scene.elements.textBox, uiDispDur, "fade-in", true);
						}
					}
					else if(uiDispMode == "OFF")
					{
						if(uiDispDur==="0"){
							scene.elements.textBox.style.opacity = "0";
						}	else {
							animateElement(scene.elements.textBox, uiDispDur, "fade-out", true);
						}
					}
				}
			  break;
			case "VOICE_PLAY":
				if(tlTools.jumping){
					break;
				}
				scene.voicedLine = true;
				scene.current.voice.pause();
				await loadAudioNow(constructVoiceAudioPath(data.trim(), scene.id), "voice");
				switchAudio("voice", scene.current.voice, scene.prev.voice, preload.audio.voice);
				// scene.current.voice = preload.temp[data.trim()];
				scene.current.voice.volume = prefs.audio.voiceVolume / 100;
				scene.current.voice.play();
				scene.voiceDur = Math.round(scene.current.voice.duration * 1000);
				scene.elements.backLogItemVoice.setAttribute("voice", data.trim());
				scene.elements.backLogItemVoice.setAttribute("path", scene.current.voice.src);
			  break;
			case "WAIT":

				//If the scene has animations in it, don't run regular WAIT commands, so ignore this command
				if(scene.animated==="1")
				{
					break;
				}

				if(tlTools.jumping){
					break;
				}
				scene.waitIndex = scene.index;
				scene.waiting = true;
				setTimeout(function() {
					if(scene.waitIndex == scene.index){
						scene.waiting = false;
						processSceneCommand();
					}
				}, data);

				break;

			//Treat spine_wait the same as a regular wait command
			case "SPINE_WAIT":
			case "WAIT2":

					//If the scene doesn't have animations in it, ignore this
					if(scene.animated==="0")
					{
						break;
					}
	
					if(tlTools.jumping){
						break;
					}
					scene.waitIndex = scene.index;
					scene.waiting = true;
					setTimeout(function() {
						if(scene.waitIndex == scene.index){
							scene.waiting = false;
							processSceneCommand();
						}
					}, data);
	
				break;
			case "": //Doesn't have a tag so most likely scene text.
				if(scene.empty.textBox){
					scene.elements.textBoxText.innerHTML = "";
					scene.empty.textBox = false;
				}
				// For when there are multiple legit pauses without any text
				//scene.fill.textBox = true;

				//Add the text directly, addition
				addRPGXText(data);

				if(!tlTools.active){
					addToBackLog();
				}

				if(prefs.scene.copyText && !tlTools.jumping){
					toClipboard();
				}
				//scene.elements.textBoxIcon.style.display = "inherit";

			break;
			default:
				console.log("<" + tag + ">" + " hasn't been added yet, please report it in the thread");
			break;
		}
	}
	scene.commands = [];
	// If the scene's not paused, not animating, not waiting and the animations
	// skippable OR if we're skipping and not paused
	if((!scene.paused && !scene.animatingElement && scene.skippableAnimation && !scene.waiting && !scene.choice) || (scene.mode == 2 && !scene.paused) || tlTools.jumping){
		processSceneCommand();
	}
}

function addRPGXText(txt){
	//let txt = scene.textBuffer[scene.pauseIdx];

	//Replace <param=PlayerName> with the players name from settings, if any exist
	//txt = txt.replace(/<param=PlayerName>/g, prefs.viewer.playerName);
	//Replace hearts (♥) with red ones, if any exist.
	//txt = txt.replace(/♥/g, '<span style="color:#dd2e44;">♥</span>');
	//Replace '\n' with line breaks
	txt = txt.replace(/\\n/g, '<br />');

	if(scene.translated){
		//scene.elements.textBoxText.innerHTML = txt;
	} else {
		if(prefs.scene.furigana){
			if(txt.includes("（")){
				let furi = txt.split("（")[1].split("）")[0];
				let word = furigana.get(furi);
				if(word !== undefined){
					txt = txt.replace(`（${furi}）`, "");
					txt = txt.replace(word, `<ruby>${word}<rt>${furi}</rt></ruby>`);
				}
			}
		}
		//scene.elements.textBoxText.innerHTML = txt;
	}

	//Remove any leading/trailing line breaks
	txt = txt.replace(/^\s*(?:<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>)+\s*$/gi, "");
	//Add text to text box
	scene.elements.textBoxText.innerHTML = txt;

	scene.pauseIdx++;
	//scene.fill.textBox = false;
}

function toClipboard(){
	navigator.clipboard.writeText(scene.elements.textBoxText.innerText.replace(/\n/g, "")).then(function(){
		console.log("Wrote to clipboard");
	}, function(){
		console.log("Failed to write to clipboard");
	});
}

// var lastClipboardText = ""
// function pasteToTextBox(){
// 	let clipboardText
// 	navigator.clipboard.readText().then(
// 		text => scene.elements.textBoxText.innerHTML = text);
// 	// console.log(clipboardText)
// 	// if(lastClipboardText != clipboardText){
// 	// 	console.log("pasting text")
// 	// 	scene.elements.textBoxText.innerHTML = clipboardText;
// 	// 	lastClipboardText = clipboardText;
// 	// }
// }

// var clipboardPasteTest = setInterval(pasteToTextBox, 1000);

function clearViewer(){
	scene.current.bgm.pause();
	scene.current.se.pause();
	scene.current.voice.pause();
	main.view.current = SCENE_SELECT;
	scene.mode = 0;
	clearTimeout(input.touch.heldScene);
	clearTimeout(scene.nextAuto);
	clearTimeout(scene.nextSkip);
	scene.actors = [];
	scene.alt.flash = false;
	scene.alt.bg = false;
	scene.skippableAnimation = true;
	scene.animatingElement = false;
	scene.index = 0;
	scene.paused = false;
	scene.processingGroup = false;
	scene.choice = false;
	scene.newBacklogItem = true;
	scene.backlogOpen = false;
	scene.textBoxHidden = false;
	scene.commands = [];
	scene.textBuffer = [];
	scene.pauseIdx = 0;
	sceneEventCleanup();
	killChildren(main.elements.viewer);
	emptyTempPreload();
}

function findTl(part){
	let translations = part.TRANSLATIONS;
	if(translations != null && prefs.scene.eng){
		for(let translation of translations){
			if(translation.LANGUAGE == scene.language && translation.TRANSLATOR == scene.translator){
				scene.script = translation.SCRIPT;
			} else if(translation.LANGUAGE == scene.language){
				scene.script = translation.SCRIPT;
			} else {
				scene.script = part.SCRIPT;
			}
		}
	} else {
		scene.script = part.SCRIPT;
		scene.translated = false;
	}
}

async function runNecroCommand(){
	if(scene.index >= scene.script.length){
		return;
	}
	let path = `./NecroScenes/${scene.id}`;
	let cmd = scene.script[scene.index];
	let data = cmd.split(",");

	// lines = test.split("\n");
	// for(let line of lines){
	// 	cmds.add(line.split(",")[0]);
	// }

	switch(data[0]){
		case "bg":
			let bgImg = data[1].trim();
			scene.elements.background.style.backgroundImage = `url("${path}/images/${bgImg}.png")`;
			scene.elements.background.style.backgroundSize = "960px 720px";
		break;
		case "bgcolor":
			scene.elements.background.style.backgroundImage = "";
			scene.elements.background.style.background = `rgba(${data[1]},${data[2]},${data[3]},${data[4]},)`
		break;
		case "bgmplay":
			scene.current.bgm.pause();
			await loadAudioNow(`./data/audio/bgm/${data[1].trim()}.m4a`, "bgm");
			switchAudio("bgm", scene.current.bgm, scene.prev.bgm, preload.audio.bgm);
			// scene.current.bgm = preload.temp[data[1].trim()];
			scene.current.bgm.volume = prefs.audio.bgmVolume / 100;
			scene.current.bgm.loop = true;
			scene.current.bgm.play();
		break;
		case "bgmstop":
			scene.current.bgm.pause();
		break;
		case "endof":
			if(prefs.scene.nextRandom){
				clearViewer();
				chooseScene(main.sceneList[Math.floor(Math.random() * main.sceneList.length)]);
			} else {
				endScene();
			}
		break;
		case "fade":
			let fadeDir = data[1].trim().toLocaleLowerCase();
			let fadeColor = data[2].trim().toLocaleLowerCase();
			let fadeDur = Number(data[3]) * 1000;
			let fadeElem = scene.elements.flash;

			// CSS animations need a bit of time to reset so when
			// consecuitive flashes occur the second one won't play.
			// To fix this we just alternate the flash element and
			// by the time it's needed again it will have reset.
			fadeElem.style.zIndex = "6";
			if(scene.alt.flash){
				scene.elements.flash.style.zIndex = "5";
			} else {
				scene.elements.flashAlt.style.zIndex = "5";
			}
			scene.alt.flash = !scene.alt.flash;

			fadeElem.style.backgroundColor = fadeColor;
			if(fadeDir == "in"){
				animateElement(fadeElem, fadeDur, "fade-out", true);
			} else {
				animateElement(fadeElem, fadeDur, "fade-in", true);
			}
		break;
		case "live2d":
		case "live2dmotion":
		case "live2ddelete":
			//lol no
		break;
		case "message":
			necroText(prefs.scene.tlName ? translateName(data[1]) : data[1], data[2]);
			scene.paused = true;
			scene.empty.textBox = true;
			scene.elements.textBoxText.innerHTML = scene.elements.textBoxText.innerHTML.replace(/^\s*(?:<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>)+\s*$/gi, "");

			if(prefs.scene.copyText && !tlTools.jumping){
				toClipboard();
			}
			addToBackLog();
			if(scene.mode === 1){
				//Auto Mode
				sceneAutoMode();
			} else if (scene.mode === 2){
				//Skip Mode
				scene.nextSkip = setTimeout(function() {
					progressScene();
				}, prefs.scene.skipDelay);
			}
		break;
		case "msgvoicesync":
			necroText(prefs.scene.tlName ? translateName(data[2]) : data[2], data[3]);
			await necroVoice(data[5]);
			scene.paused = true;
			scene.empty.textBox = true;
			scene.elements.textBoxText.innerHTML = scene.elements.textBoxText.innerHTML.replace(/^\s*(?:<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>)+\s*$/gi, "");

			if(prefs.scene.copyText && !tlTools.jumping){
				toClipboard();
			}
			addToBackLog();
			if(scene.mode === 1){
				//Auto Mode
				sceneAutoMode();
			} else if (scene.mode === 2){
				//Skip Mode
				scene.nextSkip = setTimeout(function() {
					progressScene();
				}, prefs.scene.skipDelay);
			}
		break;
		case "playmovie":
			scene.elements.video.src = `${path}/videos/${data[1]}.webm`;
			//scene.elements.video = preload.temp[data[1]];
			scene.elements.video.load();
			scene.elements.video.loop = true;
			scene.elements.video.play();
		break;
		case "seplay":
			scene.current.se.pause();
			await loadAudioNow(`./data/audio/se/${data[1].trim()}.m4a`, "se");
			switchAudio("se", scene.current.se, scene.prev.se, preload.audio.se);
			// scene.current.se = preload.temp[data[1].trim()];
			scene.current.se.volume = prefs.audio.seVolume / 100;
			scene.current.se.play();
		break;
		case "shake":
			//Shakes live2d actors
		break;
		case "shakeall":
			let shakeStrength = Number(data[2].trim()) / 100;
			let shakeDur = Number(data[3].trim()) * 1000;
			document.documentElement.style.setProperty("--quakeStrength", shakeStrength);
			animateElement(scene.elements.actors, shakeDur, "quake-vertical-actor", true, "steps(1)");
			animateElement(scene.elements.backImages, shakeDur, "quake-vertical-scene", true, "steps(1)");
			scene.skippableAnimation = false;
		break;
		case "stopmovie":
			scene.elements.video.pause();
			scene.elements.video.removeAttribute('src');
			scene.elements.video.load();
		break;
		case "voice":
			if(!data[1].includes("_i_men")){
				await necroVoice(data[1])
			}
		break;
		case "wait":
			scene.waitIndex = scene.index;
			scene.waiting = true;
			setTimeout(function() {
				if(scene.waitIndex == scene.index){
					scene.waiting = false;
					processSceneCommand();
				}
			}, Number(data[1]) * 1000);
		break;
		case "window":
			if(!prefs.scene.textBoxUnder){
				windowMode = data[1].trim().toLocaleLowerCase();
				windowDur = Number(data[2]) * 1000;
				if(windowMode == "on"){
					animateElement(scene.elements.textBox, windowDur, "fade-in", true);
				} else if(windowMode == "off"){
					animateElement(scene.elements.textBox, windowDur, "fade-out", true);
				}
			}
		break;
		default:
			console.log(`Unkown Tokyo Necro Commad: ${data}`);
		break;
	}

	if((!scene.paused && !scene.animatingElement && scene.skippableAnimation && !scene.waiting && !scene.choice) || (scene.mode == 2 && !scene.paused) || tlTools.jumping){
		processSceneCommand();
	}


	function necroText(name, txt){
		scene.elements.namePlate.innerHTML = name;
		scene.elements.textBoxText.innerHTML = txt;
	}

	async function necroVoice(voice){
		if(!voice.includes("_i_men")){
			scene.voicedLine = true;
			scene.current.voice.pause();
			await loadAudioNow(`./NecroScenes/${scene.id}/voices/${voice}.m4a`, "voice");
			switchAudio("voice", scene.current.voice, scene.prev.voice, preload.audio.voice);
			// scene.current.voice = preload.temp[voice];
			scene.current.voice.volume = prefs.audio.voiceVolume / 100;
			scene.current.voice.play();
			scene.voiceDur = Math.round(scene.current.voice.duration * 1000);
			scene.elements.backLogItemVoice.setAttribute("voice", voice);
			scene.elements.backLogItemVoice.setAttribute("path", scene.current.voice.src);
		}
	}
}

async function runOtogiCommand(){
	if(scene.index >= scene.script.length){
		if(prefs.scene.nextRandom){
			clearViewer();
			chooseScene(main.sceneList[Math.floor(Math.random() * main.sceneList.length)]);
		} else {
			endScene();
		}
		return;
	}
	if(scene.otogiFlashed){
		animateElement(scene.elements.flash, 1000, "fade-out", false);
		scene.otogiFlashed = false;
	}
	let path = `./OtogiScenes/${scene.id.split("_")[1]}`;
	let cmd = scene.script[scene.index];
	scene.elements.namePlate.innerHTML = cmd.Name;
	scene.elements.textBoxText.innerHTML = cmd.Serif
	if(cmd.Voice !== ""){
		scene.voicedLine = true;
		scene.current.voice.pause();
		await loadAudioNow(`${path}/voices/${cmd.Voice}.m4a`, "voice");
		switchAudio("voice", scene.current.voice, scene.prev.voice, preload.audio.voice);
		// scene.current.voice = preload.temp[cmd.Voice];
		scene.current.voice.volume = prefs.audio.voiceVolume / 100;
		scene.current.voice.play();
		scene.voiceDur = Math.round(scene.current.voice.duration * 1000);
		scene.elements.backLogItemVoice.setAttribute("voice", cmd.Voice);
		scene.elements.backLogItemVoice.setAttribute("path", scene.current.voice.src);
	}
	if(cmd.BGM != null){
		scene.current.bgm.pause();
		await loadAudioNow(`./data/audio/bgm/${cmd.BGM}.m4a`, "bgm");
		switchAudio("bgm", scene.current.bgm, scene.prev.bgm, preload.audio.bgm);
		// scene.current.bgm = preload.temp[cmd.BGM];
		scene.current.bgm.volume = prefs.audio.bgmVolume / 100;
		scene.current.bgm.loop = true;
		scene.current.bgm.play();
	}
	//if CharaAnimation change, change EV
	if(scene.elements.video.getAttribute("currentAnim") != cmd.CharaAnimation){
		scene.elements.video.src = `${path}/videos/${cmd.CharaAnimation}.webm`;
		scene.elements.video.setAttribute("currentAnim", cmd.CharaAnimation);
		//scene.elements.video = preload.temp[data[1]];
		scene.elements.video.load();
		scene.elements.video.loop = true;
		scene.elements.video.play();
		if(cmd.CharaAnimation == "3"){
			// Meant to happen with effect 1 but seems to be placed 1 idx down
			scene.otogiFlashed = true;
			scene.elements.flash.style.background = "white";
			animateElement(scene.elements.flash, scene.otogiFlashDur, "otogi-flash", false);
		}
	}
	if(cmd.SE !== ""){
		//none yet
	}
	if(cmd.Effect != null){
		// if(cmd.Effect == "1"){
		// 	scene.otogiFlashed = true;
		// 	scene.elements.flash.style.background = "white";
		// 	animateElement(scene.elements.flash, scene.otogiFlashDur, "otogi-flash", false);
		// }
		if(cmd.Effect == "2"){
			animateElement(scene.elements.video, 500, "fade-in", false);
		}
	}

	scene.paused = true;
	scene.empty.textBox = true;
	scene.elements.textBoxText.innerHTML = scene.elements.textBoxText.innerHTML.replace(/^\s*(?:<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>)+\s*$/gi, "");

	if(prefs.scene.copyText && !tlTools.jumping){
		toClipboard();
	}
	addToBackLog();
	if(scene.mode === 1){
		//Auto Mode
		sceneAutoMode();
	} else if (scene.mode === 2){
		//Skip Mode
		scene.nextSkip = setTimeout(function() {
			progressScene();
		}, prefs.scene.skipDelay);
	}

	if((!scene.paused && !scene.animatingElement && scene.skippableAnimation && !scene.waiting && !scene.choice) || (scene.mode == 2 && !scene.paused) || tlTools.jumping){
		processSceneCommand();
	}
}

async function runTABACommand(){
	if(scene.index == scene.script.length){
		return;
	}

	let cmd = scene.script[scene.index];

	let text = cmd.text; // TXT
	let id = cmd.id; // BG, EV, OV, TXT
	let src = cmd.src; // BG, EV, OV, TXT
	let type = cmd.type; // ALL
	let name = cmd.name; // TXT
	let effect = cmd.effect; // BG, EV, OV, TXT
	let color = cmd.color; // OUT, 
	let msec = cmd.msec; // OUT, WAIT
	let count = cmd.count; // SELECT
	let location = cmd.location; // OV
	let fn;
	if(src){
		fn = src.substr(src.lastIndexOf("/") + 1, src.lastIndexOf(".") - src.lastIndexOf("/") - 1);
	}

	switch(type){
		case "START":
			// Scene started
			scene.paused = false;
		break;
		case "BG":
			if(id == "del"){
				scene.elements.background.style.backgroundImage = "";
				scene.elements.backgroundAlt.style.backgroundImage = "";
			} else {
				let bgElem = scene.alt.bg ? scene.elements.backgroundAlt : scene.elements.background;
				bgElem.style.zIndex = "2";
				if(scene.alt.bg){
					scene.elements.background.style.zIndex = "1";
				} else {
					scene.elements.backgroundAlt.style.zIndex = "1";
				}
				scene.alt.bg = !scene.alt.bg
				bgElem.style.backgroundImage = "url('" + preload.temp[fn].src + "')";
				// Some BGs are tiny so upscale when needed
				bgElem.style.backgroundSize = "contain";
				handleTABAEffect(effect, bgElem);
			}
		break;
		case "OV":
			if(id == "del"){
				for(let elem of scene.elements.actors.children){
					if(effect=="ef01"){
						animateElement(elem, 1000, "fade-out", true);
						let timeout = setTimeout(function(){
							scene.elements.actors.removeChild(elem);
						},1100);
					} else {
						scene.elements.actors.removeChild(elem);
					}
				}
			} else {
				for(let elem of scene.elements.actors.children){
					scene.elements.actors.removeChild(elem);
				}
				let actorContainer = document.createElement("div");
				actorContainer.classList = "actor-taba";
				actorContainer.style.backgroundImage = "url('" + preload.temp[fn].src + "')";
				scene.elements.actors.appendChild(actorContainer);
				handleTABAEffect(effect, actorContainer);
			}
		break;
		case "EV":
			if(id == "black"){
				if(scene.alt.bg){
					scene.elements.backgroundAlt.style.background = "";
					killChildren(scene.elements.backgroundAlt);
					animateElement(scene.elements.background, 1000, "fade-out", true);
				} else {
					scene.elements.background.style.background = "";
					killChildren(scene.elements.background);
					animateElement(scene.elements.backgroundAlt, 1000, "fade-out", true);
				}
				scene.empty.bgs = true;
				scene.skippableAnimation = false;
			} else {
				let bgElem = scene.alt.bg ? scene.elements.backgroundAlt : scene.elements.background;
				bgElem.style.zIndex = "2";
				if(scene.alt.bg){
					scene.elements.background.style.zIndex = "1";
				} else {
					scene.elements.backgroundAlt.style.zIndex = "1";
				}
				scene.alt.bg = !scene.alt.bg
				bgElem.style.backgroundImage = "url('" + preload.temp[fn].src + "')";
				handleTABAEffect(effect, bgElem);
			}
		break;
		case "TXT":
			// Name Plate
			if(name==="del" || (name==="" && text===" ")){
				text = " ";
				if(!prefs.scene.textBoxUnder){
					animateElement(scene.elements.textBox, 1000, "fade-out", true);
					scene.skippableAnimation = true;
					scene.animatingElement = false;
				} else {
					// scene.waitIndex = scene.index;
					// scene.waiting = true;
					// setTimeout(function() {
					// 	if(scene.waitIndex == scene.index){
					// 		scene.waiting = false;
					// 		processSceneCommand();
					// 	}
					// }, 1000);
				}
			} else {
				scene.elements.textBox.style.opacity = "1";
				if(name){
					scene.elements.namePlate.innerHTML = name.replace("【", "").replace("】", "");
				}
				// Voice
				if(src){
					let voicePath = `./TABAScenes/${scene.TABAFolder}/sounds/${src.split("/")[src.split("/").length -1]}`;
					if(voicePath != undefined && !voicePath.includes("non_resource")){
						scene.voicedLine = true;
						scene.current.voice.pause();
						await loadAudioNow(voicePath, "voice");
						switchAudio("voice", scene.current.voice, scene.prev.voice, preload.audio.voice);
						// scene.current.voice = preload.temp[fn];
						scene.current.voice.volume = prefs.audio.voiceVolume / 100;
						scene.current.voice.play();
						scene.voiceDur = Math.round(scene.current.voice.duration * 1000);
						scene.elements.backLogItemVoice.setAttribute("voice", fn);
						scene.elements.backLogItemVoice.setAttribute("path", scene.current.voice.src);
					}
				}

				// Effect
				if(effect){
					if(effect.includes("2") || effect == "ef" && !tlTools.jumping){
						// Only allow the shake effect on TXT
						document.documentElement.style.setProperty("--quakeStrength", 0.5);
				  		animateElement(scene.elements.actors, 500, "quake-horizontal-actor", false, "steps(1)");
						animateElement(scene.elements.backImages, 500, "quake-horizontal-scene", false, "steps(1)");
						scene.skippableAnimation = true;
						//handleTABAEffect(effect)
						//TABATXTEventShake();
					}
				}

				scene.elements.textBoxIcon.style.display = "inherit";
				scene.elements.textBoxText.innerHTML += text.replace(/##/g, "<br />");
				scene.elements.textBoxText.innerHTML = scene.elements.textBoxText.innerHTML.replace(/^\s*(?:<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>)+\s*$/gi, "");
				if(scene.translated && scene.translator == "Nutaku"){
					// Nutaku's line
					// breaks are fucking
					// terrible
					scene.elements.textBoxText.innerHTML = scene.elements.textBoxText.innerHTML.replace(/\<br\>/g, "")
				}

				scene.paused = true;

				if(prefs.scene.copyText){
					toClipboard();
				}

				addToBackLog();	
				
			}

			scene.empty.textBox = true;

			if(scene.mode === 1){
				//Auto Mode
				sceneAutoMode();
			} else if (scene.mode === 2){
				//Skip Mode
				scene.nextSkip = setTimeout(function() {
					if(!scene.choice){
						progressScene()
					}
				}, prefs.scene.skipDelay);
			}
		break;
		case "ERROR UNKNOWN COMMAND":
		break;
		case "OUT":
			if(color == "del"){
				scene.elements.flash.style.backgroundColor = "transparent";
				scene.elements.flashAlt.style.backgroundColor = "transparent";
			} else {
				let flashElem = scene.alt.flash ? scene.elements.flashAlt : scene.elements.flash;
				removeAnimation(flashElem);
				flashElem.style.zIndex = "6";
				if(scene.alt.flash){
					scene.elements.flash.style.zIndex = "5";
				} else {
					scene.elements.flashAlt.style.zIndex = "5";
				}
				scene.alt.flash = !scene.alt.flash;

				flashElem.style.backgroundColor = color;
				animateElement(flashElem, msec, "fade-in", true);
			}
		break;
		case "WAIT":
			if(tlTools.jumping){
				break;
			}
			scene.waitIndex = scene.index;
			scene.waiting = true;
			setTimeout(function() {
				if(scene.waitIndex == scene.index){
					scene.waiting = false;
					processSceneCommand();
				}
			}, msec);
		break;
		case "SELECT":
			if(tlTools.jumping){
				break;
			}
			scene.mode = 0;
			toggleOffSceneAutoMode()
			scene.choice = true;
			for(let i = 1; i<=count; i++){
				let txt = cmd["select"+i];
				let scriptloc = "PART" + (i+1);
				addTABAChoice(txt, scriptloc);
			}
			displayChoice();
		break;
		case "END":
			if(!scene.choice){
				if(prefs.scene.playNext && sceneData[scene.id].nextScene != null){
					clearViewer();
					scene.id = sceneData[scene.id].nextScene;
					let part = sceneData[scene.id].SCRIPTS.PART1;
					scene.TABAFolder = sceneData[scene.id].SCRIPTS.PART1.FOLDER;
					findTl(part);
					prepareScene();
				} else if(prefs.scene.nextRandom){
					clearViewer();
					chooseScene(main.sceneList[Math.floor(Math.random() * main.sceneList.length)]);
					scene.TABAFolder = sceneData[scene.id].SCRIPTS.PART1.FOLDER;
				} else {
					endScene();
				}
			}
		break;
		default:
		break;
	}

	if((!scene.paused && !scene.animatingElement && scene.skippableAnimation && !scene.waiting && !scene.choice) || (scene.mode == 2 && !scene.paused) || tlTools.jumping){
		processSceneCommand();
	}
}

function addToBackLog(){
	scene.elements.backLogItemText.innerHTML = scene.elements.textBoxText.innerHTML;

	scene.elements.backLogItemName.innerHTML = scene.elements.namePlate.innerHTML;

	if(scene.voicedLine){
		scene.elements.backLogItemVoice.addEventListener("click", function(e){
			e.stopPropagation();
			scene.current.voice.pause();
			scene.current.voice.currentTime = 0;
			scene.current.backlogVoice.pause();
			scene.current.backlogVoice.currentTime = 0;
			loadBacklogVoice(this.getAttribute("path"))
			scene.current.backlogVoice.volume = prefs.audio.voiceVolume / 100;
			scene.current.backlogVoice.play();
		},false);
		scene.elements.backlogItem.appendChild(scene.elements.backLogItemVoice);
	}

	scene.elements.backlogItem.appendChild(scene.elements.backLogItemName);
	scene.elements.backlogItem.appendChild(scene.elements.backLogItemText);
	scene.elements.backlog.appendChild(scene.elements.backlogItem);

	// scrollIntoView() scrolls the whole page if it's scrollable
	// so just set scrollTop instead
	scene.elements.backlog.scrollTop = scene.elements.backlog.scrollHeight - 720;

	scene.newBacklogItem = true;
}

function handleTABAEffect(eff, elem=null){
  switch(eff){
  	// Insta Change
  	case "ef00":
  	// C656
  	case "ef00を再度使用します※":
  	// C99, C278
  	case "ef0":
  		// RPGX Viewer does this by default so, not really required.
  	break;
  	// Fade in Image
  	case "ef01":
  	case "01":
  		animateElement(elem, 1000, "fade-in", true);
		scene.skippableAnimation = false;
  	break;
  	// Shake Effect
  	case "ef02":
  	case "ef002":
  	case "02":
  	case "ef2":
  	case "fe02":
  	case "e02":
  	// C30
  	case "ef":
  		document.documentElement.style.setProperty("--quakeStrength", 0.5);
  		animateElement(scene.elements.actors, 500, "quake-horizontal-actor", true, "steps(1)");
		animateElement(scene.elements.backImages, 500, "quake-horizontal-scene", true, "steps(1)");
		scene.skippableAnimation = false;
  	break;
  	// C44
  	case "ef03":
  		// Unknown
  	break;
  	// C147
  	case "ef05":
  	 // Unknown
  	break;
  	default:
  	break;
  }
}

function TABATXTEventShake(){
	let index = scene.index;
	removeAnimation(scene.elements.actors);
	removeAnimation(scene.elements.backImages);
	document.documentElement.style.setProperty("--quakeStrength", 0.5);
	scene.elements.actors.style.animation = "500ms steps(1) running quake-horizontal-actor";
	scene.elements.backImages.style.animation = "500ms steps(1) running quake-horizontal-scene";
	scene.animatedElements.push(scene.elements.actors);
	scene.animatedElements.push(scene.elements.backImages);
	scene.elements.actors.addEventListener("animationend", function waitForAnimationEnd(){
		if(scene.index == index){
			removeAnimation(scene.elements.actors);
			scene.animatedElements.splice(scene.animatedElements.indexOf(scene.elements.actors), 1);
			scene.animatingElement = false;
		}
	}, {once:true, capture:true});
	scene.elements.backImages.addEventListener("animationend", function waitForAnimationEnd(){
		if(scene.index == index){
			removeAnimation(scene.elements.backImages);
			scene.animatedElements.splice(scene.animatedElements.indexOf(scene.elements.backImages), 1);
			scene.animatingElement = false;
		}
	}, {once:true, capture:true});
	scene.animatingElement = true;
}

function addTABAChoice(txt, scriptloc){
	let optBtn = document.createElement("div");
	optBtn.classList = "scene-choice-btn text-stroke";
	optBtn.innerText = txt;
	optBtn.setAttribute("next", scriptloc);
	optBtn.addEventListener("click", function(){
		hideChoice();
		if(scene.translated){
			let translations = sceneData[scene.id].SCRIPTS[this.getAttribute("next")].TRANSLATIONS;
			for(let translation of translations){
				if(translation.LANGUAGE == scene.language && translation.TRANSLATOR == scene.translator){
					scene.script = translation.SCRIPT;
				} else if(translation.LANGUAGE == scene.language){
					scene.script = translation.SCRIPT;
				} else {
					scene.script = sceneData[scene.id].SCRIPTS[this.getAttribute("next")].SCRIPT;
				}
			}
		} else {
			scene.script = sceneData[scene.id].SCRIPTS[this.getAttribute("next")].SCRIPT;
		}
		scene.TABAFolder = sceneData[scene.id].SCRIPTS[this.getAttribute("next")].FOLDER;
		scene.choice = false;
		restartViewer();
		getTABAJumps();
	}, false);
	scene.elements.choiceBox.appendChild(optBtn);
}

function displayChoice(){
	scene.elements.choiceBox.style.visibility = "initial";
	//scene.elements.choiceBox.style.zIndex = "20";
	scene.elements.choiceBox.style.zIndex = "8"; //Change
}

function hideChoice(){
	scene.elements.choiceBox.style.visibility = "hidden";
	scene.elements.choiceBox.style.zIndex = "-10";
	killChildren(scene.elements.choiceBox);
}

function restartViewer(){
	scene.index = 0;
	scene.current.bgm.pause();
	scene.current.se.pause();
	scene.current.voice.pause();
	clearTimeout(input.touch.heldScene);
	clearTimeout(scene.nextAuto);
	clearTimeout(scene.nextSkip);
	scene.actors = [];
	scene.alt.flash = false;
	scene.alt.bg = false;
	scene.skippableAnimation = true;
	scene.animatingElement = false;
	scene.paused = false;
	scene.processingGroup = false;
	scene.choice = false;
	scene.backlogOpen = false;
	scene.textBoxHidden = false;
	scene.pauseIdx = 0;
	sceneEventCleanup();
	killChildren(main.elements.viewer);
	buildSceneViewer();
}

function sceneAutoMode(){
	let sceneAutoWait;
	if(scene.voicedLine){
		// If the scene's voiced and auto mode waits for a voiced line to
		// finish before continuing set the wait time to the remaining time
		// of the voiced line + a small delay
		// otherwise set the wait time to the amount of characters in the text
		// box divided by the CPS set in prefs + a small delay
		sceneAutoWait = prefs.scene.auto.waitVoice ? Math.round((scene.current.voice.duration - scene.current.voice.currentTime) * 1000) + prefs.scene.autoDelay : Math.ceil((scene.elements.textBoxText.innerHTML.replace(/<br>/g, "").length / prefs.scene.auto.cps) * 1000) + prefs.scene.autoDelay;
	} else {
		// (current text / CPS) + auto line delay
		sceneAutoWait = Math.ceil((scene.elements.textBoxText.innerHTML.replace(/<br>/g, "").length / prefs.scene.auto.cps) * 1000) + prefs.scene.autoDelay;
	}
	scene.nextAuto = setTimeout(function(){
			progressScene();
	}, sceneAutoWait);
}

function animateElement(elem, dur, animName, listen, timing = "linear"){
	// if(tlTools.jumping){
	// 	removeAnimation(elem);
	// 	elem.style.cssText += applyAnimationValues(animName);
	// 	return
	// }
	removeAnimation(elem);
	elem.style.animation = dur + "ms " + timing + " running " + animName;
	scene.animatingElement = true;
	elem.style.cssText += applyAnimationValues(animName);
	scene.animatedElements.push(elem);
	if(listen){
		addAnimationListener(elem, scene.index);
	}
}

function addAnimationListener(elem, index){
	// Add a single use event listener to the animated element.
	// If scene.index is equal to the index it was when it was created
	// run the next command.
	// else do nothing as the element was part of a group or the user's
	// skipping. e.g. on 0036 two Felicias fade in at the same time both will
	// fire but only one will run
	elem.addEventListener("animationend", function waitForAnimationEnd(){
		if(scene.index == index){
			removeAnimation(elem);
			scene.animatedElements.splice(scene.animatedElements.indexOf(elem), 1);
			scene.skippableAnimation = true;
			scene.animatingElement = false;
			processSceneCommand();
		}
	}, {once:true, capture:true});
}

function removeAnimation(elem){
	// CSS doesn't let you replay the same animation so we reset it like this.
	elem.style.animation = "none";
	elem.offsetHeight;
	elem.style.animation = null;
}

function applyAnimationValues(animName){
	switch(animName){
		case "glow":
			return "box-shadow: 0 0 20px #fff;"
		break;
		case "fade-in":
		case "fade-in-alt":
		case "otogi-flash":
			return "opacity: 1;"
		break;
		case "fade-out":
		case "fade-out-alt":
			return "opacity: 0;"
		break;
		case "icon-bob":
			return "bottom: 26px;"
		break
		case "overlay-movement":
			return "color: #fff;"
		break;
		case "quake-vertical-actor":
		case "quake-vertical-scene":
			return "top: 0px;"
		break;
		case "quake-horizontal-actor":
		case "quake-horizontal-scene":
			return "left: 0px;"
		break;
		case "quake-overall-scene":
			return "top: 0px; left: 0px;"
		break;
		case "move-actor":
			return "left: " + document.documentElement.style.setProperty("--quakeStrength", quakeStrength);
		break;
		default:
		break;
	}
}

function createActor(fn, pos){
	let actorContainer = document.createElement("div");
	actorContainer.classList = "actor";
	actorContainer.style.backgroundImage = "url('" + preload.temp[fn].src + "')";
	setActorPosition(actorContainer, pos);
	actorContainer.style.transition = "linear 0s";
	return actorContainer;
}

function setActorPosition(actor, pos){
	switch(pos){
		case "RIGHT":
			actor.style.left = "120px";
		break;
		case "LEFT":
			actor.style.left = "-440px";
		break;
		case "CENTER":
			//Game is 1280x760, and sprites are always 1024x1024. (1280-1024)/2=128px on each side
			actor.style.left = "128px";
			//actor.style.left = "0px";
		break;
		default:
			var parts=pos.split("=");
			if(parts[0]==='x')
			{
				var left=parseInt(actor.style.left);
				
				var move_x=-1*(+parts[1]);
				actor.style.left = left+move_x+"px";
			}
		break;
	}
}

function cancelActorMovement(actor){
	actor.style.transition = "none";
}

function canvasFromViewer(){
	if(tlTools.jumping){
		return;
	}
	let bg = scene.alt.bg ? scene.elements.background : scene.elements.backgroundAlt;
	if(bg.children.length > 0){
		let evc = bg.children[0]
		scene.ctx.masked.drawImage(evc, 0, 0);
	} else {
		if(bg.style.opacity != "0"){
			let src = bg.style.backgroundImage.split('"')[1];
			let image = new Image();
			image.onload = function(){
				scene.ctx.masked.drawImage(image, 160, 0, 960, 720, 0, 0, 960, 720);
			}
			image.src = src;
		}
	}
	let drawOrder = []
	for(let actor of scene.actors){
		if(actor == null){
			continue;
		}
		if(actor.style.opacity == "1" && (actor.style.zIndex == "2" || actor.style.zIndex == "")){
			drawOrder.unshift(actor);
		} else if(actor.style.opacity == "1" && actor.style.zIndex == "3"){
			drawOrder.push(actor);
		}
	}
	for(let actor of drawOrder){
		let left = actor.offsetLeft + 160;
		let src = actor.style.backgroundImage.split('"')[1];
		let image = new Image();
		image.onload = function(){
			//scene.ctx.masked.drawImage(image, 160, 40, 960, 720, left, 20, 960, 720);
			scene.ctx.masked.drawImage(image, 0, 0, null, null, 0, 240, null, null);
		}
		image.src = src;
	}
}

function cloneCanvas(toClone){
	let clone = document.createElement("canvas");
	let ctx = clone.getContext("2d");
	clone.height = toClone.height;
	clone.width = toClone.width;
	ctx.drawImage(toClone, 0, 0);
	return clone
}

function animateTransition(dir, length){
	if(tlTools.jumping){
		return;
	}
	let elapsed = Date.now() - scene.transition.startTime;
	if(elapsed >= scene.transition.nextDraw){
		sceneElemVis("hidden");
		// copy the mask instead of referencing it since it needs to be reused
		let maskData = new ImageData(new Uint8ClampedArray(scene.transition.mask.data),scene.transition.mask.width,scene.transition.mask.height);
		let data = maskData.data
		let mod = Math.round((255 / length) * elapsed);
		let gco;
		if(dir == "IN"){
			gco = "source-in";
			for(let i = 0; i < data.length; i += 4){
				data[i+3] = data[i+3] - mod <= 0 ? 255 : 0;
			}
		} else if(dir == "OUT"){
			gco = "source-out";
			for(let i = 0; i < data.length; i += 4){
				data[i+3] = data[i+3] + mod >= 255 ? 255 : 0;
			}
		} else {
			console.log("Unknown Transition Direction")
		}
		scene.ctx.transition.fillStyle = "#000000";
		scene.ctx.transition.fillRect(0, 0, 960, 720);
		scene.ctx.transition.globalCompositeOperation = "source-over";
		scene.ctx.transition.putImageData(maskData, 0, 0);
		scene.ctx.transition.globalCompositeOperation = gco;
		scene.ctx.transition.drawImage(scene.elements.masked, 0, 0);
		// 1000 / Target Frame Rate
		scene.transition.nextDraw += 16;
	}
}

function sceneElemVis(vis){
	scene.elements.background.style.visibility = vis;
	scene.elements.backgroundAlt.style.visibility = vis;
	scene.elements.actors.style.visibility = vis;
}

function cancelTransition(vis){
	clearInterval(scene.transition.interval);
	sceneElemVis(vis);
	scene.ctx.transition.clearRect(0, 0, 960, 720);
	scene.skippableAnimation = true;
	scene.animatingElement = false;
	scene.transition.nextDraw = 0;
	scene.transition.startTime = 0;
}

function normalWidth(string){
	return string.replace(/[\uff01-\uff5e]/g, function(ch){
		return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
	});
}

function translateName(name){
	let append = "";
	if(/[ａ-ｚＡ-Ｚ０-９？]/.test(name)){
		let idx = /[ａ-ｚＡ-Ｚ０-９？]/.exec(name).index;
		append = " " + normalWidth(name.substr(idx));
		name = name.substr(0, idx);
	} else if(/[a-zA-Z0-9]/.test(name)){
		// Some names don't use full width for some reason
		// Seperated because I expect it to fuck up some day
		let idx = /[a-zA-Z0-9]/.exec(name).index;
		append = " " + name.substr(idx);
		name = name.substr(0, idx);
	}
	name = name.trim();
	if(translatedNames.get(name)){
		return translatedNames.get(name) + append;
	} else {
		return name + append;
	}
}

function confirmActorId(img, id){
	let identifier = getIdentifier(img);
	console.log(identifier)
	if(scene.actors[id]){
		if(identifier == getIdentifier(scene.actors[id].style.backgroundImage.split("char/")[1].split(".png")[0])){
			console.log("Correct actor Id");
			return id;
		}
	}
	for(let actor of scene.actors){
		if(identifier == getIdentifier(actor.style.backgroundImage.split("char/")[1].split(".png")[0])){
			console.log("Actor found, Id incorrect, setting to: " + scene.actors.indexOf(actor));
			return scene.actors.indexOf(actor);
		}
	}
	for(let i = 0; i<scene.actors.length + 1; i++){
		if(scene.actors[i] == null){
			console.log("Actor not found, Id taken, setting to: " + i);
			return i;
		}
	}

	function getIdentifier(img){
		let identifier = img.split("_")[0];
		if(identifier == "chr"){
			identifier = img.split("_")[1].substr(0,5);
		} else if(identifier == "ts"){
			identifier = img.split("_")[1].substr(0,4);
		}
		return identifier;
	}
}

// function straightToAction(startIdx = 0){
// 	let lastPause = 0;
// 	for(let[i, cmd] of scene.script.slice(startIdx).entries()){
// 		if(scene.type == H_RPGX){
// 			if(cmd.includes("<PAUSE>")){
// 				lastPause = startIdx + i;
// 			}else if(cmd.includes("<EV>") || cmd.includes("<SELECT>")){
// 				sceneJump(lastPause);
// 				break;
// 			}
// 		} else if(scene.type == H_TABA){
// 			if(cmd.type == "TXT"){
// 				lastPause = startIdx + i;
// 			}else if(cmd.type == "EV" || cmd.type == "SELECT"){
// 				console.log(lastPause);
// 				sceneJump(lastPause);
// 				break;
// 			}
// 		}
// 	}
// 	if(prefs.scene.auto.start){
// 		toggleSceneAutoMode();
// 	} else {
// 		progressScene();
// 	}
// }

function switchAudio(type, aNew, aOld, aPre){
	type = type.toLowerCase();
	scene.current[type] = aPre;
	scene.prev[type] = aNew;
	preload.audio[type] = aOld;
}