import * as Types from '../constant/ActionTypes';

class Account {
	constructor(arg) {
		this.name = arg.name || `Player_${new Date().getTime()}`;
		this.score = arg.score || 0;
		this.gold = arg.gold || 0;
		this.level = arg.level || 1;
		this.equipment = arg.equipment || [];
		this.isGameRunning = true;
		this.blockchain = arg.blockchain;
		this.history = arg.history;
		this.nameStorage = Types.KEY_LOCALSTORAGE;
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

	 setGold = (value) => {
		this.getGold = value;
	 }
	 getGold = () => {
		 return this.getGold;
	 }

	/**
	 * Action
	 */
	register = (userName, address) => {
		return new Promise(async(resolve, reject) => {
            if (!userName) {
				resolve({status: false, message: 'username can not empty'});
              return;
			}
			
			var isAccount = await this.getAccountDetail(userName);
			if (!isAccount) {
				this.name = userName;
				this.score = 0;
				this.level = 0;
				this.equipment = [];
				this.isGameRunning = true;
				this.blockchain = {
					address: address,
					friend: [],
					transaction: []
				};
				this.history = {};
				const status = await this.save();

				if (status) {
					resolve({status: true, message: 'Register account success!'});
				} else {
					resolve({status: false, message: 'Register account fail!'});
				}
			} else {
				resolve({status: false, message: `Account ${userName} exits!`});
			}
	
			resolve({status: false, message: 'Register account fail!'});
        }).catch((err) => {
            throw new Error(err);
        })
	}

	login = async(account) => {
		let currentAccount = {};

		if (account) {
			currentAccount = this.getAccountDetail(account);
		} else {
			const allAccount = await this.getAllAccount();

			if (this.checkExitsObject(allAccount) === true) {
				allAccount.map((item) => {
					if (item.isGameRunning === true) {
						currentAccount = item;
					}
					return null;
				})
			}
		}

		if (currentAccount) {
			this.name = currentAccount.name;
			this.score = currentAccount.score;
			this.level = currentAccount.level;
			this.equipment = currentAccount.equipment;
			this.isGameRunning = currentAccount.isGameRunning;
			this.blockchain = currentAccount.blockchain;
			this.history = currentAccount.history;
		}

		return currentAccount;
	}

	logout = () => {
		this.isGameRunning = false;
		this.save();
	}

	save = async() => {
		return new Promise(async(resolve, reject) => {
				if (!this.blockchain) {
					resolve(false);
					return;
				}

				let nameLocal = this.name;

				const dataStore = await this.getAllAccount();
				dataStore[nameLocal] = {
					name:  this.name,
					score: this.score,
					gold: this.gold,
					level: this.level,
					equipment: this.equipment,
					isGameRunning: this.isGameRunning,
					blockchain: this.blockchain,
					history: this.history,
					timeUpdate: new Date().getTime(),
				}
			
				localStorage.setItem(this.nameStorage, JSON.stringify(dataStore))
				resolve(true);
        }).catch((err) => {
            throw new Error(err);
        })
	}

	setDataUser(account) {
		return new Promise(async(resolve, reject) => {
			if (!account) {
				resolve(false);
				return;
			}

			const getAllAccount = await this.getAllAccount();

			if (getAllAccount) {
				getAllAccount[account.name] = account;

				localStorage.setItem(this.nameStorage, JSON.stringify(getAllAccount));

				resolve(getAllAccount[account.name]);
			} 

		}).catch((err) => {
			throw new Error(err);
		})
	}

	getAllAccount = () => {
		return new Promise(async(resolve, reject) => {
			if (!this.nameStorage) {
				resolve(false);
				return;
			}
			const dataStore = localStorage.getItem(this.nameStorage);

			if (!dataStore) {
				resolve({});
			}

			resolve(JSON.parse(dataStore));
		}).catch((err) => {
			throw new Error(err);
		})
	}

	getAccountDetail = async(account) => {
		return new Promise(async(resolve, reject) => {
			if (!account) {
				reject('account not empty');

				return;
			}

			const allAccount = await this.getAllAccount();

			if (this.checkExitsObject(allAccount) === true) {
				resolve(allAccount[account]);
			}

			resolve(false);
		}).catch((err) => {
			throw new Error(err);
		})
	}

	destroy = async() => {
		let nameLocal = this.name;

		const allAccount = await this.getAllAccount(0)

		if (allAccount && allAccount[nameLocal]) {
			delete allAccount[nameLocal]
		}
		
		localStorage.setItem(this.nameStorage, allAccount);
	}

	checkExitsObject = (obj) => {
		return Object.keys(obj).length > 0;
	}
 }

export default Account;