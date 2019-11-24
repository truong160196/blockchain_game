import {web3Provider, web3, ethereum} from './web3';

import { Transaction } from 'ethereumjs-tx';

import abi from '../assets/contract/eth.json';

import worker from '../utils/workerfile.js';
import * as Types from '../constant/ActionTypes';

import workerSetup from '../utils/workerSetup';

class Blockchain {
    constructor(url, arg, dispatch) {
        this.urlBase = url;
        this.config = arg;
        this.currentAccount = null;
        this.chanId = null;
        this.listAccount = [];
        this.isChange = false;
        this.dispatch = dispatch;
        this.typeHash = 'string';
        this.contractAddress = Types.CONTRACT_ADDRESS;
        this.accountHolder = Types.ADDRESS_OWNER;
        this.privateKeyHolder = Types.PRIVATE_KEY;
        this.connected = false;
    }

    init = () => {
        return new Promise(async(resolve, reject) => {
            if (!web3) {
              // show error: Install Metamask
                reject('No web3? Please use google chrome and metamask plugin to enter this Dapp!', null, null)
                return;
            }

            if (!this.web3Provider && this.connected === false) {
                let web3Url = web3.currentProvider;

                if (this.urlBase) {
                    web3Url = new web3Provider.providers.HttpProvider(this.urlBase)
                }

                this.web3Provider = new web3Provider(web3Url);

                this.worker = new workerSetup(worker);

                const options = {
                    gasPrice: 3000000,
                }
                this.contract = new this.web3Provider.eth.Contract(abi, this.contractAddress, options)
            }

            this.connected = true;
            resolve();
          }).catch((err) => {
            throw new Error(err);
        })
    }

    connectMetaMask = async() => {
        if (this.web3Provider) {
            const netId = await this.web3Provider.eth.net.getId();
            this.chanId = netId;
            switch (netId) {
              case 1:
                this.chain = 'mainnet';
                break
              case 42:
                this.chain = 'kovan';
                break
              case 3:
                this.chain = 'ropsten';
                break
             case 4:
                this.chain = 'rinkeby';
                break
            case 5:
                this.chain = 'goerli';
                break
              default:
                console.log('This is an unknown network.')
            }
        }
        
        ethereum.on('accountsChanged', async(accounts) => {
            if (accounts.length === 0) {
                console.error('Please connect to MetaMask.')
            } else {
                this.addToListAccount(accounts[0])

                if (this.currentAccount !== accounts[0]) {
                    this.currentAccount = accounts[0]; 

                    await this.getBalance(accounts[0]);
                }
            }
        })
        
        ethereum.on('networkChanged',  async(netId) => {
            if (this.chanId !== netId) {
                this.chanId = netId;
            }
        })
    }

    enableMetaMask = async() => {
        return new Promise(async(resolve, reject) => {
            if (!web3) {
              // show error: Install Metamask
                reject('No web3? Please use google chrome and metamask plugin to enter this Dapp!', null, null)
                return;
            }

            if (web3.currentProvider.selectedAddress === null) {
                await web3.currentProvider.enable();
            }
            resolve();
          }).catch((err) => {
            throw new Error(err);
        })
    }

    changeProvider = (provider) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            if (this.connected === true) {
                if (provider) {
                    this.web3Provider.setProvider(provider);
                } else {
                    this.web3Provider.setProvider(window.web3.currentProvider);
                }
            } else {
                this.urlBase = provider;
                await this.init();
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

            this.worker.addEventListener('message', function(e) {
                console.log(e.data);
            })

            const account = await this.getCurrentAccount();

            this.subscription = this.web3Provider.eth.subscribe('logs', {
                address: null,
                topics: null
            }, (error, result) => {
                if (error) {
                    console.error(error);
                }
                // console.log(result);
            })
            .on("connected", (subscriptionId) => {
                // console.log('subscriptionId', subscriptionId);
            })
            .on("data", (log) => {
                if (log.address === account) {
                    console.log('data: ', log);
                }
            })
            .on("changed", (log) => {
                console.log('changed: ', log)
            });
    
            this.subscriptions = this.web3Provider.eth.subscribe('newBlockHeaders', (error, sync) => {
                // if (!error)
                    // console.log('sync', sync);
            })
            .on("data", this.syncData)
            .on("changed", function(isSyncing){
                console.log('isSyncing',isSyncing)
                if(isSyncing) {
                    // stop app operation
                } else {
                    // regain app operation
                }
            });

            resolve();
        }).catch((err) => {
            throw new Error(err);
        })
    }

    syncData = async(data) => {
        const account = await this.getCurrentAccount();
        await this.getBalance(account);

        if (data) {
            const thisTransaction = await this.getTransactionFromBlock(data.number);

            if (thisTransaction.data && thisTransaction.data.hash) {
                const thisTransactionReceipt = await this.getTransactionReceipt(thisTransaction.data.hash)

                if (thisTransactionReceipt.data && (
                    thisTransactionReceipt.data.to === account
                    || thisTransactionReceipt.data.from === account
                    )) {
                    //
                    console.log(thisTransactionReceipt);
                    // this.dispatch({transaction: data})
                }
            }
        }

        // this.worker.postMessage(data)
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

    updateAccount = async(data) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const gasPrice = await this.getGasPrice();
            const address = await this.getCurrentAccount();
            this.web3Provider.eth.getTransactionCount(address, (err, txCount) => {
                this.contract.methods.updateAccount(data.userName, web3.toHex(data.score)).estimateGas(address)
                .then((gasAmount) => {

                    const txObject = {
                        nonce:    web3.toHex(txCount),
                        gasLimit: web3.toHex(gasAmount), // Raise the gas limit to a much higher amount
                        gasPrice: web3.toHex(gasPrice),
                        from: address,
                        to: this.contractAddress,
                      }

                      this.contract.methods.updateAccount(data.userName, web3.toHex(data.score))
                      .send(txObject)
                      .on('transactionHash', function(hash){
                            resolve({
                                status: true,
                                message: 'Update account success',
                                transactionHash: hash,
                            });
                        })
                        .on('error', function(error, receipt) {  
                            resolve({
                                status: false,
                                message: 'Update account fail',
                            });
                        });

                })
                .catch(function(error){
                    resolve({
                        status: false,
                        message: 'Update account fail',
                    });
                   console.error(error);
                });
            });
        }).catch((err) => {
            throw new Error(err);
        });
    }

    buyItem =  async(inputRequest) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }
            const gasPrice = await this.getGasPrice();

            const address = await this.getCurrentAccount();

            this.contract.methods.updateItem(
                inputRequest.id,
                inputRequest.qtyItem,
                inputRequest.price
            ).estimateGas({from: address})
            .then((gasAmount) => {
                this.web3Provider.eth.getTransactionCount(address, (err, txCount) => {
                    const txObject = {
                        nonce:    web3.toHex(txCount),
                        gasLimit: web3.toHex(gasAmount),
                        gasPrice: web3.toHex(gasPrice),
                        from: address,
                        to: this.contractAddress,
                    }

                    this.contract.methods.updateItem(
                        inputRequest.id,
                        inputRequest.qtyItem,
                        inputRequest.price
                    ).send(txObject, (err, result) => {
                        if (err) resolve({status: false, message: err});
                        resolve({status: true, message: result});
                    });
                })
            }).catch((err) => {
                console.error(err)
                reject(err.message);
            });
        }).catch((err) => {
                throw new Error(err);
        });
    }

    sellItem =  async(inputRequest) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }
            const gasPrice = await this.getGasPrice();

            const address = await this.getCurrentAccount();

            this.contract.methods.transferItem(
                inputRequest.address,
                inputRequest.price,
                inputRequest.qtyItem,
                inputRequest.id,
                inputRequest.id_order,
            ).estimateGas({from: address})
            .then((gasAmount) => {
                this.web3Provider.eth.getTransactionCount(address, (err, txCount) => {
                    const txObject = {
                        nonce:    web3.toHex(txCount),
                        gasLimit: web3.toHex(gasAmount),
                        gasPrice: web3.toHex(gasPrice),
                        from: address,
                        to: this.contractAddress,
                    }

                    this.contract.methods.transferItem(
                        inputRequest.address,
                        inputRequest.price,
                        inputRequest.qtyItem,
                        inputRequest.id,
                        inputRequest.id_order,
                    ).send(txObject, (err, result) => {
                        if (err) resolve({status: false, message: err.message});
                        resolve({status: true, message: result});
                    });
                })
            }).catch((err) => {
                console.error(err)
                reject(err.message);
            });
        }).catch((err) => {
                throw new Error(err);
        });
    }

    orderItem =  async(inputRequest) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }
            const gasPrice = await this.getGasPrice();

            const address = await this.getCurrentAccount();

            this.contract.methods.updateStore(
                inputRequest.id,
                inputRequest.qtyItem,
                inputRequest.price
            ).estimateGas({from: address})
            .then((gasAmount) => {
                this.web3Provider.eth.getTransactionCount(address, (err, txCount) => {
                    const txObject = {
                        nonce:    web3.toHex(txCount),
                        gasLimit: web3.toHex(gasAmount),
                        gasPrice: web3.toHex(gasPrice),
                        from: address,
                        to: this.contractAddress,
                    }

                    this.contract.methods.updateStore(
                        inputRequest.id,
                        inputRequest.qtyItem,
                        inputRequest.price
                    ).send(txObject, (err, result) => {
                        if (err) resolve({status: false, message: err});
                        resolve({status: true, message: result});
                    });
                })
            }).catch((err) => {
                console.error(err)
                reject(err.message);
            });
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

     loginWithMetaMask = async() => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            if (!web3) {
                reject('GET CHROME EXTENSION: https://metamask.io/');
                return;
            }
            const currentAccount = await this.getCurrentAccount();

            if (currentAccount) {
                const dataFromBlockchain = await this.getDataInputSmartContract();
                resolve({
                    message: 'Login MetaMask success',
                    status: true,
                    data: dataFromBlockchain
                });
            } else {
                resolve({
                    message: 'Please register new account',
                    status: true,
                });
            }
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
            
            let addressTo = address;

            if (!address) {
                addressTo = await this.getCurrentAccount();
            }

            let balance = await this.web3Provider.eth.getBalance(addressTo);

            const result = await web3.fromWei(balance, 'ether');

            this.dispatch({balance: result});

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        })
     }

     getBalanceToken = async() => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const address = await this.getCurrentAccount();

            let balance = await this.contract.methods.balanceOf(address).call();

            const result = await web3.fromWei(balance, 'wei');

            this.dispatch({balance: result});

            resolve(result);
        }).catch((err) => {
            throw new Error(err);
        })
     }

     getDataInputSmartContract = () => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }
            const address = await this.getCurrentAccount();

            if (address) {
                const result = await this.contract.methods.getAccount(address).call();
                resolve({
                    user_name: result.user_name,
                    score: result.score,
                })
            }
            resolve(false)
        }).catch((err) => {
            throw new Error(err);
        })
     }

     getDataInputStoreContract = () => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const result = await this.contract.methods.getStore().call();
            resolve(result)

        }).catch((err) => {
            throw new Error(err);
        })
     }

     getAccountItemFromAddress = async() => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }
            const address = await this.getCurrentAccount();

            if (address) {
                const result = await this.contract.methods.getItem(address).call();
                console.log(result)
                resolve(result);
                return;
            } 

            resolve(false)
        }).catch((err) => {
            throw new Error(err);
        });
     }

     validateAddress = () => {

     }

     getFreeToken = async() => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const gasPrice = await this.getGasPrice();

            const address = await this.getCurrentAccount();

            const balanceToken = await this.getBalanceToken();

            if (balanceToken == 0) {
                this.web3Provider.eth.getTransactionCount(this.accountHolder, (err, txCount) => {
                    this.contract.methods.transfer(address, 200).estimateGas({
                        from: this.accountHolder
                    })
                    .then((gasAmount) => {
                        const dataInput =  this.contract.methods.transfer(address, 200).encodeABI();
                        const txObject = {
                            nonce:    web3.toHex(txCount),
                            gasLimit: web3.toHex(gasAmount), // Raise the gas limit to a much higher amount
                            gasPrice: web3.toHex(gasPrice),
                            to: this.contractAddress,
                            data: dataInput,
                          }
    
                          const privateKey1 = Buffer.from(this.privateKeyHolder, 'hex')
            
                          const tx = new Transaction(txObject, { chain: this.chain, hardfork: 'petersburg' });
    
                          tx.sign(privateKey1)
                        
                          const serializedTx = tx.serialize()
                          const raw = '0x' + serializedTx.toString('hex')
            
                          this.web3Provider.eth.sendSignedTransaction(raw, (err, txHash) => {
                            if (err) resolve({status: false, message: err});
                            resolve({status: true, message: txHash});
                          });
                    })
                    .catch(function(error){
                       reject(error)
                    });
                });
            } else {
                resolve({status: false, message: 'can not get token more!'})
            }

        }).catch((err) => {
            throw new Error(err);
        });
    }

    sendToken =  async(toAddress, value) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const validAddress = this.web3Provider.utils.isAddress(toAddress);

            if (validAddress === true) {
                const gasPrice = await this.getGasPrice();

                const address = await this.getCurrentAccount();

                this.contract.methods.transfer(
                    toAddress,
                    value,
                ).estimateGas({from: address})
                .then((gasAmount) => {
                    this.web3Provider.eth.getTransactionCount(address, (err, txCount) => {
                        const txObject = {
                            nonce:    web3.toHex(txCount),
                            gasLimit: web3.toHex(gasAmount),
                            gasPrice: web3.toHex(gasPrice),
                            from: address,
                            to: this.contractAddress,
                        }

                        this.contract.methods.transfer(
                            toAddress,
                            value,
                        ).send(txObject, (err, result) => {
                            if (err) resolve({status: false, message: err});
                            resolve({status: true, message: result});
                        });
                    })
                }).catch((err) => {
                    console.error(err)
                    reject(err.message);
                });
            } else {
                resolve({ status: false, message: 'Invalid address' });
            }
        }).catch((err) => {
            throw new Error(err);
        });
    }

     sendTransaction = (toAddress, value, data) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const validAddress = this.web3Provider.utils.isAddress(toAddress);

            if (validAddress === true) {
                const address = await this.getCurrentAccount();
            
                const gasPrice = await this.getGasPrice();
    
                this.config.gasPrice = gasPrice;
    
                const valueSend = this.convertValueToEther(value);
    
                this.web3Provider.eth.sendTransaction({
                    from: address,
                    gasPrice: gasPrice,
                    gas: this.config.gas,
                    to: toAddress,
                    value: valueSend,
                    data: data
                    }, (err, transactionHash) => {
                        if (err) {
                            resolve({ status: false, message: err });
                        }
                        resolve({ status: true, message: transactionHash })
                    });
            } else {
                resolve({ status: false, message: 'Invalid address' });
            }

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
            const transactionDetail = await this.web3Provider.eth.getTransaction(txHash)

            resolve({data: transactionDetail});
        }).catch((err) => {
            throw new Error(err);
        });
     }

     getAllTransaction = async() => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            this.contract.getPastEvents(
                'allEvents',
                {
                  fromBlock: 0,
                  toBlock: 'latest',
                  address: this.contractAddress,
                },
                (err, events) => {
                    if (!err) {
                        console.log(events);
                        this.getInputDataFromTransaction();
                    }
                }
            )

            resolve();
        }).catch((err) => {
            throw new Error(err);
        });
     }

     getTransactionReceipt = async(txHash) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }
            const transactionReceipt = await this.web3Provider.eth.getTransactionReceipt(txHash)

            resolve({data: transactionReceipt});
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

     getInputDataFromTransaction = async(txHash) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }
            const dataInput = await this.getTransaction(txHash)

            if (dataInput && dataInput.data && dataInput.data.input)  {
                let dataDecoding = this.web3Provider.eth.abi.decodeParameter(this.typeHash, dataInput.data.input);
   
                resolve({data: JSON.parse(dataDecoding)});
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