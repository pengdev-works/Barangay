import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generates an official printable Barangay Certificate PDF with QR Code verification.
 * @param {Object} cert - Certificate record object
 */
export const generateCertificatePDF = async (cert) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 20;

  // Verification URL embedded in QR Code
  const verificationUrl = `${window.location.origin}/verify-certificate/${cert.id}`;
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 150,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
  } catch (err) {
    console.error('Failed to generate QR Code', err);
  }

  // --- HEADER SECTION ---
  doc.setLineWidth(0.8);
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.rect(margin - 5, margin - 5, pageWidth - (margin - 5) * 2, pageHeight - (margin - 5) * 2);
  doc.setLineWidth(0.3);
  doc.rect(margin - 3, margin - 3, pageWidth - (margin - 3) * 2, pageHeight - (margin - 3) * 2);

  // Header Texts
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('REPUBLIC OF THE PHILIPPINES', pageWidth / 2, 28, { align: 'center' });
  doc.text('PROVINCE OF ABRA / LOCAL GOVERNMENT UNIT', pageWidth / 2, 33, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('BARANGAY POBLACION CENTRAL', pageWidth / 2, 39, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(2, 132, 199); // brand blue
  doc.text('OFFICE OF THE BARANGAY CAPTAIN', pageWidth / 2, 45, { align: 'center' });

  // Divider line
  doc.setLineWidth(0.5);
  doc.setDrawColor(2, 132, 199);
  doc.line(margin + 10, 49, pageWidth - margin - 10, 49);

  // --- CERTIFICATE TITLE ---
  const certTitle = (cert.certificate_type || 'BARANGAY CLEARANCE').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(certTitle, pageWidth / 2, 65, { align: 'center' });

  // Subtitle underline ornament
  doc.setLineWidth(1);
  doc.setDrawColor(15, 23, 42);
  doc.line(pageWidth / 2 - 35, 68, pageWidth / 2 + 35, 68);

  // --- SALUTATION & BODY ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('TO WHOM IT MAY CONCERN:', margin + 10, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);

  const residentName = (cert.resident_name || 'THIS RESIDENT').toUpperCase();
  const address = cert.resident_address || 'Barangay Poblacion Central';
  const purpose = cert.purpose || 'General Legal & Official Purposes';

  let bodyText = `This is to certify that ${residentName}, of legal age, Filipino citizen, and a bona fide resident residing at ${address}, is known to be a person of good moral character and a law-abiding citizen in this community.`;

  if (cert.certificate_type === 'Certificate of Indigency') {
    bodyText = `This is to certify that ${residentName}, residing at ${address}, belongs to an indigent family in this barangay with limited financial resources. This certificate is issued to assist the family in acquiring necessary social, medical, or financial support.`;
  } else if (cert.certificate_type === 'Business Clearance') {
    bodyText = `This is to certify that ${residentName}, operating a business at ${address}, has complied with local barangay requirements and is hereby granted clearance to operate subject to existing municipal ordinances and rules.`;
  }

  const splitBody = doc.splitTextToSize(bodyText, pageWidth - (margin + 10) * 2);
  doc.text(splitBody, margin + 10, 97, { lineHeightFactor: 1.5 });

  let nextY = 97 + splitBody.length * 7 + 6;

  const purposeText = `This ${cert.certificate_type || 'clearance'} is being issued upon the request of the above-named person for the purpose of:`;
  doc.text(purposeText, margin + 10, nextY);

  nextY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`"${purpose.toUpperCase()}"`, pageWidth / 2, nextY, { align: 'center' });

  nextY += 14;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  
  const issueDate = cert.released_at || cert.approved_at || cert.created_at || new Date().toISOString();
  const dateObj = new Date(issueDate);
  const day = dateObj.getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthStr = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  const dateText = `Given and issued this ${day}th day of ${monthStr}, ${year} at the Office of the Barangay Captain, Barangay Poblacion Central.`;
  const splitDate = doc.splitTextToSize(dateText, pageWidth - (margin + 10) * 2);
  doc.text(splitDate, margin + 10, nextY, { lineHeightFactor: 1.4 });

  // --- SIGNATURE SECTION ---
  nextY += 35;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('HON. JUAN DELA CRUZ', pageWidth - margin - 20, nextY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Barangay Captain', pageWidth - margin - 20, nextY + 5, { align: 'right' });

  // --- FOOTER & QR CODE VERIFICATION ---
  const footerY = pageHeight - margin - 30;
  
  doc.setLineWidth(0.4);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 5, footerY - 5, pageWidth - margin - 5, footerY - 5);

  // Render QR Code if available
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', margin + 5, footerY - 2, 26, 26);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('OFFICIAL VERIFICATION QR CODE', margin + 34, footerY + 3);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Scan QR code or visit: ${verificationUrl}`, margin + 34, footerY + 8);
  doc.text(`Control No: ${cert.id}`, margin + 34, footerY + 13);
  doc.text(`O.R. No: ${cert.or_number || 'N/A'}  |  Amount Paid: ₱${parseFloat(cert.amount || 0).toFixed(2)}`, margin + 34, footerY + 18);

  // Save / Download PDF
  const filename = `${cert.certificate_type.replace(/\s+/g, '_')}_${cert.resident_name ? cert.resident_name.replace(/\s+/g, '_') : 'Request'}.pdf`;
  doc.save(filename);
};
