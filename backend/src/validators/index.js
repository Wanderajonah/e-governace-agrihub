const { registerRules, loginRules, changePasswordRules } = require('./auth.validator');
const { createFarmerRules, updateFarmerRules } = require('./farmer.validator');
const { createProduceRules, updateProduceRules } = require('./produce.validator');
const { createPriceRules, updatePriceRules } = require('./price.validator');
const { createTransactionRules, updateTransactionRules } = require('./transaction.validator');
const { createVerificationRules, updateVerificationRules } = require('./verification.validator');
const { createUserRules, updateUserRules } = require('./user.validator');

module.exports = {
  registerRules, loginRules, changePasswordRules,
  createFarmerRules, updateFarmerRules,
  createProduceRules, updateProduceRules,
  createPriceRules, updatePriceRules,
  createTransactionRules, updateTransactionRules,
  createVerificationRules, updateVerificationRules,
  createUserRules, updateUserRules,
};
