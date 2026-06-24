const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Club extends Model {}
  Club.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
  }, { sequelize, modelName: 'Club', tableName: 'communities' });

  class ClubMembership extends Model {}
  ClubMembership.init({
    clubId: { type: DataTypes.UUID, primaryKey: true },
    employeeId: { type: DataTypes.UUID, primaryKey: true },
  }, { sequelize, modelName: 'ClubMembership', tableName: 'community_memberships' });

  class Event extends Model {}
  Event.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    date: { type: DataTypes.DATE, allowNull: false },
    location: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING }, // townhall, hackathon, social
    rsvpCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { sequelize, modelName: 'Event', tableName: 'company_events' });

  return { Club, ClubMembership, Event };
};
