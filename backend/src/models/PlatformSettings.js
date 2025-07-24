const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  platformName: {
    type: String,
    required: [true, 'Nama platform harus diisi'],
    trim: true,
    maxlength: [50, 'Nama platform tidak boleh lebih dari 50 karakter'],
    default: 'LMS Platform'
  },
  logo: {
    type: String,
    default: ''
  },
  logoPublicId: {
    type: String,
    default: ''
  },
  favicon: {
    type: String,
    default: ''
  },
  faviconPublicId: {
    type: String,
    default: ''
  },
  primaryColor: {
    type: String,
    default: '#3B82F6',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Format warna tidak valid']
  },
  secondaryColor: {
    type: String,
    default: '#1F2937',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Format warna tidak valid']
  },
  description: {
    type: String,
    maxlength: [200, 'Deskripsi tidak boleh lebih dari 200 karakter'],
    default: 'Platform pembelajaran online terbaik'
  },
  contactEmail: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email tidak valid'],
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    maxlength: [300, 'Alamat tidak boleh lebih dari 300 karakter'],
    default: ''
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
platformSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Method to update settings
platformSettingsSchema.statics.updateSettings = async function(updateData) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updateData);
  } else {
    Object.assign(settings, updateData);
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);