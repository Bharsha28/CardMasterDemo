import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import { payments, statements } from "../../data/mockData";
import { customerApi } from "../../services/api";

function CustomerStatementsPage() {
  const [statementRows, setStatementRows] = useState(statements);
  const [paymentRows, setPaymentRows] = useState(payments);

  useEffect(() => {
    async function loadStatementData() {
      try {
        const [myStatements, myPayments] = await Promise.all([
          customerApi.getMyStatements(),
          customerApi.getMyPayments()
        ]);

        setStatementRows(Array.isArray(myStatements) ? myStatements : statements);
        setPaymentRows(Array.isArray(myPayments) ? myPayments : payments);
      } catch (error) {
        setStatementRows(statements);
        setPaymentRows(payments);
      }
    }

    loadStatementData();
  }, []);

  return (
    <Layout section="customer" title="Customer Dashboard">
      <PageHeader
        title="My Statements And Payments"
        subtitle="Review your statement periods, total due, minimum due and payments received."
      />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Statements</h5>
          <DataTable
            columns={[
              { key: "statementId", label: "Statement ID" },
              { key: "accountId", label: "Account ID" },
              { key: "periodStart", label: "Period Start" },
              { key: "periodEnd", label: "Period End" },
              { key: "totalDue", label: "Total Due" },
              { key: "minimumDue", label: "Minimum Due" },
              { key: "status", label: "Status", type: "status" }
            ]}
            rows={statementRows}
            emptyMessage="No statements found for this customer."
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Payments</h5>
          <DataTable
            columns={[
              { key: "paymentId", label: "Payment ID" },
              { key: "accountId", label: "Account ID" },
              { key: "amount", label: "Amount" },
              { key: "paymentDate", label: "Payment Date" },
              { key: "method", label: "Method" },
              { key: "status", label: "Status", type: "status" }
            ]}
            rows={paymentRows}
            emptyMessage="No payments found for this customer."
          />
        </div>
      </div>
    </Layout>
  );
}

export default CustomerStatementsPage;
