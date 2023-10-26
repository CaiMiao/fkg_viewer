var cgViewer = {
	imgQ:[],
	sceneQ:[],
	index:0,
	slideshow:false,
	scene:"0000",
	rpgx:true,
	alt:false,
	elements:{

	}
}

function startCGViewMode(id){
	buildCGViewer();

	main.elements.viewer.style.zIndex = "1"
	main.elements.viewer.style.opacity = "1";
	main.view.current = CG_VIEWER;
	switchView();

	cgViewer.sceneQ = [...main.sceneList];
	if(prefs.cg.shuffleScene){
		shuffle(cgViewer.sceneQ);
	}

	cgViewer.scene = id;
	cgViewer.rpgx = sceneData[cgViewer.scene].rpgx;
	scene.type = cgViewer.rpgx ? CG_RPGX : CG_TABA;
	cgViewer.index = 0;
	cgViewer.slideshow = prefs.cg.slideshow;
	if(cgViewer.slideshow){
		main.elements.foot.mode.innerHTML = "Mode: Slide";
		slideshowMode();
	}
	main.elements.foot.auto.innerHTML = "";
	main.elements.foot.skip.innerHTML = "Play Scene";

	fillImgQ();
	preloadCGs()
	displayCG();
}

function exitCGViewMode(){
	main.elements.foot.mode.value = "Mode: CG";
	toggleOffSlideShow()
	cgViewer.imgQ = [];
	killChildren(main.elements.viewer);
	emptyTempPreload();
	loadSceneSelect();
}

function buildCGViewer(){
	cgViewer.elements.cg = document.createElement("div");
	cgViewer.elements.cgAlt = document.createElement("div");
	cgViewer.elements.cg.classList = "viewer-main-class viewer-large-image";
	cgViewer.elements.cgAlt.classList = "viewer-main-class viewer-large-image";
	main.elements.viewer.appendChild(cgViewer.elements.cg);
	main.elements.viewer.appendChild(cgViewer.elements.cgAlt);
}

function nextCGScene(){
	if(prefs.cg.randomScene || prefs.cg.randomImg){
		cgViewer.scene = cgViewer.sceneQ[Math.floor(Math.random() * cgViewer.sceneQ.length)];
	} else {
		cgViewer.scene = cgViewer.sceneQ.indexOf(cgViewer.scene) != cgViewer.sceneQ.length - 1 ? cgViewer.sceneQ[cgViewer.sceneQ.indexOf(cgViewer.scene) + 1] : cgViewer.sceneQ[0];
	}

	cgViewer.index = 0;
	emptyTempPreload();
	cgViewer.imgQ = [];
	cgViewer.rpgx = sceneData[cgViewer.scene].rpgx;
	scene.type = cgViewer.rpgx ? CG_RPGX : CG_TABA;
	
	fillImgQ();
	preloadCGs();
}

function prevCGScene(){
	if(prefs.cg.randomScene || prefs.cg.randomImg){
		cgViewer.scene = cgViewer.sceneQ[Math.floor(Math.random() * cgViewer.sceneQ.length)];
	} else {
		cgViewer.scene = cgViewer.sceneQ.indexOf(cgViewer.scene) != 0 ? cgViewer.sceneQ[cgViewer.sceneQ.indexOf(cgViewer.scene) - 1] : cgViewer.sceneQ[cgViewer.sceneQ.length - 1];
	}

	emptyTempPreload();
	cgViewer.imgQ = [];
	cgViewer.rpgx = sceneData[cgViewer.scene].rpgx;
	scene.type = cgViewer.rpgx ? CG_RPGX : CG_TABA;
	
	fillImgQ();
	preloadCGs();
}

function nextCG(){
	if(prefs.cg.randomImg){
		nextCGScene();
	} else if(cgViewer.index >= cgViewer.imgQ.length - 1){
		nextCGScene();
		cgViewer.index = 0;
	} else {
		cgViewer.index++;
	}
	displayCG();
}

function prevCG(){
	if(prefs.cg.randomImg){
		prevCGScene();
	} else if(cgViewer.index <= 0){
		prevCGScene();
		cgViewer.index = cgViewer.imgQ.length - 1;
	} else {
		cgViewer.index--;
	}
	displayCG();
}

function fillImgQ(){
	if(cgViewer.rpgx){
		for(let part in sceneData[cgViewer.scene].SCRIPTS){
			let data = sceneData[cgViewer.scene].SCRIPTS[part];
			cgViewer.imgQ.push.apply(cgViewer.imgQ, data.images);
		}
	} else {
		if(cgViewer.scene[0] == "c"){
			cgViewer.imgQ = sceneData[cgViewer.scene].images;
		} else if (cgViewer.scene.includes("HAR") || cgViewer.scene.includes("OTOGI")){
			for(let part in sceneData[cgViewer.scene].SCRIPTS){
				let data = sceneData[cgViewer.scene].SCRIPTS[part];
				cgViewer.imgQ.push.apply(cgViewer.imgQ, data.images);
			}
		}
	}
}

function preloadCGs(){
	// Preload just the single CG if random, all if not
	if(prefs.cg.randomImg){
		cgViewer.index = Math.floor(Math.random() * cgViewer.imgQ.length);
		preloadCG(cgViewer.imgQ[cgViewer.index], cgViewer.scene);
	} else {
		for(let image of cgViewer.imgQ){
			preloadCG(image, cgViewer.scene);
		}
	}
}

function preloadCG(image, id){
	let scene = sceneData[id]
	if(cgViewer.rpgx){
		for(let part in scene.SCRIPTS){
			let data = scene.SCRIPTS[part];
			if(data.images.includes(image)){
				createCGCanvases(image, data.HIERARCHY.pairList);
				break;
			}
		}
	} else {
		let ext = image.substr(image.lastIndexOf(".")  + 1);
		if(ext == "webm"){
			let vid = document.createElement("video");
			vid.className = "tempPreloadImage";
			vid.addEventListener("canplay", function(){
				preload.temp[image] = vid;
				preload.tempElem.append(vid);
			}, {once:true});
			vid.src = image;
		} else {
			let img = new Image();
			img.className = "tempPreloadImage";
			img.addEventListener("load", function(){
				preload.temp[image] = img
				preload.tempElem.append(img);
			}, {once:true});
			img.src = image;
		}
	}
}

function displayCG(){
	let cgElem = cgViewer.alt ? cgViewer.elements.cgAlt : cgViewer.elements.cg;
	let curCG = cgViewer.imgQ[cgViewer.index];

	for (let child of cgElem.children){
		child.style.visibility = "hidden";
		main.elements.canvasHoldElem.append(child);
	}
	cgElem.style.background = "";

	if(cgViewer.rpgx){
		// let clone = cloneCanvas(preload.canvas[curCG]);
		// cgElem.appendChild(clone);
		cgElem.appendChild(preload.canvas[curCG]);
		preload.canvas[curCG].style.visibility = "initial";
	} else {
		if(cgViewer.scene[0] == "c"){
			cgElem.style.background = "black url('" + curCG + "') no-repeat center";
		} else if (cgViewer.scene.includes("HAR")){
			let ext = curCG.substr(curCG.lastIndexOf(".")  + 1);
			if(ext == "webm"){
				let vid = document.createElement("video");
				vid.width = 960;
				vid.height = 720;
				vid.loop = true;
				vid.src = curCG;
				vid.classList = "viewer-main-class viewer-video";
				cgElem.appendChild(vid);
				vid.load();
				vid.play();
			} else {
				cgElem.style.background = "black url('" + curCG + "') no-repeat center/960px 720px";
			}
		} else if (cgViewer.scene.includes("OTOGI")){
			let vid = document.createElement("video");
			vid.width = 1402;
			vid.height = 898;
			vid.loop = true;
			vid.src = curCG;
			vid.style.width = "1402px";
			vid.style.height = "898px";
			vid.style.left = "-140px";
			vid.style.top = "-118px";
			vid.classList = "viewer-main-class viewer-video";
			cgElem.appendChild(vid);
			vid.load();
			vid.play();
		}
		
	}

	if(prefs.cg.fadeEffect){
		animateElement(cgElem, 1000, "fade-in", false);

		cgElem.style.zIndex = "2";
		if(cgViewer.alt){
			cgViewer.elements.cg.style.zIndex = "1";
			removeAnimation(cgViewer.elements.cg);
		} else {
			cgViewer.elements.cgAlt.style.zIndex = "1";
			removeAnimation(cgViewer.elements.cgAlt);
		}
		cgViewer.alt = !cgViewer.alt;
	}
	
	
}

function slideshowMode(){
	cgViewer.nextSlide = setTimeout(function(){
		if(cgViewer.slideshow){
			nextCG();
			slideshowMode();
		}
	}, prefs.cg.slideshowWait)
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}