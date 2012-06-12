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

// tree of chart of accounts / cost centers
// multiple companies
// add node
// edit node
// see ledger

pscript['onload_Accounts Browser'] = function(wrapper){
	wrapper.appframe = new wn.ui.AppFrame($(wrapper).find('.appframe-area'));
	wrapper.appframe.add_button('New Company', function() { newdoc('Company'); }, 'icon-plus');
	wrapper.appframe.add_button('Refresh', function() {  	
			wrapper.$company_select.change();
		}, 'icon-refresh');

	// company-select
	wrapper.$company_select = $('<select class="accbrowser-company-select"></select>')
		.change(function() {
			var ctype = wn.get_route()[1] || 'Account';
			erpnext.account_chart = new erpnext.AccountsChart(ctype, $(this).val(), wrapper);
		})
		.appendTo(wrapper.appframe.$w.find('.appframe-toolbar'));
		
	// default company
	if(sys_defaults.company) {
		$('<option>')
			.html(sys_defaults.company)
			.attr('value', sys_defaults.company)
			.appendTo(wrapper.$company_select);

		wrapper.$company_select
			.val(sys_defaults.company).change();
	}

	// load up companies
	wn.call({
		method:'accounts.page.accounts_browser.accounts_browser.get_companies',
		callback: function(r) {
			wrapper.$company_select.empty();
			$.each(r.message, function(i, v) {
				$('<option>').html(v).attr('value', v).appendTo(wrapper.$company_select);
			});
			wrapper.$company_select.val(sys_defaults.company || r[0]);
		}
	});
}

pscript['onshow_Accounts Browser'] = function(wrapper){
	// set route
	var ctype = wn.get_route()[1] || 'Account';
	wrapper.appframe.title('Chart of '+ctype+'s');  

	if(erpnext.account_chart && erpnext.account_chart.ctype != ctype) {
		wrapper.$company_select.change();
	} 

}

erpnext.AccountsChart = Class.extend({
	init: function(ctype, company, wrapper) {
		$(wrapper).find('.tree-area').empty();
		var me = this;
		me.ctype = ctype;
		me.company = company;
		this.tree = new wn.ui.Tree({
			parent: $(wrapper).find('.tree-area'), 
			label: company,
			args: {ctype: ctype, comp: company},
			method: 'accounts.page.accounts_browser.accounts_browser.get_children',
			click: function(link) {
				if(me.cur_toolbar) 
					$(me.cur_toolbar).toggle(false);

				if(!link.toolbar) 
					me.make_link_toolbar(link);

				if(link.toolbar) {
					me.cur_toolbar = link.toolbar;
					$(me.cur_toolbar).toggle(true);					
				}
				
				// bold
				$('.balance-bold').removeClass('balance-bold'); // deselect
				$(link).parent().find('.balance-area:first').addClass('balance-bold'); // select
			
			},
			onrender: function(treenode) {
				if (ctype == 'Account') {
					var bal = treenode.data && treenode.data.balance.split(' ') || ['',''];
					treenode.parent.append('<span class="balance-area"><span style="color: #aaa">'+ bal[0] + '</span> ' 
						+ bal[1] + '</span>');
				}
			}
		});
		this.tree.rootnode.$a.click();
	},
	make_link_toolbar: function(link) {
		var data = $(link).data('node-data');
		if(!data) return;

		link.toolbar = $('<span class="tree-node-toolbar"></span>').insertAfter(link);
		// edit
		$('<a href="#!Form/'+encodeURIComponent(this.ctype)+'/'
			+encodeURIComponent(data.value)+'">Edit</a>').appendTo(link.toolbar);

		if(data.expandable) {
			link.toolbar.append(' | <a onclick="erpnext.account_chart.new_node();">Add Child</a>');
		} else if(this.ctype=='Account') {
			link.toolbar.append(' | <a onclick="erpnext.account_chart.show_ledger();">View Ledger</a>');
		}
	},
	show_ledger: function() {
		var me = this;
		var node = me.selected_node();
		wn.set_route('Report', 'GL Entry', 'General Ledger', 
			this.ctype + '=' + node.data('label'));
	},
	new_node: function() {
		if(this.ctype=='Account') {
			this.new_account();
		} else {
			this.new_cost_center();
		}
	},
	selected_node: function() {
		return this.tree.$w.find('.tree-link.selected');
	},
	new_account: function() {
		var me = this;
		
		// the dialog
		var d = new wn.ui.Dialog({
			title:'New Account',
			fields: [
				{fieldtype:'Data', fieldname:'account_name', label:'New Account Name', reqd:true},
				{fieldtype:'Select', fieldname:'group_or_ledger', label:'Group or Ledger',
					options:'Group\nLedger'},
				{fieldtype:'Select', fieldname:'account_type', label:'Account Type',
					options: ['', 'Fixed Asset Account', 'Bank or Cash', 'Expense Account', 'Tax',
						'Income Account', 'Chargeable'].join('\n') },
				{fieldtype:'Float', fieldname:'tax_rate', label:'Tax Rate'},
				{fieldtype:'Select', fieldname:'master_type', label:'Master Type',
					options: ['NA', 'Supplier', 'Customer', 'Employee'].join('\n') },
				{fieldtype:'Button', fieldname:'create_new', label:'Create New' }
			]
		})

		var fd = d.fields_dict;
		
		// account type if ledger
		$(fd.group_or_ledger.input).change(function() {
			if($(this).val()=='Group') {
				$(fd.account_type.wrapper).toggle(false);
				$(fd.master_type.wrapper).toggle(false);
				$(fd.tax_rate.wrapper).toggle(false);
			} else {
				$(fd.account_type.wrapper).toggle(true);
				$(fd.master_type.wrapper).toggle(true);
				if(fd.account_type.get_value()=='Tax') {
					$(fd.tax_rate.wrapper).toggle(true);
				}
			}
		});
		
		// tax rate if tax
		$(fd.account_type.input).change(function() {
			if($(this).val()=='Tax') {
				$(fd.tax_rate.wrapper).toggle(true);				
			} else {
				$(fd.tax_rate.wrapper).toggle(false);				
			}
		})
		
		// create
		$(fd.create_new.input).click(function() {
			var btn = this;
			$(btn).set_working();
			var v = d.get_values();
			if(!v) return;
					
			var node = me.selected_node();
			v.parent_account = node.data('label');
			v.company = me.company;
			
		    $c_obj('GL Control', 'add_ac', v, 
				function(r,rt) { 
					$(btn).done_working();
					d.hide();
					node.trigger('reload'); 	
				});
		});
		
		// show
		d.onshow = function() {
			$(fd.group_or_ledger.input).change();
		}
		d.show();
	},
	
	new_cost_center: function(){
		var me = this;
		// the dialog
		var d = new wn.ui.Dialog({
			title:'New Cost Center',
			fields: [
				{fieldtype:'Data', fieldname:'cost_center_name', label:'New Cost Center Name', reqd:true},
				{fieldtype:'Select', fieldname:'group_or_ledger', label:'Group or Ledger',
					options:'Group\nLedger'},
				{fieldtype:'Button', fieldname:'create_new', label:'Create New' }
			]
		})		
	
		// create
		$(d.fields_dict.create_new.input).click(function() {
			var btn = this;
			$(btn).set_working();
			var v = d.get_values();
			if(!v) return;
			
			var node = me.selected_node();
			
			v.parent_cost_center = node.data('label');
			v.company_name = me.company;
			
		    $c_obj('GL Control', 'add_cc', v, 
				function(r,rt) { 
					$(btn).done_working();
					d.hide();
					node.trigger('reload'); 	
				});
		});
		d.show();
	}
});