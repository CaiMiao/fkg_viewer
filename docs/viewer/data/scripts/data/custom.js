// Add custome metadata here
// Overwrite completely removes EVERYTHING from the specified key
// Add adds to the value if it's an array or overwrites it if not
// Remove removes the value from the array
// Overwrite should be used when adding something completely new like a new tag

/*
	For the SCENE and CHAR Objects ADD and REMOVE are only really designed for adding and removing tags/names.
	Fixing incorrect information like the CV should be done in OVERWRITE or better yet report it in the thread so it can be fixed in the main file

*/

var CUSTOM = {
	ARTIST:{
		Example:{
			KAGAMI_HIROTAKA: {
				// All of these values are required in Overwrite
				// Aliases can be empty arrays
				eng: "Kagami",
				engAlias: ["Kagami Hirotaka", "Hirotaka Kagami", "Hirotaka"],
				jap: "カガミ",
				japAlias: ["嘉臥深", "嘉神", "嘉神ヒロタカ"]
			},
		},



		OVERWRITE:{

		},
		ADD:{

		},
		REMOVE:{

		}
	},
	CV:{
		Example:{
			NAKASE_HINA: {
				// All of these values are required in Overwrite
				// Aliases can be empty arrays
				eng: "Nakase Hina",
				engAlias: ["Nakase", "Hina Nakase", "Hina"],
				jap: "なかせひな",
				japAlias: ["なかせ", "ひな", "中瀬ひな", "中瀬"]
			},
		},



		OVERWRITE:{

		},
		ADD:{

		},
		REMOVE:{

		}
	},
	TAG:{
		Example:{
			ANAL_SEX: {
				// All of these values are required in Overwrite
				// aliases and parents can be empty arrays
				name: "Anal Sex",
				aliases: ["Bum sex", "Arse sex", "Ass sex", "Up the Arse", "Up the Ass", "Butt Sex", "Up the Butt"],
				parents: ["ANAL"]
			},	
		},



		OVERWRITE:{
	
		},
		ADD:{

		},
		REMOVE:{

		}
	},
	CHAR:{
		Example:{
			// Some forms cut in example for brevity
			IGAWA_ASAGI: {
				// Base is required in Overwrite
				// Required keys are name (which itself requires eng, engAlias, jap and japAlias), tags, gender, originalCharacter, artist and cv
				// altCV is an optional value where the characters old CVs go.

				// For male characters there is a required focus key which is either true or false, it's only true for characters like Nao and Shukunosuke as they are the focus of their scenes unlike other male characters like Fuuma and Yazaki
				// for male characters that have focus set to false their artist and cv values should be set to ARTIST.IGNORE and CV.IGNORE
				base: {
					name: {
						eng: "Igawa Asagi",
						engAlias: ["Asagi", "Igawa", "Asagi Igawa"],
						jap: "井河アサギ",
						japAlias: ["アサギ", "井河"]
					},
					tags: [
						TAG.TEAL_HAIR, TAG.LONG_HAIR,
						TAG.GREEN_EYES,
						TAG.BIG_BREASTS, TAG.LIGHT_SKIN
					],
					gender: "female",
					originalCharacter: false,
					artist: ARTIST.KAGAMI_HIROTAKA,
					cv: CV.NAKASE_HINA
				},
				form: {
					// A form can use every key that base can as well as the remove key which itself can use all of the keys which use arrays
					adult: {
						// name and every key within it is required when overwriting a characters form
						name: {
							eng: "Adult Asagi",
							engAlias: ["Standard Asagi", "Normal Asagi"],
							jap: "井河アサギ",
							japAlias: []
						},
					},
					young: {
						name: {
							eng: "Young Asagi",
							engAlias: ["Zero Asagi", "Asagi Zero"],
							jap: "ZEROアサギ",
							japAlias: []
						},
						cv: CV.TAKANASHI_HANAMI
					},
					example:{
						name:{
							eng: "Example Asagi",
							engAlias: [],
							jap: "例アサギ",
							japAlias: []
						},
						tags: [
							TAG.RED_EYES, TAG.DARK_SKIN
						],
						originalCharacter:true,
						artist:ARTIST.AOI_NAGISA,
						cv:CV.MISONOO_MEI,
						altCV:[CV.NAKASE_HINA, CV.KARIN_TOUKA],
						remove:{
							name:{
								engAlias:["Igawa"],
								japAlias: ["井河"]
							},
							tags:[
								TAG.GREEN_EYES, TAG.LIGHT_SKIN
							]
						}
					}
				}
			},
		},
		



		OVERWRITE:{

		},
		ADD:{

		},
		REMOVE:{

		}
	},
	SCENE:{
		Example:{
			"0001_1":{
				// character and tags(female, male, location, misc) are required in overwrite
				// form is optional but technically required for every character which has some form, if it's not set then base is used instead.
				// ignoredCharacterTags is optional and removes tags that may have been pulled in from the character data (e.g. beach scene where they're tanned you'd want to remove TAG.LIGHT_SKIN)
				// artist overwrite overwrites the artist of the scene for special cases where that's required (e.g. Special Sakura TABA card that Aoi made)
				// cvOverwrite overwrites the CV should only be required when a characters CV has changed
				// nextScene says which scene comes next in a story sense e.g. both SR scenes usually come one after the other so that's the next scene there's also the Felicia and Maika scenes where they're two different units but one points back to the other.
		        character: [CHAR.AKIYAMA_RINKO, CHAR.FUUMA_KOTAROU],
		        form:["rinko form", null],
		        tags:{
		            female:[
		                TAG.TAIMANIN_OUTFIT, TAG.CROTCHLESS_CLOTHING, TAG.RIPPED_CLOTHING, TAG.VAGINAL_STICKER, TAG.GAUNTLETS,
		                TAG.LEGS_PULLED_UP,
		                TAG.ANAL_FINGERING, TAG.ANAL_BEADS, TAG.SWEATING
		            ],
		            male:[],
		            location:[TAG.BEDROOM, TAG.ON_BED, TAG.PRIVATE],
		            misc:[TAG.NO_SEX, TAG.CUT_IN_XRAY]
		        },
		        ignoredCharacterTags:[[TAG.REMOVE_FROM_RINKO],[TAG.REMOVE_FROM_FUUMA]],
		        artistOverwrite:ARTIST.PERSON_WHO_DREW_THE_SCENE,
		        cvOverwrite:[CV.RINKO_ALT_CV, null],
		        nextScene:"0001_2"
		    },
		},



		OVERWRITE:{

		},
		ADD:{

		},
		REMOVE:{

		}
	}
}