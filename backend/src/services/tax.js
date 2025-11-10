const calculateVAT = (amount, vatRate, isInclusive = false) => {
  const rate = vatRate / 100;
  
  if (isInclusive) {
    // Amount already includes VAT
    const baseAmount = amount / (1 + rate);
    const vatAmount = amount - baseAmount;
    return {
      baseAmount: parseFloat(baseAmount.toFixed(2)),
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      totalAmount: parseFloat(amount.toFixed(2))
    };
  } else {
    // VAT to be added to amount
    const vatAmount = amount * rate;
    const totalAmount = amount + vatAmount;
    return {
      baseAmount: parseFloat(amount.toFixed(2)),
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
  }
};

const calculateWHT = (amount, whtRate, calculationMode = 'gross') => {
  const rate = whtRate / 100;
  
  if (calculationMode === 'net') {
    // Net amount provided, calculate gross
    // Formula: grossAmount = netAmount / (1 - taxRate)
    // whtAmount = grossAmount * taxRate
    const grossAmount = amount / (1 - rate);
    const whtAmount = grossAmount * rate;
    return {
      netAmount: parseFloat(amount.toFixed(2)),
      whtAmount: parseFloat(whtAmount.toFixed(2)),
      grossAmount: parseFloat(grossAmount.toFixed(2))
    };
  } else {
    // Gross amount provided
    const whtAmount = amount * rate;
    const netAmount = amount - whtAmount;
    return {
      grossAmount: parseFloat(amount.toFixed(2)),
      whtAmount: parseFloat(whtAmount.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2))
    };
  }
};

module.exports = {
  calculateVAT,
  calculateWHT
};
