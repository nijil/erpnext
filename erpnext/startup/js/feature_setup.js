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

/* features setup "Dictionary", "Script"
Dictionary Format
	'projects': {
		'Sales Order': {
			'fields':['project_name'],
			'sales_order_details':['projected_qty']
		},
		'Purchase Order': {
			'fields':['project_name']
		}
	}
// ====================================================================*/
pscript.feature_dict = {
	'fs_projects': {
		'BOM': {'fields':['project_name']},
		'Delivery Note': {'fields':['project_name']},
		'Purchase Invoice': {'entries':['project_name']},
		'Production Order': {'fields':['project_name']},
		'Purchase Order': {'po_details':['project_name']},
		'Purchase Receipt': {'purchase_receipt_details':['project_name']},
		'Sales Invoice': {'fields':['project_name']},
		'Sales Order': {'fields':['project_name']},
		'Stock Entry': {'fields':['project_name']},
		'Timesheet': {'timesheet_details':['project_name']}
	},
	'fs_packing_details': {
		//'Delivery Note': {'fields':['packing_details','print_packing_slip','packing_checked_by','packed_by','pack_size','shipping_mark'],'delivery_note_details':['no_of_packs','pack_gross_wt','pack_nett_wt','pack_no','pack_unit']},
		//'Sales Order': {'fields':['packing_details']}
	},
	'fs_discounts': {
		'Delivery Note': {'delivery_note_details':['adj_rate']},
		'Quotation': {'quotation_details':['adj_rate']},
		'Sales Invoice': {'entries':['adj_rate']},
		'Sales Order': {'sales_order_details':['adj_rate','ref_rate']}
	},
	'fs_purchase_discounts': {
		'Purchase Order': {'po_details':['purchase_ref_rate', 'discount_rate', 'import_ref_rate']},
		'Purchase Receipt': {'purchase_receipt_details':['purchase_ref_rate', 'discount_rate', 'import_ref_rate']},
		'Purchase Invoice': {'entries':['purchase_ref_rate', 'discount_rate', 'import_ref_rate']}
	},
	'fs_brands': {
		'Delivery Note': {'delivery_note_details':['brand']},
		'Purchase Request': {'indent_details':['brand']},
		'Item': {'fields':['brand']},
		'Purchase Order': {'po_details':['brand']},
		'Purchase Invoice': {'entries':['brand']},
		'Quotation': {'quotation_details':['brand']},
		'Sales Invoice': {'entries':['brand']},
		'Sales BOM': {'fields':['new_item_brand']},
		'Sales Order': {'sales_order_details':['brand']},
		'Serial No': {'fields':['brand']}
	},
	'fs_after_sales_installations': {
		'Delivery Note': {'fields':['installation_status','per_installed'],'delivery_note_details':['installed_qty']}
	},
	'fs_item_batch_nos': {
		'Delivery Note': {'delivery_note_details':['batch_no']},
		'Item': {'fields':['has_batch_no']},
		'Purchase Receipt': {'purchase_receipt_details':['batch_no']},
		'Quality Inspection': {'fields':['batch_no']},
		'Sales and Pruchase Return Wizard': {'return_details':['batch_no']},
		'Sales Invoice': {'entries':['batch_no']},
		'Stock Entry': {'mtn_details':['batch_no']},
		'Stock Ledger Entry': {'fields':['batch_no']}
	},
	'fs_item_serial_nos': {
		'Customer Issue': {'fields':['serial_no']},
		'Delivery Note': {'delivery_note_details':['serial_no'],'packing_details':['serial_no']},
		'Installation Note': {'installed_item_details':['serial_no']},
		'Item': {'fields':['has_serial_no']},
		'Maintenance Schedule': {'item_maintenance_detail':['serial_no'],'maintenance_schedule_detail':['serial_no']},
		'Maintenance Visit': {'maintenance_visit_details':['serial_no']},
		'Purchase Receipt': {'purchase_receipt_details':['serial_no']},
		'Quality Inspection': {'fields':['item_serial_no']},
		'Sales and Pruchase Return Wizard': {'return_details':['serial_no']},
		'Sales Invoice': {'entries':['serial_no']},
		'Stock Entry': {'mtn_details':['serial_no']},
		'Stock Ledger Entry': {'fields':['serial_no']}
	},
	'fs_item_barcode': {
		'Item': {'fields': ['barcode']},
		'Delivery Note': {'delivery_note_details': ['barcode']},
		'Sales Invoice': {'entries': ['barcode']}
	},
	'fs_item_group_in_details': {
		'Delivery Note': {'delivery_note_details':['item_group']},
		'Opportunity': {'enquiry_details':['item_group']},
		'Purchase Request': {'indent_details':['item_group']},
		'Item': {'fields':['item_group']},
		'Global Defaults': {'fields':['default_item_group']},
		'Purchase Order': {'po_details':['item_group']},
		'Purchase Receipt': {'purchase_receipt_details':['item_group']},
		'Purchase Voucher': {'entries':['item_group']},
		'Quotation': {'quotation_details':['item_group']},
		'Sales Invoice': {'entries':['item_group']},
		'Sales BOM': {'fields':['serial_no']},
		'Sales Order': {'sales_order_details':['item_group']},
		'Serial No': {'fields':['item_group']},
		'Sales Partner': {'partner_target_details':['item_group']},
		'Sales Person': {'target_details':['item_group']},
		'Territory': {'target_details':['item_group']}
	},
	'fs_page_break': {
		'Delivery Note': {'delivery_note_details':['page_break'],'packing_details':['page_break']},
		'Purchase Request': {'indent_details':['page_break']},
		'Purchase Order': {'po_details':['page_break']},
		'Purchase Receipt': {'purchase_receipt_details':['page_break']},
		'Purchase Voucher': {'entries':['page_break']},
		'Quotation': {'quotation_details':['page_break']},
		'Sales Invoice': {'entries':['page_break']},
		'Sales Order': {'sales_order_details':['page_break']}
	},
	'fs_exports': {
		'Delivery Note': {'fields':['Note','conversion_rate','currency','grand_total_export','in_words_export','rounded_total_export'],'delivery_note_details':['base_ref_rate','amount','basic_rate']},
		'POS Setting': {'fields':['conversion_rate','currency']},
		'Quotation': {'fields':['Note HTML','OT Notes','conversion_rate','currency','grand_total_export','in_words_export','rounded_total_export'],'quotation_details':['base_ref_rate','amount','basic_rate']},
		'Sales Invoice': {'fields':['conversion_rate','currency','grand_total_export','in_words_export','rounded_total_export'],'entries':['base_ref_rate','amount','basic_rate']},
		'Item': {'ref_rate_details':['ref_currency']},
		'Sales BOM': {'fields':['currency']},
		'Sales Order': {'fields':['Note1','OT Notes','conversion_rate','currency','grand_total_export','in_words_export','rounded_total_export'],'sales_order_details':['base_ref_rate','amount','basic_rate']}
	},
	'fs_imports': {
		'Purchase Invoice': {'fields':['conversion_rate','currency','grand_total_import','in_words_import','net_total_import','other_charges_added_import','other_charges_deducted_import'],'entries':['purchase_ref_rate', 'amount','rate']},
		'Purchase Order': {'fields':['Note HTML','conversion_rate','currency','grand_total_import','in_words_import','net_total_import','other_charges_added_import','other_charges_deducted_import'],'po_details':['purchase_ref_rate', 'amount','purchase_rate']},
		'Purchase Receipt': {'fields':['conversion_rate','currency','grand_total_import','in_words_import','net_total_import','other_charges_added_import','other_charges_deducted_import'],'purchase_receipt_details':['purchase_ref_rate','amount','purchase_rate']},
		'Supplier Quotation': {'fields':['conversion_rate','currency']}
	},
	'fs_item_advanced': {
		'Item': {'fields':['item_customer_details']}
	},
	'fs_sales_extras': {
		'Address': {'fields':['sales_partner']},
		'Contact': {'fields':['sales_partner']},
		'Customer': {'fields':['sales_team']},
		'Delivery Note': {'fields':['sales_team','Packing List']},
		'Item': {'fields':['item_customer_details']},
		'Sales Invoice': {'fields':['sales_team']},
		'Sales Order': {'fields':['sales_team','Packing List']}
	},
	'fs_more_info': {
		'Delivery Note': {'fields':['More Info']},
		'Opportunity': {'fields':['More Info']},
		'Purchase Request': {'fields':['More Info']},
		'Lead': {'fields':['More Info']},
		'Purchase Invoice': {'fields':['More Info']},
		'Purchase Order': {'fields':['More Info']},
		'Purchase Receipt': {'fields':['More Info']},
		'Quotation': {'fields':['More Info']},
		'Sales Invoice': {'fields':['More Info']},
		'Sales Order': {'fields':['More Info']},
	},
	'fs_quality': {
		'Item': {'fields':['Item Inspection Criteria','inspection_required']},
		'Purchase Receipt': {'purchase_receipt_details':['qa_no']}
	},
	'fs_manufacturing': {
		'Item': {'fields':['Manufacturing']}
	},
	'fs_pos': {
		'Sales Invoice': {'fields':['is_pos']}
	},
	'fs_recurring_invoice': {
		'Sales Invoice': {'fields': ['Recurring Invoice']}
	}
}

$(document).bind('form_refresh', function() {
	for(sys_feat in sys_defaults)
	{
		if(sys_defaults[sys_feat]=='0' && (sys_feat in pscript.feature_dict)) //"Features to hide" exists
		{
			if(cur_frm.doc.doctype in  pscript.feature_dict[sys_feat])
			{
				for(fort in pscript.feature_dict[sys_feat][cur_frm.doc.doctype])
				{
					if(fort=='fields')
						hide_field(pscript.feature_dict[sys_feat][cur_frm.doc.doctype][fort]);
					else if(cur_frm.fields_dict[fort])
					{
						for(grid_field in pscript.feature_dict[sys_feat][cur_frm.doc.doctype][fort])
							cur_frm.fields_dict[fort].grid.set_column_disp(pscript.feature_dict[sys_feat][cur_frm.doc.doctype][fort][grid_field], false);
					}
					else
						msgprint('Grid "'+fort+'" does not exists');
				}
			}
		}
	}
})
