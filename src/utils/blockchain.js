import {web3Provider, web3, ethereum} from './web3';

import abi from '../assets/contract/eth.json';

class Blockchain {

    constructor(url, arg) {
        this.urlBase = url;
        this.config = arg;
        this.currentAccount = null;
        this.chanId = null;
        this.listAccount = [];
        this.isChange = false;
    }

    init = () => {
        return new Promise((resolve, reject) => {
            if (!web3) {
              // show error: Install Metamask
                reject('No web3? Please use google chrome and metamask plugin to enter this Dapp!', null, null)
                return;
            }

            if (!this.web3Provider) {
                let web3Url = web3.currentProvider;

                if (this.urlBase) {
                    web3Url = new web3Provider.providers.HttpProvider(this.urlBase)
                }

                this.web3Provider = new web3Provider(web3Url);
            }

            if (web3.currentProvider.selectedAddress === null) {
                web3.currentProvider.enable();
            }

            resolve();
          }).catch((err) => {
            throw new Error(err);
        })
    }

    connectMetaMask = async() => {
        ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                console.error('Please connect to MetaMask.')
            } else {
                this.addToListAccount(accounts[0])

                if (this.currentAccount !== accounts[0]) {
                    this.currentAccount = accounts[0];              
                }
            }
            // console.log(accounts)
        })
        
        ethereum.on('networkChanged',  (netId) => {
            if (this.chanId !== netId) {
                this.chanId = netId;
            }
        })
      }

    changeProvider = (provider) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            if (provider) {
                this.web3Provider.setProvider(provider);
            } else {
                this.web3Provider.setProvider(window.web3.currentProvider);
            }

            resolve();
        }).catch((err) => {
            throw new Error(err);
        });
    }

    subscribe = (type, address, topics) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
              reject('no provider');
              return;
            }

            this.subscription = this.web3Provider.eth.subscribe('logs', {
                address: address,
                topics: topics
            }, (error, result) => {
                if (error) {
                    console.error(error);
                }
                console.log(result);
            })
            .on("connected", (subscriptionId) => {
                console.log('subscriptionId', subscriptionId);
            })
            .on("data", (log) => {
                console.log('data: ', log);
            })
            .on("changed", (log) => {
                console.log('changed: ', log)
            });
    
            this.subscriptions = this.web3Provider.eth.subscribe('newBlockHeaders', function(error, sync){
                if (!error)
                    console.log('sync', sync);
            })
            .on("data", function(sync){
                console.log('data sync', sync)
                // show some syncing stats
            })
            .on("changed", function(isSyncing){
                console.log('isSyncing',isSyncing)
                if(isSyncing) {
                    // stop app operation
                } else {
                    // regain app operation
                }
            });
    
            this.subscription1 = this.web3Provider.eth.subscribe('pendingTransactions', function(error, result){
                if (!error)
                    console.log(result);
            })
            .on("data", function(transaction){
                console.log('pending transaction', transaction);
            });

        }).catch((err) => {
            throw new Error(err);
        })
    }

    unSubscribe = () => {
        // unsubscribes the subscription
        return new Promise(async(resolve, reject) => {
            if (!this.subscription) {
              reject('no subscription');
              return;
            }
            this.subscription.unsubscribe((error, success) => {
                if(success) {
                    resolve('Successfully unsubscribed!');
                } else {
                    reject(error)
                }
            });
        }).catch((err) => {
            throw new Error(err);
        })
    }

    addToListAccount = (account) => {
        if (typeof account !== 'string') return;

        const objIndex = this.listAccount.findIndex(obj => obj.toLowerCase() === account.toLowerCase());

        if (objIndex === -1) {
            this.listAccount.push(account);
        }
    }

    removeToListAccount = (account) => {
        const objIndex = this.listAccount.findIndex(obj => obj === account);

        if (objIndex > -1) {
            this.listAccount.slice(objIndex, 0);
        }
    }

    getAllAccount = async() => {
        return new Promise(async(resolve, reject) => {
            if (!web3) {
              reject('no web3');
              return;
            }

            const listAccountMetaMask = await this.web3Provider.eth.getAccounts();

            listAccountMetaMask.forEach(element => {
                this.addToListAccount(element);
            });

            resolve({data: this.listAccount});
        }).catch((err) => {
            throw new Error(err);
        })
    }

    getCurrentAccount = async() => {
        return new Promise(async(resolve, reject) => {
            if (!web3) {
              reject('no web3');
              return;
            }

            const account = await web3.eth.defaultAccount;

            if (account) {
                this.currentAccount = account;

                this.addToListAccount(account);
            }

            resolve(this.currentAccount);
        }).catch((err) => {
            throw new Error(err);
        })
    }

    importAccountByPrivateKey = async(privateKey) => {
          return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            let data = privateKey;

            if(privateKey.indexOf('0x') < 0) {
                data = `0x${privateKey}`
            }
    
            const result = await this.web3Provider.eth.accounts.privateKeyToAccount(data);
            
            if(result.address) {
                this.addToListAccount(result.address);
            }

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        });
    }

    signTransactionAccount = async(address, value, privateKey) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const txData = {
                to: address,
                value: this.convertValueToEther(value),
                gasPrice: this.config.gasPrice,
                gas: this.config.gas,
                nonce: 0,
              };
    
            const result = await this.web3Provider.eth.accounts.signTransaction(txData, privateKey);

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        });
    }

    recoverTransactionAccount = async(hash) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const result = await this.web3Provider.eth.accounts.recoverTransaction(hash);

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        });
    }

    hashMessageAccount = async(message) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const result = await this.web3Provider.eth.accounts.hashMessage(message);

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        });
    }

    /**
     * Wallet
     */

     getAllWallet = async() => {
         return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const result = await this.web3Provider.eth.accounts.wallet;

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        });
     }

     addAccount = async(account) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }
            let accountData = account;

            if (typeof account === 'string') {
               if(account.indexOf('0x') < 0) {
                   accountData = `0x${account}`
               }
            }
   
            if (typeof account === 'object' && account.privateKey) {
                if(account.privateKey.indexOf('0x') < 0) {
                   accountData.privateKey = `0x${account.privateKey}`
               }
            }
   
           const result = await this.web3Provider.eth.accounts.wallet.add(accountData);
   
           if (result) {
                this.addToListAccount(account);
            }

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        });
     }

     removeAccount = async(account) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const result = await this.web3Provider.eth.accounts.wallet.remove(account);

            if (result) {
                this.removeToListAccount(account);
            }

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        });
     }

     clearAllAccount = async() => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const result = await this.web3Provider.eth.accounts.wallet.clear();

            if (result) {
                this.listAccount = [];
            }

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        });
     }

     createNewAccount = async(password) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const result = await this.web3Provider.eth.personal.newAccount(password)

            if (result) {
                this.addToListAccount(result);
            }

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        });
     }

     getBalance = async(address) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            let balance = await this.web3Provider.eth.getBalance(address);

            resolve(web3.fromWei(balance, 'ether'));
        }).catch((err) => {
            throw new Error(err);
        })
     }

     sendTransaction = (fromAddress, toAddress, value, data) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }
            
            const gasPrice = await this.getGasPrice();

            this.config.gasPrice = gasPrice;

            const valueSend = this.convertValueToEther(value);

            this.web3Provider.eth.sendTransaction({
                from: fromAddress,
                gasPrice: gasPrice,
                gas: this.config.gas,
                to: toAddress,
                value: valueSend,
                data: data
                }, (err, transactionHash) => {
                    if (err) {
                        resolve({ err });
                    }

                    resolve({ transactionHash })
                });
            }).catch((err) => {
                throw new Error(err);
            });
     }

     getTransaction = async(txHash) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const trx = await this.web3Provider.eth.getTransaction(txHash)

            resolve({data: trx});
        }).catch((err) => {
            throw new Error(err);
        });
     }

     getTransactionFromBlock =  async(blockNumber) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const blockData = await this.web3Provider.eth.getBlock(blockNumber);

            if (blockData && blockData.transactions && blockData.transactions.length > 0) {
                const transactionDetail = await this.getTransaction(blockData.transactions[0]);

                resolve(transactionDetail);
            } else {
                resolve({error: 'null data'});
                return; 
            }
        }).catch((err) => {
            throw new Error(err);
        }); 
     }

     /**
      * Util
      */
    convertValueToEther = (value) => {
        if (!web3) {
            return 0;
        }

        return web3.toWei(value, "ether");
    }

    convertEtherToValue = (value) => {
        if (!web3) {
            return 0;
        }

        return web3.fromWei(value, "ether");
    }

    getGasPrice = () => {
        return new Promise((resolve, reject) => {
            if (!web3) {
                reject('no web3');
                return;
            }

            web3.eth.getGasPrice((error, result) => {
                if(!error) {
                  resolve(result.toString(10));
                }
                else {
                  reject(error);
                }
            });
        }).catch((err) => {
            throw new Error(err);
        });
    }
}

export default Blockchain;