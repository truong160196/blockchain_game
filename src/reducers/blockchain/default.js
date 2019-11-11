const initialState = {};

const blockchain = (state = initialState, action = {}) => {
  switch (action.type) {
    case 'FET_BLOCKCHAIN':
      state = action.payload;
      return { ...state };

    default: return { ...state };
  }
};

export default blockchain;