# ERPNext - web based ERP (http://erpnext.com)
# Copyright (C) 2012 Web Notes Technologies Pvt Ltd
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

def execute():
	import webnotes
	from webnotes.modules import reload_doc
	
	reload_doc('stock', 'doctype', 'stock_reconciliation')
	webnotes.conn.sql("delete from `tabDocField` where (label in ('Validate Data', 'Attachment HTML', 'Attachment') or fieldname in ('next_step', 'company', 'fiscal_year', 'amendment_date')) and parent = 'Stock Reconciliation'")
