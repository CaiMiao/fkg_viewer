var main = {
	allowCookies:checkCookie(),
	sceneList:[],
	view:{
		current:1,
		prev:1
	},
	elements:{
		head:{

		},
		foot:{

		},
		options:{

		}
	},
	data:{
		H_RPGX:false,
		H_TABA:false,
		H_NECRO:false,
		H_OTOGI:false,
		STORY_RPGX:false,
		STORY_TABA:false
	},
	pause:{
		auto:false,
		slideshow:false,
		voice:false,
		bgm:false,
		se:false
	},
	info:{
		rpgx_h:{
			date:"",
			desc:"Flower knight girl Viewer 1.0",
		},
		rpgx_story:{
			date:"< 2020-08-18",
			desc:"No update since 2020-08-18",
		},
		taba_h:{
			date:"< 2020-08-18",
			desc:"No update since 2020-08-18",
		},
		necro_h:{
			date:"< 2020-08-18",
			desc:"No update since 2020-08-18",
		},
		otogi_h:{
			date:"< 2021-01-15",
			desc:"No update since 2021-01-15",
		}
	}
};

window.onfocus = function(){
	if(!prefs.viewer.pauseOnFocusLoss){
		return;
	}
	if(main.pause.auto){
		toggleSceneAutoMode();
	}
	if(main.pause.slideshow){
		toggleSlideShow();
	}
	if(main.pause.voice){
		scene.current.voice.play();
	}
	if(main.pause.bgm){
		scene.current.bgm.play();
	}
	if(main.pause.se){
		scene.current.se.play();
	}
}

window.onblur = function(){
	main.pause.auto = false;
	main.pause.slideshow = false;
	main.pause.voice = false;
	main.pause.bgm = false;
	main.pause.se = false;
	if(!prefs.viewer.pauseOnFocusLoss){
		return;
	}
	if(scene.mode == 1){
		main.pause.auto = true;
		toggleOffSceneAutoMode();
	}
	if(cgViewer.slideshow){
		main.pause.slideshow = true;
		toggleOffSlideShow();
	}
	if(!scene.current.voice.paused){
		main.pause.voice = true;
		scene.current.voice.pause();
	}
	if(!scene.current.bgm.paused){
		main.pause.bgm = true;
		scene.current.bgm.pause();
	}
	if(!scene.current.se.paused){
		main.pause.se = true;
		scene.current.se.pause();
	}
	toggleOffSceneSkipping();
}

window.onload = function() {
	main.elements.loadingWrap = document.getElementById("loading-wrap");
	main.elements.loadingFile = document.getElementById("loading-file");
	main.elements.loadingProgress = document.getElementById("loading-progress");
	main.elements.loadingError = document.getElementById("loading-error");
	main.elements.loadingErrorMsg = document.getElementById("loading-error-msg");
	main.elements.loadingErrorBtn = document.getElementById("loading-error-btn");
	main.elements.loadingErrorBtn.addEventListener("click", closeError);

	let permPreloadUI = ["background_border","textbox","textbox4","arrow_left_icon","arrow_right_icon","chara","checkbox","checkbox_checked","Cmn_poppup_frm_s","Cmn_trust_icon_on","Eve_raid_top_btn_ep","Eve_raid_top_btn_pro","log_button_voice","menu_close_button","menu_option_off_left","menu_option_off_mid","menu_option_off_right","menu_option_on_left","menu_option_on_mid","menu_option_on_right","normalquest_section_radar_eff","off_button_active","off_button_inactive","on_button_active","on_button_inactive","pc_game_frm","pc_game_frm_big","progress_1","progress_2","Quest_capter_frm1","Quest_capter_frm_off","Quest_capter_frm_on","Quest_section_base1","Quest_section_cell_base","Quest_section_cell_difficulty3_afoot","Quest_section_number1_off","Quest_section_number2_off","Quest_section_number3_off","Quest_section_number4_off","Quest_section_number5_off","Scene_name_base1","Scene_text_base1","Scene_text_icon_edn1","Scene_text_icon_edn3_eff","Scene_text_icon_edn4_eff","slider_handle","Title_load_gauge_font_1","Title_load_gauge_font_2","Scene_choices_base"];
	for(let i = 0; i < permPreloadUI.length; i++){
		permPreloadUI[i] = "./data/ui/" + permPreloadUI[i] + ".png";
	}
	//Preload jpg files
	permPreloadUI.push("./data/ui/BG1.jpg");
	permPreloadUI.push("./data/ui/BG_TITLE1.jpg");

	permPreload(permPreloadUI);
	main.elements.html = document.getElementsByTagName("html")[0];
	main.elements.viewer = document.getElementById("scene-viewer");
	main.elements.sceneSelect = document.getElementById("scene-select");
	main.elements.storySelect = document.getElementById("story-select");
	main.elements.cgWrapper = document.getElementById("cg-wrapper");
	main.elements.searchMenu = document.getElementById("search");
	main.elements.controlsMenu = document.getElementById("controls");
	main.elements.pageNumber = document.getElementById("page-number");
	main.elements.tlChoiceBox = document.getElementById("tl-choice-box");
	main.elements.canvasHoldElem = document.getElementById("canvas-hold");
	main.elements.spineViewersHoldElem = document.getElementById("spine-viewers-hold");
	main.elements.contents = document.getElementById("content");
	main.elements.header = document.getElementById("header");
	main.elements.footer = document.getElementById("footer");
	main.elements.head.controls = main.elements.header.children[0];
	main.elements.head.options = main.elements.header.children[1];
	main.elements.head.search = main.elements.header.children[2];
	main.elements.foot.exit = main.elements.footer.children[0];
	main.elements.foot.skip = main.elements.footer.children[1];
	main.elements.foot.auto = main.elements.footer.children[2];
	main.elements.foot.mode = main.elements.footer.children[3];
	main.elements.alertBox = document.getElementById("alert-box");
	main.elements.alertMsg = document.getElementById("alert-msg");
	main.elements.alertOpts = document.getElementById("alert-opts");
	main.elements.tlNotice = document.getElementById("tl-mode-notice");
	//hideScrollBars();
	main.elements.contents.addEventListener("transitionend", function(){
		if(parseInt(main.elements.contents.style.height) > 720){
			//main.elements.contents.style.backgroundImage = "url('./data/ui/pc_game_frm_big.png')";
		}else{
			//main.elements.contents.style.backgroundImage = "url('./data/ui/pc_game_frm.png')";
		}
	}, true);
	main.elements.viewer.addEventListener("transitionend", function(){
		if(main.elements.viewer.style.opacity < 1){
			main.elements.viewer.style.zIndex = "0";
		}
	}, true);
	killChildren(main.elements.viewer);
	checkData();
	initPreferences();
	initMeta();
	//initFiles();
	initUserInput();
	//mergeSceneData();
	initSearch();
	if(main.data.H_RPGX || main.data.H_TABA){
		fillSceneList();
		constructSceneSelect();
	}
	if(main.data.STORY_RPGX){
		initStorySelect();
	}
	initPreload();
	initTlTools();
	//createAutocompleteData();
	setScreen();
	checkScriptRecovery();
}

function setScreen(){
	if(main.data.H_RPGX || main.data.H_TABA){
		main.elements.storySelect.style.display = "none";
	} else if(main.data.STORY_RPGX){
		main.elements.storySelect.style.display = "initial"
	}
	loadSceneSelect();
}

function checkData(){
	if(typeof sceneData !== "undefined"){
		main.data.H_RPGX = true;
		console.log(`Flower knight girl H Scenes\nDescription: ${main.info.rpgx_h.desc}`);
	}
	if(typeof TABAData !== "undefined"){
		main.data.H_TABA = true;
		console.log(`TABA H Scenes\nDate: ${main.info.taba_h.date}\nDescription: ${main.info.taba_h.desc}`);
	}
	if(typeof NecroData !== "undefined"){
		main.data.H_NECRO = true;
		console.log(`Tokyo Necro H Scenes\nDate: ${main.info.necro_h.date}\nDescription: ${main.info.necro_h.desc}`);
	}
	if(typeof OtogiData !== "undefined"){
		main.data.H_OTOGI = true;
		console.log(`Otogi Frontier H Scenes\nDate: ${main.info.otogi_h.date}\nDescription: ${main.info.otogi_h.desc}`);
	}
	if(typeof storyData !== "undefined"){
		main.data.STORY_RPGX = true;
		console.log(`RPGX Story Scenes\nDate: ${main.info.rpgx_story.date}\nDescription: ${main.info.rpgx_story.desc}`);
	}
}

function stretchFrame(){
	if(prefs.scene.textBoxFullUnder){
		main.elements.contents.style.height = "901px"
		main.elements.contents.style.backgroundSize = "1002px 948px"
	} else {
		//main.elements.contents.style.height = "871px"
		//main.elements.contents.style.backgroundSize = "1002px 918px"
		main.elements.contents.classList.add("stretch");
		//prefs.scene.elements.textBox.style.marginBottom="1px";
	}
}

function contractFrame(){
	//main.elements.contents.style.height = "720px"
	//main.elements.contents.style.backgroundSize = "1002px 768px"
	main.elements.contents.classList.remove("stretch");
	//prefs.scene.elements.textBox.style.marginBottom="16px";
}

function killChildren(elem) {
	//AMERICA NO!
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild);
	}
}

function loadSceneSelect(){
	main.elements.viewer.style.opacity = "0"
	if(prefs.scene.textBoxUnder){
		contractFrame();
	}
	if(main.elements.storySelect.style.display == "initial"){
		main.view.current = STORY_SELECT;
	} else {
		main.view.current = SCENE_SELECT;
	}
	switchView();
}

function switchSelectScreen(){
	if(main.view.current == SCENE_SELECT && main.data.STORY_RPGX){
		main.elements.sceneSelect.style.display = "none"
		main.elements.storySelect.style.display = "initial"
		main.elements.foot.auto.innerHTML = "Select: Story";
		main.view.current = STORY_SELECT;
	} else if(main.view.current == STORY_SELECT && (main.data.H_RPGX || main.data.H_TABA)){
		main.elements.sceneSelect.style.display = "initial"
		main.elements.storySelect.style.display = "none"
		main.elements.foot.auto.innerHTML = "Select: Scene";
		main.view.current = SCENE_SELECT;
	}
	switchView();
}

function loadSceneViewer(){
	displayLoadScreen();
	closeTLChoiceBox();
	prepareScene();
	main.elements.viewer.style.zIndex = "1"
	main.elements.viewer.style.opacity = "1";
	if(prefs.scene.textBoxUnder){
		stretchFrame();
	}
}

function displayLoadScreen(){
	if(prefs.viewer.loadingScreen){
		main.elements.loadingWrap.style.visibility = "initial";
	}
}

function isArray(obj) {
	if (typeof obj === "object" && obj.constructor === Array) {
		return true;
	} else {
		return false;
	}
}

// Creates what scene select works off of
function fillSceneList(){
	for(key of Object.keys(sceneData)){
		if(sceneData[key].SCRIPT){
			main.sceneList.push(key)
		} else if(sceneData[key].SCRIPTS.PART1.SCRIPT){
			main.sceneList.push(key)
		}
	}
}

function checkCookie(){
    var cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled){ 
        document.cookie = "testcookie";
        cookieEnabled = document.cookie.indexOf("testcookie")!=-1;
    }
    return cookieEnabled
}

function hideScrollBars () {
  let inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  let outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild (inner);

  document.body.appendChild (outer);
  let w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  let w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild (outer);

  document.documentElement.style.setProperty("--scrollbar-width", (w1 - w2) + "px");
};

function sendAlert(msg, options){
	main.elements.alertBox.visibility = "initial";
	main.elements.alertMsg.innerHTML = msg;
	for(let opt of options){
		let btn = document.createElement("div")
		btn.classList = "alert-btn";
		btn.innerHTML = opt[0];
		btn.addEventListener("click", opt[1], false);
		main.elements.alertOpts.appendChild(btn);
	}
}