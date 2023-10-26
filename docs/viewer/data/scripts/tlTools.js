var tlTools = {
	active:false,
	activeScript:[],
	translatedScript:[],
	originalScript:[],
	blockMap: new Map(),
	bonusScreens:0,
	elements:{

	},
	type:0,
	jumping:false,
	jumpTo:0,
	testing:false,
	save:{
		auto:{
			last:0,
			data:[],
			active:false,
			timer:300,
		},
		manual:{
			last:0,
			data:[]
		}
	}
}

function initTlTools(){
	tlTools.elements.wrap = document.getElementById("tl-tools-wrap");
	tlTools.elements.tools = document.getElementById("tl-tools");
	tlTools.elements.japScript = document.getElementById("tl-tools-jap-script");
	tlTools.elements.tlScript = document.getElementById("tl-tools-translated-script");
	tlTools.elements.tl = document.getElementById("tl-tools-tl");
	tlTools.elements.lang = document.getElementById("tl-tools-lang");
	tlTools.elements.load = document.getElementById("tl-tools-load");
	tlTools.elements.save = document.getElementById("tl-tools-save");
	tlTools.elements.test = document.getElementById("tl-tools-test");
	tlTools.elements.auto = document.getElementById("tl-tools-name-tl");
	tlTools.elements.autoContainer = document.getElementById("name-change-wrap");
	tlTools.elements.nameChangeCancel = document.getElementById("name-change-cancel");
	tlTools.elements.nameChangeConfirm = document.getElementById("name-change-confirm");
	tlTools.elements.nameChangeOpen = document.getElementById("tl-tools-auto-names");
	tlTools.elements.autoSaveCheck = document.getElementById("tl-tools-auto-save");
	tlTools.elements.autoSaveTime = document.getElementById("tl-tools-auto-save-time");

	tlTools.elements.load.value = null;
	tlTools.elements.autoSaveCheck.checked = tlTools.save.auto.active;
	tlTools.elements.autoSaveTime.value = tlTools.save.auto.timer;

	tlTools.elements.japScript.addEventListener("click", function(e){
		let elem = e.target;
		if(elem.matches(".text-block-text") || elem.matches(".text-block-name")){
			let cn = elem.classList[0];
			elem.blur();
			tlTools.elements.tlScript.getElementsByClassName(cn)[Array.prototype.indexOf.call(elem.closest(".text-block").parentNode.children, elem.closest(".text-block"))].focus();
		} else if(elem.matches(".text-block-add")){
			deleteScreen(elem);
		}
	},false);
	tlTools.elements.tlScript.addEventListener("focusin", function(e){
		let elem = e.target;
		let block = Number(elem.closest(".text-block").getAttribute("block"));
		let idx = tlTools.blockMap.get(block);
		if(idx != tlTools.jumpTo && !tlTools.jumping){
			sceneJump(idx);
		} else {
			let blockElem = document.activeElement.closest(".text-block")
			scene.elements.namePlate.innerText = blockElem.getElementsByClassName("text-block-name")[0].value;
			scene.elements.textBoxText.innerText = blockElem.getElementsByClassName("text-block-text")[0].value;
		}
	},false);
	tlTools.elements.tlScript.addEventListener("input", function(e){
		let elem = e.target;
		if(elem.classList.contains("text-block-text")){
			let japPartner = getPartnerElem(elem.closest(".text-block")).children[1];
			scene.elements.textBoxText.innerText = elem.value;
			elem.style.height = "90px";
			japPartner.style.height = "90px";
			if(elem.scrollHeight > 90){
				elem.style.height = elem.scrollHeight + "px";
				japPartner.style.height = elem.scrollHeight + "px";
			}
		} else if(elem.classList.contains("text-block-name")){
			scene.elements.namePlate.innerText = elem.value;
		}
	},false);
	tlTools.elements.tlScript.addEventListener("click", function(e){
		let elem = e.target;
		if(elem.matches(".text-block-add")){
			createExtraScreen(elem);
		}
	},false);

	tlTools.elements.load.addEventListener("change", handleFileSelect, false);

	tlTools.elements.save.addEventListener("click", function(){
		saveTLRPGXScript();
	}, false);

	tlTools.elements.test.addEventListener("click", function(){
		if(tlTools.testing){
			this.value = "Test Script";
			stopScriptTest();
		} else {
			this.value = "Stop Test";
			testScript();
		}
	},false);

	tlTools.elements.nameChangeCancel.addEventListener("click", closeTlNames, false);
	tlTools.elements.nameChangeConfirm.addEventListener("click", fillTlNames, false);
	tlTools.elements.nameChangeOpen.addEventListener("click", createAutoTlScreen, false);

	tlTools.elements.autoSaveCheck.addEventListener("change", function(){
		tlTools.save.auto.active = !tlTools.save.auto.active;
		if(!main.allowCookies){
			return;
		}
		if(tlTools.save.auto.active){
			setAutoSaveInterval();
		} else {
			clearInterval(tlTools.save.auto.interval)
		}
		toLocalStorage("autoSave", tlTools.save.auto.active);
	}, false)

	tlTools.elements.autoSaveTime.addEventListener("blur", function(){
		if(!main.allowCookies){
			return;
		}
		let time = this.value;
		if(!isNaN(time)){
			tlTools.save.auto.timer = Number(time);
			setAutoSaveInterval();
			toLocalStorage("autoSaveTimer", tlTools.save.auto.timer);
		} else {
			this.value = tlTools.save.auto.timer;
		}
	}, false);
}

function setAutoSaveInterval(){
	console.log("Interval Set");
	clearInterval(tlTools.save.auto.interval);
	tlTools.save.auto.interval = setInterval(function(){
		console.log("Auto saved")
		let currentData = createTLRPGXScript();
		if(currentData != tlTools.save.manual.data){
			tlTools.save.auto.data = currentData;
			tlTools.save.auto.last = Date.now();
			toLocalStorage("lastAutoSave", tlTools.save.auto.last);
			toLocalStorage("autoSaveData", tlTools.save.auto.data);
		} else {
			console.log("Data matches, no save");
		}

	}, tlTools.save.auto.timer * 1000)
}

function loadTlTools(tlScript){
	tlTools.active = true;
	killChildren(tlTools.elements.japScript);
	killChildren(tlTools.elements.tlScript);
	if(main.view.current == SCENE_VIEWER){
		tlTools.activeScript = [...scene.script];
		tlTools.translatedScript = tlScript
		tlTools.type = scene.type;
	}
	tlTools.bonusScreens = 0;
	createRPGXTextBlocks(tlTools.activeScript, true);
	createRPGXTextBlocks(tlTools.translatedScript, false);
	placeBlocks();
	scene.elements.textBoxText.style.fontSize = "24px";
	tlTools.elements.wrap.style.display = "flex";
	if(tlTools.save.auto.active){
		setAutoSaveInterval();
	}
}

function createRPGXTextBlocks(script, orig){
	let block = 0;
	let name = "";
	let text = "";
	let voice = "";
	let blockArray = [];
	let screenSide;
	if(orig) {
		screenSide = tlTools.elements.japScript;
	} else {
		screenSide = tlTools.elements.tlScript;
	}
	for(let i = 0; i < script.length; i++){
		let tag = script[i].substr(1, script[i].lastIndexOf(">") -1);
		let data = script[i].includes(">") ? script[i].split(">")[1] : script[i];
		switch(tag){
			case "TL_ADDED_SCREEN":
				if(!orig){
					console.log(script[i])
					//console.log(blockArray.length);
					// tlTools.elements.japScript.insertBefore(createTLScreenNode(blockArray.length - tlTools.bonusScreens), tlTools.elements.japScript.children[blockArray.length]);
					tlTools.elements.japBlocks.splice(block + tlTools.bonusScreens, 0, createTLAddedScreenNode(block-1));
				}
				tlTools.bonusScreens++;
				block--;
			break;
			case "":
				text += data + "\n";
			break;
			case "NAME_PLATE":
				name = data;
			break;
			case "VOICE_PLAY":
				voice = data.trim();
			break;
			case "PAUSE":
				if(orig) {
					tlTools.blockMap.set(block, i);
				}

				let textBlockContainer = document.createElement("div");
				let textBlockText = document.createElement("textarea");
				let textBlockName = document.createElement("input");
				let textBlockVoice = document.createElement("div");
				let textBlockAdd = document.createElement("div");

				textBlockContainer.classList = "text-block";
				textBlockText.classList = "text-block-text";
				textBlockName.classList = "text-block-name";
				textBlockVoice.classList = "text-block-voice";
				textBlockAdd.classList = "text-block-add";


				if(orig){
					textBlockText.readOnly = true;
					textBlockName.readOnly = true;
				}

				textBlockContainer.setAttribute("block", block);

				textBlockText.value = text.trim();
				textBlockName.value = name;
				textBlockVoice.setAttribute("voice", voice);
				textBlockAdd.innerHTML = "Add Screen";

				textBlockContainer.appendChild(textBlockName);
				textBlockContainer.appendChild(textBlockText);
				if(!orig){
					if(voice != ""){
						textBlockContainer.appendChild(textBlockVoice);
					}
					textBlockContainer.appendChild(textBlockAdd);
				}
				blockArray.push(textBlockContainer);

				//textBlockText.style.height = textBlockText.scrollHeight + "px";

				name = "";
				text = "";
				voice = "";
				block++;
			break;
			default:
			break;
		}
	}
	if(orig){
		tlTools.elements.japBlocks = blockArray;
	} else {
		tlTools.elements.tlBlocks = blockArray;
	}
}

function placeBlocks(){
	let blockHeights = getBlockHeights();
	for(let i = 0; i < tlTools.elements.tlBlocks.length; i++){
		if(blockHeights[i] > 90){
			tlTools.elements.tlBlocks[i].children[1].style.height = blockHeights[i] + "px";
			tlTools.elements.japBlocks[i].children[1].style.height = blockHeights[i] + "px";
		}
		tlTools.elements.tlScript.appendChild(tlTools.elements.tlBlocks[i]);
	}
	for(let elem of tlTools.elements.japBlocks){
		tlTools.elements.japScript.appendChild(elem);
	}
}

function getBlockHeights(){
	// Reflows a bitch, this is stupid but doesn't cause lag on script load
	let blockHeights = [];
	for(let block of tlTools.elements.tlBlocks){
		tlTools.elements.tlScript.appendChild(block);
		block.children[1].style.height = "90px";
		blockHeights.push(block.children[1].scrollHeight);
		tlTools.elements.tlScript.removeChild(block)
	}
	return blockHeights;
}

function handleFileSelect(e) {
	let files = e.target.files;
	let reader = new FileReader();

	reader.onload = function(e) {
		let lines = reader.result.split("\n");
		let script = [];
		let tl = "Unset Translator";
		let lang = "Unset Language";
		for(let line of lines){
			if(!line.startsWith("//")){
				script.push(line);
			} else {
				if(line.toUpperCase().includes("TRANSLATOR:")){
					tl = line.split(":")[1];
				} else if(line.toUpperCase().includes("LANGUAGE:")){
					lang = line.split(":")[1];
				}
			}
		}
		tlTools.elements.tl.value = tl;
		tlTools.elements.lang.value = lang;
		loadTlTools(script);
	}

	reader.readAsText(files[0]);
}

function saveTLRPGXScript(script=null){
	tlTools.translatedScript = script != null ? script : createTLRPGXScript();
	let tl = tlTools.elements.tl.value != "" ? tlTools.elements.tl.value : "Unset Translator";
	let lang = tlTools.elements.lang.value != "" ? tlTools.elements.lang.value : "Unset Language";
	let plaintext = "";
	plaintext += "//Language: " + lang + "\n";
	plaintext += "//Translator: " + tl + "\n";
	for(let cmd of tlTools.translatedScript){
		plaintext += cmd + "\n";
	}
	tlTools.save.manual.data = tlTools.translatedScript;
	tlTools.save.manual.last = Date.now();
	toLocalStorage("lastManualSave", tlTools.save.manual.last);
	toLocalStorage("manualSaveData", tlTools.translatedScript);
	download(plaintext, lang + " - " + tl, "attachment/text");
}

function download(data, filename, type) {
	let file = new Blob([data], {type: type});
	let a = document.createElement("a");
	let url = URL.createObjectURL(file);
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);  
	}, 0); 
}

function createTLRPGXScript(){
	let block = -1;
	let blockScript = convertRPGXScriptToBlocks(scene.script);
	let tlScriptBlocks = [];
	let tlScript = [];
	for(let child of tlTools.elements.tlScript.children){
		let curBlock = Number(child.getAttribute("block"));
		let name = child.children[0].value;
		let text = child.children[1].value.split("\n");
		let cmds = blockScript[curBlock];

		if(block != curBlock){
			for(let i = 0; i < cmds.length; i++){
				let cmd = cmds[i];
				let tag = cmd.substr(1, cmd.lastIndexOf(">") -1);
				if(tag == "NAME_PLATE"){
					cmds[i] = "<NAME_PLATE>" + name;
				} else if(tag == ""){
					cmds.splice(i, 1);
					i--;
				}
			}

			for(let line of text){
				let index = cmds.indexOf("<PAUSE>");
				cmds.splice(index, 0, line);
			}

			tlScriptBlocks.push(cmds);
		} else {
			cmds.push("<TL_ADDED_SCREEN>");
			cmds.push("<NAME_PLATE>" + name);
			for(let line of text){
				cmds.push(line);
			}
			cmds.push("<PAUSE>");
		}

		block = curBlock;
	}
	
	for(let block of tlScriptBlocks){
		for(let cmd of block){
			tlScript.push(cmd);
		}
	}

	tlScript.push("<BGM_STOP>3000")
	tlScript.push("<UI_DISP>OFF, 500");
	tlScript.push("<BG_OUT>3000");
	tlScript.push("<SCENARIO_END>");

	return tlScript;
}

function convertRPGXScriptToBlocks(script){
	let full = "";
	for(let cmd of script){
		full += cmd + "\n";
	}

	let blockScript = [];
	let blocks = full.split("<PAUSE>");
	for(let block of blocks){
		block += "<PAUSE>"
		block = block.trim();
		blockScript.push(block.split("\n"));
	}

	return blockScript;
}

function createTLAddedScreenNode(block){
	let textBlockContainer = document.createElement("div");
	let textBlockText = document.createElement("textarea");
	let textBlockName = document.createElement("input");
	let textBlockDel = document.createElement("div");

	textBlockContainer.classList = "text-block";
	textBlockText.classList = "text-block-text";
	textBlockName.classList = "text-block-name";
	textBlockDel.classList = "text-block-add";
	
	textBlockText.value = "\n---   TL ADDED SCREEN   ---\n";
	textBlockDel.innerHTML = "Delete Screen";

	textBlockText.readOnly = true;
	textBlockName.readOnly = true;

	textBlockDel.style.visibility = "initial";
	textBlockDel.style.width = "100px";

	textBlockContainer.appendChild(textBlockName);
	textBlockContainer.appendChild(textBlockText);
	textBlockContainer.appendChild(textBlockDel);
	textBlockContainer.setAttribute("block", block);

	return textBlockContainer;
}

function createExtraScreen(source){
	let directSib = source.closest(".text-block");
	let japSib = getPartnerElem(directSib);
	let newScreen = directSib.cloneNode(true);
	let block = source.getAttribute("block");

	let tlAddedScreen = createTLAddedScreenNode(block);
	newScreen.children[1].value = "";
	
	insertAfter(tlAddedScreen, japSib);
	insertAfter(newScreen, directSib);
}

function getPartnerElem(elem, jap=true){
	return jap ? tlTools.elements.japScript.getElementsByClassName("text-block")[Array.prototype.indexOf.call(elem.parentNode.children, elem)] : tlTools.elements.tlScript.getElementsByClassName("text-block")[Array.prototype.indexOf.call(elem.parentNode.children, elem)];
}

function deleteScreen(source){
	let directSib = source.closest(".text-block");
	let tlSib = getPartnerElem(directSib, false);
	tlTools.elements.tlScript.removeChild(tlSib);
	tlTools.elements.japScript.removeChild(directSib);
}

function insertAfter(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function jumpToBlock(){
	let block = this.getAttribute("block")
	console.log(block)
}

function sceneJump(idx){
	if(scene.index > idx){
		restartViewer();
	}
	tlTools.jumping = true;
	tlTools.jumpTo = idx;
	processSceneCommand();
}

function createAutoTlScreen(){
	killChildren(tlTools.elements.autoContainer);
	let names = new Set();
	for(let child of tlTools.elements.tlScript.children){
		names.add(child.children[0].value);
	}

	names.delete("");
	names = [...names];
	for(let name of names){
		let nameContainer = document.createElement("div");
		let japName = document.createElement("input");
		let arrow = document.createElement("div");
		let tlName = document.createElement("input");

		nameContainer.classList = "name-tl-name-container";

		arrow.innerHTML = "🡆";

		japName.value = name;
		tlName.value = translateName(name);

		nameContainer.appendChild(japName);
		nameContainer.appendChild(arrow);
		nameContainer.appendChild(tlName);
		tlTools.elements.autoContainer.appendChild(nameContainer);
	}

	tlTools.elements.auto.style.visibility = "initial";
}

function fillTlNames(){
	let map = new Map();
	map.set("", "");
	for(let elem of tlTools.elements.autoContainer.children){
		let from = elem.children[0].value;
		let to = elem.children[2].value;
		map.set(from, to);
	}
	for(let elem of tlTools.elements.tlScript.children){
		let name = elem.children[0].value
		elem.children[0].value = map.get(name);
	}
	closeTlNames();
}

function closeTlNames(){
	tlTools.elements.auto.style.visibility = "hidden";
	killChildren(tlTools.elements.autoContainer);
}

function testScript(){
	if(!tlTools.testing){
		tlTools.originalScript = [...scene.script];
		scene.script = createTLRPGXScript();
		tlTools.testing = true;
		restartViewer();
		processSceneCommand();
	}
}

function stopScriptTest(){
	scene.script = tlTools.originalScript;
	tlTools.testing = false;
	restartViewer();
	processSceneCommand();
}

function changesToScript(){
	let change = false;
	let current = createTLRPGXScript();
	for(let i = 0; i < current.length; i++){
		if(current[i] != tlTools.save.manual.data[i]){
			change=true;
		}
	}
	return change;
}

function checkScriptRecovery(){
	let ast = fromLocalStorage("lastAutoSave");
	let asd = fromLocalStorage("autoSaveData");
	let mst = fromLocalStorage("lastManualSave");
	let msd = fromLocalStorage("manualSaveData");
	if(ast > mst && asd != msd){
		recoverScript(asd);
	}
}

function warnUnsavedChanges(){
	unhideAlert();
	main.elements.alertMsg.innerHTML = "Unsaved changes in script.<br/>Continue without saving?";
	let saveBtn = document.createElement("div");
	let discardBtn = document.createElement("div");

	saveBtn.classList = "alert-btn styled-btn";
	discardBtn.classList = "alert-btn styled-btn";

	saveBtn.innerHTML = "Save";
	discardBtn.innerHTML = "Discard";

	saveBtn.addEventListener("click", function(){
		saveTLRPGXScript();
		tlTools.save.auto.last = 0;
		tlTools.save.auto.data = [];
		clearTLToolsData();
		main.elements.alertBox.style.visibility = "hidden";
		killChildren(main.elements.alertOpts);
	}, false);
	discardBtn.addEventListener("click", function(){
		tlTools.save.auto.last = 0;
		tlTools.save.auto.data = [];
		clearTLToolsData();
		main.elements.alertBox.style.visibility = "hidden";
		killChildren(main.elements.alertOpts);
		endScene();
	}, false);

	main.elements.alertOpts.appendChild(discardBtn);
	main.elements.alertOpts.appendChild(saveBtn);
}

function recoverScript(script){
	unhideAlert();
	main.elements.alertMsg.innerHTML = "Recovered unsaved script<br/>Save script?";
	let saveBtn = document.createElement("div");
	let discardBtn = document.createElement("div");

	saveBtn.classList = "alert-btn styled-btn";
	discardBtn.classList = "alert-btn styled-btn";

	saveBtn.innerHTML = "Save";
	discardBtn.innerHTML = "Discard";

	saveBtn.addEventListener("click", function(){
		saveTLRPGXScript(script);
		tlTools.save.auto.last = 0;
		tlTools.save.auto.data = [];
		clearTLToolsData();
		main.elements.alertBox.style.visibility = "hidden";
		killChildren(main.elements.alertOpts);
	}, false);
	discardBtn.addEventListener("click", function(){
		tlTools.save.auto.last = 0;
		tlTools.save.auto.data = [];
		clearTLToolsData();
		main.elements.alertBox.style.visibility = "hidden";
		killChildren(main.elements.alertOpts);
	}, false);

	main.elements.alertOpts.appendChild(discardBtn);
	main.elements.alertOpts.appendChild(saveBtn);
}

function unhideAlert(){
	killChildren(main.elements.alertOpts);
	main.elements.alertBox.style.visibility = "initial";
}

function clearTLToolsData(){
	localStorage.removeItem("autoSaveData");
	localStorage.removeItem("lastAutoSave");
	localStorage.removeItem("manualSaveData");
	localStorage.removeItem("lastManualSave");
}

function toggleTLMode(){
	tlTools.active = !tlTools.active;
	if(tlTools.active){
		main.elements.tlNotice.style.visibility = "initial";
	} else {
		main.elements.tlNotice.style.visibility = "hidden";
	}
}

function toggleOffTLMode(){
	tlTools.active = false;
	main.elements.tlNotice.style.visibility = "hidden";
}