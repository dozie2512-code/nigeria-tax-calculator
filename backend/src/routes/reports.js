const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');
const { requireRole } = require('../middleware/auth');
const {
  calculateAccountingProfit,
  calculateCIT,
  calculatePIT,
  getWHTReceivable,
  getWHTPayable
} = require('../services/accounting');
const { calculateAnnualPAYE, calculateMonthlyPAYE } = require('../services/paye');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Get accounting profit report
router.get('/accounting-profit', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    const report = await calculateAccountingProfit(businessId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get CIT computation
router.get('/cit', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    const report = await calculateCIT(businessId, startDate, endDate);
    
    if (!report) {
      return res.status(400).json({ error: 'CIT is only applicable for companies' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get PIT computation
router.get('/pit', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    const report = await calculatePIT(businessId, startDate, endDate);
    
    if (!report) {
      return res.status(400).json({ error: 'PIT is only applicable for sole proprietors' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get VAT report
router.get('/vat', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    const transactions = await db.Transaction.findAll({
      where: {
        businessId,
        date: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: db.ChartAccount, as: 'account' }],
      order: [['date', 'ASC']]
    });
    
    let vatCollected = 0;
    let vatPaid = 0;
    const details = [];
    
    for (const txn of transactions) {
      const vatAmount = parseFloat(txn.vatAmount) || 0;
      
      if (txn.type === 'receipt' || txn.type === 'inventory_sale') {
        vatCollected += vatAmount;
      } else if (txn.type === 'payment' || txn.type === 'inventory_purchase' || txn.type === 'fixed_purchase') {
        vatPaid += vatAmount;
      }
      
      if (vatAmount > 0) {
        details.push({
          date: txn.date,
          description: txn.description,
          type: txn.type,
          amount: txn.amount,
          vatAmount,
          account: txn.account.name
        });
      }
    }
    
    const vatNet = vatCollected - vatPaid;
    
    res.json({
      startDate,
      endDate,
      vatCollected: parseFloat(vatCollected.toFixed(2)),
      vatPaid: parseFloat(vatPaid.toFixed(2)),
      vatNet: parseFloat(vatNet.toFixed(2)),
      details
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get WHT report
router.get('/wht', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    const whtReceivable = await getWHTReceivable(businessId, startDate, endDate);
    const whtPayable = await getWHTPayable(businessId, startDate, endDate);
    
    const transactions = await db.Transaction.findAll({
      where: {
        businessId,
        date: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: db.ChartAccount, as: 'account' },
        { model: db.Contact, as: 'contact' }
      ],
      order: [['date', 'ASC']]
    });
    
    const receivableDetails = [];
    const payableDetails = [];
    
    for (const txn of transactions) {
      const whtAmount = parseFloat(txn.whtAmount) || 0;
      
      if (whtAmount > 0) {
        const detail = {
          date: txn.date,
          description: txn.description,
          type: txn.type,
          amount: txn.amount,
          whtRate: txn.whtRate,
          whtAmount,
          contact: txn.contact ? txn.contact.name : null,
          account: txn.account.name
        };
        
        if (txn.type === 'receipt' || txn.type === 'inventory_sale') {
          receivableDetails.push(detail);
        } else if (txn.type === 'payment' || txn.type === 'inventory_purchase' || txn.type === 'fixed_purchase') {
          payableDetails.push(detail);
        }
      }
    }
    
    res.json({
      startDate,
      endDate,
      whtReceivable,
      whtPayable,
      whtNet: parseFloat((whtReceivable - whtPayable).toFixed(2)),
      receivableDetails,
      payableDetails
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get PAYE report
router.get('/paye', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    const transactions = await db.Transaction.findAll({
      where: {
        businessId,
        isSalary: true,
        date: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: db.Contact, as: 'contact' }],
      order: [['date', 'ASC']]
    });
    
    const contactSummary = {};
    
    for (const txn of transactions) {
      if (!txn.contact) continue;
      
      const contactId = txn.contact.id;
      
      if (!contactSummary[contactId]) {
        contactSummary[contactId] = {
          contact: txn.contact,
          monthlyGross: 0,
          monthlyPAYE: 0,
          months: 0,
          transactions: []
        };
      }
      
      contactSummary[contactId].monthlyGross += parseFloat(txn.amount);
      contactSummary[contactId].monthlyPAYE += parseFloat(txn.payeAmount);
      contactSummary[contactId].months += 1;
      contactSummary[contactId].transactions.push({
        date: txn.date,
        amount: txn.amount,
        payeAmount: txn.payeAmount
      });
    }
    
    const employeeReports = Object.values(contactSummary).map(summary => {
      const annualGross = summary.monthlyGross;
      const annualPAYE = calculateAnnualPAYE(annualGross, summary.contact);
      
      return {
        contactId: summary.contact.id,
        contactName: summary.contact.name,
        monthlyTotal: parseFloat(summary.monthlyGross.toFixed(2)),
        payeTotal: parseFloat(summary.monthlyPAYE.toFixed(2)),
        months: summary.months,
        annualProjection: {
          gross: parseFloat((summary.monthlyGross * 12 / summary.months).toFixed(2)),
          paye: annualPAYE.paye,
          breakdown: annualPAYE.breakdown
        },
        transactions: summary.transactions
      };
    });
    
    res.json({
      startDate,
      endDate,
      employeeReports
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export report to Excel
router.get('/:reportType/export/excel', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate } = req.query;
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    
    // Add basic headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 }
    ];
    
    // TODO: Add report-specific data
    worksheet.addRow({ date: startDate, description: `${reportType} Report`, amount: 0 });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export report to PDF
router.get('/:reportType/export/pdf', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate } = req.query;
    
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.pdf`);
    
    doc.pipe(res);
    
    doc.fontSize(20).text(`${reportType.toUpperCase()} Report`, { align: 'center' });
    doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
    doc.moveDown();
    
    // TODO: Add report-specific content
    doc.text('Report data goes here...');
    
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
