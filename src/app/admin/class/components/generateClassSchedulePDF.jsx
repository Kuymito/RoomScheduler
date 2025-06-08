import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Khmer Font (Example - you'll need the .ttf file and to convert it to base64 or use addFileToVFS) ---
// import { khmerOsSiemreapFont } from './khmerOsSiemreapBase64Font'; // Assume you have this file

const generateClassSchedulePDF = (classDetails, classSchedule, daysOfWeek, classTypeOptions) => {
  if (!classDetails || !classSchedule) {
    alert("No class details or schedule available to generate PDF.");
    return;
  }

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let yPos = 15;

  // --- Register Khmer Font (EXAMPLE) ---
  // If you have the font, you would do something like this:
  // doc.addFileToVFS('KhmerOSSiemreap-Regular.ttf', khmerOsSiemreapFont); // khmerOsSiemreapFont is base64 encoded ttf
  // doc.addFont('KhmerOSSiemreap-Regular.ttf', 'KhmerOSSiemreap', 'normal');
  // const KHMER_FONT = 'KhmerOSSiemreap'; // Use this in setFont

  // For now, we'll use default Helvetica for layout structure.
  const DEFAULT_FONT = 'helvetica'; // Change to KHMER_FONT if using Khmer
  doc.setFont(DEFAULT_FONT);


  // ==== 1. University Header ====
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  // doc.setFont(KHMER_FONT, 'bold'); // For Khmer
  doc.text("National University of Management", pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.setFontSize(12);
  // doc.setFont(KHMER_FONT, 'normal'); // For Khmer
  doc.text("", pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  // doc.setFont(KHMER_FONT, 'bold'); // For Khmer
  doc.text("Class Schedule", pageWidth / 2, yPos, { align: 'center' });
  // doc.text("កាលវិភាគ", pageWidth / 2, yPos, { align: 'center' }); // Khmer
  yPos += 8;
  doc.setFont(undefined, 'normal');

  // Academic Year / Semester info (Example - adapt from classDetails)
  doc.setFontSize(11);
  // doc.setFont(KHMER_FONT, 'normal'); // For Khmer
  const academicInfo = `Semester: ${classDetails.semester} | Generation: ${classDetails.generation} | Group: ${classDetails.group}`;
  // const academicInfoKhmer = `ឆមាសទី: ${classDetails.semester} | ជំនាន់ទី: ${classDetails.generation} | ក្រុម: ${classDetails.group}`;
  doc.text(academicInfo, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;


  // ==== 2. Class Specific Info (like image's left header) ====
  doc.setFontSize(10);
  // doc.setFont(KHMER_FONT, 'normal'); // For Khmer
  const infoCol1X = 14;
  // const infoCol2X = 100; // For a second column if needed

  doc.text(`Shift: ${classDetails.shift}`, infoCol1X, yPos);
  // doc.text(`វេនសិក្សា: ${classDetails.shift}`, infoCol1X, yPos); // Khmer Shift
  yPos += 5;
  // Add more info if needed, e.g., Faculty
  doc.text(`Faculty: ${classDetails.faculty}`, infoCol1X, yPos);
  yPos += 10;


  // ==== 3. Main Schedule Table ====
  // Filter for Mon-Fri or use all days based on your preference
  const weekdays = daysOfWeek.filter(day => !['saturday', 'sunday'].includes(day.toLowerCase())).slice(0, 5); // Mon-Fri
  // Or use all: const weekdaysToDisplay = daysOfWeek;
  
  const tableHeaders = ['Time'];
  // doc.setFont(KHMER_FONT); // Set for headers if using Khmer
  // const khmerDayNames = { monday: "ច័ន្ទ", tuesday: "អង្គារ", wednesday: "ពុធ", thursday: "ព្រហស្បត្តិ៍", friday: "សុក្រ"};
  weekdays.forEach(day => {
    tableHeaders.push(day.charAt(0).toUpperCase() + day.slice(1)); // English Day Name
    // tableHeaders.push(khmerDayNames[day.toLowerCase()] || day); // Khmer Day Name
  });
  doc.setFont(DEFAULT_FONT); // Reset to default if changed for headers

  const tableBody = [];
  const rowData = [classDetails.shift]; // First column is the shift time

  weekdays.forEach(day => {
    const dayKey = day.toLowerCase();
    const scheduleItem = classSchedule[dayKey];
    let cellContent = "-\n-\n-"; // Default for empty slot

    if (scheduleItem && scheduleItem.instructor) {
      const instructorName = scheduleItem.instructor.name || "N/A";
      const instructorSubject = scheduleItem.instructor.subject || scheduleItem.instructor.title || "N/A";
      const classType = classTypeOptions.find(opt => opt.id === scheduleItem.classType)?.label || "N/A";
      
      // doc.setFont(KHMER_FONT); // Set for cell content if using Khmer
      cellContent = `${instructorName}\n${instructorSubject}\n(${classType})`;
    }
    rowData.push(cellContent);
  });
  tableBody.push(rowData);

  // doc.setFont(KHMER_FONT, 'normal'); // Ensure font is set for table content if Khmer

  autoTable(doc, {
    startY: yPos,
    head: [tableHeaders],
    body: tableBody,
    theme: 'grid', // 'striped' or 'grid' or 'plain'
    headStyles: {
      fillColor: [200, 200, 200], // Light gray for header
      textColor: [0, 0, 0],
      font: DEFAULT_FONT, // Ensure header font
      // font: KHMER_FONT, // For Khmer
      fontSize: 10,
      halign: 'center',
    },
    styles: {
      font: DEFAULT_FONT, // Ensure body font
      // font: KHMER_FONT, // For Khmer
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 35, halign: 'center', valign: 'middle' }, // Time column
      // остальные колонки автоширина halign: 'left' или 'center'
    },
    didParseCell: function (data) {
        // To make text appear more centered vertically if it's short
        if (data.cell.section === 'body') {
            data.cell.styles.valign = 'middle';
            data.cell.styles.halign = 'center'; // Center text in cells
        }
    },
    didDrawPage: (data) => {
      yPos = data.cursor.y + 10; // Update yPos after table
    }
  });
  
  if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
     yPos = doc.lastAutoTable.finalY + 10;
  }

  doc.setFont(DEFAULT_FONT); // Reset font

  // ==== 4. Footer / Approval Section ====
  // Check if enough space or add new page
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(10);
  // doc.setFont(KHMER_FONT, 'normal'); // For Khmer

  const dateIssuedX = 14;
  const approvalX = pageWidth - 70; // Adjust as needed

  // Date Issued (like image bottom left)
  // const dateIssuedText = `Date Issued: ${new Date().toLocaleDateString('km-KH-u-nu-latn')}`; // Example Khmer numerals if font supports
  const dateIssuedText = `Date Issued: ${new Date().toLocaleDateString('en-CA')}`;
  // const dateIssuedKhmer = `កាលបរិច្ឆេទចុះ: ${new Date().toLocaleDateString('en-CA')}`;
  doc.text(dateIssuedText, dateIssuedX, yPos);

  // Approval (like image bottom right)
  const approvalTextLine1 = "Seen and Approved by Dean";
  // const approvalTextKhmer1 = "បានឃើញ និងឯកភាព";
  const approvalTextLine2 = "Dean's Name / Signature";
  // const approvalTextKhmer2 = "ព្រឹទ្ធបុរស";

  doc.text(approvalTextLine1, approvalX, yPos, {align: 'center'});
  yPos += 15; // Space for signature
  doc.line(approvalX -15, yPos, approvalX + 35, yPos); // Signature line
  yPos += 5;
  doc.text(approvalTextLine2, approvalX, yPos, {align: 'center'});


  // Final "Generated on" date at the very bottom
  doc.setFontSize(8);
  const generatedDate = `PDF Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}`;
  doc.text(generatedDate, pageWidth - 14, pageHeight - 10, { align: 'right' });


  // ==== Save the PDF ====
  const fileName = `${classDetails.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_timetable.pdf`;
  doc.save(fileName);
};

export default generateClassSchedulePDF;