import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
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
  advisors: ['Johnny'],
};

const initialCustomers = [
  { id: 1, name: 'James Walker', phone: '918-555-1021', email: 'jwalker@email.com' },
  { id: 2, name: 'Sarah Davis', phone: '918-555-2201', email: 'sdavis@email.com' },
  { id: 3, name: 'Mike Turner', phone: '918-555-1887', email: 'mturner@email.com' },
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
    plate: 'OK-1234',
  },
  {
    id: 2,
    customerId: 2,
    year: 2018,
    make: 'Toyota',
    model: 'Camry',
    vin: '4T1B11HK8JU20002',
    mileage: 103552,
    plate: 'OK-2201',
  },
  {
    id: 3,
    customerId: 3,
    year: 2014,
    make: 'Chevrolet',
    model: 'Silverado 1500',
    vin: '3GCUKREC1EG30003',
    mileage: 182019,
    plate: 'OK-7788',
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
    declinedWork: [
      {
        id: 1,
        description: 'Recommend full tune-up and air filter service',
        estimatedAmount: 289.99,
        date: '2026-03-01',
      },
    ],
    notes: 'Customer approved up to $650. Needs done by tomorrow afternoon.',
    invoicePaid: false,
    isComeback: false,
    comebackReason: '',
    comebackOriginalRo: '',
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
    declinedWork: [],
    notes: 'Estimate sent. Waiting on customer response.',
    invoicePaid: false,
    isComeback: false,
    comebackReason: '',
    comebackOriginalRo: '',
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
    declinedWork: [
      {
        id: 2,
        description: 'Transmission service recommended',
        estimatedAmount: 219.99,
        date: '2026-03-04',
      },
    ],
    notes: 'Truck is done. Test drove fine.',
    invoicePaid: false,
    isComeback: true,
    comebackReason: 'Customer returned for recheck after prior alternator install.',
    comebackOriginalRo: 'RO-2388',
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

  if (kind === 'danger') {
    return {
      ...base,
      background: '#991b1b',
      color: '#fff',
      borderColor: '#991b1b',
    };
  }

  if (kind === 'success') {
    return {
      ...base,
      background: '#065f46',
      color: '#fff',
      borderColor: '#065f46',
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

function sectionTitleStyle() {
  return {
    margin: '0 0 10px 0',
    fontSize: 20,
  };
}

function badgeStyle(background, color = '#111827') {
  return {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: 999,
    background,
    color,
    fontSize: 12,
    fontWeight: 700,
  };
}

export default function App() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sons_shop_settings_phase3');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('sons_phase3_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('sons_phase3_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('sons_phase3_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    const saved = localStorage.getItem('sons_phase3_selected_order');
    return saved ? Number(saved) : initialOrders[0]?.id ?? null;
  });

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [vehicleForm, setVehicleForm] = useState({
    customerId: '',
    year: '',
    make: '',
    model: '',
    vin: '',
    mileage: '',
    plate: '',
  });

  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  const [roForm, setRoForm] = useState({
    customerId: '',
    vehicleId: '',
    complaint: '',
    advisor: defaultSettings.advisors[0] || 'Johnny',
    tech: defaultSettings.techs[0] || 'Johnny',
    status: defaultSettings.statuses[0] || 'Waiting for Diagnosis',
    isComeback: false,
    comebackReason: '',
    comebackOriginalRo: '',
  });

  const [laborForm, setLaborForm] = useState({
    description: '',
    hours: '',
    rate: defaultSettings.laborRate,
  });

  const [partForm, setPartForm] = useState({
    description: '',
    qty: 1,
    price: '',
    vendor: defaultSettings.vendors[0] || 'AutoZone',
  });

  const [declinedForm, setDeclinedForm] = useState({
    description: '',
    estimatedAmount: '',
  });

  useEffect(() => {
    localStorage.setItem('sons_shop_settings_phase3', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sons_phase3_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('sons_phase3_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('sons_phase3_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (selectedOrderId !== null && selectedOrderId !== undefined) {
      localStorage.setItem('sons_phase3_selected_order', String(selectedOrderId));
    }
  }, [selectedOrderId]);

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
        order.comebackReason,
        customer?.name,
        customer?.phone,
        vehicle?.make,
        vehicle?.model,
        vehicle?.vin,
        vehicle?.plate,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [orders, search, customers, vehicles]);

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ||
    orders.find((o) => o.id === selectedOrderId) ||
    orders[0] ||
    null;

  const dashboard = useMemo(() => {
    const openCount = orders.filter((o) => o.status !== 'Closed').length;
    const waitingApproval = orders.filter((o) => o.status === 'Waiting for Approval').length;
    const readyPickup = orders.filter((o) => o.status === 'Ready For Pickup').length;
    const comebackCount = orders.filter((o) => o.isComeback).length;
    const totalSales = orders.reduce((sum, order) => sum + calcTotal(order), 0);

    return { openCount, waitingApproval, readyPickup, comebackCount, totalSales };
  }, [orders, settings]);

  const customerVehicles = useMemo(() => {
    if (!roForm.customerId) return [];
    return vehicles.filter((v) => v.customerId === Number(roForm.customerId));
  }, [roForm.customerId, vehicles]);

  const productivityRows = useMemo(() => {
    return settings.techs.map((tech) => {
      const techOrders = orders.filter((order) => order.tech === tech);
      const roCount = techOrders.length;
      const flaggedHours = techOrders.reduce(
        (sum, order) =>
          sum + order.labor.reduce((laborSum, line) => laborSum + Number(line.hours || 0), 0),
        0
      );
      const sales = techOrders.reduce((sum, order) => sum + calcTotal(order), 0);
      const comebackCount = techOrders.filter((order) => order.isComeback).length;

      return {
        tech,
        roCount,
        flaggedHours,
        sales,
        comebackCount,
      };
    });
  }, [orders, settings]);

  const allDeclinedWork = useMemo(() => {
    return orders.flatMap((order) =>
      (order.declinedWork || []).map((item) => ({
        ...item,
        ro: order.ro,
        customerName: getCustomer(order.customerId)?.name || '',
        vehicleLabel: (() => {
          const v = getVehicle(order.vehicleId);
          return v ? `${v.year} ${v.make} ${v.model}` : '';
        })(),
      }))
    );
  }, [orders, customers, vehicles]);

  function createCustomer() {
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      alert('Customer name and phone are required.');
      return;
    }

    const newCustomer = {
      id: Date.now(),
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      email: customerForm.email.trim(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setCustomerForm({ name: '', phone: '', email: '' });
    setVehicleForm((prev) => ({ ...prev, customerId: String(newCustomer.id) }));
    setRoForm((prev) => ({ ...prev, customerId: String(newCustomer.id), vehicleId: '' }));
    setActiveTab('customers');
  }

  function startEditCustomer(customer) {
    setEditingCustomerId(customer.id);
    setCustomerForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
    });
  }

  function saveCustomerEdit() {
    if (!editingCustomerId) return;
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      alert('Customer name and phone are required.');
      return;
    }

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === editingCustomerId
          ? {
              ...customer,
              name: customerForm.name.trim(),
              phone: customerForm.phone.trim(),
              email: customerForm.email.trim(),
            }
          : customer
      )
    );

    setEditingCustomerId(null);
    setCustomerForm({ name: '', phone: '', email: '' });
  }

  function cancelCustomerEdit() {
    setEditingCustomerId(null);
    setCustomerForm({ name: '', phone: '', email: '' });
  }

  function createVehicle() {
    if (!vehicleForm.customerId || !vehicleForm.make.trim() || !vehicleForm.model.trim()) {
      alert('Customer, make, and model are required.');
      return;
    }

    const newVehicle = {
      id: Date.now(),
      customerId: Number(vehicleForm.customerId),
      year: Number(vehicleForm.year || 0),
      make: vehicleForm.make.trim(),
      model: vehicleForm.model.trim(),
      vin: vehicleForm.vin.trim(),
      mileage: Number(vehicleForm.mileage || 0),
      plate: vehicleForm.plate.trim(),
    };

    setVehicles((prev) => [newVehicle, ...prev]);
    setVehicleForm({
      customerId: vehicleForm.customerId,
      year: '',
      make: '',
      model: '',
      vin: '',
      mileage: '',
      plate: '',
    });
    setRoForm((prev) => ({
      ...prev,
      customerId: String(newVehicle.customerId),
      vehicleId: String(newVehicle.id),
    }));
    setActiveTab('customers');
  }

  function startEditVehicle(vehicle) {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      customerId: String(vehicle.customerId),
      year: String(vehicle.year || ''),
      make: vehicle.make || '',
      model: vehicle.model || '',
      vin: vehicle.vin || '',
      mileage: String(vehicle.mileage || ''),
      plate: vehicle.plate || '',
    });
  }

  function saveVehicleEdit() {
    if (!editingVehicleId) return;
    if (!vehicleForm.customerId || !vehicleForm.make.trim() || !vehicleForm.model.trim()) {
      alert('Customer, make, and model are required.');
      return;
    }

    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === editingVehicleId
          ? {
              ...vehicle,
              customerId: Number(vehicleForm.customerId),
              year: Number(vehicleForm.year || 0),
              make: vehicleForm.make.trim(),
              model: vehicleForm.model.trim(),
              vin: vehicleForm.vin.trim(),
              mileage: Number(vehicleForm.mileage || 0),
              plate: vehicleForm.plate.trim(),
            }
          : vehicle
      )
    );

    setEditingVehicleId(null);
    setVehicleForm({
      customerId: '',
      year: '',
      make: '',
      model: '',
      vin: '',
      mileage: '',
      plate: '',
    });
  }

  function cancelVehicleEdit() {
    setEditingVehicleId(null);
    setVehicleForm({
      customerId: '',
      year: '',
      make: '',
      model: '',
      vin: '',
      mileage: '',
      plate: '',
    });
  }

  function createRepairOrder() {
    if (!roForm.customerId || !roForm.vehicleId || !roForm.complaint.trim()) {
      alert('Customer, vehicle, and complaint are required.');
      return;
    }

    const roNumber = `RO-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const newOrder = {
      id: Date.now(),
      ro: roNumber,
      customerId: Number(roForm.customerId),
      vehicleId: Number(roForm.vehicleId),
      status: roForm.status,
      advisor: roForm.advisor,
      tech: roForm.tech,
      complaint: roForm.complaint.trim(),
      labor: [],
      parts: [],
      declinedWork: [],
      notes: '',
      invoicePaid: false,
      isComeback: !!roForm.isComeback,
      comebackReason: roForm.comebackReason.trim(),
      comebackOriginalRo: roForm.comebackOriginalRo.trim(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    setRoForm((prev) => ({
      ...prev,
      complaint: '',
      vehicleId: '',
      isComeback: false,
      comebackReason: '',
      comebackOriginalRo: '',
    }));
    setActiveTab('dashboard');
  }

  function addLaborLine() {
    if (!selectedOrder) return;
    if (!laborForm.description.trim() || !laborForm.hours) {
      alert('Labor description and hours are required.');
      return;
    }

    const newLine = {
      id: Date.now(),
      description: laborForm.description.trim(),
      hours: Number(laborForm.hours),
      rate: Number(laborForm.rate || settings.laborRate),
    };

    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id ? { ...order, labor: [...order.labor, newLine] } : order
      )
    );

    setLaborForm({
      description: '',
      hours: '',
      rate: settings.laborRate,
    });
  }

  function addPartLine() {
    if (!selectedOrder) return;
    if (!partForm.description.trim() || !partForm.qty || partForm.price === '') {
      alert('Part description, qty, and price are required.');
      return;
    }

    const newPart = {
      id: Date.now(),
      description: partForm.description.trim(),
      qty: Number(partForm.qty),
      price: Number(partForm.price),
      vendor: partForm.vendor,
    };

    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id ? { ...order, parts: [...order.parts, newPart] } : order
      )
    );

    setPartForm({
      description: '',
      qty: 1,
      price: '',
      vendor: settings.vendors[0] || 'AutoZone',
    });
  }

  function addDeclinedWork() {
    if (!selectedOrder) return;
    if (!declinedForm.description.trim()) {
      alert('Declined work description is required.');
      return;
    }

    const newDeclined = {
      id: Date.now(),
      description: declinedForm.description.trim(),
      estimatedAmount: Number(declinedForm.estimatedAmount || 0),
      date: new Date().toISOString().slice(0, 10),
    };

    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, declinedWork: [...(order.declinedWork || []), newDeclined] }
          : order
      )
    );

    setDeclinedForm({
      description: '',
      estimatedAmount: '',
    });
  }

  function removeLaborLine(lineId) {
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, labor: order.labor.filter((line) => line.id !== lineId) }
          : order
      )
    );
  }

  function removePartLine(lineId) {
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, parts: order.parts.filter((line) => line.id !== lineId) }
          : order
      )
    );
  }

  function removeDeclinedWork(itemId) {
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              declinedWork: (order.declinedWork || []).filter((item) => item.id !== itemId),
            }
          : order
      )
    );
  }

  function updateSelectedOrderField(field, value) {
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((order) => (order.id === selectedOrder.id ? { ...order, [field]: value } : order))
    );
  }

  function markPaid() {
    if (!selectedOrder) return;
    updateSelectedOrderField('invoicePaid', true);
    updateSelectedOrderField('status', 'Closed');
  }

  function resetDemoData() {
    if (!window.confirm('Reset all local data back to the demo version?')) return;

    localStorage.removeItem('sons_shop_settings_phase3');
    localStorage.removeItem('sons_phase3_customers');
    localStorage.removeItem('sons_phase3_vehicles');
    localStorage.removeItem('sons_phase3_orders');
    localStorage.removeItem('sons_phase3_selected_order');
    window.location.reload();
  }

  function tabButtonStyle(tabName) {
    const active = activeTab === tabName;
    return {
      ...buttonStyle(active ? 'primary' : 'secondary'),
      width: '100%',
    };
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        background: '#f3f5f8',
        minHeight: '100vh',
        color: '#111827',
      }}
    >
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: 24 }}>
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
            Phase 3: editing, declined work, comeback tracking, and tech productivity.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
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
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 700 }}>Comebacks</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>
              {dashboard.comebackCount}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 700 }}>Visible Ticket Sales</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>
              {money(dashboard.totalSales)}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
          <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
            <button style={tabButtonStyle('dashboard')} onClick={() => setActiveTab('dashboard')}>
              Dashboard
            </button>
            <button style={tabButtonStyle('customers')} onClick={() => setActiveTab('customers')}>
              Customers & Vehicles
            </button>
            <button style={tabButtonStyle('newro')} onClick={() => setActiveTab('newro')}>
              New Repair Order
            </button>
            <button style={tabButtonStyle('productivity')} onClick={() => setActiveTab('productivity')}>
              Tech Productivity
            </button>
            <button style={tabButtonStyle('declined')} onClick={() => setActiveTab('declined')}>
              Declined Work
            </button>
            <button style={tabButtonStyle('settings')} onClick={() => setActiveTab('settings')}>
              Settings
            </button>
            <button style={buttonStyle('danger')} onClick={resetDemoData}>
              Reset Demo Data
            </button>
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            {activeTab === 'dashboard' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(320px, 420px) 1fr',
                  gap: 20,
                  alignItems: 'start',
                }}
              >
                <div style={{ display: 'grid', gap: 20 }}>
                  <div style={cardStyle()}>
                    <h2 style={sectionTitleStyle()}>Repair Orders</h2>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                      Search by RO, customer, vehicle, plate, complaint, or comeback notes.
                    </div>

                    <input
                      style={inputStyle()}
                      placeholder="Search repair orders..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <div style={{ marginTop: 14, display: 'grid', gap: 10, maxHeight: 760, overflow: 'auto' }}>
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

                            {order.isComeback && (
                              <div style={{ marginTop: 8 }}>
                                <span
                                  style={
                                    active
                                      ? badgeStyle('#7f1d1d', '#fff')
                                      : badgeStyle('#fee2e2', '#991b1b')
                                  }
                                >
                                  Comeback
                                </span>
                              </div>
                            )}
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

                      {selectedOrder?.isComeback && (
                        <span style={badgeStyle('#fee2e2', '#991b1b')}>Comeback RO</span>
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
                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>Complaint</div>
                            <textarea
                              style={{ ...inputStyle(), marginTop: 8, minHeight: 90 }}
                              value={selectedOrder.complaint}
                              onChange={(e) => updateSelectedOrderField('complaint', e.target.value)}
                            />
                          </div>

                          <div style={{ ...cardStyle(), padding: 14 }}>
                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>Status</div>
                            <select
                              style={{ ...inputStyle(), marginTop: 8 }}
                              value={selectedOrder.status}
                              onChange={(e) => updateSelectedOrderField('status', e.target.value)}
                            >
                              {settings.statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{ ...cardStyle(), padding: 14 }}>
                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>Advisor</div>
                            <select
                              style={{ ...inputStyle(), marginTop: 8 }}
                              value={selectedOrder.advisor}
                              onChange={(e) => updateSelectedOrderField('advisor', e.target.value)}
                            >
                              {settings.advisors.map((advisor) => (
                                <option key={advisor} value={advisor}>
                                  {advisor}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{ ...cardStyle(), padding: 14 }}>
                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>Tech</div>
                            <select
                              style={{ ...inputStyle(), marginTop: 8 }}
                              value={selectedOrder.tech}
                              onChange={(e) => updateSelectedOrderField('tech', e.target.value)}
                            >
                              {settings.techs.map((tech) => (
                                <option key={tech} value={tech}>
                                  {tech}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ ...cardStyle(), marginBottom: 18 }}>
                          <h3 style={{ marginTop: 0 }}>Comeback Tracking</h3>
                          <div style={{ display: 'grid', gap: 12 }}>
                            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}>
                              <input
                                type="checkbox"
                                checked={!!selectedOrder.isComeback}
                                onChange={(e) => updateSelectedOrderField('isComeback', e.target.checked)}
                              />
                              Mark this repair order as a comeback
                            </label>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div>
                                <label style={labelStyle()}>Original RO</label>
                                <input
                                  style={inputStyle()}
                                  value={selectedOrder.comebackOriginalRo || ''}
                                  onChange={(e) =>
                                    updateSelectedOrderField('comebackOriginalRo', e.target.value)
                                  }
                                  placeholder="Example: RO-2388"
                                />
                              </div>

                              <div>
                                <label style={labelStyle()}>Comeback Reason</label>
                                <input
                                  style={inputStyle()}
                                  value={selectedOrder.comebackReason || ''}
                                  onChange={(e) =>
                                    updateSelectedOrderField('comebackReason', e.target.value)
                                  }
                                  placeholder="Why did it return?"
                                />
                              </div>
                            </div>
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
                                    <th style={{ padding: '10px 8px' }}> </th>
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
                                      <td style={{ padding: '10px 8px' }}>
                                        <button
                                          style={buttonStyle('secondary')}
                                          onClick={() => removeLaborLine(line.id)}
                                        >
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div style={{ ...cardStyle(), marginTop: 12 }}>
                              <h4 style={{ marginTop: 0 }}>Add Labor Line</h4>
                              <div style={{ display: 'grid', gap: 10 }}>
                                <div>
                                  <label style={labelStyle()}>Description</label>
                                  <input
                                    style={inputStyle()}
                                    value={laborForm.description}
                                    onChange={(e) =>
                                      setLaborForm((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                  />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                  <div>
                                    <label style={labelStyle()}>Hours</label>
                                    <input
                                      style={inputStyle()}
                                      type="number"
                                      step="0.1"
                                      value={laborForm.hours}
                                      onChange={(e) =>
                                        setLaborForm((prev) => ({ ...prev, hours: e.target.value }))
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label style={labelStyle()}>Rate</label>
                                    <input
                                      style={inputStyle()}
                                      type="number"
                                      value={laborForm.rate}
                                      onChange={(e) =>
                                        setLaborForm((prev) => ({ ...prev, rate: e.target.value }))
                                      }
                                    />
                                  </div>
                                </div>
                                <button style={buttonStyle('primary')} onClick={addLaborLine}>
                                  Add Labor
                                </button>
                              </div>
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
                                    <th style={{ padding: '10px 8px' }}> </th>
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
                                      <td style={{ padding: '10px 8px' }}>
                                        <button
                                          style={buttonStyle('secondary')}
                                          onClick={() => removePartLine(line.id)}
                                        >
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div style={{ ...cardStyle(), marginTop: 12 }}>
                              <h4 style={{ marginTop: 0 }}>Add Part Line</h4>
                              <div style={{ display: 'grid', gap: 10 }}>
                                <div>
                                  <label style={labelStyle()}>Description</label>
                                  <input
                                    style={inputStyle()}
                                    value={partForm.description}
                                    onChange={(e) =>
                                      setPartForm((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                  />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                  <div>
                                    <label style={labelStyle()}>Qty</label>
                                    <input
                                      style={inputStyle()}
                                      type="number"
                                      value={partForm.qty}
                                      onChange={(e) =>
                                        setPartForm((prev) => ({ ...prev, qty: e.target.value }))
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label style={labelStyle()}>Price</label>
                                    <input
                                      style={inputStyle()}
                                      type="number"
                                      step="0.01"
                                      value={partForm.price}
                                      onChange={(e) =>
                                        setPartForm((prev) => ({ ...prev, price: e.target.value }))
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label style={labelStyle()}>Vendor</label>
                                    <select
                                      style={inputStyle()}
                                      value={partForm.vendor}
                                      onChange={(e) =>
                                        setPartForm((prev) => ({ ...prev, vendor: e.target.value }))
                                      }
                                    >
                                      {settings.vendors.map((vendor) => (
                                        <option key={vendor} value={vendor}>
                                          {vendor}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <button style={buttonStyle('primary')} onClick={addPartLine}>
                                  Add Part
                                </button>
                              </div>
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
                          <div style={{ display: 'grid', gap: 20 }}>
                            <div style={{ ...cardStyle(), padding: 14 }}>
                              <h3 style={{ marginTop: 0 }}>Notes</h3>
                              <textarea
                                style={{ ...inputStyle(), minHeight: 120, resize: 'vertical' }}
                                value={selectedOrder.notes || ''}
                                onChange={(e) => updateSelectedOrderField('notes', e.target.value)}
                              />
                            </div>

                            <div style={{ ...cardStyle(), padding: 14 }}>
                              <h3 style={{ marginTop: 0 }}>Declined Work</h3>
                              <div style={{ display: 'grid', gap: 10 }}>
                                {(selectedOrder.declinedWork || []).map((item) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      border: '1px solid #e5e7eb',
                                      borderRadius: 10,
                                      padding: 12,
                                      background: '#f8fafc',
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                      <strong>{item.description}</strong>
                                      <button
                                        style={buttonStyle('secondary')}
                                        onClick={() => removeDeclinedWork(item.id)}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    <div style={{ color: '#6b7280', marginTop: 6, fontSize: 14 }}>
                                      {item.date} • {money(item.estimatedAmount)}
                                    </div>
                                  </div>
                                ))}

                                <div style={{ marginTop: 6 }}>
                                  <label style={labelStyle()}>Declined Work Description</label>
                                  <input
                                    style={inputStyle()}
                                    value={declinedForm.description}
                                    onChange={(e) =>
                                      setDeclinedForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                      }))
                                    }
                                  />
                                </div>

                                <div>
                                  <label style={labelStyle()}>Estimated Amount</label>
                                  <input
                                    style={inputStyle()}
                                    type="number"
                                    step="0.01"
                                    value={declinedForm.estimatedAmount}
                                    onChange={(e) =>
                                      setDeclinedForm((prev) => ({
                                        ...prev,
                                        estimatedAmount: e.target.value,
                                      }))
                                    }
                                  />
                                </div>

                                <button style={buttonStyle('primary')} onClick={addDeclinedWork}>
                                  Add Declined Work
                                </button>
                              </div>
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
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Paid</span>
                                <strong>{selectedOrder.invoicePaid ? 'Yes' : 'No'}</strong>
                              </div>
                            </div>

                            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                              <button style={buttonStyle('primary')} onClick={() => window.print()}>
                                Print Invoice
                              </button>
                              <button style={buttonStyle('success')} onClick={markPaid}>
                                Mark Paid
                              </button>
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
            )}

            {activeTab === 'customers' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'grid', gap: 20 }}>
                  <div style={cardStyle()}>
                    <h2 style={sectionTitleStyle()}>
                      {editingCustomerId ? 'Edit Customer' : 'Add Customer'}
                    </h2>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div>
                        <label style={labelStyle()}>Name</label>
                        <input
                          style={inputStyle()}
                          value={customerForm.name}
                          onChange={(e) =>
                            setCustomerForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label style={labelStyle()}>Phone</label>
                        <input
                          style={inputStyle()}
                          value={customerForm.phone}
                          onChange={(e) =>
                            setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label style={labelStyle()}>Email</label>
                        <input
                          style={inputStyle()}
                          value={customerForm.email}
                          onChange={(e) =>
                            setCustomerForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        {editingCustomerId ? (
                          <>
                            <button style={buttonStyle('primary')} onClick={saveCustomerEdit}>
                              Save Customer
                            </button>
                            <button style={buttonStyle('secondary')} onClick={cancelCustomerEdit}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button style={buttonStyle('primary')} onClick={createCustomer}>
                            Save Customer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={cardStyle()}>
                    <h2 style={sectionTitleStyle()}>
                      {editingVehicleId ? 'Edit Vehicle' : 'Add Vehicle'}
                    </h2>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div>
                        <label style={labelStyle()}>Customer</label>
                        <select
                          style={inputStyle()}
                          value={vehicleForm.customerId}
                          onChange={(e) =>
                            setVehicleForm((prev) => ({ ...prev, customerId: e.target.value }))
                          }
                        >
                          <option value="">Select customer</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={labelStyle()}>Year</label>
                          <input
                            style={inputStyle()}
                            value={vehicleForm.year}
                            onChange={(e) =>
                              setVehicleForm((prev) => ({ ...prev, year: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <label style={labelStyle()}>Make</label>
                          <input
                            style={inputStyle()}
                            value={vehicleForm.make}
                            onChange={(e) =>
                              setVehicleForm((prev) => ({ ...prev, make: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <label style={labelStyle()}>Model</label>
                          <input
                            style={inputStyle()}
                            value={vehicleForm.model}
                            onChange={(e) =>
                              setVehicleForm((prev) => ({ ...prev, model: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle()}>VIN</label>
                        <input
                          style={inputStyle()}
                          value={vehicleForm.vin}
                          onChange={(e) =>
                            setVehicleForm((prev) => ({ ...prev, vin: e.target.value }))
                          }
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={labelStyle()}>Mileage</label>
                          <input
                            style={inputStyle()}
                            value={vehicleForm.mileage}
                            onChange={(e) =>
                              setVehicleForm((prev) => ({ ...prev, mileage: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <label style={labelStyle()}>Plate</label>
                          <input
                            style={inputStyle()}
                            value={vehicleForm.plate}
                            onChange={(e) =>
                              setVehicleForm((prev) => ({ ...prev, plate: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        {editingVehicleId ? (
                          <>
                            <button style={buttonStyle('primary')} onClick={saveVehicleEdit}>
                              Save Vehicle
                            </button>
                            <button style={buttonStyle('secondary')} onClick={cancelVehicleEdit}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button style={buttonStyle('primary')} onClick={createVehicle}>
                            Save Vehicle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={cardStyle()}>
                  <h2 style={sectionTitleStyle()}>Customer & Vehicle List</h2>
                  <div style={{ display: 'grid', gap: 12, maxHeight: 900, overflow: 'auto' }}>
                    {customers.map((customer) => {
                      const linkedVehicles = vehicles.filter((vehicle) => vehicle.customerId === customer.id);
                      return (
                        <div
                          key={customer.id}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: 12,
                            padding: 14,
                            background: '#fff',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 12,
                              alignItems: 'start',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800 }}>{customer.name}</div>
                              <div style={{ marginTop: 4, color: '#6b7280', fontSize: 14 }}>
                                {customer.phone} {customer.email ? `• ${customer.email}` : ''}
                              </div>
                            </div>
                            <button
                              style={buttonStyle('secondary')}
                              onClick={() => startEditCustomer(customer)}
                            >
                              Edit Customer
                            </button>
                          </div>

                          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                            {linkedVehicles.length ? (
                              linkedVehicles.map((vehicle) => (
                                <div
                                  key={vehicle.id}
                                  style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 10,
                                    padding: 10,
                                    fontSize: 14,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      gap: 12,
                                      alignItems: 'start',
                                    }}
                                  >
                                    <strong>
                                      {vehicle.year} {vehicle.make} {vehicle.model}
                                    </strong>
                                    <button
                                      style={buttonStyle('secondary')}
                                      onClick={() => startEditVehicle(vehicle)}
                                    >
                                      Edit Vehicle
                                    </button>
                                  </div>
                                  <div style={{ color: '#6b7280', marginTop: 4 }}>
                                    VIN: {vehicle.vin || '—'} • Plate: {vehicle.plate || '—'} • Mileage:{' '}
                                    {vehicle.mileage || 0}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div style={{ color: '#6b7280', fontSize: 14 }}>No vehicles yet.</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'newro' && (
              <div style={{ ...cardStyle(), maxWidth: 950 }}>
                <h2 style={sectionTitleStyle()}>Create Repair Order</h2>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle()}>Customer</label>
                      <select
                        style={inputStyle()}
                        value={roForm.customerId}
                        onChange={(e) =>
                          setRoForm((prev) => ({
                            ...prev,
                            customerId: e.target.value,
                            vehicleId: '',
                          }))
                        }
                      >
                        <option value="">Select customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle()}>Vehicle</label>
                      <select
                        style={inputStyle()}
                        value={roForm.vehicleId}
                        onChange={(e) => setRoForm((prev) => ({ ...prev, vehicleId: e.target.value }))}
                      >
                        <option value="">Select vehicle</option>
                        {customerVehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle()}>Complaint</label>
                    <textarea
                      style={{ ...inputStyle(), minHeight: 120, resize: 'vertical' }}
                      value={roForm.complaint}
                      onChange={(e) => setRoForm((prev) => ({ ...prev, complaint: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle()}>Advisor</label>
                      <select
                        style={inputStyle()}
                        value={roForm.advisor}
                        onChange={(e) => setRoForm((prev) => ({ ...prev, advisor: e.target.value }))}
                      >
                        {settings.advisors.map((advisor) => (
                          <option key={advisor} value={advisor}>
                            {advisor}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle()}>Tech</label>
                      <select
                        style={inputStyle()}
                        value={roForm.tech}
                        onChange={(e) => setRoForm((prev) => ({ ...prev, tech: e.target.value }))}
                      >
                        {settings.techs.map((tech) => (
                          <option key={tech} value={tech}>
                            {tech}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle()}>Status</label>
                      <select
                        style={inputStyle()}
                        value={roForm.status}
                        onChange={(e) => setRoForm((prev) => ({ ...prev, status: e.target.value }))}
                      >
                        {settings.statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ ...cardStyle(), background: '#f8fafc' }}>
                    <h3 style={{ marginTop: 0 }}>Comeback Setup</h3>
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={roForm.isComeback}
                        onChange={(e) => setRoForm((prev) => ({ ...prev, isComeback: e.target.checked }))}
                      />
                      This repair order is a comeback
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                      <div>
                        <label style={labelStyle()}>Original RO</label>
                        <input
                          style={inputStyle()}
                          value={roForm.comebackOriginalRo}
                          onChange={(e) =>
                            setRoForm((prev) => ({ ...prev, comebackOriginalRo: e.target.value }))
                          }
                          placeholder="Example: RO-2388"
                        />
                      </div>

                      <div>
                        <label style={labelStyle()}>Comeback Reason</label>
                        <input
                          style={inputStyle()}
                          value={roForm.comebackReason}
                          onChange={(e) =>
                            setRoForm((prev) => ({ ...prev, comebackReason: e.target.value }))
                          }
                          placeholder="Reason for return"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button style={buttonStyle('primary')} onClick={createRepairOrder}>
                      Create Repair Order
                    </button>
                    <button
                      style={buttonStyle('secondary')}
                      onClick={() =>
                        setRoForm({
                          customerId: '',
                          vehicleId: '',
                          complaint: '',
                          advisor: settings.advisors[0] || 'Johnny',
                          tech: settings.techs[0] || 'Johnny',
                          status: settings.statuses[0] || 'Waiting for Diagnosis',
                          isComeback: false,
                          comebackReason: '',
                          comebackOriginalRo: '',
                        })
                      }
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'productivity' && (
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={cardStyle()}>
                  <h2 style={sectionTitleStyle()}>Technician Productivity</h2>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                    Flag-hour view based on the current local repair order data.
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '10px 8px' }}>Tech</th>
                          <th style={{ padding: '10px 8px' }}>ROs</th>
                          <th style={{ padding: '10px 8px' }}>Flagged Hours</th>
                          <th style={{ padding: '10px 8px' }}>Sales</th>
                          <th style={{ padding: '10px 8px' }}>Comebacks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productivityRows.map((row) => (
                          <tr key={row.tech} style={{ borderBottom: '1px solid #eef2f7' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 700 }}>{row.tech}</td>
                            <td style={{ padding: '10px 8px' }}>{row.roCount}</td>
                            <td style={{ padding: '10px 8px' }}>{row.flaggedHours.toFixed(1)}</td>
                            <td style={{ padding: '10px 8px' }}>{money(row.sales)}</td>
                            <td style={{ padding: '10px 8px' }}>{row.comebackCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'declined' && (
              <div style={{ ...cardStyle() }}>
                <h2 style={sectionTitleStyle()}>Declined Work History</h2>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                  All declined recommendations currently stored in the app.
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {allDeclinedWork.length ? (
                    allDeclinedWork.map((item) => (
                      <div
                        key={`${item.ro}-${item.id}`}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: 12,
                          padding: 14,
                          background: '#fff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <strong>{item.description}</strong>
                          <span style={badgeStyle('#fef3c7', '#92400e')}>{item.ro}</span>
                        </div>
                        <div style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>
                          {item.customerName} • {item.vehicleLabel} • {item.date} • {money(item.estimatedAmount)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#6b7280' }}>No declined work saved yet.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ ...cardStyle(), maxWidth: 950 }}>
                <h2 style={sectionTitleStyle()}>Settings</h2>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label style={labelStyle()}>Shop Name</label>
                    <input
                      style={inputStyle()}
                      value={settings.shopName}
                      onChange={(e) => setSettings((prev) => ({ ...prev, shopName: e.target.value }))}
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
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

                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    Vendors: {settings.vendors.join(', ')}
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    Techs: {settings.techs.join(', ')}
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    Statuses: {settings.statuses.join(' • ')}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      padding: 14,
                      borderRadius: 12,
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1e3a8a',
                      fontSize: 14,
                    }}
                  >
                    Next step is moving this local data into Supabase so your shop data is saved online
                    instead of only in this browser.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}