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

      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Force all text to black and aggressively reduce spacing for PDF export
      const forceBlackText = (el: HTMLElement) => {
        // Set text color to black for all elements
        el.style.color = 'black';
        el.style.backgroundColor = 'white';

        // Get computed styles
        const computedStyle = window.getComputedStyle(el);

        // Reduce padding by 70% to maximize width
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);

        if (paddingLeft > 0 || paddingRight > 0 || paddingTop > 0 || paddingBottom > 0) {
          el.style.padding = `${paddingTop * 0.2}px ${paddingRight * 0.2}px ${paddingBottom * 0.2}px ${paddingLeft * 0.2}px`;
        }

        // Reduce horizontal margins by 70%
        const marginLeft = parseFloat(computedStyle.marginLeft);
        const marginRight = parseFloat(computedStyle.marginRight);

        if (marginLeft > 0 || marginRight > 0) {
          el.style.marginLeft = `${marginLeft * 0.2}px`;
          el.style.marginRight = `${marginRight * 0.2}px`;
        }

        // Process all child elements
        Array.from(el.children).forEach((child) => {
          forceBlackText(child as HTMLElement);
        });
      };

      forceBlackText(clonedElement);

      // Force width on cloned element to maximize content width
      clonedElement.style.width = '100%';
      clonedElement.style.maxWidth = 'none';
      clonedElement.style.margin = '0';
      clonedElement.style.padding = '0';

      // Temporarily add the cloned element to the DOM for canvas capture
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '1200px'; // Force a wider container for better width utilization
      tempContainer.style.margin = '0';
      tempContainer.style.padding = '0';
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      // Create canvas from the cloned element
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        logging: false,
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const marginTop = 2;
      const marginBottom = 2;
      const marginLeft = 2;
      const marginRight = 2;
      const availableWidth = pageWidth - marginLeft - marginRight;
      const availableHeight = pageHeight - marginTop - marginBottom;

      // Calculate dimensions - single page only, maximize width usage
      let imgWidth = availableWidth; // Use full width (206mm on A4)
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If content exceeds one page, scale it down to fit
      if (imgHeight > availableHeight) {
        const scaleFactor = availableHeight / imgHeight;
        imgWidth = imgWidth * scaleFactor;
        imgHeight = availableHeight;
      }

      // Position at margins without centering - use full width
      const xPosition = marginLeft;
      const yPosition = marginTop;

      // Add single image to single page - full width
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);

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
