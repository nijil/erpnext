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

wn.require('erpnext/setup/doctype/contact_control/contact_control.js');

cur_frm.cscript.onload = function(doc,dt,dn){
	// history doctypes and scripts
	cur_frm.history_dict = {
		'Sales Order' : 'cur_frm.cscript.make_so_list(this.body, this.doc)',
		'Delivery Note' : 'cur_frm.cscript.make_dn_list(this.body, this.doc)',
		'Sales Invoice' : 'cur_frm.cscript.make_si_list(this.body, this.doc)'
	}
	
	// make contact, history list body
	//cur_frm.cscript.make_cl_body();
	cur_frm.cscript.make_hl_body();
}

cur_frm.cscript.refresh = function(doc,dt,dn){  
  
	if(doc.__islocal){
		hide_field(['address_html', 'contact_html']);
		//cur_frm.cscript.set_cl_msg(doc);
		//cur_frm.cscript.set_hl_msg(doc);		
	}
	else{
		unhide_field(['address_html', 'contact_html']);
		// make lists
		cur_frm.cscript.make_address(doc,dt,dn);
		cur_frm.cscript.make_contact(doc,dt,dn);
		cur_frm.cscript.make_history(doc,dt,dn);
	}
}


cur_frm.cscript.make_address = function() {
	if(!cur_frm.address_list) {
		cur_frm.address_list = new wn.ui.Listing({
			parent: cur_frm.fields_dict['address_html'].wrapper,
			page_length: 2,
			new_doctype: "Address",			
			get_query: function() {
				return "select name, address_type, address_line1, address_line2, city, state, country, pincode, fax, email_id, phone, is_primary_address, is_shipping_address from tabAddress where sales_partner='"+cur_frm.docname+"' and docstatus != 2 order by is_primary_address desc"
			},
			as_dict: 1,
			no_results_message: 'No addresses created',
			render_row: function(wrapper, data) {
				$(wrapper).css('padding','5px 0px');
				var link = $ln(wrapper,cstr(data.name), function() { loaddoc("Address", this.dn); }, {fontWeight:'bold'});
				link.dn = data.name
				
				$a(wrapper,'span','',{marginLeft:'5px', color: '#666'},(data.is_primary_address ? '[Primary]' : '') + (data.is_shipping_address ? '[Shipping]' : ''));				
				$a(wrapper,'div','',{marginTop:'5px', color:'#555'}, data.address_line1 + '<br />' + (data.address_line2 ? data.address_line2 + '<br />' : '') + data.city + '<br />' + (data.state ? data.state + ', ' : '') + data.country + '<br />' + (data.pincode ? 'Pincode: ' + data.pincode + '<br />' : '') + (data.phone ? 'Tel: ' + data.phone + '<br />' : '') + (data.fax ? 'Fax: ' + data.fax + '<br />' : '') + (data.email_id ? 'Email: ' + data.email_id + '<br />' : ''));
			}
		});
	}
	cur_frm.address_list.run();
}

cur_frm.cscript.make_contact = function() {
	if(!cur_frm.contact_list) {
		cur_frm.contact_list = new wn.ui.Listing({
			parent: cur_frm.fields_dict['contact_html'].wrapper,
			page_length: 2,
			new_doctype: "Contact",
			get_query: function() {
				return "select name, first_name, last_name, email_id, phone, mobile_no, department, designation, is_primary_contact from tabContact where sales_partner='"+cur_frm.docname+"' and docstatus != 2 order by is_primary_contact desc"
			},
			as_dict: 1,
			no_results_message: 'No contacts created',
			render_row: function(wrapper, data) {
				$(wrapper).css('padding', '5px 0px');
				var link = $ln(wrapper, cstr(data.name), function() { loaddoc("Contact", this.dn); }, {fontWeight:'bold'});
				link.dn = data.name

				$a(wrapper,'span','',{marginLeft:'5px', color: '#666'},(data.is_primary_contact ? '[Primary]' : ''));
				$a(wrapper,'div', '',{marginTop:'5px', color:'#555'}, data.first_name + (data.last_name ? ' ' + data.last_name + '<br />' : '<br>') + (data.phone ? 'Tel: ' + data.phone + '<br />' : '') + (data.mobile_no ? 'Mobile: ' + data.mobile_no + '<br />' : '') + (data.email_id ? 'Email: ' + data.email_id + '<br />' : '') + (data.department ? 'Department: ' + data.department + '<br />' : '') + (data.designation ? 'Designation: ' + data.designation + '<br />' : ''));
			}
		});
	}
	cur_frm.contact_list.run();

}

// ******************** ITEM Group ******************************** 
cur_frm.fields_dict['partner_target_details'].grid.get_field("item_group").get_query = function(doc, dt, dn) {
  return 'SELECT `tabItem Group`.`name`,`tabItem Group`.`parent_item_group` FROM `tabItem Group` WHERE `tabItem Group`.is_group="No" AND `tabItem Group`.docstatus != 2 AND `tabItem Group`.%(key)s LIKE "%s" LIMIT 50'
}

// make sales order list
cur_frm.cscript.make_so_list = function(parent, doc){
	var lst = new Listing();
	lst.colwidths = ['5%','20%','20%','15%','20%','20%'];
	lst.colnames = ['Sr.','Id','Status','SO Date','Total Commission','Grand Total'];
	lst.coltypes = ['Data','Link','Data','Data','Currency','Currency'];
	lst.coloptions = ['','Sales Order','','','','',''];

	cur_frm.cscript.set_list_opts(lst);
	
	var q = repl("select name,status,transaction_date, total_commission,grand_total from `tabSales Order` where sales_partner='%(sp)s'", {'sp':doc.name});
	var q_max = repl("select count(name) from `tabSales Order` where sales_partner='%(cust)s'", {'sp':doc.name});
	
	cur_frm.cscript.run_list(lst,parent,q,q_max,doc,'Sales Order','Sales Order');
}

// make delivery note list
cur_frm.cscript.make_dn_list = function(parent,doc){
	var lst = new Listing();
	lst.colwidths = ['5%','20%','20%','15%','20%','20%'];
	lst.colnames = ['Sr.','Id','Status','Date','Total Commission','Grand Total'];
	lst.coltypes = ['Data','Link','Data','Data','Currency','Currency'];
	lst.coloptions = ['','Delivery Note','','','','',''];

	cur_frm.cscript.set_list_opts(lst);

	var q = repl("select name,status,transaction_date, total_commission,grand_total from `tabDelivery Note` where sales_partner='%(sp)s'", {'sp':doc.name});
	var q_max = repl("select count(name) from `tabDelivery Note` where sales_partner='%(cust)s'", {'sp':doc.name});
	
	cur_frm.cscript.run_list(lst,parent,q,q_max,doc,'Delivery Note','Delivery Note');	
}

// make sales invoice list
cur_frm.cscript.make_si_list = function(parent,doc){
	var lst = new Listing();
	lst.colwidths = ['5%','25%','20%','25%','25%'];
	lst.colnames = ['Sr.','Id','Invoice Date','Total Commission','Grand Total'];
	lst.coltypes = ['Data','Link','Data','Data','Currency','Currency'];
	lst.coloptions = ['','Sales Invoice','','','',''];

	cur_frm.cscript.set_list_opts(lst);

	var q = repl("select name,posting_date, total_commission,grand_total from `tabSales Invoice` where sales_partner='%(sp)s'", {'sp':doc.name});
	var q_max = repl("select count(name) from `tabSales Invoice` where sales_partner='%(cust)s'", {'sp':doc.name});
	
	cur_frm.cscript.run_list(lst,parent,q,q_max,doc,'Sales Invoice','Sales Invoice');	
}
