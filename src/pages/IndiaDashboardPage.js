// FILE: frontend/src/pages/IndiaDashboardPage.js
// Professional Enterprise Dashboard for India Operations

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import {
    RefreshCw, Package, Truck, Warehouse, Box, Layers, Factory,
    AlertTriangle, TrendingUp, ChevronRight, Clock, ArrowRight,
    CheckCircle, AlertCircle, Activity, BarChart2, PieChart,
    Calendar, Zap, Target, Eye
} from 'lucide-react';

// =============================================
// PROFESSIONAL CHART COMPONENTS
// =============================================

// Area/Line Chart with gradient fill
const AreaChart = ({ data, height = 200, color = '#6366f1', title, subtitle }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-text-secondary dark:text-dark-text-secondary text-sm">
                No data available
            </div>
        );
    }

    const values = data.map(d => d.value || d.boxes || d.count || 0);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values);
    const range = maxVal - minVal || 1;

    const width = 100;
    const chartHeight = 100;
    const padding = 5;

    const points = values.map((val, i) => {
        const x = padding + (i / (values.length - 1 || 1)) * (width - 2 * padding);
        const y = chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${padding},${chartHeight - padding} ${points} ${width - padding},${chartHeight - padding}`;

    return (
        <div className="w-full" style={{ height }}>
            <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                <polygon
                    points={areaPoints}
                    fill={`url(#gradient-${color.replace('#', '')})`}
                />
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {values.map((val, i) => {
                    const x = padding + (i / (values.length - 1 || 1)) * (width - 2 * padding);
                    const y = chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="2"
                            fill={color}
                            className="opacity-0 hover:opacity-100 transition-opacity"
                        />
                    );
                })}
            </svg>
        </div>
    );
};

// Professional Progress Bar
const ProgressBar = ({ value, max, label, color = 'bg-primary', showPercentage = true }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary dark:text-dark-text-secondary">{label}</span>
                <span className="text-sm font-semibold text-text dark:text-dark-text">
                    {value.toLocaleString()}
                    {showPercentage && <span className="text-text-secondary dark:text-dark-text-secondary font-normal ml-1">({percentage.toFixed(0)}%)</span>}
                </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Circular Progress
const CircularProgress = ({ value, max, size = 120, strokeWidth = 10, color = '#6366f1', label }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-100 dark:text-gray-800"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-text dark:text-dark-text">{value}</span>
                </div>
            </div>
            {label && <span className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">{label}</span>}
        </div>
    );
};

// =============================================
// CARD COMPONENTS
// =============================================

// Metric Card with trend
const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary', onClick }) => {
    const colorMap = {
        primary: 'from-primary/10 to-primary/5 border-primary/20',
        blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
        green: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
        purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
        orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
        cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
    };

    const iconColorMap = {
        primary: 'text-primary bg-primary/10',
        blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
        green: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
        purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
        orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
        cyan: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
    };

    return (
        <div 
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-xl border bg-gradient-to-br
                ${colorMap[color]}
                ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}
                transition-all duration-200 p-5
            `}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{title}</p>
                    <p className="text-3xl font-bold text-text dark:text-dark-text tracking-tight">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl ${iconColorMap[color]}`}>
                        <Icon size={22} />
                    </div>
                )}
            </div>
            {trend !== undefined && (
                <div className={`mt-3 flex items-center gap-1 text-sm ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
                    <span>{Math.abs(trend)}% from last week</span>
                </div>
            )}
            {onClick && (
                <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/30" />
            )}
        </div>
    );
};

// Section Card
const SectionCard = ({ title, subtitle, icon: Icon, children, action, className = '' }) => (
    <div className={`bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border ${className}`}>
        <div className="flex items-center justify-between p-5 border-b border-border dark:border-dark-border">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Icon size={18} className="text-primary" />
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-text dark:text-dark-text">{title}</h3>
                    {subtitle && <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
        <div className="p-5">
            {children}
        </div>
    </div>
);

// Status Badge
const StatusBadge = ({ status, count }) => {
    const config = {
        empty: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Empty' },
        loading: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Loading' },
        loaded: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Loaded' },
        readyToDispatch: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Ready' },
        dispatched: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Dispatched' },
        inTransit: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', label: 'In Transit' },
        delivered: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Delivered' },
        pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending' },
        completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Completed' },
        cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelled' },
        draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Draft' },
        manufacturing: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', label: 'Manufacturing' },
        qc: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'QC' },
        packing: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400', label: 'Packing' },
    };

    const { bg, text, label } = config[status] || config.empty;

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${bg}`}>
            <span className={`text-sm font-medium ${text}`}>{label}</span>
            <span className={`text-sm font-bold ${text}`}>{count}</span>
        </div>
    );
};

// =============================================
// MAIN DASHBOARD
// =============================================

const IndiaDashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/india');
            setData(response.data);
        } catch (err) {
            console.error('Dashboard error:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchDashboard]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-text-secondary dark:text-dark-text-secondary">Loading dashboard...</p>
            </div>
        );
    }

    const overview = data?.overview || {};
    const containers = data?.containers || {};
    const dispatches = data?.dispatches || {};
    const purchaseOrders = data?.purchaseOrders || {};
    const weeklySummary = data?.weeklySummary || {};
    const factoryStock = data?.factoryStock || [];
    const productionTrend = data?.productionTrend || [];
    const topTiles = data?.topTiles || [];
    const recentDispatches = data?.recentDispatches || [];
    const lowStockTiles = data?.lowStockTiles || [];

    const totalContainers = Object.values(containers).reduce((a, b) => a + b, 0);
    const totalDispatches = Object.values(dispatches).reduce((a, b) => a + b, 0);
    const totalPOs = Object.values(purchaseOrders).reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen bg-background dark:bg-dark-background">
            <div className="max-w-[1800px] mx-auto p-6 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text">
                            {getGreeting()}, {user?.username}
                        </h1>
                        <p className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-2 mt-1">
                            <Calendar size={14} />
                            {formatDate()}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm text-emerald-700 dark:text-emerald-400">System Online</span>
                        </div>
                        <button
                            onClick={fetchDashboard}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button onClick={fetchDashboard} className="ml-auto text-sm underline">Retry</button>
                    </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <MetricCard 
                        title="Tile Types" 
                        value={overview.tiles || 0} 
                        icon={Layers} 
                        color="blue"
                        onClick={() => navigate('/tiles')}
                    />
                    <MetricCard 
                        title="Factories" 
                        value={overview.factories || 0} 
                        icon={Factory} 
                        color="green"
                        onClick={() => navigate('/factories')}
                    />
                    <MetricCard 
                        title="Containers" 
                        value={overview.containers || 0} 
                        icon={Package} 
                        color="purple"
                        onClick={() => navigate('/containers')}
                    />
                    <MetricCard 
                        title="Pallets" 
                        value={overview.pallets || 0} 
                        icon={Box} 
                        color="cyan"
                        onClick={() => navigate('/factory-stock')}
                    />
                    <MetricCard 
                        title="Khatlis" 
                        value={overview.khatlis || 0} 
                        icon={Package} 
                        color="orange"
                        onClick={() => navigate('/factory-stock')}
                    />
                    <MetricCard 
                        title="Total Boxes" 
                        value={overview.boxes || 0} 
                        icon={Warehouse} 
                        color="primary"
                    />
                </div>

                {/* Weekly Performance */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Dispatches Created</p>
                                <p className="text-3xl font-bold mt-1">{weeklySummary.dispatchesCreated || 0}</p>
                                <p className="text-blue-200 text-xs mt-1">This Week</p>
                            </div>
                            <Truck size={32} className="text-blue-300" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium">Pallets Produced</p>
                                <p className="text-3xl font-bold mt-1">{weeklySummary.palletsCreated || 0}</p>
                                <p className="text-emerald-200 text-xs mt-1">This Week</p>
                            </div>
                            <Box size={32} className="text-emerald-300" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Containers Loaded</p>
                                <p className="text-3xl font-bold mt-1">{weeklySummary.containersLoaded || 0}</p>
                                <p className="text-purple-200 text-xs mt-1">This Week</p>
                            </div>
                            <Package size={32} className="text-purple-300" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">POs Completed</p>
                                <p className="text-3xl font-bold mt-1">{weeklySummary.posCompleted || 0}</p>
                                <p className="text-orange-200 text-xs mt-1">This Week</p>
                            </div>
                            <CheckCircle size={32} className="text-orange-300" />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column - Status Overview */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Container Status */}
                        <SectionCard 
                            title="Container Status" 
                            subtitle={`${totalContainers} total containers`}
                            icon={Package}
                            action={
                                <button 
                                    onClick={() => navigate('/containers')}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    View All <ChevronRight size={14} />
                                </button>
                            }
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{containers.empty || 0}</p>
                                    <p className="text-xs text-text-secondary mt-1">Empty</p>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">{containers.loading || 0}</p>
                                    <p className="text-xs text-text-secondary mt-1">Loading</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{containers.loaded || 0}</p>
                                    <p className="text-xs text-text-secondary mt-1">Loaded</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{containers.readyToDispatch || 0}</p>
                                    <p className="text-xs text-text-secondary mt-1">Ready</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-orange-600">{containers.dispatched || 0}</p>
                                    <p className="text-xs text-text-secondary mt-1">Dispatched</p>
                                </div>
                                <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-cyan-600">{containers.inTransit || 0}</p>
                                    <p className="text-xs text-text-secondary mt-1">In Transit</p>
                                </div>
                                <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-emerald-600">{containers.delivered || 0}</p>
                                    <p className="text-xs text-text-secondary mt-1">Delivered</p>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Dispatch & PO Status Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Dispatch Status */}
                            <SectionCard 
                                title="Dispatch Status" 
                                subtitle={`${totalDispatches} total`}
                                icon={Truck}
                                action={
                                    <button 
                                        onClick={() => navigate('/dispatches')}
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        View <ChevronRight size={14} />
                                    </button>
                                }
                            >
                                <div className="space-y-3">
                                    <ProgressBar label="Pending" value={dispatches.pending || 0} max={totalDispatches || 1} color="bg-yellow-500" showPercentage={false} />
                                    <ProgressBar label="Ready" value={dispatches.ready || 0} max={totalDispatches || 1} color="bg-blue-500" showPercentage={false} />
                                    <ProgressBar label="In Transit" value={dispatches.inTransit || 0} max={totalDispatches || 1} color="bg-cyan-500" showPercentage={false} />
                                    <ProgressBar label="Delivered" value={dispatches.delivered || 0} max={totalDispatches || 1} color="bg-emerald-500" showPercentage={false} />
                                    <ProgressBar label="Completed" value={dispatches.completed || 0} max={totalDispatches || 1} color="bg-green-600" showPercentage={false} />
                                </div>
                            </SectionCard>

                            {/* Purchase Order Status */}
                            <SectionCard 
                                title="Purchase Orders" 
                                subtitle={`${totalPOs} total`}
                                icon={Factory}
                                action={
                                    <button 
                                        onClick={() => navigate('/purchase-orders')}
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        View <ChevronRight size={14} />
                                    </button>
                                }
                            >
                                <div className="space-y-3">
                                    <ProgressBar label="Draft" value={purchaseOrders.draft || 0} max={totalPOs || 1} color="bg-gray-400" showPercentage={false} />
                                    <ProgressBar label="Manufacturing" value={purchaseOrders.manufacturing || 0} max={totalPOs || 1} color="bg-indigo-500" showPercentage={false} />
                                    <ProgressBar label="QC In Progress" value={purchaseOrders.qcInProgress || 0} max={totalPOs || 1} color="bg-amber-500" showPercentage={false} />
                                    <ProgressBar label="Packing" value={purchaseOrders.packing || 0} max={totalPOs || 1} color="bg-pink-500" showPercentage={false} />
                                    <ProgressBar label="Completed" value={purchaseOrders.completed || 0} max={totalPOs || 1} color="bg-emerald-500" showPercentage={false} />
                                </div>
                            </SectionCard>
                        </div>

                        {/* Production Trend */}
                        <SectionCard 
                            title="Production Trend" 
                            subtitle="Last 14 days"
                            icon={TrendingUp}
                        >
                            <AreaChart 
                                data={productionTrend} 
                                height={180}
                                color="#10b981"
                            />
                            <div className="flex justify-between mt-2 text-xs text-text-secondary">
                                <span>14 days ago</span>
                                <span>Today</span>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Right Column - Lists */}
                    <div className="space-y-6">
                        
                        {/* Factory Stock */}
                        <SectionCard 
                            title="Factory Stock" 
                            subtitle="Top by boxes"
                            icon={Warehouse}
                            action={
                                <button 
                                    onClick={() => navigate('/factory-stock')}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    View <ChevronRight size={14} />
                                </button>
                            }
                        >
                            {factoryStock.length === 0 ? (
                                <p className="text-center text-text-secondary py-6">No stock data</p>
                            ) : (
                                <div className="space-y-3">
                                    {factoryStock.slice(0, 5).map((factory, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-text dark:text-dark-text text-sm">{factory.name}</p>
                                                <p className="text-xs text-text-secondary">
                                                    {factory.pallets}P · {factory.khatlis}K
                                                </p>
                                            </div>
                                            <span className="text-lg font-bold text-emerald-600">{factory.boxes?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Recent Dispatches */}
                        <SectionCard 
                            title="Recent Dispatches" 
                            icon={Truck}
                            action={
                                <button 
                                    onClick={() => navigate('/dispatches')}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    View <ChevronRight size={14} />
                                </button>
                            }
                        >
                            {recentDispatches.length === 0 ? (
                                <p className="text-center text-text-secondary py-6">No recent dispatches</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentDispatches.slice(0, 5).map((dispatch, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div>
                                                <p className="font-mono text-sm font-medium text-text dark:text-dark-text">{dispatch.dispatchNumber}</p>
                                                <p className="text-xs text-text-secondary">{dispatch.destination || 'N/A'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-text dark:text-dark-text">
                                                    {dispatch.stockSummary?.totalBoxes?.toLocaleString() || 0}
                                                </p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    dispatch.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    dispatch.status === 'In Transit' ? 'bg-cyan-100 text-cyan-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {dispatch.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Low Stock Alerts */}
                        <SectionCard 
                            title="Low Stock Alerts" 
                            icon={AlertTriangle}
                            action={
                                <button 
                                    onClick={() => navigate('/tiles')}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    View <ChevronRight size={14} />
                                </button>
                            }
                        >
                            {lowStockTiles.length === 0 ? (
                                <div className="text-center py-6">
                                    <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                                    <p className="text-emerald-600 font-medium">All tiles well stocked</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lowStockTiles.slice(0, 5).map((tile, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                                            <div>
                                                <p className="font-medium text-text dark:text-dark-text text-sm">{tile.name}</p>
                                                <p className="text-xs text-text-secondary">{tile.size}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-red-600">{tile.stockDetails?.availableStock || 0}</p>
                                                <p className="text-xs text-red-500">Min: {tile.restockThreshold}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndiaDashboardPage;