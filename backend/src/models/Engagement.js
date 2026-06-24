const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Kudos extends Model {}
  Kudos.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    giverId: { type: DataTypes.UUID, allowNull: false },
    receiverId: { type: DataTypes.UUID, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING }, // Innovation, Leadership, Teamwork
  }, { sequelize, modelName: 'Kudos', tableName: 'recognitions' });

  class Reward extends Model {}
  Reward.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    pointsCost: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING },
    stock: { type: DataTypes.INTEGER, defaultValue: 100 },
  }, { sequelize, modelName: 'Reward', tableName: 'rewards_marketplace' });

  class RewardTransaction extends Model {}
  RewardTransaction.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employeeId: { type: DataTypes.UUID, allowNull: false },
    rewardId: { type: DataTypes.UUID, allowNull: false },
    pointsSpent: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'delivered'), defaultValue: 'pending' },
  }, { sequelize, modelName: 'RewardTransaction', tableName: 'reward_transactions' });

  return { Kudos, Reward, RewardTransaction };
};
