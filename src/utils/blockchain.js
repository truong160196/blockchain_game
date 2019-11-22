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
        // this.contractAddress = '0xBc112511caD2108B83e7828244D283C8cCb4699c' || '0x8da69Da19fF8BbEbB7cd222B326D91381DaD1879';
        // this.contractAddress = '0xB79ade18aFA7F2Cae6C181500e9B47A774f82a78';
        this.contractAddress = '0xb1d76cb3f39561F2CA5D5db329B7D50b0DFeD348';
        this.accountHolder = '0x4C84c7489126865688ADe51e8c8e1be1f5C6Afb7';
        this.privateKeyHolder = '7AD02C134A2F77AE812E0A5F45F533330EE47A93BF56CEB2BB9A18E14ACFE615';
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

                this.contract = new this.web3Provider.eth.Contract(abi, this.contractAddress)

                this.dataBlockchain = await this.getDataInputSmartContract();
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

            const filter = web3.eth.filter('latest');
            filter.watch(async(err, res) => {
                if (!err) {
                    const account = await this.getCurrentAccount();

                    const balance = await this.getBalance(account);
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

    convertDataBlockchain = (input) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            if (!input) {
                resolve(false)
                return;
            }

            const dataFromBlockChain = await this.getDataInputSmartContract();
            const objIndex= dataFromBlockChain.account.findIndex(obj => obj.username === input.username);

            if (input && input.type) {
                switch (input.type) {
                    case Types.DATA_TYPE.ACCOUNT:
                        dataFromBlockChain.account.push(input.data)
                        break;
                    case Types.DATA_TYPE.STORE_BUY:
                        if (objIndex > -1) {
                            dataFromBlockChain.account[objIndex] = input.data;   
                        }

                        break;
                    case Types.DATA_TYPE.STORE_ORDER:
                        if (objIndex > -1) {
                            dataFromBlockChain.account[objIndex] = input.data;   
                        }

                        dataFromBlockChain.store.push(input.item)

                        break;
                    case Types.DATA_TYPE.STORE_SELL:
                            if (objIndex > -1) {
                                dataFromBlockChain.account[objIndex] = input.data;   
                            }

                            const objIndexStore = dataFromBlockChain.store.findIndex(obj => obj.product === input.item.product);
                            if (objIndexStore > -1) {
                                dataFromBlockChain.store[objIndexStore].qtyItem -= input.item.qtyItem;

                                if (dataFromBlockChain.store[objIndexStore].qtyItem === 0) {
                                    dataFromBlockChain.store.splice(objIndexStore, 1);
                                }
                            }

                            break;
                
                    default:
                        break;
                }
            }


            resolve(dataFromBlockChain);
        }).catch((err) => {
            throw new Error(err);
        });
    }

    signData = async(data, value) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const dataConvert = await this.convertDataBlockchain(data);
            const gasPrice = await this.getGasPrice();
            if (dataConvert) {
                this.web3Provider.eth.getTransactionCount(this.accountHolder, (err, txCount) => {
                    this.contract.methods.setData(JSON.stringify(dataConvert)).estimateGas(this.accountHolder)
                    .then((gasAmount) => {
                        const dataInput = this.contract.methods.setData(JSON.stringify(dataConvert)).encodeABI();
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
                            if (err) reject(err);
                            console.log('transaction hash: ', txHash)
                            resolve({transaction: {
                                txHash: txHash,
                            }});
                          });
                    })
                    .catch(function(error){

                       console.error(error);
                    });
                });
            };

            resolve(false)

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
                this.contract.methods.updateAccount(address, data.userName, web3.toHex(data.score)).estimateGas(address)
                .then((gasAmount) => {

                    const txObject = {
                        nonce:    web3.toHex(txCount),
                        gasLimit: web3.toHex(gasAmount), // Raise the gas limit to a much higher amount
                        gasPrice: web3.toHex(gasPrice),
                        from: address,
                        to: this.contractAddress,
                      }

                      this.contract.methods.updateAccount(address, data.userName, web3.toHex(data.score))
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
                address,
                inputRequest.id,
                inputRequest.qtyItem,
                inputRequest.price
            ).estimateGas(address)
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
                        address,
                        inputRequest.id,
                        inputRequest.qtyItem,
                        inputRequest.price
                    ).send(txObject, (err, result) => {
                        if (err) console.error(err);
                        console.log(result);
                    });
                })
            }).catch((err) => {
                throw new Error(err);
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
            const dataConvert = await this.convertDataBlockchain(inputRequest);

            const gasPrice = await this.getGasPrice();

            const dataInput = this.contract.methods.setData(JSON.stringify(dataConvert)).encodeABI();
            
            this.web3Provider.eth.getTransactionCount(this.accountHolder, (err, txCount) => {
            this.contract.methods.setData(JSON.stringify(dataConvert)).estimateGas(this.accountHolder)
            .then(async(gasAmount) => {
                    const txObject = {
                        nonce:    web3.toHex(txCount),
                        gasLimit: web3.toHex(gasAmount), // Raise the gas limit to a much higher amount
                        gasPrice: web3.toHex(gasPrice),
                        from: this.accountHolder,
                        to: this.contractAddress,
                        data: dataInput,
                    }

                    const privateKey1 = Buffer.from(this.privateKeyHolder, 'hex')
        
                    const tx = new Transaction(txObject, { chain: this.chain, hardfork: 'petersburg' });

                    tx.sign(privateKey1)
                    
                    const serializedTx = tx.serialize()
                    const raw = '0x' + serializedTx.toString('hex')
        
                    this.web3Provider.eth.sendSignedTransaction(raw, async(err, txHash) => {
                        if (err) reject(err);
                        if (txHash) {
                            const dataSend = await this.sendTransaction(inputRequest.item.address, inputRequest.item.price, dataInput);
                            console.log(dataSend);

                            if (dataSend.transactionHash) {
                                resolve({txHash: dataSend.transactionHash, transaction: txHash});
                            }
                        }
                    });
                })
            })
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
            const dataConvert = await this.convertDataBlockchain(inputRequest);

            const gasPrice = await this.getGasPrice();

            const address = await this.getCurrentAccount();

            const dataInput = this.contract.methods.setData(JSON.stringify(dataConvert)).encodeABI();

            this.web3Provider.eth.getTransactionCount(address, (err, txCount) => {
            this.contract.methods.setData(JSON.stringify(dataConvert)).estimateGas(address)
            .then(async(gasAmount) => {
                    const txObject = {
                        nonce:    web3.toHex(txCount),
                        gasLimit: web3.toHex(gasAmount), // Raise the gas limit to a much higher amount
                        gasPrice: web3.toHex(gasPrice),
                        from: address,
                        to: this.contractAddress,
                        data: dataInput,
                    }

                    this.web3Provider.eth.sendTransaction(txObject, (err, transactionHash) => {
                            if (err) {
                                resolve({ err });
                            }
                            console.log(transactionHash);
        
                            resolve({ txHash: transactionHash })
                        });
                })
            })

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

     checkExitsAccount = async(username, address) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const dataFromBlockchain = await this.getDataInputSmartContract();
            if (dataFromBlockchain && dataFromBlockchain.account) {
                const findObjUserName = dataFromBlockchain.account.findIndex(obj => obj.name === username);
                const findObjAddress = dataFromBlockchain.account.findIndex(obj => obj.blockchain.address === address);

                if (findObjUserName < 0 && findObjAddress < 0) {
                    resolve(true);
                } else {
                    if (findObjAddress > -1 && findObjUserName > -1 ) resolve({
                        message: 'Account exits',
                        status: true,
                        data: dataFromBlockchain.account[findObjUserName]
                    });

                    if (findObjUserName > -1) resolve({
                        message: 'User exits',
                        status: false,
                        data: dataFromBlockchain.account[findObjUserName]
                    });

                    if (findObjAddress > -1 ) resolve({
                        message: 'Address exits',
                        status: false,
                        data: dataFromBlockchain.account[findObjAddress]
                    });
                }
            }

            resolve(false);
        }).catch((err) => {
            throw new Error(err);
        });
     }

     getAccountItemFromAddress = async() => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

            const address = await this.getCurrentAccount();
            const result = await this.contract.methods.getItem(address).call();
            resolve(result)

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

            let balance = await this.web3Provider.eth.getBalance(address);

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

     sendTransaction = (toAddress, value, data) => {
        return new Promise(async(resolve, reject) => {
            if (!this.web3Provider) {
                reject('no provider web3.js');
                return;
            }

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