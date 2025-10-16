'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Calculator, Activity, PieChart as PieChartIcon, FileText, 
  RefreshCw, Calendar, Clock, Filter, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, Users, Euro, Target, Eye, Plus, Download
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Calculation {
  id: number;
  projectName: string;
  created_at: string;
  parameters: {
    building: {
      buildingType: string;
      department: string;
    };
    selectedProduct: {
      Nom: string;
      Particularites: string[];
    };
  };
}

interface DevisInfo {
  id: string;
  reference: string;
  created_at: string;
  status: string;
  client_info: {
    name: string;
  };
  totals: {
    totalTTC: number;
  };
}

interface PieDataItem {
  name: string;
  value: number;
}

const COLORS = ['#86BC29', '#6BA83A', '#4A7C59', '#2D5A3D', '#1A3D2A']

export default function VueGenerale() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [devis, setDevis] = useState<DevisInfo[]>([]);
  const [analysisType, setAnalysisType] = useState<'type' | 'department'>('type');
  const [devisAnalysisType, setDevisAnalysisType] = useState<'status' | 'month'>('status');
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'count' | 'revenue'>('count');
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch des dimensionnements
        const { data: dimensionnements, error: dimError } = await supabase
          .from('dimensionnements')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (dimError) throw dimError;
        setCalculations(dimensionnements || []);

        // Fetch des devis
        const { data: devisData, error: devisError } = await supabase
          .from('devis')
          .select('*')
          .order('created_at', { ascending: false });

        if (devisError) throw devisError;
        setDevis(devisData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Mise en place des listeners pour les deux tables
    const dimensionnementsChannel = supabase
      .channel('dimensionnements-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dimensionnements' }, 
        () => fetchData())
      .subscribe();

    const devisChannel = supabase
      .channel('devis-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devis' }, 
        () => fetchData())
      .subscribe();

    return () => {
      dimensionnementsChannel.unsubscribe();
      devisChannel.unsubscribe();
    };
  }, [supabase, toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch des dimensionnements
      const { data: dimensionnements, error: dimError } = await supabase
        .from('dimensionnements')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (dimError) throw dimError;
      setCalculations(dimensionnements || []);

      // Fetch des devis
      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .select('*')
        .order('created_at', { ascending: false });

      if (devisError) throw devisError;
      setDevis(devisData || []);

      toast({
        title: "Données actualisées",
        description: "Les statistiques ont été mises à jour",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les données",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getChartData = () => {
    // Déterminer le nombre de jours selon le filtre
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : timeFilter === '90d' ? 90 : 365;
    
    // Créer un tableau des derniers jours
    const lastDays = [...Array(days)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });

    // Compter les dimensionnements par jour
    return lastDays.map(date => {
      const count = calculations.filter(calc => 
        new Date(calc.created_at).toISOString().split('T')[0] === date
      ).length;

      return {
        date,
        count
      };
    });
  };

  const getCurrentMonthStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthCalcs = calculations.filter(calc => {
      const calcDate = new Date(calc.created_at);
      return calcDate.getMonth() === currentMonth && calcDate.getFullYear() === currentYear;
    });

    const lastMonthCalcs = calculations.filter(calc => {
      const calcDate = new Date(calc.created_at);
      return calcDate.getMonth() === lastMonth && calcDate.getFullYear() === lastMonthYear;
    });

    const growthPercentage = lastMonthCalcs.length > 0 
      ? Math.round(((currentMonthCalcs.length - lastMonthCalcs.length) / lastMonthCalcs.length) * 100)
      : currentMonthCalcs.length > 0 ? 100 : 0;

    return { currentMonthCalcs, growthPercentage };
  };

  const getTotalRevenue = () => {
    return devis
      .filter(d => d.status === 'accepted')
      .reduce((sum, d) => sum + (d.totals?.totalTTC || 0), 0);
  };

  const getAverageProjectValue = () => {
    const acceptedDevis = devis.filter(d => d.status === 'accepted');
    if (acceptedDevis.length === 0) return 0;
    return getTotalRevenue() / acceptedDevis.length;
  };

  const getConversionRate = () => {
    if (devis.length === 0) return 0;
    const acceptedCount = devis.filter(d => d.status === 'accepted').length;
    return Math.round((acceptedCount / devis.length) * 100);
  };

  const getTopDepartments = () => {
    const deptCounts = calculations.reduce((acc: Record<string, number>, calc) => {
      const dept = calc.parameters?.building?.department || 'Non spécifié';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(deptCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, value]) => ({ name, value }));
  };

  const chartData = getChartData();
  const monthStats = getCurrentMonthStats();
  const totalRevenue = getTotalRevenue();
  const avgProjectValue = getAverageProjectValue();
  const conversionRate = getConversionRate();
  const topDepartments = getTopDepartments();

  const CustomTooltip = ({ 
    active, 
    payload 
  }: { 
    active?: boolean; 
    payload?: Array<{ 
      name: string; 
      value: number; 
    }>; 
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-[#86BC29]">{`${payload[0].value} projets`}</p>
          <p className="text-gray-500 text-sm">
            {Math.round((payload[0].value / calculations.length) * 100)}% du total
          </p>
        </div>
      );
    }
    return null;
  };

  const getDevisChartData = () => {
    // Déterminer le nombre de jours selon le filtre
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : timeFilter === '90d' ? 90 : 365;
    
    // Créer un tableau des derniers jours
    const lastDays = [...Array(days)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });

    return lastDays.map(date => ({
      date,
      count: devis.filter(d => 
        new Date(d.created_at).toISOString().split('T')[0] === date
      ).length
    }));
  };

  const getDevisPieData = () => {
    if (devisAnalysisType === 'status') {
      const statusCounts = devis.reduce((acc: Record<string, number>, d) => {
        const status = d.status === 'draft' ? 'Brouillon' :
                      d.status === 'sent' ? 'Envoyé' :
                      d.status === 'accepted' ? 'Accepté' :
                      d.status === 'rejected' ? 'Refusé' : 'Non spécifié';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value
      }));
    } else {
      // Analyse par mois
      const monthCounts = devis.reduce((acc: Record<string, number>, d) => {
        const month = new Date(d.created_at).toLocaleDateString('fr-FR', { month: 'long' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(monthCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({
          name,
          value
        }));
    }
  };

  const getPieData = (): PieDataItem[] => {
    if (analysisType === 'type') {
      const typeCounts = calculations.reduce((acc: Record<string, number>, calc) => {
        const type = calc.parameters?.selectedProduct?.Particularites?.includes('Geothermie') 
          ? 'Géothermie' 
          : calc.parameters?.selectedProduct?.Particularites?.includes('Aerothermie')
            ? 'Aérothermie'
            : 'Non spécifié';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
  
      return Object.entries(typeCounts).map(([name, value]) => ({
        name,
        value
      }));
    } else {
      const deptCounts = calculations.reduce((acc: Record<string, number>, calc) => {
        const dept = calc.parameters?.building?.department || 'Non spécifié';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});
  
      return Object.entries(deptCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({
          name,
          value
        }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header avec titre et actions */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vue Générale</h1>
          <p className="text-gray-600">Tableau de bord des performances et statistiques</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={timeFilter} onValueChange={(value: '7d' | '30d' | '90d' | '1y') => setTimeFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push('/protected/dimensionnement')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau projet
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-[#86BC29]/10 to-[#86BC29]/5 border-[#86BC29]/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#86BC29] text-sm font-medium">Total Projets</p>
                <p className="text-3xl font-bold text-gray-900">{calculations.length}</p>
              </div>
              <Calculator className="w-8 h-8 text-[#86BC29]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#6BA83A]/10 to-[#6BA83A]/5 border-[#6BA83A]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6BA83A] text-sm font-medium">Chiffre d'affaires</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <Euro className="w-8 h-8 text-[#6BA83A]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#4A7C59]/10 to-[#4A7C59]/5 border-[#4A7C59]/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4A7C59] text-sm font-medium">Taux de conversion</p>
                <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#4A7C59]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#2D5A3D]/10 to-[#2D5A3D]/5 border-[#2D5A3D]/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#2D5A3D] text-sm font-medium">Valeur moyenne</p>
                <p className="text-3xl font-bold text-gray-900">
                  {avgProjectValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <FileText className="w-8 h-8 text-[#2D5A3D]" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Dimensionnements */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#86BC29]/10 rounded-lg">
              <Calculator className="w-6 h-6 text-[#86BC29]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dimensionnements</h2>
              <p className="text-sm text-gray-600">Analyse des projets de dimensionnement</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique linéaire amélioré */}
          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#86BC29]" />
                  Évolution temporelle
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-[#86BC29] rounded-full"></div>
                  Projets créés
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline gap-4 mb-6">
                <div className="text-3xl font-bold text-gray-900">{monthStats.currentMonthCalcs.length}</div>
                <div className={`text-sm font-medium flex items-center px-2 py-1 rounded-full ${
                  monthStats.growthPercentage >= 0 
                    ? 'text-[#86BC29] bg-[#86BC29]/10' 
                    : 'text-red-700 bg-red-100'
                }`}>
                  {monthStats.growthPercentage >= 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(monthStats.growthPercentage)}% vs mois dernier
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { 
                        day: '2-digit',
                        month: '2-digit'
                      })}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)'
                      }}
                      formatter={(value) => [`${value} projets`, '']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#86BC29"
                      strokeWidth={3}
                      dot={{ fill: '#86BC29', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#86BC29' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Analyse par type/département améliorée */}
          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#86BC29]" />
                  Répartition par {analysisType === 'type' ? 'type' : 'département'}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={analysisType === 'type' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAnalysisType('type')}
                    className="text-xs"
                  >
                    Type
                  </Button>
                  <Button
                    variant={analysisType === 'department' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAnalysisType('department')}
                    className="text-xs"
                  >
                    Département
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col lg:flex-row items-center justify-between h-full">
                <div className="w-full lg:w-3/5 h-[200px] lg:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={false}
                      >
                        {getPieData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-2/5 flex flex-col space-y-3 mt-4 lg:mt-0 lg:pl-6">
                  {getPieData().map((entry: any, index: number) => (
                    <motion.div 
                      key={entry.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{entry.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{Math.round((entry.value / calculations.length) * 100)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Section Devis */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6BA83A]/10 rounded-lg">
              <FileText className="w-6 h-6 text-[#6BA83A]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Devis</h2>
              <p className="text-sm text-gray-600">Suivi des devis et performances commerciales</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/protected/devis')}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir tous
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique linéaire des devis */}
          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#6BA83A]" />
                  Évolution des devis
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-[#6BA83A] rounded-full"></div>
                  Devis créés
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline gap-4 mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {devis.filter(d => 
                    new Date(d.created_at).getMonth() === new Date().getMonth()
                  ).length}
                </div>
                <div className="text-sm font-medium flex items-center px-2 py-1 rounded-full bg-[#6BA83A]/10 text-[#6BA83A]">
                  <Calendar className="w-3 h-3 mr-1" />
                  Ce mois
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getDevisChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { 
                        day: '2-digit',
                        month: '2-digit'
                      })}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)'
                      }}
                      formatter={(value) => [`${value} devis`, '']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6BA83A"
                      strokeWidth={3}
                      dot={{ fill: '#6BA83A', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#6BA83A' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Analyse des devis */}
          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#6BA83A]" />
                  Analyse des devis
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={devisAnalysisType === 'status' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDevisAnalysisType('status')}
                    className="text-xs"
                  >
                    Statut
                  </Button>
                  <Button
                    variant={devisAnalysisType === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDevisAnalysisType('month')}
                    className="text-xs"
                  >
                    Mois
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col lg:flex-row items-center justify-between h-full">
                <div className="w-full lg:w-3/5 h-[200px] lg:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getDevisPieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={false}
                      >
                        {getDevisPieData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-2/5 flex flex-col space-y-3 mt-4 lg:mt-0 lg:pl-6">
                  {getDevisPieData().map((entry: any, index: number) => (
                    <motion.div 
                      key={entry.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{entry.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{Math.round((entry.value / devis.length) * 100)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Section Actions rapides */}
      <motion.div 
        className="bg-gradient-to-r from-[#86BC29]/5 to-[#6BA83A]/5 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions rapides</h3>
            <p className="text-gray-600 text-sm">Accédez rapidement aux fonctionnalités principales</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/protected/dimensionnement')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau dimensionnement
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/protected/devis')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Gérer les devis
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/protected/dimensionnement/save')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Projets sauvegardés
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}