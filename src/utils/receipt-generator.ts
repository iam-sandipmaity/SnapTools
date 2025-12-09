import type { PaymentDetails } from '@/pages/PaymentSuccess';

export const generateReceiptImage = async (paymentDetails: PaymentDetails): Promise<string> => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Set canvas dimensions (A4 size with 96 DPI)
  canvas.width = 794;  // A4 width in pixels (8.27 inches * 96 DPI)
  canvas.height = 1123; // A4 height in pixels (11.69 inches * 96 DPI)

  // Set background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Add header with organization logo
  const logo = new Image();
  await new Promise((resolve, reject) => {
    logo.onload = resolve;
    logo.onerror = reject;
    logo.src = '/logo.png';
  });
  const logoWidth = 160;
  const logoHeight = (logo.height / logo.width) * logoWidth;
  const headerStartY = 40;
  ctx.drawImage(logo, (canvas.width - logoWidth) / 2, headerStartY, logoWidth, logoHeight);

  const headerSpacing = 30;
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 24px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  // ctx.fillText('All in One Tool', canvas.width / 2, headerStartY + logoHeight + headerSpacing);
  ctx.font = '16px Inter, system-ui, sans-serif';
  ctx.fillText('Kolkata, India', canvas.width / 2, headerStartY + logoHeight + headerSpacing * 2);

  // Add success checkmark
  const checkmarkY = headerStartY + logoHeight + headerSpacing * 3 + 20;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 180, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e20';
  ctx.fill();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 15, 180);
  ctx.lineTo(canvas.width / 2 - 5, 195);
  ctx.lineTo(canvas.width / 2 + 15, 165);
  ctx.stroke();

  // Add receipt title
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.fillText('Donation Receipt', canvas.width / 2, 240);

  // Add payment details
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '20px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  
  const details = [
    ...(paymentDetails.name ? [['Name:', paymentDetails.name]] : []),
    ...(paymentDetails.email ? [['Email:', paymentDetails.email]] : []),
    ...(paymentDetails.mobile ? [['Mobile:', paymentDetails.mobile]] : []),
    ['Payment ID:', paymentDetails.razorpay_payment_id],
    ['Amount:', `${paymentDetails.amount} ${paymentDetails.currency}`],
    ['Status:', paymentDetails.status],
    ['Date:', paymentDetails.timestamp]
    
  ];

  // Add a light gray background for details section
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(50, 280, canvas.width - 100, details.length * 50 + 20);
  
  details.forEach(([label, value], index) => {
    const y = 310 + (index * 50);
    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 80, y);
    // Value
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'medium 18px Inter, system-ui, sans-serif';
    ctx.fillText(value as string, 300, y);
  });

  // Add thank you message
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'italic 20px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Thank you for your generous donation!', canvas.width / 2, canvas.height - 150);
  
  // Add website link
  // Add footer with website and date
  ctx.fillStyle = '#3b82f6';
  ctx.font = '16px Inter, system-ui, sans-serif';
  ctx.fillText('https://snaptools.sandipmaity.me/', canvas.width / 2, canvas.height - 80);
  
  // Add generated date
  ctx.fillStyle = '#64748b';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, canvas.height - 50);
  
  // Convert canvas to image
  return canvas.toDataURL('image/png');
};