import {web3Provider, web3, ethereum} from './web3';

import { Transaction } from 'ethereumjs-tx';

// import abi from '../assets/contract/eth.json';

import worker from '../utils/workerfile.js';
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
                this.worker = new workerSetup(worker);
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
                console.log(provider)
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

            this.worker.addEventListener('message', function(e) {
                console.log(e.data);
            })

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

    syncData = (data) => {
        this.dispatch(data)
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

    sendSignedTransaction = () => {
        // var privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex');

        // var rawTx = {
        // nonce: '0x00',
        // gasPrice: '0x09184e72a000',
        // gasLimit: '0x2710',
        // to: '0x0000000000000000000000000000000000000000',
        // value: '0x00',
        // data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
        // }

        // var tx = new Tx.Transaction(rawTx, {'chain':'ropsten'});
        // tx.sign(privateKey);

        // var serializedTx = tx.serialize();

        // // console.log(serializedTx.toString('hex'));
        // // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f

        // web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        // .on('receipt', console.log);
    }

    signData = async() => {
        let privateKey = "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";

        const msg = 'hello';

        let sigObj = await this.web3Provider.eth.accounts.sign(msg, privateKey);

        let msgHash2 = sigObj.messageHash;
        // console.log('msgHash2: ', msgHash2)

        // let sig2 = sigObj.signature;
        // console.log('sig2: ', sig2)

        // let whoSigned2 = await this.web3Provider.eth.accounts.recover(sigObj)
        // console.log('whoSigned2: ', whoSigned2)

        // let dataEncoding = await this.web3Provider.eth.abi.encodeParameter('uint256', '2345675643');

        // console.log('dataEncoding: ', dataEncoding)

        // let dataDecoding = await this.web3Provider.eth.abi.decodeParameter('uint256', dataEncoding);

        // console.log('dataDecoding: ', dataDecoding)

        // this.web3Provider.eth.net.isListening()
        //     .then(() => console.log('web3 is connected'))
        //     .catch(e => console.log('Wow. Something went wrong'));

        // const abi = [{"constant":false,"inputs":[{"name":"_greeting","type":"string"}],"name":"greet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getGreeting","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];
        const account1 = '0x248062ceD7E34354651c930940b93e48281E2BFf'; // Your account address 1
        //const account2 = '' // Your account address 2
        web3.eth.defaultAccount = account1;
        
        const privateKey1 = Buffer.from('EEA14CED894BAF54A74869DA3DD189EC02E4D1455972180FB22422530C6BA4F3', 'hex');
        
        const abi = [{"constant":false,"inputs":[{"name":"_greeting","type":"string"}],"name":"greet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getGreeting","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];
        
        const contract_Address = "0xcbe74e21b070a979b9d6426b11e876d4cb618daf";
        
        const contract = new this.web3Provider.eth.Contract(abi, contract_Address);
        
        const myData = contract.methods.greet( "hello all devs").encodeABI();
        
        this.web3Provider.eth.getTransactionCount(account1, (err, txCount) => {
        // Build the transaction
          const txObject = {
            nonce:    web3.toHex(txCount),
            to:       '0xaC8832ae0C56f638bC07822f90b24A4f8d721B2D',
            value:    web3.toHex(web3.toWei('0', 'ether')),
            gasLimit: web3.toHex(2100000),
            gasPrice: web3.toHex(web3.toWei('6', 'gwei')),
            data: myData  
          }
            // Sign the transaction
            const tx = new Transaction(txObject, { chain: 'ropsten', hardfork: 'petersburg' });
            tx.sign(privateKey1);
        
            const serializedTx = tx.serialize();
            const raw = '0x' + serializedTx.toString('hex');
        
            // Broadcast the transaction
            this.web3Provider.eth.sendSignedTransaction(raw).on('transactionHash', function (txHash) {
                console.log("txHash: " + txHash);

            }).on('receipt', function (receipt) {
                console.log("receipt: ");
                console.log(receipt);
            }).on('confirmation', function (confirmationNumber, receipt) {
                console.log("confirmationNumber: " + confirmationNumber);
                console.log("receipt: ");
                console.log(receipt);
            }).on('error', function (error) {
                console.error(error);
            });
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
            const transactionDetail = await this.web3Provider.eth.getTransaction(txHash)

            console.log(transactionDetail.input)
             let dataDecoding = web3.toAscii('string', transactionDetail.input);

            console.log('dataDecoding: ', dataDecoding)

            resolve({data: transactionDetail});
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