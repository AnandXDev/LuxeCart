const Order = require('../models/Order');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// @desc    Generate invoice PDF
// @route   GET /api/orders/:id/invoice
exports.generateInvoice = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate('items.product', 'name images')
    .populate('user', 'name email phone');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const html = generateInvoiceHTML(order);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html);

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });

  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

  res.send(pdfBuffer);
});

// Helper function to generate invoice HTML
function generateInvoiceHTML(order) {
  const formatPrice = (price) => `$${(price || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${order.orderNumber}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background-color: #f5f5f5; 
        }
        .invoice { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #e5e5e5; 
          padding-bottom: 20px; 
        }
        .logo { 
          font-size: 24px; 
          font-weight: bold; 
          color: #333; 
        }
        .invoice-info { 
          text-align: right; 
        }
        .invoice-number { 
          font-size: 18px; 
          font-weight: bold; 
          color: #333; 
        }
        .invoice-date { 
          color: #666; 
          margin-top: 5px; 
        }
        .addresses { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
        }
        .address { 
          width: 48%; 
        }
        .address h3 { 
          margin: 0 0 10px 0; 
          color: #333; 
          font-size: 16px; 
        }
        .address p { 
          margin: 5px 0; 
          color: #666; 
          line-height: 1.4; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px; 
        }
        .items-table th { 
          background: #f8f8f8; 
          padding: 12px; 
          text-align: left; 
          border-bottom: 2px solid #e5e5e5; 
          font-weight: bold; 
          color: #333; 
        }
        .items-table td { 
          padding: 12px; 
          border-bottom: 1px solid #e5e5e5; 
        }
        .items-table .text-right { 
          text-align: right; 
        }
        .totals { 
          text-align: right; 
          margin-top: 20px; 
        }
        .totals table { 
          display: inline-block; 
          width: 300px; 
        }
        .totals td { 
          padding: 8px 12px; 
        }
        .totals .total-row td { 
          font-weight: bold; 
          border-top: 2px solid #e5e5e5; 
          font-size: 16px; 
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #e5e5e5; 
          text-align: center; 
          color: #666; 
        }
        .status-badge { 
          display: inline-block; 
          padding: 4px 12px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold; 
          text-transform: uppercase; 
        }
        .status-paid { 
          background: #d4edda; 
          color: #155724; 
        }
        .status-pending { 
          background: #fff3cd; 
          color: #856404; 
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="logo">
            DropShip E-commerce
          </div>
          <div class="invoice-info">
            <div class="invoice-number">Invoice #${order.orderNumber}</div>
            <div class="invoice-date">${formatDate(order.createdAt)}</div>
            <div class="status-badge status-${order.paymentStatus}">
              ${order.paymentStatus}
            </div>
          </div>
        </div>

        <div class="addresses">
          <div class="address">
            <h3>Bill To:</h3>
            <p><strong>${order.user?.name || `${order.user?.firstName || ""} ${order.user?.lastName || ""}` || "Customer"}</strong></p>
            <p>${order.user?.email}</p>
            <p>${order.user?.phone || 'N/A'}</p>
          </div>
          <div class="address">
            <h3>Ship To:</h3>
            <p><strong>${order.shipping?.address?.firstName || ""} ${order.shipping?.address?.lastName || ""}</strong></p>
            <p>${order.shipping?.address?.street || "N/A"}</p>
            <p>${order.shipping?.address?.city || "N/A"}, ${order.shipping?.address?.state || "N/A"} ${order.shipping?.address?.zipCode || "N/A"}</p>
            <p>${order.shipping?.address?.country || "N/A"}</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th class="text-right">Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>${item.productSnapshot?.name || "Product"}</td>
                <td>${item.quantity}</td>
                <td class="text-right">${formatPrice(item.price)}</td>
                <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">${formatPrice(order.pricing?.subtotal || 0)}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td class="text-right">${formatPrice(order.pricing?.shipping || 0)}</td>
            </tr>
            <tr>
              <td>Tax:</td>
              <td class="text-right">${formatPrice(order.pricing?.tax || 0)}</td>
            </tr>
            <tr class="total-row">
              <td>Total:</td>
              <td class="text-right">${formatPrice(order.pricing?.total || 0)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

