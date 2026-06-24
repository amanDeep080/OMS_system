const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Employee, Document } = require('../models');

const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
});

// POST /api/uploads/profile-picture/:employeeId
async function uploadProfilePicture(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const employee = await Employee.findByPk(req.params.employeeId);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

  const fileUrl = `/uploads/${req.file.filename}`;
  await employee.update({ profilePicture: fileUrl });

  res.json({ success: true, data: { profilePicture: fileUrl } });
}

// POST /api/uploads/document/:employeeId
async function uploadDocument(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const document = await Document.create({
    employeeId: req.params.employeeId,
    title: req.body.title || req.file.originalname,
    type: req.body.type || 'other',
    fileUrl: `/uploads/${req.file.filename}`,
    uploadedById: req.user.employeeId,
  });

  res.status(201).json({ success: true, data: document });
}

// GET /api/uploads/document/employee/:employeeId
async function listDocuments(req, res) {
  const documents = await Document.findAll({ where: { employeeId: req.params.employeeId }, order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: documents });
}

// DELETE /api/uploads/document/:id
async function deleteDocument(req, res) {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    // Permissions: HR/Admin can delete any; Employee can delete own (if allowed)
    const isHR = ['super_admin', 'hr'].includes(req.user.role);
    if (!isHR && document.employeeId !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Optional: Delete physical file
    const filePath = path.join(uploadDir, path.basename(document.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.destroy();
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { upload, uploadProfilePicture, uploadDocument, listDocuments, deleteDocument };
