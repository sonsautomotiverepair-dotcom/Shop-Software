import React, { useEffect, useMemo, useState } from 'react';

const defaultSettings = {
  shopName: 'Sons Auto Repair',
  laborRate: 126,
  techCount: 4,
  payStructure: 'Flag Hours',
  estimateDelivery: 'Both',
  shopSuppliesPercent: 8,
  taxPercent: 0,
  vendors: ['AutoZone', "O'Reilly's", 'RockAuto'],
  statuses: [
    'Waiting for Diagnosis',
    'Waiting on Parts',
    'Waiting for Approval',
    'In Progress',
    'Ready For Pickup',
    'Closed',
  ],
  techs: ['Johnny', 'Cody', 'Luis', 'Tyler'],
};

const initialCustomers = [
  {
    id: 1,
    name: 'James Walker',
    phone: '918-555-1021',
    email: 'jwalker@email.com',
  },
  {
    id: 2,
    name: 'Sarah Davis',
    phone: '918-555-2201',
    email: 'sdavis@email.com',
  },
  {
    id: 3,
    name: 'Mike Turner',
    phone: '918-555-1887',
    email: 'mturner@email.com',
  },
];

const initialVehicles = [
  {
    id: 1,
    customerId: 1,
    year: 2015,
    make: 'Ford',
    model: 'F-150',
    vin: '1FTFW1EF7FKD10001',
    mileage: 148230,
  },
  {
    id: 2,
    customerId: 2,
    year: 2018,
    make: 'Toyota',
    model: 'Camry',
    vin: '4T1B11HK8JU20002',
    mileage: 103552,
  },
  {
    id: 3,
    customerId: 3,
    year: 2014,
    make: 'Chevrolet',
    model: 'Silverado 1500',
    vin: '3GCUKREC1EG30003',
    mileage: 182019,
  },
];

const initialOrders = [
  {
    id: 1001,
    ro: 'RO-2401',
    customerId: 1,
    vehicleId: 1,
    status: 'In Progress',
    advisor: 'Johnny',
    tech: 'Cody',
    complaint: 'Check engine light and rough idle',
    labor: [
      { id: 1, description: 'Diagnostic inspection', hours: 1.0, rate: 126 },
      { id: 2, description: 'Replace ignition coil', hours: 0.8, rate: 126 },
    ],
    parts: [
      { id: 1, description: 'Ignition Coil', qty: 1, price: 74.99, vendor: 'AutoZone' },
      { id: 2, description: 'Spark Plugs', qty: 6, price: 8.5, vendor: "O'Reilly's" },
    ],
    notes: 'Customer approved up to $650. Needs done by tomorrow afternoon.',
    invoicePaid: false,
  },
  {
    id: 1002,
    ro: 'RO-2402',
    customerId: 2,
    vehicleId: 2,
    status: 'Waiting for Approval',
    advisor: 'Johnny',
    tech: 'Luis',
    complaint: 'Front brakes grinding',
    labor: [{ id: 1, description: 'Front brake job', hours: 1.5, rate: 126 }],
    parts: [
      { id: 1, description: 'Front Brake Pads', qty: 1, price: 69.99, vendor: 'AutoZone' },
      { id: 2, description: 'Front Rotors', qty: 2, price: 55, vendor: "O'Reilly's" },
    ],
    notes: 'Estimate sent. Waiting on customer response.',
    invoicePaid: false,
  },
  {
    id: 1003,
    ro: 'RO-2403',
    customerId: 3,
    vehicleId: 3,
    status: 'Ready For Pickup',
    advisor: 'Johnny',
    tech: 'Tyler',
    complaint: 'Oil leak and charging issue',
    labor: [
      { id: 1, description: 'Replace valve cover gaskets', hours: 2.1, rate: 126 },
      { id: 2, description: 'Replace alternator', hours: 1.2, rate: 126 },
    ],
    parts: [
      { id: 1, description: 'Valve Cover Gasket Set', qty: 1, price: 48.99, vendor: 'RockAuto' },
      { id: 2, description: 'Alternator', qty: 1, price: 219.99, vendor: 'RockAuto' },
    ],
    notes: 'Truck is done. Test drove fine.',
    invoicePaid: false,
  },
];

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function cardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #d9dee7',
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  };
}

function buttonStyle(kind = 'primary') {
  const base = {
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
    border: '1px solid',
  };

  if (kind === 'secondary') {
    return {
      ...base,
      background: '#fff',
      color: '#111827',
      borderColor: '#cfd6df',
    };
  }

  return {
    ...base,
    background: '#111827',
    color: '#fff',
    borderColor: '#111827',
  };
}

function inputStyle() {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #cfd6df',
    boxSizing: 'border-box',
    fontSize: 14,
  };
}

function labelStyle() {
  return {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
    color: '#374151',
  };
}

export default function App() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sons_shop_settings_phase1');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [orders] = useState(initialOrders);
  const [customers] = useState(initialCustomers);
  const [vehicles] = useState(initialVehicles);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrders[0]?.id ?? null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('sons_shop_settings_phase1', JSON.stringify(settings));
  }, [settings]);

  const getCustomer = (customerId) => customers.find((c) => c.id === customerId);
  const getVehicle = (vehicleId) => vehicles.find((v) => v.id === vehicleId);

  const calcLabor = (order) =>
    order.labor.reduce((sum, line) => sum + Number(line.hours) * Number(line.rate), 0);

  const calcParts = (order) =>
    order.parts.reduce((sum, line) => sum + Number(line.qty) * Number(line.price), 0);

  const calcShopSupplies = (order) =>
    (calcLabor(order) + calcParts(order)) * (Number(settings.shopSuppliesPercent || 0) / 100);

  const calcTax = (order) =>
    (calcLabor(order) + calcParts(order) + calcShopSupplies(order)) *
    (Number(settings.taxPercent || 0) / 100);

  const calcTotal = (order) =>
    calcLabor(order) + calcParts(order) + calcShopSupplies(order) + calcTax(order);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((order) => {
      const customer = getCustomer(order.customerId);
      const vehicle = getVehicle(order.vehicleId);

      const haystack = [
        order.ro,
        order.status,
        order.complaint,
        order.tech,
        customer?.name,
        customer?.phone,
        vehicle?.make,
        vehicle?.model,
        vehicle?.vin,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [orders, search]);

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ||
    orders.find((o) => o.id === selectedOrderId) ||
    orders[0];

  const dashboard = useMemo(() => {
    const openCount = orders.filter((o) => o.status !== 'Closed').length;
    const waitingApproval = orders.filter((o) => o.status === 'Waiting for Approval').length;
    const readyPickup = orders.filter((o) => o.status === 'Ready For Pickup').length;
    const totalSales = orders.reduce((sum, order) => sum + calcTotal(order), 0);

    return { openCount, waitingApproval, readyPickup, totalSales };
  }, [orders, settings]);

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        background: '#f3f5f8',
        minHeight: '100vh',
        color: '#111827',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
        <div
          style={{
            ...cardStyle(),
            marginBottom: 20,
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            color: '#fff',
            border: 'none',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 32 }}>{settings.shopName} Shop System</h1>
          <p style={{ margin: '8px 0 0 0', color: '#d1d5db' }}>
            Phase 1 dashboard live on your domain.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 700 }}>Open Repair Orders</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>{dashboard.openCount}</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 700 }}>Waiting for Approval</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>
              {dashboard.waitingApproval}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 700 }}>Ready For Pickup</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>
              {dashboard.readyPickup}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 700 }}>Visible Ticket Sales</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>
              {money(dashboard.totalSales)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 430px) 1fr',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={cardStyle()}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>Repair Orders</h2>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                    Search by RO, customer, vehicle, or complaint
                  </div>
                </div>
              </div>

              <input
                style={inputStyle()}
                placeholder="Search repair orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div style={{ marginTop: 14, display: 'grid', gap: 10, maxHeight: 620, overflow: 'auto' }}>
                {filteredOrders.map((order) => {
                  const customer = getCustomer(order.customerId);
                  const vehicle = getVehicle(order.vehicleId);
                  const active = selectedOrder?.id === order.id;

                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      style={{
                        textAlign: 'left',
                        borderRadius: 12,
                        padding: 14,
                        cursor: 'pointer',
                        border: active ? '1px solid #111827' : '1px solid #d9dee7',
                        background: active ? '#111827' : '#fff',
                        color: active ? '#fff' : '#111827',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 10,
                          alignItems: 'center',
                        }}
                      >
                        <strong>{order.ro}</strong>
                        <span
                          style={{
                            fontSize: 12,
                            padding: '4px 8px',
                            borderRadius: 999,
                            background: active ? '#374151' : '#eef2f7',
                            color: active ? '#fff' : '#374151',
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 14 }}>
                        {customer?.name} • {vehicle?.year} {vehicle?.make} {vehicle?.model}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          color: active ? '#d1d5db' : '#6b7280',
                        }}
                      >
                        {order.complaint}
                      </div>
                    </button>
                  );
                })}

                {!filteredOrders.length && (
                  <div style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>
                    No repair orders found.
                  </div>
                )}
              </div>
            </div>

            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0, fontSize: 20 }}>Shop Settings</h2>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                These save in your browser for now.
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label style={labelStyle()}>Shop Name</label>
                  <input
                    style={inputStyle()}
                    value={settings.shopName}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, shopName: e.target.value }))
                    }
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle()}>Labor Rate</label>
                    <input
                      style={inputStyle()}
                      type="number"
                      value={settings.laborRate}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          laborRate: Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label style={labelStyle()}>Tech Count</label>
                    <input
                      style={inputStyle()}
                      type="number"
                      value={settings.techCount}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          techCount: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle()}>Pay Structure</label>
                  <input
                    style={inputStyle()}
                    value={settings.payStructure}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, payStructure: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Estimate Delivery</label>
                  <select
                    style={inputStyle()}
                    value={settings.estimateDelivery}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, estimateDelivery: e.target.value }))
                    }
                  >
                    <option value="Text">Text</option>
                    <option value="Email">Email</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle()}>Shop Supplies %</label>
                    <input
                      style={inputStyle()}
                      type="number"
                      value={settings.shopSuppliesPercent}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          shopSuppliesPercent: Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label style={labelStyle()}>Tax %</label>
                    <input
                      style={inputStyle()}
                      type="number"
                      value={settings.taxPercent}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          taxPercent: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  Vendors: {settings.vendors.join(', ')}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <div style={cardStyle()}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'start',
                  marginBottom: 16,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 22 }}>
                    {selectedOrder ? selectedOrder.ro : 'No repair order selected'}
                  </h2>
                  {selectedOrder && (
                    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                      {getCustomer(selectedOrder.customerId)?.name} •{' '}
                      {getVehicle(selectedOrder.vehicleId)?.year}{' '}
                      {getVehicle(selectedOrder.vehicleId)?.make}{' '}
                      {getVehicle(selectedOrder.vehicleId)?.model}
                    </div>
                  )}
                </div>

                {selectedOrder && (
                  <div
                    style={{
                      fontSize: 12,
                      padding: '6px 10px',
                      borderRadius: 999,
                      background: '#eef2f7',
                      color: '#374151',
                      fontWeight: 700,
                    }}
                  >
                    {selectedOrder.status}
                  </div>
                )}
              </div>

              {selectedOrder ? (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 14,
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ ...cardStyle(), padding: 14 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
                        Complaint
                      </div>
                      <div style={{ marginTop: 8 }}>{selectedOrder.complaint}</div>
                    </div>

                    <div style={{ ...cardStyle(), padding: 14 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
                        Advisor / Tech
                      </div>
                      <div style={{ marginTop: 8 }}>
                        {selectedOrder.advisor} / {selectedOrder.tech}
                      </div>
                    </div>

                    <div style={{ ...cardStyle(), padding: 14 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>VIN</div>
                      <div style={{ marginTop: 8 }}>{getVehicle(selectedOrder.vehicleId)?.vin}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 20,
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <h3 style={{ marginTop: 0 }}>Labor</h3>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                              <th style={{ padding: '10px 8px' }}>Description</th>
                              <th style={{ padding: '10px 8px' }}>Hours</th>
                              <th style={{ padding: '10px 8px' }}>Rate</th>
                              <th style={{ padding: '10px 8px' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.labor.map((line) => (
                              <tr key={line.id} style={{ borderBottom: '1px solid #eef2f7' }}>
                                <td style={{ padding: '10px 8px' }}>{line.description}</td>
                                <td style={{ padding: '10px 8px' }}>{line.hours}</td>
                                <td style={{ padding: '10px 8px' }}>{money(line.rate)}</td>
                                <td style={{ padding: '10px 8px' }}>
                                  {money(Number(line.hours) * Number(line.rate))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ marginTop: 0 }}>Parts</h3>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                              <th style={{ padding: '10px 8px' }}>Description</th>
                              <th style={{ padding: '10px 8px' }}>Qty</th>
                              <th style={{ padding: '10px 8px' }}>Vendor</th>
                              <th style={{ padding: '10px 8px' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.parts.map((line) => (
                              <tr key={line.id} style={{ borderBottom: '1px solid #eef2f7' }}>
                                <td style={{ padding: '10px 8px' }}>{line.description}</td>
                                <td style={{ padding: '10px 8px' }}>{line.qty}</td>
                                <td style={{ padding: '10px 8px' }}>{line.vendor}</td>
                                <td style={{ padding: '10px 8px' }}>
                                  {money(Number(line.qty) * Number(line.price))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 320px',
                      gap: 20,
                    }}
                  >
                    <div style={{ ...cardStyle(), padding: 14 }}>
                      <h3 style={{ marginTop: 0 }}>Notes</h3>
                      <div style={{ color: '#374151', lineHeight: 1.5 }}>
                        {selectedOrder.notes || 'No notes yet.'}
                      </div>
                    </div>

                    <div style={{ ...cardStyle(), padding: 14 }}>
                      <h3 style={{ marginTop: 0 }}>Invoice Snapshot</h3>
                      <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Labor</span>
                          <strong>{money(calcLabor(selectedOrder))}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Parts</span>
                          <strong>{money(calcParts(selectedOrder))}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Shop Supplies</span>
                          <strong>{money(calcShopSupplies(selectedOrder))}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Tax</span>
                          <strong>{money(calcTax(selectedOrder))}</strong>
                        </div>
                        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                          <span>Total</span>
                          <strong>{money(calcTotal(selectedOrder))}</strong>
                        </div>
                      </div>

                      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button style={buttonStyle('primary')}>Print Invoice</button>
                        <button style={buttonStyle('secondary')}>Mark Paid</button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ color: '#6b7280' }}>Select a repair order to view details.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}