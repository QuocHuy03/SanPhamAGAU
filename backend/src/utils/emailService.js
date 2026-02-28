const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOrderConfirmation = async (order, user) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not set. Order confirmation email skipped.');
        return;
    }

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <div style="display: flex; align-items: center;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                    <div>
                        <div style="font-weight: bold; font-size: 14px; color: #111;">${item.name}</div>
                        <div style="font-size: 12px; color: #888;">Size: ${item.size} | Màu: ${item.color}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">x${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; font-size: 14px;">${(item.price * item.quantity).toLocaleString()}đ</td>
        </tr>
    `).join('');

    const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="background-color: #4f46e5; padding: 40px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">Cảm ơn bạn đã đặt hàng!</h1>
                <p style="color: #e0e7ff; margin-top: 10px; font-weight: bold;">Mã đơn hàng: #${order.orderNumber}</p>
            </div>
            
            <div style="padding: 40px;">
                <p style="color: #4b5563; line-height: 1.6;">Chào <strong>${user.name}</strong>,</p>
                <p style="color: #4b5563; line-height: 1.6;">Đơn hàng của bạn đã được tiếp nhận và đang được xử lý. Dưới đây là thông tin chi tiết về đơn hàng:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="padding: 12px; text-align: left; font-size: 11px; font-weight: 900; color: #9ca3af; text-transform: uppercase; border-radius: 8px 0 0 8px;">Sản phẩm</th>
                            <th style="padding: 12px; text-align: center; font-size: 11px; font-weight: 900; color: #9ca3af; text-transform: uppercase;">Số lượng</th>
                            <th style="padding: 12px; text-align: right; font-size: 11px; font-weight: 900; color: #9ca3af; text-transform: uppercase; border-radius: 0 8px 8px 0;">Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div style="margin-top: 30px; border-top: 2px solid #f3f4f6; padding-top: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #6b7280; font-size: 14px;">Tạm tính:</span>
                        <span style="font-weight: bold; font-size: 14px;">${order.subtotal.toLocaleString()}đ</span>
                    </div>
                    ${order.discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #10b981;">
                        <span style="font-size: 14px;">Giảm giá:</span>
                        <span style="font-weight: bold; font-size: 14px;">-${order.discount.toLocaleString()}đ</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #6b7280; font-size: 14px;">Phí vận chuyển:</span>
                        <span style="font-weight: bold; font-size: 14px;">${order.shippingFee === 0 ? 'Miễn phí' : `${order.shippingFee.toLocaleString()}đ`}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                        <span style="font-weight: 900; font-size: 18px; color: #111; text-transform: uppercase;">Tổng cộng:</span>
                        <span style="font-weight: 900; font-size: 24px; color: #4f46e5;">${order.total.toLocaleString()}đ</span>
                    </div>
                </div>
                
                <div style="margin-top: 40px; padding: 24px; background-color: #f8fafc; border-radius: 16px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 900; text-transform: uppercase; color: #111;">Địa chỉ giao hàng</h3>
                    <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                        <strong>${order.shippingAddress.fullName}</strong><br>
                        ${order.shippingAddress.phone}<br>
                        ${order.shippingAddress.street}, ${order.shippingAddress.city}
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 50px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/order" style="background-color: #111827; color: #ffffff; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Xem chi tiết đơn hàng</a>
                </div>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 30px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">STT Store - Thời trang cao cấp</p>
                <p style="color: #d1d5db; font-size: 10px; margin-top: 5px;">© 2024 STT Store. All rights reserved.</p>
            </div>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"STT Store" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `💎 Xác nhận đơn hàng #${order.orderNumber}`,
            html: htmlContent
        });
        console.log(`Order confirmation email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

module.exports = {
    sendOrderConfirmation
};
