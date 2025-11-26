export const createDeviceCertificateHTML = (data: any, qrCodeDataURL: string) => {
  const field = (value?: string | null) => (value && String(value).trim().length ? `- ${value}` : '-');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Activation Slip</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            padding: 30px;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }

        .header-text h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000;
        }

        .header-text p {
            font-size: 13px;
            color: #333;
            line-height: 1.4;
        }

        .qr-code {
            width: 120px;
            height: 120px;
            background: #ddd;
            border: 1px solid #999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #666;
            flex-shrink: 0;
        }

        .qr-code img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .section {
            margin-bottom: 25px;
        }

        .section-title {
            background-color: #b3d9ff;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 15px;
            margin-bottom: 0;
            color: #000;
            border-left: 4px solid #4a90e2;
        }

        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border: 1px solid #ddd;
            border-top: none;
        }

        .detail-item {
            padding: 12px 15px;
            border-right: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            font-size: 13px;
            min-height: 45px;
            display: flex;
            align-items: center;
        }

        .detail-item:nth-child(even) {
            border-right: none;
        }

        .detail-label {
            font-weight: 600;
            color: #333;
        }

        .detail-value {
            color: #000;
            margin-left: 5px;
        }

        .full-width {
            grid-column: 1 / -1;
        }

        .note-section {
            margin-top: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #ff9800;
            display: flex;
            gap: 15px;
        }

        .note-label {
            font-weight: bold;
            font-size: 14px;
            color: #000;
            flex-shrink: 0;
        }

        .note-text {
            font-size: 12px;
            color: #555;
            line-height: 1.5;
        }

        @media print {
            body {
                padding: 0;
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-text">
                <h1>RoadEye Fleet Management System</h1>
            </div>
            <div class="qr-code">
                ${qrCodeDataURL ? `<img src="${qrCodeDataURL}" alt="QR Code" />` : 'QR CODE'}
            </div>
        </div>

        <!-- Activation Details Section -->
        <div class="section">
            <div class="section-title">Activation Details</div>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="detail-label">Certificate No.</span>
                    <span class="detail-value">${field(data?.certificate_number)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Activation Date</span>
                    <span class="detail-value">${data?.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB') : '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Plan Validity</span>
                    <span class="detail-value">${data?.vehicle?.valid_till ? new Date(data.vehicle.valid_till).toLocaleDateString('en-GB') : '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Plan Duration</span>
                    <span class="detail-value">${data?.vehicle?.plan_years ? `${data.vehicle.plan_years} Year(s)` : '-'}</span>
                </div>
            </div>
        </div>

        <!-- Vehicle Details Section -->
        <div class="section">
            <div class="section-title">Vehicle Details</div>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="detail-label">Vehicle No.</span>
                    <span class="detail-value">${field(data?.vehicle?.vehicle_number)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Chassis No.</span>
                    <span class="detail-value">${field(data?.vehicle?.chassis_number)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Engine No.</span>
                    <span class="detail-value">${field(data?.vehicle?.engine_number)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vehicle Type</span>
                    <span class="detail-value">${field(data?.vehicle?.vehicle_type)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vehicle Make</span>
                    <span class="detail-value">${field(data?.vehicle?.vehicle_make)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vehicle Model</span>
                    <span class="detail-value">${field(data?.vehicle?.vehicle_model)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Fuel Type</span>
                    <span class="detail-value">${field(data?.vehicle?.fuel_type)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Entity Type</span>
                    <span class="detail-value">${field(data?.vehicle?.entity_type)}</span>
                </div>
            </div>
        </div>

        <!-- VLT Device Details Section -->
        <div class="section">
            <div class="section-title">VLT Device Details</div>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="detail-label">Manufacturer Name</span>
                    <span class="detail-value">${field(data?.manufacturer)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Model Code</span>
                    <span class="detail-value">${field(data?.VLTD_model_code)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Device Sr. No.</span>
                    <span class="detail-value">${field(data?.serial_number)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">IMEI No.</span>
                    <span class="detail-value">${field(data?.imei)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Distributor</span>
                    <span class="detail-value">${field(data?.distributor)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ICCID No.</span>
                    <span class="detail-value">${field(data?.ICCID)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">eSIM 1</span>
                    <span class="detail-value">${field(data?.eSIM_1)} (${field(data?.eSIM_1_provider)})</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">eSIM 2</span>
                    <span class="detail-value">${field(data?.eSIM_2)} (${field(data?.eSIM_2_provider)})</span>
                </div>
            </div>
        </div>

        <!-- Owner Details Section -->
        <div class="section">
            <div class="section-title">Owner Details</div>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="detail-label">Owner Name</span>
                    <span class="detail-value">${field(data?.vehicle?.owner_name)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">RC Registered Name</span>
                    <span class="detail-value">${field(data?.vehicle?.rc_registered_name)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Owner Phone</span>
                    <span class="detail-value">${field(data?.vehicle?.owner_phone)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Owner Email</span>
                    <span class="detail-value">${field(data?.vehicle?.owner_email)}</span>
                </div>
                <div class="detail-item full-width">
                    <span class="detail-label">Owner Address</span>
                    <span class="detail-value">${field(data?.vehicle?.owner_address)}</span>
                </div>
            </div>
        </div>

        <!-- Note Section -->
        <div class="note-section">
            <div class="note-label">NOTE</div>
            <div class="note-text">
                This is a system generated document and does not require any signature. Please keep it safe for future reference.
            </div>
        </div>
    </div>
</body>
</html>
`;
};