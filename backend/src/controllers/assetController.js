const { Asset, Employee } = require('../models');

async function listAssets(req, res) {
  try {
    const assets = await Asset.findAll({
      include: [{ model: Employee, as: 'user', attributes: ['firstName', 'lastName', 'employeeCode'] }]
    });
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createAsset(req, res) {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function assignAsset(req, res) {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;
    const asset = await Asset.findByPk(id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    await asset.update({
      employeeId,
      status: 'assigned',
      assignedAt: new Date()
    });

    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listAssets, createAsset, assignAsset };
