var prefs = {
	scene:{
		eng:true,
		skipAnim:false,
		textBoxUnder:false,
		textBoxFullUnder:false,
		cutVoice:false,
		copyText:false,
		skipDelay:100,
		autoDelay:500,
		stretchTABA:false,
		furigana:false,
		tlName:false,
		straightToAction:false,
		nextRandom:false,
		auto:{
			waitVoice:true,
			cps:30,
			start:false
		}
	},
	cg:{
		randomScene:false,
		randomImg:false,
		shuffleScene:false,
		slideshow:false,
		slideshowWait:3000,
		fadeEffect:false,
	},
	select:{
		columns:4,
		rows:4,
		favourites:[],
		mode:0,
		iddisp:false,
	},
	audio:{
		voiceVolume:80,
		seVolume:60,
		bgmVolume:30
	},
	touch:{
		on:false
	},
	spineAnimation:{
		on:true
	},
	viewer:{
		scale:100,
		fileLoaders:1,
		loadingScreen:false,
		pauseOnFocusLoss:true
		//playerName:"Hero"
	}
}

var opts = {
	scene:{

		auto:{

		}
	},
	cg:{

	},
	select:{

	},
	audio:{

	},
	touch:{

	},
	spineAnimation:{

	},
	viewer:{

	}
}

function initPreferences(){
	opts.scene.eng = document.getElementsByName("scene-eng");
	opts.scene.skipAnim = document.getElementsByName("scene-skip-anim");
	opts.scene.textBoxUnder = document.getElementsByName("scene-text-box-under");
	opts.scene.cutVoice = document.getElementsByName("scene-cut-voice");
	opts.scene.copyText = document.getElementsByName("copy-text");
	opts.scene.tlName = document.getElementsByName("tl-names");
	opts.scene.playNext = document.getElementsByName("play-next");
	opts.scene.straightToAction = document.getElementsByName("straight-to-action");
	opts.scene.auto.waitVoice = document.getElementsByName("scene-auto-voice");
	opts.scene.auto.cps = document.getElementsByName("scene-auto-cps")[0];
	opts.scene.auto.start = document.getElementsByName("scene-start-auto");
	opts.cg.randomScene = document.getElementsByName("cg-random-scene");
	opts.cg.randomImg = document.getElementsByName("cg-random-img");
	opts.cg.shuffleScene = document.getElementsByName("cg-shuffle-scene");
	opts.cg.slideshow = document.getElementsByName("cg-slideshow");
	opts.cg.slideshowWait = document.getElementsByName("cg-slide-wait")[0];
	opts.cg.fadeEffect = document.getElementsByName("cg-fade-effect");
	opts.select.columns = document.getElementsByName("select-columns")[0];
	opts.select.rows = document.getElementsByName("select-rows")[0];
	opts.audio.bgmRange = document.getElementsByName("audio-bgm-range")[0];
	opts.audio.bgmNumber = document.getElementsByName("audio-bgm-number")[0];
	opts.audio.seRange = document.getElementsByName("audio-se-range")[0];
	opts.audio.seNumber = document.getElementsByName("audio-se-number")[0];
	opts.audio.voiceRange = document.getElementsByName("audio-voice-range")[0];
	opts.audio.voiceNumber = document.getElementsByName("audio-voice-number")[0];
	opts.touch.on = document.getElementsByName("touch-support");
	opts.spineAnimation.on = document.getElementsByName("spine-animation");
	opts.viewer.scaleRange = document.getElementsByName("viewer-scale-range")[0];
	opts.viewer.scaleNumber = document.getElementsByName("viewer-scale-number")[0];
	opts.viewer.fileLoaders = document.getElementsByName("viewer-file-loaders")[0];
	opts.viewer.loadingScreen = document.getElementsByName("viewer-loading-screen");
	opts.viewer.pauseOnFocusLoss = document.getElementsByName("pause-on-focus-loss");
	//opts.viewer.playerName = document.getElementsByName("player-name")[0];
	opts.save = document.getElementById("option-save");
	opts.reset = document.getElementById("option-reset");
	opts.cancel = document.getElementById("option-cancel");
	opts.menu = document.getElementById("options");
	if(main.allowCookies){
		loadPreferences();
	}
	setOptionValues();
	addOptionEventListeners();
	setScale();
}

function setScale(){
	document.documentElement.style.setProperty("--viewerScale", prefs.viewer.scale / 100);
	// Scale still applies even if it's at 1.0 and will destroy fine details
	if(prefs.viewer.scale == 100){
		main.elements.html.classList.remove("page-scale");
	} else {
		main.elements.html.classList.add("page-scale");
	}
}

function fromLocalStorage(name){
	return JSON.parse(localStorage.getItem(name));
}

function toLocalStorage(name, value){
	localStorage.setItem(name, JSON.stringify(value));
}

function loadPreferences(){
	if(!main.allowCookies){
		return;
	}
	prefs.select.columns = localStorage.getItem("columns")!==null ? fromLocalStorage("columns") : 4;
	prefs.select.rows = localStorage.getItem("rows")!==null ? fromLocalStorage("rows") : 4;
	prefs.scene.eng = localStorage.getItem("engScripts")!==null ? fromLocalStorage("engScripts") : false;
	prefs.scene.skipAnim = localStorage.getItem("skipAnimations")!==null ? fromLocalStorage("skipAnimations") : false;
	prefs.scene.textBoxUnder = localStorage.getItem("textBoxUnder")!==null ? fromLocalStorage("textBoxUnder") : false;
	prefs.scene.textBoxFullUnder = localStorage.getItem("textBoxFullUnder")!==null ? fromLocalStorage("textBoxFullUnder") : false;
	prefs.audio.bgmVolume = localStorage.getItem("bgmVolume")!==null ? fromLocalStorage("bgmVolume") : 30;
	prefs.audio.seVolume = localStorage.getItem("seVolume")!==null ? fromLocalStorage("seVolume") : 60;
	prefs.audio.voiceVolume = localStorage.getItem("voiceVolume")!==null ? fromLocalStorage("voiceVolume") : 80;
	prefs.scene.auto.waitVoice = localStorage.getItem("sceneAutoWaitVoice")!==null ? fromLocalStorage("sceneAutoWaitVoice") : true;
	prefs.scene.cutVoice = localStorage.getItem("sceneCutVoice")!==null ? fromLocalStorage("sceneCutVoice") : false;
	prefs.scene.copyText = localStorage.getItem("copyText")!==null ? fromLocalStorage("copyText") : false;
	prefs.scene.auto.cps = localStorage.getItem("sceneAutoCPS")!==null ? fromLocalStorage("sceneAutoCPS") : 30;
	prefs.scene.auto.start = localStorage.getItem("sceneStartAuto")!==null ? fromLocalStorage("sceneStartAuto") : false;
	prefs.select.favourites = localStorage.getItem("favourites")!==null ? fromLocalStorage("favourites") : [];
	prefs.cg.randomScene = localStorage.getItem("cgViewRandom")!==null ? fromLocalStorage("cgViewRandom") : false;
	prefs.cg.shuffleScene = localStorage.getItem("cgViewShuffle")!==null ? fromLocalStorage("cgViewShuffle") : false;
	prefs.cg.randomImg = localStorage.getItem("cgViewRandomImg")!==null ? fromLocalStorage("cgViewRandomImg") : false;
	prefs.cg.slideshow = localStorage.getItem("cgViewSlideShow")!==null ? fromLocalStorage("cgViewSlideShow") : false;
	prefs.touch.on = localStorage.getItem("touchSupport")!==null ? fromLocalStorage("touchSupport") : false;
	prefs.spineAnimation.on = localStorage.getItem("spineAnimation")!==null ? fromLocalStorage("spineAnimation") : true;
	prefs.cg.slideshowWait = localStorage.getItem("cgViewSlideShowWait")!==null ? fromLocalStorage("cgViewSlideShowWait") : 3000;
	prefs.select.mode = localStorage.getItem("sceneViewMode")!==null ? fromLocalStorage("sceneViewMode") : true;
	prefs.scene.tlName = localStorage.getItem("tlName")!==null ? fromLocalStorage("tlName") : false;
	prefs.scene.playNext = localStorage.getItem("playNext")!==null ? fromLocalStorage("playNext") : false;
	prefs.scene.straightToAction = localStorage.getItem("straightToAction")!==null ? fromLocalStorage("straightToAction") : false;
	prefs.cg.fadeEffect = localStorage.getItem("cgFadeEffect")!==null ? fromLocalStorage("cgFadeEffect") : false;
	prefs.viewer.scale = localStorage.getItem("viewerScale")!==null ? fromLocalStorage("viewerScale") : 100;
	prefs.viewer.fileLoaders = localStorage.getItem("fileLoaders")!==null ? fromLocalStorage("fileLoaders") : 1;
	prefs.viewer.loadingScreen = localStorage.getItem("loadingScreen")!==null ? fromLocalStorage("loadingScreen") : false;
	prefs.viewer.pauseOnFocusLoss = localStorage.getItem("pauseOnFocusLoss")!==null ? fromLocalStorage("pauseOnFocusLoss") : true;
	//prefs.viewer.playerName = localStorage.getItem("playerName")!==null ? fromLocalStorage("playerName") : 'Hero';

	// Hidden
	prefs.scene.furigana = localStorage.getItem("sceneFurigana")!==null ? fromLocalStorage("sceneFurigana") : false;
	prefs.scene.stretchTABA = localStorage.getItem("stretchTABA")!==null ? fromLocalStorage("stretchTABA") : false;
	prefs.select.iddisp = localStorage.getItem("iddisp")!==null ? fromLocalStorage("iddisp") : false;
	

	// TL Tools
	tlTools.save.auto.active = localStorage.getItem("autoSave")!==null ? fromLocalStorage("autoSave") : true;
	tlTools.save.auto.timer = localStorage.getItem("autoSaveTimer")!==null ? fromLocalStorage("autoSaveTimer") : 30;
}

function setOptionValues(){
	opts.audio.bgmRange.value = prefs.audio.bgmVolume;
	opts.audio.seRange.value = prefs.audio.seVolume;
	opts.audio.voiceRange.value = prefs.audio.voiceVolume;
	opts.audio.bgmNumber.value = prefs.audio.bgmVolume;
	opts.audio.seNumber.value = prefs.audio.seVolume;
	opts.audio.voiceNumber.value = prefs.audio.voiceVolume;
	opts.select.columns.value = prefs.select.columns;
	opts.select.rows.value = prefs.select.rows;
	opts.scene.auto.cps.value = prefs.scene.auto.cps;
	opts.cg.slideshowWait.value = prefs.cg.slideshowWait;
	opts.viewer.scaleRange.value = prefs.viewer.scale;
	opts.viewer.scaleNumber.value = prefs.viewer.scale;
	opts.viewer.fileLoaders.value = prefs.viewer.fileLoaders;
	//opts.viewer.playerName.value = prefs.viewer.playerName;
	if(prefs.scene.eng){
		opts.scene.eng[0].checked = true;
	} else {
		opts.scene.eng[1].checked = true;
	}
	if(prefs.scene.skipAnim){
		opts.scene.skipAnim[0].checked = true;
	} else {
		opts.scene.skipAnim[1].checked = true;
	}
	if(prefs.scene.textBoxUnder){
		opts.scene.textBoxUnder[0].checked = true;
	} else {
		opts.scene.textBoxUnder[1].checked = true;
	}
	if(prefs.scene.auto.waitVoice){
		opts.scene.auto.waitVoice[0].checked = true;
	} else {
		opts.scene.auto.waitVoice[1].checked = true;
	}
	if(prefs.scene.cutVoice){
		opts.scene.cutVoice[0].checked = true;
	} else {
		opts.scene.cutVoice[1].checked = true;
	}
	if(prefs.scene.copyText){
		opts.scene.copyText[0].checked = true;
	} else {
		opts.scene.copyText[1].checked = true;
	}
	if(prefs.scene.auto.start){
		opts.scene.auto.start[0].checked = true;
	} else {
		opts.scene.auto.start[1].checked = true;
	}
	if(prefs.cg.randomScene){
		opts.cg.randomScene[0].checked = true;
	} else {
		opts.cg.randomScene[1].checked = true;
	}
	if(prefs.cg.shuffleScene){
		opts.cg.shuffleScene[0].checked = true;
	} else {
		opts.cg.shuffleScene[1].checked = true;
	}
	if(prefs.cg.randomImg){
		opts.cg.randomImg[0].checked = true;
	} else {
		opts.cg.randomImg[1].checked = true;
	}
	if(prefs.cg.slideshow){
		opts.cg.slideshow[0].checked = true;
	} else {
		opts.cg.slideshow[1].checked = true;
	}
	if(prefs.touch.on){
		opts.touch.on[0].checked = true;
	} else {
		opts.touch.on[1].checked = true;
	}
	if(prefs.spineAnimation.on){
		opts.spineAnimation.on[0].checked = true;
	} else {
		opts.spineAnimation.on[1].checked = true;
	}
	if(prefs.scene.tlName){
		opts.scene.tlName[0].checked = true;
	} else {
		opts.scene.tlName[1].checked = true;
	}
	if(prefs.scene.playNext){
		opts.scene.playNext[0].checked = true;
	} else {
		opts.scene.playNext[1].checked = true;
	}
	if(prefs.scene.straightToAction){
		opts.scene.straightToAction[0].checked = true;
	} else {
		opts.scene.straightToAction[1].checked = true;
	}
	if(prefs.cg.fadeEffect){
		opts.cg.fadeEffect[0].checked = true;
	} else {
		opts.cg.fadeEffect[1].checked = true;
	}
	if(prefs.viewer.loadingScreen){
		opts.viewer.loadingScreen[0].checked = true;
	} else {
		opts.viewer.loadingScreen[1].checked = true;
	}
	if(prefs.viewer.pauseOnFocusLoss){
		opts.viewer.pauseOnFocusLoss[0].checked = true;
	} else {
		opts.viewer.pauseOnFocusLoss[1].checked = true;
	}

}

function addOptionEventListeners(){
	opts.audio.bgmRange.addEventListener("input", function(){
		opts.audio.bgmNumber.value = opts.audio.bgmRange.value;
		scene.current.bgm.volume = Number(opts.audio.bgmRange.value) / 100;
	},true);
	opts.audio.bgmNumber.addEventListener("input", function(){
		opts.audio.bgmRange.value = opts.audio.bgmNumber.value;
	},true);
	opts.audio.seRange.addEventListener("input", function(){
		opts.audio.seNumber.value = opts.audio.seRange.value;
		scene.current.se.volume = Number(opts.audio.seRange.value) / 100;
	},true);
	opts.audio.seNumber.addEventListener("input", function(){
		opts.audio.seRange.value = opts.audio.seNumber.value;
	},true);
	opts.audio.voiceRange.addEventListener("input", function(){
		opts.audio.voiceNumber.value = opts.audio.voiceRange.value;
		scene.current.voice.volume = Number(opts.audio.voiceRange.value) / 100;
	},true);
	opts.audio.voiceNumber.addEventListener("input", function(){
		opts.audio.voiceRange.value = opts.audio.voiceNumber.value;
	},true);
	opts.audio.bgmRange.addEventListener("change", function(){
		if(opts.audio.bgmRange.value > 100){
			opts.audio.bgmRange.value = 100;
		} else if(opts.audio.bgmRange.value < 0){
			opts.audio.bgmRange.value = 0;
		}
		opts.audio.bgmNumber.value = opts.audio.bgmRange.value;
	},true);
	opts.audio.bgmNumber.addEventListener("change", function(){
		if(opts.audio.bgmNumber.value > 100){
			opts.audio.bgmNumber.value = 100;
		} else if(opts.audio.bgmNumber.value < 0){
			opts.audio.bgmNumber.value = 0;
		}
		opts.audio.bgmRange.value = opts.audio.bgmNumber.value;
	},true);
	opts.audio.seRange.addEventListener("change", function(){
		if(opts.audio.seRange.value > 100){
			opts.audio.seRange.value = 100;
		} else if(opts.audio.seRange.value < 0){
			opts.audio.seRange.value = 0;
		}
		opts.audio.seNumber.value = opts.audio.seRange.value;
	},true);
	opts.audio.seNumber.addEventListener("change", function(){
		if(opts.audio.seNumber.value > 100){
			opts.audio.seNumber.value = 100;
		} else if(opts.audio.seNumber.value < 0){
			opts.audio.seNumber.value = 0;
		}
		opts.audio.seRange.value = opts.audio.seNumber.value;
	},true);
		opts.audio.voiceRange.addEventListener("change", function(){
		if(opts.audio.voiceRange.value > 100){
			opts.audio.voiceRange.value = 100;
		} else if(opts.audio.voiceRange.value < 0){
			opts.audio.voiceRange.value = 0;
		}
		opts.audio.voiceNumber.value = opts.audio.voiceRange.value;
	},true);
	opts.audio.voiceNumber.addEventListener("change", function(){
		if(opts.audio.voiceNumber.value > 100){
			opts.audio.voiceNumber.value = 100;
		} else if(opts.audio.voiceNumber.value < 0){
			opts.audio.voiceNumber.value = 0;
		}
		opts.audio.voiceRange.value = opts.audio.voiceNumber.value;
	},true);
	opts.viewer.scaleRange.addEventListener("input", function(){
		opts.viewer.scaleNumber.value = opts.viewer.scaleRange.value;
	},true);
	opts.viewer.scaleNumber.addEventListener("input", function(){
		opts.viewer.scaleRange.value = opts.viewer.scaleNumber.value;
	},true);
	opts.save.addEventListener("click", function(){
		checkChanges();
		savePreferences();
		opts.menu.style.display = "none";
		main.view.current = main.view.prev;
	}, true);
	opts.reset.addEventListener("click", defaultPreferences, true);
	opts.cancel.addEventListener("click", function(){
		scene.current.bgm.volume = prefs.audio.bgmVolume / 100;
		scene.current.se.volume = prefs.audio.seVolume / 100;
		scene.current.voice.volume = prefs.audio.voiceVolume / 100;
		setOptionValues();
		opts.menu.style.display = "none";
		main.view.current = main.view.prev;
	}, true);
}

function checkChanges(){
	if(Number(opts.select.columns.value) != prefs.select.columns || Number(opts.select.rows.value) != prefs.select.rows){
		prefs.select.columns = Number(opts.select.columns.value);
		prefs.select.rows = Number(opts.select.rows.value);
		realignSceneSelect();
		constructSceneSelect();
	}
	if(!prefs.scene.textBoxUnder && opts.scene.textBoxUnder[0].checked && main.view.prev == 2){
		stretchFrame();
	} else if(prefs.scene.textBoxUnder && !opts.scene.textBoxUnder[0].checked && main.view.prev == 2){
		contractFrame();
	}
}

function realignSceneSelect(){
	let curScene = document.getElementsByClassName("cursor-active")[0].getAttribute("sceneId");
	let idx = main.sceneList.indexOf(curScene);
	if(idx > -1){
		let pp = prefs.select.columns * prefs.select.rows;
		sceneSelect.page = Math.floor(idx / pp);
		sceneSelect.cursor = idx % pp;
	} else {
		sceneSelect.page = 0;
		sceneSelect.cursor = 0;
	}
}

function defaultPreferences(){

	if(prefs.scene.textBoxUnder && opts.scene.textBoxUnder[0].checked && main.view.prev == 2){
		contractFrame();
	}

	// Select
	prefs.select.columns = 4;
	prefs.select.rows = 4;
	prefs.select.mode = true;
	// Select - Hidden
	prefs.select.iddisp = false;

	// Scene
	prefs.scene.eng = false;
	prefs.scene.skipAnim = false;
	prefs.scene.textBoxUnder = false;
	prefs.scene.textBoxFullUnder = false;
	prefs.scene.cutVoice = false;
	prefs.scene.copyText = false;
	prefs.scene.tlName = false;
	prefs.scene.playNext = false;
	prefs.scene.straightToAction = false;

	// Scene - Auto
	prefs.scene.auto.cps = 30;
	prefs.scene.auto.waitVoice = true;
	prefs.scene.auto.start = false;
	// Scene - Hidden
	prefs.scene.furigana = false;
	prefs.scene.stretchTABA = false;
	prefs.scene.skipDelay = 100;
	prefs.scene.autoDelay = 500;

	// CG
	prefs.cg.randomImg = false;
	prefs.cg.shuffleScene = false;
	prefs.cg.randomScene = false;
	prefs.cg.slideshow = false;
	prefs.cg.slideshowWait = 3000;
	prefs.cg.fadeEffect = false;

	// Audio
	prefs.audio.bgmVolume = 30;
	prefs.audio.seVolume = 60;
	prefs.audio.voiceVolume = 80;

	//Touch
	prefs.touch.on = false;

	//Spine animation
	prefs.spineAnimation.on = true;

	// Misc
	prefs.viewer.scale = 100;
	prefs.viewer.fileLoaders = 1;
	prefs.viewer.loadingScreen = false;
	prefs.viewer.pauseOnFocusLoss = true;
	//prefs.viewer.playerName = "Hero";

	setOptionValues();
	checkChanges();
	savePreferences();
	constructSceneSelect();
}

function savePreferences(){
	prefs.select.columns = Number(opts.select.columns.value) > 0 ? Number(opts.select.columns.value) : prefs.select.columns;
	prefs.select.rows = Number(opts.select.rows.value) > 0 ? Number(opts.select.rows.value) : prefs.select.rows;
	prefs.scene.eng = opts.scene.eng[0].checked;
	prefs.scene.skipAnim = opts.scene.skipAnim[0].checked;
	prefs.scene.textBoxUnder = opts.scene.textBoxUnder[0].checked;
	prefs.audio.bgmVolume = opts.audio.bgmRange.value;
	prefs.audio.seVolume = opts.audio.seRange.value;
	prefs.audio.voiceVolume = opts.audio.voiceRange.value;
	prefs.scene.auto.waitVoice = opts.scene.auto.waitVoice[0].checked;
	prefs.scene.cutVoice = opts.scene.cutVoice[0].checked;
	prefs.scene.copyText = opts.scene.copyText[0].checked;
	prefs.scene.auto.cps = Number(opts.scene.auto.cps.value) > 0 ? Number(opts.scene.auto.cps.value) : prefs.scene.auto.cps;
	prefs.scene.auto.start = opts.scene.auto.start[0].checked;
	prefs.cg.randomScene = opts.cg.randomScene[0].checked;
	prefs.cg.shuffleScene = opts.cg.shuffleScene[0].checked;
	prefs.cg.randomImg = opts.cg.randomImg[0].checked;
	prefs.cg.slideshow = opts.cg.slideshow[0].checked;
	prefs.cg.slideshowWait = Number(opts.cg.slideshowWait.value) > 0 ? Number(opts.cg.slideshowWait.value) : prefs.scene.auto.cps;
	prefs.touch.on = opts.touch.on[0].checked;
	prefs.spineAnimation.on = opts.spineAnimation.on[0].checked;
	prefs.scene.tlName = opts.scene.tlName[0].checked;
	prefs.scene.playNext = opts.scene.playNext[0].checked;
	prefs.scene.straightToAction = opts.scene.straightToAction[0].checked;
	prefs.cg.fadeEffect = opts.cg.fadeEffect[0].checked;
	prefs.viewer.scale = opts.viewer.scaleRange.value;
	prefs.viewer.fileLoaders = opts.viewer.fileLoaders.value;
	prefs.viewer.loadingScreen = opts.viewer.loadingScreen[0].checked;
	prefs.viewer.pauseOnFocusLoss = opts.viewer.pauseOnFocusLoss[0].checked;
	//prefs.viewer.playerName = opts.viewer.playerName.value;

	setScale();

	if(!main.allowCookies){
		return;
	}

	toLocalStorage("columns", prefs.select.columns);
	toLocalStorage("rows", prefs.select.rows);
	toLocalStorage("engScripts", prefs.scene.eng);
	toLocalStorage("skipAnimations", prefs.scene.skipAnim);
	toLocalStorage("textBoxUnder", prefs.scene.textBoxUnder);
	toLocalStorage("textBoxFullUnder", prefs.scene.textBoxFullUnder);
	toLocalStorage("bgmVolume", prefs.audio.bgmVolume);
	toLocalStorage("seVolume", prefs.audio.seVolume);
	toLocalStorage("voiceVolume", prefs.audio.voiceVolume);
	toLocalStorage("sceneAutoWaitVoice", prefs.scene.auto.waitVoice);
	toLocalStorage("sceneCutVoice", prefs.scene.cutVoice);
	toLocalStorage("copyText", prefs.scene.copyText);
	toLocalStorage("sceneAutoCPS", prefs.scene.auto.cps);
	toLocalStorage("sceneStartAuto", prefs.scene.auto.start);
	toLocalStorage("cgViewRandom", prefs.cg.randomScene);
	toLocalStorage("cgViewShuffle", prefs.cg.shuffleScene);
	toLocalStorage("cgViewRandomImg", prefs.cg.randomImg);
	toLocalStorage("cgViewSlideShow", prefs.cg.slideshow);
	toLocalStorage("cgViewSlideShowWait", prefs.cg.slideshowWait);
	toLocalStorage("touchSupport", prefs.touch.on);
	toLocalStorage("spineAnimation", prefs.spineAnimation.on);
	toLocalStorage("tlName", prefs.scene.tlName);
	toLocalStorage("playNext", prefs.scene.playNext);
	toLocalStorage("straightToAction", prefs.scene.straightToAction);
	toLocalStorage("cgFadeEffect", prefs.cg.fadeEffect);
	toLocalStorage("sceneFurigana", prefs.scene.furigana);
	toLocalStorage("stretchTABA", prefs.scene.stretchTABA);
	toLocalStorage("viewerScale", prefs.viewer.scale);
	toLocalStorage("fileLoaders", prefs.viewer.fileLoaders);
	toLocalStorage("loadingScreen", prefs.viewer.loadingScreen);
	toLocalStorage("pauseOnFocusLoss", prefs.viewer.pauseOnFocusLoss);
	//toLocalStorage("playerName", prefs.viewer.playerName);
	toLocalStorage("iddisp", prefs.select.iddisp);
}