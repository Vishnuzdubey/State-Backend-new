import { createDeviceCertificateHTML } from '@/templates/deviceCertificateTemplate';
import QRCode from 'qrcode';

export const generateDeviceCertificate = async (deviceData: any): Promise<string> => {
  try {
    // Generate QR code with device IMEI or certificate number
    const qrData = deviceData.certificate_number || deviceData.imei || 'N/A';
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 120,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Generate certificate HTML
    const certificateHTML = createDeviceCertificateHTML(deviceData, qrCodeDataURL);
    return certificateHTML;
  } catch (error) {
    console.error('Failed to generate certificate:', error);
    throw new Error('Failed to generate certificate');
  }
};

export const previewCertificate = async (deviceData: any) => {
  try {
    const certificateHTML = await generateDeviceCertificate(deviceData);
    
    // Open preview in a new window
    const previewWindow = window.open('', '_blank', 'width=900,height=800');
    if (previewWindow) {
      previewWindow.document.write(certificateHTML);
      previewWindow.document.close();
    } else {
      throw new Error('Failed to open preview window. Please allow popups.');
    }
  } catch (error) {
    console.error('Preview failed:', error);
    throw error;
  }
};

export const printCertificate = async (deviceData: any) => {
  try {
    const certificateHTML = await generateDeviceCertificate(deviceData);
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(certificateHTML);
      iframeDoc.close();
      
      // Wait for content to load, then print
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
          
          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 250);
      };
    }
  } catch (error) {
    console.error('Print failed:', error);
    throw error;
  }
};
