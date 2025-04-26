const Newsletter = require('../models/Newsletter');
const { Parser } = require('json2csv');

// Add these routes to your existing admin.js file

// Newsletter subscribers management
router.get('/newsletter', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    // Get search and filter parameters
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    
    // Build query
    let query = {};
    
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }
    
    if (status !== 'all') {
      query.active = status === 'active';
    }
    
    // Get total count
    const total = await Newsletter.countDocuments(query);
    
    // Get subscribers
    const subscribers = await Newsletter.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate pagination
    const pages = Math.ceil(total / limit);
    
    res.render('admin/newsletter', {
      subscribers,
      current: page,
      pages,
      total,
      search,
      status
    });

// Get inquiries route
router.get('/inquiries', adminAuth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    
    // Ensure each inquiry has a valid date
    const processedInquiries = inquiries.map(inquiry => {
      const inquiryObj = inquiry.toObject();
      
      // If createdAt doesn't exist or is invalid, set a default date
      if (!inquiryObj.createdAt) {
        inquiryObj.createdAt = inquiryObj.date || new Date();
      }
      
      return inquiryObj;
    });
    
    res.render('admin/inquiries', {
      title: 'Inquiries',
      inquiries: processedInquiries
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).render('error', { 
      message: 'Error loading inquiries', 
      error: process.env.NODE_ENV === 'development' ? error : {} 
    });
  }
});
  } catch (error) {
    console.error('Error loading newsletter subscribers:', error);
    req.flash('error', 'Failed to load newsletter subscribers');
    res.render('admin/newsletter', { error: 'Failed to load newsletter subscribers' });
  }
});

// Add this route to handle the newsletter email form page
router.get('/newsletter/send-email', isAuthenticated, async (req, res) => {
  try {
    // Get count of active subscribers for the form
    const activeCount = await Newsletter.countDocuments({ active: true });
    
    res.render('admin/newsletter-email', {
      activeCount
    });
  } catch (error) {
    console.error('Error loading newsletter email form:', error);
    req.flash('error', 'Failed to load newsletter email form');
    res.redirect('/admin/newsletter');
  }
});

// Add this route to handle sending the newsletter emails
router.post('/newsletter/send-email', isAuthenticated, async (req, res) => {
  try {
    const { subject, content, recipientType, testEmail } = req.body;
    
    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }
    
    // Prepare email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <img src="https://tundua.com/img/logo.png" alt="Tundua Edu Consult" style="max-width: 200px;">
        </div>
        <div style="padding: 20px;">
          ${content}
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>© ${new Date().getFullYear()} Tundua Edu Consult. All rights reserved.</p>
          <p>If you no longer wish to receive these emails, you can <a href="https://tundua.com/unsubscribe?email=%%EMAIL%%">unsubscribe here</a>.</p>
        </div>
      </div>
    `;
    
    // Send test email
    if (recipientType === 'test') {
      if (!testEmail) {
        return res.status(400).json({
          success: false,
          message: 'Test email address is required'
        });
      }
      
      const testResult = await sendEmail({
        to: testEmail,
        subject: `[TEST] ${subject}`,
        html: htmlContent.replace('%%EMAIL%%', testEmail)
      });
      
      if (testResult.success) {
        return res.json({
          success: true,
          message: 'Test email sent successfully!'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send test email: ' + testResult.error
        });
      }
    }
    
    // Send to all active subscribers
    const activeSubscribers = await Newsletter.find({ active: true });
    
    if (activeSubscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found'
      });
    }
    
    // Log the newsletter sending
    const newsletterLog = new NewsletterLog({
      subject,
      content,
      recipientCount: activeSubscribers.length,
      sentBy: req.user._id,
      date: new Date()
    });
    
    await newsletterLog.save();
    
    // Send emails in batches to avoid overloading the email server
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);
      
      // Process each email in the batch
      const emailPromises = batch.map(subscriber => {
        return sendEmail({
          to: subscriber.email,
          subject: subject,
          html: htmlContent.replace('%%EMAIL%%', subscriber.email)
        }).then(result => {
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to send to ${subscriber.email}:`, result.error);
          }
        }).catch(err => {
          errorCount++;
          console.error(`Error sending to ${subscriber.email}:`, err);
        });
      });
      
      // Wait for all emails in this batch to be processed
      await Promise.all(emailPromises);
      
      // Add a small delay between batches to prevent rate limiting
      if (i + batchSize < activeSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Update the newsletter log with results
    newsletterLog.successCount = successCount;
    newsletterLog.errorCount = errorCount;
    newsletterLog.completed = true;
    await newsletterLog.save();
    
    return res.json({
      success: true,
      message: `Newsletter sent successfully to ${successCount} subscribers${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
      sentCount: successCount,
      errorCount: errorCount
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending the newsletter'
    });
  }
});

// Toggle subscriber status
router.post('/newsletter/:id/toggle', isAuthenticated, async (req, res) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id);
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }
    
    // Toggle active status
    subscriber.active = !subscriber.active;
    await subscriber.save();
    
    res.json({
      success: true,
      active: subscriber.active,
      message: `Subscriber ${subscriber.active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling subscriber status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscriber status'
    });
  }
});

// Delete subscriber
router.delete('/newsletter/:id', isAuthenticated, async (req, res) => {
  try {
    const result = await Newsletter.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber'
    });
  }
});

// Export subscribers list
router.get('/newsletter/export', isAuthenticated, async (req, res) => {
  try {
    // Get all subscribers
    const subscribers = await Newsletter.find().sort({ date: -1 });
    
    if (subscribers.length === 0) {
      req.flash('error', 'No subscribers to export');
      return res.redirect('/admin/newsletter');
    }
    
    // Create CSV content
    let csvContent = 'Email,Status,Date Subscribed\n';
    
    subscribers.forEach(subscriber => {
      const status = subscriber.active ? 'Active' : 'Inactive';
      const date = new Date(subscriber.date).toISOString().split('T')[0];
      csvContent += `${subscriber.email},${status},${date}\n`;
    });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=newsletter_subscribers_${Date.now()}.csv`);
    
    // Send the CSV file
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting subscribers:', error);
    req.flash('error', 'Failed to export subscribers');
    res.redirect('/admin/newsletter');
  }
});