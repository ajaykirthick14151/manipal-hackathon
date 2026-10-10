const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0}).format(value);
let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}
function downloadCSV(filename, rows) {
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"','""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function showSimpleDialog(title, copy, label = 'Details', placeholder = 'Enter details', submitText = 'Confirm', callback = null) {
  $('#simple-dialog-title').textContent = title;
  $('#simple-dialog-copy').textContent = copy;
  $('#simple-dialog-label').firstChild.textContent = label;
  $('#simple-dialog-input').value = '';
  $('#simple-dialog-input').placeholder = placeholder;
  $('#simple-dialog-submit').textContent = submitText;
  const dialog = $('#simple-dialog');
  dialog.showModal();
  $('#simple-dialog-submit').onclick = event => {
    event.preventDefault();
    const value = $('#simple-dialog-input').value.trim();
    if (callback) callback(value);
    dialog.close();
  };
}
$('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$$('.nav-link').forEach(link => link.addEventListener('click', () => {
  $$('.nav-link').forEach(item => item.classList.remove('active'));
  link.classList.add('active');
  $('#sidebar').classList.remove('open');
}));
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const link = $(`.nav-link[href="#${entry.target.id}"]`);
      if (link) { $$('.nav-link').forEach(item => item.classList.remove('active')); link.classList.add('active'); }
    }
  });
}, {rootMargin:'-20% 0px -70% 0px'});
$$('main section[id], main #overview').forEach(section => navObserver.observe(section));

$('#cashflow-form').addEventListener('submit', event => {
  event.preventDefault();
  const income = Number($('#income').value);
  const expenses = Number($('#expenses').value);
  const obligations = Number($('#obligations').value);
  if ([income, expenses, obligations].some(value => !Number.isFinite(value) || value < 0)) {
    toast('Enter valid non-negative amounts.'); return;
  }
  const cash = income - expenses - obligations;
  const repayment = Math.max(0, Math.round(cash * 0.65));
  $('#cashflow-result').textContent = money(cash);
  $('#income-summary').textContent = money(income);
  $('#cost-summary').textContent = '− ' + money(expenses + obligations);
  $('#available-cash').textContent = money(cash);
  $('#suggested-repayment').textContent = money(repayment);
  $('#advice-box');
  $('#cashflow-advice').textContent = cash <= 0
    ? 'Your expenses and obligations meet or exceed income. Avoid committing to a repayment until essentials are covered.'
    : `A conservative starting point is ${money(repayment)} per month (65% of available cash). Keep an emergency buffer and review before acting.`;
  $('#prediction-copy').textContent = 'Cash-flow calculation refreshed from the values entered above. This is a demo estimate, not a lender decision.';
  toast('Cash-flow analysis updated.');
});
function choosePlan(months, amount) {
  $('#plan-amount').innerHTML = `${money(amount)} <small>/ month</small>`;
  $('#suggested-repayment').textContent = money(amount);
  $('#custom-payment').value = amount;
  toast(`${months}-month plan selected: ${money(amount)} per month.`);
}
$$('.choose-plan').forEach(button => button.addEventListener('click', () => choosePlan(button.dataset.months, Number(button.dataset.amount))));
$('#edit-plan').addEventListener('click', () => { $('#custom-payment').value = Number($('#suggested-repayment').textContent.replace(/[₹,\s]/g,'')) || 4200; $('#plan-dialog').showModal(); });
$('#save-payment').addEventListener('click', event => {
  event.preventDefault();
  const amount = Number($('#custom-payment').value);
  if (!Number.isFinite(amount) || amount < 0) { toast('Enter a valid monthly payment.'); return; }
  $('#plan-amount').innerHTML = `${money(amount)} <small>/ month</small>`;
  $('#suggested-repayment').textContent = money(amount);
  $('#plan-dialog').close();
  toast('Recommendation saved locally for this demo.');
});
$('#sync-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!$('#consent').checked) { toast('Borrower consent is required before processing a message.'); return; }
  const message = $('#bank-message').value;
  const amountMatch = message.match(/(?:rs\.?|inr|₹)\s?([\d,]+(?:\.\d{1,2})?)/i) || message.match(/credited by\s+(?:rs\.?|₹)?\s?([\d,]+)/i) || message.match(/debited by\s+(?:rs\.?|₹)?\s?([\d,]+)/i);
  const amount = amountMatch ? Number(amountMatch[1].replaceAll(',','')) : 0;
  if (!amount) { toast('Could not find a transaction amount. Check the bank message format.'); return; }
  const isDebit = /debited|spent|paid|withdrawn/i.test(message);
  const currentCash = Number($('#available-cash').textContent.replace(/[₹,\s]/g,'')) || 0;
  const estimate = Math.max(0, currentCash + (isDebit ? -amount : amount));
  const payment = Math.round(estimate * 0.55);
  $('#prediction-amount').textContent = money(estimate);
  $('#predicted-payment').textContent = money(payment);
  $('#confidence').textContent = 'Demo estimate';
  $('#prediction-copy').textContent = `${isDebit ? 'Debit' : 'Credit'} of ${money(amount)} detected from the forwarded message. Review the extracted transaction before using it.`;
  $('#events-today').textContent = String(Number($('#events-today').textContent) + 1);
  const item = document.createElement('div'); item.className = 'activity-item';
  item.innerHTML = `<span class="activity-icon mint">↯</span><div><b>Bank message processed</b><p>${isDebit ? 'Debit' : 'Credit'} · ${money(amount)} · ${new Date().toLocaleDateString('en-IN')}</p></div><span class="mini-status">Demo</span>`;
  $('#activity-list').prepend(item);
  toast('Message parsed locally. No bank connection was contacted.');
});
$('#export-report').addEventListener('click', () => downloadCSV('pulse-summary.csv', [
  ['Metric','Value'],['Available cash',$('#available-cash').textContent],['Suggested repayment',$('#suggested-repayment').textContent],['Loan balance','₹42,600'],['Financial health score','78/100'],['Data note','Sample dashboard values']
]));
$('#export-portfolio').addEventListener('click', () => downloadCSV('pulse-portfolio.csv', [
  ['Borrower','Loan','Available cash','Status','Priority'],
  ['Priya Menon','PL-20514','₹3,100','Forecast dip','High'],
  ['Ananya Rao','PL-20481',$('#available-cash').textContent,'On track','Medium'],
  ['Ravi Kumar','PL-20472','₹4,220','Late by 3 days','Medium']
]));
$('#generate-report').addEventListener('click', () => { toast('Report generated as a CSV summary.'); downloadCSV('pulse-report.csv', [['Report','Value'],['Recovery rate','91.6%'],['Borrowers analyzed','24'],['Audit traceability','100%'],['Note','Illustrative demo data']]); });
$$('.preview-report').forEach(button => button.addEventListener('click', () => toast(`${button.closest('.report-card').querySelector('h3').textContent} report preview: sample data only.`)));
$('#user-search').addEventListener('input', event => {
  const query = event.target.value.toLowerCase();
  $$('#users-table tbody tr').forEach(row => row.classList.toggle('hidden', !row.textContent.toLowerCase().includes(query)));
});
$('#invite-user').addEventListener('click', () => showSimpleDialog('Invite a user', 'Enter an email address to simulate sending a workspace invitation.', 'Email address', 'name@example.com', 'Send invitation', email => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Enter a valid email address.'); return; }
  const row = document.createElement('tr');
  row.innerHTML = `<td><b>${email.split('@')[0]}</b><small>${email}</small></td><td>Borrower</td><td><span class="table-status pending">Invite pending</span></td><td>Just now</td><td>Borrower portal</td>`;
  $('#users-table tbody').prepend(row);
  toast(`Demo invitation prepared for ${email}. No email was sent.`);
}));
$('#edit-profile').addEventListener('click', () => showSimpleDialog('Edit borrower profile', 'This demo keeps profile edits local. Enter the display name you want to preview.', 'Display name', 'Ananya Rao', 'Save profile', name => {
  if (!name) { toast('Name cannot be empty.'); return; }
  $('#borrower h2')?.replaceChildren(document.createTextNode(name));
  $('#borrower .profile-panel h3').textContent = name;
  toast('Profile display name updated locally.');
}));
$$('.review-action').forEach(button => button.addEventListener('click', () => toast(`${button.textContent} action opened for lender review (demo only).`)));
$$('.notification-action').forEach(button => button.addEventListener('click', () => { button.closest('.notification-item').style.opacity = '.68'; toast(`${button.textContent} recorded locally. No lender action was sent.`); }));
$$('.dismiss-notification').forEach(button => button.addEventListener('click', () => { button.closest('.notification-item').remove(); toast('Notification dismissed.'); }));
$('#mark-read').addEventListener('click', () => { $$('.notification-item').forEach(item => item.style.background = '#fbfcfa'); toast('Notifications marked as read in this demo.'); });
$('#refresh-queue').addEventListener('click', () => toast('Priority queue refreshed with demo values.'));
$('#run-model').addEventListener('click', () => { $('#model-output').textContent = 'Demo anomaly pass complete: one high-change purchase and one review signal detected. No production ML model is connected.'; toast('Sample purchase analysis completed.'); });
$('#copy-endpoint').addEventListener('click', async () => {
  const endpoint = $('#endpoint-url').textContent;
  try { await navigator.clipboard.writeText(endpoint); toast('Webhook endpoint copied.'); }
  catch { toast(endpoint); }
});
$('#test-event').addEventListener('click', () => { $('#events-today').textContent = String(Number($('#events-today').textContent) + 1); toast('Simulated test event accepted. No server was contacted.'); });
$('#rotate-secret').addEventListener('click', () => toast('Secret rotation requires a secured backend; this frontend demo does not store secrets.'));
$('#add-connection').addEventListener('click', () => showSimpleDialog('Add connection', 'Name the payment or bank connection you want to configure.', 'Connection name', 'My bank webhook', 'Continue', name => toast(name ? `Connection "${name}" is a frontend placeholder. Configure a secured backend to connect.` : 'Enter a connection name.')));
$$('.connector').forEach(button => button.addEventListener('click', () => {
  if (!$('#transaction-consent').checked) { toast('Enable borrower data consent before starting a connector.'); return; }
  toast(`${button.dataset.connector}: live authorization is not configured in this demo.`);
}));
$('#compact-mode').addEventListener('change', event => document.body.classList.toggle('compact-mode', event.target.checked));
$('#demo-notice').addEventListener('change', event => $('#demo-notice-box').classList.toggle('hidden', !event.target.checked));
$('#chart-range').addEventListener('change', event => toast(`Chart range changed to ${event.target.value}. Bars remain illustrative sample data.`));
$('#export-report').title = 'Download a CSV summary of dashboard figures';
$('#simple-dialog').addEventListener('close', () => { $('#simple-dialog-submit').onclick = null; });
