function initCharaMeta() {
    for(let key of Object.keys(CHAR)) {
        let chara = CHAR[key];
        let baseForm = chara.base;
        if(chara.hasOwnProperty("form")) {
            for(let form of Object.keys(chara.form)) {
                let charaForm = chara.form[form]
                let formName = charaForm.name;
                // Merge names from base to this form
                formName.engAlias.push(baseForm.name.eng);
                formName.engAlias.push.apply(formName.engAlias, baseForm.name.engAlias);
                formName.japAlias.push(baseForm.name.jap);
                formName.japAlias.push.apply(formName.japAlias, baseForm.name.japAlias);
                // Merge tags from base to this form
                //charaForm.hasOwnProperty("tags") ? charaForm.tags.push.apply(charaForm.tags, baseForm.tags) : charaForm.tags = baseForm.tags;
                if(charaForm.hasOwnProperty("tags")) {
                    charaForm.tags.push.apply(charaForm.tags, baseForm.tags)
                } else {
                    // Create a new array rather than referencing the base one
                    // Needs to be done incase tags need to be removed
                    charaForm.tags = [];
                    charaForm.tags.push.apply(charaForm.tags, baseForm.tags)
                }
                // Set gender if not preset
                if(!charaForm.hasOwnProperty("gender")) {
                    charaForm.gender = baseForm.gender;
                }
                // Set origCharacter if not set
                if(!charaForm.hasOwnProperty("originalCharacter")) {
                    charaForm.originalCharacter = baseForm.originalCharacter;
                }
                // Set artist of not set
                if(!charaForm.hasOwnProperty("artist")) {
                    charaForm.artist = baseForm.artist;
                }
                // Set CV if not set
                if(!charaForm.hasOwnProperty("cv")) {
                    charaForm.cv = baseForm.cv;
                }
                // Remove values that were added from base but not applicable
                // to this form
                if(charaForm.hasOwnProperty("remove")) {
                    if(charaForm.remove.hasOwnProperty("name")) {
                        let removeNames = charaForm.remove.name;
                        for(let lang of Object.keys(removeNames)) {
                            for(let toRemove of removeNames[lang]) {
                                formName[lang].splice(formName[lang].indexOf(toRemove), 1);
                            }
                        }
                    }
                    if(charaForm.remove.hasOwnProperty("tags")) {
                        let removeTags = charaForm.remove.tags;
                        for(let toRemove of removeTags) {
                            charaForm.tags.splice(charaForm.tags.indexOf(toRemove), 1)
                        }
                    }
                }
            }
        }
    }
}

function initTags() {
    for(let key of Object.keys(TAG)) {
        TAG[key].aliases.push.apply(TAG[key].aliases, grabParentTags(TAG[key].parents));
        TAG[key].aliases = [...new Set(TAG[key].aliases)]
    }

    function grabParentTags(parents) {
        // Loops through every parents parent too incase they haven't had their
        // parents done yet.
        let arr = [];
        for(let parent of parents) {
            arr.push.apply(arr, grabParentTags(TAG[parent].parents));
            arr.push(TAG[parent].name);
            arr.push.apply(arr, TAG[parent].aliases);
        }
        return arr;
    }
}

function initCVs() {
    for(let key in CV) {
        // Some CVs use different aliases on different characters
        // To make it so that the credited CV shows up as the main
        // name in autofill but also brings up scenes where a different
        // alias was used, we create two seperate CVs but merge their
        // names in to the aliases for the credited alias.
        // e.g. searching Sakura Momoka which is an alias of Ogura Yui
        // and is the name used in the credits of Snake Lady and Maika
        // will also bring up Meteor as she is credited to Tsukimura Misora
        // which is another alias of Ogura Yui
        // they could also be two different people and VNDB just doesn't have
        // the info and two people are being merged for no reason in which case
        // oops.
        if(CV[key].hasOwnProperty("alias")) {
            for(let alias of CV[key].alias) {
                let cv = CV[key]
                CV[key].engAlias.push(CV[alias].eng);
                for(name of CV[alias].engAlias) {
                    CV[key].engAlias.push(name);
                }
                CV[key].japAlias.push(CV[alias].jap);
                for(name of CV[alias].japAlias) {
                    CV[key].japAlias.push(name);
                }
            }
        }
    }
    // Add character name + CV to the aliases for easy searching
    // for non-seiyyufags
    for(let key in CHAR) {
        let char = CHAR[key];

        // Ignore any male chars that aren't the focus of the scene
        if(char.base.gender == "male"){
            if(char.base.hasOwnProperty("focus")){
                continue;
            }
        }

        addCharNames(char.base.name, char.base.cv);
        // CV of character has changed at some point
        if(char.base.hasOwnProperty("altCV")) {
            for(let cv of char.base.altCV) {
                addCharNames(char.base.name, cv, " Old");
            }
        }
        if(char.hasOwnProperty("form")) {
            for(form in char.form) {
                let charForm = char.form[form]
                addCharNames(charForm.name, charForm.cv);
                // CV of character form has changed at some point
                if(charForm.hasOwnProperty("altCV")) {
                    for(let cv of charForm.altCV) {
                        addCharNames(charForm.name, cv, " Old");
                    }
                }
            }
        }
    }

    for(let key in CV) {
        CV[key].engAlias = [...new Set(CV[key].engAlias)];
        CV[key].japAlias = [...new Set(CV[key].japAlias)];
    }

    function addCharNames(nameObj, cv, append="") {
        cv.engAlias.push(nameObj.eng + append + " VA");
        cv.engAlias.push(nameObj.eng + append + " CV");
        for(let name of nameObj.engAlias) {
            cv.engAlias.push(name + append + " VA");
            cv.engAlias.push(name + append + " CV");
        }
        cv.japAlias.push(nameObj.jap + append + " VA");
        cv.japAlias.push(nameObj.jap + append + " CV");
        for(let name of nameObj.japAlias) {
            cv.japAlias.push(name + append + " VA");
            cv.japAlias.push(name + append + " CV");
        }
    }
}

function prepSceneData(){
    if(main.data.H_RPGX){
        for(let key in sceneData){
            let curScene = sceneData[key];
            curScene.name = [];
            curScene.artist = [];
            curScene.cv = [];
            curScene.tags = {
                female:[],
                male:[],
                location:[],
                misc:[]
            }
            curScene.favourite = false;
            curScene.rpgx = true;

            if(SCENE[key]){
                mergeMeta(curScene, key);
            }
            if(main.allowCookies){
                mergeLocalData(curScene, key);
            }

            for(let part in curScene.SCRIPTS){
                let curPart = curScene.SCRIPTS[part];
                curPart.images = getRPGXImages(curPart.SCRIPT);
            }
        }
    }
    
    if(main.data.H_TABA){
        if(!main.data.H_RPGX){
            // wew I shouldn'tve made RPGX Data sceneData
            sceneData = {};
        }
        for(let key in TABAData){
            let curScene = TABAData[key];
            let id = "c" + curScene.ID;
            sceneData[id] = curScene;

            curScene.name = [];
            curScene.artist = [];
            curScene.cv = [];
            curScene.tags = {
                female:[],
                male:[],
                location:[],
                misc:[]
            }
            curScene.favourite = false;
            curScene.rpgx = false;
            curScene.images = [];

            if(SCENE[id]){
                mergeMeta(curScene, id);
            }
            if(main.allowCookies){
                mergeLocalData(curScene, id);
            }

            for(let part in curScene.SCRIPTS){
                let curPart = curScene.SCRIPTS[part];
                curScene.images.push.apply(curScene.images, getTABAImages(curPart.SCRIPT, curPart.FOLDER));
            }
            
        }
    }

    if(main.data.H_NECRO){
        if(!main.data.H_RPGX){
            // wew I shouldn'tve made RPGX Data sceneData
            sceneData = {};
        }
        for(let key in NecroData){
            let curScene = NecroData[key];
            sceneData[key] = curScene;

            curScene.name = [];
            curScene.artist = [];
            curScene.cv = [];
            curScene.tags = {
                female:[],
                male:[],
                location:[],
                misc:[]
            }
            curScene.favourite = false;
            curScene.rpgx = false;
            if(SCENE[key]){
                mergeMeta(curScene, key);
            }
            if(main.allowCookies){
                mergeLocalData(curScene, key);
            }

            for(let part in curScene.SCRIPTS){
                let curPart = curScene.SCRIPTS[part];
                curPart.images = getNecroImages(curPart.SCRIPT, key);
            }
        }
    }

    if(main.data.H_OTOGI){
        if(!main.data.H_RPGX){
            // wew I shouldn'tve made RPGX Data sceneData
            sceneData = {};
        }
        for(let key in OtogiData){
            let curScene = OtogiData[key];
            sceneData[key] = curScene;

            curScene.name = [];
            curScene.artist = [];
            curScene.cv = [];
            curScene.tags = {
                female:[],
                male:[],
                location:[],
                misc:[]
            }
            curScene.favourite = false;
            curScene.rpgx = false;
            if(SCENE[key]){
                mergeMeta(curScene, key);
            }
            if(main.allowCookies){
                mergeLocalData(curScene, key);
            }

            for(let part in curScene.SCRIPTS){
                let curPart = curScene.SCRIPTS[part];
                curPart.images = getOtogiImages(curPart.SCRIPT, key);
            }
        }
    }
    

    function mergeMeta(curScene, key){
        let curMeta = SCENE[key];
        // Data for sceneData from CHAR
        if(isArray(curMeta.character)) {
            for(let i in curMeta.character) {
                if(curMeta.hasOwnProperty("form")){
                    setCharData(curMeta.character[i], curMeta.ignoredCharacterTags, key, curMeta.form[i]);
                } else {
                    setCharData(curMeta.character[i], curMeta.ignoredCharacterTags, key);
                }
            }
        } else {
            setCharData(curMeta.character, curMeta.ignoredCharacterTags, key, curMeta.form);
        }

        // Data for sceneData from SCENE
        for(let cat in curMeta.tags) {
            for(let tag of curMeta.tags[cat]) {
                curScene.tags[cat].push.apply(curScene.tags[cat], valuesFromTag(tag));
            }
        }
        if(curMeta.hasOwnProperty("artistOverwrite")) {
            curScene.artist = [];
            if(isArray(curMeta.artistOverwrite)) {
                for(let artist of curMeta.artistOverwrite) {
                    curScene.artist.push.apply(curScene.artist, valuesFromName(artist));
                }
            } else {
                curScene.artist = valuesFromName(curMeta.artistOverwrite)
            }
        }
        if(curMeta.hasOwnProperty("cvOverwrite")) {
            curScene.cv = [];
            if(isArray(curMeta.cvOverwrite)) {
                for(let cv of curMeta.cvOverwrite) {
                    curScene.cv.push.apply(curScene.cv, valuesFromName(cv));
                }
            } else {
                curScene.cv = valuesFromName(curMeta.cvOverwrite)
            }
        }
        if(curMeta.hasOwnProperty("nextScene")) {
            curScene.nextScene = curMeta.nextScene;
        }

        // Remove Dupes
        curScene.name = removeDupes(curScene.name);
        curScene.artist = removeDupes(curScene.artist);
        curScene.cv = removeDupes(curScene.cv);
        curScene.tags.female = removeDupes(curScene.tags.female);
        curScene.tags.male = removeDupes(curScene.tags.male);
        curScene.tags.location = removeDupes(curScene.tags.location);
        curScene.tags.misc = removeDupes(curScene.tags.misc);
    }

    function mergeLocalData(curScene, key){
        if(prefs.select.favourites.indexOf(key) > -1){
            curScene.favourite = true;
        }
    }

    function setCharData(id, remove, key, form=null) {
        // Set Up
        //console.log(`ID: ${id}, Key: ${key}`)
        let gender;
        let name;
        let data = sceneData[key];
        let tags = [];
        if(form == null) {
            form = id.base;
        } else {
            form = id.form[form]
        }
        gender = form.gender;

        // Tags
        tags.push.apply(tags, form.tags);
        if(remove != null) {
            for(let tag of remove) {
                tags.splice(tags.indexOf(tag), 1)
            }
        }
        for(let tag of tags) {
            data.tags[gender].push.apply(data.tags[gender], valuesFromTag(tag));
        }

        data.name.push.apply(data.name, valuesFromName(form.name));
        data.artist.push.apply(data.artist, valuesFromName(form.artist));
        data.cv.push.apply(data.cv, valuesFromName(form.cv));

        if(!data.originalCharacter){
            if(gender == "female"){
                data.originalCharacter = form.originalCharacter;
            } else if(form.focus){
                data.originalCharacter = form.originalCharacter;
            }
        }
    }

    function valuesFromTag(tag) {
        let values = [];
        values.push(tag.name)
        for(let value of tag.aliases) {
            values.push(value);
        }
        return values;
    }

    function valuesFromName(name) {
        let values = [];
        values.push(name.eng);
        for(let alias of name.engAlias) {
            values.push(alias);
        }
        values.push(name.jap);
        for(let alias of name.japAlias) {
            values.push(alias);
        }
        return values;
    }

    function removeDupes(arr) {
        return [...new Set(arr)];
    }

    function isArray(obj) {
        if(typeof obj === "object" && obj.constructor === Array) {
            return true;
        } else {
            return false;
        }
    }

    function getTABAImages(script, folder){
        let path = "./TABAScenes/" + folder + "/images/";
        let images = new Set();
        let fullPath;
        for(let cmd of script){
            let src = cmd.src;
            let type = cmd.type;
            let id = cmd.id;

            if(id===undefined || id==="black" || id==="white" || id==="del" || (id.slice(0, 3)==="red") || (id.indexOf("_")!==-1) || (id.indexOf("nc")!==-1) || id==="SR156h" || id==="SR155k"){
                continue;
            }

            switch(type){
                case "BG":
                case "EV":
                    fullPath = path + src.split("/")[src.split("/").length -1];
                    images.add(fullPath);
                break;
                default:
                break;
            }
        }
        return [...images];
    }

    function getRPGXImages(script){
        scene.type = H_RPGX;
        let images = new Set();
        for (let command of script){
            if(command.substr(1, command.lastIndexOf(">") -1) == "EV"){
                fn = command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)).trim();
                if(fn == "black" || fn == "white"){
                    continue;
                }
                images.add(fn)
            }
        }
        return [...images];
    }

    function getNecroImages(script, key){
        let path = `./NecroScenes/${key}`;
        let images = new Set();
        for (let command of script){
            let cmd = command.split(",");
            if(cmd[0] == "bg" && cmd[1].includes("ev")){
                images.add(`${path}/images/${cmd[1]}.png`)
            } else if(cmd[0] == "playmovie"){
                images.add(`${path}/videos/${cmd[1]}.webm`)
            }
        }
        return [...images];
    }

    function getOtogiImages(script, key){
        let path = `./OtogiScenes/${key.split("_")[1]}`;
        let images = new Set();
        for (let command of script){
            images.add(`${path}/videos/${command.CharaAnimation.toString()}.webm`);
        }
        return [...images];
    }
}



function initStoryData(){
    for(let key in storyData){
        let curData = storyData[key];
        let curMeta = STORY[key];
        curData.japName = curMeta.japName;
        curData.engName = curMeta.engName;
        curData.type = curMeta.type;
        let id = curMeta.id;
        curData.id = id;
        chapterOrder[id] = key;
        curData.next = curMeta.next;
        if(curMeta.hasOwnProperty("banner")){
            curData.banner = curMeta.banner
        }
        if(curMeta.hasOwnProperty("chapter")){
            curData.chapter = curMeta.chapter
        }
    }
}

var maskData = {

}

function decompressMask(mask){
    let curMask = compressedMasks[mask];
    let newMask = [];
    for(let i=0; i<curMask.length;i+=2){
        for(let a=0; a<curMask[i]; a++){
            newMask.push(0);
            newMask.push(0);
            newMask.push(0);
            newMask.push(curMask[i+1]);
        }
    }
    maskData[mask] = new ImageData(new Uint8ClampedArray(newMask), 960, 720);
    //maskData[mask] = new ImageData(new Uint8ClampedArray(newMask), 1280, 720);
}

function initAutocomplete(){
    addCharTags("male");
    addCharTags("female");
    addSceneTags("male");
    addSceneTags("female");
    addSceneTags("misc");
    addSceneTags("location");
    addFromChar();
    autocomplete.artist.delete(ARTIST.IGNORE);
    autocomplete.cv.delete(CV.IGNORE);
    autoCompleteName(document.getElementById("charName"), Array.from(autocomplete.character).sort((a, b) => (a.eng > b.eng) ? 1 : -1));
    autoCompleteName(document.getElementById("sceneArtist"), Array.from(autocomplete.artist).sort((a, b) => (a.eng > b.eng) ? 1 : -1));
    autoCompleteName(document.getElementById("sceneCV"), Array.from(autocomplete.cv).sort((a, b) => (a.eng > b.eng) ? 1 : -1))
    autoCompleteTag(document.getElementById("femaleTags"), Array.from(autocomplete.female).sort((a, b) => (a.name > b.name) ? 1 : -1));
    autoCompleteTag(document.getElementById("maleTags"), Array.from(autocomplete.male).sort((a, b) => (a.name > b.name) ? 1 : -1));
    autoCompleteTag(document.getElementById("miscTags"), Array.from(autocomplete.misc).sort((a, b) => (a.name > b.name) ? 1 : -1));
    autoCompleteTag(document.getElementById("locationTags"), Array.from(autocomplete.location).sort((a, b) => (a.name > b.name) ? 1 : -1));


    function addCharTags(type){
        for(let key in CHAR){
            let curChar = CHAR[key];

            // Add tags from base character to autocomplete
            if(curChar.base.gender == type){
                for(let tag of curChar.base.tags){
                    autocomplete[type].add(tag);
                }
            }

            // Add tags from form to autocomplete
            if(curChar.hasOwnProperty("form")){
                for(let form in curChar.form){
                    let curForm = curChar.form[form];
                    if(curForm.hasOwnProperty("gender") && curForm.hasOwnProperty("tags")){
                    }
                    if(curForm.hasOwnProperty("tags")){
                        if(curForm.hasOwnProperty("gender")){
                            if(curForm.gender == type){
                                for(let tag of curForm.tags){
                                    autocomplete[type].add(tag);
                                }
                            }
                        } else {
                            if(curChar.base.gender == type){
                                for(let tag of curForm.tags){
                                    autocomplete[type].add(tag);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function addSceneTags(type){
        for(let key in SCENE){
            let curScene = SCENE[key];
            for(let tag of curScene.tags[type]){
                autocomplete[type].add(tag);
            }
        }
    }

    function addFromChar(){
        for(let key in CHAR){
            let curChar = CHAR[key];
            addForm(curChar.base);
            if(curChar.hasOwnProperty("form")){
                for(let form in curChar.form){
                    addForm(curChar.form[form]);
                }
            }
        }

        function addForm(form){
            if(form.hasOwnProperty("name")){
                autocomplete.character.add(form.name);
            }
            if(form.hasOwnProperty("artist")){
                autocomplete.artist.add(form.artist);
            }
            if(form.hasOwnProperty("cv")){
                autocomplete.cv.add(form.cv);
            }
            if(form.hasOwnProperty("altCV")){
                for(let cv of form.altCV){
                    autocomplete.cv.add(cv);
                }
            }
        }
    }
}



function initCustomData(){
    overwriteData()
    for(let key in CUSTOM){
        let cVar = CUSTOM[key];
        let sVar = this[key];
        for(let value in cVar.ADD){
            findValueToSet(cVar.ADD[value], sVar[value], true);
        }
        for(let value in cVar.REMOVE){
            findValueToSet(cVar.REMOVE[value], sVar[value], false);
        }
    }

    function findValueToSet(custom, main, add){
        for(let key in custom){
            let cMeta = custom[key];
            let sMeta = main[key];
            if(isObject(cMeta)){
                if(main[key] === undefined && add){
                    applyCustomData(cMeta, main, key, add);
                } else {
                    findValueToSet(cMeta, sMeta, add);
                }
            } else {
                applyCustomData(cMeta, main, key, add);
            }
        }
    }

    function applyCustomData(custom, main, key, add){
        if(isArray(custom)){
            let arr = main[key];
            if(add){
                arr.push.apply(arr, custom);
            } else {
                for(let toRemove of custom){
                    let idx = arr.indexOf(toRemove);
                    if(idx >= 0){
                        arr.splice(idx, 1);
                    }
                }
            }
        } else {
            main[key] = custom;
        }
    }

    function overwriteData(){
        for(let key in CUSTOM){
            let cMeta = CUSTOM[key];
            let sMeta = this[key];

            for(let value in cMeta.OVERWRITE){
                sMeta[value] = cMeta.OVERWRITE[value];
            }
        }
    }

    function basicCustom(key){
        let cMeta = CUSTOM[key];
        let sMeta = this[key];

        // Add
        for(let value in cMeta.ADD){
            let cMA = cMeta.ADD[value];
            let sMA = sMeta[value];
            for(let add in cMA){
                let sMAA = sMA[add];
                let cMAA = cMA[add];
                if(isArray(sMAA)){
                    sMAA.push.apply(sMAA, cMAA);
                } else {
                    sMA[add] = cMAA;
                }
            }
        }

        // Remove
        for(let value in cMeta.REMOVE){
            let cMR = cMeta.REMOVE[value];
            let sMR = sMeta[value];
            for(let remove in cMR){
                let cMRR = cMR[remove];
                let sMRR = sMR[remove];
                for(let toRemove of cMRR){
                    sMRR.splice(sMRR.indexOf(toRemove), 1);
                }
            }
        }
    }

    function isObject (value) {
        return value && typeof value === 'object' && value.constructor === Object;
    }
}

function initMeta(){
    initCustomData();
    initTags();
    initCharaMeta();
    initCVs();
    prepSceneData();
    if(main.data.STORY_RPGX){
        initStoryData();
    }
    initAutocomplete();
}