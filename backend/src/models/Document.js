const { DataTypes, Model } = require('sequelize');

class Document extends Model {}

module.exports = (sequelize) => {
  Document.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      employeeId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      type: {
        type: DataTypes.ENUM(
          'offer_letter',
          'appointment_letter',
          'experience_letter',
          'salary_slip',
          'contract',
          'hr_policy',
          'employee_document',
          'other'
        ),
        defaultValue: 'other',
      },
      fileUrl: { type: DataTypes.STRING, allowNull: false },
      uploadedById: { type: DataTypes.UUID, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Document',
      tableName: 'documents',
      timestamps: true,
    }
  );
  return Document;
};
