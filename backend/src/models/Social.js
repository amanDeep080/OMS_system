const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Post extends Model {}
  Post.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('update', 'achievement', 'news', 'event', 'personal'), defaultValue: 'update' },
    mediaUrl: { type: DataTypes.STRING },
    employeeId: { type: DataTypes.UUID, allowNull: false },
    hashtags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  }, { sequelize, modelName: 'Post', tableName: 'social_posts' });

  class Comment extends Model {}
  Comment.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    postId: { type: DataTypes.UUID, allowNull: false },
    employeeId: { type: DataTypes.UUID, allowNull: false },
  }, { sequelize, modelName: 'Comment', tableName: 'social_comments' });

  class Reaction extends Model {}
  Reaction.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.STRING, defaultValue: 'like' }, // like, celebrate, love, insightful
    postId: { type: DataTypes.UUID, allowNull: false },
    employeeId: { type: DataTypes.UUID, allowNull: false },
  }, { sequelize, modelName: 'Reaction', tableName: 'social_reactions' });

  return { Post, Comment, Reaction };
};
