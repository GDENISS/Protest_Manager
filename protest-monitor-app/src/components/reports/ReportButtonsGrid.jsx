import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '../contexts/DataContext';
import ReportGenerator from './ReportGenerator';
import {
  Calendar,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart3,
  Download,
  FileText,
  Camera,
  Share2,
  Clock,
  Building,
  Shield
} from 'lucide-react';

const ReportButtonsGrid = () => {
  const { data, metrics, chartData } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(null);

  const reportTypes = [
    {
      id: 'daily-summary',
      title: 'Daily Summary',
      description: 'Complete overview of today\'s activities',
      icon: Calendar,
      color: 'bg-blue-600 hover:bg-blue-700',
      includes: ['Key metrics', 'Active events', 'Risk assessment', 'Hourly breakdown'],
      estimatedSize: '2.5 MB',
      format: ['PDF', 'Excel']
    },
    {
      id: 'spatial-analysis',
      title: 'Spatial Analysis',
      description: 'Geographic insights and hotspot mapping',
      icon: MapPin,
      color: 'bg-green-600 hover:bg-green-700',
      includes: ['Interactive maps', 'Ward analysis', 'Route optimization', 'Deployment zones'],
      estimatedSize: '4.2 MB',
      format: ['PDF', 'Interactive HTML']
    },
    {
      id: 'trend-analysis',
      title: 'Trend Analysis',
      description: 'Historical patterns and predictions',
      icon: TrendingUp,
      color: 'bg-purple-600 hover:bg-purple-700',
      includes: ['Time series charts', 'Growth patterns', 'Seasonal trends', 'Forecasting'],
      estimatedSize: '3.1 MB',
      format: ['PDF', 'PowerBI']
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'Comprehensive security evaluation',
      icon: AlertTriangle,
      color: 'bg-red-600 hover:bg-red-700',
      includes: ['Threat levels', 'Vulnerability maps', 'Response readiness', 'Mitigation strategies'],
      estimatedSize: '2.8 MB',
      format: ['PDF', 'Word Doc']
    },
    {
      id: 'participant-analysis',
      title: 'Participant Analysis',
      description: 'Crowd dynamics and behavioral insights',
      icon: Users,
      color: 'bg-orange-600 hover:bg-orange-700',
      includes: ['Attendance patterns', 'Demographics', 'Movement analysis', 'Engagement metrics'],
      estimatedSize: '2.2 MB',
      format: ['PDF', 'Excel']
    },
    {
      id: 'emergency-response',
      title: 'Emergency Response',
      description: 'Response protocols and resource allocation',
      icon: Shield,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      includes: ['Response times', 'Resource deployment', 'Hospital routing', 'Police coordination'],
      estimatedSize: '3.5 MB',
      format: ['PDF', 'Word Doc']
    },
    {
      id: 'infrastructure-impact',
      title: 'Infrastructure Impact',
      description: 'Effects on roads, transport, and facilities',
      icon: Building,
      color: 'bg-teal-600 hover:bg-teal-700',
      includes: ['Road closures', 'Traffic impact', 'Facility usage', 'Economic impact'],
      estimatedSize: '2.9 MB',
      format: ['PDF', 'Excel']
    },
    {
      id: 'custom-report',
      title: 'Custom Report',
      description: 'Build your own comprehensive report',
      icon: BarChart3,
      color: 'bg-slate-600 hover:bg-slate-700',
      includes: ['Choose components', 'Custom date range', 'Selective data', 'Multiple formats'],
      estimatedSize: 'Variable',
      format: ['PDF', 'Excel', 'PowerBI', 'HTML']
    }
  ];

  const handleGenerateReport = async (reportType) => {
    setIsGenerating(true);
    setSelectedReportType(reportType.id);
    
    try {
      // Generate report based on type
      await ReportGenerator.generate(reportType, { data, metrics, chartData });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
      setSelectedReportType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Available Data</p>
                <p className="text-xl font-bold text-blue-800">{metrics.totalProtests} Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Time Range</p>
                <p className="text-xl font-bold text-green-800">30 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Camera className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Charts Available</p>
                <p className="text-xl font-bold text-purple-800">12 Types</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Share2 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Export Formats</p>
                <p className="text-xl font-bold text-orange-800">4 Options</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Grid */}
      <Card className="bg-white/80 backdrop-blur border-slate-200/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="flex items-center gap-3">
            <Download className="w-6 h-6 text-slate-700" />
            <div>
              <h3 className="text-xl font-bold text-slate-800">Generate Comprehensive Reports</h3>
              <p className="text-sm text-slate-600 font-normal">Create detailed analytics reports with real-time data visualization</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isGenerating = selectedReportType === report.id;
              
              return (
                <Card key={report.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200/50 hover:border-slate-300 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${report.color.split(' ')[0]} opacity-60`}></div>
                  
                  <CardContent className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${report.color.split(' ')[0]} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${report.color.split(' ')[0].replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex gap-1">
                        {report.format.map((format) => (
                          <Badge key={format} variant="secondary" className="text-xs px-2 py-0.5">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-800 group-hover:text-slate-900">
                        {report.title}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {report.description}
                      </p>
                    </div>

                    {/* Includes */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-700">Includes:</p>
                      <div className="space-y-1">
                        {report.includes.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                            <span className="text-xs text-slate-600">{item}</span>
                          </div>
                        ))}
                        {report.includes.length > 3 && (
                          <p className="text-xs text-slate-500">+{report.includes.length - 3} more...</p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-500">Est. Size: {report.estimatedSize}</span>
                        <span className="text-xs text-slate-500">~30-60s</span>
                      </div>
                      
                      <Button 
                        className={`w-full ${report.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
                        onClick={() => handleGenerateReport(report)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Generate Report
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Reports
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share Templates
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Report History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportButtonsGrid;