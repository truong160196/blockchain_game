const initialState = {};

const blockchain = (state = initialState, action = {}) => {
  switch (action.type) {
    case 'FET_ETH':
        state.balanceEth = action.payload;
        return { ...state };
    case 'FET_TOKEN':
        state.balanceToken = action.payload;
        return { ...state };
    default: return { ...state };
  }
};

export default blockchain;