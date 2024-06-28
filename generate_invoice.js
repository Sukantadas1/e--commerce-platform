const puppeteer = require("puppeteer");
const fs = require("fs");

async function generateInvoice(order) {
  // Read the HTML template
  const htmlTemplate = fs.readFileSync("invoice_template.html", "utf8");

  // Replace placeholders with actual order data
  const populatedHtml = htmlTemplate
    .replace("{{invoice-number}}", order.order_id)
    .replace("{{invoice-date}}", new Date().toLocaleDateString())
    .replace("{{due-date}}", order.due_date)
    .replace(
      "{{billing-address}}",
      order.billing_address.replace(/\n/g, "<br>")
    )
    .replace(
      "{{shipping-address}}",
      order.shipping_address.replace(/\n/g, "<br>")
    )
    .replace("{{subtotal}}", `$${order.subtotal.toFixed(2)}`)
    .replace("{{tax}}", `$${order.tax.toFixed(2)}`)
    .replace("{{total}}", `$${order.total.toFixed(2)}`);

  // Generate items table rows
  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>$${item.unit_price.toFixed(2)}</td>
            <td>$${item.total.toFixed(2)}</td>
        </tr>
    `
    )
    .join("");

  const finalHtml = populatedHtml.replace("{{items-body}}", itemsRows);

  // Launch Puppeteer and generate the PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(finalHtml);
  await page.pdf({ path: `Invoice_${order.order_id}.pdf`, format: "A4" });

  await browser.close();
}

// Example order data
const order = {
  order_id: "12345",
  due_date: "July 31, 2024",
  billing_address: "John Doe\n1234 Main St\nAnytown, USA 12345",
  shipping_address: "Jane Doe\n5678 Market St\nAnytown, USA 67890",
  items: [
    { description: "Widget A", quantity: 2, unit_price: 25.0, total: 50.0 },
    { description: "Widget B", quantity: 1, unit_price: 75.0, total: 75.0 },
  ],
  subtotal: 125.0,
  tax: 10.0,
  total: 135.0,
};

// Generate the invoice
generateInvoice(order);
