chapterOrder = [];
storySelect = {
	id:0,
	section:"S01",
	type:"chapter",
	part:"A",
	elements:{

	}
}

function initStorySelect(){
	storySelect.elements.section = document.getElementById("story-select-section-select");
	storySelect.elements.part = document.getElementById("story-select-section-single");
	storySelect.elements.title = document.getElementById("story-select-chapter-title");
	storySelect.elements.subtitle = document.getElementById("story-select-section-title");
	storySelect.elements.epilogue = document.getElementById("story-select-section-epilogue");
	hideElem(storySelect.elements.part);
	buildStorySelect();

	if(document.getElementById("story-select-chapter-choices").children.length > 0){
		setChapterChoice(document.getElementById("story-select-chapter-choices").children[0]);
	}
}

function buildStorySelect(){
	let chapterChoice = document.getElementById("story-select-chapter-choices");
	for(chapter of chapterOrder){
		if(chapter == null){
			continue;
		}
		chapter = storyData[chapter];
		let base = document.createElement("div");
		base.classList += "chapter-choice text-stroke no-select";
		if(chapter.type == "chapter"){
			let chapNameElem = document.createElement("div");
			chapNameElem.classList += "chapter-choice-name"
			chapNameElem.innerText = chapter.japName
			let chapNoElem = document.createElement("div");
			chapNoElem.classList += "chapter-choice-no"
			chapNoElem.innerText = chapter.chapter
			base.append(chapNameElem);
			base.append(chapNoElem);
			base.classList.add("chapter-choice-main");
		} else {
			base.style.backgroundImage = 'url("Story/banner/' + chapter.banner + '")'; 
		}
		base.setAttribute("storyId", chapter.id);
		base.setAttribute("storyType", chapter.type);
		chapterChoice.append(base);
	}
}

function getSelectedStoryData(){
	return storyData[chapterOrder[storySelect.id]];
}

function getSelectedStoryScripts(){
	return storyData[chapterOrder[storySelect.id]].SECTIONS[storySelect.section][storySelect.part];
}

function setChapterChoice(elem){
	for(let e of document.getElementsByClassName("chapter-choice-main-selected")){
		e.classList.remove("chapter-choice-main-selected");
	}
	for(let e of document.getElementsByClassName("chapter-choice-event-selected")){
		e.classList.remove("chapter-choice-event-selected");
	}
	if(elem.classList.contains("chapter-choice-main")){
		elem.classList.add("chapter-choice-main-selected");
	} else {
		elem.classList.add("chapter-choice-event-selected");
	}
	storySelect.type = elem.getAttribute("storytype");
	storySelect.id = elem.getAttribute("storyid");
	storySelect.section = "S01";
	storySelect.elements.title.innerText = getSelectedStoryData().japName;
	switchStoryMenu()
}

function setChapterSection(elem){
	storySelect.section = elem.getAttribute("section");
	storySelect.elements.subtitle.innerText = "SECTION " + storySelect.section.substr(1);
	unhideElem(storySelect.elements.part);
	unhideElem(storySelect.elements.epilogue);
	hideElem(storySelect.elements.section);
}

function setChapterPart(elem){
	storySelect.part = elem.getAttribute("part");
	scene.story.part = storySelect.part;
	scene.story.section = storySelect.section;
	scene.story.id = storySelect.id;
	scene.story.type = storySelect.type;
	let part = getSelectedStoryScripts();
	if(prefs.scene.eng && part.TRANSLATIONS != null){
		let tls = part.TRANSLATIONS;
		if(tls.length > 1){
			buildTLChoiceBoxStory(tls);
		} else {
			scene.script = tls[0].SCRIPT;
			scene.translated = true;
			scene.translator = tls[0].TRANSLATOR;
			scene.language = tls[0].LANGUAGE;
			scene.type = STORY_RPGX;
			loadSceneViewer();
		}
	} else {
		scene.script = part.SCRIPT;
		scene.type = STORY_RPGX;
		loadSceneViewer();
	}
}

function tlSelectStory(idx){
	killChildren(main.elements.tlChoiceBox);
	let choice = getSelectedStoryScripts().TRANSLATIONS[idx];
	scene.script = choice.SCRIPT;
	scene.translated = true;
	scene.translator = choice.TRANSLATOR;
	scene.language = choice.LANGUAGE;
	if(main.view.current == CG_VIEWER){
		exitCGViewMode();
	}
	scene.type = STORY_RPGX;
	loadSceneViewer();
}

function buildTLChoiceBoxStory(choices){
	killChildren(main.elements.tlChoiceBox);
	let btnClose = document.createElement("div");
	btnClose.classList = "tl-choice-close";
	main.elements.tlChoiceBox.appendChild(btnClose);
	btnClose.addEventListener("click", closeTLChoiceBox);
	let idx = 0;
	for(choice of choices){
		createTLChoiceStory(choice.LANGUAGE, choice.TRANSLATOR, idx);
		idx++
	}
	main.elements.tlChoiceBox.style.zIndex = "100";
	main.elements.tlChoiceBox.style.visibility = "initial";
}

function createTLChoiceStory(lang, tl, idx){
	let btn = document.createElement("div");
	btn.classList = "styled-btn";
	btn.style.fontSize = "18px";
	btn.innerText = lang + " - " + tl;
	main.elements.tlChoiceBox.appendChild(btn);
	btn.setAttribute("tlidx", idx);
	btn.addEventListener("click", function(){
		tlSelectStory(this.getAttribute("tlidx"));
	},false);
}

function switchStoryMenu(){
	switch(storySelect.type){
		case "chapter":
		case "story":
			hideElem(storySelect.elements.part);
			unhideElem(storySelect.elements.section);
		break
		case "raid":
		case "map":
		case "mini":
			storySelect.elements.subtitle.innerText = "SECTION 01";
			unhideElem(storySelect.elements.part);
			unhideElem(storySelect.elements.epilogue);
			hideElem(storySelect.elements.section);
		break;
		case "mini2":
			storySelect.elements.subtitle.innerText = "SECTION 01";
			unhideElem(storySelect.elements.part);
			hideElem(storySelect.elements.section);
			hideElem(storySelect.elements.epilogue);
		default:
			console.log("error")
		break;
	}
}

function hideElem(elem){
	elem.style.visibility = "hidden";
}

function unhideElem(elem){
	elem.style.visibility = "inherit";
}

STORY = {
	CHAPTER001:{
		japName:"反乱",
		engName:"",
		type:"chapter",
		chapter:1,
		id:0
	},
	CHAPTER002:{
		japName:"独立遊撃隊",
		engName:"",
		type:"chapter",
		chapter:2,
		id:1
	},
	CHAPTER003:{
		japName:"雨の幽霊城",
		engName:"",
		type:"chapter",
		chapter:3,
		id:2
	},
	CHAPTER004:{
		japName:"対魔忍OFF",
		engName:"",
		type:"chapter",
		chapter:4,
		id:3
	},
	CHAPTER005:{
		japName:"異次元紀行へようこそ",
		engName:"",
		type:"chapter",
		chapter:5,
		id:4
	},
	STORYEVENT001:{
		japName:"雷撃の対魔忍",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00001_1_l.png",
		id:5
	},
	CHAPTER006:{
		japName:"蛇にアリーナ",
		engName:"",
		type:"chapter",
		chapter:6,
		id:6
	},
	RAIDEVENT001:{
		japName:"期末テストと最強の対魔忍",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00001_1_l.png",
		id:7
	},
	STORYEVENT002:{
		japName:"幻影の魔女",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00002_1_l.png",
		id:8
	},
	MAPEVENT001:{
		japName:"忍びの宿命って奴か",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00001_1_l.png",
		id:9
	},
	CHAPTER007:{
		japName:"さくらのお小遣い大作戦",
		engName:"",
		type:"chapter",
		chapter:7,
		id:10
	},
	RAIDEVENT002:{
		japName:"殺人鬼ソニア",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00002_1_l.png",
		id:11
	},
	CHAPTER008:{
		japName:"イン・ザ・ダーク",
		engName:"",
		type:"chapter",
		chapter:8,
		id:12
	},
	MAPEVENT002:{
		japName:"悪霊とホワイトクリスマス",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00002_1_l.png",
		id:13
	},
	STORYEVENT003:{
		japName:"迎春！猪パニック！",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00003_1_l.png",
		id:14
	},
	CHAPTER009:{
		japName:"迷宮",
		engName:"",
		type:"chapter",
		chapter:9,
		id:15
	},
	RAIDEVENT003:{
		japName:"操られた爆炎",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00003_1_l.png",
		id:16
	},
	STORYEVENT004:{
		japName:"対魔忍のバレンタインは厳しい",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00004_1_l.png",
		id:17
	},
	MAPEVENT003:{
		japName:"稲毛屋のアイス",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00003_1_l.png",
		id:18
	},
	CHAPTER010:{
		japName:"ヨミハラ潜入・前編",
		engName:"",
		type:"chapter",
		chapter:10,
		id:19
	},
	RAIDEVENT004:{
		japName:"錬金術師と狼男",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00004_1_l.png",
		id:20
	},
	MAPEVENT004:{
		japName:"魔界騎士のお仕事",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00004_1_l.png",
		id:21
	},
	CHAPTER011:{
		japName:"ヨミハラ潜入・後編",
		engName:"",
		type:"chapter",
		chapter:11,
		id:22
	},
	STORYEVENT005:{
		japName:"沙耶NEOを抹殺せよ",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00005_1_l.png",
		id:23
	},
	APRILFOOLSEVENT001:{
		japName:"タコスレさん",
		engName:"",
		type:"mini",
		banner:"bnr_ev_mini_00005_1_l.png",
		id:24
	},
	RAIDEVENT005:{
		japName:"リリムとミーティア",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00005_1_l.png",
		id:25
	},
	CHAPTER012:{
		japName:"魔女出づりて鬼来たる",
		engName:"",
		type:"chapter",
		chapter:12,
		id:26
	},
	MAPEVENT005:{
		japName:"忘れられた蛇神",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00005_1_l.png",
		id:27
	},
	STORYEVENT006:{
		japName:"まりの大冒険　闇の町の怪紳士",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00006_1_l.png",
		id:28
	},
	CHAPTER013:{
		japName:"ゆきかぜの家いったことある？",
		engName:"",
		type:"chapter",
		chapter:13,
		id:29
	},
	RAIDEVENT006:{
		japName:"ジューンブライド狂想曲",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00006_1_l.png",
		id:30
	},
	MAPEVENT006:{
		japName:"鮮血の椿姫",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00006_1_l.png",
		id:31
	},
	CHAPTER014:{
		japName:"その名は峰舟子",
		engName:"",
		type:"chapter",
		chapter:14,
		id:32
	},
	STORYEVENT007:{
		japName:"あぶないサマービーチ",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00007_1_l.png",
		id:33
	},
	RAIDEVENT007:{
		japName:"毒も過ぎれば薬となる！？",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00007_1_l.png",
		id:34
	},
	CHAPTER015:{
		japName:"五車の夏休み",
		engName:"",
		type:"chapter",
		chapter:15,
		id:35
	},
	MAPEVENT007:{
		japName:"楽園の馬超",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00007_1_l.png",
		id:36
	},
	STORYEVENT008:{
		japName:"蜘蛛の貴婦人",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00008_1_l.png",
		id:37
	},
	CHAPTER016:{
		japName:"忘れられた書斎",
		engName:"",
		type:"chapter",
		chapter:16,
		id:38
	},
	RAIDEVENT008:{
		japName:"呪いの鏡",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00008_1_l.png",
		id:39
	},
	MAPEVENT008:{
		japName:"カンザキ食堂",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00008_1_l.png",
		id:40
	},
	CHAPTER017:{
		japName:"AD2068",
		engName:"",
		type:"chapter",
		chapter:17,
		id:41
	},
	STORYEVENT009:{
		japName:"ヨミハラ炎上",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00009_1_l.png",
		id:42
	},
	RAIDEVENT009:{
		japName:"恋と友情のハロウィンナイト",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00009_1_l.png",
		id:43
	},
	CHAPTER018:{
		japName:"アミダハラ監獄",
		engName:"",
		type:"chapter",
		chapter:18,
		id:44
	},
	MAPEVENT009:{
		japName:"サイボーグ探偵の事件簿",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00009_1_l.png",
		id:45
	},
	RAIDEVENT010:{
		japName:"嵐吹く夜に月光る",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00010_1_l.png",
		id:46
	},
	CHAPTER019:{
		japName:"五車に潜む悪",
		engName:"",
		type:"chapter",
		chapter:19,
		id:47
	},
	STORYEVENT010:{
		japName:"降ったと思えば土砂降り",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00010_1_l.png",
		id:48
	},
	MAPEVENT010:{
		japName:"聖夜の花と危険なオモチャ",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00010_1_l.png",
		id:49
	},
	RAIDEVENT011:{
		japName:"早く来い来いお正月",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00011_1_l.png",
		id:50
	},
	STORYEVENT011:{
		japName:"ふうま天音と秘密の館",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00011_1_l.png",
		id:51
	},
	CHAPTER020:{
		japName:"斉藤半次郎",
		engName:"",
		type:"chapter",
		chapter:20,
		id:52
	},
	MAPEVENT011:{
		japName:"ファイアー＆ペーパー",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00011_1_l.png",
		id:53
	},
	RAIDEVENT012:{
		japName:"やっぱり対魔忍のバレンタインは厳しい",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00012_1_l.png",
		id:54
	},
	CHAPTER021:{
		japName:"魔科医・桐生美琴",
		engName:"",
		type:"chapter",
		chapter:21,
		id:55
	},
	STORYEVENT012:{
		japName:"期末試験とうさぎの対魔忍",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00012_1_l.png",
		id:56
	},
	MAPEVENT012:{
		japName:"そに子、対魔忍になりまうｓ♪",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00012_1_l.png",
		id:57
	},
	CHAPTER022:{
		japName:"奪われた石切兼光",
		engName:"",
		type:"chapter",
		chapter:22,
		id:58
	},
	RAIDEVENT013:{
		japName:"五車に紅がやって来た",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00013_1_l.png",
		id:59
	},
	APRILFOOLSEVENT002:{
		japName:"まりの突撃取材スクープ！",
		engName:"",
		type:"mini2",
		banner:"bnr_campaign_00011_l.png",
		id:60
	},
	STORYEVENT013:{
		japName:"魔界騎士と次元の悪魔",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00013_1_l.png",
		id:61
	},
	CHAPTER023:{
		japName:"御車の祭殿",
		engName:"",
		type:"chapter",
		chapter:23,
		id:62
	},
	MAPEVENT013:{
		japName:"不死の兵士",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00013_1_l.png",
		id:63
	},
	RAIDEVENT014:{
		japName:"アンブローズ～美しき刺客",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00014_1_l.png",
		id:64
	},
	CHAPTER024:{
		japName:"センザキ・アンダーグラウンド",
		engName:"",
		type:"chapter",
		chapter:24,
		id:65
	},
	STORYEVENT014:{
		japName:"ジューンブライド・アゲイン",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00014_1_l.png",
		id:66
	},
	MAPEVENT014:{
		japName:"勇者の憂鬱",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00014_1_l.png",
		id:67
	},
	CHAPTER025:{
		japName:"闇を疾る者",
		engName:"",
		type:"chapter",
		chapter:25,
		id:68
	},
	RAIDEVENT015:{
		japName:"渚の魔女と小さな騎士",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00015_1_l.png",
		id:69
	},
	STORYEVENT015:{
		japName:"怒れる猫と水着のお姉さま",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00015_1_l.png",
		id:70
	},
	CHAPTER026:{
		japName:"善悪の彼岸",
		engName:"",
		type:"chapter",
		chapter:26,
		id:71
	},
	MAPEVENT015:{
		japName:"マスターと補習といいね",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00015_1_l.png",
		id:72
	},
	RAIDEVENT016:{
		japName:"ヨミハラ大納涼祭",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00016_1_l.png",
		id:73
	},
	CHAPTER027:{
		japName:"コーデリアのふたり姫",
		engName:"",
		type:"chapter",
		chapter:27,
		id:74
	},
	STORYEVENT016:{
		japName:"バニー対魔忍とカジノ・ラビリンス",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00016_1_l.png",
		id:75
	},
	MAPEVENT016:{
		japName:"トラジローはじめてのおつかい",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00016_1_l.png",
		id:76
	},
	CHAPTER028:{
		japName:"雷神の対魔忍",
		engName:"",
		type:"chapter",
		chapter:28,
		id:77
	},
	RAIDEVENT017:{
		japName:"キツネの恩返し",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00017_1_l.png",
		id:78
	},
	STORYEVENT017:{
		japName:"ハロウィンデビル",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00017_1_l.png",
		id:79
	},
	CHAPTER029:{
		japName:"悪鬼羅刹と呼ばれた少女",
		engName:"",
		type:"chapter",
		chapter:29,
		id:80
	},
	MAPEVENT017:{
		japName:"恋の純情爆走ロード",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00017_1_l.png",
		id:81
	},
	STORYEVENT018:{
		japName:"ナーサラと愉快な鬼マフィア",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00018_1_l.png",
		id:82
	},
	CHAPTER030:{
		japName:"幽霊屋敷の魔術師",
		engName:"",
		type:"chapter",
		chapter:30,
		id:83
	},
	MAPEVENT018:{
		japName:"ある日のヨミハラ",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00018_1_l.png",
		id:84
	},
	RAIDEVENT018:{
		japName:"ヨミハラに雪が降る",
		engName:"",
		type:"raid",
		banner:"bnr_ev_raid_00018_1_l.png",
		id:85
	},
	CHAPTER031:{
		japName:"二人の魔界騎士",
		engName:"",
		type:"chapter",
		chapter:31,
		id:86
	},
	STORYEVENT019:{
		japName:"センザキには手を出すな",
		engName:"",
		type:"story",
		banner:"bnr_ev_story_00019_1_l.png",
		id:87
	},
	MAPEVENT019:{
		japName:"アミダハラの追跡者",
		engName:"",
		type:"map",
		banner:"bnr_ev_map_00019_1_l.png",
		id:88
	},
}