const nodemailer = require('nodemailer');

const hccEmailUser = process.env.HCC_SMS_EMAIL;
const hccEmailPassword = process.env.HCC_SMS_EMAIL_PASSWORD;

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    logger: true,
    debug: false,
    secureConnection: false,
    auth: {
        user: hccEmailUser,
        pass: hccEmailPassword,
    },
    tls: {
        rejectUnauthorized: true
    }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('Email transporter verification failed:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Application confirmation email template for applicant
const generateApplicationConfirmationTemplate = (applicantName, applicationNumber, course, preferredClassTime, preferredStartDate) => {
    const formattedStartDate = new Date(preferredStartDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Confirmation - Hospitality Competence Center Africa</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #fff7ed;
            line-height: 1.6;
            color: #cc4400;
        }

        a {
            color: #fff;
            font-weight: 600;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(124, 45, 18, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #cc4400 0%, #fb923c 100%);
            padding: 40px 30px;
            text-align: center;
            border-bottom: 4px solid #9a3412;
        }

                .header h1 {
            color: white;
}
        
        .logo-container {
            margin-bottom: 20px;
        }
        
        .logo-text {
            color: #fff;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            color: #cc4400;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            border-bottom: 2px solid #ffedd5;
            padding-bottom: 15px;
        }
        
        .message {
            color: #7c2d12;
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.8;
        }

        .message span {
        font-weight: 600;
        }
        
        .application-number {
            background: #fff;
            color: #9a3412;
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(124, 45, 18, 0.15);
            letter-spacing: 2px;
            border: 2px solid #9a3412;
        }
        
        .info-section {
            background: #fff7ed;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #cc4400;
            margin: 30px 0;
        }
        
        .info-section h3 {
            color: #cc4400;
            margin-bottom: 20px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #fed7aa;
        }
        
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .info-label {
            color: #cc4400;
            font-weight: 600;
            min-width: 200px;
        }
        
        .info-value {
            color: #7c2d12;
            text-align: right;
            flex: 1;
        }
        
        .important-notice {
            background: #fff7ed;
            border: 2px solid #ea580c;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .important-notice h3 {
            color: #cc4400;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .important-notice ul {
            padding-left: 20px;
        }
        
        .important-notice li {
            margin-bottom: 10px;
            color: #cc4400;
            line-height: 1.6;
        }
        
        .important-notice strong {
            color: #d32f2f;
        }
        
        .payment-info {
            background: #fff8e1;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .payment-info h3 {
            color: #cc4400;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .contact-section {
            background: #e3f2fd;
            border: 2px solid #2196f3;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }
        
        .contact-section h3 {
            color: #cc4400;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .contact-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
        }
        
        .contact-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .contact-item strong {
            display: block;
            color: #cc4400;
            margin-bottom: 5px;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            background: #cc4400;
            color: #ffffff;
            border-top: 4px solid #9a3412;
        }
        
        .footer-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 10px;
        }
        
        .contact {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .contact a {
            color: #9a3412;
            text-decoration: none;
        }
        
        .contact a:hover {
            text-decoration: underline;
        }
        
        .social {
        width: 100%;
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            
            .header, .content {
                padding: 30px 20px;
            }
            
            .application-number {
                font-size: 16px;
                padding: 15px;
                letter-spacing: 1px;
            }
            
            .info-item {
                flex-direction: column;
                gap: 5px;
            }
            
            .info-label, .info-value {
                text-align: left;
            }
            
            .contact-info {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <div class="logo-text">Hospitality Competence Center Africa</div>
                <div class="subtitle">Professional Coffee Training & Certification</div>
            </div>
        </div>
        
        <div class="content">
            <h1 class="greeting">Application Received! ✅</h1>
            
            <p class="message">
                Dear <strong>${applicantName}</strong>,
            </p>
            
            <p class="message">
                Thank you for applying to Hospitality Competence Center Africa! We are excited about your interest in our 
                <strong>${course}</strong> program. Your application has been successfully submitted and is now being processed.
            </p>
            
            <div class="application-number">
                Application Reference: ${applicationNumber}
            </div>
            
            <div class="info-section">
                <h3>📋 Application Details</h3>
                <div class="info-item">
                    <span class="info-label">Application Number:</span>
                    <span class="info-value">${applicationNumber}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Course Applied:</span>
                    <span class="info-value">${course}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Preferred Class Time:</span>
                    <span class="info-value">${preferredClassTime}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Preferred Start Date:</span>
                    <span class="info-value">${formattedStartDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Application Status:</span>
                    <span class="info-value">Under Review</span>
                </div>
            </div>
            
            <div class="important-notice">
                <h3>📢 &nbsp; Important Information</h3>
                <ul>
                    <li><strong>Classes Begin Every Monday</strong> - please select your Preferred Class Time via the form</li>
                    <li><strong>Note: Applications are only approved after payment</strong></li>
                    <li>Our admissions team will review your application within 2-3 business days</li>
                    <li>Keep this application number for all future communications</li>
                </ul>
            </div>
            
            <div class="payment-info">
                <h3>💳 &nbsp; Payment Information</h3>
                <p class="message">
                    <span>Bank:</span> &nbsp; Bank details pending<br>
                    <span>Account No:</span> &nbsp; Pending HCC confirmation<br>
                    <span>Account Name:</span> &nbsp; Hospitality Competence Center Africa<br>
                </p>
                <p class="message">
                    Please include your admission number as the reference when making payments.
                </p>
            </div>
            
            <div class="contact-section">
                <h3>📞 &nbsp; Need Assistance?</h3>
                <p class="message">
                    If you have any further questions, please don't hesitate to contact us:
                </p>
                <div class="contact-info">
                    <div class="contact-item">
                        <strong>Phone</strong>
                        <div>+254 781 726 674</div>
                        <div>+254 724 637 787</div>
                    </div>
                    <div class="contact-item">
                        <strong>Email</strong>
                        <div>Contact HCC administration</div>
                        <div>Contact HCC administration</div>
                    </div>
                </div>
            </div>
            
            <p class="message" style="text-align: center; margin-top: 40px;">
                Best Regards,<br>
                <strong>Hospitality Competence Center Africa Admissions Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">Hospitality Competence Center Africa</p>
            <p class="footer-text">HCC address pending</p>
            <p class="contact">
                Email: <a href="#contact-information">Contact HCC administration</a> | 
                Phone: <a href="tel:+254781726674">+254 781 726 674</a>
            </p>
            <p class="footer-text" style="margin-top: 15px;">
                &copy; ${new Date().getFullYear()} Hospitality Competence Center Africa. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
};

// Admin notification email template
const generateAdminNotificationTemplate = (application) => {
    const formattedDate = new Date(application.applicationDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const marketingConsentText = application.marketingConsent
        ? '<span style="color: #ea580c; font-weight: 600;">✓ GRANTED</span>'
        : '<span style="color: #d32f2f; font-weight: 600;">✗ DECLINED</span>';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Application Submitted - Hospitality Competence Center Africa</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
            color: #333;
        }
        
        .container {
            max-width: 700px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #cc4400 0%, #fb923c 100%);
            padding: 30px;
            text-align: center;
            border-bottom: 4px solid #9a3412;
        }
        
        .header h1 {
            color: white;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }
        
        .content {
            padding: 30px;
        }
        
        .alert-banner {
            background: #ffeb3b;
            color: #cc4400;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 600;
            border: 2px solid #ffc107;
        }
        
        .application-summary {
            background: #fff7ed;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 25px;
            border: 2px solid #cc4400;
        }
        
        .summary-item {
            display: flex;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #fed7aa;
        }
        
        .summary-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .summary-label {
            font-weight: 600;
            color: #cc4400;
            min-width: 180px;
        }
        
        .summary-value {
            color: #7c2d12;
            flex: 1;
        }
        
        .section {
            margin: 30px 0;
            padding: 25px;
            border-radius: 8px;
        }
        
        .personal-info {
            background: #fff7ed;
            border: 2px solid #ea580c;
        }
        
        .course-info {
            background: #e3f2fd;
            border: 2px solid #2196f3;
        }
        
        .contact-info {
            background: #f3e5f6;
            border: 2px solid #9c27b0;
        }
        
        .consent-info {
            background: #fff8e1;
            border: 2px solid #ff9800;
        }
        
        .section h3 {
            color: #cc4400;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            margin: 10px 0;
        }
        
        .info-item strong {
            color: #cc4400;
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
        }
        
        .info-item span {
            color: #7c2d12;
            font-size: 15px;
        }
        
        .actions {
            text-align: center;
            margin: 30px 0;
            padding: 25px;
            background: #cc4400;
            border-radius: 8px;
        }

        .actions a {
        color: white;
        font-weight: 600;
        }
        
        .dashboard-btn {
            display: inline-block;
            background: #9a3412;
            color: #cc4400;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 0 10px;
            transition: all 0.3s ease;
        }
        
        .dashboard-btn:hover {
            background: #ffd700;
            transform: translateY(-2px);
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: #f5f5f5;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            
            .header, .content {
                padding: 20px;
            }
            
            .summary-item {
                flex-direction: column;
                gap: 5px;
            }
            
            .summary-label, .summary-value {
                text-align: left;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .actions {
                padding: 20px;
            }
            
            .dashboard-btn {
                display: block;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 NEW APPLICATION SUBMITTED</h1>
            <p>Hospitality Competence Center Africa - Website Application</p>
        </div>
        
        <div class="content">
            <div class="alert-banner">
                ⚡ New student application requires your attention
            </div>
            
            <div class="application-summary">
                <div class="summary-item">
                    <span class="summary-label">Application Number:</span>
                    <span class="summary-value" style="font-weight: 700; color: #cc4400;">${application.applicationNumber}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Submitted On:</span>
                    <span class="summary-value">${formattedDate}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Student Name:</span>
                    <span class="summary-value">${application.firstName} ${application.lastName}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Marketing Consent:</span>
                    <span class="summary-value">${marketingConsentText}</span>
                </div>
            </div>
            
            <div class="section personal-info">
                <h3>👤 Personal Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Full Name</strong>
                        <span>${application.firstName} ${application.lastName}</span>
                    </div>
                    <div class="info-item">
                        <strong>Date of Birth</strong>
                        <span>${new Date(application.dateOfBirth).toLocaleDateString('en-US')}</span>
                    </div>
                    <div class="info-item">
                        <strong>Gender</strong>
                        <span>${application.gender}</span>
                    </div>
                    <div class="info-item">
                        <strong>Nationality</strong>
                        <span>${application.nationality}</span>
                    </div>
                    <div class="info-item">
                        <strong>Religion</strong>
                        <span>${application.religion || 'Not specified'}</span>
                    </div>
                    <div class="info-item">
                        <strong>ID/Passport</strong>
                        <span>${application.idPassport}</span>
                    </div>
                </div>
            </div>
            
            <div class="section course-info">
                <h3>📚 Course Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Course Applied</strong>
                        <span>${application.course}</span>
                    </div>
                    <div class="info-item">
                        <strong>Preferred Start Date</strong>
                        <span>${new Date(application.preferredStartDate).toLocaleDateString('en-US')}</span>
                    </div>
                    <div class="info-item">
                        <strong>Preferred Class Time</strong>
                        <span>${application.preferredClassTime}</span>
                    </div>
                    <div class="info-item">
                        <strong>Application Status</strong>
                        <span style="color: #2196f3; font-weight: 600;">${application.status}</span>
                    </div>
                </div>
            </div>
            
            <div class="section contact-info">
                <h3>📞 Contact Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Email Address</strong>
                        <span>${application.email}</span>
                    </div>
                    <div class="info-item">
                        <strong>Phone Number</strong>
                        <span>${application.phone}</span>
                    </div>
                </div>
                
                <h3 style="margin-top: 20px;">🚨 Emergency Contact</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Name</strong>
                        <span>${application.emergencyContact.firstName} ${application.emergencyContact.lastName}</span>
                    </div>
                    <div class="info-item">
                        <strong>Relationship</strong>
                        <span>${application.emergencyContact.relation}</span>
                    </div>
                    <div class="info-item">
                        <strong>Phone</strong>
                        <span>${application.emergencyContact.phone}</span>
                    </div>
                </div>
            </div>
            
            <div class="section consent-info">
                <h3>✅ Marketing Consent Status</h3>
                <div class="info-item" style="text-align: center; font-size: 18px; padding: 20px;">
                    Marketing Consent for Photos/Videos: ${marketingConsentText}
                </div>
<div class="info-item" style="margin-top: 15px;">
  <strong>Consent Marked On:</strong>
  <span>${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
        }</span>
</div>
            </div>
            
            ${application.additionalInfo ? `
            <div class="section" style="background: #ffebee; border: 2px solid #f44336;">
                <h3>📝 Additional Information</h3>
                <div class="info-item" style="background: white; margin-top: 15px;">
                    <p style="color: #7c2d12; line-height: 1.6;">${application.additionalInfo}</p>
                </div>
            </div>
            ` : ''}
            
            <div class="actions">
                <a href="${process.env.ADMIN_DASHBOARD_URL}/applications" class="dashboard-btn">
                    📊 View in Dashboard
                </a>
                <a href="${process.env.ADMIN_DASHBOARD_URL}/applications" class="dashboard-btn">
                    📋 All Applications
                </a>
            </div>
            
            <p style="text-align: center; color: #666; margin-top: 20px; font-size: 14px;">
                This application was submitted via the website contact form. Please review and process accordingly.
            </p>
        </div>
        
        <div class="footer">
            <p>Hospitality Competence Center Africa - Admissions System</p>
            <p>Auto-generated notification | ${new Date().toLocaleString('en-US')}</p>
        </div>
    </div>
</body>
</html>`;
};

// Send application confirmation to applicant
const sendApplicationConfirmationEmail = async (application) => {
    try {
        const html = generateApplicationConfirmationTemplate(
            `${application.firstName} ${application.lastName}`,
            application.applicationNumber,
            application.course,
            application.preferredClassTime,
            application.preferredStartDate
        );

        await transporter.sendMail({
            from: hccEmailUser,
            to: application.email,
            subject: `Application Received - ${application.applicationNumber} - Hospitality Competence Center Africa`,
            html,
            replyTo: hccEmailUser
        });

        console.log(`✅ Confirmation email sent to: ${application.email}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send confirmation email:', error);
        return false;
    }
};

// Send admin notification email
const sendAdminNotificationEmail = async (application) => {
    try {
        const adminEmail = process.env.HCC_SMS_ADMIN_EMAIL || hccEmailUser;
        const html = generateAdminNotificationTemplate(application);

        await transporter.sendMail({
            from: hccEmailUser,
            to: adminEmail,
            cc: process.env.HCC_SMS_ADMIN_CC_EMAIL ? process.env.HCC_SMS_ADMIN_CC_EMAIL.split(',') : [],
            subject: `📋 New Application: ${application.firstName} ${application.lastName} - ${application.applicationNumber}`,
            html,
            replyTo: application.email
        });

        console.log(`✅ Admin notification sent for application: ${application.applicationNumber}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send admin notification:', error);
        return false;
    }
};

// Send both emails (non-blocking)
const sendApplicationEmails = async (application) => {
    try {
        // Send confirmation to applicant
        sendApplicationConfirmationEmail(application).then(success => {
            if (success) {
                console.log(`✅ Applicant email sent for ${application.applicationNumber}`);
            }
        }).catch(err => {
            console.error(`❌ Error sending applicant email:`, err);
        });

        // Send notification to admin
        sendAdminNotificationEmail(application).then(success => {
            if (success) {
                console.log(`✅ Admin email sent for ${application.applicationNumber}`);
            }
        }).catch(err => {
            console.error(`❌ Error sending admin email:`, err);
        });

        return true;
    } catch (error) {
        console.error('❌ Error in email sending process:', error);
        return false;
    }
};


// Send rejection email
const sendRejectionEmail = async (application) => {
    try {
        const formattedDate = new Date(application.applicationDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Update - Hospitality Competence Center Africa</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #fff7ed;
            line-height: 1.6;
            color: #cc4400;
        }

        a {
            color: #9a3412;
            text-decoration: none;
            font-weight: 600;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(124, 45, 18, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            padding: 40px 30px;
            text-align: center;
            border-bottom: 4px solid #b91c1c;
        }
        
        .logo-container {
            margin-bottom: 20px;
        }
        
        .logo-text {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            color: #dc2626;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            border-bottom: 2px solid #ffedd5;
            padding-bottom: 15px;
        }
        
        .message {
            color: #7c2d12;
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.8;
        }

        .message span {
            font-weight: 600;
        }
        
        .application-number {
            background: #fff;
            color: #dc2626;
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
            letter-spacing: 2px;
            border: 2px solid #dc2626;
        }
        
        .rejection-reason {
            background: #fef2f2;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
            margin: 30px 0;
        }
        
        .rejection-reason h3 {
            color: #dc2626;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .rejection-details {
            background: #fff7ed;
            padding: 25px;
            border-radius: 8px;
            border: 2px solid #fed7aa;
            margin: 30px 0;
        }
        
        .rejection-details h3 {
            color: #cc4400;
            margin-bottom: 20px;
            font-size: 18px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #fed7aa;
        }
        
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .info-label {
            color: #cc4400;
            font-weight: 600;
            min-width: 200px;
        }
        
        .info-value {
            color: #7c2d12;
            text-align: right;
            flex: 1;
        }
        
        .encouragement {
            background: #fff7ed;
            border: 2px solid #ea580c;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .encouragement h3 {
            color: #cc4400;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .contact-section {
            background: #e3f2fd;
            border: 2px solid #2196f3;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }
        
        .contact-section h3 {
            color: #cc4400;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .contact-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
        }
        
        .contact-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .contact-item strong {
            display: block;
            color: #cc4400;
            margin-bottom: 5px;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            background: #dc2626;
            color: #ffffff;
            border-top: 4px solid #b91c1c;
        }
        
        .footer-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 10px;
        }
        
        .contact {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .contact a {
            color: #ffd700;
            text-decoration: none;
        }
        
        .contact a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            
            .header, .content {
                padding: 30px 20px;
            }
            
            .application-number {
                font-size: 16px;
                padding: 15px;
                letter-spacing: 1px;
            }
            
            .info-item {
                flex-direction: column;
                gap: 5px;
            }
            
            .info-label, .info-value {
                text-align: left;
            }
            
            .contact-info {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <div class="logo-text">Hospitality Competence Center Africa</div>
                <div class="subtitle">Professional Coffee Training & Certification</div>
            </div>
        </div>
        
        <div class="content">
            <h1 class="greeting">Application Status Update</h1>
            
            <p class="message">
                Dear <span>${application.firstName} ${application.lastName}</span>,
            </p>
            
            <p class="message">
                Thank you for your application to Hospitality Competence Center Africa. We appreciate your interest in our 
                <strong>${application.course}</strong> program.
            </p>
            
            <div class="application-number">
                Application Reference: ${application.applicationNumber}
            </div>
            
            <div class="rejection-reason">
                <h3>❌ &nbsp; Application Decision</h3>
                <p class="message">
                    After careful review of your application, we regret to inform you that we are unable to 
                    offer you admission to the program at this time.
                </p>
                
                <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px;">
                    <strong style="color: #dc2626; display: block; margin-bottom: 10px;">Reason for Decision:</strong>
                    <p style="color: #7c2d12; line-height: 1.6;">${application.rejectionReason}</p>
                </div>
            </div>
            
            <div class="rejection-details">
                <h3>📋 &nbsp; Application Details</h3>
                <div class="info-item">
                    <span class="info-label">Application Number:</span>
                    <span class="info-value">${application.applicationNumber}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Course Applied:</span>
                    <span class="info-value">${application.course}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Application Date:</span>
                    <span class="info-value">${formattedDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Review Date:</span>
                    <span class="info-value">${new Date(application.reviewDate).toLocaleDateString('en-US')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Final Status:</span>
                    <span class="info-value" style="color: #dc2626; font-weight: 600;">Rejected</span>
                </div>
            </div>
            
            <div class="encouragement">
                <h3>🌟 &nbsp; Future Opportunities</h3>
                <p class="message">
                    We encourage you to:
                </p>
                <ul style="color: #7c2d12; padding-left: 20px; margin: 15px 0;">
                    <li>Consider applying for other programs that might better match your qualifications</li>
                    <li>Reapply in the future after gaining additional experience or qualifications</li>
                    <li>Explore our short courses and workshops that may be of interest</li>
                    <li>Follow our social media for updates on new programs and opportunities</li>
                </ul>
            </div>
            
            <div class="contact-section">
                <h3>📞 &nbsp; Questions or Concerns?</h3>
                <p class="message">
                    If you have any questions about this decision or would like feedback on your application, 
                    please don't hesitate to contact our admissions team:
                </p>
                <div class="contact-info">
                    <div class="contact-item">
                        <strong>Admissions Office</strong>
                        <div>+254 781 726 674</div>
                        <div>+254 724 637 787</div>
                    </div>
                    <div class="contact-item">
                        <strong>Email</strong>
                        <div>Contact HCC administration</div>
                    </div>
                </div>
            </div>
            
            <p class="message" style="text-align: center; margin-top: 40px;">
                We wish you the best in your future endeavors.<br>
                <strong>Hospitality Competence Center Africa Admissions Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">Hospitality Competence Center Africa</p>
            <p class="footer-text">HCC address pending</p>
            <p class="contact">
                Email: <a href="#contact-information">Contact HCC administration</a> | 
                Phone: <a href="tel:+254781726674">+254 781 726 674</a>
            </p>
            <p class="footer-text" style="margin-top: 15px;">
                &copy; ${new Date().getFullYear()} Hospitality Competence Center Africa. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;

        const mailOptions = {
            from: hccEmailUser,
            to: application.email,
            subject: `Application Decision - ${application.applicationNumber} - Hospitality Competence Center Africa`,
            html,
            replyTo: hccEmailUser
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Rejection email sent to ${application.email}:`, info.messageId);
        return true;
        
    } catch (error) {
        console.error('❌ Error sending rejection email:', error);
        throw error;
    }
};

// Send admission confirmation email
const sendAdmissionConfirmationEmail = async (student, application) => {
    try {
        const formattedAdmissionDate = new Date(student.admissionDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedStartDate = new Date(student.startDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admission Confirmation - Hospitality Competence Center Africa</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #fff7ed;
            line-height: 1.6;
            color: #cc4400;
        }

        a {
            color: #9a3412;
            text-decoration: none;
            font-weight: 600;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(124, 45, 18, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #cc4400 0%, #fb923c 100%);
            padding: 40px 30px;
            text-align: center;
            border-bottom: 4px solid #9a3412;
        }
        
        .logo-container {
            margin-bottom: 20px;
        }
        
        .logo-text {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            color: #cc4400;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            border-bottom: 2px solid #ffedd5;
            padding-bottom: 15px;
        }
        
        .message {
            color: #7c2d12;
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.8;
        }

        .message span {
            font-weight: 600;
        }
        
        .admission-number {
            background: linear-gradient(135deg, #9a3412 0%, #9a3412 100%);
            color: white;
            font-size: 22px;
            font-weight: 700;
            text-align: center;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            box-shadow: 0 4px 20px rgba(79, 51, 32, 0.3);
            letter-spacing: 2px;
            border: 3px solid #cc4400;
        }
        
        .congratulations {
            background: #fff7ed;
            padding: 30px;
            border-radius: 8px;
            border: 3px solid #ea580c;
            margin: 30px 0;
            text-align: center;
        }
        
        .congratulations h3 {
            color: #cc4400;
            font-size: 24px;
            margin-bottom: 15px;
        }
        
        .admission-details {
            background: #fff7ed;
            padding: 30px;
            border-radius: 8px;
            border: 2px solid #fed7aa;
            margin: 30px 0;
        }
        
        .admission-details h3 {
            color: #cc4400;
            margin-bottom: 25px;
            font-size: 20px;
            text-align: center;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .info-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .info-item strong {
            color: #cc4400;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .info-item span {
            color: #7c2d12;
            font-size: 16px;
            font-weight: 500;
        }
        
        .next-steps {
            background: #fff8e1;
            padding: 30px;
            border-radius: 8px;
            border: 3px solid #ffc107;
            margin: 30px 0;
        }
        
        .next-steps h3 {
            color: #cc4400;
            margin-bottom: 20px;
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .next-steps ol {
            padding-left: 20px;
            color: #7c2d12;
        }
        
        .next-steps li {
            margin-bottom: 15px;
            line-height: 1.6;
        }
        
        .payment-info {
            background: #e3f2fd;
            padding: 30px;
            border-radius: 8px;
            border: 3px solid #2196f3;
            margin: 30px 0;
        }
        
        .payment-info h3 {
            color: #cc4400;
            margin-bottom: 20px;
            font-size: 20px;
        }
        
        .payment-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .payment-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #fed7aa;
        }
        
        .payment-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .payment-label {
            color: #cc4400;
            font-weight: 600;
        }
        
        .payment-value {
            color: #7c2d12;
            font-weight: 500;
        }
        
        .contact-section {
            background: #f3e5f6;
            padding: 30px;
            border-radius: 8px;
            border: 3px solid #9c27b0;
            margin: 30px 0;
            text-align: center;
        }
        
        .contact-section h3 {
            color: #cc4400;
            margin-bottom: 20px;
            font-size: 20px;
        }
        
        .contact-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        
        .contact-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .contact-item strong {
            display: block;
            color: #cc4400;
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            background: #cc4400;
            color: #ffffff;
            border-top: 4px solid #9a3412;
        }
        
        .footer-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 10px;
        }
        
        .contact {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .contact a {
            color: #ffd700;
        }
        
        .contact a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            
            .header, .content {
                padding: 30px 20px;
            }
            
            .admission-number {
                font-size: 18px;
                padding: 20px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .contact-info {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <div class="logo-text">Hospitality Competence Center Africa</div>
                <div class="subtitle">Professional Coffee Training & Certification</div>
            </div>
        </div>
        
        <div class="content">
            <div class="congratulations">
                <h3>🎉 CONGRATULATIONS! 🎉</h3>
                <p class="message" style="font-size: 18px;">
                    You have been <strong>ADMITTED</strong> to Hospitality Competence Center Africa!
                </p>
            </div>
            
            <h1 class="greeting">Welcome to Hospitality Competence Center Africa!</h1>
            
            <p class="message">
                Dear <span>${student.firstName} ${student.lastName}</span>,
            </p>
            
            <p class="message">
                We are thrilled to inform you that your application has been reviewed and you have been 
                <strong>admitted</strong> to our <strong>${student.courseName}</strong> program. 
                Welcome to the HCC family!
            </p>
            
            <div class="admission-number">
                Your Admission Number: ${student.admissionNumber}
            </div>
            
            <div class="admission-details">
                <h3>📋 Admission Details</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Admission Number</strong>
                        <span>${student.admissionNumber}</span>
                    </div>
                    <div class="info-item">
                        <strong>Course</strong>
                        <span>${student.courseName}</span>
                    </div>
                    <div class="info-item">
                        <strong>Duration</strong>
                        <span>${student.courseDuration}</span>
                    </div>
                    <div class="info-item">
                        <strong>Course Fee</strong>
                        <span>KES ${student.courseFee?.toLocaleString() || 'To be advised'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Admission Date</strong>
                        <span>${formattedAdmissionDate}</span>
                    </div>
                    <div class="info-item">
                        <strong>Start Date</strong>
                        <span>${formattedStartDate}</span>
                    </div>
                    <div class="info-item">
                        <strong>Academic Year</strong>
                        <span>${student.academicYear}</span>
                    </div>
                    <div class="info-item">
                        <strong>Upfront Fee Paid</strong>
                        <span>KES ${student.upfrontFee?.toLocaleString() || '0'}</span>
                    </div>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>📝 &nbsp; Next Steps</h3>
                <ol>
                    <li><strong>Complete Payment</strong> - Pay the course fees according to the payment plan</li>
                    <li><strong>Orientation</strong> - Attend the mandatory orientation session on your start date</li>
                    <li><strong>Submit Documents</strong> - Bring original documents for verification</li>
                    <li><strong>Course Materials</strong> - Collect your course materials and schedule</li>
                    <li><strong>Student Portal</strong> - You will receive login details for the student portal</li>
                </ol>
            </div>
            
            <div class="payment-info">
                <h3>💳 Payment Information</h3>
                <div class="payment-details">
                    <div class="payment-row">
                        <span class="payment-label">Bank:</span>
                        <span class="payment-value">Bank details pending</span>
                    </div>
                    <div class="payment-row">
                        <span class="payment-label">Account Number:</span>
                        <span class="payment-value">Pending HCC confirmation</span>
                    </div>
                    <div class="payment-row">
                        <span class="payment-label">Account Name:</span>
                        <span class="payment-value">Hospitality Competence Center Africa</span>
                    </div>
                    <div class="payment-row">
                        <span class="payment-label">Payment Reference:</span>
                        <span class="payment-value" style="color: #dc2626; font-weight: 700;">${student.admissionNumber}</span>
                    </div>
                </div>
                <p class="message">
                    <strong>Important:</strong> Always include your admission number as the payment reference.
                </p>
            </div>
            
            <div class="contact-section">
                <h3>📞 Need Assistance?</h3>
                <p class="message">
                    Our admissions team is here to help you with any questions:
                </p>
                <div class="contact-info">
                    <div class="contact-item">
                        <strong>Admissions Office</strong>
                        <div>+254 781 726 674</div>
                        <div>+254 724 637 787</div>
                    </div>
                    <div class="contact-item">
                        <strong>Email</strong>
                        <div>Contact HCC administration</div>
                        <div>Contact HCC administration</div>
                    </div>
                </div>
            </div>
            
            <p class="message" style="text-align: center; margin-top: 40px; font-size: 18px;">
                We look forward to welcoming you to our campus!<br>
                <strong>The Hospitality Competence Center Africa Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">Hospitality Competence Center Africa</p>
            <p class="footer-text">HCC address pending</p>
            <p class="contact">
                Email: <a href="#contact-information">Contact HCC administration</a> | 
                Phone: <a href="tel:+254781726674">+254 781 726 674</a>
            </p>
            <p class="footer-text" style="margin-top: 15px;">
                &copy; ${new Date().getFullYear()} Hospitality Competence Center Africa. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;

        const mailOptions = {
            from: hccEmailUser,
            to: student.email,
            subject: `🎉 Admission Confirmation - ${student.admissionNumber} - Hospitality Competence Center Africa`,
            html,
            replyTo: hccEmailUser
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Admission confirmation email sent to ${student.email}:`, info.messageId);
        return true;
        
    } catch (error) {
        console.error('❌ Error sending admission confirmation email:', error);
        throw error;
    }
};

// Helper function to calculate end date
const calculateEndDate = (startDate, courseDuration) => {
    if (!startDate || !courseDuration) return null;
    
    const date = new Date(startDate);
    const durationStr = courseDuration.toLowerCase().trim();
    
    // Parse duration string (e.g., "6 months", "1 year", "12 weeks")
    const monthMatch = durationStr.match(/(\d+)\s*months?/);
    const yearMatch = durationStr.match(/(\d+)\s*years?/);
    const weekMatch = durationStr.match(/(\d+)\s*weeks?/);
    
    if (monthMatch) {
        date.setMonth(date.getMonth() + parseInt(monthMatch[1]));
    } else if (yearMatch) {
        date.setFullYear(date.getFullYear() + parseInt(yearMatch[1]));
    } else if (weekMatch) {
        date.setDate(date.getDate() + (parseInt(weekMatch[1]) * 7));
    }
    
    return date;
};

// Generate newsletter student letter template
const generateStudentLetterTemplate = (templateData) => {
    const {
        studentName,
        admissionNumber,
        courseName,
        startDate,
        endDate,
        courseDuration,
        signedBy,
        refNumber
    } = templateData;

    const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '_______________';

    const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : courseDuration ? `[Calculated from ${courseDuration}]` : '_______________';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: justify; }
        .signature { margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h3>Hospitality Competence Center Africa</h3>
            <p><strong>Official Student Confirmation Letter</strong></p>
        </div>

        <div class="content">
            <p><strong>REF:</strong> ${refNumber || 'ATC/STU/_________'}</p>
            <p><strong>RE:</strong> OFFICIAL STUDENT LETTER</p>

            <p>This letter is to formally confirm that <strong>${studentName || '_________________________________'}</strong>, 
            ID/Admission No. <strong>${admissionNumber || '________'}</strong>, is a registered student at Hospitality Competence Center Africa.</p>

            <p>The student is currently enrolled in the <strong>${courseName || '_________________________________'}</strong> program, 
            which commenced on <strong>${formattedStartDate}</strong> and is scheduled to end on <strong>${formattedEndDate}</strong>.</p>

            <p>Hospitality Competence Center Africa is a professional skills development institution specializing in coffee, beverage, and hospitality training, 
            equipping learners with practical, industry-relevant competencies.</p>

            <p>This letter is issued upon the student's request for official purposes, including but not limited to attachment, internship, 
            identification, sponsorship, or institutional reference.</p>

            <p>Should you require any further information or verification, please do not hesitate to contact our office.</p>

            <p>Yours faithfully,</p>

            <div class="signature">
                <p>______________________________</p>
                <p><strong>Name:</strong> ${signedBy || '________________________'}</p>
                <p><strong>Title:</strong> ________________________</p>
                <p><strong>For:</strong> Hospitality Competence Center Africa</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

// Send newsletter email (template or custom)
const sendNewsletterEmail = async (recipientEmail, subject, body, templateData = null) => {
    try {
        const mailOptions = {
            from: hccEmailUser,
            to: recipientEmail,
            subject: subject,
            html: body, // body is already HTML
        };

        const info = await transporter.sendMail(mailOptions);
        
        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Error sending newsletter email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Receipt share email template — links back to the public receipt page
// instead of embedding the PDF, so the recipient always sees live data.
const generateReceiptShareTemplate = (receipt, shareUrl) => {
    const formattedDate = receipt.date ? new Date(receipt.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Receipt - Hospitality Competence Center Africa</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #fff7ed; color: #cc4400; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(124, 45, 18,0.1); }
        .header { background: linear-gradient(135deg, #cc4400 0%, #fb923c 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; font-size: 22px; margin: 0; }
        .content { padding: 30px; }
        .receipt-number { background: #fff7ed; color: #9a3412; font-weight: 700; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #9a3412; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fed7aa; }
        .info-row span:first-child { color: #cc4400; font-weight: 600; }
        .info-row span:last-child { color: #7c2d12; }
        .btn { display: block; text-align: center; background: #cc4400; color: #ffffff !important; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 30px 0; }
        .footer { text-align: center; padding: 20px; background: #cc4400; color: rgba(255,255,255,0.85); font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Hospitality Competence Center Africa</h1></div>
        <div class="content">
            <p>Dear ${receipt.name},</p>
            <p>Here is your payment receipt.</p>
            <div class="receipt-number">Receipt No: ${receipt.receiptNumber}</div>
            <div class="info-row"><span>Date</span><span>${formattedDate}</span></div>
            <div class="info-row"><span>Course</span><span>${receipt.courseEnrolled || 'N/A'}</span></div>
            <div class="info-row"><span>Amount Paid</span><span>KES ${Number(receipt.totalAmountDue || 0).toLocaleString()}</span></div>
            <div class="info-row"><span>Balance</span><span>KES ${Number(receipt.totalAmountRemaining || 0).toLocaleString()}</span></div>
            <a href="${shareUrl}" class="btn">View &amp; Download Receipt</a>
            <p style="font-size: 13px; color: #7c2d12;">If the button doesn't work, copy this link into your browser:<br>${shareUrl}</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Hospitality Competence Center Africa &middot; HCC address pending
        </div>
    </div>
</body>
</html>`;
};

// Send a receipt share link by email
const sendReceiptShareEmail = async (receipt, recipientEmail, shareUrl) => {
    try {
        const html = generateReceiptShareTemplate(receipt, shareUrl);
        const info = await transporter.sendMail({
            from: hccEmailUser,
            to: recipientEmail,
            subject: `Your Receipt ${receipt.receiptNumber} - Hospitality Competence Center Africa`,
            html,
            replyTo: hccEmailUser
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending receipt share email:', error);
        return { success: false, error: error.message };
    }
};

// Admission letter share email template — links back to the public
// admission letter page instead of embedding the PDF, so it always shows
// live data even if the student's record changes later.
const generateAdmissionLetterShareTemplate = (student, shareUrl) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Admission Letter - Hospitality Competence Center Africa</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #fff7ed; color: #cc4400; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(124, 45, 18,0.1); }
        .header { background: linear-gradient(135deg, #cc4400 0%, #fb923c 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; font-size: 22px; margin: 0; }
        .content { padding: 30px; }
        .admn-number { background: #fff7ed; color: #9a3412; font-weight: 700; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #9a3412; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fed7aa; }
        .info-row span:first-child { color: #cc4400; font-weight: 600; }
        .info-row span:last-child { color: #7c2d12; }
        .btn { display: block; text-align: center; background: #cc4400; color: #ffffff !important; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 30px 0; }
        .footer { text-align: center; padding: 20px; background: #cc4400; color: rgba(255,255,255,0.85); font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Hospitality Competence Center Africa</h1></div>
        <div class="content">
            <p>Dear ${student.firstName},</p>
            <p>Congratulations! Here is your admission letter.</p>
            <div class="admn-number">Admission No: ${student.admissionNumber}</div>
            <div class="info-row"><span>Course</span><span>${student.courseName || 'N/A'}</span></div>
            <div class="info-row"><span>Duration</span><span>${student.courseDuration || 'N/A'}</span></div>
            <div class="info-row"><span>Course Fee</span><span>KES ${Number(student.courseFee || 0).toLocaleString()}</span></div>
            <a href="${shareUrl}" class="btn">View &amp; Download Admission Letter</a>
            <p style="font-size: 13px; color: #7c2d12;">If the button doesn't work, copy this link into your browser:<br>${shareUrl}</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Hospitality Competence Center Africa &middot; HCC address pending
        </div>
    </div>
</body>
</html>`;
};

// Send an admission letter share link by email
const sendAdmissionLetterShareEmail = async (student, recipientEmail, shareUrl) => {
    try {
        const html = generateAdmissionLetterShareTemplate(student, shareUrl);
        const info = await transporter.sendMail({
            from: hccEmailUser,
            to: recipientEmail,
            subject: `Your Admission Letter - ${student.admissionNumber} - Hospitality Competence Center Africa`,
            html,
            replyTo: hccEmailUser
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending admission letter share email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    transporter,
    generateApplicationConfirmationTemplate,
    generateAdminNotificationTemplate,
    sendApplicationConfirmationEmail,
    sendAdminNotificationEmail,
    sendApplicationEmails,
    sendRejectionEmail,
    sendAdmissionConfirmationEmail,
    sendNewsletterEmail,
    generateStudentLetterTemplate,
    calculateEndDate,
    generateReceiptShareTemplate,
    sendReceiptShareEmail,
    generateAdmissionLetterShareTemplate,
    sendAdmissionLetterShareEmail
};