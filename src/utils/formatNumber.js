import * as Types  from '../constant/ActionTypes';

export const formatCurrency = (number, digit = 4) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: digit }).format(number)
}

export const dynamicSort = (property, sort) => {
    var sortOrder = 1;
    if(sort === Types.SORT.DESC) {
        sortOrder = -1;
    }

    if(sort === Types.SORT.ASC) {
        sortOrder = 1;
    }

    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}