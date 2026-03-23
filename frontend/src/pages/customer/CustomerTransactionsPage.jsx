import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import { transactions } from "../../data/mockData";
import { customerApi } from "../../services/api";

function CustomerTransactionsPage() {
  const [rows, setRows] = useState(transactions);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const myTransactions = await customerApi.getMyTransactions();
        setRows(Array.isArray(myTransactions) ? myTransactions : transactions);
      } catch (error) {
        setRows(transactions);
      }
    }

    loadTransactions();
  }, []);

  return (
    <Layout section="customer" title="Customer Dashboard">
      <PageHeader
        title="My Transactions"
        subtitle="See only the transactions posted against your own card account."
      />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <DataTable
            columns={[
              { key: "transactionId", label: "Transaction ID" },
              { key: "merchant", label: "Merchant" },
              { key: "amount", label: "Amount" },
              { key: "currency", label: "Currency" },
              { key: "channel", label: "Channel" },
              { key: "transactionDate", label: "Date" },
              { key: "status", label: "Status", type: "status" }
            ]}
            rows={rows}
            emptyMessage="No transactions found for this customer."
          />
        </div>
      </div>
    </Layout>
  );
}

export default CustomerTransactionsPage;
