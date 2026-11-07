import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { selectUser, selectToken, logout } from '../../store/authSlice';
import ProductModal from './ProductModal';
import OrderDetailModal from './OrderDetailModal';
import RangoliColorModal from './RangoliColorModal';
import {
  BarChart3,
  Package,
  Boxes,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Store,
  ArrowUpRight,
  Palette
} from 'lucide-react';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // State: Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // State: Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFulfillmentFilter, setOrderFulfillmentFilter] = useState('All');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State: Products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStockFilter, setProductStockFilter] = useState('All');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [stockUpdatingId, setStockUpdatingId] = useState(null);

  // State: Rangoli Colors & Packet Sizes
  const [catalogSection, setCatalogSection] = useState('rangoli'); // 'rangoli', 'sanskar', 'general'
  const [rangoliColors, setRangoliColors] = useState([]);
  const [sanskarColors, setSanskarColors] = useState([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [colorToEdit, setColorToEdit] = useState(null);
  const [colorSearch, setColorSearch] = useState('');

  // State: Users
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);

  // Refresh Trigger
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const queryParams = new URLSearchParams();
      if (orderFulfillmentFilter !== 'All') queryParams.append('fulfillmentStatus', orderFulfillmentFilter);
      if (orderPaymentFilter !== 'All') queryParams.append('paymentStatus', orderPaymentFilter);
      if (orderSearch.trim()) queryParams.append('search', orderSearch.trim());
      queryParams.append('limit', '100');

      const res = await fetch(`/api/orders?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [token, orderFulfillmentFilter, orderPaymentFilter, orderSearch]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const queryParams = new URLSearchParams();
      if (productCategoryFilter !== 'All') queryParams.append('mainCategory', productCategoryFilter);
      if (productSearch.trim()) queryParams.append('search', productSearch.trim());
      queryParams.append('limit', '100');

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        let items = data.data || [];
        if (productStockFilter === 'low') {
          items = items.filter(p => p.stockQuantity <= 20 && p.stockQuantity > 0);
        } else if (productStockFilter === 'out') {
          items = items.filter(p => p.stockQuantity <= 0);
        } else if (productStockFilter === 'instock') {
          items = items.filter(p => p.stockQuantity > 20);
        }
        setProducts(items);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [productCategoryFilter, productSearch, productStockFilter]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const queryParams = new URLSearchParams();
      if (userRoleFilter !== 'All') queryParams.append('role', userRoleFilter);
      if (userSearch.trim()) queryParams.append('search', userSearch.trim());
      queryParams.append('limit', '100');

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [token, userRoleFilter, userSearch]);

  // Fetch Colors & Packet Sizes
  const fetchColors = useCallback(async () => {
    try {
      setLoadingColors(true);
      const res = await fetch('/api/colors');
      const data = await res.json();
      if (data.success && data.data) {
        setRangoliColors(data.data.rangoli || []);
        setSanskarColors(data.data.sanskarBharati || []);
      }
    } catch (err) {
      console.error('Error fetching color shades:', err);
    } finally {
      setLoadingColors(false);
    }
  }, []);

  // Master Refresh
  const handleMasterRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchOrders(), fetchProducts(), fetchUsers(), fetchColors()]);
    setRefreshing(false);
    showToast('Dashboard data refreshed.');
  };

  useEffect(() => {
    fetchStats();
    fetchColors();
  }, [fetchStats, fetchColors]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'products') {
      fetchProducts();
      fetchColors();
    }
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchOrders, fetchProducts, fetchUsers, fetchColors]);

  // Adjust Product Stock atomically (+ or -)
  const handleAdjustStock = async (productId, delta) => {
    try {
      setStockUpdatingId(productId);
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: delta })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Stock updated: ${delta > 0 ? '+' : ''}${delta}`);
        setProducts(prev =>
          prev.map(p => (p._id === productId ? { ...p, stockQuantity: p.stockQuantity + delta } : p))
        );
        fetchStats();
      } else {
        alert(data.message || 'Failed to update stock');
      }
    } catch (err) {
      alert(err.message || 'Error updating stock');
    } finally {
      setStockUpdatingId(null);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Product "${product.name}" deleted.`);
        fetchProducts();
        fetchStats();
      } else {
        alert(data.message || 'Could not delete product');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Change User Role
  const handleUpdateRole = async (userId, newRole) => {
    try {
      setRoleUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Role updated to ${newRole}`);
        setUsersList(prev =>
          prev.map(u => (u._id === userId ? { ...u, role: newRole } : u))
        );
        fetchStats();
      } else {
        alert(data.message || 'Failed to update role');
      }
    } catch (err) {
      alert(err.message || 'Error updating user role');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const getFulfillmentBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Ready-for-Pickup':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Processing':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
  };

  const getPaymentBadgeClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Failed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 text-xs font-bold shadow-2xl animate-fade-in border border-slate-700 dark:border-slate-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation Bar */}
      <header className="sticky top-16 z-40 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-outfit">
                  New Rang Rangoli Admin Panel
                </h1>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                  Control Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as <strong className="text-slate-700 dark:text-slate-300">{user?.name}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleMasterRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-orange-500' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/shop"
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors"
              title="View Live Storefront"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Storefront</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
          >
            <Package className="h-4 w-4" />
            <span>Orders Management</span>
            {stats?.summary?.totalOrders > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'orders' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                {stats.summary.totalOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'products' ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
          >
            <Boxes className="h-4 w-4" />
            <span>Products & Inventory</span>
            {stats?.summary?.totalProducts > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'products' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                {stats.summary.totalProducts}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'users' ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
          >
            <Users className="h-4 w-4" />
            <span>Users & Retailers</span>
            {stats?.summary?.totalUsers > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'users' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                {stats.summary.totalUsers}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in text-left">
            
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Revenue */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl group-hover:scale-125 transition-transform" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-outfit">
                  ₹{stats?.summary?.grossSales != null ? stats.summary.grossSales.toLocaleString('en-IN') : '...'}
                </div>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span>₹{stats?.summary?.totalRevenue?.toLocaleString('en-IN') || 0} Confirmed Paid</span>
                </p>
              </div>

              {/* Total Orders */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-orange-500/10 blur-xl group-hover:scale-125 transition-transform" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-outfit">
                  {stats?.summary?.totalOrders != null ? stats.summary.totalOrders : '...'}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stats?.fulfillmentMap?.Processing || 0} currently processing
                </p>
              </div>

              {/* Products in Catalog */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-rose-500/10 blur-xl group-hover:scale-125 transition-transform" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalog Items</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Boxes className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-outfit">
                  {stats?.summary?.totalProducts != null ? stats.summary.totalProducts : '...'}
                </div>
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  {stats?.summary?.lowStockCount || 0} low stock items
                </p>
              </div>

              {/* Users & Wholesale Partners */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl group-hover:scale-125 transition-transform" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Accounts</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-outfit">
                  {stats?.summary?.totalUsers != null ? stats.summary.totalUsers : '...'}
                </div>
                <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {stats?.summary?.retailersCount || 0} Wholesale B2B Retailers
                </p>
              </div>
            </div>

            {/* Quick Actions & Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Fulfillment Status Widget */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Order Fulfillment Status
                    </h3>
                    <p className="text-xs text-slate-500">Live operational status distribution</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                  >
                    <span>View all orders</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Processing</span>
                    <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">
                      {stats?.fulfillmentMap?.Processing || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Shipped</span>
                    <p className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">
                      {stats?.fulfillmentMap?.Shipped || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Delivered</span>
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
                      {stats?.fulfillmentMap?.Delivered || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 p-4">
                    <span className="text-xs font-bold text-purple-800 dark:text-purple-300">Ready Pickup</span>
                    <p className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">
                      {stats?.fulfillmentMap?.['Ready-for-Pickup'] || 0}
                    </p>
                  </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setProductModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Product</span>
                  </button>
                  <button
                    onClick={() => {
                      setOrderFulfillmentFilter('Processing');
                      setActiveTab('orders');
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Process Pending Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <Store className="h-4 w-4 text-indigo-500" />
                    <span>Review B2B Wholesalers</span>
                  </button>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Payment Status
                </h3>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Paid Orders
                    </span>
                    <span className="text-base font-black text-emerald-900 dark:text-emerald-200">
                      {stats?.paymentMap?.Paid || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Pending / COD
                    </span>
                    <span className="text-base font-black text-amber-900 dark:text-amber-200">
                      {stats?.paymentMap?.Pending || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      Failed Attempts
                    </span>
                    <span className="text-base font-black text-rose-900 dark:text-rose-200">
                      {stats?.paymentMap?.Failed || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts Section */}
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
              <div className="rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                    <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                      Low Inventory Stock Alerts ({stats.lowStockProducts.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setProductStockFilter('low');
                      setActiveTab('products');
                    }}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    View in Inventory
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.lowStockProducts.map(p => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200'}
                          alt={p.name}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.mainCategory}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${p.stockQuantity <= 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                          {p.stockQuantity} Left
                        </span>
                        <button
                          onClick={() => handleAdjustStock(p._id, 25)}
                          disabled={stockUpdatingId === p._id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold shadow-xs cursor-pointer"
                        >
                          +25
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders Feed */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Recent Customer Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  <span>See full order history</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {stats?.recentOrders?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No orders placed yet. Orders made on the store will display here in real-time.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Items</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {stats?.recentOrders?.map(order => (
                        <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            #{order._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{order.customerName}</p>
                            <p className="text-[10px] text-slate-400">{order.customerEmail}</p>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                            {order.items?.length || 0} items
                          </td>
                          <td className="py-3 px-3 font-black text-slate-900 dark:text-white">
                            ₹{order.totalPrice}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getFulfillmentBadgeClass(order.fulfillmentStatus)}`}>
                              {order.fulfillmentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500 text-orange-600 hover:text-white dark:text-orange-400 font-bold transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in text-left">
            
            {/* Orders Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by customer, email, phone, ID..."
                  className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <select
                  value={orderFulfillmentFilter}
                  onChange={(e) => setOrderFulfillmentFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="All">All Fulfillment</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Ready-for-Pickup">Ready-for-Pickup</option>
                </select>

                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="All">All Payments</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
              {loadingOrders ? (
                <div className="py-20 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                  <p className="mt-2 text-xs text-slate-400">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400">
                  No orders match the selected filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Order ID & Date</th>
                        <th className="py-3 px-4">Customer & Shipping</th>
                        <th className="py-3 px-4">Items Summary</th>
                        <th className="py-3 px-4">Total (₹)</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orders.map(order => (
                        <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              #{order._id.slice(-8).toUpperCase()}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{order.customerName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{order.customerPhone}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">{order.shippingAddress}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {order.items?.length || 0} product(s)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {order.items?.slice(0, 3).map((it, idx) => (
                                <img
                                  key={idx}
                                  src={it.image || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100'}
                                  alt={it.name}
                                  className="h-6 w-6 rounded-md object-cover border border-slate-200 dark:border-slate-700"
                                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100'; }}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-black text-sm text-slate-900 dark:text-white">
                            ₹{order.totalPrice}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPaymentBadgeClass(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              via {order.paymentMethod || 'COD'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getFulfillmentBadgeClass(order.fulfillmentStatus)}`}>
                              {order.fulfillmentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & INVENTORY */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in text-left">
            
            {/* Catalog Section Switcher Sub-Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setCatalogSection('rangoli')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  catalogSection === 'rangoli'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>🌸 23 Rangoli Color Shades & Packet Sizes</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                  {rangoliColors.length || 23}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogSection('sanskar')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  catalogSection === 'sanskar'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>🌀 16 Sanskar Bharati Powders & Sizes</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                  {sanskarColors.length || 16}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogSection('general')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  catalogSection === 'general'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>📦 Tools, Stencils & Kits</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700">
                  {products.length}
                </span>
              </button>
            </div>

            {/* SUB-VIEW 1 & 2: RANGOLI & SANSKAR BHARATI COLORS */}
            {(catalogSection === 'rangoli' || catalogSection === 'sanskar') && (
              <div className="space-y-4">
                {/* Search Bar for Colors */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={colorSearch}
                      onChange={(e) => setColorSearch(e.target.value)}
                      placeholder="Search shade by number, name, category..."
                      className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div className="text-xs font-semibold text-slate-500">
                    Showing {(catalogSection === 'rangoli' ? rangoliColors : sanskarColors).length} color shades • Click "Edit Shade & Sizes" to adjust packet weights and pricing.
                  </div>
                </div>

                {/* Colors & Packet Sizes Table */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                  {loadingColors ? (
                    <div className="py-20 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                      <p className="mt-2 text-xs text-slate-400">Loading color shades and packet sizes...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Swatch & Photo</th>
                            <th className="py-3 px-4">Shade Details</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Configured Packet Sizes & Rates</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(catalogSection === 'rangoli' ? rangoliColors : sanskarColors)
                            .filter(c => {
                              if (!colorSearch.trim()) return true;
                              const q = colorSearch.toLowerCase();
                              return (
                                (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
                                (c.nameMr && c.nameMr.toLowerCase().includes(q)) ||
                                (c.number && c.number.toLowerCase().includes(q)) ||
                                (c.category && c.category.toLowerCase().includes(q))
                              );
                            })
                            .map((c) => {
                              const weightsEntries = c.weights ? Object.entries(c.weights) : [];
                              return (
                                <tr key={c.id || c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                      {/* Color Swatch Circle */}
                                      <div
                                        className="h-8 w-8 shrink-0 rounded-full border-2 border-white dark:border-slate-800 shadow-md"
                                        style={{ backgroundColor: c.hex }}
                                        title={`Hex: ${c.hex}`}
                                      />
                                      {/* Image */}
                                      <img
                                        src={c.image || '/colors/shade-card.jpg'}
                                        alt={c.nameEn}
                                        className="h-10 w-10 shrink-0 rounded-xl object-contain bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                        onError={(e) => { e.target.src = '/colors/shade-card.jpg'; }}
                                      />
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <p className="font-black text-slate-900 dark:text-white">{c.nameEn}</p>
                                    {c.nameMr && (
                                      <p className="text-[10px] text-slate-400 mt-0.5">{c.nameMr}</p>
                                    )}
                                    <span className="font-mono text-[9px] text-slate-400">Hex: {c.hex}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                      {c.category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex flex-wrap gap-1.5">
                                      {weightsEntries.map(([wKey, wVal]) => (
                                        <div
                                          key={wKey}
                                          className="px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-[11px]"
                                        >
                                          <span className="font-black text-orange-900 dark:text-orange-200 mr-1.5">
                                            {wKey}
                                          </span>
                                          <span className="text-slate-700 dark:text-slate-300 font-bold">
                                            ₹{wVal.retailPrice}
                                          </span>
                                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-[10px] ml-1">
                                            (WS: ₹{wVal.wholesalePrice})
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      onClick={() => {
                                        setColorToEdit(c);
                                        setColorModalOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                      <span>Edit Shade & Sizes</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: GENERAL PRODUCTS, STENCILS & TOOLS */}
            {catalogSection === 'general' && (
              <div className="space-y-6">
                {/* Products Action & Filter Row */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search catalog products..."
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                      />
                    </div>

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Categories</option>
                      <option value="Rangoli">Rangoli</option>
                      <option value="Sanskar Bharati Rangoli">Sanskar Bharati Rangoli</option>
                      <option value="Portrait Color">Portrait Color</option>
                      <option value="Fluorescent Color">Fluorescent Color</option>
                      <option value="Tools">Tools</option>
                      <option value="Holi Color">Holi Color</option>
                      <option value="Gulal">Gulal</option>
                    </select>

                    <select
                      value={productStockFilter}
                      onChange={(e) => setProductStockFilter(e.target.value)}
                      className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Stock Levels</option>
                      <option value="low">Low Stock (≤20)</option>
                      <option value="out">Out of Stock (0)</option>
                      <option value="instock">Healthy Stock (&gt;20)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setProductModalOpen(true);
                    }}
                    className="w-full lg:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-orange-600 hover:to-rose-700 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                  {loadingProducts ? (
                    <div className="py-20 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                      <p className="mt-2 text-xs text-slate-400">Loading catalog items...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="py-20 text-center text-xs text-slate-400">
                      No products found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Product Details</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Retail Price</th>
                            <th className="py-3 px-4">Wholesale Rate</th>
                            <th className="py-3 px-4">Stock Level</th>
                            <th className="py-3 px-4 text-center">Quick Adjust</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {products.map(prod => (
                            <tr key={prod._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={prod.imageUrls?.[0] || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200'}
                                    alt={prod.name}
                                    className="h-10 w-10 shrink-0 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200'; }}
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{prod.name}</p>
                                    {prod.nameMR && (
                                      <p className="text-[10px] text-slate-400">{prod.nameMR}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                  {prod.mainCategory}
                                </span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">
                                  {prod.subCategory}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                ₹{prod.price}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{prod.wholesalePrice}</span>
                                <span className="block text-[9px] text-slate-400">MOQ: {prod.minWholesaleQuantity || 20} pcs</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${prod.stockQuantity <= 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : prod.stockQuantity <= 20 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                                  {prod.stockQuantity} in stock
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                                  <button
                                    onClick={() => handleAdjustStock(prod._id, -10)}
                                    disabled={stockUpdatingId === prod._id || prod.stockQuantity <= 0}
                                    className="h-6 w-6 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black hover:bg-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
                                    title="Deduct 10"
                                  >
                                    -
                                  </button>
                                  <span className="text-[11px] font-mono px-1 font-bold">10</span>
                                  <button
                                    onClick={() => handleAdjustStock(prod._id, 10)}
                                    disabled={stockUpdatingId === prod._id}
                                    className="h-6 w-6 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black hover:bg-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
                                    title="Add 10"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setProductToEdit(prod);
                                      setProductModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS & RETAILERS */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in text-left">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, phone, GST..."
                  className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Account Roles</option>
                <option value="customer">Retail Customers</option>
                <option value="retailer">Wholesale Retailers</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
              {loadingUsers ? (
                <div className="py-20 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                  <p className="mt-2 text-xs text-slate-400">Loading accounts directory...</p>
                </div>
              ) : usersList.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400">
                  No accounts found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">User Details</th>
                        <th className="py-3 px-4">Contact Phone</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">B2B Business Details</th>
                        <th className="py-3 px-4">Joined Date</th>
                        <th className="py-3 px-4 text-right">Change Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {usersList.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-rose-600 text-xs font-bold text-white shadow-xs">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                                <p className="text-[10px] text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            {u.phone || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${u.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800' : u.role === 'retailer' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'}`}>
                              {u.role === 'retailer' ? 'Wholesale Retailer' : u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {u.businessName ? (
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{u.businessName}</p>
                                {u.gstin && <p className="font-mono text-[9px] text-slate-400">GST: {u.gstin}</p>}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <select
                              value={u.role}
                              disabled={roleUpdatingId === u._id}
                              onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                            >
                              <option value="customer">Customer</option>
                              <option value="retailer">Retailer (Wholesale)</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={productToEdit}
        token={token}
        onSaved={() => {
          showToast(productToEdit ? 'Product updated successfully' : 'Product created successfully');
          fetchProducts();
          fetchStats();
        }}
      />

      {/* Rangoli Color Shade & Packet Sizes Modal */}
      <RangoliColorModal
        isOpen={colorModalOpen}
        onClose={() => {
          setColorModalOpen(false);
          setColorToEdit(null);
        }}
        colorToEdit={colorToEdit}
        token={token}
        onSaved={(updatedColor) => {
          showToast(`Color shade "${updatedColor.nameEn}" & packet sizes saved!`);
          fetchColors();
        }}
      />

      {/* Order Details & Status Modal */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        token={token}
        onUpdated={(updated) => {
          setSelectedOrder(updated);
          setOrders(prev => prev.map(o => (o._id === updated._id ? updated : o)));
          fetchStats();
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
