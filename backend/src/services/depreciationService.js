const db = require('../models');
const { calculateMonthlyDepreciation } = require('../utils/taxCalculations');

/**
 * Run monthly depreciation for all active fixed assets
 */
async function runMonthlyDepreciation() {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Get all active, non-disposed fixed assets
    const assets = await db.FixedAsset.findAll({
      where: {
        isActive: true,
        isDisposed: false
      },
      transaction
    });
    
    const results = [];
    
    for (const asset of assets) {
      // Calculate monthly depreciation
      const { monthlyDepreciation, bookValue } = calculateMonthlyDepreciation(
        parseFloat(asset.cost),
        parseFloat(asset.depreciationRate),
        parseFloat(asset.accumulatedDepreciation)
      );
      
      // Don't depreciate if book value is zero
      if (bookValue <= 0) continue;
      
      // Update accumulated depreciation
      const newAccumulatedDepreciation = parseFloat(asset.accumulatedDepreciation) + monthlyDepreciation;
      await asset.update({
        accumulatedDepreciation: newAccumulatedDepreciation
      }, { transaction });
      
      // Find depreciation expense account
      const depreciationAccount = await db.ChartAccount.findOne({
        where: {
          businessId: asset.businessId,
          type: 'Expense',
          name: { [db.Sequelize.Op.iLike]: '%depreciation%' }
        },
        transaction
      });
      
      if (depreciationAccount) {
        // Create depreciation transaction
        await db.Transaction.create({
          businessId: asset.businessId,
          accountId: depreciationAccount.id,
          type: 'depreciation',
          date: new Date(),
          description: `Monthly depreciation for ${asset.name}`,
          amount: monthlyDepreciation,
          vatRate: 0,
          vatInclusive: false,
          vatAmount: 0,
          whtRate: 0,
          whtAmount: 0
        }, { transaction });
      }
      
      results.push({
        assetId: asset.id,
        assetName: asset.name,
        monthlyDepreciation,
        newAccumulatedDepreciation
      });
    }
    
    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  runMonthlyDepreciation
};
