function initSearch(){
	document.getElementById("sceneSearch").addEventListener("click", function(){
		runSearch();
	}, true);
	document.getElementById("filterReset").addEventListener("click", function(){
		main.sceneList = Object.keys(sceneData);
		realignSceneSelect();
		constructSceneSelect();
		main.elements.searchMenu.style.display = "none";
		main.view.current = 1;
	}, true);
	document.getElementById("searchCancel").addEventListener("click", function(){
		main.elements.searchMenu.style.display = "none";
		main.view.current = 1;
	}, true);
}

function runSearch(){
	let searchResults = Object.keys(sceneData);
	let searchName = document.getElementById("charName").value;
	let searchArtist = document.getElementById("sceneArtist").value;
	let searchCV = document.getElementById("sceneCV").value;
	let searchFemaleTags = document.getElementById("femaleTags").value;
	let searchAllFemaleTags = document.getElementById("femaleTagsAll").checked;
	let searchMaleTags = document.getElementById("maleTags").value;
	let searchAllMaleTags = document.getElementById("maleTagsAll").checked;
	let searchMiscTags = document.getElementById("miscTags").value;
	let searchAllMiscTags = document.getElementById("miscTagsAll").checked;
	let searchLocationTags = document.getElementById("locationTags").value;
	let searchOrig = document.getElementById("charOrig").checked;
	let searchMain = document.getElementById("charMain").checked
	let searchFav = document.getElementById("sceneFav").checked;
	let searchEng = document.getElementById("sceneEng").checked;

	if(searchEng){
		let filtered = [];
		for(let scene of searchResults){
			if(sceneData[scene].SCRIPTS.PART1.TRANSLATIONS != null){
				filtered.push(scene);
			}
		}
		searchResults = filtered;
	}

	if(searchFav){
		let filtered = [];
		for(let scene of searchResults){
			if(sceneData[scene].favourite){
				filtered.push(scene);
			}
		}
		searchResults = filtered;
	}

	if(searchMain){
		let filtered = [];
		for(let scene of searchResults){
			if(!sceneData[scene].originalCharacter && sceneData[scene].originalCharacter != null){
				filtered.push(scene);
			}
		}
		searchResults = filtered;
	} else if(searchOrig){
		let filtered = [];
		for(let scene of searchResults){
			if(sceneData[scene].originalCharacter){
				filtered.push(scene);
			}
		}
		searchResults = filtered;
	}

	if(searchMiscTags != ""){
		searchResults = searchSceneTags(searchMiscTags, searchResults, "misc", searchAllMiscTags);
	}
	if(searchLocationTags != ""){
		searchResults = searchSceneTags(searchLocationTags, searchResults, "location", false);
	}
	if(searchMaleTags != ""){
		searchResults = searchSceneTags(searchMaleTags, searchResults, "male", searchAllMaleTags);
	}
	if(searchName != ""){
		searchResults = searchSceneArrays(searchName, searchResults, "name");
	}
	if(searchCV != ""){
		searchResults = searchSceneArrays(searchCV, searchResults, "cv");
	}
	if(searchArtist != ""){
		searchResults = searchSceneArrays(searchArtist, searchResults, "artist");
	}
	if(searchFemaleTags != ""){
		searchResults = searchSceneTags(searchFemaleTags, searchResults, "female", searchAllFemaleTags);
	}
	

	if(searchResults.length > 0){
		document.getElementById("search-error").style.display = "none";
		main.sceneList = searchResults;
		sceneSelect.page = 0;
		main.elements.searchMenu.style.display = "none";
		realignSceneSelect();
		constructSceneSelect();
		main.view.current = 1;
	} else {
		document.getElementById("search-error").style.display = "inherit";
	}



	function searchSceneArrays(input, scenes, searching){
		let removeNames = [];
		let searchNames = [];
		for (let value of input.split(",")){
			if(value.replace(/ /g, "")[0] == "!" || value.replace(/ /g, "")[0] == "-"){
				removeNames.push(value.toLowerCase().replace(/ /g, "").substr(1));
			} else {
				searchNames.push(value.toLowerCase().replace(/ /g, ""));
			}
		}

		let results = [];
		if(searchNames.length > 0){
			for(let scene of scenes){
				let nameFound = false;
				for(let value of searchNames){
					if(nameFound){
						break;
					}
					for(let search of sceneData[scene][searching]){
						if(value == search.toLowerCase().replace(/ /g, "")){
							nameFound = true;
							results.push(scene);
							break;
						}
					}
				}
			}
		} else {
			results = scenes;
		}

		if(removeNames.length > 0){
			for(let i = results.length - 1; i >= 0; i--){
				for(let value of removeNames){
					for(let search of sceneData[results[i]][searching]){
						if(value == search.toLowerCase().replace(/ /g, "")){
							results.splice(results.indexOf(results[i]), 1);
						}
					}
				}
			}
		}
		return results;
	}

	function searchSceneTags(input, scenes, section, all){
		let inputSplit = input.split(",");
		let removeTags = [];
		let searchTags = [];
		for (let value of input.split(",")){
			if(value.replace(/ /g, "")[0] == "!" || value.replace(/ /g, "")[0] == "-"){
				removeTags.push(value.toLowerCase().replace(/ /g, "").substr(1));
			} else {
				searchTags.push(value.toLowerCase().replace(/ /g, ""));
			}
		}

		let results = [];
		if(searchTags.length > 0){
			for(let scene of scenes){
				let tagsFound = [];
				for(let value of searchTags){
					if(!all && tagsFound.length > 0){
						break;
					} else if (all && tagsFound.length == searchTags.length){
						break;
					}
					for(let tag of sceneData[scene].tags[section]){
						if(value.toLowerCase().replace(/ /g, "") == tag.toLowerCase().replace(/ /g, "")){
							tagsFound.push(tag);
							break;
						}
					}
				}
				if(all && tagsFound.length == searchTags.length){
					results.push(scene);
				} else if(!all && tagsFound.length > 0){
					results.push(scene);
				}
			}
		} else {
			results = scenes;
		}

		if(removeTags.length > 0){
			for(let i = results.length - 1; i >= 0; i--){
				for(let value of removeTags){
					for(let search of sceneData[results[i]].tags[section]){
						if(value == search.toLowerCase().replace(/ /g, "")){
							results.splice(results.indexOf(results[i]), 1);
						}
					}
				}
			}
		}
		return results;
	}

}