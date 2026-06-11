import { Schema } from "mongoose";
import validator from "validator";
import { IAddress } from "../interfaces/IUser";
import { AddressType } from "../interfaces/IUser";

export const addressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: Object.values(AddressType),
    default: AddressType.HOME
  },
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'State name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: [20, 'ZIP code cannot exceed 20 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { _id: false });
