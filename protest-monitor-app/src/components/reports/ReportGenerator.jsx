import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

class ReportGenerator {
  static async generate(reportType, { data, metrics, chartData }) {
    const reportData = this.prepareReportData(reportType, { data, metrics, chartData });
    
    switch (reportType.id) {
      case 'daily-summary':
        return await this.generateDailySummary(reportData);
      case 'spatial-analysis':
        return await this.generateSpatialAnalysis(reportData);
      case 'trend-analysis':
        return await this.generateTrendAnalysis(reportData);
      case 'risk-assessment':
        return await this.generateRiskAssessment(reportData);
      case 'participant-analysis':
        return await this.generateParticipantAnalysis(reportData);
      case 'emergency-response':
        return await this.generateEmergencyResponse(reportData);
      case 'infrastructure-impact':
        return await this.generateInfrastructureImpact(reportData);
      case 'custom-report':
        return await this.generateCustomReport(reportData);
      default:
        throw new Error('Unknown report type');
    }
  }

  static prepareReportData(reportType, { data, metrics, chartData }) {
    const timestamp = new Date().toISOString();
    const protestFeatures = data.protests?.features || [];
    
    return {
      metadata: {
        reportType: reportType.title,
        generatedAt: timestamp,
        generatedBy: 'Protest Monitoring System',
        dataRange: this.getDataRange(protestFeatures),
        totalRecords: protestFeatures.length
      },
      summary: {
        totalEvents: metrics.totalProtests,
        activeEvents: metrics.activeProtests,
        highRiskEvents: metrics.highRiskEvents,
        averageParticipants: metrics.averageParticipants,
        totalHospitals: metrics.totalHospitals,
        totalPoliceStations: metrics.totalPoliceStations
      },
      chartData,
      rawData: {
        protests: protestFeatures,
        hospitals: data.hospitals?.features || [],
        police: data.police?.features || [],
        wards: data.wards?.features || [],
        roads: data.roads?.features || []
      },
      analysis: this.generateAnalysis(protestFeatures, chartData)
    };
  }

  static async generateDailySummary(reportData) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Header
    this.addReportHeader(pdf, 'Daily Summary Report', reportData.metadata);
    
    // Executive Summary
    let yPos = 50;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const summaryText = [
      `Total Events Today: ${reportData.summary.totalEvents}`,
      `Active Events: ${reportData.summary.activeEvents}`,
      `High Risk Events: ${reportData.summary.highRiskEvents}`,
      `Average Participants: ${Math.round(reportData.summary.averageParticipants)}`,
      `Response Resources: ${reportData.summary.totalHospitals} Hospitals, ${reportData.summary.totalPoliceStations} Police Stations`
    ];
    
    summaryText.forEach(text => {
      pdf.text(text, 20, yPos);
      yPos += 6;
    });

    // Key Insights
    yPos += 10;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Insights', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    reportData.analysis.insights.forEach(insight => {
      pdf.text(`• ${insight}`, 20, yPos);
      yPos += 6;
    });

    // Charts (you would capture these from DOM)
    yPos += 15;
    await this.addChartsToPDF(pdf, yPos);
    
    // Download
    const fileName = `daily-summary-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
  }

  static async generateSpatialAnalysis(reportData) {
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for maps
    
    this.addReportHeader(pdf, 'Spatial Analysis Report', reportData.metadata);
    
    // Add map screenshots
    await this.captureMapScreenshot(pdf, 50);
    
    // Spatial insights
    let yPos = 160;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Spatial Distribution Analysis', 20, yPos);
    yPos += 10;
    
    // Ward-wise breakdown
    const wardData = reportData.chartData.regionalDistribution;
    wardData.forEach(ward => {
      pdf.setFontSize(10);
      pdf.text(`${ward.ward}: ${ward.incidents} incidents (${ward.percentage}%)`, 20, yPos);
      yPos += 5;
    });
    
    const fileName = `spatial-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
  }

  static async generateTrendAnalysis(reportData) {
    // Create Excel workbook for trend data
    const wb = XLSX.utils.book_new();
    
    // Incident trends sheet
    const trendWs = XLSX.utils.json_to_sheet(reportData.chartData.incidentTrends);
    XLSX.utils.book_append_sheet(wb, trendWs, 'Incident Trends');
    
    // Participant growth sheet
    const participantWs = XLSX.utils.json_to_sheet(reportData.chartData.participantGrowth);
    XLSX.utils.book_append_sheet(wb, participantWs, 'Participant Growth');
    
    // Risk assessment sheet
    const riskWs = XLSX.utils.json_to_sheet(reportData.chartData.riskAssessment);
    XLSX.utils.book_append_sheet(wb, riskWs, 'Risk Assessment');
    
    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Events', reportData.summary.totalEvents],
      ['Active Events', reportData.summary.activeEvents],
      ['High Risk Events', reportData.summary.highRiskEvents],
      ['Average Participants', reportData.summary.averageParticipants]
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    const fileName = `trend-analysis-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return { success: true, fileName };
  }

  // Helper methods
  static addReportHeader(pdf, title, metadata) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, 25);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date(metadata.generatedAt).toLocaleString()}`, 20, 35);
    pdf.text(`Data Range: ${metadata.dataRange}`, 20, 40);
  }

  static async addChartsToPDF(pdf, yPos) {
    // Capture chart elements from DOM and add to PDF
    const chartElements = document.querySelectorAll('[data-chart]');
    
    for (let element of chartElements) {
      try {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 20, yPos, 160, 80);
        yPos += 90;
        
        if (yPos > pdf.internal.pageSize.getHeight() - 30) {
          pdf.addPage();
          yPos = 20;
        }
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }
  }

  static async captureMapScreenshot(pdf, yPos) {
    const mapElement = document.querySelector('.leaflet-container');
    if (mapElement) {
      try {
        const canvas = await html2canvas(mapElement);
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 20, yPos, 250, 100);
      } catch (error) {
        console.error('Error capturing map:', error);
      }
    }
  }

  static getDataRange(protestFeatures) {
    if (!protestFeatures.length) return 'No data available';
    
    const dates = protestFeatures.map(p => new Date(
      p.properties?.date || p.properties?.created_at || new Date()
    ));
    
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
  }

  static generateAnalysis(protestFeatures, chartData) {
    const insights = [];
    
    if (chartData.incidentTrends.length > 0) {
      const latestTrend = chartData.incidentTrends[chartData.incidentTrends.length - 1];
      insights.push(`Latest day recorded ${latestTrend.incidents} incidents with ${latestTrend.participants} participants`);
    }
    
    if (chartData.regionalDistribution.length > 0) {
      const topWard = chartData.regionalDistribution[0];
      insights.push(`${topWard.ward} has the highest activity with ${topWard.incidents} incidents`);
    }
    
    const highRiskCount = chartData.riskAssessment.find(r => r.level === 'high')?.count || 0;
    if (highRiskCount > 0) {
      insights.push(`${highRiskCount} events are classified as high risk requiring immediate attention`);
    }
    
    return { insights };
  }
}

export default ReportGenerator;