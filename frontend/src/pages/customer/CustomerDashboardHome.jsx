import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import { accounts, applications, cards, customerStats, payments, statements, transactions } from "../../data/mockData";
import { customerApi } from "../../services/api";

function CustomerDashboardHome() {
  const [customer, setCustomer] = useState(null);
  const [applicationRows, setApplicationRows] = useState(applications);
  const [cardRows, setCardRows] = useState(cards);
  const [account, setAccount] = useState(accounts[0] || null);
  const [transactionRows, setTransactionRows] = useState(transactions);
  const [statementRows, setStatementRows] = useState(statements);
  const [paymentRows, setPaymentRows] = useState(payments);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const myCustomer = await customerApi.getMyCustomer();
        setCustomer(myCustomer);
        const [myCards, myAccount, myTransactions, myStatements, myPayments] = await Promise.all([
          customerApi.getMyCards(),
          customerApi.getMyAccount(),
          customerApi.getMyTransactions(),
          customerApi.getMyStatements(),
          customerApi.getMyPayments()
        ]);
        setCardRows(Array.isArray(myCards) ? myCards : cards);
        setAccount(myAccount || accounts[0] || null);
        setTransactionRows(Array.isArray(myTransactions) ? myTransactions : transactions);
        setStatementRows(Array.isArray(myStatements) ? myStatements : statements);
        setPaymentRows(Array.isArray(myPayments) ? myPayments : payments);
        if (myCustomer?.customerId) {
          const apps = await customerApi.getApplicationsByCustomer(myCustomer.customerId);
          setApplicationRows(apps);
        }
      } catch (error) {
        setApplicationRows(applications);
        setCardRows(cards);
        setAccount(accounts[0] || null);
        setTransactionRows(transactions);
        setStatementRows(statements);
        setPaymentRows(payments);
      }
    }

    loadDashboard();
  }, []);

  const recentApplications = useMemo(() => applicationRows.slice(0, 3), [applicationRows]);
  const openStatement = useMemo(
    () => statementRows.find((item) => String(item.status).toUpperCase() === "OPEN"),
    [statementRows]
  );
  const latestPayment = useMemo(() => paymentRows[0], [paymentRows]);
  const usedBalance = useMemo(
    () => Math.max(0, Number(account?.creditLimit || 0) - Number(account?.availableLimit || 0)),
    [account]
  );
  const stats = useMemo(
    () => [
      { label: "Open Applications", value: String(applicationRows.filter((item) => ["Submitted", "UnderReview", "SUBMITTED", "UNDER_REVIEW"].includes(item.status)).length).padStart(2, "0"), icon: "bi-file-earmark-text" },
      { label: "My Cards", value: String(cardRows.length).padStart(2, "0"), icon: "bi-credit-card-2-front" },
      { label: "Used Balance", value: usedBalance.toLocaleString(), icon: "bi-wallet2" },
      { label: "Current Due", value: Number(openStatement?.totalDue || 0).toLocaleString(), icon: "bi-receipt" }
    ],
    [applicationRows, cardRows.length, openStatement?.totalDue, usedBalance]
  );

  return (
    <Layout section="customer" title="Customer Dashboard">
      <PageHeader
        title="Customer Dashboard Home"
        subtitle="Track profile setup, applications and KYC progress from one place."
      />

      <div className="row g-3 mb-4">
        {stats.map((item, index) => (
          <StatCard
            key={item.label}
            title={item.label}
            value={item.value}
            icon={item.icon}
            accent={["primary", "warning", "success", "info"][index]}
          />
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Recent Applications</h5>
          <DataTable
            columns={[
              { key: "productId", label: "Product ID" },
              { key: "customerId", label: "Customer ID" },
              { key: "requestedLimit", label: "Requested Limit" },
              { key: "applicationDate", label: "Applied Date" },
              { key: "status", label: "Status", type: "status" }
            ]}
            rows={recentApplications}
          />
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="mb-3">Account Summary</h5>
              <div className="row g-3">
                <div className="col-6">
                  <div className="border rounded p-3 bg-light">
                    <div className="text-muted small">Account ID</div>
                    <div className="fw-semibold">{account?.accountId || "-"}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3 bg-light">
                    <div className="text-muted small">Status</div>
                    <div className="fw-semibold">{account?.status || customer?.status || customerStats[3].value}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3 bg-light">
                    <div className="text-muted small">Available Limit</div>
                    <div className="fw-semibold">{Number(account?.availableLimit || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3 bg-light">
                    <div className="text-muted small">Last Payment</div>
                    <div className="fw-semibold">{Number(latestPayment?.amount || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="mb-3">Recent Transactions</h5>
              <DataTable
                columns={[
                  { key: "merchant", label: "Merchant" },
                  { key: "amount", label: "Amount" },
                  { key: "transactionDate", label: "Date" },
                  { key: "status", label: "Status", type: "status" }
                ]}
                rows={transactionRows.slice(0, 3)}
                emptyMessage="No transactions found for this customer."
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CustomerDashboardHome;
