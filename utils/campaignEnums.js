// CampaignEnums.js

class CampaignEnums {
    static get categories() {
      return [
        { id: 1, name: 'Health' },
        { id: 2, name: 'Education' },
        { id: 3, name: 'Environment' },
        { id: 4, name: 'Emergency' },
        { id: 5, name: 'Community' }
      ];
    }
  
    static get beneficiaries() {
      return [
        { id: 1, name: 'Yourself' },
        { id: 2, name: 'Someone else' },
        { id: 3, name: 'Charity' }
      ];
    }
  
    static get africanCurrencies() {
      return [
        { id: 1, country: 'Algeria', currency: 'DZD' },
        { id: 2, country: 'Angola', currency: 'AOA' },
        { id: 3, country: 'Botswana', currency: 'BWP' },
        { id: 4, country: 'Burundi', currency: 'BIF' },
        { id: 5, country: 'Cape Verde', currency: 'CVE' },
        { id: 6, country: 'Comoros', currency: 'KMF' },
        { id: 7, country: 'Congo (Kinshasa)', currency: 'CDF' },
        { id: 8, country: 'Djibouti', currency: 'DJF' },
        { id: 9, country: 'Egypt', currency: 'EGP' },
        { id: 10, country: 'Eritrea', currency: 'ERN' },
        { id: 11, country: 'Eswatini', currency: 'SZL' },
        { id: 12, country: 'Ethiopia', currency: 'ETB' },
        { id: 13, country: 'Gambia', currency: 'GMD' },
        { id: 14, country: 'Ghana', currency: 'GHS' },
        { id: 15, country: 'Guinea', currency: 'GNF' },
        { id: 16, country: 'Kenya', currency: 'KES' },
        { id: 17, country: 'Lesotho', currency: 'LSL' },
        { id: 18, country: 'Liberia', currency: 'LRD' },
        { id: 19, country: 'Libya', currency: 'LYD' },
        { id: 20, country: 'Madagascar', currency: 'MGA' },
        { id: 21, country: 'Malawi', currency: 'MWK' },
        { id: 22, country: 'Mauritania', currency: 'MRU' },
        { id: 23, country: 'Mauritius', currency: 'MUR' },
        { id: 24, country: 'Morocco', currency: 'MAD' },
        { id: 25, country: 'Mozambique', currency: 'MZN' },
        { id: 26, country: 'Namibia', currency: 'NAD' },
        { id: 27, country: 'Niger', currency: 'XOF' },
        { id: 28, country: 'Nigeria', currency: 'NGN' },
        { id: 29, country: 'Rwanda', currency: 'RWF' },
        { id: 30, country: 'Sao Tome and Principe', currency: 'STN' },
        { id: 31, country: 'Seychelles', currency: 'SCR' },
        { id: 32, country: 'Sierra Leone', currency: 'SLL' },
        { id: 33, country: 'Somalia', currency: 'SOS' },
        { id: 34, country: 'South Africa', currency: 'ZAR' },
        { id: 35, country: 'South Sudan', currency: 'SSP' },
        { id: 36, country: 'Sudan', currency: 'SDG' },
        { id: 37, country: 'Tanzania', currency: 'TZS' },
        { id: 38, country: 'Tunisia', currency: 'TND' },
        { id: 39, country: 'Uganda', currency: 'UGX' },
        { id: 40, country: 'Zambia', currency: 'ZMW' },
        { id: 41, country: 'Zimbabwe', currency: 'ZWL' },
      ];
    }
  
    static get internationalCurrencies() {
      return [
        { id: 1, currency: 'USD' },
        { id: 2, currency: 'CAD' },
        { id: 3, currency: 'EUR' },
        { id: 4, currency: 'GBP' }
      ];
    }
  
    static get currencies() {
      // To avoid id conflicts, offset the international currency ids (e.g., add 100)
      const international = this.internationalCurrencies.map(item => ({ id: item.id + 100, currency: item.currency }));
      return [
        ...this.africanCurrencies.map(item => ({ id: item.id, currency: item.currency })),
        ...international
      ];
    }
  }
  
  module.exports = CampaignEnums;  