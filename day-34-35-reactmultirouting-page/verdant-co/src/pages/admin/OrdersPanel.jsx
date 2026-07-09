import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './OrdersPanel.css';

const mockOrders = [
  { id: 'ORD-7294', customer: 'Alex Rivera', date: '2023-10-15', status: 'Fulfilled', total: 16500.00 },
  { id: 'ORD-7102', customer: 'Jordan Lee', date: '2023-10-14', status: 'Refunded', total: 4500.00 },
  { id: 'ORD-8102', customer: 'Alex Rivera', date: '2023-11-02', status: 'Pending', total: 6800.00 },
  { id: 'ORD-8105', customer: 'Sam Taylor', date: '2023-11-03', status: 'Pending', total: 12000.00 },
];

const OrdersPanel = () => {
  const [search, setSearch] = useState('');
  
  const filteredOrders = mockOrders.filter(order => 
    order.id.toLowerCase().includes(search.toLowerCase()) || 
    order.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="orders-panel">
      <header className="admin-header">
        <h1>Order Management</h1>
        <p>View and manage all customer orders.</p>
      </header>
      
      <div className="card">
        <div className="table-controls" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--cream)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', marginLeft: '0.5rem', width: '100%', outline: 'none' }}
            />
          </div>
        </div>
        
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Order ID</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Customer</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem 0', fontWeight: 500, textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>{order.id}</td>
                  <td style={{ padding: '1rem 0' }}>{order.customer}</td>
                  <td style={{ padding: '1rem 0' }}>{order.date}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      backgroundColor: order.status === 'Fulfilled' ? 'rgba(96, 116, 86, 0.1)' : 
                                       order.status === 'Refunded' ? 'rgba(123, 37, 37, 0.1)' : 'rgba(186, 106, 76, 0.1)',
                      color: order.status === 'Fulfilled' ? 'var(--sage)' : 
                             order.status === 'Refunded' ? 'var(--maroon)' : 'var(--terracotta)'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>₹{order.total.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPanel;
