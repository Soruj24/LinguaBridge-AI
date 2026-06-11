import { Schema } from 'mongoose';
import { InvoiceDocument } from './invoiceTypes';

export function applyInvoiceStatics(schema: Schema<InvoiceDocument>) {
  schema.statics.findByUserId = function(userId: string, options: any = {}) {
    const query = this.find({ userId });
    if (options.status) query.where('status', options.status);
    if (options.startDate) query.where('date').gte(options.startDate);
    if (options.endDate) query.where('date').lte(options.endDate);
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
      query.sort({ [options.sortBy]: sortOrder });
    } else {
      query.sort({ date: -1 });
    }
    if (options.limit) query.limit(options.limit);
    if (options.skip) query.skip(options.skip);
    return query;
  };

  schema.statics.findOverdue = function() {
    const now = new Date();
    return this.find({
      status: { $nin: ['paid', 'void'] },
      dueDate: { $lt: now } as any,
    } as any);
  };

  schema.statics.getTotalRevenue = async function(startDate?: Date, endDate?: Date) {
    const match: any = { status: 'paid' };
    if (startDate) match.date = { $gte: startDate };
    if (endDate) {
      match.date = match.date || {};
      match.date.$lte = endDate;
    }
    const result = await this.aggregate([
      { $match: match },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    return result[0] || { totalRevenue: 0, count: 0 };
  };
}
