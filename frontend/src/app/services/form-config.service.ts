import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: any[];
  optionLabel?: string[];
  optionValue?: string;
  settingsKey?: string;
  colspan?: number;
  onChange?: (value: any, form: any, field: FormField, component: any) => void;
}

export interface FormConfig {
  title: string;
  fields: string[]; // Array of field names
  submitButton: {
    create: string;
    update: string;
  };
  api: {
    create: string;
    update: string;
  };
  settings?: any;
}

// Reusable field definitions
const fieldDefinitions: { [key: string]: FormField } = {
  // Common fields
  date: {
    key: 'date',
    label: 'Date',
    type: 'date',
    required: true
  },
  item: {
    key: 'item',
    label: 'Item',
    type: 'select',
    required: true,
    options: [],
    optionLabel: ['item_hin', 'item_eng'],
    optionValue: 'item_id'
  },
  subitem: {
    key: 'subitem',
    label: 'Subitem',
    type: 'select',
    required: false,
    options: [],
    optionLabel: ['subitem_hin', 'subitem_eng'],
    optionValue: 'subitem_id'
  },
  mm: {
    key: 'mm',
    label: 'MM',
    type: 'select',
    required: true,
    options: [],
    optionLabel: ['mm_hin', 'mm_eng'],
    optionValue: 'mm_id'
  },
  category: {
    key: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [],
    optionLabel: ['category_hin', 'category_eng'],
    optionValue: 'category_id'
  },
  unit: {
    key: 'unit',
    label: 'Unit',
    type: 'select',
    required: true,
    options: [],
    optionLabel: ['unit_short', 'unit_long'],
    optionValue: 'unit_id'
  },
  qty: {
    key: 'qty',
    label: 'Quantity',
    type: 'number',
    required: true
  },
  amount: {
    key: 'amount',
    label: 'Amount',
    type: 'number',
    required: false
  },
  description: {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: false
  },
  note: {
    key: 'note',
    label: 'Note',
    type: 'textarea',
    required: false
  },

  // Category fields
  category_hin: {
    key: 'category_hin',
    label: 'Category (Hindi)',
    type: 'text',
    required: true
  },
  category_eng: {
    key: 'category_eng',
    label: 'Category (English)',
    type: 'text',
    required: false
  },
  category_roman: {
    key: 'category_roman',
    label: 'Category (Roman)',
    type: 'text',
    required: false
  },

  // Item fields
  item_hin: {
    key: 'item_hin',
    label: 'Item (Hindi)',
    type: 'text',
    required: true
  },
  item_eng: {
    key: 'item_eng',
    label: 'Item (English)',
    type: 'text',
    required: false
  },
  item_roman: {
    key: 'item_roman',
    label: 'Item (Roman)',
    type: 'text',
    required: false
  },
  item_code: {
    key: 'item_code',
    label: 'Item Code',
    type: 'text',
    required: false
  },

  // MM fields
  mm_hin: {
    key: 'mm_hin',
    label: 'MM (Hindi)',
    type: 'text',
    required: true
  },
  mm_eng: {
    key: 'mm_eng',
    label: 'MM (English)',
    type: 'text',
    required: false
  },
  mm_roman: {
    key: 'mm_roman',
    label: 'MM (Roman)',
    type: 'text',
    required: false
  },

  // Country fields
  country_hin: {
    key: 'country_hin',
    label: 'Country (Hindi)',
    type: 'text',
    required: true
  },
  country_eng: {
    key: 'country_eng',
    label: 'Country (English)',
    type: 'text',
    required: false
  }
};

// Form configurations
const formConfigs: { [key: string]: FormConfig } = {
  category: {
    title: 'Category',
    fields: ['category_hin', 'category_eng', 'category_roman'],
    submitButton: { create: 'Add Category', update: 'Update Category' },
    api: { create: 'CATEGORY', update: 'CATEGORY' }
  },
  item: {
    title: 'Item',
    fields: ['item_hin', 'item_eng', 'item_roman', 'item_code', 'category', 'unit'],
    submitButton: { create: 'Add Item', update: 'Update Item' },
    api: { create: 'ITEM', update: 'ITEM' }
  },
  mm: {
    title: 'MM',
    fields: ['mm_hin', 'mm_eng', 'mm_roman'],
    submitButton: { create: 'Add MM', update: 'Update MM' },
    api: { create: 'MM', update: 'MM' }
  },
  country: {
    title: 'Country',
    fields: ['country_hin', 'country_eng'],
    submitButton: { create: 'Add Country', update: 'Update Country' },
    api: { create: 'COUNTRY', update: 'COUNTRY' }
  }
};

@Injectable({
  providedIn: 'root'
})
export class FormConfigService {

  constructor(private auth: AuthService) { }

  getFormConfig(formName: string): FormConfig {
    const config: any = formConfigs[formName];
    if (!config) throw new Error(`Form config '${formName}' not found`);

    return {
      ...config,
      fields: config.fields.map((fieldName: any) => {
        const field = fieldDefinitions[fieldName];
        if (!field) throw new Error(`Field '${fieldName}' not found`);
        return { ...field };
      }),
      settings: this.auth.webUser?.settings?.[formName] || {}
    };
  }

  getCategoryFormConfig(): FormConfig {
    return this.getFormConfig('category');
  }

  getCountryFormConfig(): FormConfig {
    return this.getFormConfig('country');
  }

  getItemFormConfig(): FormConfig {
    return this.getFormConfig('item');
  }

  getMmFormConfig(): FormConfig {
    return this.getFormConfig('mm');
  }
}
