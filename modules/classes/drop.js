const logger = require("../../lib/logger");

module.exports = class BlueArchiveDrop extends require("./template") {
	static data = new Map();
	constructor (data) {
		super();

		/**
         * Name of the stage that the equipment drop.
         * @type {string}
         */
		this.stageName = data.stageName;

		/**
         * Uniqe identifier of the stage group ID.
         * @type {object}
         */
		this.stageInfo = data.stageInfo ?? {};

		/**
         * The equipment ID on that stage.
         * @type {number}
         */
		this.stageRewardID = data.stageRewardID;

		/**
         * Amount of total equipment drop on the stage
         * @type {number}
         */
		this.dropAmount = data.dropAmount;

		/**
         * The equipment drop chance.
         * @type {number}
         */
		this.dropChance = data.dropChance;
	}

	static get (identifier) {
		if (identifier instanceof BlueArchiveDrop) {
			return identifier;
		}
		else if (typeof identifier === "number") {
			const values = [...BlueArchiveDrop.data.values()];
			const filtered = values.filter(value => value.stageRewardID === identifier);
			return (filtered.length !== 0) ? filtered : [];
		}
		else {
			console.error("Invalid identifier type. Must be a number!", {
				identifier,
				type: typeof identifier
			});
		}
	}

	static getDropByStageID (identifier) {
		if (identifier instanceof BlueArchiveDrop) {
			return identifier;
		}
		else if (typeof identifier === "number") {
			const values = [...BlueArchiveDrop.data.values()];
			const filtered = values.filter(value => value.stageInfo.ID === identifier);
			return filtered;
		}
		else {
			return console.error("Invalid identifier type. Must be a number!", {
				identifier,
				type: typeof identifier
			});
		}
	}

	static async loadData () {
		const data = await ba.Query.get("DropDataMain");
		for (let i = 0; i < data.length; i++) {
			if (data[i].RewardTag === "Default") {
				const getStageName = ba.BlueArchiveStage.getStageByID(data[i].GroupId);
				if (getStageName) {
					getStageName.chapter = getStageName.chapter.replace(/CHAPTER/g, "Chapter ");
					getStageName.subChapter = getStageName.subChapter.replace(/Stage/g, "Stage ");
				}

				const stageName = (getStageName)
					? `${ba.Utils.removeWhitespace(`[${getStageName.difficulty}] ${getStageName.type} ${getStageName.chapter} - ${getStageName.subChapter}`)}`
					: "???";
				
				const dropObj = new BlueArchiveDrop({
					stageName,
					stageInfo: {
						ID: data[i].GroupId
					},
					stageRewardID: data[i].StageRewardId,
					dropAmount: data[i].StageRewardAmount,
					dropChance: data[i].StageRewardProb / 100
				});
    
				BlueArchiveDrop.data.set(i, dropObj);
			}
		}

		logger.warn(`Loaded ${BlueArchiveDrop.data.size} drop data`);
	}

	static destroy () {
		BlueArchiveDrop.data.clear();
	}
};
