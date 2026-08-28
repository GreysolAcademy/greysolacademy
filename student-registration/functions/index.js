const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const puppeteer = require("puppeteer");

admin.initializeApp();
const db = admin.firestore();

// PUT YOUR SENDGRID API KEY HERE
sgMail.setApiKey("SG.YOUR_SENDGRID_API_KEY");

exports.sendAllPayslips = functions.https.onCall(async (data, context) => {
  const { month, year, runId } = data;

  const runSnap = await db.collection("payrollRuns").doc(runId).get();
  if(!runSnap.exists) throw new functions.https.HttpsError("not-found", "Payroll run not found");
  const run = runSnap.data();

  const browser = await puppeteer.launch({args: ['--no-sandbox']});

  for(const emp of run.employees){
    const staffSnap = await db.collection("staff").doc(emp.staffID).get();
    if(!staffSnap.exists ||!staffSnap.data().email) continue;
    const profile = staffSnap.data();

    // 1. Generate HTML for payslip
    const html = generatePayslipHTML(run, emp, profile);

    // 2. Convert to PDF
    const page = await browser.newPage();
    await page.setContent(html, {waitUntil: 'networkidle0'});
    const pdfBuffer = await page.pdf({format: 'A4', printBackground: true});
    await page.close();

    // 3. Send Email with PDF
    const msg = {
      to: profile.email,
      from: "hr@greysolacademy.com", // must be verified in SendGrid
      subject: `Greysol Academy Payslip - ${month} ${year}`,
      text: `Dear ${profile.firstName},\n\nPlease find attached your payslip for ${month} ${year}.\n\nNet Pay: MWK ${emp.net.toLocaleString()}\n\nRegards,\nGreysol Academy HR`,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: `Payslip-${month}-${year}-${emp.staffID}.pdf`,
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    };
    await sgMail.send(msg);
  }

  await browser.close();
  return {success: true, count: run.employees.length};
});

// This function builds the same professional HTML as your page
function generatePayslipHTML(run, emp, profile){
  const allow = emp.gross - emp.proratedBasic;
  const totalDed = emp.empPension + emp.paye + emp.otherDed;
  return `
  <html><head><style>
    body{font-family:Arial; font-size:12px}
   .header{display:flex;justify-content:space-between;border-bottom:3px solid #001f3f;padding-bottom:10px}
   .header h2{color:#001f3f;margin:0}
    table{width:100%;border-collapse:collapse;margin:10px 0}
    th{background:#001f3f;color:#fff;padding:8px;text-align:left}
    td{padding:8px;border-bottom:1px solid #eee}
   .net{background:#27ae60;color:#fff;padding:12px;text-align:center;font-weight:bold}
  </style></head><body>
    <div class="header">
      <div><h2>GREYSOL ACADEMY</h2><p>P.O Box 30012, Lilongwe</p></div>
      <div><p><b>Pay Period:</b> ${run.month} ${run.year}</p></div>
    </div>
    <h3 style="text-align:center;background:#001f3f;color:#fff;padding:6px">EMPLOYEE PAYSLIP</h3>
    <p><b>Name:</b> ${emp.name} | <b>ID:</b> ${emp.staffID} | <b>Role:</b> ${profile.role}</p>
    <table><tr><th>Earnings</th><th>MWK</th></tr>
      <tr><td>Basic</td><td>${emp.proratedBasic.toLocaleString()}</td></tr>
      <tr><td>Allowances</td><td>${allow.toLocaleString()}</td></tr>
      <tr><td><b>Gross</b></td><td><b>${emp.gross.toLocaleString()}</b></td></tr>
    </table>
    <table><tr><th>Deductions</th><th>MWK</th></tr>
      <tr><td>Pension</td><td>${emp.empPension.toLocaleString()}</td></tr>
      <tr><td>PAYE</td><td>${emp.paye.toLocaleString()}</td></tr>
      <tr><td>Other</td><td>${emp.otherDed.toLocaleString()}</td></tr>
      <tr><td><b>Total</b></td><td><b>${totalDed.toLocaleString()}</b></td></tr>
    </table>
    <div class="net">NET PAY: MWK ${emp.net.toLocaleString()}</div>
  </body></html>`;
}