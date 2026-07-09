import React from 'react';
import './Orders.css';

const Orders = () => {
  // Mock customer orders
  const mockOrders = [
    {
      id: 'ORD-7294',
      date: '2023-10-15',
      status: 'Fulfilled',
      total: 165.00,
      items: ['Terracotta Planter', 'Sage Linen Throw']
    },
    {
      id: 'ORD-8102',
      date: '2023-11-02',
      status: 'Pending',
      total: 68.00,
      items: ['Woven Table Runner']
    }
  ];

  return (
    <div className="orders-page">
      <header className="page-header">
        <h1>My Orders</h1>
        <p>Track and manage your recent purchases.</p>
      </header>

      <div className="orders-list">
        {mockOrders.map(order => (
          <div className="order-card card" key={order.id}>
            <div className="order-header">
              <div className="order-id">
                <span className="label">Order</span>
                <span className="value">#{order.id}</span>
              </div>
              <div className="order-date">
                <span className="label">Date</span>
                <span className="value">{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div className="order-total">
                <span className="label">Total</span>
                <span className="value">${order.total.toFixed(2)}</span>
              </div>
              <div className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status}
              </div>
            </div>
            
            <div className="order-items">
              <span className="label">Items:</span>
              <p>{order.items.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
