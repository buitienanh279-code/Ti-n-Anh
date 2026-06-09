import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  Package, 
  Zap, 
  Tag,
  ArrowUpRight, 
  TrendingUp, 
  Search, 
  Bell, 
  User,
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Settings,
  Bot,
  LogOut,
  ArrowLeft,
  Building,
  ShoppingBag,
  Coins,
  AlertTriangle,
  Plus,
  Filter,
  Trash2,
  Pencil,
  MapPin,
  Phone,
  Clock,
  History,
  Eye,
  Mail,
  Truck,
  X,
  Check,
  Printer,
  Download,
  Shield,
  Database,
  Upload,
  Gift,
  Trophy,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { getLoyaltyInfo, getLoyaltyRate, setLoyaltyRate, getAllLoyaltyData, addLoyaltyPoints } from '../utils/loyalty';
import { getAccounts, saveAccounts, updateAccountData } from '../utils/accounts';
import AdminAccountsView from './AdminAccountsView';
import AdminCustomersView from './AdminCustomersView';

const METRICS = [
  {
    label: 'Tổng đơn hôm nay',
    value: '128',
    change: '+14.2%',
    icon: ShoppingBag,
    className: 'ti-shopping-bag',
    colorClass: 'text-blue-600',
    iconColorClass: 'text-blue-600 bg-blue-50 border-blue-100/50'
  },
  {
    label: 'Doanh thu hôm nay',
    value: '45,980,000đ',
    change: '+18.5%',
    icon: Coins,
    className: 'ti-coin',
    colorClass: 'text-[#0C447C]',
    iconColorClass: 'text-blue-600 bg-blue-50 border-blue-100/50'
  },
  {
    label: 'Sản phẩm sắp hết',
    value: '4',
    change: 'Cần chú ý',
    icon: AlertTriangle,
    className: 'ti-alert-triangle',
    colorClass: 'text-amber-500',
    iconColorClass: 'text-amber-500 bg-amber-50 border-amber-100/50'
  },
  {
    label: 'Chi nhánh hoạt động',
    value: '3',
    change: 'Đang mở cửa',
    icon: Building,
    className: 'ti-building',
    colorClass: 'text-emerald-500',
    iconColorClass: 'text-emerald-500 bg-emerald-50 border-emerald-100/50'
  }
];

const SESSIONS = [
  {
    id: 's1',
    time: '10:45 AM',
    customer: 'Nguyễn An',
    question: 'Tư vấn laptop MacBook mỏng nhẹ',
    products: 'MacBook Air M3, MacBook Pro 14',
    status: 'purchased',
    statusLabel: 'Mua hàng'
  },
  {
    id: 's2',
    time: '10:42 AM',
    customer: 'Trần Bình',
    question: 'Tai nghe chống ồn tầm giá 3 triệu',
    products: 'Sony WH-1000XM5, Marshall Emberton',
    status: 'viewing',
    statusLabel: 'Đang xem'
  },
  {
    id: 's3',
    time: '10:30 AM',
    customer: 'Lê Chi',
    question: 'So sánh iPhone 15 và S24 Ultra',
    products: 'iPhone 15 Pro Max, Samsung S24 Ultra',
    status: 'exited',
    statusLabel: 'Thoát'
  },
  {
    id: 's4',
    time: '10:15 AM',
    customer: 'Phạm Duy',
    question: 'Đồng hồ theo dõi sức khỏe cho nam',
    products: 'Apple Watch S9, Smartwatch Pro',
    status: 'purchased',
    statusLabel: 'Mua hàng'
  },
  {
    id: 's5',
    time: '09:50 AM',
    customer: 'Hoàng Yến',
    question: 'Bàn phím cơ văn phòng',
    products: 'Keychron K2',
    status: 'viewing',
    statusLabel: 'Đang xem'
  }
];

const STATUS_COLORS = {
  purchased: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  viewing: 'bg-amber-50 text-amber-600 border-amber-100',
  exited: 'bg-gray-50 text-gray-400 border-gray-100'
};

const AI_LOGS = [
  {
    id: 'l1',
    time: '11:02:15',
    type: 'query',
    thinking: 'User is asking for laptop office under 20m. Filter knowledge base for category:"Laptop" and price < 20,000,000. Sorting by rating.',
    response: 'Chào bạn, với ngân sách dưới 20 triệu, tôi đề cử MacBook Air M3 và Dell XPS 13 đang có giá cực tốt...'
  },
  {
    id: 'l2',
    time: '11:01:04',
    type: 'query',
    thinking: 'Comparing iPhone 15 vs S24 Ultra. Extracting specs: Display, Camera, Battery. Recommendation based on ecosystem.',
    response: 'Cả hai đều là flagship tuyệt vời. S24 Ultra mạnh về zoom và AI, trong khi iPhone 15 Pro Max tối ưu cho quay phim...'
  }
];

const API_STATS = {
  latency: '245ms',
  tokens: '14.2k / 100k',
  quota: '85.8%',
  status: 'Healthy'
};

interface DailySalesRevenueChartProps {
  orders: any[];
}

function DailySalesRevenueChart({ orders }: DailySalesRevenueChartProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = React.useRef<any | null>(null);
  const [isChartLoaded, setIsChartLoaded] = React.useState(false);

  React.useEffect(() => {
    if ((window as any).Chart) {
      setIsChartLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if ((window as any).Chart) {
        setIsChartLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!isChartLoaded || !canvasRef.current || !orders || orders.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const ChartClass = (window as any).Chart;
    if (!ChartClass) return;

    const parseOrderDate = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      return null;
    };

    const dailyDataMap: { [key: string]: { revenue: number; count: number } } = {};
    orders.forEach((o: any) => {
      if (o.status !== 'cancelled') {
        const date = o.date || '';
        if (!dailyDataMap[date]) {
          dailyDataMap[date] = { revenue: 0, count: 0 };
        }
        dailyDataMap[date].revenue += o.price || 0;
        dailyDataMap[date].count += 1;
      }
    });

    const sortedTimeline = Object.entries(dailyDataMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => {
        const dateA = parseOrderDate(a.date);
        const dateB = parseOrderDate(b.date);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });

    if (sortedTimeline.length === 0) return;

    const labels = sortedTimeline.map(item => {
      const parts = item.date.split('/');
      if (parts.length === 3) {
        return `${parts[0]}/${parts[1]}`;
      }
      return item.date;
    });

    const datasetRevenue = sortedTimeline.map(item => item.revenue);
    const datasetCounts = sortedTimeline.map(item => item.count);

    chartInstanceRef.current = new ChartClass(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Doanh thu ngày',
            data: datasetRevenue,
            borderColor: '#185FA5',
            backgroundColor: 'rgba(24, 95, 165, 0.05)',
            borderWidth: 3,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#185FA5',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4.5,
            pointHoverRadius: 7,
            pointHoverBorderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F8FAFC',
            bodyColor: '#F1F5F9',
            padding: 12,
            cornerRadius: 10,
            titleFont: {
              family: 'Inter, system-ui, sans-serif',
              size: 11,
              weight: 'bold',
            },
            bodyFont: {
              family: 'Inter, system-ui, sans-serif',
              size: 11,
            },
            callbacks: {
              title: (tooltipItems: any[]) => {
                const index = tooltipItems[0].dataIndex;
                const dateFull = sortedTimeline[index].date;
                return `📅 Ngày: ${dateFull}`;
              },
              label: (context: any) => {
                const index = context.dataIndex;
                const value = context.parsed.y;
                const count = datasetCounts[index];
                return [
                  `💰 Doanh thu: ${value.toLocaleString('vi-VN')}đ`,
                  `📦 Đơn hàng: ${count} đơn`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#94A3B8',
              font: {
                family: 'Inter, sans-serif',
                size: 10,
                weight: '600'
              }
            }
          },
          y: {
            grid: {
              color: '#F1F5F9',
            },
            ticks: {
              color: '#94A3B8',
              font: {
                family: 'Inter, sans-serif',
                size: 10,
                weight: '600'
              },
              callback: (value: any) => {
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(0) + 'K';
                }
                return value;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [isChartLoaded, orders]);

  if (!isChartLoaded) {
    return (
      <div className="w-full h-[260px] bg-gray-50/55 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl animate-spin">🌀</span>
          <span className="text-xs text-gray-400 font-bold">Thư viện biểu đồ đang tải...</span>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o: any) => o.status !== 'cancelled');
  if (activeOrders.length === 0) {
    return (
      <div className="w-full h-[260px] bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center border border-dashed border-gray-200 gap-2">
        <span className="text-2xl">📊</span>
        <span className="text-xs text-gray-400 italic font-bold">Chưa có dữ liệu giao dịch trong kỳ.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[260px]">
      <canvas ref={canvasRef} />
    </div>
  );
}

interface SalesChartProps {
  uniqueDates: string[];
  reportFilteredOrders: any[];
  branchesList: any[];
  reportBranch: string;
}

function SalesChart({
  uniqueDates,
  reportFilteredOrders,
  branchesList,
  reportBranch,
}: SalesChartProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = React.useRef<any | null>(null);
  const [isChartLoaded, setIsChartLoaded] = React.useState(false);

  React.useEffect(() => {
    if ((window as any).Chart) {
      setIsChartLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if ((window as any).Chart) {
        setIsChartLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const isOrderFromBranch = (order: any, branchName: string) => {
    const bNameClean = branchName.toLowerCase().replace('showroom', '').replace('remix', '').trim();
    const oNameClean = (order.branch || '').toLowerCase().replace('showroom', '').replace('remix', '').trim();
    return oNameClean.includes(bNameClean) || bNameClean.includes(oNameClean);
  };

  React.useEffect(() => {
    if (!isChartLoaded || !canvasRef.current || !uniqueDates || uniqueDates.length === 0) return;

    // Destroy existing chart to avoid overlay issues and memory leaks
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const ChartClass = (window as any).Chart;
    if (!ChartClass) return;

    // Process datasets
    let datasets: any[] = [];
    const colors = [
      { border: '#185FA5', bg: 'rgba(24, 95, 165, 0.04)' },
      { border: '#10B981', bg: 'rgba(16, 185, 129, 0.04)' },
      { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.04)' },
      { border: '#EF4444', bg: 'rgba(239, 68, 68, 0.04)' },
      { border: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.04)' },
      { border: '#EC4899', bg: 'rgba(236, 72, 153, 0.04)' },
    ];

    if (reportBranch === 'Tất cả') {
      datasets = branchesList.map((branch, index) => {
        const color = colors[index % colors.length];
        const data = uniqueDates.map(date => {
          const ordersOnDate = reportFilteredOrders.filter(
            (o: any) => o.date === date && o.status !== 'cancelled' && isOrderFromBranch(o, branch.name)
          );
          const revenue = ordersOnDate.reduce((sum: number, o: any) => sum + o.price, 0);
          const count = ordersOnDate.length;
          return { x: date, y: revenue, count };
        });

        return {
          label: branch.name,
          data: data,
          borderColor: color.border,
          backgroundColor: color.bg,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: color.border,
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointRadius: 3.5,
          pointHoverRadius: 6,
        };
      });
    } else {
      const data = uniqueDates.map(date => {
        const ordersOnDate = reportFilteredOrders.filter(
          (o: any) => o.date === date && o.status !== 'cancelled'
        );
        const revenue = ordersOnDate.reduce((sum: number, o: any) => sum + o.price, 0);
        const count = ordersOnDate.length;
        return { x: date, y: revenue, count };
      });

      datasets = [
        {
          label: reportBranch,
          data: data,
          borderColor: '#185FA5',
          backgroundColor: 'rgba(24, 95, 165, 0.04)',
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#185FA5',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointRadius: 3.5,
          pointHoverRadius: 6,
        },
      ];
    }

    chartInstanceRef.current = new ChartClass(ctx, {
      type: 'line',
      data: {
        labels: uniqueDates.map(d => {
          return d.substring(5).replace('-', '/'); // "2026-05-22" -> "05/22"
        }),
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 11,
                weight: 'bold',
              },
              color: '#4B5563',
            },
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F9FAFB',
            bodyColor: '#F3F4F6',
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              family: 'Inter, system-ui, sans-serif',
              size: 11,
              weight: 'bold',
            },
            bodyFont: {
              family: 'Inter, system-ui, sans-serif',
              size: 11,
            },
            callbacks: {
              title: (tooltipItems: any[]) => {
                const index = tooltipItems[0].dataIndex;
                const fullDate = uniqueDates[index];
                return `📅 Ngày: ${fullDate}`;
              },
              label: (context: any) => {
                const rawObj = context.raw;
                const revStr = rawObj.y.toLocaleString('vi-VN') + 'đ';
                const countStr = rawObj.count + ' đơn';
                return `• ${context.dataset.label}: ${revStr} (${countStr})`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 10,
                weight: 'bold',
              },
              color: '#9CA3AF',
            },
          },
          y: {
            grid: {
              color: '#F3F4F6',
            },
            ticks: {
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 10,
                weight: 'bold',
              },
              color: '#9CA3AF',
              callback: (value: any) => {
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(0) + 'k';
                }
                return value;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [isChartLoaded, uniqueDates, reportFilteredOrders, branchesList, reportBranch]);

  if (!isChartLoaded) {
    return (
      <div className="w-full h-[280px] bg-gray-50/55 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl animate-spin">🌀</span>
          <span className="text-xs text-gray-400 font-bold">Đang tải thư viện biểu đồ...</span>
        </div>
      </div>
    );
  }

  if (!uniqueDates || uniqueDates.length === 0) {
    return (
      <div className="w-full h-[280px] bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center border border-dashed border-gray-200 gap-2">
        <span className="text-2xl">📊</span>
        <span className="text-xs text-gray-400 italic font-bold">Không có dữ liệu doanh thu trong khoảng thời gian này.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[280px] mt-2">
      <canvas ref={canvasRef} />
    </div>
  );
}

interface AIConsultStatsProps {
  productList: any[];
}

function AIConsultStats({ productList }: AIConsultStatsProps) {
  const [logs, setLogs] = React.useState<any[]>([]);

  const loadLogs = () => {
    const logsStr = localStorage.getItem('remix_chat_logs');
    if (!logsStr) {
      // Seed with beautiful default mock logs if empty, so there are ready-to-view states!
      const defaultLogs = [
        {
          id: "chat-7391",
          user: "hoang_minh_ngo",
          startTime: "2026-05-22T08:14:00Z",
          messagesCount: 8,
          askedProducts: ["MacBook Air M3 (8GB / 256GB)", "Dell XPS 13 Plus Touchscreen"],
          ledToOrder: true,
          lastMessage: "Đã đặt hàng thành công đơn hàng số #8291..."
        },
        {
          id: "chat-2415",
          user: "thanh_truc_le",
          startTime: "2026-05-21T14:23:05Z",
          messagesCount: 4,
          askedProducts: ["Sony WH-1000XM5 Active Noise"],
          ledToOrder: false,
          lastMessage: "Dạ em cảm ơn, để em cân nhắc thêm chiếc Sony WH-1000XM5 này ạ."
        },
        {
          id: "chat-9512",
          user: "bui_tien_anh",
          startTime: "2026-05-22T03:10:45Z",
          messagesCount: 12,
          askedProducts: ["iPhone 15 Pro Max (256GB Platinum)", "Samsung Galaxy S24 Ultra AI Phone"],
          ledToOrder: true,
          lastMessage: "Hệ thống xác nhận đơn hàng iPhone 15 Pro Max trị giá 34.990.000đ."
        },
        {
          id: "chat-4821",
          user: "linh_dan_pham",
          startTime: "2026-05-22T10:05:12Z",
          messagesCount: 6,
          askedProducts: ["Sony WH-1000XM5 Active Noise"],
          ledToOrder: true,
          lastMessage: "Đã tạo đơn hàng thành công tai nghe Sony XM5."
        },
        {
          id: "chat-6374",
          user: "khanh_vy_tran",
          startTime: "2026-05-20T11:45:00Z",
          messagesCount: 14,
          askedProducts: ["Apple Watch Series 9 GPS+Cellular", "Ốp lưng iPhone 15 Silicone MagSafe"],
          ledToOrder: false,
          lastMessage: "Cảm ơn em đã tư vấn nhiệt tình."
        },
        {
          id: "chat-1249",
          user: "quoc_bao_99",
          startTime: "2026-05-21T09:30:15Z",
          messagesCount: 5,
          askedProducts: ["MacBook Air M3 (8GB / 256GB)"],
          ledToOrder: false,
          lastMessage: "Cấu hình M3 này chơi game mượt không bạn?"
        },
        {
          id: "chat-5310",
          user: "my_duyen_lala",
          startTime: "2026-05-22T18:15:30Z",
          messagesCount: 9,
          askedProducts: ["Dyson V15 Detect Cordless Vacuum", "Sony WH-1000XM5 Active Noise"],
          ledToOrder: true,
          lastMessage: "Đã lên đơn thành công Dyson V15."
        },
        {
          id: "chat-2849",
          user: "trung_hieu_ngo",
          startTime: "2026-05-22T13:22:40Z",
          messagesCount: 7,
          askedProducts: ["Sony WH-1000XM5 Active Noise", "Samsung Galaxy S24 Ultra AI Phone"],
          ledToOrder: true,
          lastMessage: "Đã đặt mua tai nghe thành công."
        },
        {
          id: "chat-8120",
          user: "ngo_thanh_binh",
          startTime: "2026-05-20T16:10:00Z",
          messagesCount: 3,
          askedProducts: ["Ốp lưng iPhone 15 Silicone MagSafe"],
          ledToOrder: true,
          lastMessage: "Giao gấp cho anh cái ốp lưng iPhone 15 trong chiều nay nhé."
        },
        {
          id: "chat-9031",
          user: "phuong_thao_p",
          startTime: "2026-05-21T21:05:11Z",
          messagesCount: 11,
          askedProducts: ["Sony WH-1000XM5 Active Noise", "Apple Watch Series 9 GPS+Cellular"],
          ledToOrder: false,
          lastMessage: "Sản phẩm bảo hành bao lâu thế shop?"
        },
        {
          id: "chat-3472",
          user: "kim_oanh_95",
          startTime: "2026-05-22T15:40:22Z",
          messagesCount: 8,
          askedProducts: ["Samsung Galaxy S24 Ultra AI Phone"],
          ledToOrder: false,
          lastMessage: "Samsung S24 Ultra có sẵn màu titan không em?"
        },
        {
          id: "chat-6112",
          user: "dinh_nguyen_an",
          startTime: "2026-05-22T19:50:11Z",
          messagesCount: 10,
          askedProducts: ["MacBook Air M3 (8GB / 256GB)", "Samsung Galaxy S24 Ultra AI Phone"],
          ledToOrder: true,
          lastMessage: "Đã lên đơn Macbook M3 xám."
        }
      ];
      localStorage.setItem('remix_chat_logs', JSON.stringify(defaultLogs));
      setLogs(defaultLogs);
    } else {
      try {
        setLogs(JSON.parse(logsStr));
      } catch (e) {
        setLogs([]);
      }
    }
  };

  React.useEffect(() => {
    loadLogs();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'remix_chat_logs') {
        loadLogs();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalSessions = logs.length;
  const orderSessions = logs.filter(item => item.ledToOrder).length;
  const conversionRate = totalSessions > 0 ? ((orderSessions / totalSessions) * 100).toFixed(1) : '0';

  const countMap: { [key: string]: number } = {};
  logs.forEach((session: any) => {
    if (Array.isArray(session.askedProducts)) {
      session.askedProducts.forEach((prodName: string) => {
        countMap[prodName] = (countMap[prodName] || 0) + 1;
      });
    }
  });

  const topAskedProducts = Object.entries(countMap)
    .map(([name, count]) => {
      const matchProd = productList.find((p: any) => p.name.toLowerCase() === name.toLowerCase() || p.id === name);
      return {
        name,
        count,
        category: matchProd ? matchProd.category : 'Thiết bị',
        stock: matchProd ? matchProd.stock : 0,
        image: matchProd ? matchProd.imageUrl || matchProd.image : null
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="font-bold text-sm text-gray-900 font-sans tracking-tight uppercase">Thống kê hiệu quả tư vấn AI</h2>
          <p className="text-[10px] text-gray-500 mt-0.5 font-bold">Chỉ số hội thoại và tương tác trực tiếp của trợ lý ảo dựa trên log hệ thống</p>
        </div>
        <button 
          onClick={loadLogs}
          className="bg-[#185FA5]/5 text-[#185FA5] hover:bg-[#185FA5]/10 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
        >
          🔄 Làm mới dữ liệu
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-gray-400 block tracking-wider">Tổng phiên chat</span>
            <span className="text-xl font-black text-gray-900 block font-sans tracking-tight">{totalSessions} <span className="text-[10px] text-gray-400 font-normal">phiên</span></span>
            <span className="text-[9px] text-[#22C55E] font-bold block mt-0.5">🟢 Đang hoạt động thời gian thực</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-[#185FA5] rounded-xl flex items-center justify-center font-bold text-lg">
            💬
          </div>
        </div>

        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-gray-400 block tracking-wider">Phiên dẫn đến đặt hàng</span>
            <span className="text-xl font-black text-gray-900 block font-sans tracking-tight">{orderSessions} <span className="text-[10px] text-gray-400 font-normal">phiên</span></span>
            <span className="text-[9px] text-[#185FA5] font-bold block mt-0.5">⚡ Ghi nhận đặt hàng tự động</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold text-lg">
            🛍️
          </div>
        </div>

        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-gray-400 block tracking-wider">Tỷ lệ chuyển đổi</span>
            <span className="text-xl font-black text-emerald-600 block font-sans tracking-tight">{conversionRate}%</span>
            <span className="text-[9px] text-gray-500 font-semibold block mt-0.5">Hiệu xuất chuyển đổi chat thành công</span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg">
            📈
          </div>
        </div>
      </div>

      {/* TOP 5 ASKED PRODUCTS */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Top 5 sản phẩm được hỏi nhiều nhất</h3>
          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Sản phẩm thu hút nhiều lượt tương tác và đặt câu hỏi nhất qua Trợ lý AI</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 min-w-[555px]">
            <thead>
              <tr className="border-b border-gray-150 text-gray-400 font-black uppercase text-[9px] tracking-wider">
                <th className="py-2.5 text-center w-14">Hạng</th>
                <th className="py-2.5 pl-2">Sản phẩm</th>
                <th className="py-2.5 w-28">Danh mục</th>
                <th className="py-2.5 text-center w-24">Số lượt hỏi</th>
                <th className="py-2.5 text-center w-28">Tồn kho còn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150/50">
              {topAskedProducts.map((item, index) => {
                let badgeClass = 'bg-gray-100 text-gray-500 w-5 h-5 text-[10px]';
                let badgeIcon = (index + 1).toString();
                if (index === 0) {
                  badgeClass = 'bg-yellow-50 text-yellow-800 border border-yellow-250 w-6.5 h-6.5 text-[11px]';
                  badgeIcon = '🥇';
                } else if (index === 1) {
                  badgeClass = 'bg-slate-150 text-slate-800 border border-slate-350 w-6.5 h-6.5 text-[11px]';
                  badgeIcon = '🥈';
                } else if (index === 2) {
                  badgeClass = 'bg-[#FFF2E6] text-orange-900 border border-orange-200 w-6.5 h-6.5 text-[11px]';
                  badgeIcon = '🥉';
                }

                return (
                  <tr key={item.name} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-2.5 text-center">
                      <span className={`inline-flex items-center justify-center rounded-full font-black ${badgeClass}`}>
                        {badgeIcon}
                      </span>
                    </td>
                    <td className="py-2.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Product" />
                          ) : (
                            <span className="text-[9px] font-bold text-gray-300">N/A</span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-900 block truncate max-w-[220px]" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 text-[#185FA5] uppercase tracking-wider inline-block">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-extrabold text-[#185FA5]">
                      {item.count} <span className="text-[10px] text-gray-400 font-normal">lượt</span>
                    </td>
                    <td className="py-2.5 text-center">
                      {item.stock <= 5 ? (
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 inline-block">
                          Còn {item.stock} sp
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 inline-block">
                          Còn {item.stock} sp
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {topAskedProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-xs italic">
                    Chưa có lượt tương tác hỏi về sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface AdminDashboardProps {
  onLogout?: () => void;
  onSwitchToCustomer?: () => void;
}

export default function AdminDashboard({ onLogout, onSwitchToCustomer }: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'products' | 'branches' | 'orders-management' | 'analytics' | 'history' | 'ai-config' | 'promotions' | 'loyalty' | 'accounts' | 'customers'>('overview');
  
  // Real-time notifications for newly registered users today
  const [newRegsToday, setNewRegsToday] = useState(0);
  const [adminToasts, setAdminToasts] = useState<{ id: string; message: string }[]>([]);
  const knownAccountIdsRef = React.useRef<Set<string>>(new Set());

  // Toast dispatch helper
  const showAdminToast = (message: string) => {
    const id = Math.random().toString(36).substring(2, 11);
    setAdminToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setAdminToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  React.useEffect(() => {
    // Helper to run the check
    const checkAccounts = () => {
      try {
        const accounts = getAccounts();
        
        // Count registrations today
        const pad = (n: number) => n.toString().padStart(2, '0');
        const now = new Date();
        const todayStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
        
        const todayAccounts = accounts.filter(acc => acc.createdAt && acc.createdAt.startsWith(todayStr));
        setNewRegsToday(todayAccounts.length);

        // Detect new accounts registered while admin is viewing
        const currentIds = new Set(accounts.map(acc => acc.id));
        const isFirstRun = knownAccountIdsRef.current.size === 0;

        if (isFirstRun) {
          knownAccountIdsRef.current = currentIds;
        } else {
          accounts.forEach(acc => {
            if (!knownAccountIdsRef.current.has(acc.id)) {
              // Trigger toast for new user
              showAdminToast(`🎉 Người dùng mới: ${acc.name || acc.email} vừa đăng ký!`);
              // Add to current set
              knownAccountIdsRef.current.add(acc.id);
            }
          });
          // sync any deletions or state changes smoothly
          knownAccountIdsRef.current = currentIds;
        }
      } catch (err) {
        console.error("Error checking new registrations in Real-time", err);
      }
    };

    // Run first check immediately
    checkAccounts();

    // Check every 30 seconds
    const intervalId = setInterval(checkAccounts, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Custom Product List with Branches & Search filter support
  const [productList, setProductList] = useState<any[]>(() => {
    try {
      // 1. Try to load newest key
      let saved = localStorage.getItem('remix_products');
      // 2. Try fallback to old key
      if (!saved) {
        saved = localStorage.getItem('remix_product_list');
      }
      
      if (saved) {
        const parsed = JSON.parse(saved);
        const loaded = parsed.map((p: any) => {
          const q1 = typeof p.stockQ1 === 'number' ? p.stockQ1 : (p.branches?.includes('Q1') ? Math.ceil(p.stock / (p.branches.length || 1)) : 0);
          const q3 = typeof p.stockQ3 === 'number' ? p.stockQ3 : (p.branches?.includes('Q3') ? Math.ceil(p.stock / (p.branches.length || 1)) : 0);
          const q7 = typeof p.stockQ7 === 'number' ? p.stockQ7 : (p.branches?.includes('Q7') ? Math.ceil(p.stock / (p.branches.length || 1)) : 0);
          return {
            ...p,
            stockQ1: q1,
            stockQ3: q3,
            stockQ7: q7,
            stock: q1 + q3 + q7
          };
        });
        // Backfill to remix_products to keep keys in sync
        localStorage.setItem('remix_products', JSON.stringify(loaded));
        return loaded;
      }
    } catch (e) {
      console.error(e);
    }

    const defaultList = [
      { id: 'REMIX-LPT01', name: 'MacBook Air M3 (8GB / 256GB)', category: 'Laptop', price: 27990000, stockQ1: 10, stockQ3: 5, stockQ7: 0, stock: 15, rec: 452, branches: ['Q1', 'Q3'] },
      { id: 'REMIX-PHN15', name: 'iPhone 15 Pro Max (256GB Platinum)', category: 'Điện thoại', price: 34990000, stockQ1: 5, stockQ3: 0, stockQ7: 3, stock: 8, rec: 320, branches: ['Q1', 'Q7'] },
      { id: 'REMIX-EAR05', name: 'Sony WH-1000XM5 Active Noise', category: 'Tai nghe', price: 8490000, stockQ1: 0, stockQ3: 14, stockQ7: 10, stock: 24, rec: 198, branches: ['Q3', 'Q7'] },
      { id: 'REMIX-S24U', name: 'Samsung Galaxy S24 Ultra AI Phone', category: 'Điện thoại', price: 31990000, stockQ1: 4, stockQ3: 4, stockQ7: 4, stock: 12, rec: 285, branches: ['Q1', 'Q3', 'Q7'] },
      { id: 'REMIX-LPT02', name: 'Dell XPS 13 Plus Touchscreen', category: 'Laptop', price: 35990000, stockQ1: 5, stockQ3: 0, stockQ7: 0, stock: 5, rec: 125, branches: ['Q1'] },
      { id: 'REMIX-WCH09', name: 'Apple Watch Series 9 GPS+Cellular', category: 'Đồng hồ', price: 10490000, stockQ1: 0, stockQ3: 19, stockQ7: 0, stock: 19, rec: 140, branches: ['Q3'] },
      { id: 'REMIX-ACC06', name: 'Ốp lưng iPhone 15 Silicone MagSafe', category: 'Phụ kiện', price: 1290000, stockQ1: 20, stockQ3: 15, stockQ7: 15, stock: 50, rec: 98, branches: ['Q1', 'Q3', 'Q7'] },
      { id: 'REMIX-HDY15', name: 'Dyson V15 Detect Cordless Vacuum', category: 'Gia dụng', price: 18900000, stockQ1: 0, stockQ3: 0, stockQ7: 4, stock: 4, rec: 72, branches: ['Q7'] },
      { id: 'REMIX-CAM05', name: 'Canon EOS R5 Mirrorless Camera', category: 'Máy ảnh', price: 89000000, stockQ1: 1, stockQ3: 1, stockQ7: 0, stock: 2, rec: 45, branches: ['Q1', 'Q3'] },
    ];
    try {
      localStorage.setItem('remix_products', JSON.stringify(defaultList));
    } catch (e) {
      console.error(e);
    }
    return defaultList;
  });

  const [productBranchFilter, setProductBranchFilter] = useState<string>('Tất cả');
  const [orderBranchFilter, setOrderBranchFilter] = useState<string>('Tất cả');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('Tất cả');
  const [orderDateRangeFilter, setOrderDateRangeFilter] = useState<string>('Tất cả');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedDetailedOrder, setSelectedDetailedOrder] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<string>('');
  const [reportBranch, setReportBranch] = useState<string>('Tất cả');
  const [reportPeriod, setReportPeriod] = useState<string>('Tháng này');
  const [reportStartDate, setReportStartDate] = useState<string>('2026-05-01');
  const [reportEndDate, setReportEndDate] = useState<string>('2026-05-22');
  const [reportInnerTab, setReportInnerTab] = useState<'sales' | 'ai'>('sales');

  React.useEffect(() => {
    if (selectedDetailedOrder) {
      setModalStatus(selectedDetailedOrder.status);
    }
  }, [selectedDetailedOrder]);

  const filteredProducts = productList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearchQuery.toLowerCase());
    const matchesBranch = productBranchFilter === 'Tất cả' || p.branches.includes(productBranchFilter);
    return matchesSearch && matchesBranch;
  });

  // Form states to add new products
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Tai nghe');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStockQ1, setNewProdStockQ1] = useState('0');
  const [newProdStockQ3, setNewProdStockQ3] = useState('0');
  const [newProdStockQ7, setNewProdStockQ7] = useState('0');
  const [newProdSelectedBranches, setNewProdSelectedBranches] = useState<string[]>(['Q1', 'Q3', 'Q7']);
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState('');
  const [newProdPromo, setNewProdPromo] = useState('');
  const [newProdImage, setNewProdImage] = useState('');

  const [newProdStocks, setNewProdStocks] = useState<Record<string, string>>({});

  const getBranchesFromStorage = () => {
    try {
      const saved = localStorage.getItem('remix_branches');
      if (saved) {
        const branches = JSON.parse(saved);
        if (branches.length > 0) return branches;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'Q1', name: 'Showroom REMIX - Quận 1', address: '85 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', phone: '028.3838.9999', hours: '08:00 - 22:00', status: 'active', manager: 'Nguyễn Anh Tuấn', managerPhone: '0901234567', email: 'q1@remix.vn', hasDelivery: true, deliveryFee: 20000, deliveryArea: 'Quận 1, Quận 3, Quận 4, Quận 5, Quận 10' },
      { id: 'Q3', name: 'Showroom REMIX - Quận 3', address: '12 Tràng Thi, Hoàn Kiếm, Hà Nội', phone: '024.3939.8888', hours: '08:30 - 21:30', status: 'active', manager: 'Trần Quốc Bảo', managerPhone: '0912345678', email: 'q3@remix.vn', hasDelivery: true, deliveryFee: 15000, deliveryArea: 'Hoàn Kiếm, Ba Đình, Đống Đa, Hai Bà Trưng' },
      { id: 'Q7', name: 'Showroom REMIX - Quận 7', address: '145 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', phone: '0236.366.7777', hours: '08:30 - 21:30', status: 'active', manager: 'Phan Minh Trí', managerPhone: '0923456789', email: 'q7@remix.vn', hasDelivery: false, deliveryFee: 0, deliveryArea: 'Hải Châu, Thanh Khê' },
    ];
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm!");
      return;
    }
    if (newProdSelectedBranches.length === 0) {
      alert("Vui lòng chọn ít nhất một chi nhánh phân phối!");
      return;
    }

    const priceNum = parseInt(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Đơn giá phải là số dương lớn hơn 0!");
      return;
    }

    const branches = getBranchesFromStorage();
    const stockDetails: Record<string, number> = {};
    let hasNegative = false;
    let totalStock = 0;

    branches.forEach((b: any) => {
      const isSelected = newProdSelectedBranches.includes(b.id);
      const stockVal = isSelected ? (parseInt(newProdStocks[b.id]) || 0) : 0;
      if (stockVal < 0) {
        hasNegative = true;
      }
      stockDetails[b.id] = stockVal;
      totalStock += stockVal;
    });

    if (hasNegative) {
      alert("Số lượng tồn kho không được âm!");
      return;
    }

    const categoriesMap: Record<string, string> = {
      'Điện thoại': 'PHN',
      'Laptop': 'LPT',
      'Tai nghe': 'EAR',
      'Smartwatch': 'WCH',
      'Phụ kiện': 'ACC',
      'Khác': 'OTH',
    };
    const prefix = categoriesMap[newProdCategory] || 'PRD';
    const randomHex = Math.floor(100 + Math.random() * 900).toString();
    const newId = `REMIX-${prefix}${randomHex}`;

    const newProduct: any = {
      id: newId,
      name: newProdName,
      category: newProdCategory,
      price: priceNum,
      stockQ1: stockDetails['Q1'] || 0,
      stockQ3: stockDetails['Q3'] || 0,
      stockQ7: stockDetails['Q7'] || 0,
      stock: totalStock,
      rec: Math.floor(Math.random() * 50),
      branches: newProdSelectedBranches,
      description: newProdDescription,
      specs: newProdSpecs,
      promo: newProdPromo,
      imageUrl: newProdImage || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400',
    };

    // Store dynamic branch keys
    branches.forEach((b: any) => {
      newProduct['stock_' + b.id] = stockDetails[b.id] || 0;
      newProduct[b.id] = stockDetails[b.id] || 0;
    });

    const updated = [newProduct, ...productList];
    setProductList(updated);
    try {
      localStorage.setItem('remix_products', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    // Reset form states
    setNewProdName('');
    setNewProdPrice('');
    setNewProdStockQ1('0');
    setNewProdStockQ3('0');
    setNewProdStockQ7('0');
    setNewProdSelectedBranches(['Q1', 'Q3', 'Q7']);
    setNewProdDescription('');
    setNewProdSpecs('');
    setNewProdPromo('');
    setNewProdImage('');
    setNewProdStocks({});
    setShowAddProductModal(false);
  };

  // Form states to edit existing products
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('Tai nghe');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdStockQ1, setEditProdStockQ1] = useState('0');
  const [editProdStockQ3, setEditProdStockQ3] = useState('0');
  const [editProdStockQ7, setEditProdStockQ7] = useState('0');
  const [editProdDescription, setEditProdDescription] = useState('');
  const [editProdSpecs, setEditProdSpecs] = useState('');
  const [editProdPromo, setEditProdPromo] = useState('');
  const [editProdImage, setEditProdImage] = useState('');

  const [editProdSelectedBranches, setEditProdSelectedBranches] = useState<string[]>([]);
  const [editProdStocks, setEditProdStocks] = useState<Record<string, string>>({});

  const startEditProduct = (p: any) => {
    setEditingProduct(p);
    setEditProdName(p.name);
    setEditProdCategory(p.category || 'Tai nghe');
    setEditProdPrice((p.price || 0).toString());
    setEditProdStockQ1((p.stockQ1 || 0).toString());
    setEditProdStockQ3((p.stockQ3 || 0).toString());
    setEditProdStockQ7((p.stockQ7 || 0).toString());
    setEditProdDescription(p.description || '');
    setEditProdSpecs(p.specs || '');
    setEditProdPromo(p.promo || '');
    setEditProdImage(p.imageUrl || p.image || '');

    // Dynamically read the latest branches from Storage and prepare stock mapping
    const latestBranches = getBranchesFromStorage().filter((b: any) => b.status === 'active' || b.active !== false);
    const branchIds = latestBranches.map((b: any) => b.id);
    
    // Set selected branches of the edited product
    const prodBranches = p.branches || [];
    setEditProdSelectedBranches(prodBranches);

    const initialStocks: Record<string, string> = {};
    branchIds.forEach((id: string) => {
      let val = 0;
      if (id === 'Q1') {
        val = p.stockQ1 || 0;
      } else if (id === 'Q3') {
        val = p.stockQ3 || 0;
      } else if (id === 'Q7') {
        val = p.stockQ7 || 0;
      } else {
        val = p['stock_' + id] !== undefined ? p['stock_' + id] : (p[id] || 0);
      }
      initialStocks[id] = val.toString();
    });
    setEditProdStocks(initialStocks);

    setShowEditProductModal(true);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName.trim() || !editProdPrice) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm!");
      return;
    }

    const priceNum = parseInt(editProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Đơn giá phải là số dương lớn hơn 0!");
      return;
    }

    const branches = getBranchesFromStorage();
    const stockDetails: Record<string, number> = {};
    let hasNegative = false;
    let totalStock = 0;

    branches.forEach((b: any) => {
      const isSelected = editProdSelectedBranches.includes(b.id);
      const stockVal = isSelected ? (parseInt(editProdStocks[b.id]) || 0) : 0;
      if (stockVal < 0) {
        hasNegative = true;
      }
      stockDetails[b.id] = stockVal;
      totalStock += stockVal;
    });

    if (hasNegative) {
      alert("Số lượng tồn kho không được âm!");
      return;
    }

    const updated = productList.map((p) => {
      if (p.id === editingProduct.id) {
        const updatedProduct: any = {
          ...p,
          name: editProdName,
          category: editProdCategory,
          price: priceNum,
          stockQ1: stockDetails['Q1'] || 0,
          stockQ3: stockDetails['Q3'] || 0,
          stockQ7: stockDetails['Q7'] || 0,
          stock: totalStock,
          branches: editProdSelectedBranches,
          description: editProdDescription,
          specs: editProdSpecs,
          promo: editProdPromo,
          imageUrl: editProdImage || p.imageUrl || p.image,
        };

        // Store dynamic branch stocks
        branches.forEach((b: any) => {
          updatedProduct['stock_' + b.id] = stockDetails[b.id] || 0;
          updatedProduct[b.id] = stockDetails[b.id] || 0;
        });

        return updatedProduct;
      }
      return p;
    });

    setProductList(updated);
    try {
      localStorage.setItem('remix_products', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setShowEditProductModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${productId}?`)) {
      const updated = productList.filter(p => p.id !== productId);
      setProductList(updated);
      try {
        localStorage.setItem('remix_products', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Branch management states
  const [branchesList, setBranchesList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('remix_branches');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'Q1', name: 'Showroom REMIX - Quận 1', address: '85 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', phone: '028.3838.9999', hours: '08:00 - 22:00', status: 'active', manager: 'Nguyễn Anh Tuấn', managerPhone: '0901234567', email: 'q1@remix.vn', hasDelivery: true, deliveryFee: 20000, deliveryArea: 'Quận 1, Quận 3, Quận 4, Quận 5, Quận 10' },
      { id: 'Q3', name: 'Showroom REMIX - Quận 3', address: '12 Tràng Thi, Hoàn Kiếm, Hà Nội', phone: '024.3939.8888', hours: '08:30 - 21:30', status: 'active', manager: 'Trần Quốc Bảo', managerPhone: '0912345678', email: 'q3@remix.vn', hasDelivery: true, deliveryFee: 15000, deliveryArea: 'Hoàn Kiếm, Ba Đình, Đống Đa, Hai Bà Trưng' },
      { id: 'Q7', name: 'Showroom REMIX - Quận 7', address: '145 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', phone: '0236.366.7777', hours: '08:30 - 21:30', status: 'active', manager: 'Phan Minh Trí', managerPhone: '0923456789', email: 'q7@remix.vn', hasDelivery: false, deliveryFee: 0, deliveryArea: 'Hải Châu, Thanh Khê' },
    ];
  });

  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);

  // Custom Promotion/Coupons states
  const [couponsList, setCouponsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('remix_vouchers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading remix_vouchers:', e);
    }
    // Default initial coupons exactly as pre-created list
    const initialCoupons = [
      { id: '1', code: 'REMIX10', discountType: 'percentage', value: 10, minOrderValue: 500000, maxUses: 0, usedCount: 0, expiryDate: '2026-12-31', applicableBranches: ['All'] },
      { id: '2', code: 'NEWUSER', discountType: 'fixed', value: 50000, minOrderValue: 0, maxUses: 1, usedCount: 0, expiryDate: '2026-12-31', applicableBranches: ['All'] },
      { id: '3', code: 'SALE20', discountType: 'percentage', value: 20, minOrderValue: 0, maxUses: 0, usedCount: 0, expiryDate: '2026-12-31', applicableBranches: ['All'], applicableCategory: 'Laptop' }
    ];
    try {
      localStorage.setItem('remix_vouchers', JSON.stringify(initialCoupons));
    } catch (err) {
      console.error(err);
    }
    return initialCoupons;
  });

  const [pCode, setPCode] = useState('');
  const [pDiscountType, setPDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [pValue, setPValue] = useState<string>('10');
  const [pMinOrderValue, setPMinOrderValue] = useState<string>('0');
  const [pMaxUses, setPMaxUses] = useState<string>('0');
  const [pExpiryDate, setPExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pApplicableBranches, setPApplicableBranches] = useState<string[]>(['All']);
  const [pApplicableCategory, setPApplicableCategory] = useState<string>('');

  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Sync listener for order placements
  React.useEffect(() => {
    const handleCouponsChanged = () => {
      try {
        const saved = localStorage.getItem('remix_vouchers');
        if (saved) {
          setCouponsList(JSON.parse(saved));
        }
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('remix_vouchers_changed', handleCouponsChanged);
    return () => {
      window.removeEventListener('remix_vouchers_changed', handleCouponsChanged);
    };
  }, []);

  // Form states for Branch
  const [newBranchId, setNewBranchId] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchHours, setNewBranchHours] = useState('08:30 - 21:30');
  const [newBranchStatus, setNewBranchStatus] = useState('active');
  const [newBranchManager, setNewBranchManager] = useState('');
  const [newBranchEmail, setNewBranchEmail] = useState('');
  const [newBranchManagerPhone, setNewBranchManagerPhone] = useState('');
  const [newBranchHasDelivery, setNewBranchHasDelivery] = useState(false);
  const [newBranchDeliveryFee, setNewBranchDeliveryFee] = useState('');
  const [newBranchDeliveryArea, setNewBranchDeliveryArea] = useState('');

  const [editBranchName, setEditBranchName] = useState('');
  const [editBranchAddress, setEditBranchAddress] = useState('');
  const [editBranchPhone, setEditBranchPhone] = useState('');
  const [editBranchHours, setEditBranchHours] = useState('08:30 - 21:30');
  const [editBranchStatus, setEditBranchStatus] = useState('active');
  const [editBranchManager, setEditBranchManager] = useState('');
  const [editBranchEmail, setEditBranchEmail] = useState('');
  const [editBranchManagerPhone, setEditBranchManagerPhone] = useState('');
  const [editBranchHasDelivery, setEditBranchHasDelivery] = useState(false);
  const [editBranchDeliveryFee, setEditBranchDeliveryFee] = useState('');
  const [editBranchDeliveryArea, setEditBranchDeliveryArea] = useState('');

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchId.trim() || !newBranchName.trim() || !newBranchAddress.trim()) {
      alert("Vui lòng điền đầy đủ Mã, Tên và Địa chỉ chi nhánh!");
      return;
    }

    const cleanedId = newBranchId.trim().toUpperCase();
    if (branchesList.some(b => b.id === cleanedId)) {
      alert("Mã chi nhánh này đã tồn tại!");
      return;
    }

    const newBranch = {
      id: cleanedId,
      name: newBranchName.trim(),
      address: newBranchAddress.trim(),
      phone: newBranchPhone.trim() || 'Chưa cập nhật',
      hours: newBranchHours.trim() || '08:30 - 21:30',
      status: newBranchStatus,
      manager: newBranchManager.trim() || 'Chưa cập nhật',
      managerPhone: newBranchManagerPhone.trim() || 'Chưa cập nhật',
      email: newBranchEmail.trim() || '',
      hasDelivery: newBranchHasDelivery,
      deliveryFee: newBranchHasDelivery ? (Number(newBranchDeliveryFee) || 0) : 0,
      deliveryArea: newBranchDeliveryArea.trim() || '',
    };

    const updated = [...branchesList, newBranch];
    setBranchesList(updated);
    try {
      localStorage.setItem('remix_branches', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    // Reset Form
    setNewBranchId('');
    setNewBranchName('');
    setNewBranchAddress('');
    setNewBranchPhone('');
    setNewBranchHours('08:30 - 21:30');
    setNewBranchStatus('active');
    setNewBranchManager('');
    setNewBranchManagerPhone('');
    setNewBranchEmail('');
    setNewBranchHasDelivery(false);
    setNewBranchDeliveryFee('');
    setNewBranchDeliveryArea('');
    setShowAddBranchModal(false);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoSuccess(null);
    setPromoError(null);

    const normCode = pCode.trim().toUpperCase();
    if (!normCode) {
      setPromoError('Vui lòng nhập mã giảm giá.');
      return;
    }

    if (couponsList.some(c => c.code === normCode)) {
      setPromoError(`Mã giảm giá "${normCode}" đã tồn tại. Vui lòng nhập mã khác.`);
      return;
    }

    const valNum = parseFloat(pValue) || 0;
    if (valNum <= 0) {
      setPromoError('Giá trị giảm giá phải lớn hơn 0.');
      return;
    }

    if (pDiscountType === 'percentage' && valNum > 100) {
      setPromoError('Phần trăm giảm tối đa là 100%.');
      return;
    }

    const minOrderVal = parseFloat(pMinOrderValue) || 0;
    const maxUseCount = parseInt(pMaxUses, 10) || 0;

    if (pApplicableBranches.length === 0) {
      setPromoError('Vui lòng chọn ít nhất một chi nhánh áp dụng (hoặc chọn Tất cả).');
      return;
    }

    const newCoupon = {
      id: `COUPON-${Date.now()}`,
      code: normCode,
      discountType: pDiscountType,
      value: valNum,
      minOrderValue: minOrderVal,
      maxUses: maxUseCount,
      usedCount: 0,
      expiryDate: pExpiryDate,
      applicableBranches: pApplicableBranches,
      applicableCategory: pApplicableCategory || undefined
    };

    const updatedCoupons = [newCoupon, ...couponsList];
    try {
      localStorage.setItem('remix_vouchers', JSON.stringify(updatedCoupons));
      setCouponsList(updatedCoupons);
      window.dispatchEvent(new Event('remix_vouchers_changed'));
      
      // Reset form fields
      setPCode('');
      setPValue('10');
      setPMinOrderValue('0');
      setPMaxUses('0');
      setPApplicableBranches(['All']);
      setPApplicableCategory('');
      setPromoSuccess(`Đã tạo thành công mã giảm giá "${normCode}"!`);
    } catch (err) {
      console.error(err);
      setPromoError('Lỗi hệ thống khi lưu mã giảm giá.');
    }
  };

  const handleDeleteCoupon = (couponId: string, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code}"?`)) {
      return;
    }
    const updated = couponsList.filter(c => c.id !== couponId);
    try {
      localStorage.setItem('remix_vouchers', JSON.stringify(updated));
      setCouponsList(updated);
      window.dispatchEvent(new Event('remix_vouchers_changed'));
      setPromoSuccess(`Đã xóa mã giảm giá "${code}".`);
      setPromoError(null);
    } catch (err) {
      console.error(err);
      setPromoError('Lỗi hệ thống khi xóa mã giảm giá.');
    }
  };

  const handleToggleBranch = (branchId: string) => {
    if (branchId === 'All') {
      setPApplicableBranches(['All']);
    } else {
      setPApplicableBranches(prev => {
        const filtered = prev.filter(b => b !== 'All');
        if (filtered.includes(branchId)) {
          const newBranches = filtered.filter(b => b !== branchId);
          return newBranches.length === 0 ? ['All'] : newBranches;
        } else {
          return [...filtered, branchId];
        }
      });
    }
  };

  const startEditBranch = (b: any) => {
    setEditingBranch(b);
    setEditBranchName(b.name);
    setEditBranchAddress(b.address);
    setEditBranchPhone(b.phone);
    setEditBranchHours(b.hours);
    setEditBranchStatus(b.status || 'active');
    setEditBranchManager(b.manager || '');
    setEditBranchManagerPhone(b.managerPhone || '');
    setEditBranchEmail(b.email || '');
    setEditBranchHasDelivery(!!b.hasDelivery);
    setEditBranchDeliveryFee(b.deliveryFee !== undefined ? b.deliveryFee.toString() : '');
    setEditBranchDeliveryArea(b.deliveryArea || '');
    setShowEditBranchModal(true);
  };

  const handleUpdateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    if (!editBranchName.trim() || !editBranchAddress.trim()) {
      alert("Vui lòng điền đầy đủ Tên và Địa chỉ chi nhánh!");
      return;
    }

    const updated = branchesList.map((b) => {
      if (b.id === editingBranch.id) {
        return {
          ...b,
          name: editBranchName.trim(),
          address: editBranchAddress.trim(),
          phone: editBranchPhone.trim() || 'Chưa cập nhật',
          hours: editBranchHours.trim() || '08:30 - 21:30',
          status: editBranchStatus,
          manager: editBranchManager.trim() || 'Chưa cập nhật',
          managerPhone: editBranchManagerPhone.trim() || 'Chưa cập nhật',
          email: editBranchEmail.trim() || '',
          hasDelivery: editBranchHasDelivery,
          deliveryFee: editBranchHasDelivery ? (Number(editBranchDeliveryFee) || 0) : 0,
          deliveryArea: editBranchDeliveryArea.trim() || '',
        };
      }
      return b;
    });

    setBranchesList(updated);
    try {
      localStorage.setItem('remix_branches', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setShowEditBranchModal(false);
    setEditingBranch(null);
  };

  const handleDeleteBranch = (branchId: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chi nhánh ${branchId}?`)) {
      const updated = branchesList.filter(b => b.id !== branchId);
      setBranchesList(updated);
      try {
        localStorage.setItem('remix_branches', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleBranchStatus = (branchId: string) => {
    const updated = branchesList.map(b => 
      b.id === branchId ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' } : b
    );
    setBranchesList(updated);
    try {
      localStorage.setItem('remix_branches', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };
  
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('remix_orders') || localStorage.getItem('remix_placed_orders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'REMIX-9582',
        date: '18/05/2026',
        productName: 'Sony WH-CH520',
        price: 1290000,
        status: 'shipping',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
      },
      {
        id: 'REMIX-7421',
        date: '15/05/2026',
        productName: 'Laptop ASUS Vivobook',
        price: 12500000,
        status: 'delivered',
        imageUrl: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=150&q=80',
      },
      {
        id: 'REMIX-2391',
        date: '19/05/2026',
        productName: 'Samsung Galaxy A55',
        price: 8990000,
        status: 'processing',
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&q=80',
      }
    ];
  });

  const updateOrderStatus = (orderId: string, newStatus: 'processing' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled') => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    try {
      localStorage.setItem('remix_orders', JSON.stringify(updated));
      localStorage.setItem('remix_placed_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOrder = (orderId: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderId}?`)) {
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      try {
        localStorage.setItem('remix_orders', JSON.stringify(updated));
        localStorage.setItem('remix_placed_orders', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getEnrichedOrders = (orderList: any[]) => {
    return orderList.map((order) => {
      const idNum = parseInt(order.id.replace(/\D/g, '') || '0');
      
      const names = [
        'Nguyễn An', 
        'Phạm Duy', 
        'Trần Thị Mai', 
        'Lê Hoàng Nam', 
        'Hoàng Yến', 
        'Phan Hải', 
        'Bùi Tiến Anh'
      ];
      const branches = [
        'Showroom Hoàn Kiếm', 
        'Showroom Quận 1', 
        'Showroom Hải Châu'
      ];
      const times = [
        '10:45 AM', 
        '10:15 AM', 
        '09:30 AM', 
        '08:15 AM', 
        'Hôm qua', 
        '2 ngày trước'
      ];
      const methods = [
        'Chuyển khoản', 
        'COD', 
        'Thẻ tín dụng'
      ];
      const phones = [
        '0901234567',
        '0912345678',
        '0923456789',
        '0934567890',
        '0945678901'
      ];
      const addresses = [
        '123 Đường 3/2, Quận 10, TP. Hồ Chí Minh',
        '45 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
        '789 Nguyễn Chí Thanh, Đống Đa, Hà Nội',
        '101 Hùng Vương, Hải Châu, Đà Nẵng',
        '202 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh'
      ];

      const customerName = order.customerName || names[idNum % names.length];
      const branch = order.branch || branches[idNum % branches.length];
      const time = order.time || (order.date === '22/05/2026' || order.date === '19/05/2026' ? times[idNum % 4] : order.date || 'Hôm qua');
      const method = order.method || methods[idNum % methods.length];
      const phone = order.phone || phones[idNum % phones.length];
      const address = order.address || addresses[idNum % addresses.length];

      return {
        ...order,
        customerName,
        branch,
        time,
        method,
        phone,
        address
      };
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight';
      case 'shipping':
        return 'bg-purple-50 text-purple-700 border border-purple-200/60 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200/60 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200/60 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight';
    }
  };

  const getStatusLabelText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const enrichedAllOrders = getEnrichedOrders(orders);
  const recentEnrichedOrders = enrichedAllOrders.slice(0, 5);

  const filteredOrders = enrichedAllOrders.filter((order: any) => {
    // 1. Lọc theo chi nhánh
    let isBranchMatch = true;
    if (orderBranchFilter !== 'Tất cả') {
      const targetBranch = branchesList.find((b: any) => b.id === orderBranchFilter || b.name === orderBranchFilter);
      if (targetBranch) {
        const bNameClean = targetBranch.name.toLowerCase().replace('showroom', '').replace('remix', '').trim();
        const oNameClean = (order.branch || '').toLowerCase().replace('showroom', '').replace('remix', '').trim();
        
        isBranchMatch = 
          (targetBranch.id === 'Q1' && (oNameClean.includes('quận 1') || oNameClean.includes('q1'))) ||
          (targetBranch.id === 'Q3' && (oNameClean.includes('hoàn kiếm') || oNameClean.includes('quận 3') || oNameClean.includes('q3'))) ||
          (targetBranch.id === 'Q7' && (oNameClean.includes('hải châu') || oNameClean.includes('quận 7') || oNameClean.includes('q7'))) ||
          oNameClean.includes(bNameClean) ||
          bNameClean.includes(oNameClean);
      }
    }

    // 2. Tìm kiếm theo mã đơn hoặc tên khách, số điện thoại
    let isSearchMatch = true;
    if (orderSearchQuery.trim() !== '') {
      const q = orderSearchQuery.toLowerCase().trim();
      const orderId = (order.id || '').toLowerCase();
      const customerName = (order.customerName || '').toLowerCase();
      const phone = (order.phone || '').toLowerCase();
      const productName = (order.productName || '').toLowerCase();
      isSearchMatch = orderId.includes(q) || customerName.includes(q) || phone.includes(q) || productName.includes(q);
    }

    // 3. Lọc theo trạng thái
    let isStatusMatch = true;
    if (orderStatusFilter !== 'Tất cả') {
      isStatusMatch = order.status === orderStatusFilter;
    }

    // 4. Lọc theo ngày
    let isDateMatch = true;
    if (orderDateRangeFilter !== 'Tất cả') {
      const parseOrderDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
        return null;
      };

      const oDate = parseOrderDate(order.date);
      if (oDate) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (orderDateRangeFilter === 'Hôm nay') {
          isDateMatch = oDate.toDateString() === now.toDateString();
        } else if (orderDateRangeFilter === '7 ngày') {
          const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
          isDateMatch = oDate >= sevenDaysAgo;
        } else if (orderDateRangeFilter === '30 ngày') {
          const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
          isDateMatch = oDate >= thirtyDaysAgo;
        }
      } else {
        isDateMatch = false;
      }
    }

    return isBranchMatch && isSearchMatch && isStatusMatch && isDateMatch;
  });

  // Load unified settings object or individual legacy fallback settings
  const loadedSettings = (() => {
    let settings: any = {};
    try {
      const settingsStr = localStorage.getItem('remix_settings');
      if (settingsStr) {
        settings = JSON.parse(settingsStr);
      }
    } catch (e) {
      console.error("Failed to parse remix_settings", e);
    }
    return settings;
  })();

  const saveUnifiedSettings = (newSettingsChanges: Record<string, any>) => {
    try {
      let existingSettings: Record<string, any> = {};
      const settingsStr = localStorage.getItem('remix_settings');
      if (settingsStr) {
        existingSettings = JSON.parse(settingsStr);
      }
      const updatedSettings = {
        ...existingSettings,
        ...newSettingsChanges
      };
      localStorage.setItem('remix_settings', JSON.stringify(updatedSettings));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error("Failed to save unified settings to remix_settings", e);
    }
  };

  // Custom states for AI Config (with local storage checking)
  const [temperature, setTemperature] = useState(() => {
    if (loadedSettings.temperature !== undefined) return parseFloat(loadedSettings.temperature);
    const saved = localStorage.getItem('remix_ai_temperature');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [maxTokens, setMaxTokens] = useState(() => {
    if (loadedSettings.maxTokens !== undefined) return parseInt(loadedSettings.maxTokens, 10);
    const saved = localStorage.getItem('remix_ai_max_tokens');
    return saved ? parseInt(saved) : 2048;
  });
  const [systemPrompt, setSystemPrompt] = useState(() => {
    if (loadedSettings.systemPrompt !== undefined) return loadedSettings.systemPrompt;
    const saved = localStorage.getItem('remix_ai_system_prompt');
    return saved || "Bạn là trợ lý bán hàng bằng AI tài ba, nhiệt huyết, hỗ trợ tư vấn các sản phẩm công nghệ chất lượng hàng đầu tại TechShop. Hãy trả lời cực kỳ tinh tế, chu đáo và khôn ngoan để thuyết phục khách hàng đặt mua.";
  });

  const [aiName, setAiName] = useState(() => {
    if (loadedSettings.aiName !== undefined) return loadedSettings.aiName;
    return localStorage.getItem('remix_ai_name') || 'REMIX AI';
  });
  const [aiGreeting, setAiGreeting] = useState(() => {
    if (loadedSettings.aiGreeting !== undefined) return loadedSettings.aiGreeting;
    return localStorage.getItem('remix_ai_greeting') || 'Chào bạn, bạn đang tìm kiếm sản phẩm công nghệ nào để Shop tư vấn cho mình nhé? 😊';
  });
  const [aiMaxProducts, setAiMaxProducts] = useState(() => {
    if (loadedSettings.aiMaxProducts !== undefined) return parseInt(loadedSettings.aiMaxProducts, 10);
    const saved = localStorage.getItem('remix_ai_max_products');
    return saved ? parseInt(saved, 10) : 3;
  });
  const [aiResponseLength, setAiResponseLength] = useState(() => {
    if (loadedSettings.aiResponseLength !== undefined) return parseInt(loadedSettings.aiResponseLength, 10);
    const saved = localStorage.getItem('remix_ai_response_length');
    return saved ? parseInt(saved, 10) : 2; // 1 = Ngắn, 2 = Vừa, 3 = Dài
  });
  const [aiUpsell, setAiUpsell] = useState(() => {
    if (loadedSettings.aiUpsell !== undefined) return loadedSettings.aiUpsell !== 'false' && loadedSettings.aiUpsell !== false;
    const saved = localStorage.getItem('remix_ai_upsell');
    return saved !== 'false';
  });
  const [aiSuggestOtherBranches, setAiSuggestOtherBranches] = useState(() => {
    if (loadedSettings.aiSuggestOtherBranches !== undefined) return loadedSettings.aiSuggestOtherBranches !== 'false' && loadedSettings.aiSuggestOtherBranches !== false;
    const saved = localStorage.getItem('remix_ai_suggest_other_branches');
    return saved !== 'false';
  });

  // Settings sub-tab selection inside Cài đặt
  const [settingsSection, setSettingsSection] = useState<'ai' | 'general' | 'account' | 'data'>('ai');
  const [adminLoyaltyRate, setAdminLoyaltyRateState] = useState(() => getLoyaltyRate());

  // Loyalty admin state controls
  const [loyaltySearch, setLoyaltySearch] = useState('');
  const [loyaltyTierFilter, setLoyaltyTierFilter] = useState<'all' | 'silver' | 'gold' | 'diamond'>('all');
  const [adjustPointsUser, setAdjustPointsUser] = useState<string | null>(null);
  const [adjustPointsValue, setAdjustPointsValue] = useState<number>(100);
  const [adjustPointsReason, setAdjustPointsReason] = useState('Chăm sóc khách hàng');
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newRewardPoints, setNewRewardPoints] = useState<number>(300);
  const [newRewardValue, setNewRewardValue] = useState('');
  const [newRewardCode, setNewRewardCode] = useState('');
  const [redeemHistorySearch, setRedeemHistorySearch] = useState('');

  // Loyalty settings states
  const [moneyPerPoint, setMoneyPerPoint] = useState<number>(() => {
    try {
      const data = localStorage.getItem('remix_loyalty_users');
      if (data) {
        const obj = JSON.parse(data);
        return typeof obj.settings?.moneyPerPoint === 'number' ? obj.settings.moneyPerPoint : 10000;
      }
    } catch {}
    return 10000;
  });

  const [silverMin, setSilverMin] = useState<number>(() => {
    try {
      const data = localStorage.getItem('remix_loyalty_users');
      if (data) {
        const obj = JSON.parse(data);
        return typeof obj.settings?.silverMin === 'number' ? obj.settings.silverMin : 0;
      }
    } catch {}
    return 0;
  });

  const [goldMin, setGoldMin] = useState<number>(() => {
    try {
      const data = localStorage.getItem('remix_loyalty_users');
      if (data) {
        const obj = JSON.parse(data);
        return typeof obj.settings?.goldMin === 'number' ? obj.settings.goldMin : 500;
      }
    } catch {}
    return 500;
  });

  const [diamondMin, setDiamondMin] = useState<number>(() => {
    try {
      const data = localStorage.getItem('remix_loyalty_users');
      if (data) {
        const obj = JSON.parse(data);
        return typeof obj.settings?.diamondMin === 'number' ? obj.settings.diamondMin : 2000;
      }
    } catch {}
    return 2000;
  });

  const [loyaltyToast, setLoyaltyToast] = useState<string | null>(null);

  // General Store Settings state
  const [storeName, setStoreName] = useState(() => {
    if (loadedSettings.storeName !== undefined) return loadedSettings.storeName;
    return localStorage.getItem('remix_store_name') || 'TechShop REMIX';
  });
  const [storePhone, setStorePhone] = useState(() => {
    if (loadedSettings.storePhone !== undefined) return loadedSettings.storePhone;
    return localStorage.getItem('remix_store_phone') || '1900 8198';
  });
  const [storeAddress, setStoreAddress] = useState(() => {
    if (loadedSettings.storeAddress !== undefined) return loadedSettings.storeAddress;
    return localStorage.getItem('remix_store_address') || '99 Đường Láng, Hà Nội';
  });
  const [storeEmail, setStoreEmail] = useState(() => {
    if (loadedSettings.storeEmail !== undefined) return loadedSettings.storeEmail;
    return localStorage.getItem('remix_store_email') || 'support@remix.ai';
  });
  const [storeCurrency, setStoreCurrency] = useState(() => {
    if (loadedSettings.storeCurrency !== undefined) return loadedSettings.storeCurrency;
    return localStorage.getItem('remix_store_currency') || 'VND';
  });
  const [storeLogo, setStoreLogo] = useState(() => {
    if (loadedSettings.storeLogo !== undefined) return loadedSettings.storeLogo;
    return localStorage.getItem('remix_store_logo') || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=60';
  });
  const [storeWebsite, setStoreWebsite] = useState(() => {
    if (loadedSettings.storeWebsite !== undefined) return loadedSettings.storeWebsite;
    return localStorage.getItem('remix_store_website') || 'https://techshop-remix.vn';
  });

  // Admin Account Settings state
  const [adminDisplayName, setAdminDisplayName] = useState(() => {
    if (loadedSettings.adminDisplayName !== undefined) return loadedSettings.adminDisplayName;
    return localStorage.getItem('remix_admin_display_name') || 'Admin Account';
  });
  const [adminUsername, setAdminUsername] = useState(() => {
    if (loadedSettings.adminUsername !== undefined) return loadedSettings.adminUsername;
    return localStorage.getItem('remix_admin_username') || 'admin';
  });
  const [adminPassword, setAdminPassword] = useState(() => {
    if (loadedSettings.adminPassword !== undefined) return loadedSettings.adminPassword;
    return localStorage.getItem('remix_admin_password') || 'admin123';
  });
  const [adminEmail, setAdminEmail] = useState(() => {
    if (loadedSettings.adminEmail !== undefined) return loadedSettings.adminEmail;
    return localStorage.getItem('remix_admin_email') || 'buitienanh279@gmail.com';
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Multi-section save helpers
  const handleSaveAIConfig = () => {
    saveUnifiedSettings({
      temperature,
      maxTokens,
      systemPrompt,
      aiName,
      aiGreeting,
      aiMaxProducts,
      aiResponseLength,
      aiUpsell,
      aiSuggestOtherBranches
    });

    localStorage.setItem('remix_ai_temperature', temperature.toString());
    localStorage.setItem('remix_ai_max_tokens', maxTokens.toString());
    localStorage.setItem('remix_ai_system_prompt', systemPrompt);
    localStorage.setItem('remix_ai_name', aiName);
    localStorage.setItem('remix_ai_greeting', aiGreeting);
    localStorage.setItem('remix_ai_max_products', aiMaxProducts.toString());
    localStorage.setItem('remix_ai_response_length', aiResponseLength.toString());
    localStorage.setItem('remix_ai_upsell', aiUpsell.toString());
    localStorage.setItem('remix_ai_suggest_other_branches', aiSuggestOtherBranches.toString());
    alert('✅ Cấu hình trợ lý AI đã được cập nhật thành công!');
  };

  const handleSaveStoreConfig = () => {
    saveUnifiedSettings({
      storeName,
      storePhone,
      storeAddress,
      storeEmail,
      storeCurrency,
      storeLogo,
      storeWebsite
    });

    localStorage.setItem('remix_store_name', storeName);
    localStorage.setItem('remix_store_phone', storePhone);
    localStorage.setItem('remix_store_address', storeAddress);
    localStorage.setItem('remix_store_email', storeEmail);
    localStorage.setItem('remix_store_currency', storeCurrency);
    localStorage.setItem('remix_store_logo', storeLogo);
    localStorage.setItem('remix_store_website', storeWebsite);
    alert('✅ Thông tin cửa hàng đã được cập nhật thành công!');
  };

  const handleSaveAccountConfig = () => {
    saveUnifiedSettings({
      adminDisplayName,
      adminUsername,
      adminEmail
    });

    localStorage.setItem('remix_admin_display_name', adminDisplayName);
    localStorage.setItem('remix_admin_username', adminUsername);
    localStorage.setItem('remix_admin_email', adminEmail);
    alert('✅ Cập nhật thông tin quản trị viên thành công!');
  };

  const handleUpdatePassword = () => {
    if (!oldPassword) {
      alert('❌ Vui lòng nhập mật khẩu cũ!');
      return;
    }
    if (oldPassword !== adminPassword) {
      alert('❌ Mật khẩu cũ không chính xác!');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      alert('❌ Mật khẩu mới phải từ 6 ký tự trở lên!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('❌ Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }

    setAdminPassword(newPassword);
    saveUnifiedSettings({
      adminPassword: newPassword
    });

    localStorage.setItem('remix_admin_password', newPassword);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('✅ Đổi mật khẩu thành công!');
  };

  const handleExportAllData = () => {
    const dataObj = {
      products: productList,
      branches: branchesList,
      orders: orders
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(dataObj, null, 2)
    );
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `techshop_remix_data_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        if (!parsed || (typeof parsed !== 'object')) {
          alert('❌ Định dạng file JSON không hợp lệ!');
          return;
        }

        let restoredCountProd = 0;
        let restoredCountBranch = 0;
        let restoredCountOrder = 0;

        if (parsed.products && Array.isArray(parsed.products)) {
          setProductList(parsed.products);
          localStorage.setItem('remix_products', JSON.stringify(parsed.products));
          localStorage.setItem('remix_product_list', JSON.stringify(parsed.products));
          restoredCountProd = parsed.products.length;
        }

        if (parsed.branches && Array.isArray(parsed.branches)) {
          setBranchesList(parsed.branches);
          localStorage.setItem('remix_branches', JSON.stringify(parsed.branches));
          restoredCountBranch = parsed.branches.length;
        }

        if (parsed.orders && Array.isArray(parsed.orders)) {
          setOrders(parsed.orders);
          localStorage.setItem('remix_orders', JSON.stringify(parsed.orders));
          localStorage.setItem('remix_placed_orders', JSON.stringify(parsed.orders));
          restoredCountOrder = parsed.orders.length;
        }

        window.dispatchEvent(new Event('storage'));
        alert(`✅ Khôi phục dữ liệu thành công!\n- ${restoredCountProd} sản phẩm\n- ${restoredCountBranch} chi nhánh\n- ${restoredCountOrder} đơn hàng`);
        
        // Reset file input value to allow uploading same file again
        e.target.value = '';
      } catch (err) {
        console.error(err);
        alert('❌ Có lỗi xảy ra khi đọc file dữ liệu! Vui lòng kiểm tra lại định dạng file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAllOrders = () => {
    if (confirm('⚠️ CẢNH BÁO CỰC KỲ QUAN TRỌNG!\nHành động này sẽ XÓA TOÀN BỘ đơn hàng cũ trong hệ thống và không thể khôi phục.\nBạn có thực sự muốn tiếp tục?')) {
      setOrders([]);
      localStorage.setItem('remix_orders', JSON.stringify([]));
      localStorage.setItem('remix_placed_orders', JSON.stringify([]));
      window.dispatchEvent(new Event('storage'));
      alert('✅ Đã xóa toàn bộ đơn hàng thành công!');
    }
  };

  const handleResetToSampleData = () => {
    if (confirm('🔄 Bạn có chắc chắn muốn khôi phục toàn bộ hệ thống về dữ liệu mẫu mặc định?\nTất cả sản phẩm tự tạo, chi nhánh tự thêm và đơn hàng mới sẽ bị ghi đè.')) {
      
      const defaultProducts = [
        { id: 'REMIX-LPT01', name: 'MacBook Air M3 (8GB / 256GB)', category: 'Laptop', price: 27990000, stockQ1: 10, stockQ3: 5, stockQ7: 0, stock: 15, rec: 452, branches: ['Q1', 'Q3'] },
        { id: 'REMIX-PHN15', name: 'iPhone 15 Pro Max (256GB Platinum)', category: 'Điện thoại', price: 34990000, stockQ1: 5, stockQ3: 0, stockQ7: 3, stock: 8, rec: 320, branches: ['Q1', 'Q7'] },
        { id: 'REMIX-EAR05', name: 'Sony WH-1000XM5 Active Noise', category: 'Tai nghe', price: 8490000, stockQ1: 0, stockQ3: 14, stockQ7: 10, stock: 24, rec: 198, branches: ['Q3', 'Q7'] },
        { id: 'REMIX-S24U', name: 'Samsung Galaxy S24 Ultra AI Phone', category: 'Điện thoại', price: 31990000, stockQ1: 4, stockQ3: 4, stockQ7: 4, stock: 12, rec: 285, branches: ['Q1', 'Q3', 'Q7'] },
        { id: 'REMIX-LPT02', name: 'Dell XPS 13 Plus Touchscreen', category: 'Laptop', price: 35990000, stockQ1: 5, stockQ3: 0, stockQ7: 0, stock: 5, rec: 125, branches: ['Q1'] },
        { id: 'REMIX-WCH09', name: 'Apple Watch Series 9 GPS+Cellular', category: 'Đồng hồ', price: 10490000, stockQ1: 0, stockQ3: 19, stockQ7: 0, stock: 19, rec: 140, branches: ['Q3'] },
        { id: 'REMIX-ACC06', name: 'Ốp lưng iPhone 15 Silicone MagSafe', category: 'Phụ kiện', price: 1290000, stockQ1: 20, stockQ3: 15, stockQ7: 15, stock: 50, rec: 98, branches: ['Q1', 'Q3', 'Q7'] },
        { id: 'REMIX-HDY15', name: 'Dyson V15 Detect Cordless Vacuum', category: 'Gia dụng', price: 18900000, stockQ1: 0, stockQ3: 0, stockQ7: 4, stock: 4, rec: 72, branches: ['Q7'] },
        { id: 'REMIX-CAM05', name: 'Canon EOS R5 Mirrorless Camera', category: 'Máy ảnh', price: 89000000, stockQ1: 1, stockQ3: 1, stockQ7: 0, stock: 2, rec: 45, branches: ['Q1', 'Q3'] },
      ];

      const defaultBranches = [
        { id: 'Q1', name: 'Showroom REMIX - Quận 1', address: '85 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', phone: '028.3838.9999', hours: '08:00 - 22:00', status: 'active', manager: 'Nguyễn Anh Tuấn', managerPhone: '0901234567', email: 'q1@remix.vn', hasDelivery: true, deliveryFee: 20000, deliveryArea: 'Quận 1, Quận 3, Quận 4, Quận 5, Quận 10' },
        { id: 'Q3', name: 'Showroom REMIX - Quận 3', address: '12 Tràng Thi, Hoàn Kiếm, Hà Nội', phone: '024.3939.8888', hours: '08:30 - 21:30', status: 'active', manager: 'Trần Quốc Bảo', managerPhone: '0912345678', email: 'q3@remix.vn', hasDelivery: true, deliveryFee: 15000, deliveryArea: 'Hoàn Kiếm, Ba Đình, Đống Đa, Hai Bà Trưng' },
        { id: 'Q7', name: 'Showroom REMIX - Quận 7', address: '145 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', phone: '0236.366.7777', hours: '08:30 - 21:30', status: 'active', manager: 'Phan Minh Trí', managerPhone: '0923456789', email: 'q7@remix.vn', hasDelivery: false, deliveryFee: 0, deliveryArea: 'Hải Châu, Thanh Khê' },
      ];

      const defaultOrders = [
        {
          id: 'REMIX-9582',
          date: '18/05/2026',
          productName: 'Sony WH-CH520',
          price: 1290000,
          status: 'shipping',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
        },
        {
          id: 'REMIX-7421',
          date: '15/05/2026',
          productName: 'Laptop ASUS Vivobook',
          price: 12500000,
          status: 'delivered',
          imageUrl: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=150&q=80',
        },
        {
          id: 'REMIX-2391',
          date: '19/05/2026',
          productName: 'Samsung Galaxy A55',
          price: 8990000,
          status: 'processing',
          imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&q=80',
        }
      ];

      setProductList(defaultProducts);
      setBranchesList(defaultBranches);
      setOrders(defaultOrders);

      localStorage.setItem('remix_products', JSON.stringify(defaultProducts));
      localStorage.setItem('remix_product_list', JSON.stringify(defaultProducts));
      localStorage.setItem('remix_branches', JSON.stringify(defaultBranches));
      localStorage.setItem('remix_orders', JSON.stringify(defaultOrders));
      localStorage.setItem('remix_placed_orders', JSON.stringify(defaultOrders));

      window.dispatchEvent(new Event('storage'));
      alert('✅ Đã reset toàn bộ hệ thống về dữ liệu mẫu mặc định thành công!');
    }
  };

  // Export to CSV Helper Function with UTF-8 BOM support for Vietnamese accented characters
  const handleExportCSV = (orderList: any[], filename = 'bao-cao-don-hang.csv') => {
    // Define CSV header structure
    const headers = [
      'Ma don hang',
      'Khach hang',
      'So dien thoai',
      'Dia chi giao hang',
      'San pham',
      'Gia tri (vnd)',
      'Ngay dat',
      'Chi nhanh',
      'Thanh toan',
      'Trang thai'
    ];

    // Map order list to row values, securing data formatting
    const rows = orderList.map(o => {
      const statusLabel = 
        o.status === 'processing' ? 'Chờ xác nhận' :
        o.status === 'confirmed' ? 'Đã xác nhận' :
        o.status === 'shipping' ? 'Đang giao' :
        o.status === 'delivered' ? 'Đã giao' :
        o.status === 'cancelled' ? 'Đã hủy' : o.status;

      return [
        o.id || '',
        o.customerName || '',
        o.phone || '',
        o.address || '',
        o.productName || '',
        o.price || 0,
        o.date || '',
        o.branch || '',
        o.method || '',
        statusLabel
      ].map(val => {
        const stringified = String(val).replace(/"/g, '""');
        return `"${stringified}"`;
      });
    });

    // Provide UTF-8 BOM so Excel opens with flawless Vietnamese fonts/diacritics
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex w-full h-screen bg-[#F8F9FA] font-sans text-gray-900 overflow-hidden relative pb-[60px] md:pb-0">
      {/* Sidebar trái 240px */}
      <aside className="hidden md:flex w-[240px] bg-[#0C447C] text-white flex-col justify-between shrink-0 h-full">
        <div className="flex flex-col gap-6 p-5">
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/15">
                <Bot size={18} className="text-white animate-pulse" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight leading-none text-white uppercase">REMIX.AI</h2>
                <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-1 block">System</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30 text-[9px] font-black uppercase tracking-wider">
              ADMIN
            </span>
          </div>

          {/* Nav Links */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-3 mb-2">HỆ THỐNG</div>
            
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'overview' 
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <LayoutDashboard size={16} className="ti-layout-dashboard shrink-0" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveSubTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'products' 
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <Package size={16} className="ti-package shrink-0" />
              Sản phẩm
            </button>
            
            <button
              onClick={() => setActiveSubTab('branches')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'branches' 
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <Building size={16} className="ti-building shrink-0" />
              Chi nhánh
            </button>
            
            <button
              onClick={() => setActiveSubTab('orders-management')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'orders-management' || activeSubTab === 'history'
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <ShoppingBag size={16} className="ti-shopping-bag shrink-0" />
              Quản lý Đơn hàng
            </button>
            
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'analytics' 
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <BarChart3 size={16} className="ti-chart-bar shrink-0" />
              Báo cáo
            </button>

            <button
              onClick={() => setActiveSubTab('promotions')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'promotions' 
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <Tag size={16} className="ti-tag shrink-0" />
              Khuyến mãi
            </button>

            <button
              onClick={() => setActiveSubTab('loyalty')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'loyalty' 
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <Coins size={16} className="ti-coin shrink-0" />
              Quản lý Loyalty
            </button>

            <button
              onClick={() => setActiveSubTab('accounts')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'accounts' 
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} className="ti-users shrink-0" />
                <span>Người dùng</span>
              </div>
              {newRegsToday > 0 && (
                <span className="bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full min-w-[16px] text-center shrink-0">
                  {newRegsToday}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('customers')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'customers' 
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} className="text-white shrink-0" />
                <span>Khách hàng</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveSubTab('ai-config')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs transition-all ${
                activeSubTab === 'ai-config' 
                  ? 'bg-white/15 text-white font-bold shadow-inner' 
                  : 'text-white/60 hover:bg-white/8 hover:text-white font-medium'
              }`}
            >
              <Settings size={16} className="ti-settings shrink-0" />
              Cài đặt
            </button>
          </div>
        </div>

        {/* Footer sidebar: avatar + tên admin + nút đăng xuất đỏ nhạt */}
        <div className="p-4 border-t border-white/10 bg-[#0a3867]/60 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">Admin Account</p>
                <p className="text-[10px] text-white/50 truncate">Super Admin</p>
              </div>
            </div>
            
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-300 hover:text-red-200 transition-all cursor-pointer shrink-0"
                title="Đăng xuất"
              >
                <LogOut size={14} className="shrink-0" />
              </button>
            )}
          </div>

          {onSwitchToCustomer && (
            <button
              onClick={onSwitchToCustomer}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold text-white/70 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <ArrowLeft size={11} />
              Quay về trang khách
            </button>
          )}
        </div>
      </aside>

      {/* Main Content: bg #F8F9FA */}
      <div className="flex-grow flex flex-col h-full overflow-hidden bg-[#F8F9FA]">
        {/* Dashboard Header */}
        <header className="shrink-0 z-10 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-[#0C447C] rounded-lg flex items-center justify-center text-white shrink-0">
                <BarChart3 size={15} />
              </div>
              <span className="font-black text-xs md:text-base tracking-tight text-gray-900 uppercase whitespace-nowrap">Hệ thống Quản trị</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase whitespace-nowrap">Live Live</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:block relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm hành vi, khách hàng..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 w-64 outline-none transition-all"
              />
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="flex md:hidden items-center gap-1 py-1 px-2.5 bg-[#FCEBEB] border border-[#F7C1C1] rounded-full text-[10px] font-bold text-[#791F1F] active:scale-90 transition-all cursor-pointer whitespace-nowrap"
                title="Đăng xuất"
              >
                <LogOut size={11} className="shrink-0" />
                <span>Đăng xuất</span>
              </button>
            )}
            <button className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-xl relative shrink-0">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white animate-ping" />
            </button>
            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-100 shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-black text-gray-900">Admin Account</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors overflow-hidden border border-gray-200 shrink-0">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Conditional Tab Rendering */}
        {activeSubTab === 'overview' && (
          <div className="flex flex-grow overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 p-8 space-y-8 overflow-y-auto">
              {/* Welcome Section */}
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">Chào buổi sáng, Admin!</h1>
                  <p className="text-gray-500 text-xs mt-1">Dưới đây là hiệu suất hệ thống AI tư vấn trong 24h qua.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleExportCSV(enrichedAllOrders, 'bao-cao-tong-quan-don-hang.csv')}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Download size={14} className="text-gray-500" />
                    Xuất báo cáo
                  </button>
                  <button className="px-4 py-2 bg-[#0C447C] text-white rounded-xl text-xs font-bold hover:bg-[#0a3867] transition-colors shadow-lg shadow-[#0C447C]/10">
                    Làm mới dữ liệu
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {METRICS.map((metric, idx) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-[20px] bg-white border-[0.5px] border-gray-200/80 rounded-[12px] shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{metric.label}</p>
                      <div className={`p-2 rounded-xl border ${metric.iconColorClass}`}>
                        <metric.icon size={20} className={metric.className} />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <h3 className={`text-[32px] font-black leading-none tracking-tight ${metric.colorClass}`}>
                        {metric.value}
                      </h3>
                      <span className="text-[10px] font-black text-gray-400 uppercase px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">
                        {metric.change}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Daily Sales Revenue Line Chart Component */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                  <div>
                    <h2 className="font-bold text-sm text-gray-900 tracking-tight flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#185FA5]" />
                      Biểu đồ Xu hướng Doanh thu Bán hàng Hàng ngày
                    </h2>
                    <p className="text-gray-400 text-[10px] mt-0.5 font-bold">Thống kê doanh số bán thực tế dựa trên các hóa đơn không bao gồm đơn hủy</p>
                  </div>
                  <div className="bg-[#185FA5]/5 border border-[#185FA5]/10 rounded-full px-3 py-1 text-[10px] font-black text-[#185FA5] tracking-tight uppercase select-none">
                    Real-time Store Performance
                  </div>
                </div>
                <div className="mt-2">
                  <DailySalesRevenueChart orders={enrichedAllOrders} />
                </div>
              </div>

              {/* Bảng Đơn Hàng Gần Đây */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-sm text-gray-900">Đơn hàng gần đây</h2>
                    <p className="text-gray-400 text-[10px] mt-0.5">5 đơn hàng mới nhất từ hệ thống tư vấn & mua sắm.</p>
                  </div>
                  <button 
                    onClick={() => setActiveSubTab('orders-management')}
                    className="text-[10px] font-black text-[#0C447C] hover:underline uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn</th>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</th>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm</th>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền</th>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chi nhánh</th>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentEnrichedOrders.map((order: any, idx: number) => (
                        <tr key={order.id + '-' + idx} className="hover:bg-gray-50/30 transition-colors group text-xs text-gray-700">
                          <td className="px-6 py-3.5 font-mono font-bold text-[#0C447C]">{order.id}</td>
                          <td className="px-6 py-3.5 font-bold text-gray-950">{order.customerName}</td>
                          <td className="px-6 py-3.5 text-gray-600 font-medium max-w-[150px] truncate" title={order.productName}>
                            {order.productName}
                          </td>
                          <td className="px-6 py-3.5 font-black text-gray-900">
                            {order.price.toLocaleString('vi-VN')}đ
                          </td>
                          <td className="px-6 py-3.5 text-gray-500 font-medium">{order.branch}</td>
                          <td className="px-6 py-3.5">
                            <span className={getStatusBadgeClass(order.status)}>
                              {getStatusLabelText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-400 font-medium">{order.time}</td>
                        </tr>
                      ))}
                      {recentEnrichedOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-xs font-semibold">
                            Chưa có đơn hàng nào được ghi nhận.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Session History Table */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-sm text-gray-900">Lịch sử phiên tư vấn mới nhất</h2>
                  <button 
                    onClick={() => setActiveSubTab('history')}
                    className="text-[10px] font-black text-[#0C447C] hover:underline uppercase tracking-wider"
                  >
                    Xem toàn bộ
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Câu hỏi chính</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm gợi ý</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Kết quả</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {SESSIONS.slice(0, 4).map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-6 py-3.5 text-xs text-gray-500 font-medium">{session.time}</td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#0C447C]/10 flex items-center justify-center text-[#0C447C] font-black text-xs uppercase">
                                {session.customer[0]}
                              </div>
                              <span className="text-xs font-bold text-gray-900">{session.customer}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-gray-600 max-w-xs truncate">{session.question}</td>
                          <td className="px-6 py-3.5 text-xs text-gray-600 font-medium">{session.products}</td>
                          <td className="px-6 py-3.5">
                            <div className="flex justify-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight border ${STATUS_COLORS[session.status as keyof typeof STATUS_COLORS]}`}>
                                {session.statusLabel}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button className="p-1.5 text-gray-400 hover:text-[#0C447C] hover:bg-gray-50 rounded-lg transition-colors">
                              <MessageSquare size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>

            {/* Right Sidebar - AI Logs & API Status */}
            <aside className="hidden lg:flex w-[280px] bg-white border-l border-gray-100 flex-col shrink-0 overflow-y-auto">
              {/* API Status Section */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tình trạng API</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">Độ trễ API</span>
                    <span className="text-xs font-black text-gray-900">{API_STATS.latency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">Token đã dùng</span>
                    <span className="text-xs font-black text-gray-900">{API_STATS.tokens}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">Quota Gemini</span>
                      <span className="text-[10px] font-black text-blue-600">{API_STATS.quota}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0C447C]" style={{ width: API_STATS.quota }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    API Status: {API_STATS.status}
                  </div>
                </div>
              </div>

              {/* Real-time AI logs */}
              <div className="p-6 flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time AI Log</h3>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-[#0C447C] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1 h-1 bg-[#0C447C] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-1 bg-[#0C447C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
                
                <div className="space-y-5">
                  {AI_LOGS.map((log) => (
                    <div key={log.id} className="space-y-3 relative pb-5 border-b border-dashed border-gray-100 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-medium text-gray-400">{log.time}</span>
                        <span className="text-[8px] font-black text-[#0C447C] uppercase bg-blue-50 px-1.5 py-0.5 rounded">Request</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-tight flex items-center gap-1">
                            <Zap size={10} />
                            THINKING
                          </span>
                          <p className="text-[10px] font-mono text-gray-500 leading-relaxed bg-gray-50 p-2 border border-gray-100 rounded-lg">
                            {log.thinking}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tight flex items-center gap-1">
                            <Bot size={10} />
                            RESPONSE
                          </span>
                          <p className="text-[10px] font-mono text-gray-700 leading-relaxed bg-emerald-50/20 p-2 border border-emerald-100/50 rounded-lg">
                            {log.response}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 mt-auto">
                <button 
                  onClick={() => setActiveSubTab('ai-config')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-2xl transition-colors border border-gray-100"
                >
                  <Settings size={14} />
                  Cấu hình Gemini
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Analytics & Reports tab */}
        {activeSubTab === 'analytics' && (
          <main className="flex-grow p-8 space-y-6 overflow-y-auto bg-slate-50/50">
            {/* Top header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <BarChart3 className="text-[#185FA5]" size={24} />
                  Trung Tâm Phân Tích & Báo Cáo
                </h1>
                <p className="text-gray-500 text-xs mt-1">Truy xuất dữ liệu bán hàng tại các chi nhánh và hiệu năng vận hành hệ thống Remix.AI.</p>
              </div>

              {/* Internal Tab Controls with modern pill design */}
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setReportInnerTab('sales')}
                  className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all border-0 cursor-pointer ${
                    reportInnerTab === 'sales'
                      ? 'bg-white text-[#0C447C] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 bg-transparent'
                  }`}
                >
                  📊 Báo cáo Doanh thu Showroom
                </button>
                <button
                  type="button"
                  onClick={() => setReportInnerTab('ai')}
                  className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all border-0 cursor-pointer ${
                    reportInnerTab === 'ai'
                      ? 'bg-white text-[#0C447C] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 bg-transparent'
                  }`}
                >
                  🤖 Hiệu suất Tư vấn AI (Gốc)
                </button>
              </div>
            </div>

            {/* TAB 1: BÁO CÁO DOANH THU & KINH DOANH (REAL LIVE METRICS) */}
            {reportInnerTab === 'sales' && (() => {
              const parseOrderDate = (dateStr: string): Date | null => {
                if (!dateStr) return null;
                if (dateStr === 'Hôm qua') {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  return d;
                }
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                  const day = parseInt(parts[0], 10);
                  const month = parseInt(parts[1], 10) - 1;
                  const year = parseInt(parts[2], 10);
                  return new Date(year, month, day);
                }
                return null;
              };

              const reportFilteredOrders = enrichedAllOrders.filter((order: any) => {
                // 1. Lọc theo chi nhánh
                let isBranchMatch = true;
                if (reportBranch !== 'Tất cả') {
                  const targetBranch = branchesList.find((b: any) => b.id === reportBranch || b.name === reportBranch);
                  if (targetBranch) {
                    const bNameClean = targetBranch.name.toLowerCase().replace('showroom', '').replace('remix', '').trim();
                    const oNameClean = (order.branch || '').toLowerCase().replace('showroom', '').replace('remix', '').trim();
                    isBranchMatch = oNameClean.includes(bNameClean) || bNameClean.includes(oNameClean);
                  }
                }

                // 2. Lọc theo thời gian
                let isDateMatch = true;
                const oDate = parseOrderDate(order.date);
                if (oDate) {
                  const now = new Date();
                  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  
                  if (reportPeriod === 'Hôm nay') {
                    isDateMatch = oDate.toDateString() === now.toDateString();
                  } else if (reportPeriod === '7 ngày') {
                    const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1050); // standard timestamp difference
                    isDateMatch = oDate >= sevenDaysAgo;
                  } else if (reportPeriod === 'Tháng này') {
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    isDateMatch = oDate >= firstDayOfMonth;
                  } else if (reportPeriod === 'Tùy chọn') {
                    const startPick = new Date(reportStartDate);
                    const endPick = new Date(reportEndDate);
                    startPick.setHours(0, 0, 0, 0);
                    endPick.setHours(23, 59, 59, 999);
                    isDateMatch = oDate >= startPick && oDate <= endPick;
                  }
                } else {
                  isDateMatch = false;
                }
                return isBranchMatch && isDateMatch;
              });

              // Tính toán các chỉ số
              const totalRevenue = reportFilteredOrders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.price : sum, 0);
              const totalOrders = reportFilteredOrders.length;
              const completedOrders = reportFilteredOrders.filter(o => o.status === 'delivered').length;
              const shippingOrders = reportFilteredOrders.filter(o => o.status === 'shipping').length;
              const confirmedOrders = reportFilteredOrders.filter(o => o.status === 'confirmed').length;
              const processingOrders = reportFilteredOrders.filter(o => o.status === 'processing').length;
              const cancelledOrders = reportFilteredOrders.filter(o => o.status === 'cancelled').length;
              
              const totalSuccessRevenue = totalRevenue;
              const lostRevenue = reportFilteredOrders.reduce((sum, o) => o.status === 'cancelled' ? sum + o.price : sum, 0);

              // Tính toán Kỳ trước (Prior period) cho so sánh
              const getPeriodRange = (period: string, startD: string, endD: string) => {
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                let currentStart = new Date();
                let currentEnd = new Date();
                let prevStart = new Date();
                let prevEnd = new Date();
                
                if (period === 'Hôm nay') {
                  currentStart = todayStart;
                  currentEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
                  
                  prevStart = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
                  prevEnd = new Date(currentStart.getTime() - 1);
                } else if (period === '7 ngày') {
                  currentStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
                  currentEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
                  
                  prevStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
                  prevEnd = new Date(currentStart.getTime() - 1);
                } else if (period === 'Tháng này') {
                  currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
                  currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                  
                  prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                  prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                } else if (period === 'Tùy chọn') {
                  currentStart = new Date(startD);
                  currentStart.setHours(0,0,0,0);
                  currentEnd = new Date(endD);
                  currentEnd.setHours(23,59,59,999);
                  
                  const diffMs = currentEnd.getTime() - currentStart.getTime();
                  prevStart = new Date(currentStart.getTime() - diffMs - 1);
                  prevEnd = new Date(currentStart.getTime() - 1);
                }
                return { prevStart, prevEnd };
              };

              const { prevStart, prevEnd } = getPeriodRange(reportPeriod, reportStartDate, reportEndDate);

              const prevPeriodOrders = enrichedAllOrders.filter((order: any) => {
                let isBranchMatch = true;
                if (reportBranch !== 'Tất cả') {
                  const targetBranch = branchesList.find((b: any) => b.id === reportBranch || b.name === reportBranch);
                  if (targetBranch) {
                    const bNameClean = targetBranch.name.toLowerCase().replace('showroom', '').replace('remix', '').trim();
                    const oNameClean = (order.branch || '').toLowerCase().replace('showroom', '').replace('remix', '').trim();
                    isBranchMatch = oNameClean.includes(bNameClean) || bNameClean.includes(oNameClean);
                  }
                }
                const oDate = parseOrderDate(order.date);
                if (oDate) {
                  return isBranchMatch && oDate >= prevStart && oDate <= prevEnd;
                }
                return false;
              });

              const prevRevenue = prevPeriodOrders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.price : sum, 0);
              const prevTotalOrders = prevPeriodOrders.length;
              const prevCancelledOrders = prevPeriodOrders.filter(o => o.status === 'cancelled').length;

              // Tỉ lệ % thay đổi doanh số thực tế
              const revChangePercent = prevRevenue > 0 
                ? ((totalSuccessRevenue - prevRevenue) / prevRevenue) * 100 
                : (totalSuccessRevenue > 0 ? 100 : 0);

              // Tỷ lệ hoàn thành đơn hàng (delivered / totalOrders)
              const completionRate = totalOrders > 0 
                ? Math.round((completedOrders / totalOrders) * 100) 
                : 0;

              // Giá trị đơn trung bình (AOV = totalSuccessRevenue / totalOrders)
              const averageOrderValue = totalOrders > 0 
                ? Math.round(totalSuccessRevenue / totalOrders) 
                : 0;

              const prevAOV = prevTotalOrders > 0 
                ? Math.round(prevRevenue / prevTotalOrders) 
                : 0;

              const aovChangePercent = prevAOV > 0 
                ? ((averageOrderValue - prevAOV) / prevAOV) * 100 
                : (averageOrderValue > 0 ? 100 : 0);

              // Tỷ lệ đơn bị hủy (% tổng)
              const cancellationRate = totalOrders > 0 
                ? Math.round((cancelledOrders / totalOrders) * 100) 
                : 0;

              const prevCancellationRate = prevTotalOrders > 0 
                ? Math.round((prevCancelledOrders / prevTotalOrders) * 100) 
                : 0;

              const cancellationRateChange = cancellationRate - prevCancellationRate;

              // Gom nhóm theo chi nhánh
              const branchRevenueData: { [key: string]: number } = {};
              reportFilteredOrders.forEach(o => {
                if (o.status !== 'cancelled') {
                  branchRevenueData[o.branch] = (branchRevenueData[o.branch] || 0) + o.price;
                }
              });

              // Đảm bảo các chi nhánh trong branchesList đều xuất hiện
              branchesList.forEach(b => {
                if (!branchRevenueData[b.name]) {
                  const key = Object.keys(branchRevenueData).find(k => k.toLowerCase().includes(b.name.toLowerCase()) || b.name.toLowerCase().includes(k.toLowerCase()));
                  if (!key) {
                    branchRevenueData[b.name] = 0;
                  }
                }
              });

              // Thống kê sản phẩm bán chạy nhất trong kỳ báo cáo
              const productSellers: { [key: string]: { count: number, total: number, image?: string } } = {};
              reportFilteredOrders.forEach(o => {
                if (o.status !== 'cancelled') {
                  if (!productSellers[o.productName]) {
                    productSellers[o.productName] = { count: 0, total: 0, image: o.imageUrl };
                  }
                  productSellers[o.productName].count += 1;
                  productSellers[o.productName].total += o.price;
                }
              });
              const bestSellersList = Object.entries(productSellers)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.total - a.total);

              // Thống kê doanh thu theo ngày trong kỳ báo cáo để vẽ biểu đồ
              const salesByDateMap: { [key: string]: number } = {};
              reportFilteredOrders.forEach(o => {
                if (o.status !== 'cancelled') {
                  salesByDateMap[o.date] = (salesByDateMap[o.date] || 0) + o.price;
                }
              });
              const salesTrendList = Object.entries(salesByDateMap)
                .map(([date, amount]) => ({ date, amount }))
                .sort((a, b) => {
                  const dateA = parseOrderDate(a.date);
                  const dateB = parseOrderDate(b.date);
                  if (!dateA || !dateB) return 0;
                  return dateA.getTime() - dateB.getTime();
                });

              return (
                <div className="space-y-6">
                  {/* FILTER BAR SECTION */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      {/* Chọn chi nhánh */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Chọn chi nhánh</label>
                        <select
                          value={reportBranch}
                          onChange={(e) => setReportBranch(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold font-sans outline-none focus:bg-white focus:border-[#185FA5] cursor-pointer transition-all"
                        >
                          <option value="Tất cả">Tất cả chi nhánh</option>
                          {branchesList.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Chọn kỳ báo cáo */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Chọn kỳ báo cáo</label>
                        <select
                          value={reportPeriod}
                          onChange={(e) => setReportPeriod(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold font-sans outline-none focus:bg-white focus:border-[#185FA5] cursor-pointer transition-all"
                        >
                          <option value="Hôm nay">Hôm nay ({new Date().toLocaleDateString('vi-VN')})</option>
                          <option value="7 ngày">7 ngày vừa qua</option>
                          <option value="Tháng này">Tháng này (Tháng {new Date().getMonth() + 1})</option>
                          <option value="Tùy chọn">Tự thiết lập khoảng ngày 📅</option>
                        </select>
                      </div>

                      {/* Start Date choice (Conditional rendering) */}
                      {reportPeriod === 'Tùy chọn' && (
                        <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-300">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Từ ngày</label>
                          <input
                            type="date"
                            value={reportStartDate}
                            onChange={(e) => setReportStartDate(e.target.value)}
                            className="w-full px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold font-sans outline-none focus:bg-white focus:border-[#185FA5] cursor-pointer transition-all"
                          />
                        </div>
                      )}

                      {/* End Date choice (Conditional rendering) */}
                      {reportPeriod === 'Tùy chọn' && (
                        <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-300">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Đến ngày</label>
                          <input
                            type="date"
                            value={reportEndDate}
                            onChange={(e) => setReportEndDate(e.target.value)}
                            className="w-full px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold font-sans outline-none focus:bg-white focus:border-[#185FA5] cursor-pointer transition-all"
                          />
                        </div>
                      )}

                      {/* Premium Export CSV Action Row with dynamic counts */}
                      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full pt-4 border-t border-gray-100 col-span-full mt-2`}>
                        <div className="text-gray-400 font-bold text-[10.5px] font-sans flex items-center gap-1.5 matches-feedback">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Bộ lọc đang chọn tìm thấy <span className="text-[#185FA5] font-black">{reportFilteredOrders.length}</span> đơn hàng phù hợp trong thời gian báo cáo.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const cleanBranchName = reportBranch.replace(/\s+/g, '-');
                            const cleanPeriod = reportPeriod.replace(/\s+/g, '-');
                            handleExportCSV(reportFilteredOrders, `bao-cao-doanh-thu-${cleanBranchName}-${cleanPeriod}.csv`);
                          }}
                          className="px-4 py-2 bg-[#185FA5] hover:bg-[#0c447c] text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer select-none"
                        >
                          <Download size={14} className="text-white" />
                          Xuất báo cáo CSV
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY CARDS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Card Doanh thu thực nhận */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-wider block">1. Tổng Doanh Thu</span>
                        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-xs">$</div>
                      </div>
                      <div>
                        <span className="text-2xl font-black text-slate-900 block leading-tight">{totalSuccessRevenue.toLocaleString('vi-VN')}đ</span>
                        <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[11px] font-bold">
                          {revChangePercent >= 0 ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                              ▲ {revChangePercent.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md shrink-0">
                              ▼ {Math.abs(revChangePercent).toFixed(1)}%
                            </span>
                          )}
                          <span className="text-gray-400 font-medium">so với kỳ trước ({prevRevenue.toLocaleString('vi-VN')}đ)</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Tổng số lượng đơn */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wider block">2. Tổng Đơn Hàng</span>
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs">📦</div>
                      </div>
                      <div>
                        <span className="text-2xl font-black text-slate-900 block leading-tight">{totalOrders} đơn</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] font-bold">
                          <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md shrink-0">
                            🟢 {completionRate}% hoàn thành
                          </span>
                          <span className="text-gray-400 font-medium">Đã giao {completedOrders} / {totalOrders}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Giá trị đơn trung bình */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg uppercase tracking-wider block">3. Giá Trị Đơn Trung Bình</span>
                        <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center font-bold text-xs">💎</div>
                      </div>
                      <div>
                        <span className="text-2xl font-black text-slate-900 block leading-tight">{averageOrderValue.toLocaleString('vi-VN')}đ</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] font-bold">
                          {aovChangePercent >= 0 ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                              ▲ {aovChangePercent.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md shrink-0">
                              ▼ {Math.abs(aovChangePercent).toFixed(1)}%
                            </span>
                          )}
                          <span className="text-gray-400 font-medium">Kỳ trước: {prevAOV.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Đơn bị hủy */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg uppercase tracking-wider block">4. Đơn Bị Hủy</span>
                        <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-xs">✕</div>
                      </div>
                      <div>
                        <span className="text-2xl font-black text-rose-600 block leading-tight">{cancelledOrders} đơn</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] font-bold">
                          <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md shrink-0">
                            🔴 {cancellationRate}% tổng số
                          </span>
                          <span className="text-gray-400 font-medium">Thất thoát {lostRevenue.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM SECTIONS: VISUAL CHART & TABLES */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* BẢNG TOP SẢN PHẨM BÁN CHẠY (lg:col-span-2) */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                      <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Bảng Top Sản Phẩm Bán Chạy</h3>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Top 5 sản phẩm đạt sản lượng và tổng thu tốt nhất trong kỳ báo cáo đã chọn</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-700 min-w-[555px]">
                          <thead>
                            <tr className="border-b border-gray-150 text-gray-400 font-black uppercase text-[9px] tracking-wider">
                              <th className="py-3 text-center w-14">Hạng</th>
                              <th className="py-3 pl-2">Tên SP</th>
                              <th className="py-3 w-28">Danh mục</th>
                              <th className="py-3 text-center w-20">Đã bán</th>
                              <th className="py-3 text-right pr-6 w-32">Doanh thu</th>
                              <th className="py-3 text-center w-28">Tồn kho còn</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150/50">
                            {bestSellersList.slice(0, 5).map((item, index) => {
                              const matchProd = productList.find(p => p.name.toLowerCase() === item.name.toLowerCase() || p.id === item.name);
                              const category = matchProd ? matchProd.category : 'Thiết bị';
                              const stock = matchProd ? matchProd.stock : 0;
                              
                              let badgeClass = 'bg-gray-100 text-gray-500 w-5 h-5 text-[10px]';
                              let badgeIcon = (index + 1).toString();
                              if (index === 0) {
                                badgeClass = 'bg-yellow-50 text-yellow-800 border border-yellow-250 w-6.5 h-6.5 text-[11px]';
                                badgeIcon = '🥇';
                              } else if (index === 1) {
                                badgeClass = 'bg-slate-150 text-slate-800 border border-slate-350 w-6.5 h-6.5 text-[11px]';
                                badgeIcon = '🥈';
                              } else if (index === 2) {
                                badgeClass = 'bg-[#FFF2E6] text-orange-900 border border-orange-200 w-6.5 h-6.5 text-[11px]';
                                badgeIcon = '🥉';
                              }

                              return (
                                <tr key={item.name} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="py-3 text-center">
                                    <span className={`inline-flex items-center justify-center rounded-full font-black ${badgeClass}`}>
                                      {badgeIcon}
                                    </span>
                                  </td>
                                  <td className="py-3 pl-2">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                        {item.image ? (
                                          <img src={item.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Product" />
                                        ) : (
                                          <span className="text-[9px] font-bold text-gray-300">N/A</span>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs font-bold text-gray-900 block truncate max-w-[170px] sm:max-w-[210px]" title={item.name}>
                                          {item.name}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 text-[#185FA5] uppercase tracking-wider shrink-0">
                                      {category}
                                    </span>
                                  </td>
                                  <td className="py-3 text-center font-extrabold text-slate-800">
                                    {item.count} <span className="text-[10px] text-gray-400 font-normal">đơn</span>
                                  </td>
                                  <td className="py-3 text-right font-black text-gray-950 pr-6">
                                    {item.total.toLocaleString('vi-VN')}đ
                                  </td>
                                  <td className="py-3 text-center">
                                    {stock <= 5 ? (
                                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 inline-block">
                                        Còn {stock} sp
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 inline-block">
                                        Còn {stock} sp
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}

                            {bestSellersList.length === 0 && (
                              <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-400 text-xs italic">
                                  Không tìm thấy dữ liệu mua sắm hàng hóa trong kỳ.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* BIỂU ĐỒ DOANH THU CHI NHÁNH & TIẾN ĐỘ QUY TRÌNH (lg:col-span-1) */}
                    <div className="space-y-6">
                      {/* Doanh thu theo showrooms */}
                      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                        <div>
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Doanh thu theo showrooms</h3>
                          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Xếp hạng hiệu quả kinh doanh các chi nhánh hiện có</p>
                        </div>

                        <div className="space-y-4 pt-1">
                          {Object.entries(branchRevenueData)
                            .sort((a,b) => b[1] - a[1])
                            .map(([name, val]) => {
                              const totalSum = Object.values(branchRevenueData).reduce((s,v)=>s+v, 0);
                              const percent = totalSum > 0 ? (val / totalSum) * 105 / 1.05 : 0;
                              return (
                                <div key={name} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-extrabold text-gray-800 leading-normal">{name}</span>
                                    <span className="font-bold text-gray-900 bg-slate-50 px-2 py-0.5 rounded-lg">{val.toLocaleString('vi-VN')}đ</span>
                                  </div>
                                  <div className="relative w-full h-2.5 bg-gray-50 rounded-full border border-gray-100 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full bg-[#185FA5] transition-all duration-500"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-[9px] text-gray-400 font-semibold">
                                    <span>Chi nhánh Showroom</span>
                                    <span>Chiếm {Math.round(percent)}% tổng số</span>
                                  </div>
                                </div>
                              );
                            })}
                          
                          {Object.keys(branchRevenueData).length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-xs italic">
                              Chưa ghi nhận dữ liệu bán hàng tại các chi nhánh.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tiến độ quy trình đơn */}
                      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div>
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tiến độ quy trình đơn</h3>
                          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Số lượng hóa đơn nằm trong mỗi giai đoạn vận chuyển</p>
                        </div>

                        <div className="space-y-2.5 pt-1">
                          <div className="flex justify-between items-center bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                              <span className="text-xs font-extrabold text-amber-800">Chờ xác nhận</span>
                            </div>
                            <span className="font-extrabold text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg">{processingOrders} đơn</span>
                          </div>

                          <div className="flex justify-between items-center bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span>
                              <span className="text-xs font-extrabold text-blue-800">Đã xác nhận</span>
                            </div>
                            <span className="font-extrabold text-xs text-blue-900 bg-blue-100 px-2 py-0.5 rounded-lg">{confirmedOrders} đơn</span>
                          </div>

                          <div className="flex justify-between items-center bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/50">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block"></span>
                              <span className="text-xs font-extrabold text-purple-800">Đang giao</span>
                            </div>
                            <span className="font-extrabold text-xs text-purple-900 bg-purple-100 px-2 py-0.5 rounded-lg">{shippingOrders} đơn</span>
                          </div>

                          <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                              <span className="text-xs font-extrabold text-emerald-800">Đã giao</span>
                            </div>
                            <span className="font-extrabold text-xs text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg">{completedOrders} đơn</span>
                          </div>

                          <div className="flex justify-between items-center bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
                              <span className="text-xs font-extrabold text-rose-800">Đã hủy bỏ</span>
                            </div>
                            <span className="font-extrabold text-xs text-rose-900 bg-rose-100 px-2 py-0.5 rounded-lg">{cancelledOrders} đơn</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BIỂU ĐỒ DOANH THU CHART.JS */}
                  <div className="bg-white border border-gray-100 rounded-[12px] p-[20px] shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <h2 className="font-bold text-sm text-gray-900 font-sans tracking-tight">Biểu đồ xu hướng Doanh thu Bán hàng</h2>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-bold">Doanh số bán thực tế dựa trên các hóa đơn không bao gồm đơn hủy</p>
                      </div>

                      <div className="text-[10px] text-gray-400 font-extrabold font-sans">
                        Tổng cộng: <span className="text-[#185FA5] text-xs font-black">{salesTrendList.length} ngày</span> phát sinh đơn
                      </div>
                    </div>

                    <SalesChart
                      uniqueDates={salesTrendList.map(item => item.date)}
                      reportFilteredOrders={reportFilteredOrders}
                      branchesList={branchesList}
                      reportBranch={reportBranch}
                    />
                  </div>

                  {/* THỐNG KÊ AI TƯ VẤN (PHẦN DƯỚI CÙNG) */}
                  <AIConsultStats productList={productList} />
                </div>
              );
            })()}

            {/* TAB 2: HIỆU SUẤT TRỢ LÝ AI (OLD SIMULATED CODE EXACTLY PRESERVED) */}
            {reportInnerTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">Thống kê Hiệu suất & Tương tác Trợ lý AI</h1>
                  <p className="text-gray-500 text-xs mt-1">Các chỉ số đo lường tải trọng, độ hài lòng (CSAT) và tỷ lệ chuyển đổi đơn hàng từ chatbot tư vấn tự động.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tải trọng & Khả dụng</h3>
                    <div className="relative pt-2">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Mức độ tải hôm nay</span>
                        <span className="text-emerald-600">Ổn định (24%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '24%' }} />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-gray-500">Giới hạn yêu cầu / giây</span>
                      <span className="font-bold">15 RPS</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Tỷ lệ thành công cuộc gọi</span>
                      <span className="font-bold text-emerald-600">99.98%</span>
                    </div>
                  </div>

                  <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Chỉ số chuyển đổi (CR)</h3>
                    <div className="relative pt-2">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Khách mua qua AI tư vấn</span>
                        <span className="text-[#0C447C]">8.2%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0C447C]" style={{ width: '45%' }} />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-gray-500">{"Lượt Chat -> Giỏ hàng"}</span>
                      <span className="font-bold">32.4%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{"Giỏ hàng -> Thanh toán"}</span>
                      <span className="font-bold text-emerald-600">25.3%</span>
                    </div>
                  </div>

                  <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Đánh giá độ thỏa mãn</h3>
                    <div className="relative pt-2">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>CSAT Score</span>
                        <span className="text-yellow-600">4.8 / 5.0 ⭐</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-gray-500">Phản hồi tích cực</span>
                      <span className="font-bold text-[#0C447C]">94.6%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Cần cải thiện (logs lỗi)</span>
                      <span className="font-bold text-purple-600">1.2%</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Chart visualization using SVG */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h2 className="font-bold text-sm text-gray-900 mb-6">Tần suất người dùng tương tác trong ngày (Giờ)</h2>
                  <div className="h-[220px] w-full flex items-end gap-3 px-2 border-b border-gray-100">
                    {[10, 20, 15, 35, 55, 40, 75, 90, 85, 60, 45, 30].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {val * 12}
                        </div>
                        <div 
                          className="w-full bg-[#0C447C]/10 group-hover:bg-[#0C447C] rounded-t-md transition-all duration-300"
                          style={{ height: `${val * 1.8}px` }}
                        />
                        <div className="text-[10px] text-gray-400 font-medium">
                          {idx * 2}h
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* History tab */}
        {activeSubTab === 'history' && (
          <main className="flex-grow p-8 space-y-6 overflow-y-auto">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Chi tiết lịch sử phiên tư vấn</h1>
              <p className="text-gray-500 text-xs mt-1">Danh sách đầy đủ các cuộc hội thoại được AI tư vấn, giám sát bởi Admin.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">Tất cả {SESSIONS.length} phiên</span>
                  <span className="px-3 py-1 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-600">2 Mua hàng</span>
                </div>
                <div className="text-xs text-gray-400 font-medium">Tự động cập nhật sau mỗi 30 giây</div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chủ đề tư vấn</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm khuyến nghị</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái mua</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SESSIONS.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-4 text-xs text-gray-500 font-medium">{session.time}</td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#0C447C]/10 flex items-center justify-center text-[#0C447C] font-black text-xs uppercase">
                              {session.customer[0]}
                            </div>
                            <span className="text-xs font-bold text-gray-900">{session.customer}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-xs text-gray-600 max-w-sm font-medium">{session.question}</td>
                        <td className="px-8 py-4 text-xs text-gray-600 font-mono">{session.products}</td>
                        <td className="px-8 py-4">
                          <div className="flex justify-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight border ${STATUS_COLORS[session.status as keyof typeof STATUS_COLORS]}`}>
                              {session.statusLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button className="px-3 py-1.5 text-xs font-bold text-[#0C447C] bg-[#0C447C]/5 hover:bg-[#0C447C]/10 rounded-xl transition-all">
                            Xem hội thoại
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* Products Tab */}
        {activeSubTab === 'products' && (
          <main className="flex-grow p-8 space-y-6 overflow-y-auto">
            {/* Header section with required specifications */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  Quản lý sản phẩm
                  <span className="text-[11px] font-black text-[#1d4ed8] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {productList.length} sản phẩm
                  </span>
                </h1>
                <p className="text-gray-500 text-xs mt-1">Danh sách sản phẩm thuộc hệ thống mà trợ lý AI liên kết để tư vấn khách hàng.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search input: tìm theo tên */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] outline-none w-48 transition-all"
                  />
                </div>

                {/* Dropdown lọc chi nhánh */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Chi nhánh:</span>
                  <select
                    value={productBranchFilter}
                    onChange={(e) => setProductBranchFilter(e.target.value)}
                    className="text-xs bg-transparent border-none outline-none font-bold text-gray-700 cursor-pointer p-0 focus:ring-0"
                  >
                    <option value="Tất cả">Tất cả</option>
                    <option value="Q1">Q1</option>
                    <option value="Q3">Q3</option>
                    <option value="Q7">Q7</option>
                  </select>
                </div>

                {/* Nút "+ Thêm sản phẩm" bg #185FA5 */}
                <button 
                  onClick={() => {
                    const latestBranches = getBranchesFromStorage().filter((b: any) => b.status === 'active' || b.active !== false);
                    const branchIds = latestBranches.map((b: any) => b.id);
                    setNewProdSelectedBranches(branchIds);
                    const initialStocks: Record<string, string> = {};
                    branchIds.forEach((id: string) => {
                      initialStocks[id] = '0';
                    });
                    setNewProdStocks(initialStocks);
                    setShowAddProductModal(true);
                  }}
                  className="px-4 py-2 bg-[#185FA5] hover:bg-[#14508c] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#185FA5]/15 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  + Thêm sản phẩm
                </button>
              </div>
            </div>

            {/* Top Cards for key items inside search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.slice(0, 3).map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 relative group overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0C447C] text-[10px] font-black uppercase tracking-tight">{item.category}</span>
                      <span className="text-xs font-black text-[#0C447C]">{item.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-150 shrink-0 flex items-center justify-center">
                        {item.imageUrl || item.image ? (
                          <img 
                            src={item.imageUrl || item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Package size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900 tracking-tight leading-tight">{item.name}</h3>
                        <div className="flex items-center gap-1 flex-wrap pt-1.5">
                          {item.branches.map((b: string) => (
                            <span key={b} className="text-[8px] font-extrabold text-gray-550 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                              CN {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50 mt-1">
                    <span>Tồn kho: <strong className="text-gray-700 font-bold">{item.stock} máy</strong></span>
                    <span>AI Gợi ý: <strong className="text-[#0C447C] font-black">{item.rec} lượt</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Products Inventory details table */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm font-sans">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Chi tiết tồn kho sản phẩm</h3>
                <span className="text-[10px] font-black text-gray-400">Đang hiển thị {filteredProducts.length} / {productList.length} sản phẩm</span>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">STT</th>
                      <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên SP</th>
                      <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh mục</th>
                      <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Giá bán</th>
                      <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tồn Q1</th>
                      <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tồn Q3</th>
                      <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tồn Q7</th>
                      <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                    {filteredProducts.map((p, idx) => {
                      const renderStockCell = (qty: number) => {
                        if (qty === 0) {
                          return (
                            <span className="px-2 py-0.5 rounded bg-red-55 text-red-650 text-[10px] font-bold border border-red-100" style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fee2e2' }}>
                              Hết hàng
                            </span>
                          );
                        }
                        if (qty > 0 && qty <= 10) {
                          return (
                            <span className="text-amber-600 font-bold inline-flex items-center gap-1">
                              <AlertTriangle size={11} className="text-amber-500 shrink-0" />
                              {qty}
                            </span>
                          );
                        }
                        return (
                          <span className="text-emerald-600 font-bold">
                            {qty}
                          </span>
                        );
                      };

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/20 transition-colors group">
                          <td className="px-6 py-3.5 font-mono text-gray-400">{idx + 1}</td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-150 shrink-0 flex items-center justify-center">
                                {p.imageUrl || p.image ? (
                                  <img 
                                    src={p.imageUrl || p.image} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <Package size={18} className="text-gray-300" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 group-hover:text-[#185FA5] transition-colors">{p.name}</span>
                                <span className="text-[10px] font-mono text-[#0C447C]">{p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 font-medium">{p.category}</td>
                          <td className="px-6 py-3.5 font-black text-gray-950">{p.price.toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-3.5">{renderStockCell(p.stockQ1 || 0)}</td>
                          <td className="px-6 py-3.5">{renderStockCell(p.stockQ3 || 0)}</td>
                          <td className="px-6 py-3.5">{renderStockCell(p.stockQ7 || 0)}</td>
                          <td className="px-6 py-3.5">
                            {p.stock === 0 ? (
                              <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">Hết hàng</span>
                            ) : p.stock < 10 ? (
                              <span className="px-2 py-0.5 rounded text-amber-600 bg-amber-50 text-[10px] font-bold border border-amber-100">Sắp hết hàng</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">Còn hàng</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEditProduct(p)}
                                className="ti-edit p-1 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border-0 bg-transparent cursor-pointer font-bold inline-flex items-center gap-1"
                                title="Sửa sản phẩm"
                              >
                                <Pencil size={12} />
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="ti-trash p-1 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border-0 bg-transparent cursor-pointer font-bold inline-flex items-center gap-1"
                                title="Xóa sản phẩm"
                              >
                                <Trash2 size={12} />
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-400 font-semibold text-xs">
                          {productSearchQuery ? 'Không tìm thấy sản phẩm phù hợp với từ khóa của bạn.' : 'Không có sản phẩm nào thuộc chi nhánh này.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Product Mobile Card List */}
              <div className="block md:hidden divide-y divide-[#F1F5F9] bg-white">
                {filteredProducts.map((p, idx) => {
                  return (
                    <div key={p.id} className="p-[14px_16px] flex items-center justify-between gap-3 border-b border-[#F1F5F9] last:border-b-0 bg-white">
                      {/* Flex: Icon SP 44px + info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 44px Icon Container */}
                        <div className="w-[44px] h-[44px] rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          {p.imageUrl || p.image ? (
                            <img 
                              src={p.imageUrl || p.image} 
                              alt={p.name} 
                              className="w-full h-full object-cover rounded-[10px]" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Package size={20} className="text-[#94A3B8]" />
                          )}
                        </div>
                        {/* Info Block */}
                        <div className="min-w-0 flex flex-col text-left">
                          <h4 className="text-[14px] font-bold text-gray-900 truncate tracking-tight leading-snug" title={p.name}>
                            {p.name}
                          </h4>
                          <span className="text-[13px] font-bold text-[#185FA5] mt-0.5">
                            {p.price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>

                      {/* Right: Badge Tồn kho & Action click triggers */}
                      <div className="flex flex-col items-end shrink-0 gap-1.5">
                        {p.stock === 0 ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">Hết</span>
                        ) : p.stock < 10 ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">Sắp hết ({p.stock})</span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">Còn ({p.stock})</span>
                        )}

                        {/* Tiny buttons for quick edit/trash */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="p-1 text-[#185FA5] rounded hover:bg-blue-50 active:scale-95 transition-all cursor-pointer font-bold border-0 bg-transparent min-h-0"
                            style={{ minHeight: '32px' }}
                            title="Sửa/Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 text-red-500 rounded hover:bg-red-50 active:scale-95 transition-all cursor-pointer font-bold border-0 bg-transparent min-h-0"
                            style={{ minHeight: '32px' }}
                            title="Xóa/Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <div className="p-8 text-center text-gray-400 font-semibold text-xs">
                    {productSearchQuery ? 'Không tìm thấy sản phẩm.' : 'Không có sản phẩm nào.'}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* Branches Tab */}
        {activeSubTab === 'branches' && (
          <main className="flex-grow p-8 space-y-6 overflow-y-auto font-sans">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                  Quản lý chi nhánh
                  <span className="text-xs font-bold text-[#185FA5] bg-[#185FA5]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    {branchesList.filter(b => b.status === 'active').length}/{branchesList.length} đang hoạt động
                  </span>
                </h1>
                <p className="text-gray-500 text-xs mt-1">Mạng lưới chi nhánh showroom REMIX trên toàn quốc.</p>
              </div>
              <button 
                onClick={() => {
                  setNewBranchId('');
                  setNewBranchName('');
                  setNewBranchAddress('');
                  setNewBranchPhone('');
                  setNewBranchHours('08:30 - 21:30');
                  setNewBranchStatus('active');
                  setNewBranchManager('');
                  setNewBranchManagerPhone('');
                  setNewBranchEmail('');
                  setNewBranchHasDelivery(false);
                  setNewBranchDeliveryFee('');
                  setNewBranchDeliveryArea('');
                  setShowAddBranchModal(true);
                }}
                className="px-4 py-2.5 bg-[#185FA5] hover:bg-[#0C447C] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none border-0 cursor-pointer shadow-md shadow-blue-500/10"
              >
                <Plus size={14} />
                Thêm chi nhánh
              </button>
            </div>

            {/* Desktop branches grid */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
              {branchesList.map((branch) => {
                const isActive = branch.status === 'active';
                const productsCount = productList.filter((p: any) => p.branches?.includes(branch.id)).length;
                
                const ordersCount = enrichedAllOrders.filter((order: any) => {
                  const bNameClean = branch.name.toLowerCase().replace('showroom', '').replace('remix', '').trim();
                  const oNameClean = (order.branch || '').toLowerCase().replace('showroom', '').replace('remix', '').trim();
                  const isMatched = 
                    (branch.id === 'Q1' && (oNameClean.includes('quận 1') || oNameClean.includes('q1'))) ||
                    (branch.id === 'Q3' && (oNameClean.includes('hoàn kiếm') || oNameClean.includes('quận 3') || oNameClean.includes('q3'))) ||
                    (branch.id === 'Q7' && (oNameClean.includes('hải châu') || oNameClean.includes('quận 7') || oNameClean.includes('q7'))) ||
                    oNameClean.includes(bNameClean) ||
                    bNameClean.includes(oNameClean);
                  return isMatched;
                }).length;

                return (
                  <div key={branch.id} className="border border-[#E2E8F0] border-[0.5px] rounded-[12px] p-5 bg-white flex flex-col justify-between hover:shadow-md transition-all duration-300">
                    <div>
                      {/* Card Header: name + toggle */}
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex flex-col gap-1">
                          <span className="w-fit px-1.5 py-0.5 rounded bg-[#E6F1FB] text-[#185FA5] font-bold text-[9px] tracking-wider uppercase font-mono">
                            Mã: {branch.id}
                          </span>
                          <h3 className="font-bold text-gray-900 text-[16px] leading-snug">{branch.name}</h3>
                        </div>
                        {/* Interactive Toggle */}
                        <div className="flex items-center gap-1.5 shrink-0 mt-1 bg-gray-50 p-1.5 rounded-full border border-gray-100">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 select-none px-1">
                            {isActive ? 'Bật' : 'Tắt'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleBranchStatus(branch.id)}
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 outline-none border-0 ${isActive ? 'bg-[#002f5c]' : 'bg-gray-300'}`}
                            title={isActive ? 'Tắt hoạt động' : 'Bật hoạt động'}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {isActive ? 'Đang hoạt động' : 'Tạm đóng'}
                        </span>
                      </div>

                      {/* Detail Info with requested "ti-" and Lucide icons */}
                      <div className="space-y-2 text-xs text-gray-500 font-medium mt-4 pt-3.5 border-t border-gray-50">
                        <div className="flex items-start gap-2.5">
                          <span className="shrink-0 text-gray-400 ti-map-pin flex items-center justify-center p-0.5 bg-gray-50 rounded-md" title="Địa chỉ chi nhánh">
                            <MapPin size={13} />
                          </span> 
                          <span className="leading-tight text-gray-600">{branch.address}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="shrink-0 text-gray-400 ti-phone flex items-center justify-center p-0.5 bg-gray-50 rounded-md" title="Số điện thoại hotline">
                            <Phone size={13} />
                          </span> 
                          <span className="text-gray-600">{branch.phone}</span>
                        </div>
                        {branch.email && (
                          <div className="flex items-center gap-2.5">
                            <span className="shrink-0 text-gray-400 ti-mail flex items-center justify-center p-0.5 bg-gray-50 rounded-md" title="Email chi nhánh">
                              <Mail size={13} />
                            </span> 
                            <span className="text-gray-600 break-all">{branch.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <span className="shrink-0 text-gray-400 ti-clock flex items-center justify-center p-0.5 bg-gray-50 rounded-md" title="Giờ mở cửa">
                            <Clock size={13} />
                          </span> 
                          <span className="text-gray-600">{branch.hours}</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="shrink-0 text-gray-400 ti-user flex items-center justify-center p-0.5 bg-gray-50 rounded-md" title="Tên quản lý">
                            <User size={13} />
                          </span> 
                          <div className="flex flex-col">
                            <span className="text-gray-600 leading-none">Quản lý: <strong className="text-gray-800 font-semibold">{branch.manager || 'Chưa cập nhật'}</strong></span>
                            {branch.managerPhone && (
                              <span className="text-[10px] text-gray-400 mt-1">SĐT QL: {branch.managerPhone}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="shrink-0 text-gray-400 ti-truck flex items-center justify-center p-0.5 bg-gray-50 rounded-md" title="Giao hàng">
                            <Truck size={13} />
                          </span> 
                          <div className="flex flex-col">
                            <span className="text-gray-600 leading-none">Giao hàng: <strong className="text-gray-800 font-semibold">{branch.hasDelivery ? `Có (Phí: ${(Number(branch.deliveryFee) || 0).toLocaleString('vi-VN')}đ)` : 'Không hỗ trợ'}</strong></span>
                            {branch.hasDelivery && branch.deliveryArea && (
                              <span className="text-[10px] text-gray-400 mt-1 leading-snug">Khu vực: {branch.deliveryArea}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick statistical numbers */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-gray-700 mt-4">
                        <span className="flex items-center gap-1">Sản phẩm: <span className="text-[#185FA5] text-xs font-black">{productsCount}</span></span>
                        <span className="text-gray-200 select-none">|</span>
                        <span className="flex items-center gap-1">Đơn hôm nay: <span className="text-[#185FA5] text-xs font-black">{ordersCount}</span></span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-gray-100 flex gap-2 w-full mt-4">
                      <button 
                        onClick={() => startEditBranch(branch)}
                        className="flex-1 py-1.5 hover:bg-gray-50 text-gray-600 border border-gray-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-white flex items-center justify-center gap-1"
                      >
                        <Pencil size={11} />
                        Sửa
                      </button>
                      
                      <button 
                        onClick={() => {
                          setOrderBranchFilter(branch.id);
                          setActiveSubTab('orders-management');
                        }}
                        className="flex-[1.5] py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 border-0"
                        style={{ backgroundColor: '#E6F1FB', color: '#185FA5' }}
                      >
                        <Eye size={12} />
                        Xem đơn hàng
                      </button>

                      <button 
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="py-1.5 px-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 rounded-xl transition-all cursor-pointer bg-transparent flex items-center justify-center"
                        title="Xóa chi nhánh"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Branch List Layout */}
            <div className="block md:hidden divide-y divide-[#F1F5F9] bg-white rounded-2xl overflow-hidden border border-gray-150/50">
              {branchesList.map((branch) => {
                const isActive = branch.status === 'active';
                return (
                  <div key={branch.id} className="p-[14px_16px] flex items-center justify-between gap-3 border-b border-[#F1F5F9] last:border-b-0 bg-white">
                    {/* Left: Info & status badge */}
                    <div className="min-w-0 flex flex-col text-left gap-1">
                      <div className="flex items-center gap-2">
                        {/* Tên showroom: 14px bold màu xám đậm */}
                        <h4 className="text-[14px] font-bold text-gray-850 truncate leading-snug">
                          {branch.name}
                        </h4>
                        
                        {/* Trạng thái: Badge nhỏ màu lục/đỏ hoạt động */}
                        {isActive ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Hoạt động</span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">Ngưng</span>
                        )}
                      </div>
                      
                      {/* Địa chỉ: 12px sáng sủa, màu #64748B */}
                      <p className="text-[12px] text-[#64748B] truncate leading-tight">
                        {branch.address}
                      </p>
                    </div>

                    {/* Right: On/Off Switch and Edit icon (min-width/height 44px) */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* On/Off Switch button (min Touch target 44px) */}
                      <button
                        onClick={() => toggleBranchStatus(branch.id)}
                        className="w-[44px] h-[44px] flex items-center justify-center rounded-xl bg-transparent border-0 cursor-pointer text-[#185FA5] hover:bg-slate-50 min-h-0"
                        title="Bật/Tắt hoạt động"
                      >
                        <div className="w-8 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 border border-slate-200 bg-gray-150 relative">
                          <div className={`w-3 h-3 rounded-full shadow-sm absolute top-0.5 left-0.5 transition-all ${isActive ? 'bg-[#185FA5] translate-x-3.5' : 'bg-gray-400 translate-x-0'}`} />
                        </div>
                      </button>

                      {/* Edit Button (min touch target 44px) */}
                      <button
                        onClick={() => startEditBranch(branch)}
                        className="w-[44px] h-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-700 hover:bg-slate-50 transition-all border-0 bg-transparent min-h-0"
                        title="Sửa showroom"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {branchesList.length === 0 && (
              <div className="py-16 text-center text-gray-400 font-semibold text-sm bg-white border border-gray-100 rounded-3xl w-full">
                Chưa có chi nhánh nào được thêm. Hãy nhấp vào nút "Thêm chi nhánh" ở trên.
              </div>
            )}
          </main>
        )}

        {/* Orders Management tab */}
        {activeSubTab === 'orders-management' && (
          <main className="flex-grow p-8 space-y-6 overflow-y-auto font-sans">
            <div className="flex justify-between items-center bg-white p-6 border border-gray-100 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Hóa đơn & Đơn hàng đã ghi nhận</h1>
                <p className="text-gray-500 text-xs mt-1">Xem chi tiết các hóa đơn được trợ lý AI tư vấn và kích hoạt chốt đơn từ người dùng.</p>
              </div>
            </div>

            {/* Bộ lọc (Filter Bar) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-50">
                <div className="text-[11px] font-black text-[#185FA5] uppercase tracking-widest flex items-center gap-1.5">
                  <Filter size={12} className="text-[#185FA5]" />
                  Bộ lọc tìm kiếm đơn hàng nâng cao
                </div>
                {/* Quick Toggle Buttons for Branches */}
                <div className="flex flex-wrap items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/10 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setOrderBranchFilter('Tất cả')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      orderBranchFilter === 'Tất cả'
                        ? 'bg-[#185FA5] text-white shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                    }`}
                  >
                    Tất cả Showroom
                  </button>
                  {branchesList.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setOrderBranchFilter(b.id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        orderBranchFilter === b.id
                          ? 'bg-[#185FA5] text-white shadow-sm font-black'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                      }`}
                    >
                      <Building size={10} className="shrink-0" />
                      <span>{b.id === 'Q1' ? 'Showroom Q1' : b.id === 'Q3' ? 'Showroom Q3' : b.id === 'Q7' ? 'Showroom Q7' : b.id}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap lg:flex-nowrap gap-4 items-end">
                {/* 1. Thanh tìm kiếm */}
                <div className="relative flex-grow min-w-[280px]">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Tìm kiếm đơn hàng</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Search size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm theo mã đơn, khách hàng, số điện thoại, sản phẩm..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-2.5 pl-9 pr-9 text-xs font-semibold placeholder-gray-400 text-gray-900 outline-none focus:ring-4 focus:ring-[#185FA5]/5 focus:bg-white focus:border-[#185FA5]/30 transition-all font-sans"
                    />
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-605 border-0 bg-transparent cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Lọc theo Chi nhánh */}
                <div className="w-full sm:w-[220px] shrink-0">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Chi nhánh showroom</label>
                  <select
                    value={orderBranchFilter}
                    onChange={(e) => setOrderBranchFilter(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-2.5 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-4 focus:ring-[#185FA5]/5 focus:bg-white focus:border-[#185FA5]/30 transition-all cursor-pointer font-sans"
                  >
                    <option value="Tất cả">Tất cả chi nhánh</option>
                    {branchesList.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Lọc theo Trạng thái */}
                <div className="w-full sm:w-[180px] shrink-0">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Trạng thái đơn hàng</label>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-2.5 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-4 focus:ring-[#185FA5]/5 focus:bg-white focus:border-[#185FA5]/30 transition-all cursor-pointer font-sans"
                  >
                    <option value="Tất cả">Tất cả trạng thái</option>
                    <option value="processing">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao</option>
                    <option value="delivered">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                {/* 4. Lọc theo Ngày */}
                <div className="w-full sm:w-[160px] shrink-0">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Khoảng thời gian</label>
                  <select
                    value={orderDateRangeFilter}
                    onChange={(e) => setOrderDateRangeFilter(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-2.5 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-4 focus:ring-[#185FA5]/5 focus:bg-white focus:border-[#185FA5]/30 transition-all cursor-pointer font-sans"
                  >
                    <option value="Tất cả">Tất cả thời gian</option>
                    <option value="Hôm nay">Hôm nay</option>
                    <option value="7 ngày">7 ngày gần đây</option>
                    <option value="30 ngày">30 ngày gần đây</option>
                  </select>
                </div>

                {/* Nút reset nhanh nếu Đang lọc */}
                {(orderBranchFilter !== 'Tất cả' || orderSearchQuery !== '' || orderStatusFilter !== 'Tất cả' || orderDateRangeFilter !== 'Tất cả') && (
                  <button
                    onClick={() => {
                      setOrderBranchFilter('Tất cả');
                      setOrderSearchQuery('');
                      setOrderStatusFilter('Tất cả');
                      setOrderDateRangeFilter('Tất cả');
                    }}
                    className="px-4 py-[11px] bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto h-[41px]"
                  >
                    <X size={14} />
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50 flex justify-between items-center">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh mục hóa đơn bán hàng</span>
                <span className="px-3 py-1 rounded bg-blue-50 text-[#0C447C] text-[10px] font-bold">{filteredOrders.length} Đơn chốt thành công</span>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/20">
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên khách</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">SĐT</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thanh toán</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chi nhánh</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                    {filteredOrders.map((order: any, idx: number) => (
                      <tr key={order.id + '-all-' + idx} className="hover:bg-gray-50/30 transition-colors">
                        {/* 1. Mã đơn */}
                        <td className="px-5 py-4 font-bold text-blue-600 font-mono text-[10px] whitespace-nowrap">
                          {order.id}
                        </td>
                        {/* 2. Thời gian */}
                        <td className="px-5 py-4 font-medium text-gray-400 whitespace-nowrap">
                          {order.time}
                        </td>
                        {/* 3. Tên khách */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[12px] text-gray-900 font-bold">{order.customerName}</span>
                            {order.address && (
                              <span className="text-[10px] text-gray-400 font-normal font-sans max-w-[180px] truncate" title={order.address}>
                                📍 {order.address}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* 4. SĐT */}
                        <td className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap font-sans">
                          {order.phone || "—"}
                        </td>
                        {/* 5. Sản phẩm */}
                        <td className="px-5 py-4 font-medium text-gray-800 font-sans max-w-[150px] truncate" title={order.productName}>
                          {order.productName}
                        </td>
                        {/* 6. Tổng tiền */}
                        <td className="px-5 py-4 font-black text-[#0C447C] whitespace-nowrap">
                          {order.price.toLocaleString('vi-VN')}đ
                        </td>
                        {/* 7. Thanh toán */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase text-[9px] tracking-wider">
                            {order.method}
                          </span>
                        </td>
                        {/* 8. Chi nhánh */}
                        <td className="px-5 py-4 text-gray-500 font-medium font-sans max-w-[140px] truncate" title={order.branch}>
                          {order.branch}
                        </td>
                        {/* 9. Trạng thái */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={getStatusBadgeClass(order.status)}>
                            {getStatusLabelText(order.status)}
                          </span>
                        </td>
                        {/* 10. Hành động */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                              className="px-2 py-1 bg-white border border-gray-200 text-[11px] rounded-lg font-bold outline-none focus:border-[#185FA5] cursor-pointer"
                            >
                              <option value="processing">Chờ xác nhận</option>
                              <option value="confirmed">Đã xác nhận</option>
                              <option value="shipping">Đang giao</option>
                              <option value="delivered">Đã giao</option>
                              <option value="cancelled">Đã hủy</option>
                            </select>
                            <button
                              onClick={() => {
                                setSelectedDetailedOrder(order);
                                setShowDetailModal(true);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
                              title="Xem chi tiết đơn"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                              title="Xóa đơn hàng"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-gray-400 text-xs font-semibold">
                          Chưa có đơn hàng nào được ghi nhận.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Mobile Card List */}
              <div className="block md:hidden divide-y divide-gray-100 bg-white">
                {filteredOrders.map((order: any, idx: number) => (
                  <div key={order.id + '-all-card-' + idx} className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-600 font-mono text-xs">{order.id}</span>
                      <span className={getStatusBadgeClass(order.status)}>
                        {getStatusLabelText(order.status)}
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-400 font-medium font-sans">Thời gian: {order.time}</div>

                    <div className="space-y-1 text-left">
                      <div className="text-xs">
                        <span className="text-gray-400">Khách hàng: </span>
                        <strong className="text-gray-800 font-bold">{order.customerName}</strong>
                      </div>
                      {order.phone && (
                        <div className="text-xs">
                          <span className="text-gray-400">Số điện thoại: </span>
                          <span className="text-gray-600 font-mono">{order.phone}</span>
                        </div>
                      )}
                      {order.address && (
                        <div className="text-xs text-gray-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                          <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider">Địa chỉ giao hàng</span>
                          <span className="block text-gray-700 font-medium mt-0.5">📍 {order.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50/20 p-2.5 rounded-xl border border-blue-50/50 space-y-1.5 text-left">
                      <div className="text-xs text-gray-700">
                        <span className="text-gray-400">Sản phẩm: </span>
                        <strong className="font-semibold">{order.productName}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-100">
                        <div>
                          <span className="text-gray-400">Thanh toán: </span>
                          <span className="px-1.5 py-0.5 rounded bg-gray-150 text-gray-600 font-bold uppercase text-[9px] tracking-wider">{order.method}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Tổng: </span>
                          <strong className="font-black text-[#0C447C]">{order.price.toLocaleString('vi-VN')}đ</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-500 text-left">
                      <span className="text-gray-400">Chi nhánh:</span> {order.branch || "—"}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Trạng thái:</span>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className="px-2 py-1 bg-white border border-gray-200 text-xs rounded-lg font-bold outline-none focus:border-[#185FA5] cursor-pointer"
                        >
                          <option value="processing">Chờ xác nhận</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="shipping">Đang giao</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>

                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => {
                            setSelectedDetailedOrder(order);
                            setShowDetailModal(true);
                          }}
                          className="p-1 px-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-xl transition-all border-0 cursor-pointer flex items-center justify-center gap-1 text-[11px] font-bold"
                          title="Xem chi tiết đơn"
                        >
                          <Eye size={12} />
                          Chi tiết
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 rounded-xl transition-all border-0 cursor-pointer flex items-center justify-center"
                          title="Xóa đơn hàng"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="p-8 text-center text-gray-400 font-semibold text-xs">
                    Chưa có đơn hàng nào được tìm thấy.
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* Promotions Sub-tab */}
        {activeSubTab === 'promotions' && (
          <main className="flex-grow p-8 space-y-8 overflow-y-auto">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Tag className="text-[#0C447C]" />
                Quản lý Khuyến mãi & Mã giảm giá
              </h1>
              <p className="text-gray-500 text-xs mt-1">
                Tạo, tối ưu cấu hình và theo dõi tình trạng các mã Coupon ưu đãi kích cầu doanh số.
              </p>
            </div>

            {/* Success and Error messages */}
            {promoSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 shadow-sm">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <div>{promoSuccess}</div>
              </div>
            )}
            {promoError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 shadow-sm">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <div>{promoError}</div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Form tạo mã (Left column - 5 cols span on desktop) */}
              <div className="xl:col-span-5 bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-5">
                <div className="border-b border-gray-50 pb-3 flex items-center gap-1.5">
                  <Plus className="text-[#0C447C]" size={16} />
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tạo mã giảm giá mới</h3>
                </div>

                <form onSubmit={handleCreateCoupon} className="space-y-4 text-left">
                  {/* Mã code */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mã giảm giá *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ví dụ: REMIX10, DONGHEVANG..."
                      value={pCode}
                      onChange={(e) => setPCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-mono font-bold tracking-wider"
                    />
                  </div>

                  {/* Loại giảm */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Loại giảm giá *</label>
                    <div className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100/55">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                        <input 
                          type="radio" 
                          name="discountType" 
                          checked={pDiscountType === 'percentage'} 
                          onChange={() => {
                            setPDiscountType('percentage');
                            setPValue('10'); // Default %
                          }}
                          className="accent-[#0C447C] h-4 w-4" 
                        />
                        Phần trăm (%)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                        <input 
                          type="radio" 
                          name="discountType" 
                          checked={pDiscountType === 'fixed'} 
                          onChange={() => {
                            setPDiscountType('fixed');
                            setPValue('50000'); // Default fixed
                          }}
                          className="accent-[#0C447C] h-4 w-4" 
                        />
                        Số tiền cố định (đ)
                      </label>
                    </div>
                  </div>

                  {/* Giá trị giảm & Đơn hàng tối thiểu */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        Giá trị giảm ({pDiscountType === 'percentage' ? '%' : 'đ'}) *
                      </label>
                      <input 
                        type="number"
                        required
                        min="1"
                        placeholder={pDiscountType === 'percentage' ? '10' : '50000'}
                        value={pValue}
                        onChange={(e) => setPValue(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold text-gray-950"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Đơn hàng tối thiểu (đ)</label>
                      <input 
                        type="number"
                        min="0"
                        placeholder="Ví dụ: 0 hoặc 500000"
                        value={pMinOrderValue}
                        onChange={(e) => setPMinOrderValue(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold text-gray-950"
                      />
                    </div>
                  </div>

                  {/* Số lượt tối đa & Ngày hết hạn */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        Nhiều nhất (0 = vô hạn)
                      </label>
                      <input 
                        type="number"
                        min="0"
                        value={pMaxUses}
                        onChange={(e) => setPMaxUses(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold text-gray-950"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Ngày hết hạn *</label>
                      <input 
                        type="date"
                        required
                        value={pExpiryDate}
                        onChange={(e) => setPExpiryDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold text-gray-950 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Danh mục áp dụng */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Danh mục áp dụng (Giới hạn)</label>
                    <select
                      value={pApplicableCategory}
                      onChange={(e) => setPApplicableCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold text-gray-950 cursor-pointer"
                    >
                      <option value="">Áp dụng cho tất cả danh mục</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Tai nghe">Tai nghe</option>
                      <option value="Điện thoại">Điện thoại</option>
                      <option value="Smartwatch">Smartwatch</option>
                      <option value="Phụ kiện">Phụ kiện</option>
                    </select>
                  </div>

                  {/* Chi nhánh áp dụng */}
                  <div className="space-y-2 border border-gray-100 rounded-2xl p-4 bg-gray-50/40">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Chi nhánh áp dụng *</label>
                    <div className="space-y-2">
                      {/* Option ALL */}
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                        <input 
                          type="checkbox"
                          checked={pApplicableBranches.includes('All')}
                          onChange={() => handleToggleBranch('All')}
                          className="rounded text-[#0C447C] accent-[#0C447C] focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <span>Tất cả chi nhánh (All)</span>
                      </label>

                      {/* Option individual codes */}
                      {branchesList.map((branch) => (
                        <label key={branch.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 pl-4 border-l border-gray-200">
                          <input 
                            type="checkbox"
                            checked={pApplicableBranches.includes(branch.id)}
                            onChange={() => handleToggleBranch(branch.id)}
                            className="rounded text-[#0C447C] accent-[#0C447C] focus:ring-0 cursor-pointer h-4 w-4"
                          />
                          <span>{branch.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Nút Tạo */}
                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#0C447C] hover:bg-[#0a3867] text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-0"
                    >
                      <Check size={14} />
                      Tạo mã
                    </button>
                  </div>
                </form>
              </div>

              {/* Danh sách mã đã tạo (Right column - 7 cols span on desktop) */}
              <div className="xl:col-span-7 bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-4">
                <div className="border-b border-gray-50 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh sách mã khuyến mãi</h3>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Tổng số: {couponsList.length} mã đang lưu trữ</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="px-4 py-3">Mã</th>
                        <th className="px-4 py-3">Loại</th>
                        <th className="px-4 py-3">Giá trị</th>
                        <th className="px-4 py-3">Đã dùng/Tối đa</th>
                        <th className="px-4 py-3">Hết hạn</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                      {couponsList.map((coupon) => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const isExpired = coupon.expiryDate && coupon.expiryDate < todayStr;
                        const isFullyUsed = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses;
                        
                        let statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700">
                            Đang chạy
                          </span>
                        );
                        if (isExpired) {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700">
                              Hết hạn
                            </span>
                          );
                        } else if (isFullyUsed) {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700">
                              Hết lượt
                            </span>
                          );
                        }

                        return (
                          <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-mono bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs font-black text-gray-900 tracking-wide uppercase">
                                {coupon.code}
                              </span>
                              {coupon.applicableCategory && (
                                <span className="block mt-1 text-[9px] text-[#0C447C] bg-blue-50/70 border border-blue-100 rounded px-1.5 py-0.5 font-bold w-max leading-none">
                                  Danh mục: {coupon.applicableCategory}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-sans text-gray-500">
                              {coupon.discountType === 'percentage' ? '%' : 'VNĐ'}
                            </td>
                            <td className="px-4 py-3 font-extrabold text-[#0C447C]">
                              {coupon.discountType === 'percentage' 
                                ? `${coupon.value}%` 
                                : `${coupon.value.toLocaleString('vi-VN')}đ`}
                            </td>
                            <td className="px-4 py-3 font-mono text-gray-500">
                              {coupon.usedCount} / {coupon.maxUses === 0 ? '∞' : coupon.maxUses}
                            </td>
                            <td className="px-4 py-3 font-mono text-gray-400">
                              {coupon.expiryDate}
                            </td>
                            <td className="px-4 py-3">
                              {statusBadge}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-rose-50 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                                title="Xóa mã giảm giá"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {couponsList.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-400 font-bold">
                            Chưa có mã giảm giá nào được tạo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50/35 border border-blue-100 p-4 rounded-2xl text-[11px] text-gray-500 font-semibold leading-relaxed space-y-1 text-left">
                  <div className="text-blue-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                    <span>💡 Hướng dẫn cấu hình chi nhánh</span>
                  </div>
                  <p>
                    Voucher khi áp dụng sẽ được đối soát với Showroom mà Khách hàng chọn lúc Đặt hàng. 
                    Nếu voucher được đánh dấu cho các showroom cụ thể, khách chọn các showroom khác sẽ được thông báo không được phép sử dụng.
                  </p>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Settings Tab */}
        {activeSubTab === 'ai-config' && (
          <main className="flex-grow p-8 space-y-8 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cài đặt hệ thống</h1>
                <p className="text-gray-500 text-xs mt-1">Cấu hình các tham số hoạt động, thông tin cửa hàng và bảo mật tài khoản quản trị.</p>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 dark:bg-[#791F1F]/10 dark:border-[#791F1F]/30 dark:text-[#FCA5A5] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs active:scale-95 shrink-0"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất Quản trị</span>
                </button>
              )}
            </div>

            {/* Sub-tabs menu inside Cài đặt */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setSettingsSection('ai')}
                className={`px-6 py-3 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                  settingsSection === 'ai'
                    ? 'border-[#0C447C] text-[#0C447C] bg-white rounded-t-xl font-black'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Bot size={14} />
                Trợ lý AI (Gemini)
              </button>
              <button
                onClick={() => setSettingsSection('general')}
                className={`px-6 py-3 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                  settingsSection === 'general'
                    ? 'border-[#0C447C] text-[#0C447C] bg-white rounded-t-xl font-black'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Building size={14} />
                Thông tin cửa hàng
              </button>
              <button
                onClick={() => setSettingsSection('account')}
                className={`px-6 py-3 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                  settingsSection === 'account'
                    ? 'border-[#0C447C] text-[#0C447C] bg-white rounded-t-xl font-black'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <User size={14} />
                Tài khoản Bảo mật
              </button>
              <button
                onClick={() => setSettingsSection('data')}
                className={`px-6 py-3 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                  settingsSection === 'data'
                    ? 'border-[#0C447C] text-[#0C447C] bg-white rounded-t-xl font-black'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Database size={14} />
                Quản lý dữ liệu
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
              {/* Left Side: Form config according to selected sub-tab */}
              {settingsSection === 'ai' && (
                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
                    <Bot size={13} className="text-[#0C447C]" />
                    Cấu hình AI tư vấn
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Tên AI */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tên AI hiển thị *</label>
                      <input 
                        type="text"
                        value={aiName}
                        onChange={(e) => setAiName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold"
                        placeholder="Ví dụ: REMIX AI"
                      />
                    </div>

                    {/* Lời chào mở đầu */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Lời chào mở đầu *</label>
                      <textarea 
                        rows={3}
                        value={aiGreeting}
                        onChange={(e) => setAiGreeting(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold leading-relaxed"
                        placeholder="Ví dụ: Chào bạn, mình có thể giúp gì..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Số sản phẩm gợi ý tối đa */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Số sản phẩm gợi ý tối đa</label>
                        <input 
                          type="number"
                          min="1"
                          max="10"
                          value={aiMaxProducts}
                          onChange={(e) => setAiMaxProducts(Math.max(1, parseInt(e.target.value) || 3))}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold"
                        />
                      </div>

                      {/* Độ sáng tạo */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Độ sáng tạo (Temperature)</label>
                        <select
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold cursor-pointer"
                        >
                          <option value="0.2">Chính xác / Logic (0.2)</option>
                          <option value="0.5">Cân bằng (0.5)</option>
                          <option value="0.7">Sáng tạo trung bình (0.7)</option>
                          <option value="0.9">Sáng tạo / Linh hoạt (0.9)</option>
                        </select>
                      </div>
                    </div>

                    {/* Độ dài phản hồi tối đa */}
                    <div className="space-y-2 p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-700">Độ dài phản hồi tối đa (Slider)</span>
                        <span className="text-[#0C447C] font-extrabold">
                          {aiResponseLength === 1 ? 'Ngắn gọn' : aiResponseLength === 2 ? 'Vừa phải' : 'Chi tiết'}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="1"
                        value={aiResponseLength}
                        onChange={(e) => setAiResponseLength(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0C447C]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1">
                        <span>Ngắn (dưới 50 từ)</span>
                        <span>Vừa (dưới 120 từ)</span>
                        <span>Dài (đầy đủ)</span>
                      </div>
                    </div>

                    {/* Bật/tắt tính năng upsell */}
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-800 block">Bật tính năng Upsell (bán thêm)</span>
                        <span className="text-[10px] text-gray-400 font-semibold block leading-tight">Chủ động gợi ý phụ kiện phụ trợ sau khi khách chọn sản phẩm chính</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setAiUpsell(!aiUpsell)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${aiUpsell ? 'bg-[#0C447C]' : 'bg-gray-200'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-200 ease-in-out ${aiUpsell ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Bật/tắt gợi ý chi nhánh khác khi hết hàng */}
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-800 block">Gợi ý chi nhánh khác khi hết hàng</span>
                        <span className="text-[10px] text-gray-400 font-semibold block leading-tight">Hướng dẫn khách mua từ các chi nhánh khác nếu kho hiện tại hết hàng</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setAiSuggestOtherBranches(!aiSuggestOtherBranches)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${aiSuggestOtherBranches ? 'bg-[#0C447C]' : 'bg-gray-200'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-200 ease-in-out ${aiSuggestOtherBranches ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* System Prompt (Đọc thêm) */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">System Prompt bổ sung (Câu lệnh gốc)</label>
                      <textarea 
                        rows={3}
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-55 border border-gray-100 rounded-xl text-xs text-gray-500 outline-none font-medium leading-relaxed"
                        placeholder="Câu lệnh nền để định vị vai trò của trợ lý AI..."
                      />
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={handleSaveAIConfig}
                        className="w-full py-3 bg-[#0C447C] hover:bg-[#0a3867] text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check size={14} />
                        Lưu cài đặt AI
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsSection === 'general' && (
                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
                    <Building size={13} className="text-[#0C447C]" />
                    Cấu hình thông tin cửa hàng
                  </h3>
                  
                  <div className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tên chuỗi cửa hàng *</label>
                      <input 
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold"
                        placeholder="Ví dụ: TechShop REMIX"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Logo URL *</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="text"
                          value={storeLogo}
                          onChange={(e) => setStoreLogo(e.target.value)}
                          className="flex-grow px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold"
                          placeholder="Nhập đường dẫn ảnh logo (ví dụ: https://images.unsplash.com/...)"
                        />
                        <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                          {storeLogo ? (
                            <img src={storeLogo} alt="Logo Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="text-gray-300 font-bold text-[10px]">Trống</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Hotline chung *</label>
                      <input 
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold"
                        placeholder="Ví dụ: 1900 8198"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Website *</label>
                      <input 
                        type="url"
                        value={storeWebsite}
                        onChange={(e) => setStoreWebsite(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold"
                        placeholder="Ví dụ: https://techshop-remix.vn"
                      />
                    </div>

                    <div className="border-t border-gray-50 pt-4 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Địa chỉ Trụ sở chính *</label>
                        <input 
                          type="text"
                          value={storeAddress}
                          onChange={(e) => setStoreAddress(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold"
                          placeholder="Ví dụ: 99 Đường Láng, Hà Nội"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email liên hệ kinh doanh / support</label>
                        <input 
                          type="email"
                          value={storeEmail}
                          onChange={(e) => setStoreEmail(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold"
                          placeholder="Ví dụ: support@remix.ai"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Đơn vị tiền tệ chính</label>
                          <select
                            value={storeCurrency}
                            onChange={(e) => setStoreCurrency(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold cursor-pointer"
                          >
                            <option value="VND">VND (đ)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Quốc gia giao dịch</label>
                          <input 
                            type="text" 
                            value="Việt Nam" 
                            disabled 
                            className="w-full px-4 py-2.5 bg-gray-200 border border-gray-150 rounded-xl text-xs font-bold text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={handleSaveStoreConfig}
                        className="w-full py-3 bg-[#0C447C] hover:bg-[#0a3867] text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check size={14} />
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsSection === 'account' && (
                <div className="space-y-6 text-left">
                  {/* Personal Information Block */}
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
                      <User size={13} className="text-[#0C447C]" />
                      Thông tin cá nhân
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Tên hiển thị */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tên hiển thị *</label>
                        <input 
                          type="text"
                          value={adminDisplayName}
                          onChange={(e) => setAdminDisplayName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-bold"
                          placeholder="Tên hiển thị của quản trị viên"
                        />
                      </div>

                      {/* Email (Readonly) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email (Không thể thay đổi)</label>
                        <input 
                          type="email"
                          value={adminEmail}
                          readOnly
                          className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 font-bold cursor-not-allowed outline-none"
                          placeholder="buitienanh279@gmail.com"
                        />
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={handleSaveAccountConfig}
                          className="w-full py-2.5 bg-gray-800 hover:bg-gray-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check size={14} />
                          Lưu thay đổi thông tin
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Modification Block */}
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
                      <Shield size={13} className="text-[#0C447C]" />
                      Thay đổi mật khẩu tài khoản
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Mật khẩu cũ */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mật khẩu cũ *</label>
                        <input 
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold tracking-widest"
                          placeholder="••••••••"
                        />
                      </div>

                      {/* Mật khẩu mới */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mật khẩu mới *</label>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold tracking-widest"
                          placeholder="••••••••"
                        />
                      </div>

                      {/* Xác nhận mật khẩu mới */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Xác nhận mật khẩu mới *</label>
                        <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#0C447C]/10 outline-none transition-all font-semibold tracking-widest"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={handleUpdatePassword}
                          className="w-full py-3 bg-[#0C447C] hover:bg-[#0a3867] text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Logout Account Block */}
                  {onLogout && (
                    <div className="p-6 bg-rose-50/50 dark:bg-[#791F1F]/5 border border-rose-100 dark:border-[#791F1F]/20 rounded-3xl shadow-sm space-y-4">
                      <h3 className="text-xs font-black text-rose-800 dark:text-[#FCA5A5] uppercase tracking-widest border-b border-rose-100/50 dark:border-[#791F1F]/20 pb-2 flex items-center gap-2">
                        <LogOut size={13} className="text-rose-600 dark:text-rose-400" />
                        Đăng xuất hệ thống
                      </h3>
                      <p className="text-rose-700/80 dark:text-[#FCA5A5]/70 text-xs leading-relaxed font-semibold">
                        Bạn có thể đăng xuất khỏi phiên làm việc quản trị này bất kỳ lúc nào để quay trở về màn hình giao diện khách hàng chính.
                      </p>
                      <button
                        onClick={onLogout}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-0"
                      >
                        <LogOut size={14} />
                        Đăng xuất tài khoản quản trị
                      </button>
                    </div>
                  )}
                </div>
              )}

              {settingsSection === 'data' && (
                <div className="space-y-6 text-left">
                  {/* Backup & Restore Block */}
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
                      <Database size={13} className="text-[#0C447C]" />
                      Sao lưu & Khôi phục dữ liệu
                    </h3>
                    
                    <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                      Nhập xuất toàn bộ cấu hình hệ thống bao gồm: danh sách sản phẩm cửa hàng, định dạng phân bố kho hàng, địa chỉ thông tin các chi nhánh và tất cả dữ liệu đơn hàng đã ghi nhận.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Xuất dữ liệu button */}
                      <button
                        onClick={handleExportAllData}
                        className="py-3 px-4 bg-[#0C447C] hover:bg-[#0a3867] text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-0"
                      >
                        <Download size={14} />
                        Xuất toàn bộ dữ liệu
                      </button>

                      {/* Nhập dữ liệu button & custom styled input file */}
                      <div>
                        <input 
                          type="file" 
                          id="import-json-file" 
                          accept=".json" 
                          onChange={handleImportData} 
                          className="hidden" 
                        />
                        <label 
                          htmlFor="import-json-file"
                          className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                        >
                          <Upload size={14} />
                          Nhập dữ liệu (.json)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* System Reset & Data Cleaning Block */}
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-[#B91C1C] uppercase tracking-widest border-b border-rose-50 pb-2 flex items-center gap-2">
                      <Trash2 size={13} />
                      Dọn dẹp & Reset hệ thống
                    </h3>

                    <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                      Thực hiện các hành vụ dọn dẹp bộ nhớ đệm, xóa dữ liệu cũ hoặc cài đặt lại toàn bộ hệ thống về trạng thái ban đầu để kiểm định tính năng.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Xóa toàn bộ đơn hàng cũ button */}
                      <button
                        onClick={handleDeleteAllOrders}
                        className="py-3 px-4 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-[#B91C1C] rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Trash2 size={14} />
                        Xóa toàn bộ đơn hàng cũ
                      </button>

                      {/* Reset về dữ liệu mẫu button */}
                      <button
                        onClick={handleResetToSampleData}
                        className="py-3 px-4 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Database size={14} />
                        Reset về dữ liệu mẫu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Side: Shared status indicators and notes */}
              <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Thông tin mô hình & Kết nối</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                    <span className="text-gray-500 font-semibold">Mô hình hoạt động</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Gemini 1.5 Flash</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                    <span className="text-gray-500 font-semibold">Cơ sở dữ liệu sản phẩm</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{productList.length} Sản phẩm đồng bộ</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                    <span className="text-gray-500 font-semibold">Bảo mật giao thức</span>
                    <span className="font-bold text-gray-700">HTTPS / SSL AES-128</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-gray-500 font-semibold">Tự động tối ưu câu hỏi</span>
                    <span className="font-bold text-emerald-600">Đang hoạt động (ON)</span>
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-bold">
                    <span>💡 Lưu ý quan trọng</span>
                  </div>
                  {settingsSection === 'ai' ? (
                    <p className="text-[11px] text-amber-600 leading-relaxed font-semibold">
                      Cấu hình trợ lý ảo ảnh hưởng trực tiếp đến nội dung tư vấn sản phẩm tới khách hàng. Các tham số như Temperature quyết định độ ngẫu nhiên lý luận của robot. Hãy tinh chỉnh phù hợp!
                    </p>
                  ) : settingsSection === 'general' ? (
                    <p className="text-[11px] text-amber-600 leading-relaxed font-semibold">
                      Thông tin thương hiệu sẽ được đồng bộ hiển thị lên hóa đơn bán hàng, phiếu giao nhận, thông tin địa chỉ cửa hàng và showroom hiển thị công khai trên website.
                    </p>
                  ) : settingsSection === 'account' ? (
                    <p className="text-[11px] text-amber-600 leading-relaxed font-semibold">
                      Hãy ghi nhớ kỹ Username và Mật khẩu cập nhật. Để bảo vệ dữ liệu thương mại quan trọng của doanh nghiệp, vui lòng tránh đặt mật khẩu quá đơn giản hoặc trùng lặp.
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-600 leading-relaxed font-semibold">
                      Lưu trữ, sao lưu và dọn dẹp các nhóm dữ liệu cốt lõi giúp hệ thống hoạt động ổn định và an toàn hơn. Xin vui lòng kiểm tra file JSON cẩn thận trước khi khôi phục dữ liệu hoặc làm mới hệ thống.
                    </p>
                  )}
                </div>

                {/* Additional system statistics */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <span className="text-[9px] uppercase font-black text-gray-400 block tracking-wider">Hệ thống & Tài nguyên</span>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 block">Thời gian vận hành</span>
                      <span className="font-bold text-gray-800">100% Up-time</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 block">Bộ nhớ đệm (Cache)</span>
                      <span className="font-bold text-gray-800">Đã đồng bộ </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Loyalty Program Admin Tab */}
        {activeSubTab === 'loyalty' && (() => {
          // Check and seed default data if remix_loyalty_users is empty or old
          try {
            let localCheck = localStorage.getItem('remix_loyalty_users');
            if (localCheck && (!localCheck.includes("U001") || !localCheck.includes("redeemHistory"))) {
              localStorage.removeItem('remix_loyalty_users');
              localCheck = null;
            }
            if (!localCheck) {
              const defaultLoyaltyData = {
                settings: {
                  pointsPerAmount: 1,      // 10.000đ = 1 điểm
                  silverMin: 0,
                  goldMin: 500,
                  diamondMin: 2000,
                  rewards: [
                    {id:'R1', points:100, value:'Voucher 20.000đ', code:'REWARD20K'},
                    {id:'R2', points:200, value:'Voucher 50.000đ', code:'REWARD50K'},
                    {id:'R3', points:500, value:'Voucher 150.000đ + Free ship', code:'REWARD150K'}
                  ]
                },
                users: [
                  {id:'U001', name:'Nguyễn Văn A', email:'a@gmail.com', phone:'0901234567', points:1250, tier:'diamond', totalSpent:12500000, totalOrders:8, joinDate:'15/01/2026', username:'nguyenvana'},
                  {id:'U002', name:'Trần Thị B', email:'b@gmail.com', phone:'0912345678', points:680, tier:'gold', totalSpent:6800000, totalOrders:5, joinDate:'20/02/2026', username:'tranthib'},
                  {id:'U003', name:'Lê Minh C', email:'c@gmail.com', phone:'0923456789', points:320, tier:'silver', totalSpent:3200000, totalOrders:3, joinDate:'10/03/2026', username:'leminhc'},
                  {id:'U004', name:'Phạm Thu D', email:'d@gmail.com', phone:'0934567890', points:890, tier:'gold', totalSpent:8900000, totalOrders:6, joinDate:'05/02/2026', username:'phamthud'},
                  {id:'U005', name:'Hoàng Văn E', email:'e@gmail.com', phone:'0945678901', points:2100, tier:'diamond', totalSpent:21000000, totalOrders:12, joinDate:'01/01/2026', username:'hoangvane'}
                ],
                redeemHistory: [
                  {userId:'U001', userName:'Nguyễn Văn A',
                   reward:'Voucher 50.000đ', pointsUsed:200,
                   date:'20/05/2026', code:'REWARD50K-001'},
                  {userId:'U002', userName:'Trần Thị B',
                   reward:'Voucher 20.000đ', pointsUsed:100,
                   date:'18/05/2026', code:'REWARD20K-002'}
                ]
              };
              localStorage.setItem('remix_loyalty_users', JSON.stringify(defaultLoyaltyData));

              const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
              defaultLoyaltyData.users.forEach((mockU: any) => {
                if (!currentUsers.some((x: any) => x.username === mockU.username)) {
                  currentUsers.push({
                    username: mockU.username,
                    fullName: mockU.name,
                    email: mockU.email,
                    phone: mockU.phone,
                    role: 'user',
                    status: 'active'
                  });
                }
              });
              localStorage.setItem('users', JSON.stringify(currentUsers));

              const currentAllLoyalties = JSON.parse(localStorage.getItem('remix_all_loyalty') || '{}');
              defaultLoyaltyData.users.forEach((mockU: any) => {
                const historySeed = [
                  {
                    id: `L-INIT-${mockU.id}`,
                    points: 50,
                    reason: "Đăng ký tài khoản mới thành công",
                    timestamp: "2026-05-20T10:00:00.000Z"
                  },
                  {
                    id: `L-ADD-${mockU.id}`,
                    points: mockU.points - 50,
                    reason: `Tích lũy điểm từ mua sắm đơn hàng REMIX-${Math.floor(Math.random() * 800 + 100)}`,
                    timestamp: "2026-05-21T14:30:00.000Z"
                  }
                ];
                if (!currentAllLoyalties[mockU.username]) {
                  currentAllLoyalties[mockU.username] = {
                    points: mockU.points,
                    tier: mockU.tier,
                    history: historySeed
                  };
                }
              });
              localStorage.setItem('remix_all_loyalty', JSON.stringify(currentAllLoyalties));
            }
          } catch (err) {
            console.error('Seeding loyalty data error:', err);
          }

          // Load loyalty data
          let loyaltyDataObj: any = { settings: {}, users: [] };
          try {
            const savedData = localStorage.getItem('remix_loyalty_users');
            if (savedData) {
              loyaltyDataObj = JSON.parse(savedData);
            }
          } catch (e) {
            console.error(e);
          }

          // Dynamic users and points retrieval
          const storedUsersList = (() => {
            try {
              return JSON.parse(localStorage.getItem('users') || '[]');
            } catch {
              return [];
            }
          })();

          const allLols = getAllLoyaltyData();
          const combinedUserNames = new Set<string>();
          storedUsersList.forEach((u: any) => {
            if (u.username) combinedUserNames.add(u.username);
          });
          Object.keys(allLols).forEach((username) => combinedUserNames.add(username));
          if (loyaltyDataObj && loyaltyDataObj.users) {
            loyaltyDataObj.users.forEach((u: any) => {
              if (u.username) combinedUserNames.add(u.username);
            });
          }

          const mappedUsers = Array.from(combinedUserNames).map((username) => {
            const matchedUser = storedUsersList.find((u: any) => u.username === username);
            const seedUser = loyaltyDataObj.users?.find((u: any) => u.username === username);
            const loyalty = getLoyaltyInfo(username);
            return {
              username,
              id: seedUser?.id || matchedUser?.id || `U-${Math.floor(100 + Math.random() * 900)}`,
              fullName: matchedUser?.fullName || seedUser?.name || username,
              email: matchedUser?.email || seedUser?.email || `${username}@gmail.com`,
              phone: matchedUser?.phone || seedUser?.phone || 'Chưa cung cấp',
              points: loyalty.points,
              tier: loyalty.tier,
              totalSpent: typeof seedUser?.totalSpent === 'number' ? seedUser.totalSpent : (loyalty.points * 10000),
              totalOrders: typeof seedUser?.totalOrders === 'number' ? seedUser.totalOrders : Math.ceil(loyalty.points / 50),
              joinDate: seedUser?.joinDate || matchedUser?.joinDate || '15/01/2026',
              history: loyalty.history || []
            };
          });

          // Hạng thành viên
          const silverCount = mappedUsers.filter(u => u.tier === 'silver').length;
          const goldCount = mappedUsers.filter(u => u.tier === 'gold').length;
          const diamondCount = mappedUsers.filter(u => u.tier === 'diamond').length;

          // Top 10 khách hàng nhiều điểm nhất
          const top10 = [...mappedUsers]
            .sort((a, b) => b.points - a.points)
            .slice(0, 10);

          // Lịch sử đổi điểm toàn hệ thống
          const systemWideHistory = mappedUsers.flatMap(u => 
            u.history.map(log => ({
              ...log,
              username: u.username,
              fullName: u.fullName
            }))
          ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          const saveLoyaltyRateSetting = (val: number) => {
            setLoyaltyRate(val);
            setAdminLoyaltyRateState(val);
          };

          return (
            <main className="flex-grow p-8 space-y-8 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cấu hình &amp; Quản lý Loyalty</h1>
                  <p className="text-gray-500 text-xs mt-1">Tổng quan thành viên, quy tắc tích lũy điểm và toàn bộ lịch sử biến động điểm hệ thống.</p>
                </div>
                <div className="text-xs font-semibold text-[#0C447C] bg-[#0C447C]/5 px-3.5 py-2 rounded-2xl border border-[#0C447C]/10 self-start sm:self-center uppercase tracking-wider">
                  Tổng khách hàng loyalty: <span className="font-black text-sm">{mappedUsers.length}</span>
                </div>
              </div>

              {/* CARD THỐNG KÊ HẠNG & TỈ LỆ TÍCH ĐIỂM */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
                {/* Card 1 — Tổng thành viên */}
                <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1 text-left font-sans">
                    <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Tổng thành viên</span>
                    <h3 className="text-2xl font-black text-[#0C447C]">{mappedUsers.length} <span className="text-xs font-semibold text-gray-400">hội viên</span></h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">
                      Bạc {silverCount} · Vàng {goldCount} · Kim Cương {diamondCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F1FB] text-blue-600 flex items-center justify-center text-xl shrink-0">
                    <Users size={18} className="ti-users text-blue-600 font-bold" />
                  </div>
                </div>

                {/* Card 2 — Điểm đang lưu hành */}
                <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1 text-[#0C447C] text-left font-sans">
                    <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">Điểm đang lưu hành</span>
                    <h3 className="text-2xl font-black text-[#0C447C]">
                      {mappedUsers.reduce((sum, u) => sum + (u.points || 0), 0).toLocaleString('vi-VN')} <span className="text-xs font-semibold text-gray-400">đ</span>
                    </h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">
                      Tổng tích lũy của toàn hội viên
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] text-amber-500 flex items-center justify-center text-xl shrink-0">
                    <Star size={18} className="ti-star text-amber-500 font-bold" />
                  </div>
                </div>

                {/* Card 3 — Lượt đổi điểm */}
                <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1 text-[#0C447C] text-left font-sans">
                    <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">Lượt đổi điểm</span>
                    <h3 className="text-2xl font-black text-[#0C447C]">
                      {(loyaltyDataObj.redeemHistory || []).length} <span className="text-xs font-semibold text-gray-400">lượt</span>
                    </h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">
                      Lịch sử quy đổi ưu đãi quà tặng
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF3DE] text-emerald-600 flex items-center justify-center text-xl shrink-0">
                    <Gift size={18} className="ti-gift text-[#16A34A] font-bold" />
                  </div>
                </div>

                {/* CONFIG LOYALTY RATE */}
                <div className="bg-[#185FA5]/5 border border-[#185FA5]/15 p-5 rounded-[2rem] shadow-sm space-y-2 text-left">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#185FA5] block">Cài đặt tỉ lệ tích điểm</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={adminLoyaltyRate}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v > 0) {
                          saveLoyaltyRateSetting(v);
                        } else if (e.target.value === '') {
                          setAdminLoyaltyRateState('' as any);
                        }
                      }}
                      onBlur={() => {
                        if (adminLoyaltyRate === '' || isNaN(Number(adminLoyaltyRate)) || Number(adminLoyaltyRate) < 1) {
                          saveLoyaltyRateSetting(1);
                        }
                      }}
                      className="w-16 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-center text-sm font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/35 shadow-inner"
                    />
                    <span className="text-xs font-extrabold text-[#185FA5] uppercase tracking-wide">Điểm / 10.000đ</span>
                  </div>
                  <p className="text-[9px] text-gray-500 italic mt-0.5 leading-normal">Khách mua hàng nhận {adminLoyaltyRate || 1} điểm trên mỗi 10.000đ chi tiêu.</p>
                </div>
              </div>

              {/* PHẦN B: BẢNG TOP THÀNH VIÊN (Thành viên tích cực nhất) */}
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-4 font-sans text-left">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                    <Trophy size={18} className="ti-trophy" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 tracking-tight">Thành viên tích cực nhất</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Top 5 khách hàng tích cực tích lũy điểm thưởng hàng đầu hệ thống.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse font-medium text-gray-750">
                    <thead>
                      <tr className="border-b border-gray-100 text-[#A0AEC0] font-black text-[10px] uppercase tracking-wider bg-gray-50/30">
                        <th className="py-3 px-4 text-center w-16">Hạng</th>
                        <th className="py-3 px-4">Tên</th>
                        <th className="py-3 px-4">SĐT</th>
                        <th className="py-3 px-4 text-right">Điểm</th>
                        <th className="py-3 px-4 text-center">Hạng thành viên</th>
                        <th className="py-3 px-4 text-right">Tổng chi</th>
                        <th className="py-3 px-4 text-center">Số đơn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                      {(() => {
                        const top5 = [...mappedUsers]
                          .sort((a, b) => b.points - a.points)
                          .slice(0, 5);

                        return top5.map((u, idx) => {
                          const rank = idx + 1;
                          
                          // Rank Badge styling
                          let rankBadgeClass = "bg-gray-100 text-gray-500";
                          if (rank === 1) rankBadgeClass = "bg-amber-400 font-black text-amber-950 shadow-sm";
                          else if (rank === 2) rankBadgeClass = "bg-slate-200 font-bold text-slate-800";
                          else if (rank === 3) rankBadgeClass = "bg-[#EAF3DE] font-bold text-emerald-800";

                          // Tier Badge styling
                          let tierBadge = null;
                          if (u.tier === 'diamond') {
                            tierBadge = (
                              <span className="inline-flex items-center gap-1 bg-[#E6F1FB] text-[#0C447C] px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">
                                <span className="ti-diamond text-[10px] font-bold"></span>
                                Kim Cương
                              </span>
                            );
                          } else if (u.tier === 'gold') {
                            tierBadge = (
                              <span className="inline-flex items-center gap-1 bg-[#FFF9E6] text-[#744210] px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">
                                <span className="ti-medal text-[10px] font-bold"></span>
                                Vàng
                              </span>
                            );
                          } else {
                            tierBadge = (
                              <span className="inline-flex items-center gap-1 bg-[#F1F5F9] text-[#64748B] px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">
                                <span className="ti-medal text-[10px] font-bold"></span>
                                Bạc
                              </span>
                            );
                          }

                          return (
                            <tr key={u.username} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] ${rankBadgeClass}`}>
                                  {rank}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-black text-gray-900 text-[11px] text-left">
                                {u.fullName}
                                <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-tight">@{u.username}</span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-gray-500 font-bold text-left">{u.phone}</td>
                              <td className="py-3.5 px-4 text-right font-black text-[#0C447C] font-mono text-[13px]">
                                {u.points.toLocaleString('vi-VN')}đ
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {tierBadge}
                              </td>
                              <td className="py-3.5 px-4 text-right font-black text-gray-900 font-mono">
                                {u.totalSpent.toLocaleString('vi-VN')}đ
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                                {u.totalOrders} đơn
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TWO COLUMN GRID: TOP 10 VS LỊCH SỬ HỆ THỐNG */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Cột trái: Top 10 khách hàng điểm cao nhất */}
                <div className="lg:col-span-5 bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                        <TrendingUp size={16} />
                      </div>
                      <h2 className="text-sm font-black text-gray-900 tracking-tight text-left">Top 10 Khách Hàng Thân Thiết</h2>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-[#A0AEC0] font-bold text-[10px] uppercase tracking-wider">
                            <th className="py-2.5">Hạng</th>
                            <th className="py-2.5">Khách hàng</th>
                            <th className="py-2.5 text-right">Tổng điểm</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                          {top10.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-gray-400 font-semibold italic text-[11px]">
                                Chưa có khách hàng tham gia loyalty
                              </td>
                            </tr>
                          ) : (
                            top10.map((u, idx) => {
                              const tierColor = u.tier === 'silver' ? 'bg-slate-500' : u.tier === 'gold' ? 'bg-amber-500 animate-pulse' : 'bg-blue-600 animate-bounce';
                              return (
                                <tr key={u.username} className="hover:bg-gray-50/40 transition-colors">
                                  <td className="py-3">
                                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white ${idx < 3 ? 'bg-[#0C447C] scale-110' : 'bg-gray-300'}`}>
                                      {idx + 1}
                                    </span>
                                  </td>
                                  <td className="py-3">
                                    <div>
                                      <p className="font-bold text-gray-900 text-[11px] text-left">{u.fullName}</p>
                                      <p className="text-[9px] text-gray-400 font-semibold text-left">@{u.username} · {u.phone}</p>
                                    </div>
                                  </td>
                                  <td className="py-3 text-right">
                                    <div className="flex flex-col items-end gap-0.5">
                                      <span className="font-extrabold text-[#0C447C] font-mono">{u.points.toLocaleString('vi-VN')}đ</span>
                                      <span className={`text-[8px] font-bold uppercase text-white px-1.5 py-0.5 rounded ${tierColor}`}>
                                        {u.tier === 'silver' ? 'Bạc' : u.tier === 'gold' ? 'Vàng' : 'Kim Cương'}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Lịch sử toàn hệ thống */}
                <div className="lg:col-span-7 bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                          <History size={16} />
                        </div>
                        <h2 className="text-sm font-black text-gray-900 tracking-tight text-left">Lịch sử giao dịch toàn hệ thống</h2>
                      </div>
                      <span className="text-[10px] font-bold text-[#185FA5] bg-[#185FA5]/10 px-2.5 py-1 rounded-full">{systemWideHistory.length} giao dịch</span>
                    </div>

                    <div className="overflow-x-auto max-h-[420px] custom-scrollbar">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-[#A0AEC0] font-bold text-[10px] uppercase tracking-wider sticky top-0 bg-white z-10">
                            <th className="py-2.5">Thời gian</th>
                            <th className="py-2.5">Khách hàng</th>
                            <th className="py-2.5">Chi tiết hoạt động</th>
                            <th className="py-2.5 text-right">Biến động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                          {systemWideHistory.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-16 text-center text-gray-400 font-semibold italic">
                                Chưa có bất kỳ giao dịch biến động điểm nào trong toàn hệ thống.
                              </td>
                            </tr>
                          ) : (
                            systemWideHistory.map((log) => {
                              const isAdd = log.points >= 0;
                              const d = new Date(log.timestamp);
                              const hString = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                              const dString = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

                              return (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-3 text-gray-400 text-[10px] whitespace-nowrap">
                                    <div>{dString}</div>
                                    <div className="font-semibold text-[9px] text-gray-300">{hString}</div>
                                  </td>
                                  <td className="py-3 text-left">
                                    <span className="font-bold text-gray-800">@{log.username}</span>
                                    <span className="text-[9px] text-gray-400 block font-semibold">{log.fullName}</span>
                                  </td>
                                  <td className="py-3 text-gray-700 text-[11px] leading-snug font-medium text-left">
                                    {log.reason}
                                  </td>
                                  <td className="py-3 text-right font-bold font-mono whitespace-nowrap">
                                    <span className={isAdd ? 'text-emerald-600 font-extrabold' : 'text-red-500 font-extrabold'}>
                                      {isAdd ? `+${log.points}` : log.points} điểm
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* BRAND NEW SECTION: DANH SÁCH HỘI VIÊN LOYALTY */}
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-[#0C447C]/10 rounded-2xl text-[#0C447C]">
                      <Gift size={20} />
                    </div>
                    <div className="text-left font-sans">
                      <h2 className="text-base font-black text-gray-900 tracking-tight">Danh Sách Hội Viên Loyalty</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Tìm kiếm khách hàng, xem thứ hạng, cấp bậc và điều chỉnh điểm số thủ công.</p>
                    </div>
                  </div>

                  {/* Filter & Search controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm theo tên, email, sđt..."
                        value={loyaltySearch}
                        onChange={(e) => setLoyaltySearch(e.target.value)}
                        className="pl-9 pr-4 py-2 w-full sm:w-60 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C447C]/20 focus:bg-white text-gray-800 shadow-inner"
                      />
                    </div>
                    <select
                      value={loyaltyTierFilter}
                      onChange={(e) => setLoyaltyTierFilter(e.target.value as any)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-850 focus:outline-none focus:ring-2 focus:ring-[#0C447C]/20 shadow-inner"
                    >
                      <option value="all">Tất cả hạng</option>
                      <option value="silver">Hạng Bạc 🥈</option>
                      <option value="gold">Hạng Vàng 🥇</option>
                      <option value="diamond">Hạng Kim Cương 💎</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[#A0AEC0] font-black text-[10px] uppercase tracking-wider bg-gray-50/50">
                        <th className="py-3 px-4">Mã KH</th>
                        <th className="py-3 px-4">Khách Hàng</th>
                        <th className="py-3 px-2 text-center">Hạng</th>
                        <th className="py-3 px-4 text-right">Ví Điểm</th>
                        <th className="py-3 px-4 text-right">Tổng Chi Tiêu</th>
                        <th className="py-3 px-4 text-center">Tổng Đơn</th>
                        <th className="py-3 px-4 text-center">Ngày Gia Nhập</th>
                        <th className="py-3 px-4 text-right">Hành Động</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                      {(() => {
                        const filtered = mappedUsers.filter(u => {
                          const query = loyaltySearch.toLowerCase().trim();
                          const matchesQuery = !query || 
                            u.fullName.toLowerCase().includes(query) ||
                            u.email.toLowerCase().includes(query) ||
                            u.phone.includes(query) ||
                            u.username.toLowerCase().includes(query) ||
                            u.id.toLowerCase().includes(query);

                          const matchesTier = loyaltyTierFilter === 'all' || u.tier === loyaltyTierFilter;
                          return matchesQuery && matchesTier;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={8} className="py-16 text-center text-gray-400 font-semibold italic">
                                Không tìm thấy hội viên nào khớp với bộ lọc dữ liệu.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((u) => {
                          const tierBadge = u.tier === 'silver' 
                            ? { text: 'Bạc', icon: '🥈', color: 'bg-slate-500/10 text-slate-800 border-slate-200' }
                            : u.tier === 'gold' 
                              ? { text: 'Vàng', icon: '🥇', color: 'bg-amber-500/10 text-amber-700 border-amber-200' }
                              : { text: 'Kim Cương', icon: '💎', color: 'bg-blue-600/10 text-blue-900 border-blue-200' };

                          return (
                            <tr key={u.username} className="hover:bg-gray-50/60 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-gray-650">{u.id}</td>
                              <td className="py-3 px-4">
                                <div className="text-left font-sans">
                                  <p className="font-extrabold text-gray-900 text-[11px]">{u.fullName}</p>
                                  <p className="text-[9px] text-gray-400 font-semibold">@{u.username} · {u.email} · {u.phone}</p>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border ${tierBadge.color}`}>
                                  <span>{tierBadge.icon}</span>
                                  <span>{tierBadge.text}</span>
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-black text-[#0C447C] text-sm">
                                {u.points.toLocaleString('vi-VN')}đ
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">
                                {u.totalSpent.toLocaleString('vi-VN')}₫
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-extrabold text-emerald-600">
                                {u.totalOrders}
                              </td>
                              <td className="py-3 px-4 text-center text-gray-400 font-mono text-[10px]">
                                {u.joinDate}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdjustPointsUser(u.username);
                                    setAdjustPointsValue(50);
                                    setAdjustPointsReason('Tặng điểm khuyến khích');
                                  }}
                                  className="px-2.5 py-1.5 bg-[#0C447C]/5 hover:bg-[#0C447C] hover:text-white text-[#0C447C] font-black rounded-xl text-[10px] uppercase tracking-wider transition-all border border-[#0C447C]/10 cursor-pointer active:scale-95 flex items-center gap-1 inline-flex"
                                >
                                  <Coins size={10} />
                                  Cộng/Trừ Điểm
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PHẦN D: CÀI ĐẶT LOYALTY */}
              <div id="loyalty-settings-section" className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-6 font-sans text-left">
                <div className="flex items-center gap-2 border-b border-gray-150 pb-4">
                  <div className="p-2.5 bg-[#185FA5]/10 rounded-2xl text-[#185FA5]">
                    <Settings size={20} className="ti-settings font-bold" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 tracking-tight">Cài đặt chương trình điểm thưởng</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cấu hình tỉ lệ tích điểm, các mốc phân hạng thành viên và mốc đổi điểm thưởng.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cột trái: Tỷ lệ quy đổi & ngưỡng thăng hạng */}
                  <div className="space-y-4">
                    <div className="bg-gray-50/50 p-4.5 rounded-2xl border border-gray-150 space-y-3">
                      <span className="text-[10px] font-black text-[#185FA5] uppercase tracking-wider block">Tỉ lệ quy đổi điểm</span>
                      <div className="flex items-center gap-2 font-semibold text-xs text-gray-700">
                        <span>Cứ mỗi</span>
                        <input
                          type="number"
                          value={moneyPerPoint}
                          onChange={(e) => setMoneyPerPoint(parseInt(e.target.value, 10) || 0)}
                          className="w-24 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-center text-xs font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/35 shadow-inner font-mono"
                        />
                        <span>đồng = 1 điểm</span>
                      </div>
                      <p className="text-[9px] text-[#A0AEC0] italic font-medium leading-normal">Khách mua hàng nhận 1 điểm trên mỗi đơn vị chi tiêu cấu hình.</p>
                    </div>

                    <div className="bg-gray-50/50 p-4.5 rounded-2xl border border-gray-150 space-y-3">
                      <span className="text-[10px] font-black text-[#185FA5] uppercase tracking-wider block">Ngưỡng lên hạng</span>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span className="text-gray-500 font-bold">Bạc (Silver):</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={silverMin}
                              disabled
                              className="w-24 bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1 text-center text-xs font-black text-gray-450 cursor-not-allowed font-mono"
                            />
                            <span className="text-gray-400 text-[11px]">điểm (cố định)</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between font-bold text-xs">
                          <span className="text-gray-600 font-bold">Vàng (Gold):</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={goldMin}
                              onChange={(e) => setGoldMin(parseInt(e.target.value, 10) || 0)}
                              className="w-24 bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-center text-xs font-black text-gray-850 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/25 shadow-inner font-mono"
                            />
                            <span className="text-gray-500 text-[11px]">điểm</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between font-bold text-xs">
                          <span className="text-gray-600 font-bold">Kim Cương (Diamond):</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={diamondMin}
                              onChange={(e) => setDiamondMin(parseInt(e.target.value, 10) || 0)}
                              className="w-24 bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-center text-xs font-black text-gray-850 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/25 shadow-inner font-mono"
                            />
                            <span className="text-gray-500 text-[11px]">điểm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: Danh sách phần thưởng quy đổi */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#185FA5] uppercase tracking-wider block">Danh sách phần thưởng có thể đổi</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewRewardPoints(150);
                          setNewRewardValue('Voucher Giảm Giá 30K');
                          setNewRewardCode('REWARD30K');
                          setShowAddRewardModal(true);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-1 border-none cursor-pointer"
                      >
                        <Plus size={10} />
                        Thêm phần thưởng
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-gray-150 rounded-2xl bg-gray-50/20 max-h-[220px] custom-scrollbar">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-150 text-[#A0AEC0] font-black text-[10px] uppercase tracking-wider bg-gray-50/50 sticky top-0 z-10">
                            <th className="py-2.5 px-4">Điểm cần</th>
                            <th className="py-2.5 px-4">Giá trị</th>
                            <th className="py-2.5 px-4">Mã voucher</th>
                            <th className="py-2.5 px-4 text-center">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                          {(loyaltyDataObj.settings?.rewards || []).map((rew: any) => (
                            <tr key={rew.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-2 px-4 font-black text-[#0C447C] font-mono">{rew.points}</td>
                              <td className="py-2 px-4 text-[11px] font-bold text-gray-900 leading-snug">{rew.value}</td>
                              <td className="py-2 px-4 font-mono font-black text-[#185FA5]">{rew.code}</td>
                              <td className="py-2 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    try {
                                      const updatedRewards = loyaltyDataObj.settings.rewards.filter((r: any) => r.id !== rew.id);
                                      const updatedDataObj = {
                                        ...loyaltyDataObj,
                                        settings: {
                                          ...loyaltyDataObj.settings,
                                          rewards: updatedRewards
                                        }
                                      };
                                      localStorage.setItem('remix_loyalty_users', JSON.stringify(updatedDataObj));
                                      window.dispatchEvent(new Event('remix_loyalty_rate_changed'));
                                      setLoyaltyToast("Mức quy đổi đã được xóa!");
                                      setTimeout(() => setLoyaltyToast(null), 2000);
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold hover:bg-red-50 p-1 rounded transition-colors border-none bg-transparent cursor-pointer"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                          {(!loyaltyDataObj.settings?.rewards || loyaltyDataObj.settings.rewards.length === 0) && (
                            <tr>
                              <td colSpan={4} className="py-10 text-center text-gray-400 font-semibold italic text-[11px]">
                                Chưa cấu hình mức thưởng nào. Click "+ Thêm" để cài đặt.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Nút lưu cấu hình */}
                <div className="flex justify-end pt-4 border-t border-gray-150">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const saved = localStorage.getItem('remix_loyalty_users');
                        let dataObj: any = { settings: {}, users: [], redeemHistory: [] };
                        if (saved) {
                          dataObj = JSON.parse(saved);
                        }
                        
                        // Save settings
                        dataObj.settings = {
                          ...dataObj.settings,
                          moneyPerPoint,
                          silverMin,
                          goldMin,
                          diamondMin,
                          rewards: loyaltyDataObj.settings?.rewards || []
                        };
                        
                        localStorage.setItem('remix_loyalty_users', JSON.stringify(dataObj));
                        
                        // Also dispatch rate changed event to refresh things
                        window.dispatchEvent(new Event('remix_loyalty_rate_changed'));
                        
                        setLoyaltyToast("Đã lưu!");
                        setTimeout(() => {
                          setLoyaltyToast(null);
                        }, 3000);
                      } catch (err) {
                        console.error(err);
                        alert("Có lỗi xảy ra khi lưu cài đặt!");
                      }
                    }}
                    style={{ backgroundColor: '#185FA5' }}
                    className="px-6 py-2.5 hover:opacity-90 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 border-none cursor-pointer"
                  >
                    Lưu cài đặt
                  </button>
                </div>
              </div>

              {/* PHẦN C: LỊCH SỬ ĐỔI ĐIỂM (Lịch sử đổi điểm gần đây) */}
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-600">
                      <History size={16} />
                    </div>
                    <div className="text-left font-sans">
                      <h2 className="text-sm font-black text-gray-900 tracking-tight">Lịch sử đổi điểm gần đây</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Theo dõi tất cả giao dịch quy đổi điểm thưởng lấy voucher ưu đãi gần đây.</p>
                    </div>
                  </div>

                  {/* Search filter for redeem history */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên hội viên, tên quà, mã voucher..."
                      value={redeemHistorySearch}
                      onChange={(e) => setRedeemHistorySearch(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full sm:w-80 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C447C]/20 focus:bg-white text-gray-800 shadow-inner"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse font-medium text-gray-750">
                    <thead>
                      <tr className="border-b border-gray-100 text-[#A0AEC0] font-black text-[10px] uppercase tracking-wider bg-gray-50/50">
                        <th className="py-3 px-4">Ngày</th>
                        <th className="py-3 px-4 text-left">Tên khách</th>
                        <th className="py-3 px-4 text-left">Phần thưởng</th>
                        <th className="py-3 px-4 text-center">Điểm dùng</th>
                        <th className="py-3 px-4 text-right">Mã voucher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                      {(() => {
                        const historyList = loyaltyDataObj.redeemHistory || [];
                        const filteredHistory = historyList.filter((item: any) => {
                          const query = redeemHistorySearch.toLowerCase().trim();
                          if (!query) return true;
                          return (
                            (item.userName || '').toLowerCase().includes(query) ||
                            (item.userId || '').toLowerCase().includes(query) ||
                            (item.reward || '').toLowerCase().includes(query) ||
                            (item.code || '').toLowerCase().includes(query)
                          );
                        });

                        if (filteredHistory.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-gray-400 font-semibold italic text-[11px]">
                                Chưa có giao dịch quy đổi quà tặng nào khớp với từ khóa tìm kiếm.
                              </td>
                            </tr>
                          );
                        }

                        return filteredHistory.map((item: any, index: number) => (
                          <tr key={`${item.code}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4 font-mono text-[10px] text-gray-400">{item.date}</td>
                            <td className="py-3 px-4 font-black text-gray-900 text-[11px] text-left">
                              {item.userName}
                              <span className="text-[9px] text-gray-400 font-semibold font-mono block">ID: {item.userId}</span>
                            </td>
                            <td className="py-3 px-4 text-[#0C447C] font-extrabold text-left">
                              🎁 {item.reward}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-black text-amber-600 font-mono">
                                -{item.pointsUsed}đ
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black text-[#185FA5] text-xs">
                              {item.code}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {adjustPointsUser && (() => {
                const targetUsr = mappedUsers.find(u => u.username === adjustPointsUser);
                const handleAdjustPoints = (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!adjustPointsUser) return;
                  try {
                    addLoyaltyPoints(adjustPointsUser, adjustPointsValue, adjustPointsReason);
                    
                    let savedObj: any = { settings: {}, users: [] };
                    const saved = localStorage.getItem('remix_loyalty_users');
                    if (saved) savedObj = JSON.parse(saved);
                    
                    const matchedSeedIdx = savedObj.users?.findIndex((u: any) => u.username === adjustPointsUser);
                    if (matchedSeedIdx !== undefined && matchedSeedIdx !== -1) {
                      const currentPoints = savedObj.users[matchedSeedIdx].points || 0;
                      const newPts = Math.max(0, currentPoints + adjustPointsValue);
                      savedObj.users[matchedSeedIdx].points = newPts;
                      savedObj.users[matchedSeedIdx].tier = newPts < 500 ? 'silver' : newPts < 2000 ? 'gold' : 'diamond';
                      
                      if (adjustPointsValue > 0) {
                        savedObj.users[matchedSeedIdx].totalSpent += (adjustPointsValue * 10000);
                        savedObj.users[matchedSeedIdx].totalOrders += 1;
                      }
                      localStorage.setItem('remix_loyalty_users', JSON.stringify(savedObj));
                    }
                    
                    setAdjustPointsUser(null);
                  } catch(err) {
                    console.error(err);
                  }
                };

                return (
                  <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-gray-900">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 text-left font-sans"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 font-sans">
                        <h3 className="font-extrabold text-[#0C447C] text-sm uppercase tracking-wider font-sans">Điều chỉnh ví điểm Loyalty</h3>
                        <button
                          onClick={() => setAdjustPointsUser(null)}
                          className="text-gray-400 hover:text-gray-600 font-semibold cursor-pointer border-0 bg-transparent text-lg font-sans"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-200/50 font-sans">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans">HỘI VIÊN ĐƯỢC CHỌN:</p>
                        <p className="font-black text-[#0C447C] text-sm mt-0.5 font-sans">{targetUsr?.fullName || adjustPointsUser}</p>
                        <div className="flex justify-between mt-1 text-xs font-sans">
                          <span className="text-gray-500 font-semibold font-sans">Ví điểm hiện có:</span>
                          <span className="font-bold text-gray-800 font-sans">{targetUsr?.points || 0}đ ({targetUsr?.tier?.toUpperCase()})</span>
                        </div>
                      </div>

                      <form onSubmit={handleAdjustPoints} className="space-y-4 font-sans">
                        <div className="space-y-1 font-sans">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Số lượng điểm thay đổi *</span>
                          <div className="flex items-center gap-2 font-sans">
                            <input
                              type="number"
                              required
                              placeholder="VD: 100 hoặc -50..."
                              value={adjustPointsValue}
                              onChange={(e) => setAdjustPointsValue(parseInt(e.target.value, 10) || 0)}
                              className="w-full px-3.5 py-2 text-xs font-black border border-gray-250 rounded-xl focus:border-[#185FA5] outline-none transition-all text-gray-900 font-sans"
                            />
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-sans">Điểm</span>
                          </div>
                          <span className="text-[9px] text-gray-400 italic block mt-0.5 font-sans">Mẹo: Nhập số âm (VD: -100) để trừ bớt điểm.</span>
                        </div>

                        <div className="space-y-1 font-sans">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Lý do thay đổi *</span>
                          <input
                            type="text"
                            required
                            placeholder="VD: Cộng điểm chăm sóc khách hàng..."
                            value={adjustPointsReason}
                            onChange={(e) => setAdjustPointsReason(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs font-semibold border border-gray-250 rounded-xl focus:border-[#185FA5] outline-none transition-all text-gray-900 font-sans"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 font-sans">
                          <button
                            type="button"
                            onClick={() => setAdjustPointsUser(null)}
                            className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-100 rounded-xl border-none cursor-pointer font-sans"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white bg-[#0C447C] hover:bg-[#072a4f] rounded-xl border-none shadow-sm cursor-pointer active:scale-95 transition-all font-sans"
                          >
                            Xác nhận đổi điểm
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                );
              })()}

              {showAddRewardModal && (() => {
                const handleAddReward = (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!newRewardValue.trim() || !newRewardCode.trim()) return;
                  try {
                    let savedObj: any = { settings: { rewards: [] }, users: [] };
                    const saved = localStorage.getItem('remix_loyalty_users');
                    if (saved) savedObj = JSON.parse(saved);
                    
                    if (!savedObj.settings.rewards) savedObj.settings.rewards = [];
                    
                    const newId = `R-${Date.now()}`;
                    savedObj.settings.rewards.push({
                      id: newId,
                      points: newRewardPoints,
                      value: newRewardValue,
                      code: newRewardCode
                    });
                    localStorage.setItem('remix_loyalty_users', JSON.stringify(savedObj));
                    
                    window.dispatchEvent(new Event('remix_loyalty_rate_changed'));
                    setShowAddRewardModal(false);
                  } catch(err) {
                    console.error(err);
                  }
                };

                return (
                  <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-gray-900">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 text-left font-sans"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 font-sans">
                        <h3 className="font-extrabold text-[#0C447C] text-sm uppercase tracking-wider font-sans">Thêm cơ cấu đổi thưởng mới</h3>
                        <button
                          onClick={() => setShowAddRewardModal(false)}
                          className="text-gray-400 hover:text-gray-600 font-semibold cursor-pointer border-0 bg-transparent text-lg font-sans"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleAddReward} className="space-y-4 font-sans">
                        <div className="space-y-1 font-sans">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Tên phần quà *</span>
                          <input
                            type="text"
                            required
                            placeholder="VD: Voucher giảm 50.000đ, hoặc Quà lưu niệm..."
                            value={newRewardValue}
                            onChange={(e) => setNewRewardValue(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs font-semibold border border-gray-250 rounded-xl focus:border-[#185FA5] outline-none transition-all text-gray-900 font-sans"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 font-sans font-medium">
                          <div className="space-y-1 font-sans">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Điểm quy đổi *</span>
                            <input
                              type="number"
                              required
                              min="1"
                              placeholder="VD: 300..."
                              value={newRewardPoints}
                              onChange={(e) => setNewRewardPoints(parseInt(e.target.value, 10) || 0)}
                              className="w-full px-3.5 py-2 text-xs font-black border border-gray-250 rounded-xl focus:border-[#185FA5] outline-none transition-all text-gray-950 font-sans"
                            />
                          </div>
                          <div className="space-y-1 font-sans font-medium">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Mã khuyến mãi *</span>
                            <input
                              type="text"
                              required
                              placeholder="VD: REWARD50K..."
                              value={newRewardCode}
                              onChange={(e) => setNewRewardCode(e.target.value.toUpperCase())}
                              className="w-full px-3.5 py-2 text-xs font-mono font-bold tracking-wider border border-gray-250 rounded-xl focus:border-[#185FA5] outline-none transition-all text-gray-900 font-sans"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 font-sans">
                          <button
                            type="button"
                            onClick={() => setShowAddRewardModal(false)}
                            className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-100 rounded-xl border-none cursor-pointer font-sans"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl border-none shadow-sm cursor-pointer active:scale-95 transition-all font-sans"
                          >
                            Tạo phần quà
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                );
              })()}

            </main>
          )})()}

        {activeSubTab === 'accounts' && (
          <main className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-[#fcfdfe]">
            <AdminAccountsView />
          </main>
        )}

        {activeSubTab === 'customers' && (
          <main className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-[#fcfdfe]">
            <AdminCustomersView />
          </main>
        )}
      </div>

      {showAddProductModal && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 font-sans text-gray-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-[#0C447C] text-sm uppercase tracking-wider">Thêm sản phẩm mới</h3>
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-400 hover:text-gray-600 font-semibold cursor-pointer border-0 bg-transparent text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tên sản phẩm *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Sony WH-CH520..."
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Danh mục *</label>
                  <select 
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-250 rounded-xl focus:border-[#185FA5] outline-none transition-all bg-white font-medium text-gray-900"
                  >
                    <option value="Tai nghe">Tai nghe</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Điện thoại">Điện thoại</option>
                    <option value="Smartwatch">Smartwatch</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Giá bán (VNĐ) *</label>
                  <input 
                    type="number" 
                    required
                    min="1000"
                    placeholder="27990000..."
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-bold text-gray-950"
                  />
                </div>
              </div>

              {/* Product illustration config */}
              <div className="space-y-1.5 border border-gray-150 rounded-2xl p-3 bg-gray-50/50">
                <label className="text-[10px] font-black text-[#0C447C] uppercase tracking-widest block">Hình ảnh minh họa</label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div className="sm:col-span-1 bg-white border border-gray-200 rounded-xl aspect-square flex items-center justify-center overflow-hidden shadow-inner relative group h-20 w-20 mx-auto">
                    {newProdImage ? (
                      <>
                        <img src={newProdImage} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          type="button" 
                          onClick={() => setNewProdImage('')}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-bold border-none cursor-pointer"
                        >
                          Xóa ảnh
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] text-gray-400 text-center font-bold px-1">Chưa có ảnh</span>
                    )}
                  </div>

                  <div className="sm:col-span-3 space-y-2 text-left">
                    <input 
                      type="text" 
                      placeholder="Nhập Link URL ảnh minh họa..."
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full px-3 py-1.5 text-[11px] border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900"
                    />
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        id="new-product-img-upload" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setNewProdImage(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden" 
                      />
                      <label 
                        htmlFor="new-product-img-upload"
                        className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-250 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 select-none shadow-sm active:scale-95"
                      >
                        Chọn file từ máy
                      </label>
                      <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider">Hỗ trợ JPG, PNG, WEBP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mô tả ngắn *</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Nhập mô tả ngắn gọn về sản phẩm (2 dòng)..."
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Thông số kỹ thuật *</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Nhập thông số kỹ thuật chi tiết (3 dòng)..."
                  value={newProdSpecs}
                  onChange={(e) => setNewProdSpecs(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Khuyến mãi</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Giảm 10% đến 31/5 (để trống nếu không có)"
                  value={newProdPromo}
                  onChange={(e) => setNewProdPromo(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900"
                />
              </div>

              {/* Branch distribution selector */}
              <div className="space-y-2 border border-blue-100 rounded-2xl p-3.5 bg-blue-50/50 text-left">
                <label className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest block">Chọn chi nhánh phân phối *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getBranchesFromStorage().filter((b: any) => b.status === 'active' || b.active !== false).map((branch: any) => {
                    const isChecked = newProdSelectedBranches.includes(branch.id);
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setNewProdSelectedBranches(newProdSelectedBranches.filter(b => b !== branch.id));
                          } else {
                            setNewProdSelectedBranches([...newProdSelectedBranches, branch.id]);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 font-sans cursor-pointer ${
                          isChecked 
                            ? 'bg-[#185FA5] border-[#185FA5] text-white shadow-sm scale-[1.02] font-black' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 font-bold'
                        }`}
                      >
                        <Building size={14} className={`mb-1 ${isChecked ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-[9px] uppercase tracking-tight text-center">{branch.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 border border-gray-150 rounded-2xl p-3 bg-gray-50/50">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Tồn kho các chi nhánh SHOWROOM</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getBranchesFromStorage().filter((b: any) => b.status === 'active' || b.active !== false).map((branch: any) => {
                    const isSelected = newProdSelectedBranches.includes(branch.id);
                    return (
                      <div key={branch.id} className={`space-y-1 bg-white p-2 rounded-xl border flex flex-col items-center transition-all duration-200 ${isSelected ? 'border-gray-100 opacity-100 shadow-xs' : 'border-gray-200 opacity-35 bg-gray-100/50'}`}>
                        <label className="text-[9px] font-bold text-gray-500 uppercase block text-center truncate w-full">{branch.name}</label>
                        <input 
                          type="number" 
                          min="0"
                          required={isSelected}
                          disabled={!isSelected}
                          placeholder="0"
                          value={isSelected ? (newProdStocks[branch.id] || '0') : '0'}
                          onChange={(e) => setNewProdStocks({ ...newProdStocks, [branch.id]: e.target.value })}
                          className="w-16 text-center text-xs font-bold border-0 border-b border-gray-200 focus:border-[#185FA5] focus:ring-0 outline-none p-0.5 mt-0.5 bg-transparent"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 hover:bg-gray-100 text-gray-500 rounded-xl text-xs font-bold transition-all border border-gray-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#185FA5] hover:bg-[#14508c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#185FA5]/15 cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 font-sans text-gray-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-[#0C447C] text-sm uppercase tracking-wider">Sửa sản phẩm</h3>
                <span className="text-[10px] font-mono font-black text-[#185FA5]">{editingProduct.id}</span>
              </div>
              <button 
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 font-semibold cursor-pointer border-0 bg-transparent text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Tên sản phẩm *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Sony WH-CH520..."
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Danh mục *</label>
                  <select 
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-250 rounded-xl focus:border-[#185FA5] outline-none transition-all bg-white font-sans text-gray-900 font-medium"
                  >
                    <option value="Tai nghe">Tai nghe</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Điện thoại">Điện thoại</option>
                    <option value="Smartwatch">Smartwatch</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Giá bán (VNĐ) *</label>
                  <input 
                    type="number" 
                    required
                    min="1000"
                    placeholder="27990000..."
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-semibold"
                  />
                </div>
              </div>

              {/* Product illustration config */}
              <div className="space-y-1.5 border border-gray-150 rounded-2xl p-3 bg-gray-50/50">
                <label className="text-[10px] font-black text-[#0C447C] uppercase tracking-widest block font-sans">Hình ảnh minh họa</label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div className="sm:col-span-1 bg-white border border-gray-200 rounded-xl aspect-square flex items-center justify-center overflow-hidden shadow-inner relative group h-20 w-20 mx-auto cursor-pointer">
                    {editProdImage ? (
                      <>
                        <img src={editProdImage} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          type="button" 
                          onClick={() => setEditProdImage('')}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-bold border-none cursor-pointer"
                        >
                          Xóa ảnh
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] text-gray-400 text-center font-bold px-1">Chưa có ảnh</span>
                    )}
                  </div>

                  <div className="sm:col-span-3 space-y-2 text-left font-sans">
                    <input 
                      type="text" 
                      placeholder="Nhập Link URL ảnh minh họa..."
                      value={editProdImage}
                      onChange={(e) => setEditProdImage(e.target.value)}
                      className="w-full px-3 py-1.5 text-[11px] border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900 font-sans"
                    />
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        id="edit-product-img-upload" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setEditProdImage(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden" 
                      />
                      <label 
                        htmlFor="edit-product-img-upload"
                        className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-250 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 select-none shadow-sm active:scale-95 font-sans"
                      >
                        Chọn file từ máy
                      </label>
                      <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider font-sans">Hỗ trợ JPG, PNG, WEBP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mô tả ngắn *</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Nhập mô tả ngắn gọn về sản phẩm (2 dòng)..."
                  value={editProdDescription}
                  onChange={(e) => setEditProdDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Thông số kỹ thuật *</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Nhập thông số kỹ thuật chi tiết (3 dòng)..."
                  value={editProdSpecs}
                  onChange={(e) => setEditProdSpecs(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Khuyến mãi</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Giảm 10% đến 31/5 (để trống nếu không có)"
                  value={editProdPromo}
                  onChange={(e) => setEditProdPromo(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Hình ảnh minh họa</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Đường dẫn URL hình ảnh (ví dụ: https://...)"
                    value={editProdImage}
                    onChange={(e) => setEditProdImage(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-medium text-gray-900"
                  />
                  <div>
                    <input 
                      type="file" 
                      id="file-edit-prod-image" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setEditProdImage(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label 
                      htmlFor="file-edit-prod-image"
                      className="whitespace-nowrap px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 p-2 select-none"
                    >
                      <Upload size={12} />
                      Tải file
                    </label>
                  </div>
                </div>
                {editProdImage && (
                  <div className="mt-2 relative inline-block bg-slate-50 p-1.5 rounded-2xl border border-gray-200 shadow-xs">
                    <img 
                      src={editProdImage} 
                      alt="Xem trước hình ảnh" 
                      className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setEditProdImage('')}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[9px] font-black border-none cursor-pointer shadow-md transition-all active:scale-90"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Branch distribution selector */}
              <div className="space-y-2 border border-blue-100 rounded-2xl p-3.5 bg-blue-50/50 text-left">
                <label className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest block">Chọn chi nhánh phân phối *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getBranchesFromStorage().filter((b: any) => b.status === 'active' || b.active !== false).map((branch: any) => {
                    const isChecked = editProdSelectedBranches.includes(branch.id);
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setEditProdSelectedBranches(editProdSelectedBranches.filter(b => b !== branch.id));
                          } else {
                            setEditProdSelectedBranches([...editProdSelectedBranches, branch.id]);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 font-sans cursor-pointer ${
                          isChecked 
                            ? 'bg-[#185FA5] border-[#185FA5] text-white shadow-sm scale-[1.02] font-black' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 font-bold'
                        }`}
                      >
                        <Building size={14} className={`mb-1 ${isChecked ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-[9px] uppercase tracking-tight text-center">{branch.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 border border-gray-150 rounded-2xl p-3 bg-gray-50/50">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans text-center">Tồn kho các chi nhánh SHOWROOM</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getBranchesFromStorage().filter((b: any) => b.status === 'active' || b.active !== false).map((branch: any) => {
                    const isSelected = editProdSelectedBranches.includes(branch.id);
                    return (
                      <div key={branch.id} className={`space-y-1 bg-white p-2 rounded-xl border flex flex-col items-center transition-all duration-200 ${isSelected ? 'border-gray-100 opacity-100 shadow-xs' : 'border-gray-200 opacity-35 bg-gray-100/50'}`}>
                        <label className="text-[9px] font-bold text-gray-500 uppercase block text-center truncate w-full font-sans">{branch.name}</label>
                        <input 
                          type="number" 
                          min="0"
                          required={isSelected}
                          disabled={!isSelected}
                          placeholder="0"
                          value={isSelected ? (editProdStocks[branch.id] || '0') : '0'}
                          onChange={(e) => setEditProdStocks({ ...editProdStocks, [branch.id]: e.target.value })}
                          className="w-16 text-center text-xs font-bold border-0 border-b border-gray-200 focus:border-[#185FA5] focus:ring-0 outline-none p-0.5 mt-0.5 bg-transparent text-gray-950 font-sans"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 hover:bg-gray-150 text-gray-500 rounded-xl text-xs font-bold transition-all border border-gray-200 cursor-pointer font-sans"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#185FA5] hover:bg-[#14508c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer font-sans"
                >
                  Lưu
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Thêm chi nhánh */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl relative animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4 sticky top-0 bg-white z-10">
              <h2 className="text-base font-black text-[#0C447C] uppercase tracking-wider font-sans">Thêm chi nhánh mới</h2>
              <button 
                type="button"
                onClick={() => setShowAddBranchModal(false)}
                className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 font-bold flex items-center justify-center border-0 cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4 text-left">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Mã CN *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="VD: Q10..."
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-bold uppercase"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Tên chi nhánh *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: Chi nhánh Quận 10"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Địa chỉ chi tiết đầy đủ *</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Nhập địa chỉ đầy đủ của chi nhánh..."
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Số điện thoại *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: 028.3838.1234"
                    value={newBranchPhone}
                    onChange={(e) => setNewBranchPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Email chi nhánh (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="Ví dụ: q10@remix.vn"
                    value={newBranchEmail}
                    onChange={(e) => setNewBranchEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Giờ mở cửa *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: 8:00 - 21:00"
                  value={newBranchHours}
                  onChange={(e) => setNewBranchHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Tên quản lý *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: Nguyễn Anh Tuấn..."
                    value={newBranchManager}
                    onChange={(e) => setNewBranchManager(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">SĐT quản lý *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: 0901234567..."
                    value={newBranchManagerPhone}
                    onChange={(e) => setNewBranchManagerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800">Có hỗ trợ giao hàng không?</span>
                    <span className="text-[10px] text-gray-400">Bật nếu chi nhánh có giao hàng tận nơi</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setNewBranchHasDelivery(!newBranchHasDelivery)}
                    className={`w-9.5 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 outline-none border-0 ${newBranchHasDelivery ? 'bg-[#185FA5]' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${newBranchHasDelivery ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                  </button>
                </div>

                {newBranchHasDelivery && (
                  <div className="space-y-1 pt-1.5 border-t border-gray-100/50 animate-in fade-in duration-200">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Phí giao hàng (VNĐ) *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      placeholder="Ví dụ: 20000"
                      value={newBranchDeliveryFee}
                      onChange={(e) => setNewBranchDeliveryFee(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans flex items-center justify-between">
                  <span>Khu vực giao hàng</span>
                  <span className="text-[9px] font-normal text-gray-400 normal-case">(Phân tách bằng dấu phẩy)</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ví dụ: Quận 1, Quận 3, Quận 10..."
                  value={newBranchDeliveryArea}
                  onChange={(e) => setNewBranchDeliveryArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Trạng thái hoạt động</label>
                <select 
                  value={newBranchStatus}
                  onChange={(e) => setNewBranchStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-250 rounded-xl focus:border-[#185FA5] outline-none transition-all bg-white font-sans text-gray-900 font-medium"
                >
                  <option value="active">Đang mở cửa / Hoạt động</option>
                  <option value="inactive">Tạm ngưng hoạt động</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2 hover:bg-gray-150 text-gray-500 rounded-xl text-xs font-bold transition-all border border-gray-200 cursor-pointer font-sans bg-transparent"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#185FA5] hover:bg-[#0C447C] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer font-sans border-0"
                >
                  Lưu
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Sửa chi nhánh */}
      {showEditBranchModal && editingBranch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl relative animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4 sticky top-0 bg-white z-10">
              <h2 className="text-base font-black text-[#0C447C] uppercase tracking-wider font-sans">Cập nhật chi nhánh</h2>
              <button 
                type="button"
                onClick={() => {
                  setShowEditBranchModal(false);
                  setEditingBranch(null);
                }}
                className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 font-bold flex items-center justify-center border-0 cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBranch} className="space-y-4 text-left">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1 bg-gray-50 px-3 py-2 rounded-xl border border-gray-150 flex flex-col justify-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans leading-none">Mã CN</span>
                  <span className="text-xs font-bold text-gray-800 font-mono mt-1.5 block leading-none">{editingBranch.id}</span>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Tên chi nhánh *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: Chi nhánh Quận 10"
                    value={editBranchName}
                    onChange={(e) => setEditBranchName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Địa chỉ chi tiết đầy đủ *</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Nhập địa chỉ đầy đủ của chi nhánh..."
                  value={editBranchAddress}
                  onChange={(e) => setEditBranchAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Số điện thoại *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: 028.3838.1234"
                    value={editBranchPhone}
                    onChange={(e) => setEditBranchPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Email chi nhánh (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="Ví dụ: q10@remix.vn"
                    value={editBranchEmail}
                    onChange={(e) => setEditBranchEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Giờ mở cửa *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: 8:00 - 21:00"
                  value={editBranchHours}
                  onChange={(e) => setEditBranchHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Tên quản lý *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: Nguyễn Anh Tuấn..."
                    value={editBranchManager}
                    onChange={(e) => setEditBranchManager(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">SĐT quản lý *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: 0901234567..."
                    value={editBranchManagerPhone}
                    onChange={(e) => setEditBranchManagerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800">Có hỗ trợ giao hàng không?</span>
                    <span className="text-[10px] text-gray-400">Bật nếu chi nhánh có giao hàng tận nơi</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setEditBranchHasDelivery(!editBranchHasDelivery)}
                    className={`w-9.5 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 outline-none border-0 ${editBranchHasDelivery ? 'bg-[#185FA5]' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${editBranchHasDelivery ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                  </button>
                </div>

                {editBranchHasDelivery && (
                  <div className="space-y-1 pt-1.5 border-t border-gray-100/50 animate-in fade-in duration-200">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Phí giao hàng (VNĐ) *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      placeholder="Ví dụ: 20000"
                      value={editBranchDeliveryFee}
                      onChange={(e) => setEditBranchDeliveryFee(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans flex items-center justify-between">
                  <span>Khu vực giao hàng</span>
                  <span className="text-[9px] font-normal text-gray-400 normal-case">(Phân tách bằng dấu phẩy)</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ví dụ: Quận 1, Quận 3, Quận 10..."
                  value={editBranchDeliveryArea}
                  onChange={(e) => setEditBranchDeliveryArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#185FA5] outline-none transition-all font-sans text-gray-900 font-medium resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-sans">Trạng thái hoạt động</label>
                <select 
                  value={editBranchStatus}
                  onChange={(e) => setEditBranchStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-250 rounded-xl focus:border-[#185FA5] outline-none transition-all bg-white font-sans text-gray-900 font-medium"
                >
                  <option value="active">Đang mở cửa / Hoạt động</option>
                  <option value="inactive">Tạm ngưng hoạt động</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditBranchModal(false);
                    setEditingBranch(null);
                  }}
                  className="px-4 py-2 hover:bg-gray-150 text-gray-500 rounded-xl text-xs font-bold transition-all border border-gray-200 cursor-pointer font-sans bg-transparent"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#185FA5] hover:bg-[#0C447C] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer font-sans border-0"
                >
                  Lưu
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Chi tiết đơn hàng */}
      {showDetailModal && selectedDetailedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          {/* Inject dynamic print stylesheet */}
          <style>{`
            @media print {
              body {
                background: #ffffff !important;
                color: #000000 !important;
              }
              /* Hide everything else */
              body > * {
                display: none !important;
              }
              /* Show ONLY print area */
              #print-invoice-modal {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                z-index: 9999999 !important;
                background: white !important;
                padding: 40px 24px !important;
                margin: 0 !important;
                overflow: visible !important;
                max-height: none !important;
                border: none !important;
                box-shadow: none !important;
              }
              .no-print {
                display: none !important;
              }
              .print-border-b {
                border-bottom: 1px solid #e2e8f0 !important;
              }
              .print-text-dark {
                color: #1a202c !important;
              }
            }
          `}</style>

          <motion.div 
            id="print-invoice-modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl relative animate-in fade-in zoom-in duration-200 font-sans text-gray-900"
          >
            {/* Header / Brand */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-6">
              <div>
                <span className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest block pb-0.5">Phiếu xuất kho & Hóa đơn chốt</span>
                <h2 className="text-lg font-black text-[#0C447C] uppercase tracking-wider flex items-center gap-2 mt-0.5">
                  Đơn hàng <span className="font-mono text-[#185FA5] text-xs px-2.5 py-1 rounded-xl bg-blue-50 font-black">{selectedDetailedOrder.id}</span>
                </h2>
                <div className="text-[11px] text-gray-400 font-semibold font-sans mt-1">
                  Ngày đặt: <span className="text-gray-600 font-bold">{selectedDetailedOrder.date || selectedDetailedOrder.time || "22/05/2026"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-10 h-10 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#185FA5] flex items-center justify-center border-0 cursor-pointer transition-all"
                  title="In hóa đơn (A5/A4)"
                >
                  <Printer size={16} />
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedDetailedOrder(null);
                  }}
                  className="w-10 h-10 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 font-bold flex items-center justify-center border-0 cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content segment */}
            <div className="space-y-6 text-gray-800">
              
              {/* STATUS STEPPER TIMELINE (HORIZONTAL) */}
              <div className="bg-gray-50/70 border border-gray-100/80 p-5 rounded-2xl relative z-10">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block no-print">Trạng thái xử lý</div>
                
                {/* Horizontal flow line wrappers */}
                <div className="relative flex items-center justify-between mx-3 sm:mx-6">
                  {/* Stepper Base Line */}
                  <div className="absolute top-[14px] left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
                  
                  {/* Stepper Dynamic Active Progress Line */}
                  <div 
                    className={`absolute top-[14px] left-0 h-0.5 z-0 transition-all duration-300 ${
                      modalStatus === 'cancelled' ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{
                      width: `${
                        modalStatus === 'processing' ? '0%' :
                        modalStatus === 'confirmed' ? '33.3%' :
                        modalStatus === 'shipping' ? '66.6%' : '100%'
                      }`
                    }}
                  ></div>

                  {/* Stepper circles */}
                  {[
                    { key: 'processing', label: 'Chờ xác nhận' },
                    { key: 'confirmed', label: 'Đã xác nhận' },
                    { key: 'shipping', label: 'Đang giao' },
                    modalStatus === 'cancelled' 
                      ? { key: 'cancelled', label: 'Đã hủy' }
                      : { key: 'delivered', label: 'Đã giao' }
                  ].map((step, idx, arr) => {
                    // Check order
                    const currentStepIdx = 
                      modalStatus === 'processing' ? 0 :
                      modalStatus === 'confirmed' ? 1 :
                      modalStatus === 'shipping' ? 2 : 3;

                    const isCompleted = idx < currentStepIdx;
                    const isActive = idx === currentStepIdx;
                    const isStepCancelled = step.key === 'cancelled';

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        {/* Circle badge */}
                        <div 
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 border-2 ${
                            isCompleted 
                              ? (modalStatus === 'cancelled' ? 'bg-rose-500 border-rose-500 text-white' : 'bg-blue-600 border-blue-600 text-white')
                              : isActive 
                                ? (isStepCancelled ? 'bg-rose-100 border-rose-500 text-rose-600 ring-4 ring-rose-50' : 'bg-blue-50 border-blue-600 text-[#185FA5] ring-4 ring-blue-50')
                                : 'bg-white border-gray-300 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={12} className="stroke-[3]" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>

                        {/* Title text */}
                        <span 
                          className={`text-[9px] sm:text-[11px] font-extrabold mt-2 whitespace-nowrap tracking-tight transition-all duration-300 ${
                            isCompleted 
                              ? 'text-gray-800' 
                              : isActive 
                                ? (isStepCancelled ? 'text-rose-600' : 'text-blue-700') 
                                : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two columns: Customer information & Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Customer Details info block */}
                <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 print-border-b">
                  <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <User size={13} className="text-[#185FA5]" />
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông tin khách nhận</h4>
                  </div>
                  
                  <div className="space-y-3.5 text-xs leading-relaxed">
                    <div>
                      <span className="text-gray-400 block text-[9px] font-black uppercase tracking-wider">Họ và tên</span>
                      <span className="font-bold text-gray-900 text-sm print-text-dark">{selectedDetailedOrder.customerName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-400 block text-[9px] font-black uppercase tracking-wider">Số điện thoại</span>
                        <span className="font-mono font-bold text-gray-900 print-text-dark">{selectedDetailedOrder.phone || 'Chưa cung cấp'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] font-black uppercase tracking-wider">Showroom xuất</span>
                        <span className="font-semibold text-blue-700">{selectedDetailedOrder.branch || 'Default Showroom'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[9px] font-black uppercase tracking-wider">Địa chỉ giao hàng</span>
                      <span className="font-semibold text-gray-800 leading-normal block">{selectedDetailedOrder.address || 'Chưa cung cấp'}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Notes / Order Notes layout */}
                <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between print-border-b">
                  <div>
                    <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2 mb-3">
                      <Mail size={13} className="text-[#185FA5]" />
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ghi chú của khách</h4>
                    </div>
                    <p className="text-xs text-gray-600 bg-white border border-gray-100 p-3 rounded-xl min-h-[80px] italic leading-relaxed whitespace-pre-line font-medium text-slate-700">
                      {selectedDetailedOrder.note || "Khách yêu cầu bọc chống xước chống va đập thật kỹ. Giao sản phẩm nguyên hộp nguyên vỏ bọc hộp để làm quà biếu, giao trước 17h chiều ngày hành chính."}
                    </p>
                  </div>

                  <div className="text-[10px] text-gray-400 font-bold text-right pt-2 border-t border-gray-100/50">
                    Kênh đặt: <span className="text-[#185FA5]">Trợ lý AI (Tự động)</span>
                  </div>
                </div>
              </div>

              {/* PRODUCT ITEM TABLE (TÊN + SỐ LƯỢNG + GIÁ) */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                <div className="bg-gray-50/60 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <div className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest">Danh mục hàng hóa mua hàng</div>
                  <span className="text-[10px] font-bold text-gray-400">SL: 1 mặt hàng</span>
                </div>
                
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50/10 text-gray-400 border-b border-gray-100">
                      <th className="px-4 py-2.5 text-left font-black uppercase text-[9px]">Sản phẩm chốt</th>
                      <th className="px-4 py-2.5 text-center font-black uppercase text-[9px] w-[80px]">Mã sản phẩm</th>
                      <th className="px-4 py-2.5 text-center font-black uppercase text-[9px] w-[60px]">SL</th>
                      <th className="px-4 py-2.5 text-right font-black uppercase text-[9px] w-[120px]">Đơn giá</th>
                      <th className="px-4 py-2.5 text-right font-black uppercase text-[9px] w-[120px]">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/20">
                      {/* Name */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-extrabold text-gray-900 leading-snug">{selectedDetailedOrder.productName}</div>
                        <div className="text-[9px] font-medium text-gray-400 mt-0.5">Thời gian chốt: {selectedDetailedOrder.time || "Ngay lập tức"}</div>
                      </td>
                      {/* Product SKU placeholder */}
                      <td className="px-4 py-3.5 text-center align-middle font-mono font-bold text-[10px] text-gray-400">
                        HD-{selectedDetailedOrder.id.replace(/\D/g, '') || "8821"}
                      </td>
                      {/* Quantity */}
                      <td className="px-4 py-3.5 text-center align-middle font-black text-gray-700">
                        1
                      </td>
                      {/* Unit Price */}
                      <td className="px-4 py-3.5 text-right align-middle font-semibold text-gray-600">
                        {selectedDetailedOrder.price.toLocaleString('vi-VN')}đ
                      </td>
                      {/* Subtotal */}
                      <td className="px-4 py-3.5 text-right align-middle font-bold text-gray-900">
                        {selectedDetailedOrder.price.toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TỔNG TIỀN + PHÍ SHIP + PHƯƠNG THỨC THANH TOÁN */}
              <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 space-y-3.5 max-w-sm ml-auto">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 block">Thanh toán & Giao dịch</div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Cộng tiền hàng:</span>
                    <span className="font-semibold text-gray-900">{selectedDetailedOrder.price.toLocaleString('vi-VN')}đ</span>
                  </div>

                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-gray-900">30.000đ</span>
                  </div>

                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Khuyến mãi vận chuyển:</span>
                    <span>-30.000đ</span>
                  </div>

                  <div className="flex justify-between text-gray-600 font-medium pb-2 border-b border-gray-150/60 border-dashed">
                    <span>Hình thức thanh toán:</span>
                    <span className="font-extrabold text-[#185FA5] uppercase text-[10px] tracking-wider">
                      {selectedDetailedOrder.method || 'COD (Thu hộ)'}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm pt-1">
                    <span className="font-black text-[#0C447C]">Tổng thanh toán:</span>
                    <span className="font-black text-base text-[#0C447C]">
                      {selectedDetailedOrder.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS AREA (STATUS MODIFIER SELECTBOX + PRINT DIRECTIVES) */}
              <div className="bg-blue-50/20 border border-blue-100/50 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between no-print">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Thay đổi trạng thái</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-bold font-sans">Chọn trạng thái mới:</span>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="px-3.5 py-2 bg-white border border-gray-250 hover:border-blue-300 text-xs rounded-xl font-bold font-sans outline-none focus:ring-2 focus:ring-[#185FA5]/10 cursor-pointer transition-all"
                    >
                      <option value="processing">Chờ xác nhận (Vàng nhạt)</option>
                      <option value="confirmed">Đã xác nhận (Xanh dương nhạt)</option>
                      <option value="shipping">Đang giao (Tím nhạt)</option>
                      <option value="delivered">Đã giao (Xanh lá nhạt)</option>
                      <option value="cancelled">Đã hủy (Đỏ nhạt)</option>
                    </select>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 font-semibold italic text-right max-w-xs leading-normal">
                  * Trạng thái này sẽ lưu trữ vĩnh viễn vào bộ dữ liệu bán hàng sau khi bấm nút Lưu.
                </div>
              </div>
            </div>

            {/* Footer buttons (no-print) */}
            <div className="flex justify-end items-center gap-3 pt-5 border-t border-gray-150 mt-6 no-print">
              <button 
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedDetailedOrder(null);
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer font-sans"
              >
                Hủy bỏ
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  updateOrderStatus(selectedDetailedOrder.id, modalStatus as any);
                  setSelectedDetailedOrder(prev => prev ? { ...prev, status: modalStatus } : null);
                  setShowDetailModal(false);
                }}
                className="px-6 py-2.5 bg-[#185FA5] hover:bg-[#0C447C] text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-500/10 border-0 cursor-pointer font-sans"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating adminToasts container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full font-sans">
        {adminToasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="pointer-events-auto bg-white/95 border border-gray-200/80 shadow-2xl rounded-2xl px-5 py-4 flex items-center justify-between gap-3 text-gray-900 border-l-4 border-l-[#185FA5] backdrop-blur-md"
          >
            <div className="text-xs font-bold leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => setAdminToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600 font-extrabold cursor-pointer border-none bg-transparent hover:bg-gray-100 p-1 rounded-full text-[11px]"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>

      {/* Admin Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-gray-100 flex items-center justify-around z-50 px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex flex-col items-center justify-center gap-1.5 text-center flex-1 h-full cursor-pointer bg-transparent border-0 transition-colors ${
            activeSubTab === 'overview' ? 'text-[#185FA5] font-extrabold' : 'text-gray-400 font-medium hover:text-gray-600'
          }`}
          title="Dashboard"
        >
          <LayoutDashboard size={18} />
          <span className="text-[10px] tracking-tight leading-none">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex flex-col items-center justify-center gap-1.5 text-center flex-1 h-full cursor-pointer bg-transparent border-0 transition-colors ${
            activeSubTab === 'products' ? 'text-[#185FA5] font-extrabold' : 'text-gray-400 font-medium hover:text-gray-600'
          }`}
          title="Sản phẩm"
        >
          <Package size={18} />
          <span className="text-[10px] tracking-tight leading-none">Sản phẩm</span>
        </button>
        <button
          onClick={() => setActiveSubTab('branches')}
          className={`flex flex-col items-center justify-center gap-1.5 text-center flex-1 h-full cursor-pointer bg-transparent border-0 transition-colors ${
            activeSubTab === 'branches' ? 'text-[#185FA5] font-extrabold' : 'text-gray-400 font-medium hover:text-gray-600'
          }`}
          title="Chi nhánh"
        >
          <Building size={18} />
          <span className="text-[10px] tracking-tight leading-none">Chi nhánh</span>
        </button>
        <button
          onClick={() => setActiveSubTab('orders-management')}
          className={`flex flex-col items-center justify-center gap-1.5 text-center flex-1 h-full cursor-pointer bg-transparent border-0 transition-colors ${
            activeSubTab === 'orders-management' || activeSubTab === 'history' ? 'text-[#185FA5] font-extrabold' : 'text-gray-400 font-medium hover:text-gray-600'
          }`}
          title="Đơn hàng"
        >
          <ShoppingBag size={18} />
          <span className="text-[10px] tracking-tight leading-none">Đơn hàng</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ai-config')}
          className={`flex flex-col items-center justify-center gap-1.5 text-center flex-1 h-full cursor-pointer bg-transparent border-0 transition-colors ${
            activeSubTab === 'ai-config' ? 'text-[#185FA5] font-extrabold' : 'text-gray-400 font-medium hover:text-gray-600'
          }`}
          title="Cài đặt"
        >
          <Settings size={18} />
          <span className="text-[10px] tracking-tight leading-none">Cài đặt</span>
        </button>
      </nav>
    </div>
  );
}

