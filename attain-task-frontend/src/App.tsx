import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';


type Transaction = {
  id: string;
  userId: string;
  payee: string;
  amount: number;
  category: string;
  date: string;
  deleted?: boolean;
};

const API = 'http://localhost:3000/transactions';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<Omit<Transaction, 'id'>>({
    userId: 'user123',
    payee: '',
    amount: 0,
    category: '',
    date: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<{ userId: string; token: string } | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });


  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3000/login', loginForm);
      const { userId, token } = res.data;
      setLoggedInUser({ userId, token });
      // fetchTransactions(); // load user-specific data
    } catch (error) {
      alert('Login failed');
    }
  };
  
  
  const fetchTransactions = async (user: { userId: string; token: string } | null) => {
    const res = await axios.get('http://localhost:3000/transactions');
    console.log("res", res)
    const all = res.data;
    console.log("user in", user, all)
    const temp_transactions = user ? all.filter((t: Transaction) => t.userId === user.userId) : []
    console.log("temp_transactions", temp_transactions)
    setTransactions(temp_transactions);
  };
  

  const createTransaction = async () => {
    if (!loggedInUser) return;
  
    // await axios.post('http://localhost:3000/transactions', {
    //   ...form,
    //   userId: loggedInUser.userId,
    // });
    // fetchTransactions(loggedInUser);
    const res = await axios.post(API, { ...form, userId: loggedInUser.userId });
    setTransactions([...transactions, res.data]);

    setForm({ userId: '', payee: '', amount: 0, category: '', date: '' });
  };
  

  const updateTransaction = async () => {
    if (!editingId) return;
  
    // await axios.put(`${API}/${editingId}`, form);
    // fetchTransactions(loggedInUser);
    await axios.put(`${API}/${editingId}`, form);
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === editingId ? { ...tx, ...form } : tx))
    );
    setEditingId(null);

    setForm({ userId: 'user123', payee: '', amount: 0, category: '', date: '' });
  };
  

  const deleteTransaction = async (id: string) => {
    await axios.delete(`${API}/${id}`);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));

  };

  useEffect(() => {
    if(loggedInUser){
      fetchTransactions(loggedInUser);
    }
  }, [loggedInUser]);

  console.log("transactions", transactions)
  console.log("loggedInUser out", loggedInUser)

  return (
    <div className="container">
      {!loggedInUser ? (
        <>
          <h2>Login</h2>
          <input
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          <button onClick={handleLogin}>Login</button>
        </>
      ) :(
        <div className='main-view'>
          <div className='welcome-banner'>
          <p>Welcome, <strong>{loggedInUser.userId}</strong></p>
          </div>
          <div className='left-side'>
          <h2>{editingId ? 'Edit' : 'Create'} Transaction</h2>
          <input
            placeholder="Payee"
            value={form.payee}
            onChange={(e) => setForm({ ...form, payee: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          {editingId ? (
            <button onClick={updateTransaction}>Update</button>
          ) : (
            <button onClick={createTransaction}>Add</button>
          )}
          </div>
          
          <div className='right-side'>
          <h2>Transactions</h2>
          {transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-details">
                  <strong>{tx.payee}</strong> - ₹{tx.amount} ({tx.category}) on {tx.date}
                </div>
                <div className="transaction-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setForm({
                        userId: tx.userId,
                        payee: tx.payee,
                        amount: tx.amount,
                        category: tx.category,
                        date: tx.date,
                      });
                      setEditingId(tx.id);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteTransaction(tx.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      )}
    </div>
  );
  
}

export default App;
