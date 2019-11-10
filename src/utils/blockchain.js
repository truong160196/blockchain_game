import {web3Provider, web3} from './web3';

import abi from '../assets/contract/eth.json';

class Blockchain {

    constructor(url, arg) {
        this.urlBase = url;
        this.config = arg;
    }

    init = () => {
        return new Promise((resolve, reject) => {
            if (!web3) {
              // show error: Install Metamask
                reject('no web3')
                return;
            }

            if (!this.web3Provider) {
              this.web3Provider = new web3Provider(this.urlBase || window.web3.currentProvider);
            }

            console.log(this.web3Provider.eth.coinbase);
            // if (!this.web3Provider.eth.coinbase) {
            //   // show error: Activate Metamask
            //   return;
            // }
       
            console.log(this.web3Provider.version.network);

            // if (+this.web3Provider.version.network !== this.config.ethereumNetworkId) {
            //   // show error: Wrong network
            //   return;
            // }
       
            resolve();
          }).catch((err) => {
            throw new Error(err);
        })
    }

    validateProvider = () => {
        console.log(this.web3Provider.currentProvider.isMetaMask)
        if (this.web3Provider.currentProvider.isMetaMask === true) {
            console.log('a')
        }
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
                    console.log(sync);
            })
            .on("data", function(sync){
                console.log(sync)
                // show some syncing stats
            })
            .on("changed", function(isSyncing){
                console.log(isSyncing)
                if(isSyncing) {
                    // stop app operation
                } else {
                    // regain app operation
                }
            });
    
            // this.subscription1 = this.web3Provider.eth.subscribe('pendingTransactions', function(error, result){
            //     if (!error)
            //         console.log(result);
            // })
            // .on("data", function(transaction){
            //     console.log(transaction);
            // });

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

    getAllAccount = async() => {
        return new Promise(async(resolve, reject) => {
            if (!web3) {
              reject('no web3');
              return;
            }

            const listAccount = await this.web3Provider.eth.getAccounts();

            resolve(listAccount);
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
            resolve(account);
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
                gasPrice: this.config.gasPrice,
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

            resolve(trx);
        }).catch((err) => {
            throw new Error(err);
        });
     }

     /**
      * Util
      */
    convertValueToEther = (value) => {
        return new Promise(async(resolve, reject) => {
            if (!web3) {
                reject('no web3');
                return;
            }

            const result =  web3.toWei(value, "ether");

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        })
    }

    convertEtherToValue = (value) => {
        return new Promise(async(resolve, reject) => {
            if (!web3) {
                reject('no web3');
                return;
            }

            const result = web3.fromWei(value, "ether");

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        })
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