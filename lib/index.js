const pdfKit = require('pdfkit');
const moment = require('moment');
const numeral = require('numeral');
const i18n = require('./i18n');

const TEXT_SIZE = 10;
const CONTENT_LEFT_PADDING = 50;

function PDFInvoice({
  company,
  customer,
  items,
  invoiceDate,
  invoiceNo,
  orderId,
}){
  const date = new Date(invoiceDate);
  const charge = {
    createdAt: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`,
    amount: items.reduce((acc, item) => acc + item.amount, 0),
  };
  const doc = new pdfKit({size: 'A4', margin: 50});

  doc.fillColor('#333333');

  const translate = i18n[PDFInvoice.lang];
  moment.locale(PDFInvoice.lang);

  const divMaxWidth = 550;
  const table = {
    x: CONTENT_LEFT_PADDING,
    y: 350,
    inc: 70,
  };

  return {
    genHeader(){
      doc.image('server/public/img/HS-Security.logo.png');

      doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('FROM:', CONTENT_LEFT_PADDING, 180);
      doc
      .font('Helvetica')
      .text(company.name || '');
      doc.text(company.address || '');
      doc.text(company.city || '');
      doc.text(company.country || '');
      doc.text(`VAT: ${company.vat || ""}`);
    },

    genCustomerInfos(){
      doc
      .font('Helvetica-Bold')
      .text('TO:', CONTENT_LEFT_PADDING * 5, 180);      
      doc
      .font('Helvetica')
      .text(customer.name || '');
      doc.text(customer.address || '');
      doc.text(customer.city || '');
      doc.text(customer.country || '');
      doc.text(`VAT: ${customer.vat || ""}`);
    },

    genDate(){
      doc
        .fillColor('#000')
        .text('Invoice Date: ' + moment(date).format('DD.MM.YYYY'), CONTENT_LEFT_PADDING, 290, {
          align: 'right',
        })
        .fillColor('#000');
    },

    genInvoiceNo(){
      doc
      .font('Helvetica-Bold')
      .text(`INVOICE No: ${invoiceNo}`, CONTENT_LEFT_PADDING, 290);

      doc
      .font('Helvetica')
      .text(`Order ID: ${orderId}`);
    },

    genFooter(){
      const borderOffset = doc.currentLineHeight() + 70;

      const note = `Thank you for your order. Our General Terms and Conditions apply which are published at http://www.hs-securityware.com; Our conditions are considered to have been accepted at the latest when the goods are accepted. Exclusion of property: The good remains until payment of all receivables towards the purchaser of the business relation, including auxiliary receivables, claims for damages and payment of checks and bills of exchange, the property of the seller.`;

      doc
        .font('Helvetica')
        .fontSize(8)
        .text(note, CONTENT_LEFT_PADDING, doc.y + 20)
        .moveDown(2);

      doc
        .fontSize(12)
        .text('Delivery: Online EnkyOn.de portal');
      doc.text('Payment: due immediately upon receipt');
      doc.text('You can pay the bill by credit card or transfer.');
      doc.text('Bank: Commerzbank AG');
      doc.text('Bank address: Südstr. 14-16, 31515 Wunstorf');
      doc.text('IBAN: DE88 2504 0066 0272 3658 00');
      doc.text('BIC: COBADEFFXXX');
      doc.text('Account name: HS-Security Ware GmbH');
      doc.text('Account no.: 272 365 800');
    },

    genTableHeaders(){
      [
        'quantity',
        'productNo',
        'productName',
        'createdAt',
        'amount',
      ].forEach((text, i) => {
        const n = (text === 'createdAt' || text === 'amount') ? 160 : 0;

        doc
          .fontSize(TEXT_SIZE)
          .font('Helvetica')
          .text(translate[text], table.x + n + i * table.inc, table.y);
      });
    },

    genTableRow(){
      items
        .map(item => Object.assign({}, item, {
          amount: (item.currency === 'USD' ? '$ ' : '€ ') + numeral(item.amount)
        }))
        .forEach((item, itemIndex) => {
          [
            'quantity',
            'productNo',
            'productName',
            'createdAt',
            'amount',
          ].forEach((field, i) => {
            if (field === 'createdAt') {
              item[field] = moment(item[field]).format('DD.MM.YYYY');
            }
            const n = (field === 'createdAt' || field === 'amount') ? 160 : 0;

            doc
              .fontSize(TEXT_SIZE)
              .text(item[field], table.x + n + i * table.inc, table.y + TEXT_SIZE + 6 + itemIndex * 15);
          });
        });
    },

    genTotal(){
      doc
      .font('Helvetica')
      .text(`TOTAL: ${charge.amount}`, CONTENT_LEFT_PADDING, doc.y + 20);
    },

    genTableLines(){
      const offset = doc.currentLineHeight() + 2;
      doc
        .moveTo(table.x, table.y + offset)
        .lineTo(divMaxWidth, table.y + offset)
        .stroke();
    },

    generate(){
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

    get pdfkitDoc(){
      return doc;
    },
  };
}

PDFInvoice.lang = 'en_US';

module.exports = PDFInvoice;
