import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ExportData {
  dateRange: { from: Date; to: Date };
  metrics: {
    views: number;
    clicks: number;
    ctr: number;
    conversions?: number;
    conversionRate?: number;
  };
  chartData: Array<{ date: string; clicks: number; views: number }>;
  topLinks: Array<any>;
  trafficSources: Array<{ source: string; clicks: number; percentage: number }>;
  deviceStats?: Array<{ type: string; count: number; percentage: number }>;
  browserStats?: Array<{ name: string; count: number; percentage: number }>;
}

export const exportAnalyticsToPDF = (data: ExportData, title: string = 'Analytics Report') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Date Range
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const dateRangeText = `${format(data.dateRange.from, 'MMM dd, yyyy')} - ${format(data.dateRange.to, 'MMM dd, yyyy')}`;
  doc.text(dateRangeText, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Performance Summary', 14, yPosition);
  yPosition += 10;

  const metricsData = [
    ['Metric', 'Value'],
    ['Page Views', data.metrics.views.toLocaleString()],
    ['Link Clicks', data.metrics.clicks.toLocaleString()],
    ['Click-Through Rate', `${data.metrics.ctr}%`],
  ];

  if (data.metrics.conversions !== undefined) {
    metricsData.push(['Conversions', data.metrics.conversions.toLocaleString()]);
  }
  if (data.metrics.conversionRate !== undefined) {
    metricsData.push(['Conversion Rate', `${data.metrics.conversionRate}%`]);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [metricsData[0]],
    body: metricsData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Top Links
  if (data.topLinks.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Performing Links', 14, yPosition);
    yPosition += 10;

    const linksData = data.topLinks.map(link => [
      link.title || 'Untitled',
      link.clicks?.toLocaleString() || '0',
      `${link.ctr?.toFixed(1) || '0'}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Link', 'Clicks', 'CTR']],
      body: linksData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Add new page for traffic sources
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Traffic Sources
  if (data.trafficSources.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Traffic Sources', 14, yPosition);
    yPosition += 10;

    const sourcesData = data.trafficSources.map(source => [
      source.source,
      source.clicks.toLocaleString(),
      `${source.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Source', 'Clicks', 'Percentage']],
      body: sourcesData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Device & Browser Stats
  if (data.deviceStats && data.deviceStats.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Device Statistics', 14, yPosition);
    yPosition += 10;

    const deviceData = data.deviceStats.map(device => [
      device.type,
      device.count.toLocaleString(),
      `${device.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Device Type', 'Count', 'Percentage']],
      body: deviceData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  if (data.browserStats && data.browserStats.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Browser Statistics', 14, yPosition);
    yPosition += 10;

    const browserData = data.browserStats.map(browser => [
      browser.name,
      browser.count.toLocaleString(),
      `${browser.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Browser', 'Count', 'Percentage']],
      body: browserData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `analytics-${format(data.dateRange.from, 'yyyy-MM-dd')}-to-${format(data.dateRange.to, 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};
