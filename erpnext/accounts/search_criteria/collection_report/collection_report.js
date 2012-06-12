// ERPNext - web based ERP (http://erpnext.com)
// Copyright (C) 2012 Web Notes Technologies Pvt Ltd
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

report.customize_filters = function() {
  this.hide_all_filters();

  this.filter_fields_dict['Journal Voucher'+FILTER_SEP +'Is Opening'].df.filter_hide = 0;
  this.filter_fields_dict['Journal Voucher'+FILTER_SEP +'Company'].df.filter_hide = 0;
  this.filter_fields_dict['Journal Voucher'+FILTER_SEP +'From Posting Date'].df.filter_hide = 0;
  this.filter_fields_dict['Journal Voucher'+FILTER_SEP +'To Posting Date'].df.filter_hide = 0;
  this.filter_fields_dict['Journal Voucher Detail'+FILTER_SEP +'Account'].df.filter_hide = 0;

  this.add_filter({fieldname:'range_1', label:'Range 1', fieldtype:'Data', ignore : 1, parent:'GL Entry'});
  this.add_filter({fieldname:'range_2', label:'Range 2', fieldtype:'Data', ignore : 1, parent:'GL Entry'});
  this.add_filter({fieldname:'range_3', label:'Range 3', fieldtype:'Data', ignore : 1, parent:'GL Entry'});
  this.add_filter({fieldname:'range_4', label:'Range 4', fieldtype:'Data', ignore : 1, parent:'GL Entry'});

  this.add_filter({fieldname:'aging_based_on', label:'Aging Based On', fieldtype:'Select', options:NEWLINE+'Transaction Date'+NEWLINE+'Aging Date',ignore : 1, parent:'Sales Invoice', 'report_default': 'Aging Date'});  
  this.filter_fields_dict['Journal Voucher'+FILTER_SEP +'From Posting Date'].df.in_first_page = 1;
  this.filter_fields_dict['Journal Voucher'+FILTER_SEP +'To Posting Date'].df.in_first_page = 1;
  this.filter_fields_dict['Journal Voucher Detail'+FILTER_SEP +'Account'].df.in_first_page = 1;

  this.filter_fields_dict['Journal Voucher'+FILTER_SEP +'From Posting Date'].df['report_default'] = sys_defaults.year_start_date;
  this.filter_fields_dict['Journal Voucher'+FILTER_SEP +'To Posting Date'].df['report_default'] = dateutil.obj_to_str(new Date());
  this.filter_fields_dict['Journal Voucher'+FILTER_SEP +'Company'].df['report_default']=sys_defaults.company;
}
this.mytabs.items['Select Columns'].hide()