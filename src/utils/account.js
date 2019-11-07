class Account {
	constructor(arg) {
		this.name = arg.name;
		this.score = arg.score;
		this.level = arg.level;
		this.equipment = arg.equipment;
		this.isGameRunning = true;
		this.blockchain = arg.blockchain;
		this.history = arg.history;
	}

	setBlockchain = (arg) => {
		this.blockchain.address = arg.address;
		this.blockchain.privateKey = arg.privateKey;
		this.blockchain.tx = arg.tx;
		this.blockchain.data = arg.data;
		this.blockchain.password = arg.password;
	}

	getBlockchain = () => {
		return this.blockchain;
	}

	/**
	 * Build account
	 */
	 nextLevel = () => {
		 this.level += 1;
		 this.save();
	 }

	 getLevel = () => {
		 return this.level;
	 }

	 setScore = (score) => {
		 this.score += Number(score);
		 this.save();
	 }

	 getScore = () => {
		 return this.score;
	 }

	 setEquipment = (item) => {
		 if(this.equipment.length === 0) {
			 this.equipment.push(item);
		 } else {
			 const objIndex = this.equipment.findIndex(obj => obj.id = item.id);

			 if (objIndex > -1) {
				this.equipment[objIndex] = item;
			 } else {
				this.equipment.push(item);
			 }
		 }

		 this.save();
	 }

	 getListEquipment = () => {
		return this.equipment;
	 }

	 getDetailEquipment = (id) => {
		 return this.equipment[id] || {};
	 }

	 /**
	  * Action
	  */
	register = (name, address) => {
		const newNameLocal = `${name}_${address}`

		var isAccount = localStorage.getItem(newNameLocal);

		if (!isAccount === false) {
			this.save();
		}

		return false;
	}

	loadAccount = (name, address) => {
		const newNameLocal = `${name}_${address}`

		var dataAccount = localStorage.getItem(newNameLocal);

		return dataAccount;
	}

	save = () => {
		let nameLocal = this.name;
		
		if (this.blockchain.address) {
			nameLocal += `_${this.blockchain.address}`
		}

		const dataStore = {
			name:  this.name,
			score: this.score,
			level: this.level,
			equipment: this.equipment,
			isGameRunning: this.isGameRunning,
			blockchain: this.blockchain,
			history: this.history,
			timeUpdate: new Date().getTime(),
		}
		
		localStorage.setItem(nameLocal, dataStore)
	}

	destroy = () => {
		let nameLocal = this.name;
		
		if (this.blockchain.address) {
			nameLocal += `_${this.blockchain.address}`
		}

		localStorage.removeItem(nameLocal);
	}
}

export default Account;