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

wn.provide('erpnext.module_page');

erpnext.module_page.setup_page = function(module, wrapper) {
	erpnext.module_page.hide_links(wrapper);
	erpnext.module_page.make_list(module, wrapper);
	$(wrapper).find("a[title]").tooltip({
		delay: { show: 500, hide: 100 }
	});	
}

// hide list links where the user does
// not have read permissions

erpnext.module_page.hide_links = function(wrapper) {
	// lists
	$(wrapper).find('[href*="List/"]').each(function() {
		var href = $(this).attr('href');
		var dt = href.split('/')[1];
		if(wn.boot.profile.all_read.indexOf(get_label_doctype(dt))==-1) {
			var txt = $(this).text();
			$(this).parent().css('color', '#999').html(txt);
		}
	});
	
	// reports
	$(wrapper).find('[data-doctype]').each(function() {
		var dt = $(this).attr('data-doctype');
		if(wn.boot.profile.all_read.indexOf(dt)==-1) {
			var txt = $(this).text();
			$(this).parent().css('color', '#999').html(txt);
		}
	});
	
	// single (forms)
	$(wrapper).find('[href*="Form/"]').each(function() {
		var href = $(this).attr('href');
		var dt = href.split('/')[1];
		if(wn.boot.profile.all_read.indexOf(get_label_doctype(dt))==-1) {
			var txt = $(this).text();
			$(this).parent().css('color', '#999').html(txt);
		}
	});}

// make list of reports

erpnext.module_page.make_list = function(module, wrapper) {
	// make project listing
	var $w = $(wrapper).find('.reports-list');
	var $parent1 = $('<div style="width: 45%; float: left; margin-right: 4.5%"></div>').appendTo($w);
	var $parent2 = $('<div style="width: 45%; float: left;"></div>').appendTo($w);

	wrapper.list1 = new wn.ui.Listing({
		parent: $parent1,
		method: 'utilities.get_sc_list',
		render_row: function(row, data) {
			if(!data.parent_doc_type) data.parent_doc_type = data.doc_type;
			$(row).html(repl('<a href="#!Report/%(doc_type)s/%(criteria_name)s" \
				data-doctype="%(parent_doc_type)s">\
				%(criteria_name)s</a>', data))
		},
		args: { module: module },
		no_refresh: true,
		callback: function(r) {
			erpnext.module_page.hide_links($parent1)
		}
	});
	wrapper.list1.run();	

	wrapper.list2 = new wn.ui.Listing({
		parent: $parent2,
		method: 'utilities.get_report_list',
		render_row: function(row, data) {
			$(row).html(repl('<a href="#!Report2/%(ref_doctype)s/%(name)s" \
				data-doctype="%(ref_doctype)s">\
				%(name)s</a>', data))
		},
		args: { module: module },
		no_refresh: true,
		callback: function(r) {
			erpnext.module_page.hide_links($parent2)
		}
	});
	wrapper.list2.run();
}