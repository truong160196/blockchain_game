pragma solidity ^0.4.16;
pragma experimental ABIEncoderV2;

contract Token {

    /// @return total amount of tokens
    function totalSupply() constant returns (uint256 supply) {}

    /// @param _owner The address from which the balance will be retrieved
    /// @return The balance
    function balanceOf(address _owner) constant returns (uint256 balance) {}

    /// @notice send `_value` token to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _value) returns (bool success) {}

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {}

    /// @notice `msg.sender` approves `_addr` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of wei to be approved for transfer
    /// @return Whether the approval was successful or not
    function approve(address _spender, uint256 _value) returns (bool success) {}

    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {}

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event UpdateAccount(address indexed _address, string user_name, uint256 score);
    event UpdateItem(address indexed _address, uint indexed _product, uint256 _qtyItem, uint256 _price);
    event TransferItem(
        address indexed _to,
        address indexed _from,
        uint256 indexed _product,
        uint256 _value,
        uint256 _qtyItem
        );
    event UpdateStore(address indexed _address_to, uint indexed id,  uint256 _product, uint256 _qtyItem, uint256 _price);
}


contract StandardToken is Token {
     struct Account {
          string user_name;
          uint256 score;
     }
     
    struct Item {
          uint256 id;
          uint256 qtyItem;
          uint256 price;
     }
     
    struct Store {
          uint256 id;
          uint256 product;
          uint256 qtyItem;
          uint256 price;
          address address_to;
          uint256 time_update;
     }
     
    Store[] stores;
    
    function transfer(address _to, uint256 _value) returns (bool success) {
        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        //if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[msg.sender] >= _value && _value > 0) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            Transfer(msg.sender, _to, _value);
            return true;
        } else { return false; }
    }

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        //same as above. Replace this line with the following if you want to protect against wrapping uints.
        //if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][msg.sender] -= _value;
            Transfer(_from, _to, _value);
            return true;
        } else { return false; }
    }
    

    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
      return allowed[_owner][_spender];
    }
    
    function updateAccount(address _address, string _user_name, uint256 _score) returns (bool success) {
        Account memory account = Account(_user_name, _score);
        accounts[_address] = account;
      
        UpdateAccount(_address, _user_name, _score);
        return true;
    }
    
    function getAccount(address _address) public view returns (Account){
        return accounts[_address];
    }
    
    function getIdItem (address _address, uint256 _product) view returns (uint idex, bool status){
      for (uint i; i < items[_address].length; i++){
          if (items[_address][i].id == _product)
          return (i, true);
      }
      return (0, false);
    }
  
    function updateItem(address _address, uint256 _product, uint256 _qtyItem, uint256 _price) returns (bool success) {
         Item memory item = Item(_product, _qtyItem, _price);
         if (items[_address].length == 0) {
            items[_address].push(item);
         } else {
            (uint idCheck, bool status) = getIdItem(_address, _product);
            if (status == true && idCheck >= 0) {
                 items[_address][idCheck].qtyItem += _qtyItem; 
            } else {
                items[_address].push(item); 
            }
         }
        
        UpdateItem(_address, _product, _qtyItem, _price);
        
        return true;
    }
    
    function getItem(address _address) public view returns (Item[]){
        return items[_address];
    }

    function removeItem( address _address, uint256 _product) returns (bool success) {
        delete items[_address][_product];
        return true;
    }
    
    function transferItem(
        address _to,
        address _from,
        uint256 _value,
        uint256 _qtyItem,
        uint256 _product,
        uint _id_order
        ) returns (bool success) {
        
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0 && items[_to][_product].qtyItem >= _qtyItem ) {
            items[_to][_product].qtyItem -= _qtyItem;
            items[_from][_product].qtyItem += _qtyItem;
            items[_from][_product].price += _value;
            
            stores[_id_order].qtyItem -= _qtyItem;
            
            if (stores[_id_order].qtyItem == 0) {
                delete stores[_id_order];
            }
            
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][msg.sender] -= _value;
            
            TransferItem(_from, _to, _product, _value, _qtyItem);
            return true;
        } else { return false; }

    }
    
    function updateStore(
        uint256 _product,
        uint256 _qtyItem,
        uint256 _price,
        address _address_to
        ) returns (bool success) {
        (uint idItem, bool status) = getIdItem(_address_to, _product);
        
        uint256 subQtyItem = items[_address_to][idItem].qtyItem - _qtyItem;
        
        if (status == true && idItem >= 0) {
            if (subQtyItem == 0) {
                delete items[_address_to][idItem];
            } else if (subQtyItem > 0) {
                items[_address_to][idItem].qtyItem -= _qtyItem;
            } else {
                return false;
            }
        
        Store memory store = Store(
            now,
            _product,
            _qtyItem,
            _price,
            _address_to,
            now
            );

        uint id = stores.push(store) - 1;
        
        UpdateStore(_address_to, id, _product, _qtyItem, _price);
        
        return true;
        } else {
            return false;
        }
    }

    function getStore() public view returns (Store[]){
        return stores;
    }
    
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
    mapping (address => Account) accounts;
    mapping (address => Item[]) items;
    uint256 public totalSupply;
}


//name this contract whatever you'd like
contract ERC20Token is StandardToken {

    function () {
        //if ether is sent to this address, send it back.
        throw;
    }

    /* Public variables of the token */

    /*
    NOTE:
    The following variables are OPTIONAL vanities. One does not have to include them.
    They allow one to customise the token contract & in no way influences the core functionality.
    Some wallets/interfaces might not even bother to look at this information.
    */
    string public name;                   //fancy name: eg Simon Bucks
    uint8 public decimals;                //How many decimals to show. ie. There could 1000 base units with 3 decimals. Meaning 0.980 SBX = 980 base units. It's like comparing 1 wei to 1 ether.
    string public symbol;                 //An identifier: eg SBX
    string public version = 'H1.0';       //human 0.1 standard. Just an arbitrary versioning scheme.

//
// CHANGE THESE VALUES FOR YOUR TOKEN
//

//make sure this function name matches the contract name above. So if you're token is called TutorialToken, make sure the //contract name above is also TutorialToken instead of ERC20Token

    function ERC20Token(
        ) {
        balances[msg.sender] = 1000000;               // Give the creator all initial tokens (100000 for example)
        totalSupply = 1000000;                        // Update total supply (100000 for example)
        name = "QuocTruong";                                   // Set the name for display purposes
        decimals = 0;                            // Amount of decimals for display purposes
        symbol = "TPI";                               // Set the symbol for display purposes
    }

    /* Approves and then calls the receiving contract */
    function approveAndCall(address _spender, uint256 _value, bytes _extraData) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);

        //call the receiveApproval function on the contract you want to be notified. This crafts the function signature manually so one doesn't have to include a contract in here just for this.
        //receiveApproval(address _from, uint256 _value, address _tokenContract, bytes _extraData)
        //it is assumed that when does this that the call *should* succeed, otherwise one would use vanilla approve instead.
        if(!_spender.call(bytes4(bytes32(sha3("receiveApproval(address,uint256,address,bytes)"))), msg.sender, _value, this, _extraData)) { throw; }
        return true;
    }
}