import { model } from 'mongoose';
import { paymentMethodSchema } from './paymentMethodSchema';
import { applyPaymentMethodStatics } from './paymentMethodStatics';
import { applyPaymentMethodMethods } from './paymentMethodMethods';
import { PaymentMethodDocument } from './paymentMethodTypes';

applyPaymentMethodStatics(paymentMethodSchema);
applyPaymentMethodMethods(paymentMethodSchema);
const PaymentMethod = model<PaymentMethodDocument>('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;
