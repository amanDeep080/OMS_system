const { AuditLog } = require('../models');

/**
 * Middleware to automatically log sensitive actions.
 * Usage: router.post('/salary', audit('Payroll', 'Modified Salary'), payrollController.updateSalary)
 */
function audit(moduleName, actionName) {
  return async (req, res, next) => {
    // We log AFTER the request completes successfully
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await AuditLog.create({
            userId: req.user?.id,
            module: moduleName,
            action: actionName,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.body, // Be careful with sensitive data like passwords in production
              params: req.params,
              query: req.query,
            },
            ipAddress: req.ip || req.headers['x-forwarded-for'],
          });
        } catch (err) {
          console.error('Audit Log Error:', err);
        }
      }
    });
    next();
  };
}

module.exports = audit;
