'use strict';

var pdfKit = require('pdfkit');
var moment = require('moment');
var numeral = require('numeral');
var i18n = require('./i18n');

var TEXT_SIZE = 10;
var CONTENT_LEFT_PADDING = 50;

function PDFInvoice(_ref) {
  var company = _ref.company,
      customer = _ref.customer,
      items = _ref.items,
      invoiceDate = _ref.invoiceDate,
      invoiceNo = _ref.invoiceNo,
      orderId = _ref.orderId;

  var date = new Date(invoiceDate);
  var charge = {
    createdAt: date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear(),
    amount: items.reduce(function (acc, item) {
      return acc + item.amount;
    }, 0)
  };
  var doc = new pdfKit({ size: 'A4', margin: 50 });

  doc.fillColor('#333333');

  var translate = i18n[PDFInvoice.lang];
  moment.locale(PDFInvoice.lang);

  var divMaxWidth = 550;
  var table = {
    x: CONTENT_LEFT_PADDING,
    y: 350,
    inc: 70
  };

  return {
    genHeader: function genHeader() {
      doc.image('server/public/img/HS-Security.logo.png');

      doc.fontSize(11).font('Helvetica-Bold').text('FROM:', CONTENT_LEFT_PADDING, 180);
      doc.font('Helvetica').text(company.name || '');
      doc.text(company.address || '');
      doc.text(company.city || '');
      doc.text(company.country || '');
      doc.text('VAT: ' + (company.vat || ""));
    },
    genCustomerInfos: function genCustomerInfos() {
      doc.font('Helvetica-Bold').text('TO:', CONTENT_LEFT_PADDING * 5, 180);
      doc.font('Helvetica').text(customer.name || '');
      doc.text(customer.address || '');
      doc.text(customer.city || '');
      doc.text(customer.country || '');
      doc.text('VAT: ' + (customer.vat || ""));
    },
    genDate: function genDate() {
      doc.fillColor('#000').text('Invoice Date: ' + moment(date).format('DD.MM.YYYY'), CONTENT_LEFT_PADDING, 290, {
        align: 'right'
      }).fillColor('#000');
    },
    genInvoiceNo: function genInvoiceNo() {
      doc.font('Helvetica-Bold').text('INVOICE No: ' + invoiceNo, CONTENT_LEFT_PADDING, 290);

      doc.font('Helvetica').text('Order ID: ' + orderId);
    },
    genFooter: function genFooter() {
      var borderOffset = doc.currentLineHeight() + 70;

      var note = 'Thank you for your order. Our General Terms and Conditions apply which are published at http://www.hs-securityware.com; Our conditions are considered to have been accepted at the latest when the goods are accepted. Exclusion of property: The good remains until payment of all receivables towards the purchaser of the business relation, including auxiliary receivables, claims for damages and payment of checks and bills of exchange, the property of the seller.';

      doc.font('Helvetica').fontSize(8).text(note, CONTENT_LEFT_PADDING, doc.y + 20).moveDown(2);

      doc.fontSize(12).text('Delivery: Online EnkyOn.de portal');
      doc.text('Payment: due immediately upon receipt');
      doc.text('You can pay the bill by credit card or transfer.');
      doc.text('Bank: Commerzbank AG');
      doc.text('Bank address: Südstr. 14-16, 31515 Wunstorf');
      doc.text('IBAN: DE88 2504 0066 0272 3658 00');
      doc.text('BIC: COBADEFFXXX');
      doc.text('Account name: HS-Security Ware GmbH');
      doc.text('Account no.: 272 365 800');
    },
    genTableHeaders: function genTableHeaders() {
      ['quantity', 'productNo', 'productName', 'createdAt', 'amount'].forEach(function (text, i) {
        var n = text === 'createdAt' || text === 'amount' ? 160 : 0;

        doc.fontSize(TEXT_SIZE).font('Helvetica').text(translate[text], table.x + n + i * table.inc, table.y);
      });
    },
    genTableRow: function genTableRow() {
      items.map(function (item) {
        return Object.assign({}, item, {
          amount: (item.currency === 'USD' ? '$ ' : '€ ') + numeral(item.amount)
        });
      }).forEach(function (item, itemIndex) {
        ['quantity', 'productNo', 'productName', 'createdAt', 'amount'].forEach(function (field, i) {
          if (field === 'createdAt') {
            item[field] = moment(item[field]).format('DD.MM.YYYY');
          }
          var n = field === 'createdAt' || field === 'amount' ? 160 : 0;

          doc.fontSize(TEXT_SIZE).text(item[field], table.x + n + i * table.inc, table.y + TEXT_SIZE + 6 + itemIndex * 15);
        });
      });
    },
    genTotal: function genTotal() {
      doc.font('Helvetica').text('TOTAL: ' + charge.amount, CONTENT_LEFT_PADDING, doc.y + 20);
    },
    genTableLines: function genTableLines() {
      var offset = doc.currentLineHeight() + 2;
      doc.moveTo(table.x, table.y + offset).lineTo(divMaxWidth, table.y + offset).stroke();
    },
    generate: function generate() {
      this.genHeader();
      this.genCustomerInfos();
      this.genDate();
      this.genInvoiceNo();
      this.genTableHeaders();
      this.genTableLines();
      this.genTableRow();
      this.genTotal();
      this.genFooter();

      doc.end();
    },


    get pdfkitDoc() {
      return doc;
    }
  };
}

PDFInvoice.lang = 'en_US';

module.exports = PDFInvoice;