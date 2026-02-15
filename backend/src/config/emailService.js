const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send password reset code
const sendPasswordResetCode = async (email, code) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Shop Thời Trang" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Mã xác nhận đặt lại mật khẩu',
        html: `
      <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Shop Thời Trang</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Đặt lại mật khẩu</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã xác nhận bên dưới để tiếp tục:
          </p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            <strong>Lưu ý:</strong> Mã này có hiệu lực trong vòng <strong>15 phút</strong>.
          </p>
          
          <p style="color: #999; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Shop Thời Trang. All rights reserved.</p>
        </div>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Password reset code sent to: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
    }
};

// Send order confirmation email
const sendOrderConfirmation = async (email, orderData) => {
    const transporter = createTransporter();

    const itemsHTML = orderData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()}đ</td>
    </tr>
  `).join('');

    const mailOptions = {
        from: `"Shop Thời Trang" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Xác nhận đơn hàng #${orderData.orderNumber}`,
        html: `
      <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Cảm ơn bạn đã đặt hàng!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Đơn hàng #${orderData.orderNumber}</h2>
          <p style="color: #666;">Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý.</p>
          
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                <th style="padding: 10px; text-align: center;">Số lượng</th>
                <th style="padding: 10px; text-align: right;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea;">
            <p style="font-size: 18px; margin: 5px 0;"><strong>Tổng cộng: ${orderData.totalAmount.toLocaleString()}đ</strong></p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h3 style="margin-top: 0;">Thông tin giao hàng</h3>
            <p style="margin: 5px 0;"><strong>Người nhận:</strong> ${orderData.shippingAddress.fullName}</p>
            <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${orderData.shippingAddress.phone}</p>
            <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}</p>
          </div>
        </div>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Order confirmation sent to: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending order confirmation:', error);
        return false;
    }
};

module.exports = {
    sendPasswordResetCode,
    sendOrderConfirmation
};
