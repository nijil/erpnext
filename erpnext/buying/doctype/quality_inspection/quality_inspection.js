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

cur_frm.cscript.item_code = function(doc, cdt, cdn) {
	if (doc.item_code)
		get_server_fields('get_purchase_receipt_item_details','','',doc,cdt,cdn,1);
}

cur_frm.cscript.inspection_type = function(doc, cdt, cdn) {
	if(doc.inspection_type == 'Incoming'){
		doc.delivery_note_no = '';
		hide_field('delivery_note_no');		
		unhide_field('purchase_receipt_no');
	}
	else if(doc.inspection_type == 'Outgoing'){
		doc.purchase_receipt_no = '';
		unhide_field('delivery_note_no');
		hide_field('purchase_receipt_no');

	}
	else {
		doc.purchase_receipt_no = '';
		doc.delivery_note_no = '';		
		hide_field('purchase_receipt_no');
		hide_field('delivery_note_no');
	}
}

cur_frm.cscript.refresh = cur_frm.cscript.inspection_type;

// item code based on GRN/DN
cur_frm.fields_dict['item_code'].get_query = function(doc, cdt, cdn) {
	if (doc.purchase_receipt_no)
		return 'SELECT item_code, item_name, description FROM `tabPurchase Receipt Item` WHERE parent = "'+ doc.purchase_receipt_no +'" and docstatus != 2 AND item_code LIKE "%s" ORDER BY item_code ASC LIMIT 50';
	else if (doc.delivery_note_no) 
		return 'SELECT item_code, item_name, description FROM `tabDelivery Note Item` WHERE parent = "'+ doc.delivery_note_no +'" and docstatus != 2 AND item_code LIKE "%s" ORDER BY item_code ASC LIMIT 50';
	else
		return 'SELECT name, item_name, description FROM tabItem WHERE docstatus != 2 AND %(key)s LIKE "%s" ORDER BY name ASC LIMIT 50';
}

// Serial No based on item_code
cur_frm.fields_dict['item_serial_no'].get_query = function(doc, cdt, cdn) {
	if (doc.item_code)
		return 'SELECT name, item_code, warehouse FROM `tabSerial No` WHERE docstatus != 2 AND item_code = "' + doc.item_code +'" AND status = "In Store" AND %(key)s LIKE "%s" ORDER BY name ASC LIMIT 50';
	else
		return 'SELECT name, item_code, warehouse FROM `tabSerial No` WHERE docstatus != 2 AND status = "In Store" AND %(key)s LIKE "%s" ORDER BY name ASC LIMIT 50';
}
