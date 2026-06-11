import { sendEmail, EmailResult } from "../email";

export const sendOrderConfirmation = async (
  userEmail: string,
  userName: string,
  orderNumber: string,
  orderTotal: number,
  itemsCount: number,
): Promise<EmailResult> => {
  return sendEmail({
    to: userEmail,
    subject: `✅ Order #${orderNumber} Confirmed`,
    html: `
            <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; background: #f0f2f5; padding: 20px;">
                <div style="background: #00a400; color: white; padding: 15px 20px; border-radius: 20px 20px 5px 5px; text-align: center;">
                    <strong>Order Updates</strong>
                </div>

                <div style="margin-top: 15px;">
                    <div style="display: flex; align-items: start; margin-bottom: 15px;">
                        <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
                            <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                                🎉 Your order <strong>#${orderNumber}</strong> has been confirmed!
                            </div>
                            <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: start; margin-bottom: 15px;">
                        <div style="background: #0084ff; color: white; padding: 12px 16px; border-radius: 18px; max-width: 80%; margin-left: auto;">
                            <div style="font-size: 14px; line-height: 1.4;">
                                <strong>Order Summary:</strong>
                            </div>
                            <div style="margin-top: 8px; font-size: 13px;">
                                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                    <span>Items:</span>
                                    <span>${itemsCount}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                    <span>Total:</span>
                                    <span><strong>$${orderTotal.toFixed(2)}</strong></span>
                                </div>
                            </div>
                            <div style="font-size: 11px; text-align: right; margin-top: 5px; opacity: 0.8;">
                                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: start; margin-bottom: 15px;">
                        <div style="background: #e4e6eb; padding: 12px 16px; border-radius: 18px; max-width: 80%;">
                            <div style="font-size: 14px; color: #050505; line-height: 1.4;">
                                <strong>What's next?</strong><br>
                                We'll send you another message when your order ships.
                            </div>
                            <div style="margin-top: 10px;">
                                <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/orders/${orderNumber}"
                                   style="display: inline-block; background: #0084ff; color: white; padding: 8px 16px; border-radius: 15px; text-decoration: none; font-size: 13px;">
                                   📦 Track Order
                                </a>
                            </div>
                            <div style="font-size: 11px; color: #65676b; text-align: right; margin-top: 5px;">
                                ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 20px; padding: 15px; color: #65676b; font-size: 12px;">
                    This is an automated message. Questions? <a href="mailto:orders@store.com" style="color: #0084ff; text-decoration: none;">Contact orders team</a>
                </div>
            </div>
        `,
  });
};
