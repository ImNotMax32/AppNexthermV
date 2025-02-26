'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUp, ArrowRight, Activity, PieChart as PieChartIcon, Calculator, FileText } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

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

const COLORS = ['#86BC29', '#FFB020', '#0EA5E9', '#F43F5E', '#8B5CF6']

export default function VueGenerale() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [devis, setDevis] = useState<DevisInfo[]>([]);
  const [analysisType, setAnalysisType] = useState<'type' | 'department'>('type');
  const [devisAnalysisType, setDevisAnalysisType] = useState<'status' | 'month'>('status');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  
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


  const getChartData = () => {
    // Créer un tableau des 30 derniers jours
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i)); // Pour avoir les dates dans l'ordre chronologique
      return date.toISOString().split('T')[0];
    });

    // Compter les dimensionnements par jour
    return last30Days.map(date => {
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
    
    const currentMonthCalcs = calculations.filter(calc => {
      const calcDate = new Date(calc.created_at);
      return calcDate.getMonth() === currentMonth && 
             calcDate.getFullYear() === currentYear;
    });

    const lastMonthCalcs = calculations.filter(calc => {
      const calcDate = new Date(calc.created_at);
      return calcDate.getMonth() === (currentMonth - 1) && 
             calcDate.getFullYear() === currentYear;
    });

    const growth = lastMonthCalcs.length > 0
      ? ((currentMonthCalcs.length - lastMonthCalcs.length) / lastMonthCalcs.length) * 100
      : 0;

    return {
      currentCount: currentMonthCalcs.length,
      growth: Math.round(growth)
    };
  };

  const chartData = getChartData();
  const monthStats = getCurrentMonthStats();

  // Calcul des statistiques
  const currentMonth = new Date().getMonth();
  const lastMonth = new Date().getMonth() - 1;

  const currentMonthCalcs = calculations.filter(calc => 
    new Date(calc.created_at).getMonth() === currentMonth
  );

  const lastMonthCalcs = calculations.filter(calc => 
    new Date(calc.created_at).getMonth() === lastMonth
  );

  const growthPercentage = lastMonthCalcs.length > 0
    ? Math.round(((currentMonthCalcs.length - lastMonthCalcs.length) / lastMonthCalcs.length) * 100)
    : 0;

  // Données pour le graphique linéaire
  const last30Days = [...Array(30)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();


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

  const navigateToSavedFiles = () => {
    router.push('/protected/dimensionnement/save');
  };

  const getDevisChartData = () => {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => ({
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


  return (
    <div className="p-6 space-y-4">
      <motion.h1 
        className="text-2xl font-bold text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Vue Générale
      </motion.h1>

      {/* Section Dimensionnements */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg text-gray-400 flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5" />
            Statistiques Dimensionnements
          </h2>
        </motion.div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem', 
            width: '100%', 
            maxWidth: '100%',
            minHeight: '240px'
          }}
        >
        {/* Graphique linéaire */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', minWidth: 0, height: '100%' }}
        >
          <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-lg h-full" style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-600 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent style={{ flex: 1, minHeight: 0, paddingTop: '0.5rem' }}>
              <div className="flex items-baseline gap-4">
                <div className="text-4xl font-bold">{currentMonthCalcs.length}</div>
                <div className={`text-sm font-medium flex items-center ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUp className={`w-4 h-4 mr-1 ${growthPercentage < 0 ? 'rotate-180' : ''}`} />
                  {growthPercentage}% vs mois dernier
                </div>
              </div>
              <div className="mt-2 h-[135px]">
              <ResponsiveContainer width="100%" height={195}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { 
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value) => [`${value} dimensionnements`, '']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long'
                    })}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#86BC29"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analyse des projets */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '100%', minWidth: 0, height: '100%' }}
        >
          <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-lg h-full" style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-gray-600 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Analyse des projets
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={analysisType === 'type' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAnalysisType('type')}
                  >
                    Type
                  </Button>
                  <Button
                    variant={analysisType === 'department' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAnalysisType('department')}
                  >
                    Département
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ flex: 1, minHeight: 0 }}>
              <div className="flex items-center justify-between">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie
                        data={getPieData()}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {getPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-4 space-y-2">
                {getPieData().map((entry: PieDataItem, index: number) => (
                  <div 
                    key={entry.name} 
                    className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-xs text-gray-500">
                        {entry.value} projets ({Math.round((entry.value / calculations.length) * 100)}%)
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </div>

      
    {/* Section Devis */}
    <div className="space-y-4 mt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg text-gray-400 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            Statistiques Devis
          </h2>
        </motion.div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem', 
            width: '100%', 
            maxWidth: '100%',
            minHeight: '240px'
          }}
        >
          {/* Graphique linéaire des devis */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', minWidth: 0, height: '100%' }}
          >
            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-lg h-full" style={{ display: 'flex', flexDirection: 'column' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-600 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent style={{ flex: 1, minHeight: 0, paddingTop: '0.5rem' }}>
                <div className="flex items-baseline gap-4">
                  <div className="text-4xl font-bold">{devis.filter(d => 
                    new Date(d.created_at).getMonth() === new Date().getMonth()
                  ).length}</div>
                  <div className={`text-sm font-medium flex items-center ${
                    devis.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length >= 
                    devis.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth() - 1).length 
                    ? 'text-green-600' : 'text-red-600'}`}>
                    <ArrowUp className={`w-4 h-4 mr-1 ${
                      devis.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length < 
                      devis.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth() - 1).length 
                      ? 'rotate-180' : ''}`} />
                    {Math.abs(Math.round(
                      ((devis.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length - 
                        devis.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth() - 1).length) / 
                        Math.max(devis.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth() - 1).length, 1)) * 100
                    ))}% vs mois dernier
                  </div>
                </div>
                <div className="h-[135px]">
                  <ResponsiveContainer width="100%" height={195}>
                    <LineChart data={getDevisChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { 
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      />
                      <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value) => [`${value} devis`, '']}
                        labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long'
                        })}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#86BC29"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analyse des devis */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ width: '100%', minWidth: 0, height: '100%' }}
          >
            <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-lg h-full" style={{ display: 'flex', flexDirection: 'column' }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg text-gray-600 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    Analyse des devis
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={devisAnalysisType === 'status' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDevisAnalysisType('status')}
                    >
                      Statut
                    </Button>
                    <Button
                      variant={devisAnalysisType === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDevisAnalysisType('month')}
                    >
                      Mois
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent style={{ flex: 1, minHeight: 0 }}>
                <div className="flex items-center justify-between">
                  <div className="w-1/2">
                    <ResponsiveContainer width="100%" height={210}>
                      <PieChart>
                        <Pie
                          data={getDevisPieData()}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {getDevisPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 pl-4 space-y-2">
                    {getDevisPieData().map((entry: PieDataItem, index: number) => (
                      <div 
                        key={entry.name} 
                        className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{entry.name}</div>
                          <div className="text-xs text-gray-500">
                            {entry.value} devis ({Math.round((entry.value / devis.length) * 100)}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}