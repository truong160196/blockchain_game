export function postData(data) {
    return {
      type: 'FET_BLOCKCHAIN',
      payload: data,
    };
  }
  
  export default postData;