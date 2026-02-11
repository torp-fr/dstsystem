import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFOptions {
  filename: string;
  title?: string;
  company?: string;
  companyDetails?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export const usePdfExport = () => {
  const exportToPDF = async (
    elementId: string,
    options: PDFOptions
  ) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
      }

      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF with page breaks
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Save the PDF
      pdf.save(options.filename);
    } catch (error) {
      console.error('[PDF Export] Error:', error);
      throw error;
    }
  };

  // Export quote to PDF
  const exportQuoteToPDF = async (
    quoteId: string,
    quoteNumber: string
  ) => {
    try {
      await exportToPDF(`quote-${quoteId}`, {
        filename: `${quoteNumber}.pdf`,
        title: 'Devis',
      });
    } catch (error) {
      console.error('[Quote PDF Export] Error:', error);
      throw error;
    }
  };

  // Export invoice to PDF
  const exportInvoiceToPDF = async (
    invoiceId: string,
    invoiceNumber: string
  ) => {
    try {
      await exportToPDF(`invoice-${invoiceId}`, {
        filename: `${invoiceNumber}.pdf`,
        title: 'Facture',
      });
    } catch (error) {
      console.error('[Invoice PDF Export] Error:', error);
      throw error;
    }
  };

  // Export amendment to PDF
  const exportAmendmentToPDF = async (
    amendmentId: string,
    amendmentNumber: string
  ) => {
    try {
      await exportToPDF(`amendment-${amendmentId}`, {
        filename: `${amendmentNumber}.pdf`,
        title: 'Avenant',
      });
    } catch (error) {
      console.error('[Amendment PDF Export] Error:', error);
      throw error;
    }
  };

  // Export deposit to PDF
  const exportDepositToPDF = async (
    depositId: string,
    depositNumber: string
  ) => {
    try {
      await exportToPDF(`deposit-${depositId}`, {
        filename: `${depositNumber}.pdf`,
        title: 'Acompte',
      });
    } catch (error) {
      console.error('[Deposit PDF Export] Error:', error);
      throw error;
    }
  };

  return {
    exportToPDF,
    exportQuoteToPDF,
    exportInvoiceToPDF,
    exportAmendmentToPDF,
    exportDepositToPDF,
  };
};
