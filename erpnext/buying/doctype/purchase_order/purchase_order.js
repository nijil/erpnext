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

cur_frm.cscript.tname = "Purchase Order Item";
cur_frm.cscript.fname = "po_details";
cur_frm.cscript.other_fname = "purchase_tax_details";

wn.require('erpnext/accounts/doctype/purchase_taxes_and_charges_master/purchase_taxes_and_charges_master.js');
wn.require('erpnext/buying/doctype/purchase_common/purchase_common.js');
wn.require('erpnext/utilities/doctype/sms_control/sms_control.js');
wn.require('erpnext/setup/doctype/notification_control/notification_control.js');

//========================== On Load =================================================
cur_frm.cscript.onload = function(doc, cdt, cdn) {

	if(!doc.fiscal_year && doc.__islocal){ //set_default_values(doc);
		doc.fiscal_year = sys_defaults.fiscal_year;
	}
	if(!doc.conversion_rate) doc.conversion_rate = 1;
	if(!doc.currency) doc.currency = sys_defaults.currency;
	if(!doc.status) set_multiple(cdt,cdn,{status:'Draft'});
	if(!doc.transaction_date) set_multiple(cdt,cdn,{transaction_date:get_today()});
	if(!doc.is_subcontracted) set_multiple(cdt, cdn, {is_subcontracted:'No'});
}

cur_frm.cscript.onload_post_render = function(doc, dt, dn) {
	var callback = function(doc, dt, dn) {
		if(doc.__islocal){ 
			cur_frm.cscript.get_default_schedule_date(doc);
		}	
	}
	cur_frm.cscript.dynamic_label(doc, dt, dn, callback);
}

// ================================== Refresh ==========================================
cur_frm.cscript.refresh = function(doc, cdt, cdn) { 
	// Show buttons
	// ---------------------------------
	cur_frm.clear_custom_buttons();
	erpnext.hide_naming_series();

	if (!cur_frm.cscript.is_onload) cur_frm.cscript.dynamic_label(doc, cdt, cdn);

	if(doc.docstatus == 1 && doc.status != 'Stopped'){
		cur_frm.add_custom_button('Send SMS', cur_frm.cscript['Send SMS']);
		if(doc.per_received < 100) cur_frm.add_custom_button('Make Purchase Receipt', cur_frm.cscript['Make Purchase Receipt']);	
		if(doc.per_billed < 100) cur_frm.add_custom_button('Make Invoice', cur_frm.cscript['Make Purchase Invoice']);
		if(doc.per_billed < 100 || doc.per_received < 100) cur_frm.add_custom_button('Stop', cur_frm.cscript['Stop Purchase Order']);
	}
		
	if(doc.docstatus == 1 && doc.status == 'Stopped')
		cur_frm.add_custom_button('Unstop Purchase Order', cur_frm.cscript['Unstop Purchase Order']);
	
	if(doc.supplier) $(cur_frm.fields_dict.contact_section.row.wrapper).toggle(true);
	else $(cur_frm.fields_dict.contact_section.row.wrapper).toggle(false);
}



//Supplier
cur_frm.cscript.supplier = function(doc,dt,dn) {
	if(doc.supplier) get_server_fields('get_default_supplier_address', JSON.stringify({supplier: doc.supplier}),'', doc, dt, dn, 1);
	if(doc.supplier) $(cur_frm.fields_dict.contact_section.row.wrapper).toggle(true);
}

cur_frm.cscript.supplier_address = cur_frm.cscript.contact_person = function(doc,dt,dn) {		
	if(doc.supplier) get_server_fields('get_supplier_address', JSON.stringify({supplier: doc.supplier, address: doc.supplier_address, contact: doc.contact_person}),'', doc, dt, dn, 1);
}

cur_frm.fields_dict['supplier_address'].get_query = function(doc, cdt, cdn) {
	return 'SELECT name,address_line1,city FROM tabAddress WHERE supplier = "'+ doc.supplier +'" AND docstatus != 2 AND name LIKE "%s" ORDER BY name ASC LIMIT 50';
}

cur_frm.fields_dict['contact_person'].get_query = function(doc, cdt, cdn) {
	return 'SELECT name,CONCAT(first_name," ",ifnull(last_name,"")) As FullName,department,designation FROM tabContact WHERE supplier = "'+ doc.supplier +'" AND docstatus != 2 AND name LIKE "%s" ORDER BY name ASC LIMIT 50';
}


cur_frm.fields_dict.supplier_address.on_new = function(dn) {
	locals['Address'][dn].supplier = locals[cur_frm.doctype][cur_frm.docname].supplier;
	locals['Address'][dn].supplier_name = locals[cur_frm.doctype][cur_frm.docname].supplier_name;
}

cur_frm.fields_dict.contact_person.on_new = function(dn) {
	locals['Contact'][dn].supplier = locals[cur_frm.doctype][cur_frm.docname].supplier;
	locals['Contact'][dn].supplier_name = locals[cur_frm.doctype][cur_frm.docname].supplier_name;
}





//================ create new contact ============================================================================
cur_frm.cscript.new_contact = function(){
	tn = createLocal('Contact');
	locals['Contact'][tn].is_supplier = 1;
	if(doc.supplier) locals['Contact'][tn].supplier = doc.supplier;
	loaddoc('Contact', tn);
}

//======================= transaction date =============================
cur_frm.cscript.transaction_date = function(doc,cdt,cdn){
	if(doc.__islocal){ 
		cur_frm.cscript.get_default_schedule_date(doc);
	}
}


// ---------------------- Get project name --------------------------
cur_frm.fields_dict['po_details'].grid.get_field('project_name').get_query = function(doc, cdt, cdn) {
	return 'SELECT `tabProject`.name FROM `tabProject` WHERE `tabProject`.status = "Open" AND `tabProject`.name LIKE "%s" ORDER BY `tabProject`.name ASC LIMIT 50';
}

//==================== Purchase Request No Get Query =======================================================
//===== Only those Purchase Requests status != 'Completed' and docstatus = 1 i.e. submitted=================
cur_frm.fields_dict['indent_no'].get_query = function(doc) {
	return 'SELECT DISTINCT `tabPurchase Request`.`name` FROM `tabPurchase Request` WHERE `tabPurchase Request`.company = "' + doc.company + '" and `tabPurchase Request`.`docstatus` = 1 and `tabPurchase Request`.`status` != "Stopped" and ifnull(`tabPurchase Request`.`per_ordered`,0) < 100 and `tabPurchase Request`.%(key)s LIKE "%s" ORDER BY `tabPurchase Request`.`name` DESC LIMIT 50';
}


//========================= Get Last Purhase Rate =====================================
cur_frm.cscript.get_last_purchase_rate = function(doc, cdt, cdn){
	$c_obj(make_doclist(doc.doctype, doc.name), 'get_last_purchase_rate', '', 
			function(r, rt) { 
				refresh_field(cur_frm.cscript.fname);
				var doc = locals[cdt][cdn];
				cur_frm.cscript.calc_amount( doc, 2);
			}
	);

}

//========================= Make Purchase Receipt =======================================================
cur_frm.cscript['Make Purchase Receipt'] = function() {
	n = createLocal('Purchase Receipt');
	$c('dt_map', args={
		'docs':compress_doclist([locals['Purchase Receipt'][n]]),
		'from_doctype': cur_frm.doc.doctype,
		'to_doctype':'Purchase Receipt',
		'from_docname':cur_frm.doc.name,
		'from_to_list':"[['Purchase Order','Purchase Receipt'],['Purchase Order Item','Purchase Receipt Item'],['Purchase Taxes and Charges','Purchase Taxes and Charges']]"
		}, function(r,rt) {
			 loaddoc('Purchase Receipt', n);
		}
	);
}

//========================== Make Purchase Invoice =====================================================
cur_frm.cscript['Make Purchase Invoice'] = function() {
	n = createLocal('Purchase Invoice');
	$c('dt_map', args={
		'docs':compress_doclist([locals['Purchase Invoice'][n]]),
		'from_doctype':cur_frm.doc.doctype,
		'to_doctype':'Purchase Invoice',
		'from_docname': cur_frm.doc.name,
		'from_to_list':"[['Purchase Order','Purchase Invoice'],['Purchase Order Item','Purchase Invoice Item'],['Purchase Taxes and Charges','Purchase Taxes and Charges']]"
		}, function(r,rt) {
			 loaddoc('Purchase Invoice', n);
		}
	);
}


// Stop PURCHASE ORDER
// ==================================================================================================
cur_frm.cscript['Stop Purchase Order'] = function() {
	var doc = cur_frm.doc;
	var check = confirm("Do you really want to STOP " + doc.name);

	if (check) {
		$c('runserverobj', args={'method':'update_status', 'arg': 'Stopped', 'docs': compress_doclist(make_doclist(doc.doctype, doc.name))}, function(r,rt) {
			cur_frm.refresh();
		});	
	}
}

// Unstop PURCHASE ORDER
// ==================================================================================================
cur_frm.cscript['Unstop Purchase Order'] = function() {
	var doc = cur_frm.doc;
	var check = confirm("Do you really want to UNSTOP " + doc.name);

	if (check) {
		$c('runserverobj', args={'method':'update_status', 'arg': 'Submitted', 'docs': compress_doclist(make_doclist(doc.doctype, doc.name))}, function(r,rt) {
			cur_frm.refresh();
		});	
	}
}

// ***************** Get Print Heading	*****************
cur_frm.fields_dict['select_print_heading'].get_query = function(doc, cdt, cdn) {
	return 'SELECT `tabPrint Heading`.name FROM `tabPrint Heading` WHERE `tabPrint Heading`.docstatus !=2 AND `tabPrint Heading`.name LIKE "%s" ORDER BY `tabPrint Heading`.name ASC LIMIT 50';
}
//****************** For print sales order no and date*************************
cur_frm.pformat.indent_no = function(doc, cdt, cdn){
	//function to make row of table
	
	var make_row = function(title,val1, val2, bold){
		var bstart = '<b>'; var bend = '</b>';

		return '<tr><td style="width:39%;">'+(bold?bstart:'')+title+(bold?bend:'')+'</td>'
		 +'<td style="width:61%;text-align:left;">'+val1+(val2?' ('+dateutil.str_to_user(val2)+')':'')+'</td>'
		 +'</tr>'
	}

	out ='';
	
	var cl = getchildren('Purchase Order Item',doc.name,'po_details');

	// outer table	
	var out='<div><table class="noborder" style="width:100%"><tr><td style="width: 50%"></td><td>';
	
	// main table
	out +='<table class="noborder" style="width:100%">';

	// add rows
	if(cl.length){
		prevdoc_list = new Array();
		for(var i=0;i<cl.length;i++){
			if(cl[i].prevdoc_doctype == 'Purchase Request' && cl[i].prevdoc_docname && prevdoc_list.indexOf(cl[i].prevdoc_docname) == -1) {
				prevdoc_list.push(cl[i].prevdoc_docname);
				if(prevdoc_list.length ==1)
					out += make_row(cl[i].prevdoc_doctype, cl[i].prevdoc_docname, cl[i].prevdoc_date,0);
				else
					out += make_row('', cl[i].prevdoc_docname, cl[i].prevdoc_date,0);
			}
		}
	}

	out +='</table></td></tr></table></div>';

	return out;
}

cur_frm.cscript.on_submit = function(doc, cdt, cdn) {
	var args = {
		type: 'Purchase Order',
		doctype: 'Purchase Order'
	}
	cur_frm.cscript.notify(doc, args);
}
