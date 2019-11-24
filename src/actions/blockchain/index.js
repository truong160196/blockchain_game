export function setBalanceEth(data) {
    return {
      type: 'FET_ETH',
      payload: data,
    };
  }

export function setBalanceToken(data) {
  return {
    type: 'FET_TOKEN',
    payload: data,
  };
}
