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

function SMSManager() {
	var me = this;
	this.get_contact_number = function(contact, key, value) {
		$c_obj('SMS Control', 'get_contact_number', {
				contact_name:contact, 
				value:value,
				key:key
			}, function(r,rt) {
				if(r.exc) { msgprint(r.exc); return; }
				me.number = r.message;
				me.show_dialog();
			}
		);
	}
	this.show = function(contact, key, value, mobile_nos, message) {
		this.message = message;
		if (mobile_nos) {

			me.number = mobile_nos;
			me.show_dialog();
		} else if (contact){
			this.get_contact_number(contact, key, value)
		} else {
			me.show_dialog();
		}
	}
	this.show_dialog = function() {
		if(!me.dialog) 
			me.make_dialog();
		me.dialog.set_values({
			'message': me.message,
			'number': me.number
		})
		me.dialog.show();
	}
	this.make_dialog = function() {
		var d = new wn.widgets.Dialog({
			title: 'Send SMS',
			width: 400,
			fields: [
				{fieldname:'number', fieldtype:'Data', label:'Mobile Number', reqd:1},
				{fieldname:'message', fieldtype:'Text', label:'Message', reqd:1},
				{fieldname:'send', fieldtype:'Button', label:'Send'}
			]
		})
		d.make();
		d.fields_dict.send.input.onclick = function() {
			var btn = d.fields_dict.send.input;
			var v = me.dialog.get_values();
			if(v) {
				btn.set_working();
				$c_obj('SMS Control', 'send_form_sms', v, function(r,rt) {
					btn.done_working();
					if(r.exc) {msgprint(r.exc); return; }
					msgprint('Message Sent');
					me.dialog.hide();
				})
			}
		}
		this.dialog = d;
	}
}

cur_frm.cscript.send_sms = function(doc,dt,dn) {
	var doc = cur_frm.doc;
	var sms_man = new SMSManager();
	var default_msg = {
		'Lead'				: '',
		'Opportunity'			: 'Your enquiry has been logged into the system. Ref No: ' + doc.name,
		'Quotation'			: 'Quotation ' + doc.name + ' has been sent via email. Thanks!',
		'Sales Order'		: 'Sales Order ' + doc.name + ' has been created against ' 
					+ (doc.quotation_no ? ('Quote No:' + doc.quotation_no) : '')
					+ (doc.po_no ? (' for your PO: ' + doc.po_no) : ''),
		'Delivery Note'		: 'Items has been delivered against delivery note: ' + doc.name
					+ (doc.po_no ? (' for your PO: ' + doc.po_no) : ''),		
		'Sales Invoice': 'Invoice ' + doc.name + ' has been sent via email '
					+ (doc.po_no ? (' for your PO: ' + doc.po_no) : ''),
		'Purchase Request'			: 'Purchase Request ' + doc.name + ' has been raised in the system',
		'Purchase Order'	: 'Purchase Order ' + doc.name + ' has been sent via email',
		'Purchase Receipt'	: 'Items has been received against purchase receipt: ' + doc.name
	}

	if (in_list(['Quotation', 'Sales Order', 'Delivery Note', 'Sales Invoice'], doc.doctype))
		sms_man.show(doc.contact_person, 'customer', doc.customer, '', default_msg[doc.doctype]);
	else if (in_list(['Purchase Order', 'Purchase Receipt'], doc.doctype))
		sms_man.show(doc.contact_person, 'supplier', doc.supplier, '', default_msg[doc.doctype]);
	else if (doc.doctype == 'Lead')
		sms_man.show('', '', '', doc.mobile_no, default_msg[doc.doctype]);
	else if (doc.doctype == 'Opportunity')
		sms_man.show('', '', '', doc.contact_no, default_msg[doc.doctype]);
	else if (doc.doctype == 'Purchase Request')
		sms_man.show('', '', '', '', default_msg[doc.doctype]);
}
